const fs = require("fs");
const path = require("path");
const vm = require("vm");

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      continue;
    }
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

function getArg(args, names, fallback) {
  for (const name of names) {
    if (Object.prototype.hasOwnProperty.call(args, name)) {
      return args[name];
    }
  }
  return fallback;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file, data) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function writeText(file, text) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, text, "utf8");
}

function makeElement(id = "") {
  return {
    id,
    children: [],
    dataset: {},
    style: {},
    hidden: false,
    disabled: false,
    value: "",
    textContent: "",
    innerHTML: "",
    className: "",
    checked: false,
    selectedIndex: 0,
    options: [],
    parentNode: null,
    classList: {
      add() {},
      remove() {},
      toggle() {},
      contains() { return false; }
    },
    appendChild(child) {
      this.children.push(child);
      if (child) child.parentNode = this;
      return child;
    },
    prepend(child) {
      this.children.unshift(child);
      if (child) child.parentNode = this;
      return child;
    },
    insertBefore(child, reference) {
      const index = this.children.indexOf(reference);
      if (index >= 0) {
        this.children.splice(index, 0, child);
      } else {
        this.children.push(child);
      }
      if (child) child.parentNode = this;
      return child;
    },
    removeChild(child) {
      this.children = this.children.filter((item) => item !== child);
      return child;
    },
    replaceChildren(...items) {
      this.children = items;
      items.forEach((item) => {
        if (item) item.parentNode = this;
      });
    },
    insertAdjacentHTML() {},
    setAttribute(name, value) { this[name] = value; },
    getAttribute(name) { return this[name] || null; },
    removeAttribute(name) { delete this[name]; },
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() { return true; },
    querySelector() { return makeElement(); },
    querySelectorAll() { return []; },
    closest() { return makeElement(); },
    focus() {},
    blur() {},
    scrollIntoView() {},
    getBoundingClientRect() {
      return { left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0 };
    },
    cloneNode() { return makeElement(id); }
  };
}

function createBrowserShim(query) {
  const elements = new Map();
  const storage = new Map();
  const body = makeElement("body");
  const documentElement = makeElement("html");
  const getElementById = (id) => {
    if (!elements.has(id)) {
      elements.set(id, makeElement(id));
    }
    return elements.get(id);
  };
  const document = {
    body,
    documentElement,
    getElementById,
    createElement(tagName) {
      const element = makeElement();
      element.tagName = String(tagName).toUpperCase();
      return element;
    },
    createTextNode(text) {
      const element = makeElement();
      element.textContent = String(text);
      return element;
    },
    createDocumentFragment() { return makeElement("fragment"); },
    querySelector() { return makeElement(); },
    querySelectorAll() { return []; },
    addEventListener() {},
    removeEventListener() {}
  };
  const location = new URL(`file:///solo.html?${query}`);
  const context = {
    console,
    URL,
    URLSearchParams,
    Math,
    Date,
    JSON,
    Number,
    String,
    Boolean,
    Array,
    Object,
    RegExp,
    Map,
    Set,
    parseInt,
    parseFloat,
    isNaN,
    encodeURIComponent,
    decodeURIComponent,
    setTimeout: () => 0,
    clearTimeout() {},
    setInterval: () => 0,
    clearInterval() {},
    fetch: async () => {
      throw new Error("fetch disabled in CLI tactical tests");
    },
    document,
    navigator: { userAgent: "node-unfold-tactical" },
    location,
    localStorage: {
      getItem(key) { return storage.has(key) ? storage.get(key) : null; },
      setItem(key, value) { storage.set(key, String(value)); },
      removeItem(key) { storage.delete(key); }
    }
  };
  context.window = context;
  context.globalThis = context;
  context.window.location = location;
  context.window.localStorage = context.localStorage;
  context.window.addEventListener = function addEventListener() {};
  context.window.removeEventListener = function removeEventListener() {};
  context.window.requestAnimationFrame = () => 0;
  context.window.cancelAnimationFrame = function cancelAnimationFrame() {};
  context.window.CustomEvent = function CustomEvent(type, init) {
    return { type, detail: init && init.detail };
  };
  context.window.confirm = () => true;
  context.window.alert = function alert() {};
  return { context, getElementById };
}

function buildQuery(args) {
  const params = new URLSearchParams();
  params.set("debug", "1");
  params.set("tactical", "1");
  params.set("mode", String(getArg(args, ["mode"], "original")));
  params.set("suite", String(getArg(args, ["suite"], "core")));
  params.set("lookahead", String(getArg(args, ["lookahead", "lookahead-depth"], 3)));
  params.set("strategy", String(getArg(args, ["strategy", "strategy-profile"], "attack-defense")));
  params.set("traceLimit", String(getArg(args, ["trace-limit", "traceLimit"], 10)));
  const scenario = getArg(args, ["scenario"], "");
  if (scenario) params.set("scenario", String(scenario));
  if (args.fast) params.set("fast", "1");
  if (args.bulk) params.set("bulk", "1");
  return params.toString();
}

function buildMarkdown(result) {
  const lines = [];
  lines.push("# UNFOLD Tactical Scenario Report");
  lines.push("");
  lines.push(`- Mode: ${result.mode}`);
  lines.push(`- Suite: ${result.suite || "core"}`);
  lines.push(`- Lookahead: ${result.lookaheadDepth}`);
  lines.push(`- Strategies: P1=${result.strategies.P1}, P2=${result.strategies.P2}`);
  lines.push(`- Pass: ${result.passCount}/${result.scenarioCount}`);
  lines.push("");
  for (const item of result.results || []) {
    lines.push(`## ${item.id}`);
    lines.push("");
    lines.push(`- Title: ${item.title}`);
    lines.push(`- Player: ${item.player}`);
    if (item.castleName) lines.push(`- Castle: ${item.castleName}`);
    if (item.attackPattern) lines.push(`- Attack: ${item.attackPattern}`);
    lines.push(`- Goal: ${item.goal}`);
    lines.push(`- Action count: ${item.actionCount}`);
    lines.push(`- Selected: ${item.selectedAction ? item.selectedAction.label || item.selectedAction.type : "none"}`);
    lines.push(`- Pass: ${item.result && item.result.pass ? "yes" : "no"}`);
    lines.push("");
    lines.push("### Checks");
    for (const check of item.result.checks || []) {
      lines.push(`- ${check.ok ? "OK" : "NG"} ${check.id}: ${JSON.stringify(check.detail)}`);
    }
    lines.push("");
    lines.push("### Metrics");
    lines.push(`- Before: ${JSON.stringify(item.result.before)}`);
    lines.push(`- After: ${JSON.stringify(item.result.after)}`);
    lines.push("");
    lines.push("### Top Candidates");
    for (const candidate of (item.trace && item.trace.candidates || []).slice(0, 5)) {
      lines.push(`- ${candidate.type}: ${candidate.label || ""} score=${candidate.score} refined=${candidate.refinedScore}`);
    }
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

function main() {
  const startedAt = Date.now();
  const args = parseArgs(process.argv.slice(2));
  const query = buildQuery(args);
  const { context, getElementById } = createBrowserShim(query);
  const appPath = path.join(__dirname, "..", "laravel-app", "public", "app.js");
  const code = fs.readFileSync(appPath, "utf8");
  vm.createContext(context);
  vm.runInContext(code, context, { filename: appPath, timeout: Number(getArg(args, ["timeout"], 600000)) });
  const result = context.window.__UNFOLD_TACTICAL_RESULT__;
  if (!result) {
    const message = getElementById("messageLabel").textContent;
    const testOutput = getElementById("testOutput").textContent;
    throw new Error(`Tactical scenarios did not produce a result.\n${message}\n${testOutput}`);
  }
  const output = {
    generatedAt: new Date().toISOString(),
    elapsedMs: Date.now() - startedAt,
    query,
    summary: {
      mode: result.mode,
      suite: result.suite || "core",
      lookaheadDepth: result.lookaheadDepth,
      strategies: result.strategies,
      scenarioCount: result.scenarioCount,
      passCount: result.passCount
    }
  };
  const outPath = getArg(args, ["out"], "");
  const mdPath = getArg(args, ["md", "markdown"], "");
  if (outPath) {
    writeJson(path.resolve(outPath), result);
    output.fullResultPath = path.resolve(outPath);
  }
  if (mdPath) {
    writeText(path.resolve(mdPath), buildMarkdown(result));
    output.markdownPath = path.resolve(mdPath);
  }
  if (args.full) {
    output.results = result.results;
  }
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
}

try {
  main();
} catch (error) {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
}
