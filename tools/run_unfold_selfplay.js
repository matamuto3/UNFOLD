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

function padNumber(value, width = 3) {
  return String(value).padStart(width, "0");
}

function slugText(value) {
  return String(value || "selfplay")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "selfplay";
}

function getPerGameDirArg(args) {
  const dirArg = getArg(args, ["per-game-dir", "game-dir", "kifu-dir"], "");
  return dirArg ? path.resolve(dirArg) : "";
}

function getProgressPrefix(args) {
  const outPath = getArg(args, ["out"], "");
  return slugText(getArg(args, ["prefix"], outPath ? path.basename(outPath, path.extname(outPath)) : `selfplay-${getArg(args, ["mode"], "original")}`));
}

function countSavedGames(dir, prefix) {
  if (!dir || !fs.existsSync(dir)) {
    return 0;
  }
  return fs.readdirSync(dir).filter((name) => {
    return name.startsWith(`${prefix}-game-`) && name.endsWith(".json");
  }).length;
}

function prepareResumeArgs(args) {
  const target = Number(getArg(args, ["resume-total", "target-count", "targetCount"], 0)) || 0;
  if (!args.resume || !target) {
    return { existingGames: 0, remainingGames: Number(getArg(args, ["count", "selfplay"], 5)) || 0 };
  }
  const dir = getPerGameDirArg(args);
  const prefix = getProgressPrefix(args);
  const existingGames = countSavedGames(dir, prefix);
  const remainingGames = Math.max(0, target - existingGames);
  args.count = String(remainingGames);
  args["start-index"] = String(existingGames);
  return { existingGames, remainingGames, target };
}

function summarizeGames(games) {
  const summary = {
    games: games.length,
    wins: { P1: 0, P2: 0, draw: 0 },
    reasons: {},
    actionUsage: {},
    averageTurns: 0,
    averagePlies: 0,
    defenderSuccessRate: 0,
    searchStats: {
      moves: 0,
      aborted: 0,
      abortRate: 0,
      averageNodes: 0,
      averageElapsedMs: 0,
      averageCandidateMs: 0,
      averageSearchMs: 0,
      averageCompletedDepth: 0,
      maxNodes: 0,
      maxElapsedMs: 0,
      depthCounts: {},
      slowestMoves: [],
      abortedExamples: [],
      byType: {},
      byPlayer: {},
      byPieceType: {}
    }
  };
  let turns = 0;
  let plies = 0;
  let totalSearchNodes = 0;
  let totalSearchElapsedMs = 0;
  let totalSearchCandidateMs = 0;
  let totalSearchSearchMs = 0;
  let totalSearchCompletedDepth = 0;
  function recordSearchStatsGroup(map, key, stats) {
    const groupKey = key || "none";
    if (!map[groupKey]) {
      map[groupKey] = {
        key: groupKey,
        count: 0,
        aborted: 0,
        totalNodes: 0,
        totalElapsedMs: 0,
        totalCandidateMs: 0,
        totalSearchMs: 0,
        totalCompletedDepth: 0,
        maxNodes: 0,
        maxElapsedMs: 0
      };
    }
    map[groupKey].count += 1;
    map[groupKey].aborted += stats.aborted ? 1 : 0;
    map[groupKey].totalNodes += Number(stats.nodes || 0);
    map[groupKey].totalElapsedMs += Number(stats.elapsedMs || 0);
    map[groupKey].totalCandidateMs += Number(stats.candidateMs || 0);
    map[groupKey].totalSearchMs += Number(stats.searchMs || 0);
    map[groupKey].totalCompletedDepth += Number(stats.completedDepth || 0);
    map[groupKey].maxNodes = Math.max(map[groupKey].maxNodes, Number(stats.nodes || 0));
    map[groupKey].maxElapsedMs = Math.max(map[groupKey].maxElapsedMs, Number(stats.elapsedMs || 0));
  }
  function formatSearchStatsGroups(map) {
    return Object.keys(map).map((key) => {
      const entry = map[key];
      return {
        key: entry.key,
        count: entry.count,
        aborted: entry.aborted,
        abortRate: entry.count ? Math.round((entry.aborted / entry.count) * 1000) / 10 : 0,
        averageNodes: entry.count ? Math.round((entry.totalNodes / entry.count) * 10) / 10 : 0,
        averageElapsedMs: entry.count ? Math.round((entry.totalElapsedMs / entry.count) * 10) / 10 : 0,
        averageCandidateMs: entry.count ? Math.round((entry.totalCandidateMs / entry.count) * 10) / 10 : 0,
        averageSearchMs: entry.count ? Math.round((entry.totalSearchMs / entry.count) * 10) / 10 : 0,
        averageCompletedDepth: entry.count ? Math.round((entry.totalCompletedDepth / entry.count) * 10) / 10 : 0,
        maxNodes: entry.maxNodes,
        maxElapsedMs: entry.maxElapsedMs
      };
    }).sort((a, b) => {
      if (b.averageElapsedMs !== a.averageElapsedMs) {
        return b.averageElapsedMs - a.averageElapsedMs;
      }
      return b.count - a.count;
    }).slice(0, 16);
  }
  for (const game of games) {
    const winner = game.winner || "draw";
    summary.wins[winner] = (summary.wins[winner] || 0) + 1;
    summary.reasons[game.reason || "unknown"] = (summary.reasons[game.reason || "unknown"] || 0) + 1;
    turns += Number(game.turns || 0);
    plies += Number(game.plies || (game.moves ? game.moves.length : 0));
    for (const move of game.moves || []) {
      const stats = move.searchStats || null;
      summary.actionUsage[move.type || "unknown"] = (summary.actionUsage[move.type || "unknown"] || 0) + 1;
      if (stats) {
        const searchExample = {
          gameId: game.id,
          player: move.player,
          turnNumber: move.turnNumber,
          type: move.type,
          label: move.label || "",
          depth: Number(stats.depth || 0),
          completedDepth: Number(stats.completedDepth || 0),
          elapsedMs: Number(stats.elapsedMs || 0),
          candidateMs: Number(stats.candidateMs || 0),
          searchMs: Number(stats.searchMs || 0),
          nodes: Number(stats.nodes || 0),
          aborted: !!stats.aborted,
          emergency: !!stats.emergency
        };
        summary.searchStats.moves += 1;
        summary.searchStats.aborted += stats.aborted ? 1 : 0;
        totalSearchNodes += Number(stats.nodes || 0);
        totalSearchElapsedMs += Number(stats.elapsedMs || 0);
        totalSearchCandidateMs += Number(stats.candidateMs || 0);
        totalSearchSearchMs += Number(stats.searchMs || 0);
        totalSearchCompletedDepth += Number(stats.completedDepth || 0);
        summary.searchStats.maxNodes = Math.max(summary.searchStats.maxNodes, Number(stats.nodes || 0));
        summary.searchStats.maxElapsedMs = Math.max(summary.searchStats.maxElapsedMs, Number(stats.elapsedMs || 0));
        summary.searchStats.depthCounts[stats.depth || 0] = (summary.searchStats.depthCounts[stats.depth || 0] || 0) + 1;
        summary.searchStats.slowestMoves.push(searchExample);
        recordSearchStatsGroup(summary.searchStats.byType, move.type || "unknown", stats);
        recordSearchStatsGroup(summary.searchStats.byPlayer, move.player || "unknown", stats);
        recordSearchStatsGroup(summary.searchStats.byPieceType, move.pieceType || "none", stats);
        if (stats.aborted) {
          summary.searchStats.abortedExamples.push(searchExample);
        }
      }
    }
  }
  summary.averageTurns = games.length ? Math.round((turns / games.length) * 10) / 10 : 0;
  summary.averagePlies = games.length ? Math.round((plies / games.length) * 10) / 10 : 0;
  summary.defenderSuccessRate = games.length ? Math.round(((summary.wins.P2 + summary.wins.draw) / games.length) * 1000) / 10 : 0;
  if (summary.searchStats.moves) {
    summary.searchStats.abortRate = Math.round((summary.searchStats.aborted / summary.searchStats.moves) * 1000) / 10;
    summary.searchStats.averageNodes = Math.round((totalSearchNodes / summary.searchStats.moves) * 10) / 10;
    summary.searchStats.averageElapsedMs = Math.round((totalSearchElapsedMs / summary.searchStats.moves) * 10) / 10;
    summary.searchStats.averageCandidateMs = Math.round((totalSearchCandidateMs / summary.searchStats.moves) * 10) / 10;
    summary.searchStats.averageSearchMs = Math.round((totalSearchSearchMs / summary.searchStats.moves) * 10) / 10;
    summary.searchStats.averageCompletedDepth = Math.round((totalSearchCompletedDepth / summary.searchStats.moves) * 10) / 10;
    summary.searchStats.slowestMoves = summary.searchStats.slowestMoves.sort((a, b) => b.elapsedMs - a.elapsedMs).slice(0, 10);
    summary.searchStats.abortedExamples = summary.searchStats.abortedExamples.sort((a, b) => b.elapsedMs - a.elapsedMs).slice(0, 10);
    summary.searchStats.byType = formatSearchStatsGroups(summary.searchStats.byType);
    summary.searchStats.byPlayer = formatSearchStatsGroups(summary.searchStats.byPlayer);
    summary.searchStats.byPieceType = formatSearchStatsGroups(summary.searchStats.byPieceType);
  }
  return summary;
}

function buildBlockReviewMarkdown(blockNumber, games, summary) {
  const lines = [];
  const examples = games.slice(0, 3).map((game) => {
    const opening = (game.moves || []).slice(0, 6).map((move, index) => `${index + 1}. ${move.label || `${move.player || "?"}:${move.type || "?"}`}`);
    return {
      id: game.id,
      winner: game.winner || "draw",
      reason: game.reason || "unknown",
      turns: game.turns || 0,
      opening
    };
  });
  lines.push(`# UNFOLD selfplay block ${blockNumber}`);
  lines.push("");
  lines.push(`- Games: ${summary.games}`);
  lines.push(`- P1 wins: ${summary.wins.P1 || 0}`);
  lines.push(`- P2 wins: ${summary.wins.P2 || 0}`);
  lines.push(`- Draw/hold: ${summary.wins.draw || 0}`);
  lines.push(`- Defender success: ${summary.defenderSuccessRate}%`);
  lines.push(`- Average turns: ${summary.averageTurns}`);
  lines.push(`- Average plies: ${summary.averagePlies}`);
  if (summary.searchStats && summary.searchStats.moves) {
    lines.push(`- Search moves: ${summary.searchStats.moves}`);
    lines.push(`- Search abort rate: ${summary.searchStats.abortRate}%`);
    lines.push(`- Average search nodes: ${summary.searchStats.averageNodes}`);
    lines.push(`- Average candidate/search ms: ${summary.searchStats.averageCandidateMs} / ${summary.searchStats.averageSearchMs}`);
    lines.push(`- Average completed depth: ${summary.searchStats.averageCompletedDepth}`);
  }
  lines.push("");
  lines.push("## Reasons");
  Object.keys(summary.reasons).sort((a, b) => summary.reasons[b] - summary.reasons[a]).forEach((reason) => {
    lines.push(`- ${reason}: ${summary.reasons[reason]}`);
  });
  lines.push("");
  lines.push("## Action Usage");
  Object.keys(summary.actionUsage).sort((a, b) => summary.actionUsage[b] - summary.actionUsage[a]).forEach((type) => {
    lines.push(`- ${type}: ${summary.actionUsage[type]}`);
  });
  if (summary.searchStats && summary.searchStats.slowestMoves && summary.searchStats.slowestMoves.length) {
    lines.push("");
    lines.push("## Slowest Search Moves");
    summary.searchStats.slowestMoves.slice(0, 5).forEach((move) => {
      lines.push(`- ${move.elapsedMs}ms (cand ${move.candidateMs} / search ${move.searchMs}) / nodes ${move.nodes} / d${move.completedDepth}/${move.depth}: ${move.label || `${move.player}:${move.type}`}`);
    });
  }
  if (summary.searchStats && summary.searchStats.byType && summary.searchStats.byType.length) {
    lines.push("");
    lines.push("## Search Cost By Action");
    summary.searchStats.byType.slice(0, 8).forEach((entry) => {
      lines.push(`- ${entry.key}: avg ${entry.averageElapsedMs}ms (cand ${entry.averageCandidateMs} / search ${entry.averageSearchMs}) / nodes ${entry.averageNodes} / abort ${entry.abortRate}% / n=${entry.count}`);
    });
  }
  if (summary.searchStats && summary.searchStats.byPieceType && summary.searchStats.byPieceType.length) {
    lines.push("");
    lines.push("## Search Cost By Piece");
    summary.searchStats.byPieceType.slice(0, 8).forEach((entry) => {
      lines.push(`- ${entry.key}: avg ${entry.averageElapsedMs}ms (cand ${entry.averageCandidateMs} / search ${entry.averageSearchMs}) / nodes ${entry.averageNodes} / abort ${entry.abortRate}% / n=${entry.count}`);
    });
  }
  if (summary.searchStats && summary.searchStats.abortedExamples && summary.searchStats.abortedExamples.length) {
    lines.push("");
    lines.push("## Budget-Aborted Moves");
    summary.searchStats.abortedExamples.slice(0, 5).forEach((move) => {
      lines.push(`- ${move.elapsedMs}ms (cand ${move.candidateMs} / search ${move.searchMs}) / nodes ${move.nodes} / d${move.completedDepth}/${move.depth}: ${move.label || `${move.player}:${move.type}`}`);
    });
  }
  lines.push("");
  lines.push("## Review Notes");
  if ((summary.wins.P1 || 0) >= Math.ceil(summary.games * 0.7)) {
    lines.push("- P1 attack is still too decisive in this block. Next tuning should prioritize P2 immediate-loss filters and base-center shield retention.");
  } else if (summary.defenderSuccessRate >= 60) {
    lines.push("- P2 defense is holding in this block. Next tuning can add counterattack transition scoring instead of only extending defense.");
  } else {
    lines.push("- Results are mixed. Keep candidate pruning stable and inspect the decisive early losses before changing broad weights.");
  }
  lines.push("- Keep the 3-ply depth setting; only candidate ordering and tactical filters should be adjusted between blocks.");
  lines.push("");
  lines.push("## Sample Openings");
  examples.forEach((example) => {
    lines.push(`- Game ${example.id}: ${example.winner} / ${example.reason} / ${example.turns} turns`);
    example.opening.forEach((move) => lines.push(`  - ${move}`));
  });
  lines.push("");
  return `${lines.join("\n")}\n`;
}

function createProgressRecorder(args, startedAt) {
  const dir = getPerGameDirArg(args);
  if (!dir) {
    return null;
  }
  const prefix = getProgressPrefix(args);
  const reviewEvery = Math.max(1, Number(getArg(args, ["review-every", "reviewEvery"], 10)) || 10);
  const startIndex = Math.max(0, Number(getArg(args, ["start-index", "startIndex"], 0)) || 0);
  const games = [];
  ensureDir(dir);
  return {
    onGame(payload) {
      const game = payload && payload.game ? payload.game : payload;
      const index = Number(payload && payload.index) || games.length;
      const gameNumber = startIndex + index + 1;
      games.push(game);
      writeJson(path.join(dir, `${prefix}-game-${padNumber(gameNumber, 4)}.json`), {
        generatedAt: new Date().toISOString(),
        elapsedMs: Date.now() - startedAt,
        gameNumber,
        total: payload && payload.total,
        options: payload && payload.options,
        game
      });
      if ((index + 1) % reviewEvery === 0) {
        const blockNumber = Math.ceil(gameNumber / reviewEvery);
        const blockGames = games.slice(Math.max(0, games.length - reviewEvery));
        const summary = summarizeGames(blockGames);
        writeJson(path.join(dir, `${prefix}-block-${padNumber(blockNumber, 3)}-summary.json`), {
          generatedAt: new Date().toISOString(),
          blockNumber,
          range: [gameNumber - blockGames.length + 1, gameNumber],
          summary,
          games: blockGames
        });
        writeText(path.join(dir, `${prefix}-block-${padNumber(blockNumber, 3)}-review.md`), buildBlockReviewMarkdown(blockNumber, blockGames, summary));
      }
      writeJson(path.join(dir, `${prefix}-progress.json`), {
        generatedAt: new Date().toISOString(),
        elapsedMs: Date.now() - startedAt,
        completedGames: startIndex + games.length,
        latestGame: gameNumber,
        summary: summarizeGames(games)
      });
    },
    finalize(output) {
      writeJson(path.join(dir, `${prefix}-final-summary.json`), {
        generatedAt: new Date().toISOString(),
        elapsedMs: Date.now() - startedAt,
        output,
        summary: summarizeGames(games)
      });
    }
  };
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
  const resumePlan = prepareResumeArgs(args);
  if (args.resume && resumePlan.remainingGames <= 0) {
    process.stdout.write(JSON.stringify({
      generatedAt: new Date().toISOString(),
      elapsedMs: Date.now() - startedAt,
      resume: resumePlan,
      summary: {
        games: 0,
        note: "resume target already reached"
      }
    }, null, 2) + "\n");
    return;
  }
  const query = buildQuery(args);
  const { context, getElementById } = createBrowserShim(query);
  const progressRecorder = createProgressRecorder(args, startedAt);
  const appPath = path.join(__dirname, "..", "laravel-app", "public", "app.js");
  const code = fs.readFileSync(appPath, "utf8");
  if (progressRecorder) {
    context.window.__UNFOLD_SELFPLAY_ON_GAME__ = progressRecorder.onGame;
  }
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
    resume: resumePlan,
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
  if (progressRecorder) {
    progressRecorder.finalize(output);
  }
  process.stdout.write(JSON.stringify(output, null, 2) + "\n");
}

try {
  main();
} catch (error) {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
}
