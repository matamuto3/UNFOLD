const DEFAULT_CONFIG = {
  boardSize: 9,
  handLimit: 3,
  enableKingCaptureWin: true,
  enableBaseOccupationWin: true,
  enableFragmentRecovery: false,
  baseSize: 3,
};

const PIECE_DEFS = {
  king: { label: "\u738b", move: { type: "step", deltas: allDirections() } },
  soldier: { label: "\u5175", move: { type: "step", deltas: [[-1, 0], [1, 0], [0, -1], [0, 1]] } },
  lancer: { label: "\u69cd", move: { type: "ray", deltas: [[-1, 0], [1, 0], [0, -1], [0, 1]] } },
};

const FRAGMENT_LIBRARY = {
  netCross: { label: "\u5341\u5b57\u306e\u5c55\u958b\u56f3", cells: [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1], [3, 1]] },
  netChair: { label: "\u6905\u5b50\u306e\u5c55\u958b\u56f3", cells: [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [3, 2]] },
  netSnake: { label: "\u86c7\u8179\u306e\u5c55\u958b\u56f3", cells: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2], [2, 3]] },
  netArch: { label: "\u9580\u578b\u306e\u5c55\u958b\u56f3", cells: [[0, 0], [1, 0], [1, 1], [1, 2], [2, 0], [2, 2]] },
  netTalon: { label: "\u9264\u722a\u306e\u5c55\u958b\u56f3", cells: [[0, 1], [1, 0], [1, 1], [1, 2], [2, 2], [3, 2]] },
  netStair: { label: "\u968e\u6bb5\u306e\u5c55\u958b\u56f3", cells: [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 1]] },
};

const STARTER_DECK = [
  { id: "c1", fragmentType: "netCross", pieceType: "soldier" },
  { id: "c2", fragmentType: "netChair", pieceType: "soldier" },
  { id: "c3", fragmentType: "netSnake", pieceType: "lancer" },
  { id: "c4", fragmentType: "netArch", pieceType: "soldier" },
  { id: "c5", fragmentType: "netTalon", pieceType: "lancer" },
  { id: "c6", fragmentType: "netStair", pieceType: "soldier" },
];

function createGame(config = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const state = {
    config: cfg,
    currentPlayer: "P1",
    winner: null,
    winReason: null,
    turnNumber: 1,
    board: createBoard(cfg),
    players: {
      P1: createPlayerState("P1", cfg),
      P2: createPlayerState("P2", cfg),
    },
    placements: [],
    actionLog: [],
  };

  seedBases(state);
  seedKings(state);
  fillHands(state);
  return state;
}

function getLegalActions(state, player) {
  if (state.winner || player !== state.currentPlayer) {
    return [];
  }

  return [
    ...getLegalReserveDrops(state, player),
    ...getLegalFragmentPlacements(state, player),
    ...getLegalMoves(state, player),
  ];
}

function applyAction(state, action) {
  const next = clone(state);
  if (next.winner) {
    throw new Error("\u3059\u3067\u306b\u5bfe\u5c40\u306f\u7d42\u4e86\u3057\u3066\u3044\u307e\u3059\u3002");
  }
  if (action.player !== next.currentPlayer) {
    throw new Error("\u305d\u306e\u30d7\u30ec\u30a4\u30e4\u30fc\u306e\u624b\u756a\u3067\u306f\u3042\u308a\u307e\u305b\u3093\u3002");
  }

  switch (action.type) {
    case "drop":
      applyDrop(next, action);
      break;
    case "placeFragment":
      applyFragmentPlacement(next, action);
      break;
    case "move":
      applyMove(next, action);
      break;
    default:
      throw new Error(`\u672a\u5bfe\u5fdc\u306e\u884c\u52d5\u3067\u3059: ${action.type}`);
  }

  const winner = checkWin(next);
  if (winner) {
    next.winner = winner.player;
    next.winReason = winner.reason;
  } else {
    next.currentPlayer = otherPlayer(next.currentPlayer);
    next.turnNumber += 1;
  }

  next.actionLog.unshift(describeAction(action));
  next.actionLog = next.actionLog.slice(0, 12);
  return next;
}

function checkWin(state) {
  if (state.config.enableKingCaptureWin) {
    const p1King = findPieceByKind(state, "P1", "king");
    const p2King = findPieceByKind(state, "P2", "king");
    if (!p1King) {
      return { player: "P2", reason: "\u738b\u306e\u6355\u7372" };
    }
    if (!p2King) {
      return { player: "P1", reason: "\u738b\u306e\u6355\u7372" };
    }
  }

  if (state.config.enableBaseOccupationWin) {
    for (const player of ["P1", "P2"]) {
      const enemy = otherPlayer(player);
      const center = state.players[enemy].base.center;
      const occupant = getPieceAt(state, center.row, center.col);
      if (occupant && occupant.owner === player) {
        return { player, reason: "\u672c\u9663\u4e2d\u5fc3\u306e\u5360\u9818" };
      }
    }
  }

  return null;
}

function serializeState(state) {
  return JSON.stringify(state, null, 2);
}

function runRuleTests() {
  const lines = [];
  const tests = [
    ["\u6b20\u7247\u3067\u4e2d\u7acb\u5730\u5e2f\u3084\u6575\u652f\u914d\u5730\u3092\u4e0a\u66f8\u304d\u3067\u304d\u308b", testFragmentOverwrite],
    ["\u91cd\u306d\u7f6e\u304d\u3067\u30b9\u30bf\u30c3\u30af\u304c\u5897\u3048\u308b", testStacking],
    ["\u6575\u99d2\u306e\u4e0a\u306b\u306f\u6b20\u7247\u3092\u7f6e\u3051\u306a\u3044", testEnemyPieceBlock],
    ["\u81ea\u5206\u306e\u652f\u914d\u5730\u306b\u306f\u6b20\u7247\u3092\u7f6e\u3051\u306a\u3044", testOwnControlBlock],
    ["\u6301\u3061\u99d2\u306f\u81ea\u5206\u306e\u7a7a\u304d\u652f\u914d\u5730\u306b\u3060\u3051\u6253\u3066\u308b", testReserveDrop],
  ];

  for (const [name, fn] of tests) {
    try {
      fn();
      lines.push(`OK: ${name}`);
    } catch (error) {
      lines.push(`NG: ${name} -> ${error.message}`);
    }
  }

  return lines.join("\n");
}

function getFragmentCells(fragmentType, rotation, anchor) {
  return normalizeShape(FRAGMENT_LIBRARY[fragmentType].cells, rotation).map(([dr, dc]) => ({
    row: anchor.row + dr,
    col: anchor.col + dc,
  }));
}

function allDirections() {
  return [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1],
  ];
}

function createBoard(config) {
  return Array.from({ length: config.boardSize }, (_, row) =>
    Array.from({ length: config.boardSize }, (_, col) => ({
      row,
      col,
      controller: null,
      pieceId: null,
      stack: [],
      baseOwner: null,
      isBaseCenter: false,
    }))
  );
}

function createPlayerState(player, config) {
  const deck = shuffle(STARTER_DECK.map((card, index) => ({
    instanceId: `${player}-${card.id}-${index}`,
    fragmentType: card.fragmentType,
    pieceType: card.pieceType,
  })));

  return {
    pieces: {},
    reserve: { soldier: 0, lancer: 0 },
    hand: [],
    deck,
    base: createBase(config, player),
  };
}

function createBase(config, player) {
  const startRow = player === "P1" ? config.boardSize - config.baseSize : 0;
  const startCol = Math.floor((config.boardSize - config.baseSize) / 2);
  const cells = [];

  for (let row = 0; row < config.baseSize; row += 1) {
    for (let col = 0; col < config.baseSize; col += 1) {
      cells.push({ row: startRow + row, col: startCol + col });
    }
  }

  return {
    cells,
    center: {
      row: startRow + Math.floor(config.baseSize / 2),
      col: startCol + Math.floor(config.baseSize / 2),
    },
  };
}

function seedBases(state) {
  for (const player of ["P1", "P2"]) {
    for (const cell of state.players[player].base.cells) {
      const boardCell = state.board[cell.row][cell.col];
      boardCell.controller = player;
      boardCell.baseOwner = player;
      boardCell.isBaseCenter = cell.row === state.players[player].base.center.row &&
        cell.col === state.players[player].base.center.col;
    }
  }
}

function seedKings(state) {
  for (const player of ["P1", "P2"]) {
    addPiece(state, player, "king", state.players[player].base.center);
  }
}

function fillHands(state) {
  for (const player of ["P1", "P2"]) {
    while (state.players[player].hand.length < state.config.handLimit && state.players[player].deck.length > 0) {
      state.players[player].hand.push(state.players[player].deck.shift());
    }
  }
}

function addPiece(state, owner, kind, position) {
  const id = `${owner}-${kind}-${Object.keys(state.players[owner].pieces).length + 1}`;
  state.players[owner].pieces[id] = { id, owner, kind, row: position.row, col: position.col };
  state.board[position.row][position.col].pieceId = id;
  return id;
}

function getLegalReserveDrops(state, player) {
  const actions = [];
  const reserve = state.players[player].reserve;
  for (const [pieceType, count] of Object.entries(reserve)) {
    if (count <= 0) {
      continue;
    }
    forEachCell(state, (cell) => {
      if (cell.controller === player && !cell.pieceId) {
        actions.push({ type: "drop", player, pieceType, row: cell.row, col: cell.col });
      }
    });
  }
  return actions;
}

function getLegalFragmentPlacements(state, player) {
  const actions = [];
  const hand = state.players[player].hand;
  hand.forEach((card, handIndex) => {
    for (let rotation = 0; rotation < 4; rotation += 1) {
      forEachCell(state, (anchorCell) => {
        const fragmentCells = getFragmentCells(card.fragmentType, rotation, anchorCell);
        if (!isLegalFragmentPlacement(state, player, fragmentCells)) {
          return;
        }
        fragmentCells.forEach((pieceCell) => {
          if (!getPieceAt(state, pieceCell.row, pieceCell.col)) {
            actions.push({
              type: "placeFragment",
              player,
              handIndex,
              rotation,
              anchor: { row: anchorCell.row, col: anchorCell.col },
              pieceCell: { row: pieceCell.row, col: pieceCell.col },
            });
          }
        });
      });
    }
  });
  return actions;
}

function getLegalMoves(state, player) {
  const actions = [];
  for (const piece of Object.values(state.players[player].pieces)) {
    for (const target of getMovesForPiece(state, piece)) {
      actions.push({
        type: "move",
        player,
        pieceId: piece.id,
        to: target,
      });
    }
  }
  return actions;
}

function applyDrop(state, action) {
  const cell = state.board[action.row][action.col];
  if (cell.controller !== action.player || cell.pieceId) {
    throw new Error("\u6301\u3061\u99d2\u3092\u305d\u306e\u5834\u6240\u306b\u306f\u6253\u3066\u307e\u305b\u3093\u3002");
  }
  if ((state.players[action.player].reserve[action.pieceType] || 0) <= 0) {
    throw new Error("\u305d\u306e\u99d2\u306f\u6301\u3061\u99d2\u306b\u3042\u308a\u307e\u305b\u3093\u3002");
  }
  state.players[action.player].reserve[action.pieceType] -= 1;
  addPiece(state, action.player, action.pieceType, { row: action.row, col: action.col });
}

function applyFragmentPlacement(state, action) {
  const card = state.players[action.player].hand[action.handIndex];
  if (!card) {
    throw new Error("\u9078\u629e\u3057\u305f\u624b\u672d\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093\u3002");
  }

  const fragmentCells = getFragmentCells(card.fragmentType, action.rotation, action.anchor);
  if (!isLegalFragmentPlacement(state, action.player, fragmentCells)) {
    throw new Error("\u305d\u306e\u6b20\u7247\u306f\u305d\u3053\u306b\u914d\u7f6e\u3067\u304d\u307e\u305b\u3093\u3002");
  }

  const selectedPieceCell = fragmentCells.find((cell) => cell.row === action.pieceCell.row && cell.col === action.pieceCell.col);
  if (!selectedPieceCell) {
    throw new Error("\u5bfe\u5fdc\u3059\u308b\u99d2\u306f\u6b20\u7247\u306e\u4e0a\u306b\u7f6e\u304f\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002");
  }
  if (getPieceAt(state, selectedPieceCell.row, selectedPieceCell.col)) {
    throw new Error("\u5bfe\u5fdc\u3059\u308b\u99d2\u3092\u7f6e\u304f\u30de\u30b9\u306f\u7a7a\u3044\u3066\u3044\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002");
  }

  const placementId = `placement-${state.placements.length + 1}`;
  state.placements.push({
    id: placementId,
    owner: action.player,
    card,
    cells: fragmentCells,
  });

  fragmentCells.forEach((cell) => {
    const boardCell = state.board[cell.row][cell.col];
    boardCell.stack.push(placementId);
    boardCell.controller = action.player;
  });

  state.players[action.player].hand.splice(action.handIndex, 1);
  if (state.players[action.player].deck.length > 0) {
    state.players[action.player].hand.push(state.players[action.player].deck.shift());
  }

  addPiece(state, action.player, card.pieceType, selectedPieceCell);
}

function applyMove(state, action) {
  const piece = state.players[action.player].pieces[action.pieceId];
  if (!piece) {
    throw new Error("\u99d2\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093\u3002");
  }

  const legalTargets = getMovesForPiece(state, piece);
  const allowed = legalTargets.find((target) => target.row === action.to.row && target.col === action.to.col);
  if (!allowed) {
    throw new Error("\u305d\u306e\u79fb\u52d5\u306f\u3067\u304d\u307e\u305b\u3093\u3002");
  }

  const fromCell = state.board[piece.row][piece.col];
  const toCell = state.board[action.to.row][action.to.col];
  if (toCell.pieceId) {
    const captured = getPieceById(state, toCell.pieceId);
    delete state.players[captured.owner].pieces[captured.id];
    if (captured.kind !== "king") {
      state.players[action.player].reserve[captured.kind] = (state.players[action.player].reserve[captured.kind] || 0) + 1;
    }
  }

  fromCell.pieceId = null;
  toCell.pieceId = piece.id;
  piece.row = action.to.row;
  piece.col = action.to.col;
}

function isLegalFragmentPlacement(state, player, cells) {
  let touches = false;
  for (const cell of cells) {
    if (!isInside(state, cell.row, cell.col)) {
      return false;
    }

    const boardCell = state.board[cell.row][cell.col];
    const occupant = getPieceAt(state, cell.row, cell.col);
    if (occupant && occupant.owner !== player) {
      return false;
    }
    if (boardCell.controller === player) {
      return false;
    }

    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nr = cell.row + dr;
      const nc = cell.col + dc;
      if (isInside(state, nr, nc) && state.board[nr][nc].controller === player) {
        touches = true;
      }
    }
  }
  return touches;
}

function getMovesForPiece(state, piece) {
  const def = PIECE_DEFS[piece.kind];
  const results = [];

  if (def.move.type === "step") {
    for (const [dr, dc] of def.move.deltas) {
      const nr = piece.row + dr;
      const nc = piece.col + dc;
      if (!isInside(state, nr, nc)) {
        continue;
      }
      const occupant = getPieceAt(state, nr, nc);
      if (occupant && occupant.owner === piece.owner) {
        continue;
      }
      results.push({ row: nr, col: nc });
    }
    return results;
  }

  for (const [dr, dc] of def.move.deltas) {
    let nr = piece.row + dr;
    let nc = piece.col + dc;
    while (isInside(state, nr, nc)) {
      const cell = state.board[nr][nc];
      if (cell.controller === null) {
        break;
      }
      const occupant = getPieceAt(state, nr, nc);
      if (!occupant) {
        results.push({ row: nr, col: nc });
      } else {
        if (occupant.owner !== piece.owner) {
          results.push({ row: nr, col: nc });
        }
        break;
      }
      nr += dr;
      nc += dc;
    }
  }

  return results;
}

function describeAction(action) {
  if (action.type === "drop") {
    return `${playerLabel(action.player)}\u304c\u6301\u3061\u99d2 ${pieceLabel(action.pieceType)} \u3092 (${action.row + 1}, ${action.col + 1}) \u306b\u914d\u7f6e`;
  }
  if (action.type === "move") {
    return `${playerLabel(action.player)}\u304c ${action.pieceId} \u3092 (${action.to.row + 1}, ${action.to.col + 1}) \u3078\u79fb\u52d5`;
  }
  return `${playerLabel(action.player)}\u304c\u6b20\u7247\u3092\u914d\u7f6e`;
}

function getPieceAt(state, row, col) {
  const pieceId = state.board[row][col].pieceId;
  return pieceId ? getPieceById(state, pieceId) : null;
}

function getPieceById(state, pieceId) {
  return state.players.P1.pieces[pieceId] || state.players.P2.pieces[pieceId] || null;
}

function findPieceByKind(state, owner, kind) {
  return Object.values(state.players[owner].pieces).find((piece) => piece.kind === kind) || null;
}

function forEachCell(state, fn) {
  state.board.forEach((row) => row.forEach(fn));
}

function isInside(state, row, col) {
  return row >= 0 && row < state.config.boardSize && col >= 0 && col < state.config.boardSize;
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalizeShape(cells, rotation) {
  let rotated = cells.map(([row, col]) => [row, col]);
  for (let i = 0; i < rotation; i += 1) {
    rotated = rotated.map(([row, col]) => [col, -row]);
  }
  const minRow = Math.min(...rotated.map(([row]) => row));
  const minCol = Math.min(...rotated.map(([, col]) => col));
  return rotated.map(([row, col]) => [row - minRow, col - minCol]);
}

function otherPlayer(player) {
  return player === "P1" ? "P2" : "P1";
}

function playerLabel(player) {
  return player === "P1" ? "\u5148\u624b" : "\u5f8c\u624b";
}

function pieceLabel(pieceType) {
  return {
    king: "\u738b",
    soldier: "\u5175",
    lancer: "\u69cd",
  }[pieceType] || pieceType;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function testFragmentOverwrite() {
  let state = createGame();
  const action = getLegalActions(state, "P1").find((candidate) => candidate.type === "placeFragment");
  assert(action, "expected at least one legal fragment placement");
  state = applyAction(state, action);
  const placedCell = state.placements[0].cells[0];
  assert(state.board[placedCell.row][placedCell.col].controller === "P1", "placed cell should belong to P1");
}

function testStacking() {
  let state = createGame();
  const seedAction = getLegalActions(state, "P1").find((candidate) => candidate.type === "placeFragment");
  assert(seedAction, "expected a legal fragment placement");
  const target = getFragmentCells(
    state.players.P1.hand[seedAction.handIndex].fragmentType,
    seedAction.rotation,
    seedAction.anchor
  )[0];
  state.board[target.row][target.col].controller = "P2";
  state = applyAction(state, seedAction);
  assert(state.board[target.row][target.col].stack.length === 1, "cell should have one placement in stack");
  assert(state.board[target.row][target.col].controller === "P1", "top placement should overwrite control");
}

function testEnemyPieceBlock() {
  let state = createGame();
  addPiece(state, "P2", "soldier", { row: 5, col: 2 });
  const legal = getLegalActions(state, "P1").filter((action) => action.type === "placeFragment");
  assert(!legal.some((action) => action.anchor.row === 5 && action.anchor.col === 2), "cannot place fragment over enemy piece");
}

function testOwnControlBlock() {
  const state = createGame();
  const legal = getLegalActions(state, "P1").filter((action) => action.type === "placeFragment");
  assert(
    legal.every((action) => {
      const cells = getFragmentCells(
        state.players.P1.hand[action.handIndex].fragmentType,
        action.rotation,
        action.anchor
      );
      return cells.every((cell) => state.board[cell.row][cell.col].controller !== "P1");
    }),
    "cannot place fragment directly on own control"
  );
}

function testReserveDrop() {
  const state = createGame();
  state.players.P1.reserve.soldier = 1;
  const legal = getLegalActions(state, "P1").filter((action) => action.type === "drop");
  assert(legal.length > 0, "reserve drop should be generated");
  assert(legal.every((action) => state.board[action.row][action.col].controller === "P1"), "drops must stay in own territory");
}

window.UNFOLD = {
  DEFAULT_CONFIG,
  PIECE_DEFS,
  FRAGMENT_LIBRARY,
  STARTER_DECK,
  createGame,
  getLegalActions,
  applyAction,
  checkWin,
  serializeState,
  runRuleTests,
  getFragmentCells,
};
