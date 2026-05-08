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
      throw new Error("fetch disabled in CLI selfplay");
    },
    document,
    navigator: { userAgent: "node-unfold-selfplay" },
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
  params.set("selfplay", String(getArg(args, ["count", "selfplay"], 5)));
  params.set("maxPlies", String(getArg(args, ["max-plies", "maxPlies"], 30)));
  params.set("standbyRule", String(getArg(args, ["standby-rule", "standbyRule"], "basePieces")));
  params.set("mode", String(getArg(args, ["mode"], "original")));
  params.set("lookahead", String(getArg(args, ["lookahead", "lookahead-depth"], 1)));
  params.set("strategy", String(getArg(args, ["strategy", "strategy-profile"], "attack-defense")));
  params.set("seed", String(getArg(args, ["seed"], 20260503)));
  if (args.fast) params.set("fast", "1");
  if (args.bulk) params.set("bulk", "1");
  if (args.trace) params.set("trace", "1");
  return params.toString();
}

function addDerivedSummary(result) {
  const setupPieceCount = result.games.reduce((total, game) => {
    return total + game.moves.filter((move) => move.type === "setupPiece").length;
  }, 0);
  const setupFragmentCount = result.games.reduce((total, game) => {
    return total + game.moves.filter((move) => move.type === "setupFragment").length;
  }, 0);
  return {
    ...result.summary,
    setupPieceCount,
    setupFragmentCount
  };
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
  const result = context.window.__UNFOLD_SELFPLAY_RESULT__;
  if (!result) {
    const message = getElementById("messageLabel").textContent;
    const testOutput = getElementById("testOutput").textContent;
    throw new Error(`Selfplay did not produce a result.\n${message}\n${testOutput}`);
  }
  const output = {
    generatedAt: new Date().toISOString(),
    elapsedMs: Date.now() - startedAt,
    query,
    summary: addDerivedSummary(result)
  };
  const outPath = getArg(args, ["out"], "");
  if (outPath) {
    fs.writeFileSync(path.resolve(outPath), JSON.stringify(result, null, 2), "utf8");
    output.fullResultPath = path.resolve(outPath);
  }
  if (args.full) {
    output.games = result.games;
  }
  process.stdout.write(JSON.stringify(output, null, 2) + "\n");
}

try {
  main();
} catch (error) {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
}
