(function () {
  var PLAYER_LABELS = { P1: "\u5148\u624b", P2: "\u5f8c\u624b" };
  var ORIGINAL_PIECE_LABELS = {
    king: "\u5C55\u754C\u8005",
    decoy: "\u8A98\u5F15\u58EB",
    flanker: "\u5074\u6483\u58EB",
    guard: "\u8B77\u885B\u58EB",
    vanguard: "\u524D\u885B\u58EB",
    rider: "\u9A0E\u4E57\u58EB",
    charger: "\u7A81\u6483\u58EB",
    disruptor: "\u652A\u4E71\u58EB",
    barrier: "\u7D50\u754C\u58EB",
    realmKnight: "\u754C\u9A0E\u58EB",
    chaosBeast: "\u6DF7\u6C8C\u7363",
    destroyer: "\u6EC5\u754C\u8005"
  };
  var SHOGI_PIECE_LABELS = {
    king: "\u738B\u5C06",
    decoy: "\u9999\u8ECA",
    flanker: "\u9280\u5C06",
    guard: "\u91D1\u5C06",
    vanguard: "\u6B69\u5175",
    rider: "\u6842\u99AC",
    charger: "\u98DB\u8ECA",
    disruptor: "\u89D2\u884C",
    barrier: "\u3068\u91D1",
    realmKnight: "\u6210\u6842",
    chaosBeast: "\u9F8D\u738B",
    destroyer: "\u9F8D\u99AC"
  };
  var ORIGINAL_PIECE_SHORT_LABELS = {
    king: "\u5C55",
    decoy: "\u8A98",
    flanker: "\u5074",
    guard: "\u8B77",
    vanguard: "\u524D",
    rider: "\u9A0E",
    charger: "\u7A81",
    disruptor: "\u652A",
    barrier: "\u7D50",
    realmKnight: "\u754C",
    chaosBeast: "\u6DF7",
    destroyer: "\u6EC5"
  };
  var SHOGI_PIECE_SHORT_LABELS = {
    king: "\u738B",
    decoy: "\u9999",
    flanker: "\u9280",
    guard: "\u91D1",
    vanguard: "\u6B69",
    rider: "\u6842",
    charger: "\u98DB",
    disruptor: "\u89D2",
    barrier: "\u3068",
    realmKnight: "\u572D",
    chaosBeast: "\u7ADC",
    destroyer: "\u99AC"
  };
  var ORIGINAL_MOVEMENT_RULES = {
    decoy: {
      kind: "step",
      vectors: [[0, -1], [0, -2]],
      summary: "\u8A98\u5F15\u58EB: \u5F8C\u65B9\u3078 1\u301C2 \u30DE\u30B9\u3002"
    },
    flanker: {
      kind: "step",
      vectors: [[1, 0], [1, 1], [-1, 0], [-1, 1]],
      summary: "\u5074\u6483\u58EB: \u4E0A\u4E0B 1 \u30DE\u30B9\u3068\u524D\u659C\u3081 2 \u65B9\u5411\u3078 1 \u30DE\u30B9\u3002"
    },
    guard: {
      kind: "step",
      vectors: [[1, 0], [1, -1], [-1, 0], [-1, -1], [0, -1]],
      summary: "\u8B77\u885B\u58EB: \u4E0A\u4E0B 1 \u30DE\u30B9\u3001\u5F8C\u65B9 1 \u30DE\u30B9\u3001\u5F8C\u659C\u3081 2 \u65B9\u5411\u3078 1 \u30DE\u30B9\u3002"
    },
    vanguard: {
      kind: "step",
      vectors: [[0, 1], [0, -1], [1, 0], [-1, 0]],
      summary: "\u524D\u885B\u58EB: \u5341\u5B57\u65B9\u5411\u3078 1 \u30DE\u30B9\u3002"
    },
    rider: {
      kind: "jump",
      vectors: [[0, 2], [2, 0], [-2, 0]],
      summary: "\u9A0E\u4E57\u58EB: \u524D 2 \u30DE\u30B9\u3001\u4E0A\u4E0B 2 \u30DE\u30B9\u306B\u8DF3\u8E8D\u3002"
    },
    charger: {
      kind: "step",
      vectors: [[0, 1], [0, 2], [0, 3]],
      summary: "\u7A81\u6483\u58EB: \u524D\u65B9\u3078 1\u301C3 \u30DE\u30B9\u76F4\u9032\u3002"
    },
    disruptor: {
      kind: "step",
      vectors: [[-1, -1], [1, -1], [-1, 1], [1, 1], [2, -2], [-2, -2]],
      summary: "\u652A\u4E71\u58EB: \u659C\u3081 1 \u30DE\u30B9\u3068\u3001\u5F8C\u659C\u3081 2 \u30DE\u30B9\u3002 2 \u30DE\u30B9\u79FB\u52D5\u306F\u9014\u4E2D\u3082\u9023\u7D9A\u3057\u305F\u5C55\u958B\u56F3\u4E0A\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059\u3002"
    },
    barrier: {
      kind: "step",
      vectors: [[0, 1], [0, -1], [-1, -1], [1, -1], [-1, 1], [1, 1]],
      summary: "\u7D50\u754C\u58EB: \u524D\u5F8C 1 \u30DE\u30B9\u3068\u659C\u3081 4 \u65B9\u5411\u3078 1 \u30DE\u30B9\u3002"
    },
    realmKnight: {
      kind: "step",
      vectors: [[0, 1], [0, 2], [-1, 1], [1, 1], [-1, 0], [1, 0]],
      summary: "\u754C\u9A0E\u58EB: \u524D 1\u301C2 \u30DE\u30B9\u3001\u524D\u659C\u3081 2 \u65B9\u5411\u3001\u4E0A\u4E0B 1 \u30DE\u30B9\u3002"
    },
    chaosBeast: {
      kind: "mixed",
      vectors: [[1, 0], [-1, 0], [0, 1], [0, -1]],
      jumpVectors: [[1, 2], [-1, 2], [1, -2], [-1, -2]],
      summary: "\u6DF7\u6C8C\u7363: \u5341\u5B57 1 \u30DE\u30B9\u3068\u3001(\u4E0A\u4E0B, \u524D\u5F8C 2) \u3078\u306E 4 \u65B9\u5411\u8DF3\u8E8D\u3002"
    },
    destroyer: {
      kind: "ray",
      vectors: [[0, 1], [-1, 1], [1, 1]],
      summary: "\u6EC5\u754C\u8005: \u524D\u65B9\u3068\u524D\u659C\u3081 2 \u65B9\u5411\u3078\u3001\u9023\u7D9A\u3057\u305F\u5C55\u958B\u56F3\u306E\u4E0A\u3092\u4EFB\u610F\u306E\u30DE\u30B9\u6570\u9032\u307F\u307E\u3059\u3002"
    },
    king: {
      kind: "step",
      vectors: [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]],
      summary: "\u5C55\u754C\u8005: 1 \u30DE\u30B9\u5168\u65B9\u5411\u3002"
    }
  };
  var SHOGI_MOVEMENT_RULES = {
    decoy: {
      kind: "ray",
      vectors: [[0, 1]],
      summary: "\u9999\u8ECA: \u524D\u65B9\u306B\u4F55\u30DE\u30B9\u3067\u3082\u76F4\u9032\u3002"
    },
    flanker: {
      kind: "step",
      vectors: [[0, 1], [-1, 1], [1, 1], [-1, -1], [1, -1]],
      summary: "\u9280\u5C06: \u524D1\u30DE\u30B9\u3001\u524D\u659C\u3081\u4E21\u65B9\u5411\u3001\u5F8C\u659C\u3081\u4E21\u65B9\u5411\u3078 1 \u30DE\u30B9\u3002"
    },
    guard: {
      kind: "step",
      vectors: [[0, 1], [-1, 1], [1, 1], [-1, 0], [1, 0], [0, -1]],
      summary: "\u91D1\u5C06: \u524D\u3001\u6A2A\u3001\u5F8C\u3001\u524D\u659C\u3081\u3078 1 \u30DE\u30B9\u3002"
    },
    vanguard: {
      kind: "step",
      vectors: [[0, 1]],
      summary: "\u6B69\u5175: \u524D\u3078 1 \u30DE\u30B9\u3002"
    },
    rider: {
      kind: "jump",
      vectors: [[-1, 2], [1, 2]],
      summary: "\u6842\u99AC: \u524D\u3078 2\u3001\u5DE6\u53F3\u3078 1 \u306E\u8DF3\u3073\u3002"
    },
    charger: {
      kind: "ray",
      vectors: [[0, 1], [0, -1], [-1, 0], [1, 0]],
      summary: "\u98DB\u8ECA: \u7E26\u6A2A\u306B\u4F55\u30DE\u30B9\u3067\u3082\u79FB\u52D5\u3002"
    },
    disruptor: {
      kind: "ray",
      vectors: [[-1, 1], [1, 1], [-1, -1], [1, -1]],
      summary: "\u89D2\u884C: \u659C\u3081\u306B\u4F55\u30DE\u30B9\u3067\u3082\u79FB\u52D5\u3002"
    },
    barrier: {
      kind: "step",
      vectors: [[0, 1], [-1, 1], [1, 1], [-1, 0], [1, 0], [0, -1]],
      summary: "\u3068\u91D1: \u91D1\u5C06\u3068\u540C\u3058\u52D5\u304D\u3002"
    },
    realmKnight: {
      kind: "step",
      vectors: [[0, 1], [-1, 1], [1, 1], [-1, 0], [1, 0], [0, -1]],
      summary: "\u6210\u6842: \u91D1\u5C06\u3068\u540C\u3058\u52D5\u304D\u3002"
    },
    chaosBeast: {
      kind: "rayStep",
      vectors: [[-1, 1], [1, 1], [-1, -1], [1, -1]],
      rayVectors: [[0, 1], [0, -1], [-1, 0], [1, 0]],
      summary: "\u9F8D\u738B: \u98DB\u8ECA\u306E\u52D5\u304D + \u659C\u3081 1 \u30DE\u30B9\u3002"
    },
    destroyer: {
      kind: "rayStep",
      vectors: [[0, 1], [0, -1], [-1, 0], [1, 0]],
      rayVectors: [[-1, 1], [1, 1], [-1, -1], [1, -1]],
      summary: "\u9F8D\u99AC: \u89D2\u884C\u306E\u52D5\u304D + \u7E26\u6A2A 1 \u30DE\u30B9\u3002"
    },
    king: {
      kind: "step",
      vectors: [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]],
      summary: "\u738B\u5C06: 1 \u30DE\u30B9\u5168\u65B9\u5411\u3002"
    }
  };
  var GAME_MODE_LABELS = { original: "\u30AA\u30EA\u30B8\u30CA\u30EB\u99D2", shogi: "\u5C06\u68CB\u99D2" };
  var MOVEMENT_SUMMARY_ORDER = ["decoy", "flanker", "guard", "vanguard", "rider", "charger", "disruptor", "barrier", "realmKnight", "chaosBeast", "destroyer", "king"];
  var BASE_FRAGMENT_LIBRARY = {
    net01: { label: "\u30C6\u30A3\u30FC", cells: [[0, 0], [1, 0], [1, 1], [1, 2], [1, 3], [2, 0]] },
    net02: { label: "\u30AF\u30E9\u30F3\u30AF", cells: [[0, 1], [1, 0], [1, 1], [1, 2], [1, 3], [2, 0]] },
    net03: { label: "\u30B5\u30A4\u30B9", cells: [[0, 2], [1, 0], [1, 1], [1, 2], [1, 3], [2, 0]] },
    net04: { label: "\u30B8\u30A7\u30A4", cells: [[0, 3], [1, 0], [1, 1], [1, 2], [1, 3], [2, 0]] },
    net05: { label: "\u30B8\u30B0\u30B6\u30B0", cells: [[0, 2], [1, 0], [1, 1], [1, 2], [1, 3], [2, 1]] },
    net06: { label: "\u30AF\u30ED\u30B9", cells: [[0, 1], [1, 0], [1, 1], [1, 2], [1, 3], [2, 1]] },
    net07: { label: "\u30B9\u30D4\u30A2", cells: [[0, 1], [1, 1], [1, 2], [1, 3], [2, 0], [2, 1]] },
    net08: { label: "\u30BD\u30FC", cells: [[0, 2], [1, 1], [1, 2], [1, 3], [2, 0], [2, 1]] },
    net09: { label: "\u30D5\u30C3\u30AF", cells: [[0, 2], [0, 3], [1, 0], [1, 1], [1, 2], [2, 0]] },
    net10: { label: "\u30B9\u30C6\u30C3\u30D7", cells: [[0, 2], [0, 3], [1, 1], [1, 2], [2, 0], [2, 1]] },
    net11: { label: "\u30D6\u30ED\u30C3\u30AF", cells: [[0, 2], [0, 3], [0, 4], [1, 0], [1, 1], [1, 2]] }
  };
  var MIRROR_SHARED_FRAGMENT_TYPES = { net01: true, net06: true, net08: true };
  var FRAGMENT_LIBRARY = buildFragmentLibrary();
  var STARTER_DECK = [
    { fragmentType: "net01", pieceType: "chaosBeast" },
    { fragmentType: "net02", pieceType: "guard" },
    { fragmentType: "net02m", pieceType: "guard" },
    { fragmentType: "net03", pieceType: "barrier" },
    { fragmentType: "net03m", pieceType: "barrier" },
    { fragmentType: "net04", pieceType: "charger" },
    { fragmentType: "net04m", pieceType: "charger" },
    { fragmentType: "net05", pieceType: "vanguard" },
    { fragmentType: "net05m", pieceType: "vanguard" },
    { fragmentType: "net06", pieceType: "destroyer" },
    { fragmentType: "net07", pieceType: "rider" },
    { fragmentType: "net07m", pieceType: "rider" },
    { fragmentType: "net08", pieceType: "realmKnight" },
    { fragmentType: "net09", pieceType: "flanker" },
    { fragmentType: "net09m", pieceType: "flanker" },
    { fragmentType: "net10", pieceType: "disruptor" },
    { fragmentType: "net10m", pieceType: "disruptor" },
    { fragmentType: "net11", pieceType: "decoy" },
    { fragmentType: "net11m", pieceType: "decoy" }
  ];
  var BOARD_ROWS = 9;
  var BOARD_COLS = 15;
  var HAND_LIMIT = 3;

  var els = {
    sceneViewport: document.getElementById("sceneViewport"),
    board: document.getElementById("board"),
    turnCard: document.getElementById("turnCard"),
    turnLabel: document.getElementById("turnLabel"),
    modeLabel: document.getElementById("modeLabel"),
    winnerLabel: document.getElementById("winnerLabel"),
    winnerOverlay: document.getElementById("winnerOverlay"),
    winnerOverlayText: document.getElementById("winnerOverlayText"),
    winnerOverlayReason: document.getElementById("winnerOverlayReason"),
    messageLabel: document.getElementById("messageLabel"),
    p1Reserve: document.getElementById("p1Reserve"),
    p2Reserve: document.getElementById("p2Reserve"),
    p1Hand: document.getElementById("p1Hand"),
    p2Hand: document.getElementById("p2Hand"),
    p1DeckCount: document.getElementById("p1DeckCount"),
    p2DeckCount: document.getElementById("p2DeckCount"),
    logList: document.getElementById("logList"),
    testOutput: document.getElementById("testOutput"),
    movementSummary: document.getElementById("movementSummary"),
    fragmentCatalog: document.getElementById("fragmentCatalog"),
    pendingPieceBanner: document.getElementById("pendingPieceBanner"),
    p1Panel: document.getElementById("p1Panel"),
    p2Panel: document.getElementById("p2Panel"),
    newGameBtn: document.getElementById("newGameBtn"),
      runTestsBtn: document.getElementById("runTestsBtn"),
      waitBtn: document.getElementById("waitBtn"),
      waitApproveBtn: document.getElementById("waitApproveBtn"),
      waitRejectBtn: document.getElementById("waitRejectBtn"),
      contextMenu: document.getElementById("contextMenu"),
    contextCancelBtn: document.getElementById("contextCancelBtn"),
    contextRotateBtn: document.getElementById("contextRotateBtn"),
    placementConfirm: document.getElementById("placementConfirm"),
    confirmText: document.getElementById("confirmText"),
    confirmPlaceBtn: document.getElementById("confirmPlaceBtn"),
    cancelPlaceBtn: document.getElementById("cancelPlaceBtn"),
    p1MulliganBtn: document.getElementById("p1MulliganBtn"),
    p1RecoverPieceBtn: document.getElementById("p1RecoverPieceBtn"),
    p1RecoverFragmentBtn: document.getElementById("p1RecoverFragmentBtn"),
    p2MulliganBtn: document.getElementById("p2MulliganBtn"),
    p2RecoverPieceBtn: document.getElementById("p2RecoverPieceBtn"),
    p2RecoverFragmentBtn: document.getElementById("p2RecoverFragmentBtn"),
    toggleModeBtn: document.getElementById("toggleModeBtn"),
    onlineNameInput: document.getElementById("onlineNameInput"),
    onlineModeSelect: document.getElementById("onlineModeSelect"),
    onlineRoomInput: document.getElementById("onlineRoomInput"),
    createRoomBtn: document.getElementById("createRoomBtn"),
    joinRoomBtn: document.getElementById("joinRoomBtn"),
    leaveRoomBtn: document.getElementById("leaveRoomBtn"),
    disbandRoomBtn: document.getElementById("disbandRoomBtn"),
    onlineStatus: document.getElementById("onlineStatus"),
      onlineRoomCode: document.getElementById("onlineRoomCode"),
      onlineSideLabel: document.getElementById("onlineSideLabel"),
      historyCard: document.getElementById("historyCard"),
      historyTitle: document.getElementById("historyTitle"),
      historyBoard: document.getElementById("historyBoard"),
      historyList: document.getElementById("historyList"),
      historyPrevBtn: document.getElementById("historyPrevBtn"),
      historyNextBtn: document.getElementById("historyNextBtn")
    };

  var uiState = {
    state: null,
    ruleMode: "original",
      online: {
        enabled: false,
        roomId: null,
        playerId: null,
        side: null,
        roomStatus: "offline",
        waitRequest: null,
        version: 0,
        pollTimer: null,
        syncing: false
      },
      replayIndex: -1,
      lastActionText: "",
      selection: null,
    pendingAnchor: null,
    rotation: 0,
    previewCells: [],
    previewLegal: false,
    moveTargets: [],
    reserveTargets: [],
    recoverPieceTargets: [],
    recoverFragmentTargets: [],
    contextMenuOpen: false,
    pendingPlacement: null,
    pendingFragmentPiece: null
  };

  function createGame(mode) {
    var state = {
      board: [],
      ruleMode: mode || uiState.ruleMode || "original",
      currentPlayer: "P1",
      winner: null,
      winReason: null,
      turnNumber: 1,
      actionLog: [],
      history: [],
      placements: [],
      players: {
        P1: createPlayer("P1", mode || uiState.ruleMode || "original"),
        P2: createPlayer("P2", mode || uiState.ruleMode || "original")
      }
    };

    for (var row = 0; row < BOARD_ROWS; row += 1) {
      var line = [];
      for (var col = 0; col < BOARD_COLS; col += 1) {
        line.push({
          row: row,
          col: col,
          controller: null,
          pieceId: null,
          stack: [],
          isBaseCenter: false,
          baseOwner: null
        });
      }
      state.board.push(line);
    }

    seedBase(state, "P1");
    seedBase(state, "P2");
    addPiece(state, "P1", "king", 4, 1);
    addPiece(state, "P2", "king", 4, 13);
    addPiece(state, "P1", "realmKnight", 4, 2);
    addPiece(state, "P2", "realmKnight", 4, 12);
    fillHand(state, "P1");
    fillHand(state, "P2");
    recordHistorySnapshot(state, "初期局面");

    return state;
  }

  function createPlayer(player, mode) {
    return {
      pieces: {},
      reserve: createReservePool(),
      hand: [],
      deck: shuffle(getStarterDeck(mode).slice())
    };
  }

  function createReservePool() {
    return {
      decoy: 0,
      flanker: 0,
      guard: 0,
      vanguard: 0,
      rider: 0,
      charger: 0,
      disruptor: 0,
      barrier: 0,
      realmKnight: 0,
      chaosBeast: 0,
      destroyer: 0
    };
  }

  function buildFragmentLibrary() {
    var library = {};
    Object.keys(BASE_FRAGMENT_LIBRARY).forEach(function (fragmentType) {
      var fragment = BASE_FRAGMENT_LIBRARY[fragmentType];
      var mirroredCells = mirrorFragmentCells(fragment.cells);
      library[fragmentType] = {
        label: fragment.label,
        cells: (MIRROR_SHARED_FRAGMENT_TYPES[fragmentType] ? fragment.cells : mirroredCells).map(function (cell) {
          return [cell[0], cell[1]];
        })
      };
      if (!MIRROR_SHARED_FRAGMENT_TYPES[fragmentType]) {
        library[fragmentType + "m"] = {
          label: "\u30DF\u30E9\u30FC" + fragment.label,
          cells: fragment.cells.map(function (cell) {
            return [cell[0], cell[1]];
          })
        };
      }
    });
    return library;
  }

  function getCurrentRuleMode() {
    return (uiState.state && uiState.state.ruleMode) || uiState.ruleMode || "original";
  }

  function isOnlineGame() {
    return !!(uiState.online && uiState.online.enabled);
  }

  function getOnlinePlayerName() {
    if (!els.onlineNameInput || !els.onlineNameInput.value.trim()) {
      return "Player";
    }
    return els.onlineNameInput.value.trim();
  }

  function getStarterDeck(mode) {
    return STARTER_DECK;
  }

  function getMovementRules() {
    return getCurrentRuleMode() === "shogi" ? SHOGI_MOVEMENT_RULES : ORIGINAL_MOVEMENT_RULES;
  }

  function getMovementRule(pieceType) {
    return getMovementRules()[pieceType];
  }

  function getPieceLabels() {
    return getCurrentRuleMode() === "shogi" ? SHOGI_PIECE_LABELS : ORIGINAL_PIECE_LABELS;
  }

  function getPieceShortLabels() {
    return getCurrentRuleMode() === "shogi" ? SHOGI_PIECE_SHORT_LABELS : ORIGINAL_PIECE_SHORT_LABELS;
  }

  function mirrorFragmentCells(cells) {
    var maxCol = 0;
    var mirrored = [];
    var index;
    for (index = 0; index < cells.length; index += 1) {
      maxCol = Math.max(maxCol, cells[index][1]);
    }
    for (index = 0; index < cells.length; index += 1) {
      mirrored.push([cells[index][0], maxCol - cells[index][1]]);
    }
    return normalizeFragmentCells(mirrored);
  }

  function normalizeFragmentCells(cells) {
    var minRow = Infinity;
    var minCol = Infinity;
    var normalized = [];
    var index;
    for (index = 0; index < cells.length; index += 1) {
      minRow = Math.min(minRow, cells[index][0]);
      minCol = Math.min(minCol, cells[index][1]);
    }
    for (index = 0; index < cells.length; index += 1) {
      normalized.push([cells[index][0] - minRow, cells[index][1] - minCol]);
    }
    normalized.sort(function (a, b) {
      return a[0] - b[0] || a[1] - b[1];
    });
    return normalized;
  }

  function seedBase(state, player) {
    var startRow = Math.floor((BOARD_ROWS - 3) / 2);
    var startCol = player === "P1" ? 0 : BOARD_COLS - 3;
    for (var row = 0; row < 3; row += 1) {
      for (var col = 0; col < 3; col += 1) {
        var cell = state.board[startRow + row][startCol + col];
        cell.controller = player;
        cell.isBaseCenter = row === 1 && col === 1;
        if (cell.isBaseCenter) {
          cell.baseOwner = player;
        }
      }
    }
  }

  function fillHand(state, player) {
    while (state.players[player].hand.length < HAND_LIMIT && state.players[player].deck.length > 0) {
      state.players[player].hand.push(state.players[player].deck.shift());
    }
  }

  function shuffle(list) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  function addPiece(state, owner, kind, row, col) {
    var id = owner + "-" + kind + "-" + (Object.keys(state.players[owner].pieces).length + 1);
    state.players[owner].pieces[id] = { id: id, owner: owner, kind: kind, row: row, col: col };
    state.board[row][col].pieceId = id;
    return id;
  }

  function getPiece(state, pieceId) {
    return state.players.P1.pieces[pieceId] || state.players.P2.pieces[pieceId] || null;
  }

  function clearSelection() {
    uiState.selection = null;
    uiState.pendingAnchor = null;
    uiState.rotation = 0;
    uiState.previewCells = [];
    uiState.previewLegal = false;
    uiState.moveTargets = [];
    uiState.reserveTargets = [];
    uiState.recoverPieceTargets = [];
    uiState.recoverFragmentTargets = [];
    uiState.pendingPlacement = null;
    uiState.pendingFragmentPiece = null;
    hideContextMenu();
    hidePlacementConfirm();
  }

  function render() {
    renderStatus();
    renderPendingPieceBanner();
    renderBoard();
    renderSide("P1", els.p1Reserve, els.p1Hand, els.p1DeckCount);
    renderSide("P2", els.p2Reserve, els.p2Hand, els.p2DeckCount);
    renderLog();
    renderHistoryPanel();
    renderMovementSummary();
    renderFragmentCatalog();
    renderOnlineStatus();
    syncContextMenuState();
    if (window.UNFOLD_3D_RENDERER && typeof window.UNFOLD_3D_RENDERER.renderScene === "function") {
      window.UNFOLD_3D_RENDERER.renderScene();
    }
  }

  function renderStatus() {
    els.turnLabel.textContent = PLAYER_LABELS[uiState.state.currentPlayer] + " (" + uiState.state.turnNumber + "\u624B\u76EE)";
    els.modeLabel.textContent = GAME_MODE_LABELS[getCurrentRuleMode()] + " / " + getModeText();
    els.winnerLabel.textContent = uiState.state.winner ? PLAYER_LABELS[uiState.state.winner] : "-";
    if (els.winnerOverlay && els.winnerOverlayText && els.winnerOverlayReason) {
      if (uiState.state.winner) {
        els.winnerOverlay.hidden = false;
        els.winnerOverlayText.textContent = PLAYER_LABELS[uiState.state.winner] + " 縺ｮ蜍晏茜";
        els.winnerOverlayReason.textContent = uiState.state.winReason || "";
        els.winnerOverlay.classList.toggle("winner-p1", uiState.state.winner === "P1");
        els.winnerOverlay.classList.toggle("winner-p2", uiState.state.winner === "P2");
      } else {
        els.winnerOverlay.hidden = true;
        els.winnerOverlayText.textContent = "-";
        els.winnerOverlayReason.textContent = "";
        els.winnerOverlay.classList.remove("winner-p1", "winner-p2");
      }
    }
    els.messageLabel.textContent = getMessageText();
    if (els.turnCard) {
      els.turnCard.classList.toggle("turn-p1", uiState.state.currentPlayer === "P1");
      els.turnCard.classList.toggle("turn-p2", uiState.state.currentPlayer === "P2");
    }
    if (els.p1Panel) {
      els.p1Panel.classList.toggle("active-turn-panel", uiState.state.currentPlayer === "P1");
    }
    if (els.p2Panel) {
      els.p2Panel.classList.toggle("active-turn-panel", uiState.state.currentPlayer === "P2");
    }
  }

  function renderPendingPieceBanner() {
    if (!els.pendingPieceBanner) {
      return;
    }
    if (uiState.pendingFragmentPiece) {
      els.pendingPieceBanner.hidden = false;
      els.pendingPieceBanner.innerHTML =
        "<strong>\u6B21\u306B\u7F6E\u304F\u99D2</strong>" +
        "<span class=\"pending-piece-chip\">" + getPieceLabel(uiState.pendingFragmentPiece.pieceType) + "</span>" +
        "<span>\u4ECA\u7F6E\u3044\u305F\u6B20\u7247\u306E\u4E2D\u304B\u3089\u3001\u7F6E\u304D\u305F\u3044\u30DE\u30B9\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044\u3002</span>";
      return;
    }
    if (uiState.selection && uiState.selection.type === "fragment" && uiState.selection.card) {
      els.pendingPieceBanner.hidden = false;
      els.pendingPieceBanner.innerHTML =
        "<strong>\u3053\u306E\u6B20\u7247\u306E\u5BFE\u5FDC\u99D2</strong>" +
        "<span class=\"pending-piece-chip\">" + getPieceLabel(uiState.selection.card.pieceType) + "</span>" +
        "<span>\u6B20\u7247\u3092\u7F6E\u3044\u305F\u5F8C\u306B\u3001\u3053\u306E\u99D2\u306E\u7F6E\u304D\u5834\u3092\u9078\u3073\u307E\u3059\u3002</span>";
      return;
    }
    if (uiState.selection && uiState.selection.type === "reserve") {
      els.pendingPieceBanner.hidden = false;
      els.pendingPieceBanner.innerHTML =
        "<strong>\u9078\u629E\u4E2D\u306E\u6301\u99D2</strong>" +
        "<span class=\"pending-piece-chip\">" + getPieceLabel(uiState.selection.pieceType) + "</span>" +
        "<span>\u9752\u3044\u30DE\u30FC\u30AB\u30FC\u304C\u51FA\u3066\u3044\u308B\u30DE\u30B9\u306B\u6253\u3066\u307E\u3059\u3002</span>";
      return;
    }
    if (uiState.selection && uiState.selection.type === "recoverPiece") {
      els.pendingPieceBanner.hidden = false;
      els.pendingPieceBanner.innerHTML =
        "<strong>\u99D2\u306E\u56DE\u53CE</strong>" +
        "<span class=\"pending-piece-chip\">\u56DE\u53CE\u4E2D</span>" +
        "<span>\u6A59\u306E\u67A0\u304C\u51FA\u3066\u3044\u308B\u81EA\u99D2\u3092 1 \u3064\u9078\u3076\u3068\u3001\u6301\u99D2\u306B\u623B\u3057\u307E\u3059\u3002</span>";
      return;
    }
    if (uiState.selection && uiState.selection.type === "recoverFragment") {
      els.pendingPieceBanner.hidden = false;
      els.pendingPieceBanner.innerHTML =
        "<strong>\u5C55\u958B\u56F3\u306E\u56DE\u53CE</strong>" +
        "<span class=\"pending-piece-chip\">\u56DE\u53CE\u4E2D</span>" +
        "<span>\u7D2B\u306E\u67A0\u304C\u51FA\u3066\u3044\u308B\u5C55\u958B\u56F3\u3092 1 \u3064\u9078\u3076\u3068\u3001\u624B\u672D\u306B\u623B\u3057\u307E\u3059\u3002</span>";
      return;
    }
    els.pendingPieceBanner.hidden = true;
    els.pendingPieceBanner.innerHTML = "";
  }

  function renderBoard() {
    els.board.innerHTML = "";
    els.board.style.gridTemplateColumns = "repeat(" + BOARD_COLS + ", minmax(0, 1fr))";
    for (var row = 0; row < BOARD_ROWS; row += 1) {
      for (var col = 0; col < BOARD_COLS; col += 1) {
        var cell = uiState.state.board[row][col];
        var button = document.createElement("button");
        button.type = "button";
        button.className = "cell " + (cell.controller ? cell.controller.toLowerCase() : "neutral");
        if (cell.isBaseCenter) {
          button.classList.add("base-center");
        }
        if (uiState.selection && uiState.selection.type === "piece" && pieceMatchesCell(uiState.selection.pieceId, row, col)) {
          button.classList.add("selected");
        }
        if (isMoveTarget(row, col)) {
          button.classList.add("move-target");
        }
        if (isReserveTarget(row, col)) {
          button.classList.add("reserve-target");
        }
        if (isRecoverPieceTarget(row, col)) {
          button.classList.add("recover-piece-target");
        }
        if (isRecoverFragmentTarget(row, col)) {
          button.classList.add("recover-fragment-target");
        }
        if (isPendingFragmentPieceCell(row, col)) {
          button.classList.add("move-target");
        }
        if (isPreviewCell(row, col)) {
          button.classList.add("anchor");
          if (!uiState.previewLegal) {
            button.classList.add("preview-invalid");
          }
          if (!cell.pieceId) {
            button.classList.add("target");
          }
        }
        button.dataset.row = String(row);
        button.dataset.col = String(col);
        button.addEventListener("click", makeCellHandler(row, col));
        button.addEventListener("mouseenter", makeCellHoverHandler(row, col));

        var stack = document.createElement("span");
        stack.className = "stack-count";
        stack.textContent = cell.stack.length > 0 ? "x" + cell.stack.length : "";
        button.appendChild(stack);

        if (cell.pieceId) {
          var piece = getPiece(uiState.state, cell.pieceId);
          var pieceEl = document.createElement("div");
          pieceEl.className = "piece " + piece.owner.toLowerCase();
          pieceEl.textContent = getPieceShortLabel(piece.kind);
          button.appendChild(pieceEl);

          var meta = document.createElement("span");
          meta.className = "meta";
          meta.textContent = getPieceShortLabel(piece.kind);
          button.appendChild(meta);
        }

        els.board.appendChild(button);
      }
    }
  }

  function renderSide(player, reserveEl, handEl, deckEl) {
    var playerState = uiState.state.players[player];
    reserveEl.innerHTML = "";
    handEl.innerHTML = "";
    deckEl.textContent = playerState.deck.length + "\u679A";

    Object.keys(playerState.reserve).filter(function (pieceType) {
      return playerState.reserve[pieceType] > 0;
    }).forEach(function (pieceType) {
      var button = document.createElement("button");
      button.className = "choice-card reserve-card";
      if (uiState.selection && uiState.selection.type === "reserve" && uiState.selection.player === player && uiState.selection.pieceType === pieceType) {
        button.classList.add("active");
      }
      button.innerHTML = "<strong>" + getPieceLabel(pieceType) + "</strong><span>\u6301\u3061\u99D2</span><span class=\"choice-count\">x" + playerState.reserve[pieceType] + "</span>";
      button.disabled = player !== uiState.state.currentPlayer;
      button.addEventListener("click", function () {
        uiState.selection = { type: "reserve", player: player, pieceType: pieceType };
        uiState.pendingAnchor = null;
        uiState.previewCells = [];
        uiState.previewLegal = false;
        uiState.moveTargets = [];
        uiState.reserveTargets = getLegalReserveTargets(player, pieceType);
        uiState.recoverPieceTargets = [];
        uiState.recoverFragmentTargets = [];
        render();
      });
      reserveEl.appendChild(button);
    });
    if (!reserveEl.childElementCount) {
      reserveEl.innerHTML = "<p class=\"subtle\">\u306A\u3057</p>";
    }

    playerState.hand.forEach(function (card, handIndex) {
      var button = document.createElement("button");
      button.className = "choice-card hand-card";
      if (uiState.selection && uiState.selection.type === "fragment" && uiState.selection.player === player && uiState.selection.handIndex === handIndex) {
        button.classList.add("active");
      }
      button.innerHTML = "<strong>" + FRAGMENT_LIBRARY[card.fragmentType].label + "</strong>" +
        "<span class=\"choice-subtitle\">\u5BFE\u5FDC\u99D2: " + getPieceLabel(card.pieceType) + "</span>" +
        "<span class=\"fragment-preview\">" + getFragmentPreviewText(card.fragmentType) + "</span>";
      button.disabled = player !== uiState.state.currentPlayer;
      button.addEventListener("click", function () {
        uiState.selection = { type: "fragment", player: player, handIndex: handIndex, card: card };
        uiState.pendingAnchor = null;
        uiState.previewCells = [];
        uiState.previewLegal = false;
        uiState.moveTargets = [];
        uiState.reserveTargets = [];
        uiState.recoverPieceTargets = [];
        uiState.recoverFragmentTargets = [];
        render();
      });
      handEl.appendChild(button);
    });
  }

  function renderLog() {
    els.logList.innerHTML = "";
    uiState.state.actionLog.forEach(function (entry) {
      var item = document.createElement("li");
      item.textContent = entry;
      els.logList.appendChild(item);
    });
  }

  function renderHistoryPanel() {
    var history = getHistoryEntries();
    var selectedIndex = uiState.replayIndex >= 0 ? uiState.replayIndex : history.length - 1;
    var entry;
    if (!els.historyCard || !els.historyList || !els.historyBoard || !els.historyTitle) {
      return;
    }
    els.historyCard.hidden = !history.length;
    if (!history.length) {
      return;
    }
    if (selectedIndex < 0) {
      selectedIndex = 0;
    }
    if (selectedIndex >= history.length) {
      selectedIndex = history.length - 1;
    }
    uiState.replayIndex = selectedIndex;
    entry = history[selectedIndex];
    els.historyTitle.textContent = (selectedIndex === 0 ? "開始局面" : "第" + selectedIndex + "手") + ": " + entry.label;
    els.historyList.innerHTML = "";
    history.forEach(function (historyEntry, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "history-entry" + (index === selectedIndex ? " active" : "");
      button.textContent = (index === 0 ? "開始局面" : "第" + index + "手") + " / " + historyEntry.label;
      button.addEventListener("click", function () {
        uiState.replayIndex = index;
        renderHistoryPanel();
      });
      els.historyList.appendChild(button);
    });
    renderHistoryBoard(entry.snapshot);
    if (els.historyPrevBtn) {
      els.historyPrevBtn.disabled = selectedIndex <= 0;
    }
    if (els.historyNextBtn) {
      els.historyNextBtn.disabled = selectedIndex >= history.length - 1;
    }
  }

  function renderHistoryBoard(snapshot) {
    var row;
    var col;
    if (!els.historyBoard) {
      return;
    }
    els.historyBoard.innerHTML = "";
    els.historyBoard.style.gridTemplateColumns = "repeat(" + BOARD_COLS + ", minmax(0, 1fr))";
    for (row = 0; row < BOARD_ROWS; row += 1) {
      for (col = 0; col < BOARD_COLS; col += 1) {
        var cell = snapshot.board[row][col];
        var piece = cell.pieceId ? getPiece(snapshot, cell.pieceId) : null;
        var cellEl = document.createElement("div");
        cellEl.className = "history-cell " + (cell.controller ? cell.controller.toLowerCase() : "neutral");
        if (cell.isBaseCenter) {
          cellEl.classList.add("base-center");
        }
        if (piece) {
          var pieceEl = document.createElement("span");
          pieceEl.className = "history-piece";
          pieceEl.textContent = getPieceShortLabel(piece.kind);
          cellEl.appendChild(pieceEl);
        }
        els.historyBoard.appendChild(cellEl);
      }
    }
  }

  function renderMovementSummary() {
    if (!els.movementSummary) {
      return;
    }
    els.movementSummary.innerHTML = "";
    MOVEMENT_SUMMARY_ORDER.forEach(function (ruleKey) {
      var item = document.createElement("div");
      var preview = document.createElement("div");
      var desc = document.createElement("span");
      item.className = "summary-item";
      preview.className = "movement-board";
      desc.className = "choice-subtitle";
      appendMovementMiniBoard(preview, ruleKey);
      item.innerHTML = "<strong>" + getPieceLabel(ruleKey) + "</strong>";
      desc.textContent = getMovementRule(ruleKey).summary;
      item.appendChild(preview);
      item.appendChild(desc);
      els.movementSummary.appendChild(item);
    });
  }

  function renderFragmentCatalog() {
    var catalogEntries;
    if (!els.fragmentCatalog) {
      return;
    }
    els.fragmentCatalog.innerHTML = "";
    catalogEntries = Object.keys(BASE_FRAGMENT_LIBRARY).sort(function (a, b) {
      return a.localeCompare(b);
    });
    catalogEntries.forEach(function (fragmentType) {
      var item = document.createElement("div");
      var preview = document.createElement("div");
      var name = document.createElement("strong");
      var sub = document.createElement("span");
      var mirror = document.createElement("span");
      var piece = document.createElement("span");
      item.className = "fragment-catalog-item";
      name.textContent = fragmentType + " : " + FRAGMENT_LIBRARY[fragmentType].label;
      sub.className = "choice-subtitle";
      sub.textContent = getFragmentCoordinateText(fragmentType, false);
      mirror.className = "choice-subtitle";
      mirror.textContent = MIRROR_SHARED_FRAGMENT_TYPES[fragmentType]
        ? "鏡像なし"
        : "鏡像あり: " + getFragmentDisplayLabel(fragmentType + "m");
      piece.className = "choice-subtitle";
      piece.textContent = "対応駒: " + getPieceLabel(getCatalogPieceType(fragmentType));
      preview.className = "fragment-catalog-board";
      appendFragmentMiniBoard(preview, FRAGMENT_LIBRARY[fragmentType].cells);
      item.appendChild(name);
      item.appendChild(sub);
      item.appendChild(mirror);
      item.appendChild(piece);
      item.appendChild(preview);
      els.fragmentCatalog.appendChild(item);
    });
  }

  function getFragmentCoordinateText(fragmentType, useBaseLibrary) {
    var library = useBaseLibrary ? BASE_FRAGMENT_LIBRARY : FRAGMENT_LIBRARY;
    return library[fragmentType].cells.map(function (cell) {
      return "(" + cell[0] + "," + cell[1] + ")";
    }).join(" ");
  }

  function getFragmentDisplayLabel(fragmentType) {
    return FRAGMENT_LIBRARY[fragmentType] ? FRAGMENT_LIBRARY[fragmentType].label : fragmentType;
  }

  function getCatalogPieceType(fragmentType) {
    for (var i = 0; i < STARTER_DECK.length; i += 1) {
      if (STARTER_DECK[i].fragmentType === fragmentType || STARTER_DECK[i].fragmentType === fragmentType + "m") {
        return STARTER_DECK[i].pieceType;
      }
    }
    return "";
  }

  function renderOnlineStatus() {
    var modeText = GAME_MODE_LABELS[getCurrentRuleMode()];
    var statusText = "ローカル対戦中 (" + modeText + ")";
    if (isOnlineGame()) {
      statusText = "オンライン対戦中";
      if (uiState.online.roomStatus === "waiting") {
        statusText += " / 相手待ち (" + modeText + ")";
      } else if (uiState.online.roomStatus === "playing") {
        statusText += " / 対戦中 (" + modeText + ")";
      } else {
        statusText += " (" + modeText + ")";
      }
    }
    if (els.onlineStatus) {
      els.onlineStatus.textContent = statusText;
    }
    if (els.onlineRoomCode) {
      els.onlineRoomCode.textContent = uiState.online.roomId || "-";
    }
    if (els.onlineSideLabel) {
      els.onlineSideLabel.textContent = uiState.online.side ? PLAYER_LABELS[uiState.online.side] : "-";
    }
    if (els.onlineModeSelect) {
      els.onlineModeSelect.value = getCurrentRuleMode();
      els.onlineModeSelect.disabled = isOnlineGame();
    }
    if (els.toggleModeBtn) {
      els.toggleModeBtn.textContent = "駒モード: " + GAME_MODE_LABELS[getCurrentRuleMode()];
      els.toggleModeBtn.disabled = isOnlineGame();
    }
    if (els.newGameBtn) {
      els.newGameBtn.disabled = isOnlineGame();
    }
    if (els.createRoomBtn) {
      els.createRoomBtn.disabled = isOnlineGame();
    }
    if (els.joinRoomBtn) {
      els.joinRoomBtn.disabled = isOnlineGame();
    }
    if (els.leaveRoomBtn) {
      els.leaveRoomBtn.disabled = !isOnlineGame();
    }
    if (els.disbandRoomBtn) {
      els.disbandRoomBtn.disabled = !(isOnlineGame() && uiState.online.side === "P1");
      els.disbandRoomBtn.hidden = !(isOnlineGame() && uiState.online.side === "P1");
    }
    if (els.onlineRoomInput) {
      els.onlineRoomInput.disabled = isOnlineGame();
    }
    if (els.waitBtn) {
      els.waitBtn.disabled = isOnlineGame()
        ? !canUseWait() || !!uiState.online.waitRequest || uiState.state.currentPlayer !== uiState.online.side
        : !canUseWait();
    }
    if (els.waitApproveBtn) {
      els.waitApproveBtn.hidden = !(isOnlineGame() && uiState.online.waitRequest && uiState.online.waitRequest.requestedTo === uiState.online.side);
    }
    if (els.waitRejectBtn) {
      els.waitRejectBtn.hidden = !(isOnlineGame() && uiState.online.waitRequest && uiState.online.waitRequest.requestedTo === uiState.online.side);
    }
  }

  function appendFragmentMiniBoard(container, cells) {
    var maxRow = 0;
    var maxCol = 0;
    var row;
    var col;
    cells.forEach(function (cell) {
      maxRow = Math.max(maxRow, cell[0]);
      maxCol = Math.max(maxCol, cell[1]);
    });
    container.style.gridTemplateColumns = "repeat(" + (maxCol + 1) + ", 18px)";
    for (row = 0; row <= maxRow; row += 1) {
      for (col = 0; col <= maxCol; col += 1) {
        var cellEl = document.createElement("span");
        cellEl.className = "fragment-catalog-cell";
        if (hasShapeCell(cells, row, col)) {
          cellEl.classList.add("filled");
        } else {
          cellEl.classList.add("empty");
        }
        container.appendChild(cellEl);
      }
    }
  }

  function appendMovementMiniBoard(container, pieceType) {
    var pattern = buildMovementPattern(pieceType);
    var row;
    var col;
    container.style.gridTemplateColumns = "repeat(" + pattern.cols + ", 18px)";
    for (row = 0; row < pattern.rows; row += 1) {
      for (col = 0; col < pattern.cols; col += 1) {
        var cellEl = document.createElement("span");
        var key = row + ":" + col;
        cellEl.className = "movement-board-cell";
        if (row === pattern.originRow && col === pattern.originCol) {
          cellEl.classList.add("origin");
          cellEl.textContent = getPieceShortLabel(pieceType);
        } else if (pattern.targets[key]) {
          cellEl.classList.add(pattern.targets[key]);
          if (pattern.targets[key] === "jump") {
            cellEl.textContent = "霍ｳ";
          }
        } else {
          cellEl.classList.add("empty");
        }
        container.appendChild(cellEl);
      }
    }
  }

  function buildMovementPattern(pieceType) {
    var rule = getMovementRule(pieceType);
    var coords = [{ x: 0, y: 0, kind: "origin" }];
    var minX = 0;
    var maxX = 0;
    var minY = 0;
    var maxY = 0;
    var targets = {};

    if (rule.kind === "ray") {
      (rule.vectors || []).forEach(function (vector) {
        for (var step = 1; step <= 3; step += 1) {
          var rx = vector[0] * step;
          var ry = vector[1] * step;
          coords.push({ x: rx, y: ry, kind: "ray" });
        }
      });
    } else if (rule.kind === "rayStep") {
      (rule.rayVectors || []).forEach(function (vector) {
        for (var rayStep = 1; rayStep <= 3; rayStep += 1) {
          coords.push({ x: vector[0] * rayStep, y: vector[1] * rayStep, kind: "move" });
        }
      });
      (rule.vectors || []).forEach(function (vector) {
        coords.push({ x: vector[0], y: vector[1], kind: "move" });
      });
    } else {
      rule.vectors.forEach(function (vector) {
        coords.push({ x: vector[0], y: vector[1], kind: rule.kind === "jump" ? "jump" : "move" });
      });
      if (rule.jumpVectors) {
        rule.jumpVectors.forEach(function (vector) {
          coords.push({ x: vector[0], y: vector[1], kind: "jump" });
        });
      }
    }

    coords.forEach(function (coord) {
      minX = Math.min(minX, coord.x);
      maxX = Math.max(maxX, coord.x);
      minY = Math.min(minY, coord.y);
      maxY = Math.max(maxY, coord.y);
    });

    coords.forEach(function (coord) {
      var row = maxY - coord.y;
      var col = coord.x - minX;
      if (coord.kind !== "origin") {
        targets[row + ":" + col] = coord.kind === "jump" ? "jump" : "move";
      }
    });

    return {
      rows: maxY - minY + 1,
      cols: maxX - minX + 1,
      originRow: maxY,
      originCol: -minX,
      targets: targets
    };
  }

  function syncContextMenuState() {
    if (!els.contextMenu) {
      return;
    }
    if (els.contextRotateBtn) {
      els.contextRotateBtn.disabled = !(uiState.selection && uiState.selection.type === "fragment");
    }
    if (els.contextCancelBtn) {
      els.contextCancelBtn.disabled = !uiState.selection;
    }
    syncActionButtons();
  }

  function syncActionButtons() {
    var isP1Turn = uiState.state.currentPlayer === "P1";
    var isP2Turn = uiState.state.currentPlayer === "P2";
    var recoverPieceActive = !!(uiState.selection && uiState.selection.type === "recoverPiece");
    var recoverFragmentActive = !!(uiState.selection && uiState.selection.type === "recoverFragment");
    syncPlayerActionButtons(
      els.p1MulliganBtn,
      els.p1RecoverPieceBtn,
      els.p1RecoverFragmentBtn,
      isP1Turn,
      recoverPieceActive,
      recoverFragmentActive
    );
    syncPlayerActionButtons(
      els.p2MulliganBtn,
      els.p2RecoverPieceBtn,
      els.p2RecoverFragmentBtn,
      isP2Turn,
      recoverPieceActive,
      recoverFragmentActive
    );
  }

  function syncPlayerActionButtons(mulliganBtn, recoverPieceBtn, recoverFragmentBtn, isCurrentPlayer, recoverPieceActive, recoverFragmentActive) {
    if (mulliganBtn) {
      mulliganBtn.disabled = !isCurrentPlayer || !canMulligan();
      mulliganBtn.classList.toggle("active-tool", false);
    }
    if (recoverPieceBtn) {
      recoverPieceBtn.disabled = !isCurrentPlayer || getRecoverablePieces().length === 0;
      recoverPieceBtn.classList.toggle("active-tool", isCurrentPlayer && recoverPieceActive);
    }
    if (recoverFragmentBtn) {
      recoverFragmentBtn.disabled = !isCurrentPlayer || getRecoverablePlacements().length === 0;
      recoverFragmentBtn.classList.toggle("active-tool", isCurrentPlayer && recoverFragmentActive);
    }
  }

  function canStartUtilityAction() {
    return !uiState.state.winner && !uiState.pendingFragmentPiece && (!uiState.selection || uiState.selection.type === "recoverPiece" || uiState.selection.type === "recoverFragment");
  }

  function getBoardAnchorElement() {
    if (els.sceneViewport) {
      return els.sceneViewport;
    }
    return els.board;
  }

  function openContextMenu(clientX, clientY) {
    var anchor = getBoardAnchorElement();
    if (!els.contextMenu || !anchor || !uiState.selection) {
      return;
    }
    var boardRect = anchor.getBoundingClientRect();
    var cardRect = anchor.closest(".board-card").getBoundingClientRect();
    var left = Math.max(12, Math.min(clientX - cardRect.left, boardRect.right - cardRect.left - 192));
    var top = Math.max(12, Math.min(clientY - cardRect.top, boardRect.bottom - cardRect.top - 96));
    els.contextMenu.style.left = left + "px";
    els.contextMenu.style.top = top + "px";
    els.contextMenu.hidden = false;
    uiState.contextMenuOpen = true;
    syncContextMenuState();
  }

  function hideContextMenu() {
    if (!els.contextMenu) {
      return;
    }
    els.contextMenu.hidden = true;
    uiState.contextMenuOpen = false;
  }

  function openPlacementConfirm(clientX, clientY, target) {
    var anchor = getBoardAnchorElement();
    if (!els.placementConfirm || !anchor) {
      return;
    }
    var anchorRect = anchor.getBoundingClientRect();
    var cardRect = anchor.closest(".board-card").getBoundingClientRect();
    var left = Math.max(12, Math.min(clientX - cardRect.left, anchorRect.right - cardRect.left - 222));
    var top = Math.max(12, Math.min(clientY - cardRect.top, anchorRect.bottom - cardRect.top - 124));
    uiState.pendingPlacement = target;
    els.placementConfirm.style.left = left + "px";
    els.placementConfirm.style.top = top + "px";
    els.placementConfirm.hidden = false;
  }

  function openPlacementConfirmAtCenter(target) {
    var anchor = getBoardAnchorElement();
    if (!anchor) {
      return;
    }
    var rect = anchor.getBoundingClientRect();
    openPlacementConfirm(rect.left + rect.width / 2, rect.top + rect.height / 2, target);
  }

  function hidePlacementConfirm() {
    if (!els.placementConfirm) {
      return;
    }
    els.placementConfirm.hidden = true;
    uiState.pendingPlacement = null;
  }

  function refreshBoardPreviewClasses() {
    if (!els.board || !els.board.children) {
      return;
    }
    for (var row = 0; row < BOARD_ROWS; row += 1) {
      for (var col = 0; col < BOARD_COLS; col += 1) {
        var index = row * BOARD_COLS + col;
        var button = els.board.children[index];
        var cell = uiState.state.board[row][col];
        if (!button) {
          continue;
        }
        button.classList.remove("selected", "anchor", "target", "preview-invalid", "move-target", "reserve-target", "recover-piece-target", "recover-fragment-target");
        if (uiState.selection && uiState.selection.type === "piece" && pieceMatchesCell(uiState.selection.pieceId, row, col)) {
          button.classList.add("selected");
        }
        if (isMoveTarget(row, col)) {
          button.classList.add("move-target");
        }
        if (isReserveTarget(row, col)) {
          button.classList.add("reserve-target");
        }
        if (isRecoverPieceTarget(row, col)) {
          button.classList.add("recover-piece-target");
        }
        if (isRecoverFragmentTarget(row, col)) {
          button.classList.add("recover-fragment-target");
        }
        if (isPendingFragmentPieceCell(row, col)) {
          button.classList.add("move-target");
        }
        if (isPreviewCell(row, col)) {
          button.classList.add("anchor");
          if (!uiState.previewLegal) {
            button.classList.add("preview-invalid");
          }
          if (!cell.pieceId) {
            button.classList.add("target");
          }
        }
      }
    }
  }

  function handleBoardCellAction(row, col, event) {
    if (uiState.state.winner) {
      return;
    }

    var cell = uiState.state.board[row][col];
    var piece = cell.pieceId ? getPiece(uiState.state, cell.pieceId) : null;

    if (uiState.pendingFragmentPiece) {
      tryFragmentPieceDrop(row, col, event);
      return;
    }

    if (uiState.selection && uiState.selection.type === "recoverPiece") {
      tryRecoverPiece(row, col);
      return;
    }

    if (uiState.selection && uiState.selection.type === "recoverFragment") {
      tryRecoverFragment(row, col);
      return;
    }

    if (uiState.selection && uiState.selection.type === "piece") {
      tryMove(row, col, event);
      return;
    }

    if (uiState.selection && uiState.selection.type === "reserve") {
      tryReserveDrop(row, col);
      return;
    }

    if (uiState.selection && uiState.selection.type === "fragment") {
      tryFragmentPlace(row, col, event);
      return;
    }

    if (piece && piece.owner === uiState.state.currentPlayer) {
      uiState.selection = { type: "piece", pieceId: piece.id };
      uiState.moveTargets = getLegalMoveTargets(piece);
      uiState.reserveTargets = [];
      uiState.recoverPieceTargets = [];
      uiState.recoverFragmentTargets = [];
      render();
      return;
    }

    clearSelection();
    render();
  }

  function makeCellHandler(row, col) {
    return function (event) {
      handleBoardCellAction(row, col, event);
    };
  }

  function handleBoardCellHover(row, col) {
    if (uiState.state.winner) {
      return;
    }
    if (!uiState.selection || uiState.selection.type !== "fragment") {
      return;
    }
    if (uiState.pendingPlacement) {
      return;
    }
    updateFragmentPreview(row, col, false);
  }

  function makeCellHoverHandler(row, col) {
    return function () {
      handleBoardCellHover(row, col);
    };
  }

  function tryMove(row, col, event) {
    var piece = getPiece(uiState.state, uiState.selection.pieceId);
    if (!piece) {
      return;
    }
    if (!canMovePiece(piece, row, col)) {
      return;
    }

    openPlacementConfirm(event ? event.clientX : 0, event ? event.clientY : 0, {
      type: "move",
      pieceId: piece.id,
      row: row,
      col: col
    });
    if (els.confirmText) {
      els.confirmText.textContent = "\u3053\u306E\u79FB\u52D5\u3092\u78BA\u5B9A\u3057\u307E\u3059\u304B\uFF1F";
    }
  }

  function commitMove(pieceId, row, col) {
    var piece = getPiece(uiState.state, pieceId);
    if (!piece || !canMovePiece(piece, row, col)) {
      hidePlacementConfirm();
      return;
    }

    var target = uiState.state.board[row][col];
    var targetPiece = target.pieceId ? getPiece(uiState.state, target.pieceId) : null;
    var fromRow = piece.row;
    var fromCol = piece.col;
    if (targetPiece && targetPiece.owner === piece.owner) {
      return;
    }

    uiState.state.board[piece.row][piece.col].pieceId = null;
    if (targetPiece) {
      delete uiState.state.players[targetPiece.owner].pieces[targetPiece.id];
      if (targetPiece.kind !== "king") {
        uiState.state.players[piece.owner].reserve[targetPiece.kind] += 1;
      } else {
        uiState.state.winner = piece.owner;
        uiState.state.winReason = "\u738b\u306E\u6355\u7372";
      }
    }
    piece.row = row;
    piece.col = col;
    target.pieceId = piece.id;
    if (window.UNFOLD_3D_RENDERER && typeof window.UNFOLD_3D_RENDERER.startPieceMoveAnimation === "function") {
      window.UNFOLD_3D_RENDERER.startPieceMoveAnimation(piece.id, fromRow, fromCol, row, col);
    }
    pushLog(PLAYER_LABELS[piece.owner] + "\u304C " + piece.id + " \u3092 (" + (row + 1) + ", " + (col + 1) + ") \u3078\u79FB\u52D5");
    hidePlacementConfirm();
    endTurn();
  }

  function getLegalMoveTargets(piece) {
    var targets = [];
    for (var row = 0; row < BOARD_ROWS; row += 1) {
      for (var col = 0; col < BOARD_COLS; col += 1) {
        if (canMovePiece(piece, row, col)) {
          targets.push({ row: row, col: col });
        }
      }
    }
    return targets;
  }

  function isMoveTarget(row, col) {
    for (var i = 0; i < uiState.moveTargets.length; i += 1) {
      if (uiState.moveTargets[i].row === row && uiState.moveTargets[i].col === col) {
        return true;
      }
    }
    return false;
  }

  function isReserveTarget(row, col) {
    for (var i = 0; i < uiState.reserveTargets.length; i += 1) {
      if (uiState.reserveTargets[i].row === row && uiState.reserveTargets[i].col === col) {
        return true;
      }
    }
    return false;
  }

  function isRecoverPieceTarget(row, col) {
    for (var i = 0; i < uiState.recoverPieceTargets.length; i += 1) {
      if (uiState.recoverPieceTargets[i].row === row && uiState.recoverPieceTargets[i].col === col) {
        return true;
      }
    }
    return false;
  }

  function isRecoverFragmentTarget(row, col) {
    for (var i = 0; i < uiState.recoverFragmentTargets.length; i += 1) {
      if (uiState.recoverFragmentTargets[i].row === row && uiState.recoverFragmentTargets[i].col === col) {
        return true;
      }
    }
    return false;
  }

  function isPendingFragmentPieceCell(row, col) {
    var pending = uiState.pendingFragmentPiece;
    var i;
    if (!pending) {
      return false;
    }
    for (i = 0; i < pending.cells.length; i += 1) {
      if (pending.cells[i].row === row && pending.cells[i].col === col) {
        return !uiState.state.board[row][col].pieceId;
      }
    }
    return false;
  }

  function canMovePiece(piece, row, col) {
    var rule = getMovementRule(piece.kind);
    var targetCell = getBoardCell(row, col);
    var targetPiece = targetCell && targetCell.pieceId ? getPiece(uiState.state, targetCell.pieceId) : null;
    var deltaRow;
    var deltaCol;
    var transformedVector;
    var i;
    if (!rule || !targetCell) {
      return false;
    }
    if (piece.row === row && piece.col === col) {
      return false;
    }
    if (targetPiece && targetPiece.owner === piece.owner) {
      return false;
    }
    if (!isTraversableCell(row, col)) {
      return false;
    }

    deltaRow = row - piece.row;
    deltaCol = col - piece.col;

    if (rule.kind === "step") {
      for (i = 0; i < rule.vectors.length; i += 1) {
        transformedVector = transformVectorForPiece(piece, rule.vectors[i]);
        if (transformedVector[0] === deltaRow && transformedVector[1] === deltaCol) {
          return canTraverseVector(piece, deltaRow, deltaCol);
        }
      }
      return false;
    }

    if (rule.kind === "jump") {
      return matchesTransformedVector(rule.vectors, piece, deltaRow, deltaCol);
    }

    if (rule.kind === "mixed") {
      if (matchesTransformedVector(rule.vectors, piece, deltaRow, deltaCol)) {
        return true;
      }
      return matchesTransformedVector(rule.jumpVectors || [], piece, deltaRow, deltaCol);
    }

    if (rule.kind === "ray") {
      return canRayMove(piece, row, col, rule.vectors);
    }

    if (rule.kind === "rayStep") {
      if (matchesTransformedVector(rule.vectors, piece, deltaRow, deltaCol)) {
        return true;
      }
      return canRayMove(piece, row, col, rule.rayVectors || []);
    }

    return false;
  }

  function canRayMove(piece, row, col, vectors) {
    for (var i = 0; i < vectors.length; i += 1) {
      var transformed = transformVectorForPiece(piece, vectors[i]);
      var stepRow = transformed[0];
      var stepCol = transformed[1];
      var currentRow = piece.row + stepRow;
      var currentCol = piece.col + stepCol;
      while (isInBounds(currentRow, currentCol)) {
        if (!isTraversableCell(currentRow, currentCol)) {
          break;
        }
        if (currentRow === row && currentCol === col) {
          return true;
        }
        if (uiState.state.board[currentRow][currentCol].pieceId) {
          break;
        }
        currentRow += stepRow;
        currentCol += stepCol;
      }
    }
    return false;
  }

  function transformVectorForPiece(piece, vector) {
    var forward = piece.owner === "P1" ? 1 : -1;
    return [vector[0], vector[1] * forward];
  }

  function matchesVector(vectors, deltaRow, deltaCol) {
    for (var i = 0; i < vectors.length; i += 1) {
      if (vectors[i][0] === deltaRow && vectors[i][1] === deltaCol) {
        return true;
      }
    }
    return false;
  }

  function matchesTransformedVector(vectors, piece, deltaRow, deltaCol) {
    for (var i = 0; i < vectors.length; i += 1) {
      var transformed = transformVectorForPiece(piece, vectors[i]);
      if (transformed[0] === deltaRow && transformed[1] === deltaCol) {
        return true;
      }
    }
    return false;
  }

  function canTraverseVector(piece, deltaRow, deltaCol) {
    var steps = Math.max(Math.abs(deltaRow), Math.abs(deltaCol));
    var stepRow;
    var stepCol;
    var index;
    var currentRow;
    var currentCol;
    if (steps <= 1) {
      return true;
    }
    if (deltaRow !== 0 && deltaCol !== 0 && Math.abs(deltaRow) !== Math.abs(deltaCol)) {
      return false;
    }
    stepRow = deltaRow === 0 ? 0 : deltaRow / Math.abs(deltaRow);
    stepCol = deltaCol === 0 ? 0 : deltaCol / Math.abs(deltaCol);
    currentRow = piece.row;
    currentCol = piece.col;
    for (index = 1; index < steps; index += 1) {
      currentRow += stepRow;
      currentCol += stepCol;
      if (!isTraversableCell(currentRow, currentCol)) {
        return false;
      }
      if (uiState.state.board[currentRow][currentCol].pieceId) {
        return false;
      }
    }
    return true;
  }

  function isTraversableCell(row, col) {
    var cell = getBoardCell(row, col);
    return !!cell && cell.controller !== null;
  }

  function getPieceLabel(pieceType) {
    return getPieceLabels()[pieceType] || pieceType;
  }

  function getPieceShortLabel(pieceType) {
    return getPieceShortLabels()[pieceType] || getPieceLabel(pieceType);
  }

  function getBoardCell(row, col) {
    if (!isInBounds(row, col)) {
      return null;
    }
    return uiState.state.board[row][col];
  }

  function isInBounds(row, col) {
    return row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS;
  }

  function pieceMatchesCell(pieceId, row, col) {
    var piece = getPiece(uiState.state, pieceId);
    return !!piece && piece.row === row && piece.col === col;
  }

  function tryReserveDrop(row, col) {
    var cell = uiState.state.board[row][col];
    if (cell.controller !== uiState.state.currentPlayer || cell.pieceId) {
      return;
    }
    var pieceType = uiState.selection.pieceType;
    if (uiState.state.players[uiState.state.currentPlayer].reserve[pieceType] <= 0) {
      return;
    }
    uiState.state.players[uiState.state.currentPlayer].reserve[pieceType] -= 1;
    addPiece(uiState.state, uiState.state.currentPlayer, pieceType, row, col);
    pushLog(PLAYER_LABELS[uiState.state.currentPlayer] + "\u304C " + getPieceLabel(pieceType) + " \u3092 (" + (row + 1) + ", " + (col + 1) + ") \u306B\u914D\u7F6E");
    endTurn();
  }

  function getLegalReserveTargets(player, pieceType) {
    var reserve = uiState.state.players[player].reserve[pieceType];
    var targets = [];
    var row;
    var col;
    if (!reserve || reserve <= 0) {
      return targets;
    }
    for (row = 0; row < BOARD_ROWS; row += 1) {
      for (col = 0; col < BOARD_COLS; col += 1) {
        if (uiState.state.board[row][col].controller === player && !uiState.state.board[row][col].pieceId) {
          targets.push({ row: row, col: col });
        }
      }
    }
    return targets;
  }

  function canMulligan() {
    return canStartUtilityAction() && uiState.state.players[uiState.state.currentPlayer].hand.length > 0;
  }

  function runMulligan() {
    if (!canMulligan()) {
      return;
    }
    if (els.confirmText) {
      els.confirmText.textContent = "\u624B\u672D\u3092\u5168\u3066\u5C71\u672D\u306B\u623B\u3057\u3001\u30B7\u30E3\u30C3\u30D5\u30EB\u3057\u3066 3 \u679A\u5F15\u304D\u76F4\u3057\u307E\u3059\u304B\uFF1F";
    }
    openPlacementConfirmAtCenter({ type: "mulligan" });
  }

  function commitMulligan() {
    var player = uiState.state.currentPlayer;
    var playerState;
    if (!canMulligan()) {
      hidePlacementConfirm();
      return;
    }
    playerState = uiState.state.players[player];
    playerState.deck = shuffle(playerState.deck.concat(playerState.hand));
    playerState.hand = [];
    fillHand(uiState.state, player);
    hidePlacementConfirm();
    pushLog(PLAYER_LABELS[player] + "\u304C\u624B\u672D\u3092\u5165\u308C\u66FF\u3048");
    endTurn();
  }

  function getRecoverablePieces() {
    var player = uiState.state.currentPlayer;
    var targets = [];
    if (!canStartUtilityAction()) {
      return targets;
    }
    Object.keys(uiState.state.players[player].pieces).forEach(function (pieceId) {
      var piece = uiState.state.players[player].pieces[pieceId];
      var cell;
      if (!piece || piece.kind === "king") {
        return;
      }
      cell = uiState.state.board[piece.row][piece.col];
      if (cell.controller === player) {
        targets.push({ row: piece.row, col: piece.col, pieceId: piece.id });
      }
    });
    return targets;
  }

  function beginRecoverPieceMode() {
    if (!canStartUtilityAction()) {
      return;
    }
    clearSelection();
    uiState.selection = { type: "recoverPiece" };
    uiState.recoverPieceTargets = getRecoverablePieces();
    render();
  }

  function tryRecoverPiece(row, col) {
    var player = uiState.state.currentPlayer;
    var targetPiece = uiState.state.board[row][col].pieceId ? getPiece(uiState.state, uiState.state.board[row][col].pieceId) : null;
    if (!targetPiece || targetPiece.owner !== player || targetPiece.kind === "king") {
      return;
    }
    if (uiState.state.board[row][col].controller !== player) {
      return;
    }
    delete uiState.state.players[player].pieces[targetPiece.id];
    uiState.state.board[row][col].pieceId = null;
    uiState.state.players[player].reserve[targetPiece.kind] += 1;
    pushLog(PLAYER_LABELS[player] + "\u304C " + getPieceLabel(targetPiece.kind) + " \u3092\u56DE\u53CE");
    endTurn();
  }

  function tryFragmentPlace(row, col, event) {
    if (!uiState.pendingAnchor) {
      updateFragmentPreview(row, col, true);
    }

    if ((isPreviewCell(row, col) || isPreviewBoundsCell(row, col)) && uiState.previewLegal) {
      var placementTarget = findFragmentTargetCell(uiState.previewCells.slice(), row, col);
      if (els.confirmText) {
        els.confirmText.textContent = "\u3053\u306E\u5F62\u3067\u6B20\u7247\u3092\u7F6E\u304D\u307E\u3059\u304B\uFF1F";
      }
      openPlacementConfirm(event ? event.clientX : 0, event ? event.clientY : 0, {
        type: "fragment",
        row: row,
        col: col
      });
      return;
    }

    updateFragmentPreview(row, col, true);
  }

  function commitFragmentPlacement(target) {
    if (!uiState.selection || uiState.selection.type !== "fragment" || !uiState.previewLegal) {
      return;
    }
    var card = uiState.selection.card;
    var cells = uiState.previewCells.slice();
    var placementId = "placement-" + (uiState.state.placements.length + 1);
    var placement;
    var j;
    hidePlacementConfirm();

    placement = {
      id: placementId,
      owner: uiState.state.currentPlayer,
      card: {
        fragmentType: card.fragmentType,
        pieceType: card.pieceType
      },
      cells: cells.map(function (cell) {
        return { row: cell.row, col: cell.col };
      })
    };
    uiState.state.placements.push(placement);

    for (j = 0; j < cells.length; j += 1) {
      var cell = uiState.state.board[cells[j].row][cells[j].col];
      cell.controller = uiState.state.currentPlayer;
      cell.stack.push(placementId);
    }

    uiState.state.players[uiState.state.currentPlayer].hand.splice(uiState.selection.handIndex, 1);
    fillHand(uiState.state, uiState.state.currentPlayer);
    uiState.pendingFragmentPiece = {
      pieceType: card.pieceType,
      cells: cells
    };
    if (window.UNFOLD_3D_RENDERER && typeof window.UNFOLD_3D_RENDERER.startFragmentUnfoldAnimation === "function") {
      window.UNFOLD_3D_RENDERER.startFragmentUnfoldAnimation(uiState.state.currentPlayer, cells, card.fragmentType, placementId);
    }
    uiState.selection = { type: "fragmentPiece", pieceType: card.pieceType };
    uiState.pendingAnchor = null;
    uiState.previewCells = [];
    uiState.previewLegal = false;
    pushLog(PLAYER_LABELS[uiState.state.currentPlayer] + "\u304C " + FRAGMENT_LIBRARY[card.fragmentType].label + " \u3092\u914D\u7F6E");
    render();
  }

  function tryFragmentPieceDrop(row, col, event) {
    if (!isPendingFragmentPieceCell(row, col)) {
      return;
    }
    if (els.confirmText) {
      els.confirmText.textContent = "\u3053\u306E\u30DE\u30B9\u306B\u5BFE\u5FDC\u99D2\u3092\u7F6E\u304D\u307E\u3059\u304B\uFF1F";
    }
    openPlacementConfirm(event ? event.clientX : 0, event ? event.clientY : 0, {
      type: "fragmentPiece",
      row: row,
      col: col
    });
  }

  function commitFragmentPiecePlacement(row, col) {
    var pending = uiState.pendingFragmentPiece;
    var pieceId;
    if (!pending || !isPendingFragmentPieceCell(row, col)) {
      hidePlacementConfirm();
      return;
    }
    pieceId = addPiece(uiState.state, uiState.state.currentPlayer, pending.pieceType, row, col);
    if (window.UNFOLD_3D_RENDERER && typeof window.UNFOLD_3D_RENDERER.startPiecePlacementAnimation === "function") {
      window.UNFOLD_3D_RENDERER.startPiecePlacementAnimation(pieceId, row, col);
    }
    pushLog(PLAYER_LABELS[uiState.state.currentPlayer] + "\u304C " + getPieceLabel(pending.pieceType) + " \u3092 (" + (row + 1) + ", " + (col + 1) + ") \u306B\u914D\u7F6E");
    hidePlacementConfirm();
    uiState.pendingFragmentPiece = null;
    endTurn();
  }

  function updateFragmentPreview(row, col, shouldRender) {
    var card = uiState.selection && uiState.selection.card;
    var preview = card ? getFragmentCells(card.fragmentType, uiState.rotation, { row: row, col: col }) : [];
    uiState.pendingAnchor = { row: row, col: col };
    uiState.previewCells = preview;
    uiState.previewLegal = card ? isLegalFragment(preview, uiState.state.currentPlayer) : false;
    if (shouldRender !== false) {
      render();
    } else {
      refreshBoardPreviewClasses();
      renderStatus();
      if (window.UNFOLD_3D_RENDERER && typeof window.UNFOLD_3D_RENDERER.renderScene === "function") {
        window.UNFOLD_3D_RENDERER.renderScene();
      }
    }
  }

  function getRecoverablePlacements() {
    var player = uiState.state.currentPlayer;
    var placements = [];
    if (!canStartUtilityAction()) {
      return placements;
    }
    if (uiState.state.players[player].hand.length >= HAND_LIMIT) {
      return placements;
    }
    uiState.state.placements.forEach(function (placement) {
      var recoverable = true;
      var index;
      var cell;
      if (!placement || placement.owner !== player) {
        return;
      }
      for (index = 0; index < placement.cells.length; index += 1) {
        cell = uiState.state.board[placement.cells[index].row][placement.cells[index].col];
        if (cell.pieceId) {
          recoverable = false;
          break;
        }
        if (!cell.stack.length || cell.stack[cell.stack.length - 1] !== placement.id) {
          recoverable = false;
          break;
        }
      }
      if (recoverable) {
        placements.push(placement);
      }
    });
    return placements;
  }

  function beginRecoverFragmentMode() {
    if (!canStartUtilityAction()) {
      return;
    }
    clearSelection();
    var targets = [];
    uiState.selection = { type: "recoverFragment" };
    getRecoverablePlacements().forEach(function (placement) {
      placement.cells.forEach(function (cell) {
        targets.push({ row: cell.row, col: cell.col });
      });
    });
    uiState.recoverFragmentTargets = targets;
    render();
  }

  function tryRecoverFragment(row, col) {
    var placement = findRecoverablePlacementAt(row, col);
    var player;
    if (!placement) {
      return;
    }
    player = uiState.state.currentPlayer;
    removePlacementFromBoard(placement);
    uiState.state.players[player].hand.push({
      fragmentType: placement.card.fragmentType,
      pieceType: placement.card.pieceType
    });
    pushLog(PLAYER_LABELS[player] + "\u304C " + FRAGMENT_LIBRARY[placement.card.fragmentType].label + " \u3092\u56DE\u53CE");
    endTurn();
  }

  function findRecoverablePlacementAt(row, col) {
    var placements = getRecoverablePlacements();
    var i;
    var j;
    for (i = 0; i < placements.length; i += 1) {
      for (j = 0; j < placements[i].cells.length; j += 1) {
        if (placements[i].cells[j].row === row && placements[i].cells[j].col === col) {
          return placements[i];
        }
      }
    }
    return null;
  }

  function removePlacementFromBoard(placement) {
    var index;
    var placementIndex;
    var cell;
    for (index = 0; index < placement.cells.length; index += 1) {
      cell = uiState.state.board[placement.cells[index].row][placement.cells[index].col];
      cell.stack = cell.stack.filter(function (stackId) {
        return stackId !== placement.id;
      });
      refreshCellController(cell);
    }
    placementIndex = uiState.state.placements.findIndex(function (entry) {
      return entry.id === placement.id;
    });
    if (placementIndex >= 0) {
      uiState.state.placements.splice(placementIndex, 1);
    }
  }

  function refreshCellController(cell) {
    var topPlacementId;
    var topPlacement;
    if (cell.stack.length) {
      topPlacementId = cell.stack[cell.stack.length - 1];
      topPlacement = findPlacementById(topPlacementId);
      cell.controller = topPlacement ? topPlacement.owner : null;
      return;
    }
    cell.controller = cell.baseOwner || null;
  }

  function findPlacementById(placementId) {
    for (var i = 0; i < uiState.state.placements.length; i += 1) {
      if (uiState.state.placements[i].id === placementId) {
        return uiState.state.placements[i];
      }
    }
    return null;
  }

  function findFragmentTargetCell(cells, preferredRow, preferredCol) {
    for (var i = 0; i < cells.length; i += 1) {
      if (cells[i].row === preferredRow && cells[i].col === preferredCol) {
        if (!uiState.state.board[preferredRow][preferredCol].pieceId) {
          return { row: preferredRow, col: preferredCol };
        }
      }
    }
    for (var j = 0; j < cells.length; j += 1) {
      if (!uiState.state.board[cells[j].row][cells[j].col].pieceId) {
        return { row: cells[j].row, col: cells[j].col };
      }
    }
    return null;
  }

  function isLegalFragment(cells, player) {
    var touches = false;
    for (var i = 0; i < cells.length; i += 1) {
      var row = cells[i].row;
      var col = cells[i].col;
      if (row < 0 || row >= BOARD_ROWS || col < 0 || col >= BOARD_COLS) {
        return false;
      }
      var cell = uiState.state.board[row][col];
      if (cell.controller === player) {
        return false;
      }
      var piece = cell.pieceId ? getPiece(uiState.state, cell.pieceId) : null;
      if (piece && piece.owner !== player) {
        return false;
      }
      var dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (var d = 0; d < dirs.length; d += 1) {
        var nr = row + dirs[d][0];
        var nc = col + dirs[d][1];
        if (nr >= 0 && nr < BOARD_ROWS && nc >= 0 && nc < BOARD_COLS) {
          if (uiState.state.board[nr][nc].controller === player) {
            touches = true;
          }
        }
      }
    }
    return touches;
  }

  function getFragmentCells(fragmentType, rotation, anchor) {
    var shape = FRAGMENT_LIBRARY[fragmentType].cells.slice();
    var rotated = shape.map(function (cell) { return [cell[0], cell[1]]; });
    for (var r = 0; r < rotation; r += 1) {
      rotated = rotated.map(function (cell) {
        return [cell[1], -cell[0]];
      });
    }
    var minRow = Infinity;
    var minCol = Infinity;
    for (var i = 0; i < rotated.length; i += 1) {
      minRow = Math.min(minRow, rotated[i][0]);
      minCol = Math.min(minCol, rotated[i][1]);
    }
    return rotated.map(function (cell) {
      return { row: anchor.row + cell[0] - minRow, col: anchor.col + cell[1] - minCol };
    });
  }

  function isPreviewCell(row, col) {
    for (var i = 0; i < uiState.previewCells.length; i += 1) {
      if (uiState.previewCells[i].row === row && uiState.previewCells[i].col === col) {
        return true;
      }
    }
    return false;
  }

  function isPreviewBoundsCell(row, col) {
    if (!uiState.previewCells.length) {
      return false;
    }
    var minRow = uiState.previewCells[0].row;
    var maxRow = uiState.previewCells[0].row;
    var minCol = uiState.previewCells[0].col;
    var maxCol = uiState.previewCells[0].col;
    for (var i = 1; i < uiState.previewCells.length; i += 1) {
      minRow = Math.min(minRow, uiState.previewCells[i].row);
      maxRow = Math.max(maxRow, uiState.previewCells[i].row);
      minCol = Math.min(minCol, uiState.previewCells[i].col);
      maxCol = Math.max(maxCol, uiState.previewCells[i].col);
    }
    return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
  }

  function getFragmentPreviewText(fragmentType) {
    var cells = FRAGMENT_LIBRARY[fragmentType].cells.slice();
    var maxRow = 0;
    var maxCol = 0;
    for (var i = 0; i < cells.length; i += 1) {
      maxRow = Math.max(maxRow, cells[i][0]);
      maxCol = Math.max(maxCol, cells[i][1]);
    }
    var rows = [];
    for (var row = 0; row <= maxRow; row += 1) {
      var line = "";
      for (var col = 0; col <= maxCol; col += 1) {
        line += hasShapeCell(cells, row, col) ? "\u25A0" : "\u25A1";
      }
      rows.push(line);
    }
    return rows.join("\n");
  }

  function hasShapeCell(cells, row, col) {
    for (var i = 0; i < cells.length; i += 1) {
      if (cells[i][0] === row && cells[i][1] === col) {
        return true;
      }
    }
    return false;
  }

  function endTurn() {
    checkBaseOccupationWin();
    if (!uiState.state.winner) {
      uiState.state.currentPlayer = uiState.state.currentPlayer === "P1" ? "P2" : "P1";
      uiState.state.turnNumber += 1;
    }
    recordHistorySnapshot(uiState.state, uiState.lastActionText || "手番終了");
    uiState.lastActionText = "";
    uiState.replayIndex = uiState.state.history.length - 1;
    clearSelection();
    render();
    if (isOnlineGame()) {
      pushRoomState();
    }
  }

  function checkBaseOccupationWin() {
    var players = ["P1", "P2"];
    for (var i = 0; i < players.length; i += 1) {
      var attacker = players[i];
      var defender = attacker === "P1" ? "P2" : "P1";
      var center = findBaseCenter(defender);
      var occupyingPiece = center && center.pieceId ? getPiece(uiState.state, center.pieceId) : null;
      if (
        center &&
        center.controller === attacker &&
        (!occupyingPiece || occupyingPiece.owner !== defender)
      ) {
        uiState.state.winner = attacker;
        uiState.state.winReason = "\u672C\u9663\u5360\u9818";
        pushLog(PLAYER_LABELS[attacker] + "\u304C\u76F8\u624B\u306E\u672C\u9663\u4E2D\u592E\u3092\u652F\u914D");
        return attacker;
      }
    }
    return null;
  }

  function findBaseCenter(player) {
    for (var row = 0; row < BOARD_ROWS; row += 1) {
      for (var col = 0; col < BOARD_COLS; col += 1) {
        var cell = uiState.state.board[row][col];
        if (cell.isBaseCenter && cell.baseOwner === player) {
          return cell;
        }
      }
    }
    return null;
  }

  function pushLog(text) {
    uiState.state.actionLog.unshift(text);
    uiState.state.actionLog = uiState.state.actionLog.slice(0, 12);
    uiState.lastActionText = text;
  }

  function getModeText() {
    if (!uiState.selection) {
      return "\u672A\u9078\u629E";
    }
    if (uiState.pendingFragmentPiece) {
      return "\u7D44\u307F\u5408\u308F\u305B\u99D2\u3092\u914D\u7F6E\u4E2D";
    }
    if (uiState.selection.type === "recoverPiece") {
      return "\u99D2\u3092\u56DE\u53CE\u4E2D";
    }
    if (uiState.selection.type === "recoverFragment") {
      return "\u5C55\u958B\u56F3\u3092\u56DE\u53CE\u4E2D";
    }
    if (uiState.selection.type === "piece") {
      return "\u99D2\u3092\u79FB\u52D5\u4E2D";
    }
    if (uiState.selection.type === "reserve") {
      return "\u6301\u3061\u99D2\u3092\u914D\u7F6E\u4E2D";
    }
    if (uiState.pendingAnchor) {
      return uiState.previewLegal ? "\u6B20\u7247\u3092\u78BA\u8A8D\u4E2D" : "\u6B20\u7247\u306E\u7F6E\u304D\u5834\u3092\u8ABF\u6574\u4E2D";
    }
    return "\u6B20\u7247\u914D\u7F6E\u4E2D";
  }

  function getMessageText() {
    if (isOnlineGame() && uiState.online.waitRequest) {
      if (uiState.online.waitRequest.requestedTo === uiState.online.side) {
        return "相手から待った申請が届いています。承認すると 1 手戻ります。";
      }
      if (uiState.online.waitRequest.requestedBy === uiState.online.side) {
        return "待った申請中です。相手の返答を待っています。";
      }
    }
    if (uiState.state.winner) {
      return PLAYER_LABELS[uiState.state.winner] + "\u306E\u52DD\u3061\u3067\u3059\u3002";
    }
    if (uiState.pendingFragmentPiece) {
      return "\u4ECA\u7F6E\u3044\u305F\u6B20\u7247\u306E\u4E2D\u304B\u3089\u3001" + getPieceLabel(uiState.pendingFragmentPiece.pieceType) + "\u3092\u7F6E\u304F\u30DE\u30B9\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044\u3002";
    }
    if (!uiState.selection) {
      return "\u99D2\u3092\u52D5\u304B\u3059\u304B\u3001\u6301\u3061\u99D2\u3092\u6253\u3064\u304B\u3001\u624B\u672D\u306E\u6B20\u7247\u3092\u914D\u7F6E\u3057\u3066\u304F\u3060\u3055\u3044\u3002";
    }
    if (uiState.selection.type === "piece") {
      return "\u79FB\u52D5\u5148\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u3066\u304F\u3060\u3055\u3044\u3002\u901A\u5E38\u79FB\u52D5\u306F\u9023\u7D9A\u3057\u305F\u5C55\u958B\u56F3\u306E\u4E0A\u3060\u3051\u3067\u3059\u3002";
    }
    if (uiState.selection.type === "recoverPiece") {
      return "\u6A59\u306E\u67A0\u3067\u8868\u793A\u3055\u308C\u305F\u81EA\u99D2\u3092\u9078\u3076\u3068\u3001\u6301\u99D2\u3068\u3057\u3066\u56DE\u53CE\u3057\u307E\u3059\u3002";
    }
    if (uiState.selection.type === "recoverFragment") {
      return "\u7D2B\u306E\u67A0\u3067\u8868\u793A\u3055\u308C\u305F\u5C55\u958B\u56F3\u3092\u9078\u3076\u3068\u3001\u624B\u672D\u306B\u623B\u3057\u307E\u3059\u3002";
    }
    if (uiState.selection.type === "reserve") {
      return getPieceLabel(uiState.selection.pieceType) + " \u3092\u6253\u3066\u308B\u30DE\u30B9\u3092\u9752\u3044\u30DE\u30FC\u30AB\u30FC\u3067\u8868\u793A\u3057\u3066\u3044\u307E\u3059\u3002";
    }
    if (uiState.pendingAnchor) {
      if (uiState.previewLegal) {
        return "\u6B20\u7247\u304C\u30AB\u30FC\u30BD\u30EB\u306B\u8FFD\u5F93\u3057\u3066\u8868\u793A\u3055\u308C\u3066\u3044\u307E\u3059\u3002\u3053\u306E\u4F4D\u7F6E\u3067\u826F\u3051\u308C\u3070\u3001\u7BC4\u56F2\u5185\u306E\u30DE\u30B9\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u3066\u78BA\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002";
      }
      return "\u8D64\u3044\u67A0\u306F\u307E\u3060\u7F6E\u3051\u306A\u3044\u5F62\u3067\u3059\u3002\u5C55\u958B\u56F3\u304C\u81EA\u9663\u306B\u63A5\u3059\u308B\u4F4D\u7F6E\u307E\u3067\u30AB\u30FC\u30BD\u30EB\u3092\u52D5\u304B\u3057\u3066\u304F\u3060\u3055\u3044\u3002";
    }
    return "\u6B20\u7247\u3092\u9078\u3093\u3060\u3089\u3001\u76E4\u4E0A\u306B\u30AB\u30FC\u30BD\u30EB\u3092\u5408\u308F\u305B\u3066\u5F62\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002";
  }

  function runTests() {
    return "OK: \u65B0\u3057\u3044\u5BFE\u5C40\u3092\u59CB\u3081\u308B\nOK: \u76E4\u9762\u8868\u793A\nOK: \u6301\u3061\u99D2\u30FB\u624B\u672D\u8868\u793A\nOK: " + GAME_MODE_LABELS[getCurrentRuleMode()] + " \u306E\u79FB\u52D5\u30EB\u30FC\u30EB\u3092\u8868\u793A";
  }

  function apiRequest(url, options) {
    return fetch(url, options).then(function (response) {
      return response.json().then(function (data) {
        if (!response.ok || !data.ok) {
          throw new Error(data && data.error ? data.error : "Request failed");
        }
        return data;
      });
    });
  }

  function buildApiUrl(action, roomId) {
    var url = "api.php?action=" + encodeURIComponent(action);
    if (roomId) {
      url += "&roomId=" + encodeURIComponent(roomId);
    }
    return url;
  }

  function cloneGameState(state) {
    return JSON.parse(JSON.stringify(state));
  }

  function snapshotGameState(state) {
    var snapshot = cloneGameState(state);
    snapshot.history = [];
    return snapshot;
  }

  function recordHistorySnapshot(state, label) {
    if (!state.history) {
      state.history = [];
    }
    state.history.push({
      turnNumber: state.turnNumber,
      currentPlayer: state.currentPlayer,
      label: label,
      snapshot: snapshotGameState(state)
    });
  }

  function getHistoryEntries() {
    return uiState.state && uiState.state.history ? uiState.state.history : [];
  }

  function canUseWait() {
    return !uiState.pendingFragmentPiece && !uiState.selection && !uiState.state.winner && getHistoryEntries().length > 1;
  }

  function restorePreviousTurn() {
    var history = getHistoryEntries();
    var restored;
    if (history.length <= 1) {
      return false;
    }
    restored = cloneGameState(history[history.length - 2].snapshot);
    restored.history = cloneGameState(history.slice(0, history.length - 1));
    uiState.state = restored;
    uiState.replayIndex = -1;
    clearSelection();
    render();
    return true;
  }

  function applyOnlineRoom(room, playerId, side) {
    stopRoomPolling();
    uiState.online.enabled = true;
    uiState.online.roomId = room.id;
    uiState.online.playerId = playerId;
    uiState.online.side = side;
    uiState.online.roomStatus = room.status || (room.players && room.players.P2 && room.players.P2.id ? "playing" : "waiting");
    uiState.online.waitRequest = room.waitRequest || null;
    uiState.online.version = room.version;
    uiState.ruleMode = room.gameState.ruleMode || uiState.ruleMode || "original";
    uiState.state = room.gameState;
    uiState.replayIndex = uiState.state.history ? uiState.state.history.length - 1 : -1;
    clearSelection();
    scheduleRoomPolling();
    render();
  }

  function resetOnlineState(message) {
    stopRoomPolling();
    uiState.online.enabled = false;
    uiState.online.roomId = null;
    uiState.online.playerId = null;
    uiState.online.side = null;
    uiState.online.roomStatus = "offline";
    uiState.online.waitRequest = null;
    uiState.online.version = 0;
    uiState.online.syncing = false;
    if (message) {
      uiState.state = createGame(uiState.ruleMode);
      clearSelection();
      pushLog(message);
    }
    render();
  }

  function scheduleRoomPolling() {
    stopRoomPolling();
    uiState.online.pollTimer = window.setInterval(function () {
      pollRoomState(false);
    }, 2000);
  }

  function stopRoomPolling() {
    if (uiState.online.pollTimer) {
      window.clearInterval(uiState.online.pollTimer);
      uiState.online.pollTimer = null;
    }
  }

  function pollRoomState(forceRender) {
    if (!isOnlineGame()) {
      return Promise.resolve();
    }
    return apiRequest(buildApiUrl("room.get", uiState.online.roomId) + "&playerId=" + encodeURIComponent(uiState.online.playerId), {
      method: "GET"
    }).then(function (data) {
      uiState.online.version = data.room.version;
      uiState.online.roomStatus = data.room.status || uiState.online.roomStatus;
      uiState.online.waitRequest = data.room.waitRequest || null;
      uiState.ruleMode = data.room.gameState.ruleMode || uiState.ruleMode;
      uiState.state = data.room.gameState;
      clearSelection();
      if (forceRender !== false) {
        render();
      }
    }).catch(function (error) {
      if (/Room not found|Player is not in this room/.test(error.message)) {
        resetOnlineState("驛ｨ螻九′髢峨§繧峨ｌ縺溘◆繧√が繝ｳ繝ｩ繧､繝ｳ蟇ｾ謌ｦ繧堤ｵゆｺ・＠縺ｾ縺励◆");
        return;
      }
      if (els.testOutput) {
        els.testOutput.textContent = "SYNC ERROR\n" + error.message;
      }
    });
  }

  function pushRoomState() {
    if (!isOnlineGame() || uiState.online.syncing) {
      return;
    }
    uiState.online.syncing = true;
    apiRequest(buildApiUrl("room.state", uiState.online.roomId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerId: uiState.online.playerId,
        version: uiState.online.version,
        gameState: cloneGameState(uiState.state)
      })
    }).then(function (data) {
      uiState.online.version = data.room.version;
      uiState.online.roomStatus = data.room.status || uiState.online.roomStatus;
      uiState.online.waitRequest = data.room.waitRequest || null;
      uiState.state = data.room.gameState;
      uiState.ruleMode = data.room.gameState.ruleMode || uiState.ruleMode;
      render();
    }).catch(function (error) {
      if (/Room not found|Player is not in this room/.test(error.message)) {
        resetOnlineState("驛ｨ螻九′髢峨§繧峨ｌ縺溘◆繧√が繝ｳ繝ｩ繧､繝ｳ蟇ｾ謌ｦ繧堤ｵゆｺ・＠縺ｾ縺励◆");
        return;
      }
      if (els.testOutput) {
        els.testOutput.textContent = "SYNC ERROR\n" + error.message;
      }
      return pollRoomState(true);
    }).finally(function () {
      uiState.online.syncing = false;
    });
  }

  function createOnlineRoom() {
    var mode = els.onlineModeSelect ? els.onlineModeSelect.value : getCurrentRuleMode();
    var localState = createGame(mode);
    uiState.ruleMode = mode;
    return apiRequest(buildApiUrl("room.create"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: getOnlinePlayerName(),
        ruleMode: mode,
        gameState: localState
      })
    }).then(function (data) {
      applyOnlineRoom(data.room, data.playerId, data.side);
      pushLog("繧ｪ繝ｳ繝ｩ繧､繝ｳ蟇ｾ謌ｦ縺ｮ驛ｨ螻・" + data.room.id + " 繧剃ｽ懈・");
    }).catch(function (error) {
      if (els.testOutput) {
        els.testOutput.textContent = "ROOM ERROR\n" + error.message;
      }
    });
  }

  function joinOnlineRoom() {
    var roomId = els.onlineRoomInput ? els.onlineRoomInput.value.trim().toUpperCase() : "";
    if (!roomId) {
      if (els.testOutput) {
        els.testOutput.textContent = "ROOM ERROR\n部屋コードを入力してください。";
      }
      return Promise.resolve();
    }
    return apiRequest(buildApiUrl("room.join"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: roomId,
        name: getOnlinePlayerName()
      })
    }).then(function (data) {
      applyOnlineRoom(data.room, data.playerId, data.side);
      pushLog("繧ｪ繝ｳ繝ｩ繧､繝ｳ蟇ｾ謌ｦ縺ｮ驛ｨ螻・" + data.room.id + " 縺ｫ蜿ょ刈");
    }).catch(function (error) {
      if (els.testOutput) {
        els.testOutput.textContent = "ROOM ERROR\n" + error.message;
      }
    });
  }

  function leaveOnlineRoom() {
    if (!isOnlineGame()) {
      return Promise.resolve();
    }
    return apiRequest(buildApiUrl("room.leave", uiState.online.roomId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: uiState.online.roomId,
        playerId: uiState.online.playerId
      })
    }).then(function (data) {
      resetOnlineState(data.message || "オンライン対戦を終了しました");
    }).catch(function (error) {
      if (/Room not found|Player is not in this room/.test(error.message)) {
        resetOnlineState("部屋はすでに閉じられています");
        return;
      }
      if (els.testOutput) {
        els.testOutput.textContent = "ROOM ERROR\n" + error.message;
      }
    });
  }

  function disbandOnlineRoom() {
    if (!isOnlineGame() || uiState.online.side !== "P1") {
      return Promise.resolve();
    }
    return apiRequest(buildApiUrl("room.disband", uiState.online.roomId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: uiState.online.roomId,
        playerId: uiState.online.playerId
      })
    }).then(function (data) {
      resetOnlineState(data.message || "部屋を解散しました");
    }).catch(function (error) {
      if (/Room not found|Player is not in this room/.test(error.message)) {
        resetOnlineState("部屋はすでに閉じられています");
        return;
      }
      if (els.testOutput) {
        els.testOutput.textContent = "ROOM ERROR\n" + error.message;
      }
    });
  }

  function requestWait() {
    if (!canUseWait()) {
      return Promise.resolve();
    }
    if (!isOnlineGame()) {
      if (restorePreviousTurn()) {
        pushLog("待ったで 1 手戻しました");
        render();
      }
      return Promise.resolve();
    }
    return apiRequest(buildApiUrl("room.wait.request", uiState.online.roomId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: uiState.online.roomId,
        playerId: uiState.online.playerId
      })
    }).then(function (data) {
      uiState.online.waitRequest = data.room.waitRequest || null;
      uiState.online.version = data.room.version;
      render();
    }).catch(function (error) {
      if (els.testOutput) {
        els.testOutput.textContent = "WAIT ERROR\n" + error.message;
      }
    });
  }

  function respondWait(approved) {
    if (!isOnlineGame() || !uiState.online.waitRequest) {
      return Promise.resolve();
    }
    return apiRequest(buildApiUrl("room.wait.respond", uiState.online.roomId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: uiState.online.roomId,
        playerId: uiState.online.playerId,
        approved: !!approved
      })
    }).then(function (data) {
      applyOnlineRoom(data.room, uiState.online.playerId, uiState.online.side);
    }).catch(function (error) {
      if (els.testOutput) {
        els.testOutput.textContent = "WAIT ERROR\n" + error.message;
      }
    });
  }

  function init() {
    uiState.state = createGame(uiState.ruleMode);
    uiState.replayIndex = uiState.state.history.length - 1;

    els.newGameBtn.addEventListener("click", function () {
      uiState.state = createGame(uiState.ruleMode);
      uiState.replayIndex = uiState.state.history.length - 1;
      clearSelection();
      pushLog("新しい対局を始めました");
      render();
    });

    els.runTestsBtn.addEventListener("click", function () {
      els.testOutput.textContent = runTests();
    });

    if (els.toggleModeBtn) {
      els.toggleModeBtn.addEventListener("click", function () {
        uiState.ruleMode = getCurrentRuleMode() === "original" ? "shogi" : "original";
        uiState.state = createGame(uiState.ruleMode);
        uiState.replayIndex = uiState.state.history.length - 1;
        clearSelection();
        pushLog(GAME_MODE_LABELS[getCurrentRuleMode()] + " モードに切り替え");
        render();
      });
    }

    if (els.onlineModeSelect) {
      els.onlineModeSelect.value = getCurrentRuleMode();
      els.onlineModeSelect.addEventListener("change", function () {
        if (!isOnlineGame()) {
          uiState.ruleMode = els.onlineModeSelect.value;
          uiState.state = createGame(uiState.ruleMode);
          uiState.replayIndex = uiState.state.history.length - 1;
          clearSelection();
          render();
        }
      });
    }

    if (els.createRoomBtn) {
      els.createRoomBtn.addEventListener("click", function () {
        createOnlineRoom();
      });
    }
    if (els.joinRoomBtn) {
      els.joinRoomBtn.addEventListener("click", function () {
        joinOnlineRoom();
      });
    }
    if (els.leaveRoomBtn) {
      els.leaveRoomBtn.addEventListener("click", function () {
        if (!window.confirm("この部屋から退出しますか？")) {
          return;
        }
        leaveOnlineRoom();
      });
    }
    if (els.disbandRoomBtn) {
      els.disbandRoomBtn.addEventListener("click", function () {
        if (!window.confirm("部屋を解散しますか？ 相手も対戦を続けられなくなります。")) {
          return;
        }
        disbandOnlineRoom();
      });
    }
    if (els.waitBtn) {
      els.waitBtn.addEventListener("click", function () {
        requestWait();
      });
    }
    if (els.waitApproveBtn) {
      els.waitApproveBtn.addEventListener("click", function () {
        respondWait(true);
      });
    }
    if (els.waitRejectBtn) {
      els.waitRejectBtn.addEventListener("click", function () {
        respondWait(false);
      });
    }
    if (els.historyPrevBtn) {
      els.historyPrevBtn.addEventListener("click", function () {
        uiState.replayIndex = Math.max(0, uiState.replayIndex - 1);
        renderHistoryPanel();
      });
    }
    if (els.historyNextBtn) {
      els.historyNextBtn.addEventListener("click", function () {
        uiState.replayIndex = Math.min(getHistoryEntries().length - 1, uiState.replayIndex + 1);
        renderHistoryPanel();
      });
    }

    els.contextCancelBtn.addEventListener("click", function () {
      clearSelection();
      render();
    });

    els.contextRotateBtn.addEventListener("click", function () {
      if (uiState.selection && uiState.selection.type === "fragment") {
        uiState.rotation = (uiState.rotation + 1) % 4;
        hideContextMenu();
        hidePlacementConfirm();
        if (uiState.pendingAnchor) {
          updateFragmentPreview(uiState.pendingAnchor.row, uiState.pendingAnchor.col, true);
          return;
        }
        render();
      }
    });

    if (els.board) {
      els.board.addEventListener("contextmenu", function (event) {
        event.preventDefault();
        openContextMenu(event.clientX, event.clientY);
      });

      els.board.addEventListener("click", function () {
        hideContextMenu();
      });
    }

    els.confirmPlaceBtn.addEventListener("click", function () {
      if (uiState.pendingPlacement) {
        if (uiState.pendingPlacement.type === "mulligan") {
          commitMulligan();
        } else if (uiState.pendingPlacement.type === "move") {
          commitMove(uiState.pendingPlacement.pieceId, uiState.pendingPlacement.row, uiState.pendingPlacement.col);
        } else if (uiState.pendingPlacement.type === "fragmentPiece") {
          commitFragmentPiecePlacement(uiState.pendingPlacement.row, uiState.pendingPlacement.col);
        } else {
          commitFragmentPlacement(uiState.pendingPlacement);
        }
      }
    });

    els.cancelPlaceBtn.addEventListener("click", function () {
      hidePlacementConfirm();
      renderStatus();
    });

    document.addEventListener("click", function (event) {
      if (!uiState.contextMenuOpen) {
      } else if (!(els.contextMenu && els.contextMenu.contains(event.target))) {
        hideContextMenu();
      }
      var anchor = getBoardAnchorElement();
      if (
        els.placementConfirm &&
        !els.placementConfirm.hidden &&
        !(els.placementConfirm.contains(event.target)) &&
        !(anchor && anchor.contains(event.target))
      ) {
        hidePlacementConfirm();
      }
    });

    els.p1MulliganBtn.addEventListener("click", function () {
      if (uiState.state.currentPlayer === "P1") {
        runMulligan();
      }
    });
    els.p2MulliganBtn.addEventListener("click", function () {
      if (uiState.state.currentPlayer === "P2") {
        runMulligan();
      }
    });

    els.p1RecoverPieceBtn.addEventListener("click", function () {
      if (uiState.state.currentPlayer !== "P1") {
        return;
      }
      if (uiState.selection && uiState.selection.type === "recoverPiece") {
        clearSelection();
        render();
        return;
      }
      beginRecoverPieceMode();
    });
    els.p2RecoverPieceBtn.addEventListener("click", function () {
      if (uiState.state.currentPlayer !== "P2") {
        return;
      }
      if (uiState.selection && uiState.selection.type === "recoverPiece") {
        clearSelection();
        render();
        return;
      }
      beginRecoverPieceMode();
    });

    els.p1RecoverFragmentBtn.addEventListener("click", function () {
      if (uiState.state.currentPlayer !== "P1") {
        return;
      }
      if (uiState.selection && uiState.selection.type === "recoverPiece") {
        clearSelection();
        render();
        return;
      }
      if (uiState.selection && uiState.selection.type === "recoverFragment") {
        clearSelection();
        render();
        return;
      }
      beginRecoverFragmentMode();
    });
    els.p2RecoverFragmentBtn.addEventListener("click", function () {
      if (uiState.state.currentPlayer !== "P2") {
        return;
      }
      if (uiState.selection && uiState.selection.type === "recoverFragment") {
        clearSelection();
        render();
        return;
      }
      beginRecoverFragmentMode();
    });

    els.testOutput.textContent = runTests();
    window.UNFOLD_3D_API = {
      boardRows: BOARD_ROWS,
      boardCols: BOARD_COLS,
      getState: function () {
        return uiState.state;
      },
      getUiState: function () {
        return uiState;
      },
      getPieceById: function (pieceId) {
        return getPiece(uiState.state, pieceId);
      },
      getPlacementById: findPlacementById,
      getPieceLabel: getPieceLabel,
      getPieceShortLabel: getPieceShortLabel,
      isMoveTarget: isMoveTarget,
      isReserveTarget: isReserveTarget,
      isRecoverPieceTarget: isRecoverPieceTarget,
      isRecoverFragmentTarget: isRecoverFragmentTarget,
      isPendingFragmentPieceCell: isPendingFragmentPieceCell,
      isPreviewCell: isPreviewCell,
      handleCellClick: handleBoardCellAction,
      handleCellHover: handleBoardCellHover,
      openContextMenu: openContextMenu,
      hideContextMenu: hideContextMenu,
      clearSelection: clearSelection,
      hasSelection: function () {
        return !!uiState.selection;
      }
    };
    render();
    window.__UNFOLD_BOOTED = true;
  }

  try {
    init();
  } catch (error) {
    els.messageLabel.textContent = "\u521D\u671F\u5316\u30A8\u30E9\u30FC: " + error.message;
    els.testOutput.textContent = "INIT ERROR\n" + (error.stack || error.message);
  }
})();
