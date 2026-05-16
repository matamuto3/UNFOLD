const fs = require("fs");
const path = require("path");
const { TextDecoder } = require("util");

const repoRoot = path.resolve(__dirname, "..");
const includeGenerated = process.argv.includes("--include-generated");

const sourceRoots = [
  "laravel-app/public",
  "laravel-app/app",
  "laravel-app/routes",
  "laravel-app/resources",
  "laravel-app/config",
  "laravel-app/database",
  "laravel-app/tests",
  "docs",
  "tools"
];

const generatedRoots = [
  "docs/experiments",
  "docs/selfplay",
  "laravel-app/storage",
  "laravel-app/vendor",
  "node_modules"
].map(normalizeSlash);

const textExtensions = new Set([
  ".blade.php",
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".php",
  ".ps1",
  ".txt",
  ".xml",
  ".yaml",
  ".yml"
]);

const mojibakeCodePoints = [
  0x7e3a, 0x7e67, 0x873f, 0x8b17, 0x8b41, 0x8763,
  0x8373, 0x90b1, 0x9b27, 0x9af1, 0x86f9, 0x87c6,
  0x7e5d, 0x8ae2, 0x879f, 0x86df, 0x96b1, 0x8b5a,
  0x87bb, 0x9b06, 0x9036, 0x9666, 0x7ab6, 0xfffd
];
const mojibakeChars = mojibakeCodePoints.map((code) => String.fromCodePoint(code));
const utf8Decoder = new TextDecoder("utf-8", { fatal: true });

const issues = [];

function normalizeSlash(value) {
  return value.replace(/\\/g, "/");
}

function relativeToRepo(filePath) {
  return normalizeSlash(path.relative(repoRoot, filePath));
}

function shouldSkip(filePath) {
  if (!includeGenerated && isGeneratedPath(filePath)) {
    return true;
  }
  return false;
}

function isGeneratedPath(filePath) {
  const relative = relativeToRepo(filePath);
  return generatedRoots.some((root) => relative === root || relative.startsWith(root + "/"));
}

function getTextExtension(filePath) {
  const base = path.basename(filePath).toLowerCase();
  if (base.endsWith(".blade.php")) {
    return ".blade.php";
  }
  return path.extname(base);
}

function isTextTarget(filePath) {
  return textExtensions.has(getTextExtension(filePath));
}

function walk(dirPath, files) {
  if (!fs.existsSync(dirPath)) {
    return files;
  }
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (!shouldSkip(entryPath)) {
        walk(entryPath, files);
      }
      continue;
    }
    if (entry.isFile() && isTextTarget(entryPath) && !shouldSkip(entryPath)) {
      files.push(entryPath);
    }
  }
  return files;
}

function hasLikelyUtf16Nulls(buffer) {
  const sampleLength = Math.min(buffer.length, 200);
  if (sampleLength < 4) {
    return false;
  }
  let nullCount = 0;
  for (let i = 0; i < sampleLength; i += 1) {
    if (buffer[i] === 0) {
      nullCount += 1;
    }
  }
  return nullCount / sampleLength > 0.2;
}

function decodeUtf8(filePath, buffer) {
  if (hasLikelyUtf16Nulls(buffer)) {
    addIssue(filePath, 0, "File looks like UTF-16 or binary text. Save it as UTF-8 without BOM.");
    return null;
  }
  try {
    return utf8Decoder.decode(buffer);
  } catch (error) {
    addIssue(filePath, 0, "File is not valid UTF-8: " + error.message);
    return null;
  }
}

function addIssue(filePath, lineNumber, message) {
  issues.push({
    file: relativeToRepo(filePath),
    line: lineNumber,
    message
  });
}

function checkMojibake(filePath, text) {
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (mojibakeChars.some((char) => line.includes(char))) {
      addIssue(filePath, index + 1, "Suspicious mojibake text: " + JSON.stringify(line.slice(0, 180)));
    }
  });
}

function checkHtml(filePath, text) {
  const base = path.basename(filePath).toLowerCase();
  if (!base.startsWith("google") && !/<meta\s+charset=["']UTF-8["']/i.test(text)) {
    addIssue(filePath, 0, "HTML file is missing <meta charset=\"UTF-8\">.");
  }
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (/="[^"]*$/.test(line) || /='[^']*$/.test(line)) {
      addIssue(filePath, index + 1, "Attribute quote appears to be left open: " + JSON.stringify(line.slice(0, 180)));
    }
  });
}

function checkJson(filePath, text) {
  try {
    JSON.parse(text);
  } catch (error) {
    addIssue(filePath, 0, "Invalid JSON: " + error.message);
  }
}

function checkFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  const text = decodeUtf8(filePath, buffer);
  if (text === null) {
    return;
  }
  checkMojibake(filePath, text);
  if (isGeneratedPath(filePath)) {
    return;
  }
  const ext = getTextExtension(filePath);
  if (ext === ".html") {
    checkHtml(filePath, text);
  }
  if (ext === ".json") {
    checkJson(filePath, text);
  }
}

const files = [];
sourceRoots.forEach((root) => walk(path.join(repoRoot, root), files));
files.sort().forEach(checkFile);

if (issues.length > 0) {
  console.error("Text integrity check failed.");
  issues.slice(0, 120).forEach((issue) => {
    const line = issue.line ? ":" + issue.line : "";
    console.error(issue.file + line + " - " + issue.message);
  });
  if (issues.length > 120) {
    console.error("...and " + (issues.length - 120) + " more issue(s).");
  }
  process.exit(1);
}

console.log("Text integrity check passed (" + files.length + " file(s)).");
