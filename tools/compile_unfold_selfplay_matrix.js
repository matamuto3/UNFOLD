const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "docs", "selfplay");
const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const arg = process.argv[i];
  if (arg.startsWith("--")) {
    args.set(arg.slice(2), process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[++i] : "1");
  }
}

const inputPrefix = args.get("prefix") || "selfplay-v31-style5000b";
const outputPrefix = args.get("out") || inputPrefix;
const chunkGroupSize = Number(args.get("chunkGroupSize") || 5);

const STYLES = [
  { key: "attack-defense", label: "攻め vs 守り" },
  { key: "defense-attack", label: "守り vs 攻め" },
  { key: "balanced-balanced", label: "バランス vs バランス" },
  { key: "attack-attack", label: "攻め vs 攻め" },
  { key: "defense-defense", label: "守り vs 守り" }
];
const MODES = [
  { key: "original", label: "オリジナル" },
  { key: "shogi", label: "将棋" }
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
}

function writeText(file, text) {
  fs.writeFileSync(file, `\uFEFF${text}`, "utf8");
}

function writeJson(file, data) {
  writeText(file, `${JSON.stringify(data, null, 2)}\n`);
}

function pct(num, den) {
  return den ? Math.round((num / den) * 1000) / 10 : 0;
}

function round1(value) {
  return Math.round((Number(value) || 0) * 10) / 10;
}

function moveLabel(move, index) {
  return `${index + 1}. ${move && move.label ? move.label : `${move && move.player ? move.player : "?"} ${move && move.type ? move.type : "?"}`}`;
}

function countRecoveries(game) {
  return (game.moves || []).filter((move) => move.type === "recoverPiece" || move.type === "recoverFragment").length;
}

function countCaptures(game) {
  return (game.moves || []).filter((move) => move.capture).length;
}

function slimGame(game, style, mode, source) {
  const moves = game.moves || [];
  const p1Deck = game.final && Number.isFinite(game.final.p1Deck) ? game.final.p1Deck : null;
  const p2Deck = game.final && Number.isFinite(game.final.p2Deck) ? game.final.p2Deck : null;
  return {
    kifuId: `${style.key}-${mode.key}-${source}`,
    sourceId: game.id,
    source,
    seed: game.seed,
    styleKey: style.key,
    styleLabel: style.label,
    mode: mode.key,
    modeLabel: mode.label,
    strategies: game.strategies || null,
    winner: game.winner || "draw",
    reason: game.reason || "未決着",
    turns: game.turns || 0,
    plies: game.plies || moves.length,
    recoveries: countRecoveries(game),
    captures: countCaptures(game),
    p1Deck,
    p2Deck,
    deckExhausted: p1Deck === 0 || p2Deck === 0,
    bothDecksExhausted: p1Deck === 0 && p2Deck === 0,
    opening: moves.slice(0, 6).map(moveLabel),
    lastMoves: moves.slice(Math.max(0, moves.length - 6)).map((move, i) => moveLabel(move, moves.length - Math.min(6, moves.length) + i)),
    moves: moves.map((move, index) => ({
      n: index + 1,
      player: move.player,
      turnNumber: move.turnNumber,
      phase: move.phase,
      type: move.type,
      label: move.label || "",
      score: move.score ?? null,
      refinedScore: move.refinedScore ?? null,
      defenseSnapshot: move.defenseSnapshot || null,
      capture: move.capture || null,
      fragment: move.fragment || null,
      fragmentName: move.fragmentName || null,
      pieceType: move.pieceType || null,
      pieceName: move.pieceName || null,
      from: move.from || null,
      to: move.to || null,
      pieceCell: move.pieceCell || null,
      anchor: move.anchor || null
    }))
  };
}

function summarizeGames(games) {
  const summary = {
    games: games.length,
    p1Wins: games.filter((game) => game.winner === "P1").length,
    p2Wins: games.filter((game) => game.winner === "P2").length,
    draws: games.filter((game) => game.winner === "draw").length,
    turns: games.reduce((sum, game) => sum + game.turns, 0),
    plies: games.reduce((sum, game) => sum + game.plies, 0),
    recoveries: games.reduce((sum, game) => sum + game.recoveries, 0),
    captures: games.reduce((sum, game) => sum + game.captures, 0),
    deckExhausted: games.filter((game) => game.deckExhausted).length,
    bothDecksExhausted: games.filter((game) => game.bothDecksExhausted).length,
    kingCapture: games.filter((game) => game.reason === "王の捕獲").length,
    baseOccupation: games.filter((game) => game.reason === "本陣占領").length,
    undecided: games.filter((game) => game.winner === "draw" || game.reason === "未決着").length
  };
  summary.avgTurns = round1(summary.turns / Math.max(1, summary.games));
  summary.avgPlies = round1(summary.plies / Math.max(1, summary.games));
  summary.p1Rate = pct(summary.p1Wins, summary.games);
  summary.p2Rate = pct(summary.p2Wins, summary.games);
  summary.drawRate = pct(summary.draws, summary.games);
  summary.defenderSuccessRate = pct(summary.p2Wins + summary.draws, summary.games);
  return summary;
}

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function takeExamples(games, filter, sorter, count, note) {
  return games
    .filter(filter)
    .sort(sorter)
    .slice(0, count)
    .map((game) => ({
      kifuId: game.kifuId,
      styleKey: game.styleKey,
      styleLabel: game.styleLabel,
      mode: game.mode,
      modeLabel: game.modeLabel,
      winner: game.winner,
      reason: game.reason,
      turns: game.turns,
      plies: game.plies,
      recoveries: game.recoveries,
      captures: game.captures,
      p1Deck: game.p1Deck,
      p2Deck: game.p2Deck,
      deckExhausted: game.deckExhausted,
      note,
      opening: game.opening,
      lastMoves: game.lastMoves
    }));
}

const allGames = [];
const styleSummaries = [];
const blockSummaries = [];

for (const style of STYLES) {
  for (const mode of MODES) {
    const aggregatePath = path.join(outDir, `${inputPrefix}-${style.key}-${mode.key}-aggregate.json`);
    if (fs.existsSync(aggregatePath)) {
      const aggregate = readJson(aggregatePath);
      const games = (aggregate.games || []).map((game, index) => slimGame(game, style, mode, String(index + 1).padStart(4, "0")));
      allGames.push(...games);
      styleSummaries.push({
        styleKey: style.key,
        styleLabel: style.label,
        mode: mode.key,
        modeLabel: mode.label,
        ...summarizeGames(games)
      });
    }

    const chunkFiles = fs.readdirSync(outDir)
      .filter((name) => name.startsWith(`${inputPrefix}-${style.key}-${mode.key}-chunk`) && name.endsWith(".json"))
      .sort();
    for (let i = 0; i < chunkFiles.length; i += chunkGroupSize) {
      const group = chunkFiles.slice(i, i + chunkGroupSize);
      if (!group.length) {
        continue;
      }
      const blockGames = [];
      group.forEach((name) => {
        const chunk = readJson(path.join(outDir, name));
        (chunk.games || []).forEach((game, index) => {
          blockGames.push(slimGame(game, style, mode, `${name.match(/chunk(\d+)/)?.[1] || "00"}-${String(index + 1).padStart(3, "0")}`));
        });
      });
      blockSummaries.push({
        styleKey: style.key,
        styleLabel: style.label,
        mode: mode.key,
        modeLabel: mode.label,
        block: Math.floor(i / chunkGroupSize) + 1,
        chunkFiles: group,
        ...summarizeGames(blockGames)
      });
    }
  }
}

const totals = summarizeGames(allGames);
const generatedAt = new Date().toISOString();

writeJson(path.join(outDir, `${outputPrefix}-combined-summary.json`), {
  generatedAt,
  inputPrefix,
  totals,
  styleSummaries,
  blockSummaries
});

writeJson(path.join(outDir, `${outputPrefix}-kifu-light.json`), {
  generatedAt,
  inputPrefix,
  totals,
  games: allGames
});

const examples = {
  goodP2CounterWins: takeExamples(allGames, (game) => game.winner === "P2" && (game.styleKey === "attack-defense" || game.styleKey === "defense-attack"), (a, b) => (b.turns - a.turns) || (b.captures - a.captures), 40, "後手が受けてから反撃して勝った例。"),
  goodLongDecisiveGames: takeExamples(allGames, (game) => game.winner === "P1" || game.winner === "P2", (a, b) => (b.turns - a.turns) || (b.recoveries - a.recoveries), 40, "長期戦から決着した例。"),
  goodRecoveryGames: takeExamples(allGames, (game) => game.recoveries > 0, (a, b) => (b.recoveries - a.recoveries) || (b.turns - a.turns), 40, "回収が絡んだ例。"),
  deckExhaustedGames: takeExamples(allGames, (game) => game.deckExhausted, (a, b) => (b.turns - a.turns) || (b.recoveries - a.recoveries), 40, "山札切れ付近まで進んだ例。"),
  badFastP1Wins: takeExamples(allGames, (game) => game.winner === "P1" && game.turns <= 20, (a, b) => (a.turns - b.turns) || (a.plies - b.plies), 40, "先手が早期勝利した守備崩壊例。"),
  badTooFastGames: takeExamples(allGames, (game) => game.turns <= 12 && game.winner !== "draw", (a, b) => (a.turns - b.turns) || (a.plies - b.plies), 40, "極端な短手数決着例。"),
  badUndecidedGames: takeExamples(allGames, (game) => game.winner === "draw", (a, b) => (b.turns - a.turns) || (b.recoveries - a.recoveries), 40, "守れたが寄せ切れなかった例。")
};
writeJson(path.join(outDir, `${outputPrefix}-good-bad-examples.json`), {
  generatedAt,
  inputPrefix,
  totals,
  examples
});

const headers = ["kifuId", "styleKey", "styleLabel", "mode", "modeLabel", "winner", "reason", "turns", "plies", "recoveries", "captures", "p1Deck", "p2Deck", "deckExhausted", "opening", "lastMoves"];
const csvRows = [headers.join(",")];
for (const game of allGames) {
  csvRows.push(headers.map((header) => csvEscape(header === "opening" || header === "lastMoves" ? game[header].join(" / ") : game[header])).join(","));
}
writeText(path.join(outDir, `${outputPrefix}-kifu-index.csv`), `${csvRows.join("\n")}\n`);

const notes = [];
if (totals.games) {
  notes.push(`# UNFOLD NPC 5000戦検証メモ`);
  notes.push("");
  notes.push(`生成日: ${generatedAt}`);
  notes.push("");
  notes.push(`対象prefix: ${inputPrefix}`);
  notes.push("");
  notes.push(`## 全体結果`);
  notes.push("");
  notes.push(`| 項目 | 値 |`);
  notes.push(`|---|---:|`);
  notes.push(`| 対局数 | ${totals.games} |`);
  notes.push(`| 先手勝ち | ${totals.p1Wins} (${totals.p1Rate}%) |`);
  notes.push(`| 後手勝ち | ${totals.p2Wins} (${totals.p2Rate}%) |`);
  notes.push(`| 未決着 | ${totals.draws} (${totals.drawRate}%) |`);
  notes.push(`| 平均手数 | ${totals.avgTurns} |`);
  notes.push(`| 王の捕獲 | ${totals.kingCapture} |`);
  notes.push(`| 本陣占領 | ${totals.baseOccupation} |`);
  notes.push(`| 山札切れ | ${totals.deckExhausted} |`);
  notes.push(`| 回収 | ${totals.recoveries} |`);
  notes.push("");
  notes.push(`## スタイル別`);
  notes.push("");
  notes.push(`| スタイル | 駒 | 対局 | 先手 | 後手 | 未決着 | 後手守備成功 | 平均手数 | 山札切れ | 回収 |`);
  notes.push(`|---|---|---:|---:|---:|---:|---:|---:|---:|---:|`);
  styleSummaries.forEach((row) => {
    notes.push(`| ${row.styleLabel} | ${row.modeLabel} | ${row.games} | ${row.p1Wins} | ${row.p2Wins} | ${row.draws} | ${row.defenderSuccessRate}% | ${row.avgTurns} | ${row.deckExhausted} | ${row.recoveries} |`);
  });
  notes.push("");
  notes.push(`## 100戦ブロック`);
  notes.push("");
  notes.push(`| スタイル | 駒 | block | 対局 | 先手 | 後手 | 未決着 | 後手守備成功 | 平均手数 | 山札切れ | 回収 | コメント |`);
  notes.push(`|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|`);
  blockSummaries.forEach((row) => {
    const comment = row.drawRate > 20
      ? "停滞気味。終盤遷移を強める候補。"
      : row.p1Rate > 62
        ? "先手寄り。初期安全検査を追加候補。"
        : row.avgTurns < 18
          ? "短期決着寄り。序盤寄せ抑制候補。"
          : row.recoveries === 0 && row.avgTurns > 45
            ? "長いが回収なし。回収目的評価を確認。"
            : "大きな偏りなし。";
    notes.push(`| ${row.styleLabel} | ${row.modeLabel} | ${row.block} | ${row.games} | ${row.p1Wins} | ${row.p2Wins} | ${row.draws} | ${row.defenderSuccessRate}% | ${row.avgTurns} | ${row.deckExhausted} | ${row.recoveries} | ${comment} |`);
  });
  notes.push("");
  notes.push(`## 次の読み筋`);
  notes.push("");
  notes.push(`- 後手守備成功が45%未満のブロックは、初期スタンバイの即死検査と反撃保証を追加検討する。`);
  notes.push(`- 未決着率が20%を超えるブロックは、60手以降の寄せ遷移と回収ループ減点を追加検討する。`);
  notes.push(`- 平均18手未満のブロックは、バランス/守りNPCの序盤寄せ抑制を追加検討する。`);
  notes.push(`- 山札切れが出た棋譜は、長期戦定石と回収の使いどころ候補として別途見る。`);
} else {
  notes.push(`# UNFOLD NPC 検証メモ`);
  notes.push("");
  notes.push(`まだ集計対象の棋譜がありません。prefix=${inputPrefix}`);
}
writeText(path.join(outDir, `${outputPrefix}-analysis.md`), `${notes.join("\n")}\n`);

console.log(JSON.stringify({ inputPrefix, outputPrefix, totals, styles: styleSummaries.length, blocks: blockSummaries.length }, null, 2));
