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
  var SHOGI_STARTER_DECK = STARTER_DECK.map(function (card) {
    if (card.pieceType === "realmKnight") {
      return { fragmentType: card.fragmentType, pieceType: "guard" };
    }
    return { fragmentType: card.fragmentType, pieceType: card.pieceType };
  });
  var BOARD_ROWS = 9;
  var BOARD_COLS = 15;
  var HAND_LIMIT = 3;

  var els = {
    lobbyView: document.getElementById("lobbyView"),
    gameView: document.getElementById("gameView"),
    sceneViewport: document.getElementById("sceneViewport"),
    board: document.getElementById("board"),
    matchTitle: document.getElementById("matchTitle"),
    matchMeta: document.getElementById("matchMeta"),
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
    toggleAiDebugBtn: document.getElementById("toggleAiDebugBtn"),
    aiDebugStatus: document.getElementById("aiDebugStatus"),
    p1Panel: document.getElementById("p1Panel"),
    p2Panel: document.getElementById("p2Panel"),
    newGameBtn: document.getElementById("newGameBtn"),
    newGameShogiBtn: document.getElementById("newGameShogiBtn"),
    npcGameBtn: document.getElementById("npcGameBtn"),
    npcGameShogiBtn: document.getElementById("npcGameShogiBtn"),
    backToLobbyBtn: document.getElementById("backToLobbyBtn"),
    startMatchBtn: document.getElementById("startMatchBtn"),
    practiceRestartBtn: document.getElementById("practiceRestartBtn"),
    practiceModeBtn: document.getElementById("practiceModeBtn"),
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
    p1WaitBtn: document.getElementById("p1WaitBtn"),
    p2MulliganBtn: document.getElementById("p2MulliganBtn"),
    p2RecoverPieceBtn: document.getElementById("p2RecoverPieceBtn"),
    p2RecoverFragmentBtn: document.getElementById("p2RecoverFragmentBtn"),
    p2WaitBtn: document.getElementById("p2WaitBtn"),
    toggleModeBtn: document.getElementById("toggleModeBtn"),
    onlineRoomNameInput: document.getElementById("onlineRoomNameInput"),
    onlineNameInput: document.getElementById("onlineNameInput"),
    onlineModeSelect: document.getElementById("onlineModeSelect"),
    onlineRoomPasswordInput: document.getElementById("onlineRoomPasswordInput"),
    onlineRoomInput: document.getElementById("onlineRoomInput"),
    createRoomBtn: document.getElementById("createRoomBtn"),
    joinRoomBtn: document.getElementById("joinRoomBtn"),
    refreshRoomsBtn: document.getElementById("refreshRoomsBtn"),
    deleteRoomCodeInput: document.getElementById("deleteRoomCodeInput"),
    deleteRoomKeyInput: document.getElementById("deleteRoomKeyInput"),
    deleteRoomByKeyBtn: document.getElementById("deleteRoomByKeyBtn"),
    lobbyNotice: document.getElementById("lobbyNotice"),
    roomList: document.getElementById("roomList"),
    accessCountLabel: document.getElementById("accessCountLabel"),
    accessTotalLabel: document.getElementById("accessTotalLabel"),
    accessTodayLabel: document.getElementById("accessTodayLabel"),
    accessYesterdayLabel: document.getElementById("accessYesterdayLabel"),
    accessCountSubtleLabel: document.getElementById("accessCountSubtleLabel"),
    accessUpdatedLabel: document.getElementById("accessUpdatedLabel"),
    feedbackInput: document.getElementById("feedbackInput"),
    submitFeedbackBtn: document.getElementById("submitFeedbackBtn"),
    refreshFeedbackBtn: document.getElementById("refreshFeedbackBtn"),
    feedbackStatus: document.getElementById("feedbackStatus"),
    feedbackList: document.getElementById("feedbackList"),
    leaveRoomBtn: document.getElementById("leaveRoomBtn"),
    disbandRoomBtn: document.getElementById("disbandRoomBtn"),
    onlineStatus: document.getElementById("onlineStatus"),
      onlineSideLabel: document.getElementById("onlineSideLabel"),
      matchRoomCode: document.getElementById("matchRoomCode"),
      matchPlayers: document.getElementById("matchPlayers"),
      matchAdminKey: document.getElementById("matchAdminKey"),
      p1NameLabel: document.getElementById("p1NameLabel"),
      p2NameLabel: document.getElementById("p2NameLabel"),
      historyCard: document.getElementById("historyCard"),
      historyTitle: document.getElementById("historyTitle"),
      historyBoard: document.getElementById("historyBoard"),
      historyList: document.getElementById("historyList"),
      historyPrevBtn: document.getElementById("historyPrevBtn"),
      historyNextBtn: document.getElementById("historyNextBtn")
    };

  var uiState = {
    state: null,
    screen: "lobby",
    practiceMode: false,
    npc: {
      enabled: false,
      side: "P2",
      thinking: false,
      timer: null
    },
    ruleMode: "original",
    lobbyRooms: [],
    roomAdminKeys: {},
    online: {
        enabled: false,
        roomId: null,
        roomName: null,
        playerId: null,
        side: null,
        room: null,
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
    pendingFragmentPiece: null,
    aiDebug: {
      mode: "off",
      targetPlayer: null,
      overlay: null,
      cacheKey: ""
    }
  };

  function createGame(mode) {
    var ruleMode = mode || uiState.ruleMode || "original";
    var supportPiece = ruleMode === "shogi" ? "flanker" : "realmKnight";
    var guardPiece = "guard";
    var state = {
      board: [],
      ruleMode: ruleMode,
      currentPlayer: "P1",
      winner: null,
      winReason: null,
      turnNumber: 1,
      actionLog: [],
      history: [],
      placements: [],
      players: {
        P1: createPlayer("P1", ruleMode),
        P2: createPlayer("P2", ruleMode)
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
    addPiece(state, "P1", supportPiece, 3, 2);
    addPiece(state, "P2", supportPiece, 5, 12);
    addPiece(state, "P1", guardPiece, 5, 2);
    addPiece(state, "P2", guardPiece, 3, 12);
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

  function restoreStoredOnlineName() {
    if (!els.onlineNameInput) {
      return;
    }
    var savedName = loadOnlineName();
    if (savedName) {
      els.onlineNameInput.value = savedName;
    }
  }

  function getOnlineRoomName() {
    if (!els.onlineRoomNameInput || !els.onlineRoomNameInput.value.trim()) {
      return "";
    }
    return els.onlineRoomNameInput.value.trim();
  }

  function getLobbyPassword() {
    return els.onlineRoomPasswordInput ? els.onlineRoomPasswordInput.value.trim() : "";
  }

  function loadRoomAdminKeys() {
    try {
      return JSON.parse(window.localStorage.getItem("unfoldRoomAdminKeys") || "{}");
    } catch (error) {
      return {};
    }
  }

  function saveRoomAdminKeys() {
    window.localStorage.setItem("unfoldRoomAdminKeys", JSON.stringify(uiState.roomAdminKeys));
  }

  function saveOnlineName(name) {
    try {
      window.localStorage.setItem("unfoldOnlineName", name || "");
    } catch (error) {
      // ignore storage errors
    }
  }

  function loadOnlineName() {
    try {
      return window.localStorage.getItem("unfoldOnlineName") || "";
    } catch (error) {
      return "";
    }
  }

  function saveOnlineSession() {
    if (!isOnlineGame() || !uiState.online.roomId || !uiState.online.playerId) {
      return;
    }
    try {
      window.localStorage.setItem("unfoldOnlineSession", JSON.stringify({
        roomId: uiState.online.roomId,
        playerId: uiState.online.playerId,
        playerName: getOnlinePlayerName()
      }));
    } catch (error) {
      // ignore storage errors
    }
  }

  function loadOnlineSession() {
    try {
      return JSON.parse(window.localStorage.getItem("unfoldOnlineSession") || "null");
    } catch (error) {
      return null;
    }
  }

  function clearOnlineSession() {
    try {
      window.localStorage.removeItem("unfoldOnlineSession");
    } catch (error) {
      // ignore storage errors
    }
  }

  function setLobbyNotice(text) {
    if (!els.lobbyNotice) {
      return;
    }
    els.lobbyNotice.textContent = text || "";
  }

  function rememberAdminKey(roomId, adminKey) {
    if (!roomId || !adminKey) {
      return;
    }
    uiState.roomAdminKeys[roomId] = adminKey;
    saveRoomAdminKeys();
  }

  function forgetAdminKey(roomId) {
    if (!roomId || !uiState.roomAdminKeys[roomId]) {
      return;
    }
    delete uiState.roomAdminKeys[roomId];
    saveRoomAdminKeys();
  }

  function getStarterDeck(mode) {
    return mode === "shogi" ? SHOGI_STARTER_DECK : STARTER_DECK;
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

  function setScreen(screen) {
    var changed = false;
    if (els.lobbyView) {
      changed = changed || els.lobbyView.hidden !== (screen !== "lobby");
    }
    if (els.gameView) {
      changed = changed || els.gameView.hidden !== (screen !== "game");
    }
    uiState.screen = screen;
    if (els.lobbyView) {
      els.lobbyView.hidden = screen !== "lobby";
    }
    if (els.gameView) {
      els.gameView.hidden = screen !== "game";
    }
    if (screen === "game" && changed) {
      window.setTimeout(function () {
        window.dispatchEvent(new Event("resize"));
        if (window.UNFOLD_3D_RENDERER && typeof window.UNFOLD_3D_RENDERER.renderScene === "function") {
          window.UNFOLD_3D_RENDERER.renderScene();
        }
      }, 0);
    }
  }

  function getRoomStatusLabel(status) {
    if (status === "playing") {
      return "対戦中";
    }
    if (status === "ready") {
      return "開始待ち";
    }
    return "募集中";
  }

  function resolveRoomSide(room, playerId) {
    if (!room || !room.players || !playerId) {
      return null;
    }
    if (room.players.P1 && room.players.P1.id === playerId) {
      return "P1";
    }
    if (room.players.P2 && room.players.P2.id === playerId) {
      return "P2";
    }
    return null;
  }

  function isOnlineMatchStarted() {
    return !isOnlineGame() || uiState.online.roomStatus === "playing";
  }

  function isOnlineRoomOwner() {
    return !!(isOnlineGame()
      && uiState.online.room
      && uiState.online.playerId
      && uiState.online.room.ownerPlayerId === uiState.online.playerId);
  }

  function isNpcGame() {
    return !!(uiState.npc && uiState.npc.enabled);
  }

  function isNpcSide(side) {
    return isNpcGame() && side === uiState.npc.side;
  }

  function isNpcTurn() {
    return isNpcSide(uiState.state.currentPlayer);
  }

  function isHumanControlledPlayer(side) {
    return !isNpcSide(side);
  }

  function clearNpcTurnTimer() {
    if (uiState.npc && uiState.npc.timer) {
      window.clearTimeout(uiState.npc.timer);
      uiState.npc.timer = null;
    }
  }

  function resetNpcState() {
    clearNpcTurnTimer();
    uiState.npc.enabled = false;
    uiState.npc.side = "P2";
    uiState.npc.thinking = false;
  }

  function shouldLockHumanActions() {
    return (isOnlineGame() && !isOnlineMatchStarted()) || isNpcTurn() || !!uiState.npc.thinking;
  }

  function getDisplayedPlayerName(side) {
    if (isNpcGame() && side === "P2") {
      return "NPC";
    }
    if (isNpcGame() && side === "P1") {
      return "あなた";
    }
    if (isOnlineGame()) {
      var room = uiState.online.room;
      if (room && room.players && room.players[side] && room.players[side].name) {
        return room.players[side].name;
      }
    }
    return side === "P1" ? "プレイヤー1" : "プレイヤー2";
  }

  function getMatchPlayersText() {
    if (isNpcGame()) {
      return getDisplayedPlayerName("P1") + " / " + getDisplayedPlayerName("P2");
    }
    if (!isOnlineGame()) {
      return "-";
    }
    var room = uiState.online.room;
    if (!room || !room.players) {
      return "-";
    }
    var p1Name = room.players.P1 && room.players.P1.name ? room.players.P1.name : "未参加";
    var p2Name = room.players.P2 && room.players.P2.id
      ? room.players.P2.name
      : "募集中";
    return p1Name + " / " + p2Name;
  }

  function formatExpiryText(expiresAt) {
    var date = expiresAt ? new Date(expiresAt) : null;
    if (!date || isNaN(date.getTime())) {
      return "自動削除: 不明";
    }
    return "自動削除: " +
      date.getFullYear() + "/" +
      String(date.getMonth() + 1).padStart(2, "0") + "/" +
      String(date.getDate()).padStart(2, "0") + " " +
      String(date.getHours()).padStart(2, "0") + ":" +
      String(date.getMinutes()).padStart(2, "0");
  }

  function renderRoomList() {
    if (!els.roomList) {
      return;
    }
    els.roomList.innerHTML = "";
    if (!uiState.lobbyRooms.length) {
      els.roomList.innerHTML = "<p class=\"room-empty\">公開中の部屋はまだありません。部屋を作るとここに並びます。</p>";
      return;
    }

    uiState.lobbyRooms.forEach(function (room) {
      var item = document.createElement("article");
      var meta = document.createElement("div");
      var title = document.createElement("div");
      var sub = document.createElement("div");
      var badgeRow = document.createElement("div");
      var statusBadge = document.createElement("span");
      var modeBadge = document.createElement("span");
      var lockBadge = document.createElement("span");
      var expiry = document.createElement("div");
      var actions = document.createElement("div");
      var joinBtn = document.createElement("button");
      var deleteBtn = document.createElement("button");
      var adminKey = uiState.roomAdminKeys[room.id];

      item.className = "room-item";
      meta.className = "room-item-meta";
      title.className = "room-item-title";
      sub.className = "room-item-sub";
      badgeRow.className = "room-badge-row";
      expiry.className = "room-item-expire";
      actions.className = "room-item-actions";

      title.textContent = (room.name || ("部屋 " + room.id)) + " [" + room.id + "]";
      sub.textContent = "ホスト: " + (room.hostName || "-") + " / 参加: " + (room.guestName || "募集中");

      statusBadge.className = "room-badge room-item-status";
      statusBadge.textContent = getRoomStatusLabel(room.status);
      badgeRow.appendChild(statusBadge);

      modeBadge.className = "room-badge";
      modeBadge.textContent = GAME_MODE_LABELS[room.ruleMode] || room.ruleMode || "-";
      badgeRow.appendChild(modeBadge);

      if (room.hasPassword) {
        lockBadge.className = "room-badge";
        lockBadge.textContent = "鍵あり";
        badgeRow.appendChild(lockBadge);
      }

      expiry.textContent = formatExpiryText(room.expiresAt);

      joinBtn.type = "button";
      joinBtn.className = "ghost-button";
      joinBtn.textContent = room.isFull ? "満室" : "入室";
      joinBtn.disabled = !!room.isFull || isOnlineGame();
      joinBtn.addEventListener("click", function () {
        var password = "";
        if (room.hasPassword) {
          password = window.prompt("この部屋は鍵付きです。合言葉を入力してください。", "") || "";
          if (!password) {
            return;
          }
        }
        joinOnlineRoom(room.id, password);
      });
      actions.appendChild(joinBtn);

      if (adminKey) {
        deleteBtn.type = "button";
        deleteBtn.className = "ghost-button";
        deleteBtn.textContent = "削除";
        deleteBtn.disabled = isOnlineGame();
        deleteBtn.addEventListener("click", function () {
          if (!window.confirm("部屋 " + room.id + " を削除しますか？")) {
            return;
          }
          deleteRoomByKey(room.id, adminKey);
        });
        actions.appendChild(deleteBtn);
      }

      meta.appendChild(title);
      meta.appendChild(sub);
      meta.appendChild(badgeRow);
      meta.appendChild(expiry);
      item.appendChild(meta);
      item.appendChild(actions);
      els.roomList.appendChild(item);
    });
  }

  function render() {
    renderStatus();
    renderPendingPieceBanner();
    syncAiDebugOverlay();
    syncAiDebugButton();
    renderAiDebugStatus();
    renderBoard();
    renderSide("P1", els.p1Reserve, els.p1Hand, els.p1DeckCount);
    renderSide("P2", els.p2Reserve, els.p2Hand, els.p2DeckCount);
    renderLog();
    renderHistoryPanel();
    renderMovementSummary();
    renderFragmentCatalog();
    renderRoomList();
    renderOnlineStatus();
    setScreen(uiState.screen || "lobby");
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
        els.winnerOverlayText.textContent = PLAYER_LABELS[uiState.state.winner] + " の勝利";
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
    els.pendingPieceBanner.classList.remove("is-thinking");
    if (uiState.npc.thinking) {
      els.pendingPieceBanner.hidden = false;
      els.pendingPieceBanner.classList.add("is-thinking");
      els.pendingPieceBanner.innerHTML =
        "<strong>NPC 思考中</strong>" +
        "<span class=\"pending-piece-chip\">...</span>" +
        "<span>次の一手を読んでいます。少し待ってください。</span>";
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

  function getAiDebugModeLabel(mode) {
    if (mode === "attack") {
      return "利き";
    }
    if (mode === "danger") {
      return "危険";
    }
    if (mode === "both") {
      return "両方";
    }
    return "OFF";
  }

  function getAiDebugPlayer() {
    if (isNpcGame()) {
      return uiState.npc.side || "P2";
    }
    if (uiState.state && uiState.state.currentPlayer) {
      return uiState.state.currentPlayer;
    }
    return "P1";
  }

  function getAiDebugStateFingerprint(state, player, mode) {
    var pieceTokens = [];
    var placementTokens = [];
    ["P1", "P2"].forEach(function (side) {
      Object.keys(state.players[side].pieces).sort().forEach(function (pieceId) {
        var piece = state.players[side].pieces[pieceId];
        pieceTokens.push(pieceId + ":" + piece.kind + ":" + piece.row + ":" + piece.col);
      });
    });
    state.placements.slice().sort(function (a, b) {
      return a.id.localeCompare(b.id);
    }).forEach(function (placement) {
      placementTokens.push(
        placement.id + ":" + placement.owner + ":" + placement.cells.map(function (cell) {
          return cell.row + "-" + cell.col;
        }).join("_")
      );
    });
    return [
      mode,
      player,
      state.turnNumber,
      state.currentPlayer,
      state.winner || "-",
      pieceTokens.join("|"),
      placementTokens.join("|")
    ].join("~");
  }

  function buildAiDebugOverlay(state, player, mode) {
    var opponent = getOpponentPlayer(player);
    var attackMap = getAttackMapForState(state, player);
    var dangerMap = getDangerMapForState(state, player);
    var defenseSnapshot = getDefenseSnapshot(state, player);
    var basePressureScore = getBaseCenterPressureScore(state, player);
    var opponentBasePressureScore = getBaseCenterPressureScore(state, opponent);
    var roleScore = getPieceRoleScoreForPlayer(state, player);
    var opponentRoleScore = getPieceRoleScoreForPlayer(state, opponent);
    var ownBase = findBaseCenterInState(state, player);
    var ownKing = findKingInState(state, player);
    var enemyBase = findBaseCenterInState(state, opponent);
    var cells = [];
    var attackedCells = 0;
    var dangerCells = 0;
    var hotCells = 0;
    var maxAttackCount = 0;
    var maxDangerCount = 0;
    var maxHotCount = 0;
    var row;
    var col;
    var attackCount;
    var dangerCount;
    var hotCount;

    for (row = 0; row < BOARD_ROWS; row += 1) {
      cells[row] = [];
      for (col = 0; col < BOARD_COLS; col += 1) {
        attackCount = attackMap.counts[row][col];
        dangerCount = dangerMap.counts[row][col];
        hotCount = dangerMap.immediateCounts[row][col];
        if (attackCount > 0) {
          attackedCells += 1;
          maxAttackCount = Math.max(maxAttackCount, attackCount);
        }
        if (dangerCount > 0) {
          dangerCells += 1;
          maxDangerCount = Math.max(maxDangerCount, dangerCount);
        }
        if (hotCount > 0) {
          hotCells += 1;
          maxHotCount = Math.max(maxHotCount, hotCount);
        }
        cells[row][col] = {
          attackCount: attackCount,
          dangerCount: dangerCount,
          hotCount: hotCount
        };
      }
    }

    return {
      mode: mode,
      showAttack: mode === "attack" || mode === "both",
      showDanger: mode === "danger" || mode === "both",
      player: player,
      playerName: getDisplayedPlayerName(player),
      attackMap: attackMap,
      dangerMap: dangerMap,
      defenseSnapshot: defenseSnapshot,
      basePressureScore: basePressureScore,
      opponentBasePressureScore: opponentBasePressureScore,
      basePressureDelta: basePressureScore - opponentBasePressureScore,
      roleScore: roleScore,
      opponentRoleScore: opponentRoleScore,
      roleScoreDelta: roleScore - opponentRoleScore,
      attackedCells: attackedCells,
      dangerCells: dangerCells,
      hotCells: hotCells,
      maxAttackCount: maxAttackCount,
      maxDangerCount: maxDangerCount,
      maxHotCount: maxHotCount,
      ownBase: ownBase ? { row: ownBase.row, col: ownBase.col } : null,
      ownKing: ownKing ? { row: ownKing.row, col: ownKing.col } : null,
      enemyBase: enemyBase ? { row: enemyBase.row, col: enemyBase.col } : null,
      cells: cells
    };
  }

  function syncAiDebugOverlay() {
    var mode = uiState.aiDebug && uiState.aiDebug.mode ? uiState.aiDebug.mode : "off";
    var player = getAiDebugPlayer();
    var state = uiState.state;
    var cacheKey;
    if (!state || mode === "off") {
      uiState.aiDebug.targetPlayer = player;
      uiState.aiDebug.overlay = null;
      uiState.aiDebug.cacheKey = "";
      return;
    }
    cacheKey = getAiDebugStateFingerprint(state, player, mode);
    if (uiState.aiDebug.cacheKey === cacheKey && uiState.aiDebug.overlay) {
      uiState.aiDebug.targetPlayer = player;
      return;
    }
    uiState.aiDebug.targetPlayer = player;
    uiState.aiDebug.cacheKey = cacheKey;
    uiState.aiDebug.overlay = buildAiDebugOverlay(state, player, mode);
  }

  function syncAiDebugButton() {
    if (!els.toggleAiDebugBtn) {
      return;
    }
    var mode = uiState.aiDebug && uiState.aiDebug.mode ? uiState.aiDebug.mode : "off";
    els.toggleAiDebugBtn.textContent = "AIデバッグ: " + getAiDebugModeLabel(mode);
    els.toggleAiDebugBtn.classList.toggle("active-tool", mode !== "off");
  }

  function formatSignedDebugValue(value) {
    var rounded = Math.round(value || 0);
    if (rounded > 0) {
      return "+" + rounded;
    }
    return String(rounded);
  }

  function renderAiDebugStatus() {
    if (!els.aiDebugStatus) {
      return;
    }
    var overlay = uiState.aiDebug ? uiState.aiDebug.overlay : null;
    var defenseSnapshot;
    var summary = [];
    var titleText;
    if (!overlay) {
      els.aiDebugStatus.hidden = true;
      els.aiDebugStatus.innerHTML = "";
      return;
    }
    defenseSnapshot = overlay.defenseSnapshot;
    titleText = "AIデバッグ: " + overlay.playerName + " (" + PLAYER_LABELS[overlay.player] + ")";
    summary.push("<div class=\"ai-debug-title\">" + titleText + "</div>");
    if (overlay.showAttack) {
      summary.push("<span class=\"ai-debug-chip attack\">利き " + overlay.attackedCells + " / 最大 " + overlay.maxAttackCount + "</span>");
    }
    if (overlay.showDanger) {
      summary.push("<span class=\"ai-debug-chip danger\">危険 " + overlay.dangerCells + " / 最大 " + overlay.maxDangerCount + "</span>");
      summary.push("<span class=\"ai-debug-chip hot\">即勝ち筋 " + defenseSnapshot.immediateWins + " / ホット " + overlay.hotCells + "</span>");
    }
    summary.push("<span class=\"ai-debug-chip\">受け " + ((defenseSnapshot.kingThreatened || defenseSnapshot.baseHot || defenseSnapshot.immediateWins) ? "必須" : "不要") + "</span>");
    summary.push("<span class=\"ai-debug-chip\">本陣圧力 " + formatSignedDebugValue(overlay.basePressureDelta) + "</span>");
    summary.push("<span class=\"ai-debug-chip\">駒役割 " + formatSignedDebugValue(overlay.roleScoreDelta) + "</span>");
    els.aiDebugStatus.innerHTML = summary.join("");
    els.aiDebugStatus.hidden = false;
  }

  function getAiDebugCellData(row, col) {
    if (!uiState.aiDebug || !uiState.aiDebug.overlay || !uiState.aiDebug.overlay.cells[row]) {
      return null;
    }
    return uiState.aiDebug.overlay.cells[row][col] || null;
  }

  function renderBoard() {
    els.board.innerHTML = "";
    els.board.style.gridTemplateColumns = "repeat(" + BOARD_COLS + ", minmax(0, 1fr))";
    var overlay = uiState.aiDebug ? uiState.aiDebug.overlay : null;
    for (var row = 0; row < BOARD_ROWS; row += 1) {
      for (var col = 0; col < BOARD_COLS; col += 1) {
        var cell = uiState.state.board[row][col];
        var debugCell = overlay ? getAiDebugCellData(row, col) : null;
        var button = document.createElement("button");
        button.type = "button";
        button.className = "cell " + (cell.controller ? cell.controller.toLowerCase() : "neutral");
        if (cell.isBaseCenter) {
          button.classList.add("base-center");
        }
        if (uiState.selection && uiState.selection.type === "piece" && pieceMatchesCell(uiState.selection.pieceId, row, col)) {
          button.classList.add("selected");
        }
        if (isPendingMoveSourceCell(row, col)) {
          button.classList.add("pending-move-source");
        }
        if (isMoveTarget(row, col)) {
          button.classList.add("move-target");
        }
        if (isPendingMoveTargetCell(row, col)) {
          button.classList.add("pending-move-target");
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
        if (overlay && debugCell) {
          if (overlay.showAttack && debugCell.attackCount > 0) {
            button.classList.add("ai-debug-attack-cell");
          }
          if (overlay.showDanger && debugCell.dangerCount > 0) {
            button.classList.add("ai-debug-danger-cell");
          }
          if (overlay.showDanger && debugCell.hotCount > 0) {
            button.classList.add("ai-debug-hot");
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

        if (overlay && debugCell) {
          if (overlay.showDanger && debugCell.dangerCount > 0) {
            var dangerBadge = document.createElement("span");
            dangerBadge.className = "ai-debug-badge danger";
            dangerBadge.textContent = String(debugCell.dangerCount);
            button.appendChild(dangerBadge);
          }
          if (overlay.showAttack && debugCell.attackCount > 0) {
            var attackBadge = document.createElement("span");
            attackBadge.className = "ai-debug-badge attack";
            attackBadge.textContent = String(debugCell.attackCount);
            button.appendChild(attackBadge);
          }
          if (overlay.showDanger && debugCell.hotCount > 0) {
            var hotBadge = document.createElement("span");
            hotBadge.className = "ai-debug-badge hot";
            hotBadge.textContent = debugCell.hotCount > 1 ? String(debugCell.hotCount) : "!";
            button.appendChild(hotBadge);
          }
        }

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
    var isActionLocked = shouldLockHumanActions();
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
      button.disabled = player !== uiState.state.currentPlayer || isActionLocked || !isHumanControlledPlayer(player);
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
      button.disabled = player !== uiState.state.currentPlayer || isActionLocked || !isHumanControlledPlayer(player);
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

  function setupSimpleGameLayout() {
    var center = els.gameView ? els.gameView.querySelector(".center") : null;
    var logCard = els.logList ? els.logList.closest(".card") : null;
    var movementCard = els.movementSummary ? els.movementSummary.closest(".card") : null;
    var fragmentCard = els.fragmentCatalog ? els.fragmentCatalog.closest(".card") : null;
    var testCard = els.testOutput ? els.testOutput.closest(".card") : null;
    var details;
    var summary;
    var summaryLabel;
    var summaryTitle;
    var toolbar;
    var grid;

    if (!center || !logCard || !els.historyCard || !movementCard || !fragmentCard || !testCard || !els.runTestsBtn) {
      return;
    }
    if (document.getElementById("extrasDrawer")) {
      return;
    }

    details = document.createElement("details");
    details.id = "extrasDrawer";
    details.className = "card extras-drawer";

    summary = document.createElement("summary");
    summary.className = "extras-summary";
    summaryLabel = document.createElement("span");
    summaryLabel.className = "label";
    summaryLabel.textContent = "DETAILS";
    summaryTitle = document.createElement("strong");
    summaryTitle.className = "extras-title";
    summaryTitle.textContent = "棋譜・資料";
    summary.appendChild(summaryLabel);
    summary.appendChild(summaryTitle);
    details.appendChild(summary);

    toolbar = document.createElement("div");
    toolbar.className = "extras-toolbar";
    toolbar.appendChild(els.runTestsBtn);
    details.appendChild(toolbar);

    grid = document.createElement("div");
    grid.className = "extras-grid";
    grid.appendChild(els.historyCard);
    grid.appendChild(movementCard);
    grid.appendChild(fragmentCard);
    grid.appendChild(testCard);
    details.appendChild(grid);

    logCard.insertAdjacentElement("afterend", details);
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
    var statusText = "オンライン対戦ロビー (" + modeText + ")";
    var matchTitle = "オンライン対戦";
    var matchMeta = "部屋を作るか、部屋一覧から参加してください。";
    if (!isOnlineGame() && uiState.screen === "game" && isNpcGame()) {
      statusText = "対NPC戦 (" + modeText + ")";
      matchTitle = "対NPC戦";
      matchMeta = uiState.npc.thinking
        ? "NPC が次の一手を考えています。"
        : "あなたが先手、NPC が後手です。ローカルで練習対局できます。";
    } else if (!isOnlineGame() && uiState.screen === "game" && uiState.practiceMode) {
      statusText = "ひとりテストプレイ (" + modeText + ")";
      matchTitle = "ひとりテストプレイ";
      matchMeta = "1人で盤面や駒挙動を確認するための練習用ルームです。";
    }
    if (isOnlineGame()) {
      statusText = "オンライン対戦中";
      matchTitle = "オンライン対戦";
      matchMeta = (uiState.online.roomName || ("部屋 " + uiState.online.roomId)) + " / " + uiState.online.roomId + " / " + (uiState.online.side ? PLAYER_LABELS[uiState.online.side] : "-") + " / " + modeText;
      if (uiState.online.roomStatus === "waiting") {
        statusText += " / 相手待ち (" + modeText + ")";
        matchMeta += " / 相手待ち";
      } else if (uiState.online.roomStatus === "ready") {
        statusText += " / 開始待ち (" + modeText + ")";
        matchMeta += isOnlineRoomOwner()
          ? " / 参加者がそろいました。対戦を始めるボタンで開始してください。"
          : " / 参加者がそろいました。ホストが開始するまでお待ちください。";
      } else if (uiState.online.roomStatus === "playing") {
        statusText += " / 対戦中 (" + modeText + ")";
      } else {
        statusText += " (" + modeText + ")";
      }
    }
    if (els.onlineStatus) {
      els.onlineStatus.textContent = statusText;
    }
    if (els.matchRoomCode) {
      els.matchRoomCode.textContent = uiState.online.roomId || "-";
    }
    if (els.matchPlayers) {
      els.matchPlayers.textContent = getMatchPlayersText();
    }
    if (els.matchAdminKey) {
      els.matchAdminKey.textContent = uiState.online.roomId && uiState.roomAdminKeys[uiState.online.roomId]
        ? uiState.roomAdminKeys[uiState.online.roomId]
        : "-";
    }
    if (els.onlineSideLabel) {
      els.onlineSideLabel.textContent = uiState.online.side ? PLAYER_LABELS[uiState.online.side] : "-";
    }
    if (els.matchTitle) {
      els.matchTitle.textContent = matchTitle;
    }
    if (els.matchMeta) {
      els.matchMeta.textContent = matchMeta;
    }
    if (els.p1NameLabel) {
      els.p1NameLabel.textContent = getDisplayedPlayerName("P1");
    }
    if (els.p2NameLabel) {
      els.p2NameLabel.textContent = getDisplayedPlayerName("P2");
    }
    if (els.onlineModeSelect) {
      els.onlineModeSelect.value = getCurrentRuleMode();
      els.onlineModeSelect.disabled = isOnlineGame();
    }
    if (els.newGameBtn) {
      els.newGameBtn.disabled = isOnlineGame();
    }
    if (els.newGameShogiBtn) {
      els.newGameShogiBtn.disabled = isOnlineGame();
    }
    if (els.npcGameBtn) {
      els.npcGameBtn.disabled = isOnlineGame();
    }
    if (els.npcGameShogiBtn) {
      els.npcGameShogiBtn.disabled = isOnlineGame();
    }
    if (els.practiceRestartBtn) {
      var showLocalRestart = uiState.screen === "game" && !isOnlineGame() && (uiState.practiceMode || isNpcGame());
      els.practiceRestartBtn.hidden = !showLocalRestart;
      if (showLocalRestart) {
        els.practiceRestartBtn.textContent = isNpcGame() ? "NPC 戦を新しく始める" : "新しく始める";
      }
    }
    if (els.practiceModeBtn) {
      els.practiceModeBtn.hidden = !(uiState.screen === "game" && !isOnlineGame() && (uiState.practiceMode || isNpcGame()));
      els.practiceModeBtn.textContent = "駒タイプ変更（" + modeText + "）";
      els.practiceModeBtn.title = "現在の駒モード: " + modeText;
    }
    if (els.createRoomBtn) {
      els.createRoomBtn.disabled = isOnlineGame();
    }
    if (els.joinRoomBtn) {
      els.joinRoomBtn.disabled = isOnlineGame();
    }
    if (els.refreshRoomsBtn) {
      els.refreshRoomsBtn.disabled = isOnlineGame();
    }
    if (els.deleteRoomByKeyBtn) {
      els.deleteRoomByKeyBtn.disabled = isOnlineGame();
    }
    if (els.leaveRoomBtn) {
      els.leaveRoomBtn.disabled = !isOnlineGame();
      els.leaveRoomBtn.hidden = !isOnlineGame();
    }
    if (els.disbandRoomBtn) {
      els.disbandRoomBtn.disabled = !isOnlineRoomOwner();
      els.disbandRoomBtn.hidden = !isOnlineRoomOwner();
    }
    if (els.startMatchBtn) {
      var showStartMatch = isOnlineGame() && uiState.online.roomStatus !== "playing";
      var canStartMatch = showStartMatch
        && isOnlineRoomOwner()
        && uiState.online.roomStatus === "ready";
      els.startMatchBtn.hidden = !showStartMatch;
      els.startMatchBtn.disabled = !canStartMatch;
      if (showStartMatch) {
        if (uiState.online.roomStatus === "waiting") {
          els.startMatchBtn.textContent = isOnlineRoomOwner()
            ? "対戦を始める（まだそろっていません）"
            : "対戦開始待ち（まだそろっていません）";
        } else if (uiState.online.roomStatus === "ready") {
          els.startMatchBtn.textContent = isOnlineRoomOwner()
            ? "対戦を始める"
            : "対戦開始待ち";
        } else {
          els.startMatchBtn.textContent = "対戦を始める";
        }
      }
    }
    if (els.onlineRoomInput) {
      els.onlineRoomInput.disabled = isOnlineGame();
    }
    if (els.onlineRoomPasswordInput) {
      els.onlineRoomPasswordInput.disabled = isOnlineGame();
    }
    if (els.onlineRoomNameInput) {
      els.onlineRoomNameInput.disabled = isOnlineGame();
    }
    if (els.waitBtn) {
      els.waitBtn.hidden = true;
      els.waitBtn.disabled = isOnlineGame()
        ? !isOnlineMatchStarted() || !canUseWait() || !!uiState.online.waitRequest || uiState.state.currentPlayer !== uiState.online.side
        : !canUseWait();
    }
    if (els.p1WaitBtn) {
      els.p1WaitBtn.disabled = uiState.state.currentPlayer !== "P1"
        || !isHumanControlledPlayer("P1")
        || (isOnlineGame() ? (!isOnlineMatchStarted() || !canUseWait() || !!uiState.online.waitRequest || uiState.online.side !== "P1") : !canUseWait());
    }
    if (els.p2WaitBtn) {
      els.p2WaitBtn.disabled = uiState.state.currentPlayer !== "P2"
        || !isHumanControlledPlayer("P2")
        || (isOnlineGame() ? (!isOnlineMatchStarted() || !canUseWait() || !!uiState.online.waitRequest || uiState.online.side !== "P2") : !canUseWait());
    }
    if (els.waitApproveBtn) {
      els.waitApproveBtn.hidden = !(isOnlineGame() && uiState.online.waitRequest && uiState.online.waitRequest.requestedTo === uiState.online.side);
    }
      if (els.waitRejectBtn) {
        els.waitRejectBtn.hidden = !(isOnlineGame() && uiState.online.waitRequest && uiState.online.waitRequest.requestedTo === uiState.online.side);
      }
  }

  function formatSiteDate(value) {
    if (!value) {
      return "";
    }
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }
    return date.toLocaleString("ja-JP");
  }

  function renderFeedbackList(items) {
    if (!els.feedbackList) {
      return;
    }
    els.feedbackList.innerHTML = "";
    if (!items || !items.length) {
      var empty = document.createElement("p");
      empty.className = "feedback-empty";
      empty.textContent = "まだ投稿はありません。最初の感想を書けます。";
      els.feedbackList.appendChild(empty);
      return;
    }
    items.forEach(function (item) {
      var article = document.createElement("article");
      article.className = "feedback-item";
      var body = document.createElement("p");
      body.textContent = item.message || "";
      var time = document.createElement("time");
      time.textContent = formatSiteDate(item.createdAt);
      article.appendChild(body);
      article.appendChild(time);
      els.feedbackList.appendChild(article);
    });
  }

  function renderSiteInfo(data) {
    var stats = data && data.stats ? data.stats : {};
    if (els.accessCountLabel) {
      els.accessCountLabel.textContent = String(stats.accessCount || 0);
    }
    if (els.accessTotalLabel) {
      els.accessTotalLabel.textContent = String(stats.accessCount || 0);
    }
    if (els.accessTodayLabel) {
      els.accessTodayLabel.textContent = String(stats.todayAccess || 0);
    }
    if (els.accessYesterdayLabel) {
      els.accessYesterdayLabel.textContent = String(stats.yesterdayAccess || 0);
    }
    if (els.accessCountSubtleLabel) {
      els.accessCountSubtleLabel.textContent = String(stats.accessCount || 0);
    }
    if (els.accessUpdatedLabel) {
      els.accessUpdatedLabel.textContent = stats.updatedAt ? "最終更新: " + formatSiteDate(stats.updatedAt) : "";
    }
    renderFeedbackList(data && data.feedback ? data.feedback : []);
  }

  function loadSiteInfo(recordVisit) {
    var action = recordVisit ? "site.visit" : "site.stats";
    return apiRequest(buildApiUrl(action), {
      method: "GET"
    }).then(function (data) {
      renderSiteInfo(data);
      if (els.feedbackStatus && !recordVisit) {
        els.feedbackStatus.textContent = "掲示板を更新しました。";
      }
    }).catch(function (error) {
      if (els.feedbackStatus) {
        els.feedbackStatus.textContent = "掲示板の取得に失敗しました: " + error.message;
      }
      if (els.accessUpdatedLabel) {
        els.accessUpdatedLabel.textContent = "アクセス数を取得できませんでした。";
      }
    });
  }

  function submitFeedback() {
    if (!els.feedbackInput) {
      return Promise.resolve();
    }
    var message = els.feedbackInput.value.trim();
    if (!message) {
      if (els.feedbackStatus) {
        els.feedbackStatus.textContent = "投稿内容を入力してください。";
      }
      return Promise.resolve();
    }
    if (els.submitFeedbackBtn) {
      els.submitFeedbackBtn.disabled = true;
    }
    if (els.feedbackStatus) {
      els.feedbackStatus.textContent = "投稿中...";
    }
    return apiRequest(buildApiUrl("feedback.post"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message })
    }).then(function (data) {
      els.feedbackInput.value = "";
      if (els.feedbackStatus) {
        els.feedbackStatus.textContent = "投稿しました。";
      }
      renderSiteInfo(data);
    }).catch(function (error) {
      if (els.feedbackStatus) {
        els.feedbackStatus.textContent = "投稿に失敗しました: " + error.message;
      }
    }).finally(function () {
      if (els.submitFeedbackBtn) {
        els.submitFeedbackBtn.disabled = false;
      }
    });
  }

  function refreshRoomList(options) {
    var silent = !!(options && options.silent);
    return apiRequest(buildApiUrl("room.list"), {
      method: "GET"
    }).then(function (data) {
      uiState.lobbyRooms = (data.rooms || []).slice().sort(function (a, b) {
        if ((a.isFull ? 1 : 0) !== (b.isFull ? 1 : 0)) {
          return (a.isFull ? 1 : 0) - (b.isFull ? 1 : 0);
        }
        return String(a.id || "").localeCompare(String(b.id || ""));
      });
      if (!silent) {
        setLobbyNotice("部屋一覧を更新しました。");
      }
      renderRoomList();
    }).catch(function (error) {
      if (!silent) {
        setLobbyNotice("部屋一覧の取得に失敗しました。");
      }
      if (els.testOutput) {
        els.testOutput.textContent = "ROOM ERROR\n" + error.message;
      }
    });
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
      "P1",
      isP1Turn,
      recoverPieceActive,
      recoverFragmentActive
    );
    syncPlayerActionButtons(
      els.p2MulliganBtn,
      els.p2RecoverPieceBtn,
      els.p2RecoverFragmentBtn,
      "P2",
      isP2Turn,
      recoverPieceActive,
      recoverFragmentActive
    );
  }

  function syncPlayerActionButtons(mulliganBtn, recoverPieceBtn, recoverFragmentBtn, player, isCurrentPlayer, recoverPieceActive, recoverFragmentActive) {
    var canAct = isCurrentPlayer && isOnlineMatchStarted() && isHumanControlledPlayer(player) && !uiState.npc.thinking;
    if (mulliganBtn) {
      mulliganBtn.disabled = !canAct || !canMulligan();
      mulliganBtn.classList.toggle("active-tool", false);
    }
    if (recoverPieceBtn) {
      recoverPieceBtn.disabled = !canAct || getRecoverablePieces().length === 0;
      recoverPieceBtn.classList.toggle("active-tool", canAct && recoverPieceActive);
    }
    if (recoverFragmentBtn) {
      recoverFragmentBtn.disabled = !canAct || getRecoverablePlacements().length === 0;
      recoverFragmentBtn.classList.toggle("active-tool", canAct && recoverFragmentActive);
    }
  }

  function canStartUtilityAction() {
    return !uiState.state.winner
      && !uiState.pendingFragmentPiece
      && isOnlineMatchStarted()
      && (!shouldLockHumanActions() || isNpcTurn())
      && (!uiState.selection || uiState.selection.type === "recoverPiece" || uiState.selection.type === "recoverFragment");
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
        button.classList.remove("selected", "pending-move-source", "pending-move-target", "anchor", "target", "preview-invalid", "move-target", "reserve-target", "recover-piece-target", "recover-fragment-target");
        if (uiState.selection && uiState.selection.type === "piece" && pieceMatchesCell(uiState.selection.pieceId, row, col)) {
          button.classList.add("selected");
        }
        if (isPendingMoveSourceCell(row, col)) {
          button.classList.add("pending-move-source");
        }
        if (isMoveTarget(row, col)) {
          button.classList.add("move-target");
        }
        if (isPendingMoveTargetCell(row, col)) {
          button.classList.add("pending-move-target");
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
    if (shouldLockHumanActions()) {
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
      if (piece && piece.owner === uiState.state.currentPlayer) {
        if (uiState.selection.pieceId === piece.id) {
          clearSelection();
        } else {
          selectPieceForMove(piece.id);
        }
        render();
        return;
      }
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
      selectPieceForMove(piece.id);
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
    var targetCell;
    var targetPiece;
    var confirmText;
    if (!piece) {
      clearSelection();
      render();
      return;
    }
    if (!canMovePiece(piece, row, col)) {
      if (uiState.pendingPlacement && uiState.pendingPlacement.type === "move") {
        hidePlacementConfirm();
        render();
      }
      return;
    }

    targetCell = uiState.state.board[row][col];
    targetPiece = targetCell.pieceId ? getPiece(uiState.state, targetCell.pieceId) : null;
    openPlacementConfirm(event ? event.clientX : 0, event ? event.clientY : 0, {
      type: "move",
      pieceId: piece.id,
      row: row,
      col: col
    });
    if (els.confirmText) {
      confirmText = getPieceLabel(piece.kind) + " \u3092 " + formatBoardCoordinate(piece.row, piece.col) + " \u304B\u3089 " + formatBoardCoordinate(row, col) + " \u3078\u79FB\u52D5";
      if (targetPiece && targetPiece.owner !== piece.owner) {
        confirmText += "\u3057\u3001" + getPieceLabel(targetPiece.kind) + " \u3092\u53D6\u308A";
      }
      els.confirmText.textContent = confirmText + "\u307E\u3059\u304B\uFF1F";
    }
    render();
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

  function formatBoardCoordinate(row, col) {
    return "(" + (row + 1) + ", " + (col + 1) + ")";
  }

  function isPendingMoveTargetCell(row, col) {
    return !!(
      uiState.pendingPlacement &&
      uiState.pendingPlacement.type === "move" &&
      uiState.pendingPlacement.row === row &&
      uiState.pendingPlacement.col === col
    );
  }

  function isPendingMoveSourceCell(row, col) {
    if (!uiState.pendingPlacement || uiState.pendingPlacement.type !== "move") {
      return false;
    }
    return pieceMatchesCell(uiState.pendingPlacement.pieceId, row, col);
  }

  function selectPieceForMove(pieceId) {
    var piece = getPiece(uiState.state, pieceId);
    if (!piece) {
      return false;
    }
    uiState.selection = { type: "piece", pieceId: piece.id };
    uiState.moveTargets = getLegalMoveTargets(piece);
    uiState.reserveTargets = [];
    uiState.recoverPieceTargets = [];
    uiState.recoverFragmentTargets = [];
    uiState.pendingAnchor = null;
    uiState.rotation = 0;
    uiState.previewCells = [];
    uiState.previewLegal = false;
    uiState.pendingFragmentPiece = null;
    hideContextMenu();
    hidePlacementConfirm();
    return true;
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

  function placeReservePieceDirect(pieceType, row, col) {
    var cell = uiState.state.board[row][col];
    if (cell.controller !== uiState.state.currentPlayer || cell.pieceId) {
      return false;
    }
    if (uiState.state.players[uiState.state.currentPlayer].reserve[pieceType] <= 0) {
      return false;
    }
    uiState.state.players[uiState.state.currentPlayer].reserve[pieceType] -= 1;
    addPiece(uiState.state, uiState.state.currentPlayer, pieceType, row, col);
    pushLog(PLAYER_LABELS[uiState.state.currentPlayer] + "\u304C " + getPieceLabel(pieceType) + " \u3092 (" + (row + 1) + ", " + (col + 1) + ") \u306B\u914D\u7F6E");
    endTurn();
    return true;
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

  function placeFragmentDirect(card, handIndex, cells, pieceRow, pieceCol) {
    var placementId = "placement-" + (uiState.state.placements.length + 1);
    var placement = {
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

    placement.cells.forEach(function (placementCell) {
      var boardCell = uiState.state.board[placementCell.row][placementCell.col];
      boardCell.controller = uiState.state.currentPlayer;
      boardCell.stack.push(placementId);
    });

    uiState.state.players[uiState.state.currentPlayer].hand.splice(handIndex, 1);
    fillHand(uiState.state, uiState.state.currentPlayer);
    if (window.UNFOLD_3D_RENDERER && typeof window.UNFOLD_3D_RENDERER.startFragmentUnfoldAnimation === "function") {
      window.UNFOLD_3D_RENDERER.startFragmentUnfoldAnimation(uiState.state.currentPlayer, placement.cells, card.fragmentType, placementId);
    }
    pushLog(PLAYER_LABELS[uiState.state.currentPlayer] + "\u304C " + FRAGMENT_LIBRARY[card.fragmentType].label + " \u3092\u914D\u7F6E");

    uiState.pendingFragmentPiece = {
      pieceType: card.pieceType,
      cells: placement.cells
    };
    render();

    uiState.npc.timer = window.setTimeout(function () {
      uiState.npc.timer = null;
      var pieceId = addPiece(uiState.state, uiState.state.currentPlayer, card.pieceType, pieceRow, pieceCol);
      if (window.UNFOLD_3D_RENDERER && typeof window.UNFOLD_3D_RENDERER.startPiecePlacementAnimation === "function") {
        window.UNFOLD_3D_RENDERER.startPiecePlacementAnimation(pieceId, pieceRow, pieceCol);
      }
      pushLog(PLAYER_LABELS[uiState.state.currentPlayer] + "\u304C " + getPieceLabel(card.pieceType) + " \u3092 (" + (pieceRow + 1) + ", " + (pieceCol + 1) + ") \u306B\u914D\u7F6E");
      uiState.pendingFragmentPiece = null;
      uiState.npc.thinking = false;
      endTurn();
      }, 1180);
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

  function getOpponentPlayer(player) {
    return player === "P1" ? "P2" : "P1";
  }

  function getPieceStrategicValue(pieceType) {
    var values = {
      king: 1000,
      destroyer: 90,
      chaosBeast: 85,
      charger: 70,
      disruptor: 68,
      realmKnight: 58,
      barrier: 54,
      rider: 52,
      guard: 46,
      flanker: 44,
      decoy: 38,
      vanguard: 32
    };
    return values[pieceType] || 20;
  }

  function withTemporaryState(state, callback) {
    var previousState = uiState.state;
    var previousThinking = uiState.npc.thinking;
    uiState.state = state;
    uiState.npc.thinking = false;
    try {
      return callback();
    } finally {
      uiState.npc.thinking = previousThinking;
      uiState.state = previousState;
    }
  }

  function findBaseCenterInState(state, player) {
    for (var row = 0; row < BOARD_ROWS; row += 1) {
      for (var col = 0; col < BOARD_COLS; col += 1) {
        var cell = state.board[row][col];
        if (cell.isBaseCenter && cell.baseOwner === player) {
          return cell;
        }
      }
    }
    return null;
  }

  function getDistanceToEnemyBase(player, row, col) {
    var center = findBaseCenter(getOpponentPlayer(player));
    if (!center) {
      return 99;
    }
    return Math.abs(center.row - row) + Math.abs(center.col - col);
  }

  function getCenterPressureScore(player, row, col) {
    return Math.max(0, 20 - getDistanceToEnemyBase(player, row, col));
  }

  function getBaseCenterTargetBonus(player, row, col) {
    var enemyBase = findBaseCenter(getOpponentPlayer(player));
    if (!enemyBase) {
      return 0;
    }
    return Math.max(0, 9 - getWeightedDistance(row, col, enemyBase.row, enemyBase.col)) * 4.5;
  }

  function getPieceRolePreviewBonus(player, pieceType, row, col) {
    return getPieceRoleBonusInState(uiState.state, {
      owner: player,
      kind: pieceType,
      row: row,
      col: col
    }) * 0.32;
  }

  function scoreNpcMoveAction(player, piece, row, col) {
    var cell = uiState.state.board[row][col];
    var targetPiece = cell.pieceId ? getPiece(uiState.state, cell.pieceId) : null;
    var score = 40 + getCenterPressureScore(player, row, col) + getBaseCenterTargetBonus(player, row, col) + getPieceStrategicValue(piece.kind) * 0.08;
    score += getPieceRolePreviewBonus(player, piece.kind, row, col);
    if (cell.controller === player) {
      score += 6;
    }
    if (targetPiece && targetPiece.owner !== player) {
      score += targetPiece.kind === "king" ? 100000 : 180 + getPieceStrategicValue(targetPiece.kind) * 4;
    }
    if (cell.isBaseCenter && cell.baseOwner === getOpponentPlayer(player) && cell.controller === player) {
      score += 50000;
    }
    return score;
  }

  function scoreNpcReserveAction(player, pieceType, row, col) {
    var cell = uiState.state.board[row][col];
    var score = 26 + getCenterPressureScore(player, row, col) + getBaseCenterTargetBonus(player, row, col) + getPieceStrategicValue(pieceType) * 0.22;
    score += getPieceRolePreviewBonus(player, pieceType, row, col);
    if (cell.isBaseCenter && cell.baseOwner === getOpponentPlayer(player)) {
      score += 50000;
    }
    return score;
  }

  function pickNpcPieceDropCell(player, pieceType, cells) {
    var best = null;
    cells.forEach(function (cell) {
      if (uiState.state.board[cell.row][cell.col].pieceId) {
        return;
      }
      var score = 10 + getCenterPressureScore(player, cell.row, cell.col) + getPieceStrategicValue(pieceType) * 0.15;
      if (uiState.state.board[cell.row][cell.col].isBaseCenter && uiState.state.board[cell.row][cell.col].baseOwner === getOpponentPlayer(player)) {
        score += 50000;
      }
      score += getPieceRolePreviewBonus(player, pieceType, cell.row, cell.col);
      if (!best || score > best.score) {
        best = {
          row: cell.row,
          col: cell.col,
          score: score
        };
      }
    });
    return best;
  }

  function scoreNpcFragmentAction(player, card, cells, pieceCell) {
    var score = 48;
    cells.forEach(function (cell) {
      var boardCell = uiState.state.board[cell.row][cell.col];
      score += 5 + getCenterPressureScore(player, cell.row, cell.col) * 0.8 + getBaseCenterTargetBonus(player, cell.row, cell.col);
      if (boardCell.controller && boardCell.controller !== player) {
        score += 12;
      }
      if (boardCell.isBaseCenter && boardCell.baseOwner === getOpponentPlayer(player) && !boardCell.pieceId) {
        score += 70000;
      }
    });
    if (pieceCell) {
      score += pieceCell.score;
    }
    score += getPieceStrategicValue(card.pieceType) * 0.12;
    score += getPieceRolePreviewBonus(player, card.pieceType, pieceCell ? pieceCell.row : cells[0].row, pieceCell ? pieceCell.col : cells[0].col);
    return score;
  }

  function scoreNpcRecoverPieceAction(piece) {
    return 10 + getPieceStrategicValue(piece.kind) * 0.18;
  }

  function scoreNpcRecoverFragmentAction(placement) {
    return 8 + getPieceStrategicValue(placement.card.pieceType) * 0.1;
  }

  function getNpcFrontierCells(player) {
    var cells = {};
    for (var row = 0; row < BOARD_ROWS; row += 1) {
      for (var col = 0; col < BOARD_COLS; col += 1) {
        if (uiState.state.board[row][col].controller !== player) {
          continue;
        }
        [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(function (dir) {
          var nr = row + dir[0];
          var nc = col + dir[1];
          if (!isInBounds(nr, nc)) {
            return;
          }
          if (uiState.state.board[nr][nc].controller === player) {
            return;
          }
          cells[nr + ":" + nc] = { row: nr, col: nc };
        });
      }
    }
    return Object.keys(cells).map(function (key) {
      return cells[key];
    });
  }

  function getNormalizedFragmentCells(fragmentType, rotation) {
    return getFragmentCells(fragmentType, rotation, { row: 0, col: 0 }).map(function (cell) {
      return { row: cell.row, col: cell.col };
    });
  }

  function getNpcFragmentPlacements(player, card) {
    var frontierCells = getNpcFrontierCells(player);
    var placements = [];
    var seen = {};
    for (var rotation = 0; rotation < 4; rotation += 1) {
      var normalizedCells = getNormalizedFragmentCells(card.fragmentType, rotation);
      frontierCells.forEach(function (frontierCell) {
        normalizedCells.forEach(function (shapeCell) {
          var anchor = {
            row: frontierCell.row - shapeCell.row,
            col: frontierCell.col - shapeCell.col
          };
          var key = rotation + ":" + anchor.row + ":" + anchor.col;
          if (seen[key]) {
            return;
          }
          seen[key] = true;
          var cells = normalizedCells.map(function (cell) {
            return {
              row: anchor.row + cell.row,
              col: anchor.col + cell.col
            };
          });
          if (!isLegalFragment(cells, player)) {
            return;
          }
          placements.push({
            rotation: rotation,
            anchor: anchor,
            cells: cells
          });
        });
      });
    }
    return placements;
  }

  function getDistanceToEnemyBaseInState(state, player, row, col) {
    var center = findBaseCenterInState(state, getOpponentPlayer(player));
    if (!center) {
      return 99;
    }
    return Math.abs(center.row - row) + Math.abs(center.col - col);
  }

  function findKingInState(state, player) {
    var pieces = state.players[player].pieces;
    var pieceIds = Object.keys(pieces);
    for (var i = 0; i < pieceIds.length; i += 1) {
      if (pieces[pieceIds[i]].kind === "king") {
        return pieces[pieceIds[i]];
      }
    }
    return null;
  }

  function isKingUnderThreatInState(state, player) {
    var king = findKingInState(state, player);
    if (!king) {
      return false;
    }
    var opponent = getOpponentPlayer(player);
    return withTemporaryState(state, function () {
      var opponentPieces = state.players[opponent].pieces;
      return Object.keys(opponentPieces).some(function (pieceId) {
        return canMovePiece(opponentPieces[pieceId], king.row, king.col);
      });
    });
  }

  function checkBaseOccupationWinInState(state) {
    var players = ["P1", "P2"];
    for (var i = 0; i < players.length; i += 1) {
      var attacker = players[i];
      var defender = getOpponentPlayer(attacker);
      var center = findBaseCenterInState(state, defender);
      var occupyingPiece = center && center.pieceId ? getPiece(state, center.pieceId) : null;
      if (
        center &&
        center.controller === attacker &&
        (!occupyingPiece || occupyingPiece.owner !== defender)
      ) {
        state.winner = attacker;
        state.winReason = "本陣占領";
        return attacker;
      }
    }
    return null;
  }

  function refreshCellControllerInState(state, cell) {
    var topPlacementId;
    var topPlacement;
    if (cell.stack.length) {
      topPlacementId = cell.stack[cell.stack.length - 1];
      topPlacement = state.placements.find(function (entry) {
        return entry.id === topPlacementId;
      }) || null;
      cell.controller = topPlacement ? topPlacement.owner : null;
      return;
    }
    cell.controller = cell.baseOwner || null;
  }

  function removePlacementFromBoardInState(state, placement) {
    placement.cells.forEach(function (placementCell) {
      var cell = state.board[placementCell.row][placementCell.col];
      cell.stack = cell.stack.filter(function (stackId) {
        return stackId !== placement.id;
      });
      refreshCellControllerInState(state, cell);
    });
    state.placements = state.placements.filter(function (entry) {
      return entry.id !== placement.id;
    });
  }

  function applyNpcActionToState(state, action) {
    var player = state.currentPlayer;
    var targetCell;
    var targetPiece;
    var piece;
    var placement;
    var placementId;
    if (action.type === "move") {
      piece = getPiece(state, action.pieceId);
      if (!piece) {
        return;
      }
      targetCell = state.board[action.row][action.col];
      targetPiece = targetCell.pieceId ? getPiece(state, targetCell.pieceId) : null;
      state.board[piece.row][piece.col].pieceId = null;
      if (targetPiece) {
        delete state.players[targetPiece.owner].pieces[targetPiece.id];
        if (targetPiece.kind !== "king") {
          state.players[player].reserve[targetPiece.kind] += 1;
        } else {
          state.winner = player;
          state.winReason = "王の捕獲";
        }
      }
      piece.row = action.row;
      piece.col = action.col;
      targetCell.pieceId = piece.id;
    } else if (action.type === "reserve") {
      state.players[player].reserve[action.pieceType] -= 1;
      addPiece(state, player, action.pieceType, action.row, action.col);
    } else if (action.type === "fragment") {
      placementId = "placement-" + (state.placements.length + 1);
      placement = {
        id: placementId,
        owner: player,
        card: {
          fragmentType: action.card.fragmentType,
          pieceType: action.card.pieceType
        },
        cells: action.cells.map(function (cell) {
          return { row: cell.row, col: cell.col };
        })
      };
      state.placements.push(placement);
      placement.cells.forEach(function (placementCell) {
        var cell = state.board[placementCell.row][placementCell.col];
        cell.controller = player;
        cell.stack.push(placementId);
      });
      state.players[player].hand.splice(action.handIndex, 1);
      fillHand(state, player);
      addPiece(state, player, action.card.pieceType, action.pieceCell.row, action.pieceCell.col);
    } else if (action.type === "recoverPiece") {
      piece = getPiece(state, action.pieceId);
      if (!piece) {
        return;
      }
      delete state.players[player].pieces[piece.id];
      state.board[action.row][action.col].pieceId = null;
      state.players[player].reserve[piece.kind] += 1;
    } else if (action.type === "recoverFragment") {
      placement = state.placements.find(function (entry) {
        return entry.id === action.placementId;
      }) || null;
      if (!placement) {
        return;
      }
      removePlacementFromBoardInState(state, placement);
      state.players[player].hand.push({
        fragmentType: placement.card.fragmentType,
        pieceType: placement.card.pieceType
      });
    } else if (action.type === "mulligan") {
      state.players[player].deck = shuffle(state.players[player].deck.concat(state.players[player].hand));
      state.players[player].hand = [];
      fillHand(state, player);
    }

    if (!state.winner) {
      checkBaseOccupationWinInState(state);
    }
    if (!state.winner) {
      state.currentPlayer = getOpponentPlayer(player);
      state.turnNumber += 1;
    }
  }

  function evaluateStateForNpc(state, npcPlayer) {
      var opponent = getOpponentPlayer(npcPlayer);
      if (state.winner === npcPlayer) {
        return 1000000;
    }
    if (state.winner === opponent) {
      return -1000000;
    }

    function scorePlayer(player) {
      var playerState = state.players[player];
      var score = 0;
      Object.keys(playerState.pieces).forEach(function (pieceId) {
        var piece = playerState.pieces[pieceId];
        score += getPieceStrategicValue(piece.kind) * 12;
        score += Math.max(0, 22 - getDistanceToEnemyBaseInState(state, player, piece.row, piece.col)) * 3;
      });
      Object.keys(playerState.reserve).forEach(function (pieceType) {
        score += playerState.reserve[pieceType] * getPieceStrategicValue(pieceType) * 5;
      });
      playerState.hand.forEach(function (card) {
        score += getPieceStrategicValue(card.pieceType) * 2.4;
      });
      playerState.deck.forEach(function (card) {
        score += getPieceStrategicValue(card.pieceType) * 0.3;
      });
      for (var row = 0; row < BOARD_ROWS; row += 1) {
        for (var col = 0; col < BOARD_COLS; col += 1) {
          var cell = state.board[row][col];
          if (cell.controller === player) {
            score += 1.6;
            if (cell.isBaseCenter && cell.baseOwner === getOpponentPlayer(player)) {
              score += 9000;
            }
          }
        }
        }
        return score;
      }

        var total = scorePlayer(npcPlayer) - scorePlayer(opponent);
        var npcAttack = getAttackSummaryForState(state, npcPlayer);
        var opponentAttack = getAttackSummaryForState(state, opponent);
        var baseCenterPressureDelta = getBaseCenterPressureScore(state, npcPlayer) - getBaseCenterPressureScore(state, opponent);
        var roleScoreDelta = getPieceRoleScoreForPlayer(state, npcPlayer) - getPieceRoleScoreForPlayer(state, opponent);
        total += (npcAttack.mobility - opponentAttack.mobility) * 3.4;
        total += (npcAttack.attackedCells - opponentAttack.attackedCells) * 2.2;
        total -= npcAttack.hotCells * 1800;
        total += opponentAttack.hotCells * 900;
        total += (npcAttack.captureValue - opponentAttack.captureValue) * 16;
        total += (npcAttack.basePressure - opponentAttack.basePressure) * 4200;
        total += (npcAttack.kingPressure - opponentAttack.kingPressure) * 11000;
        total += baseCenterPressureDelta * 1.15;
        total += roleScoreDelta * 0.9;
        total -= npcAttack.hangingPenalty * 9;
        total += opponentAttack.hangingPenalty * 6;
        if (isKingUnderThreatInState(state, npcPlayer)) {
          total -= 18000;
        }
        if (isKingUnderThreatInState(state, opponent)) {
          total += 9000;
        }
        return total;
      }

    function isNpcImmediateWinAction(action) {
      if (action.type === "move") {
        var cell = uiState.state.board[action.row][action.col];
        var targetPiece = cell && cell.pieceId ? getPiece(uiState.state, cell.pieceId) : null;
        if (targetPiece && targetPiece.owner !== uiState.state.currentPlayer && targetPiece.kind === "king") {
          return true;
        }
      }
      if ((action.type === "move" || action.type === "reserve") && uiState.state.board[action.row][action.col].isBaseCenter) {
        return uiState.state.board[action.row][action.col].baseOwner === getOpponentPlayer(uiState.state.currentPlayer);
      }
      if (action.type === "fragment") {
        return action.cells.some(function (cell) {
          var boardCell = uiState.state.board[cell.row][cell.col];
          return boardCell.isBaseCenter && boardCell.baseOwner === getOpponentPlayer(uiState.state.currentPlayer) && !boardCell.pieceId;
        });
      }
      return false;
    }

    function getNpcCandidateActions(actions, emergencyMode) {
      var player = uiState.state.currentPlayer;
      var unique = {};
      var selected = [];

      function actionKey(action) {
        if (action.type === "move") {
          return action.type + ":" + action.pieceId + ":" + action.row + ":" + action.col;
        }
        if (action.type === "reserve") {
          return action.type + ":" + action.pieceType + ":" + action.row + ":" + action.col;
        }
        if (action.type === "fragment") {
          return action.type + ":" + action.handIndex + ":" + action.rotation + ":" + action.anchor.row + ":" + action.anchor.col + ":" + action.pieceCell.row + ":" + action.pieceCell.col;
        }
        if (action.type === "recoverPiece") {
          return action.type + ":" + action.pieceId;
        }
        if (action.type === "recoverFragment") {
          return action.type + ":" + action.placementId;
        }
        return action.type;
      }

      function addAction(action) {
        var key = actionKey(action);
        if (unique[key]) {
          return;
        }
        unique[key] = true;
        selected.push(action);
      }

      actions
        .filter(function (action) {
          return isNpcImmediateWinAction(action);
        })
        .forEach(addAction);

      actions
        .filter(function (action) {
          return action.type === "move" && (function () {
            var cell = uiState.state.board[action.row][action.col];
            var targetPiece = cell && cell.pieceId ? getPiece(uiState.state, cell.pieceId) : null;
            return targetPiece && targetPiece.owner !== player;
          }());
        })
        .slice(0, emergencyMode ? 6 : 8)
        .forEach(addAction);

      actions
        .filter(function (action) {
          return action.type === "fragment";
        })
        .slice(0, emergencyMode ? 2 : 4)
        .forEach(addAction);

      actions
        .slice(0, emergencyMode ? 8 : 10)
        .forEach(addAction);

      return selected;
    }

    function collectNpcActionsForState(state, player) {
      return withTemporaryState(state, function () {
        var previousCurrentPlayer = state.currentPlayer;
        state.currentPlayer = player;
        try {
          return collectNpcActions();
        } finally {
          state.currentPlayer = previousCurrentPlayer;
        }
      });
    }

    function findImmediateWinningActionsInState(state, player, limit) {
      var actions = collectNpcActionsForState(state, player);
      var emergencyMode = isKingUnderThreatInState(state, player);
      actions.sort(function (a, b) {
        return b.score - a.score;
      });
      return getNpcCandidateActions(actions, emergencyMode)
        .slice(0, Math.min(limit || 12, actions.length))
        .filter(function (action) {
          var trialState = cloneGameState(state);
          trialState.currentPlayer = player;
          applyNpcActionToState(trialState, action);
          return trialState.winner === player;
        });
    }

  function countImmediateWinningActionsInState(state, player, limit) {
    return findImmediateWinningActionsInState(state, player, limit).length;
  }

  function makeBoardMap() {
    return Array.from({ length: BOARD_ROWS }, function () {
      return Array.from({ length: BOARD_COLS }, function () {
        return 0;
      });
    });
  }

  function getAttackMapForState(state, player) {
    var map = makeBoardMap();
    var attackers = {};

    Object.keys(state.players[player].pieces).forEach(function (pieceId) {
      var piece = state.players[player].pieces[pieceId];
      var targets = getLegalMoveTargetsForState(state, piece);
      targets.forEach(function (target) {
        var key = target.row + ":" + target.col;
        map[target.row][target.col] += 1;
        if (!attackers[key]) {
          attackers[key] = [];
        }
        attackers[key].push(pieceId);
      });
    });

    return {
      counts: map,
      attackers: attackers
    };
  }

  function getDangerMapForState(state, player) {
    var opponent = getOpponentPlayer(player);
    var attackMap = getAttackMapForState(state, opponent);
    var immediateWins = findImmediateWinningActionsInState(state, opponent, 16);
    var immediateMap = makeBoardMap();

    immediateWins.forEach(function (action) {
      if (typeof action.row === "number" && typeof action.col === "number") {
        immediateMap[action.row][action.col] += 1;
      }
      if (action.type === "fragment") {
        action.cells.forEach(function (cell) {
          immediateMap[cell.row][cell.col] += 1;
        });
      }
    });

    return {
      counts: attackMap.counts,
      attackers: attackMap.attackers,
      immediateWins: immediateWins,
      immediateCounts: immediateMap
    };
  }

  function getDefenseSnapshot(state, player) {
    var opponent = getOpponentPlayer(player);
    var ownBase = findBaseCenterInState(state, player);
    var ownKing = findKingInState(state, player);
    var dangerMap = getDangerMapForState(state, player);
    var snapshot = {
      immediateWins: dangerMap.immediateWins.length,
      baseHot: 0,
      baseThreat: 0,
      kingThreatened: false,
      kingDanger: 0,
      dangerCells: 0
    };

    if (ownBase) {
      snapshot.baseHot = dangerMap.immediateCounts[ownBase.row][ownBase.col];
      snapshot.baseThreat = dangerMap.counts[ownBase.row][ownBase.col];
    }
    if (ownKing) {
      snapshot.kingThreatened = isCellThreatenedInState(state, opponent, ownKing.row, ownKing.col);
      snapshot.kingDanger = dangerMap.counts[ownKing.row][ownKing.col];
    }

    for (var row = 0; row < BOARD_ROWS; row += 1) {
      for (var col = 0; col < BOARD_COLS; col += 1) {
        if (dangerMap.immediateCounts[row][col] > 0) {
          snapshot.dangerCells += 1;
        }
      }
    }

    return snapshot;
  }

  function isDefenseSnapshotBetter(candidate, baseline) {
    if (!baseline) {
      return true;
    }
    if (candidate.immediateWins !== baseline.immediateWins) {
      return candidate.immediateWins < baseline.immediateWins;
    }
    if (candidate.baseHot !== baseline.baseHot) {
      return candidate.baseHot < baseline.baseHot;
    }
    if ((candidate.kingThreatened ? 1 : 0) !== (baseline.kingThreatened ? 1 : 0)) {
      return (candidate.kingThreatened ? 1 : 0) < (baseline.kingThreatened ? 1 : 0);
    }
    if (candidate.kingDanger !== baseline.kingDanger) {
      return candidate.kingDanger < baseline.kingDanger;
    }
    if (candidate.baseThreat !== baseline.baseThreat) {
      return candidate.baseThreat < baseline.baseThreat;
    }
    return candidate.dangerCells < baseline.dangerCells;
  }

  function isSameDefenseSnapshot(left, right) {
    return !!left && !!right &&
      left.immediateWins === right.immediateWins &&
      left.baseHot === right.baseHot &&
      left.baseThreat === right.baseThreat &&
      !!left.kingThreatened === !!right.kingThreatened &&
      left.kingDanger === right.kingDanger &&
      left.dangerCells === right.dangerCells;
  }

  function getWeightedDistance(rowA, colA, rowB, colB) {
    return Math.abs(rowA - rowB) + Math.abs(colA - colB);
  }

  function getBaseCenterPressureScore(state, player) {
    var opponent = getOpponentPlayer(player);
    var center = findBaseCenterInState(state, opponent);
    var playerAttack = getAttackMapForState(state, player).counts;
    var opponentAttack = getAttackMapForState(state, opponent).counts;
    var score = 0;
    var row;
    var col;
    var weight;
    var cell;
    var piece;

    if (!center) {
      return 0;
    }

    for (row = center.row - 1; row <= center.row + 1; row += 1) {
      for (col = center.col - 1; col <= center.col + 1; col += 1) {
        if (!isInBounds(row, col)) {
          continue;
        }
        weight = row === center.row && col === center.col
          ? 28
          : (Math.abs(row - center.row) + Math.abs(col - center.col) === 1 ? 14 : 9);
        cell = state.board[row][col];
        piece = cell.pieceId ? getPiece(state, cell.pieceId) : null;
        if (cell.controller === player) {
          score += weight * 2.6;
        } else if (cell.controller === opponent) {
          score -= weight * 1.25;
        }
        score += Math.min(3, playerAttack[row][col]) * weight * 1.45;
        score -= Math.min(3, opponentAttack[row][col]) * weight * 0.9;
        if (piece && piece.owner === player) {
          score += weight * 1.9;
        } else if (piece && piece.owner === opponent) {
          score -= weight * 1.4;
        }
      }
    }

    return score;
  }

  function getPieceRoleBonusInState(state, piece) {
    var owner = piece.owner;
    var opponent = getOpponentPlayer(owner);
    var ownKing = findKingInState(state, owner);
    var enemyKing = findKingInState(state, opponent);
    var ownBase = findBaseCenterInState(state, owner);
    var enemyBase = findBaseCenterInState(state, opponent);
    var distOwnKing = ownKing ? getWeightedDistance(piece.row, piece.col, ownKing.row, ownKing.col) : 9;
    var distEnemyKing = enemyKing ? getWeightedDistance(piece.row, piece.col, enemyKing.row, enemyKing.col) : 9;
    var distOwnBase = ownBase ? getWeightedDistance(piece.row, piece.col, ownBase.row, ownBase.col) : 9;
    var distEnemyBase = enemyBase ? getWeightedDistance(piece.row, piece.col, enemyBase.row, enemyBase.col) : 9;
    var bonus = 0;

    switch (piece.kind) {
      case "king":
        bonus += Math.max(0, 5 - distOwnBase) * 13;
        bonus += Math.max(0, 4 - distOwnKing) * 10;
        bonus -= Math.max(0, 4 - distEnemyBase) * 8;
        break;
      case "guard":
      case "barrier":
        bonus += Math.max(0, 4 - distOwnKing) * 12;
        bonus += Math.max(0, 4 - distOwnBase) * 8;
        bonus += Math.max(0, 6 - distEnemyBase) * 3;
        break;
      case "flanker":
        bonus += Math.max(0, 4 - distOwnKing) * 8;
        bonus += Math.max(0, 6 - distEnemyBase) * 5;
        bonus += Math.max(0, 5 - distEnemyKing) * 4;
        break;
      case "vanguard":
        bonus += Math.max(0, 6 - distEnemyBase) * 8;
        bonus += Math.max(0, 5 - distEnemyKing) * 5;
        break;
      case "rider":
        bonus += Math.max(0, 7 - distEnemyBase) * 8;
        bonus += Math.max(0, 5 - distEnemyKing) * 8;
        break;
      case "realmKnight":
        bonus += Math.max(0, 7 - distEnemyBase) * 10;
        bonus += Math.max(0, 6 - distEnemyKing) * 7;
        break;
      case "charger":
      case "destroyer":
        bonus += Math.max(0, 8 - distEnemyBase) * 9;
        bonus += Math.max(0, 7 - distEnemyKing) * 6;
        break;
      case "disruptor":
        bonus += Math.max(0, 6 - distEnemyKing) * 9;
        bonus += Math.max(0, 7 - distEnemyBase) * 6;
        break;
      case "chaosBeast":
        bonus += Math.max(0, 7 - distEnemyBase) * 10;
        bonus += Math.max(0, 6 - distEnemyKing) * 8;
        bonus += Math.max(0, 4 - distOwnKing) * 4;
        break;
      case "decoy":
        bonus += Math.max(0, 6 - distEnemyBase) * 5;
        bonus += Math.max(0, 5 - distEnemyKing) * 3;
        break;
      default:
        break;
    }

    if (enemyBase && piece.row === enemyBase.row && piece.col === enemyBase.col) {
      bonus += 60;
    }
    if (ownBase && piece.row === ownBase.row && piece.col === ownBase.col && (piece.kind === "guard" || piece.kind === "barrier")) {
      bonus += 36;
    }

    return bonus;
  }

  function getPieceRoleScoreForPlayer(state, player) {
    var total = 0;
    Object.keys(state.players[player].pieces).forEach(function (pieceId) {
      total += getPieceRoleBonusInState(state, state.players[player].pieces[pieceId]);
    });
    return total;
  }

  function rebalanceNpcCandidateActions(actions, emergencyMode) {
    var limits = emergencyMode
      ? { move: 5, fragment: 2, reserve: 2, recoverPiece: 1, recoverFragment: 1, mulligan: 1 }
      : { move: 6, fragment: 3, reserve: 2, recoverPiece: 1, recoverFragment: 1, mulligan: 1 };
    var totalLimit = emergencyMode ? 7 : 10;
    var counts = {};
    var selected = [];
    var remaining = [];

    actions.forEach(function (action) {
      var limit = limits[action.type] || 1;
      counts[action.type] = counts[action.type] || 0;
      if (counts[action.type] < limit && selected.length < totalLimit) {
        counts[action.type] += 1;
        selected.push(action);
      } else {
        remaining.push(action);
      }
    });

    remaining.forEach(function (action) {
      if (selected.length < totalLimit) {
        selected.push(action);
      }
    });

    return selected;
  }

  function refineNpcCandidateActions(state, player, actions, emergencyMode) {
    var opponent = getOpponentPlayer(player);
    var currentPressure = getBaseCenterPressureScore(state, player) - getBaseCenterPressureScore(state, opponent);
    var currentRole = getPieceRoleScoreForPlayer(state, player) - getPieceRoleScoreForPlayer(state, opponent);
    var refined = filterForcedDefenseActions(state, player, actions).map(function (action) {
      var nextState = cloneGameState(state);
      var defenseSnapshot;
      var pressureDelta;
      var roleDelta;
      nextState.currentPlayer = player;
      applyNpcActionToState(nextState, action);
      defenseSnapshot = getDefenseSnapshot(nextState, player);
      pressureDelta = (getBaseCenterPressureScore(nextState, player) - getBaseCenterPressureScore(nextState, opponent)) - currentPressure;
      roleDelta = (getPieceRoleScoreForPlayer(nextState, player) - getPieceRoleScoreForPlayer(nextState, opponent)) - currentRole;
      action.refinedScore =
        action.score +
        pressureDelta * 1.7 +
        roleDelta * 1.05 -
        defenseSnapshot.immediateWins * 12000 -
        defenseSnapshot.baseHot * 9000 -
        defenseSnapshot.kingDanger * 2200 -
        defenseSnapshot.baseThreat * 360;
      action.defenseSnapshot = defenseSnapshot;
      return action;
    });

    refined.sort(function (a, b) {
      return (b.refinedScore || b.score) - (a.refinedScore || a.score);
    });

    return rebalanceNpcCandidateActions(refined, emergencyMode);
  }

  function getLegalMoveTargetsForState(state, piece) {
    return withTemporaryState(state, function () {
      return getLegalMoveTargets(piece);
    });
  }

    function isCellThreatenedInState(state, attacker, row, col) {
      return withTemporaryState(state, function () {
        var pieces = state.players[attacker].pieces;
        return Object.keys(pieces).some(function (pieceId) {
          return canMovePiece(pieces[pieceId], row, col);
        });
      });
    }

  function getAttackSummaryForState(state, player) {
    var opponent = getOpponentPlayer(player);
    var attackMap = getAttackMapForState(state, player);
    var dangerMap = getDangerMapForState(state, player);
    var summary = {
      mobility: 0,
      captureValue: 0,
      kingPressure: 0,
      basePressure: 0,
      hangingPenalty: 0,
      attackMap: attackMap,
      dangerMap: dangerMap,
      attackedCells: 0,
      hotCells: 0
    };

    Object.keys(state.players[player].pieces).forEach(function (pieceId) {
      var piece = state.players[player].pieces[pieceId];
      var targets = getLegalMoveTargetsForState(state, piece);
        summary.mobility += targets.length;

        targets.forEach(function (target) {
          var targetCell = state.board[target.row][target.col];
          var targetPiece = targetCell.pieceId ? getPiece(state, targetCell.pieceId) : null;
          if (targetPiece && targetPiece.owner === opponent) {
            summary.captureValue += getPieceStrategicValue(targetPiece.kind);
            if (targetPiece.kind === "king") {
              summary.kingPressure += 1;
            }
          }
          if (targetCell.isBaseCenter && targetCell.baseOwner === opponent) {
            summary.basePressure += 1;
          }
        });

        if (piece.kind !== "king" && isCellThreatenedInState(state, opponent, piece.row, piece.col)) {
          summary.hangingPenalty += getPieceStrategicValue(piece.kind);
        }
      });

      for (var row = 0; row < BOARD_ROWS; row += 1) {
        for (var col = 0; col < BOARD_COLS; col += 1) {
          if (attackMap.counts[row][col] > 0) {
            summary.attackedCells += 1;
          }
          if (dangerMap.immediateCounts[row][col] > 0) {
            summary.hotCells += 1;
          }
        }
      }

      return summary;
    }

    function filterForcedDefenseActions(state, player, actions) {
      var currentSnapshot = getDefenseSnapshot(state, player);
      var forced = [];
      var bestSnapshot = null;

      if (!currentSnapshot.kingThreatened && !currentSnapshot.immediateWins && !currentSnapshot.baseHot) {
        return actions;
      }

      actions.forEach(function (action) {
        var nextState = cloneGameState(state);
        var nextSnapshot;
        nextState.currentPlayer = player;
        applyNpcActionToState(nextState, action);
        nextSnapshot = getDefenseSnapshot(nextState, player);

        if (isDefenseSnapshotBetter(nextSnapshot, bestSnapshot)) {
          bestSnapshot = nextSnapshot;
          forced = [action];
          return;
        }

        if (isSameDefenseSnapshot(nextSnapshot, bestSnapshot)) {
          forced.push(action);
        }
      });

      return forced.length ? forced : actions;
    }

    function collectNpcActions() {
      var player = uiState.state.currentPlayer;
      var actions = [];
    var pieces = uiState.state.players[player].pieces;
    Object.keys(pieces).forEach(function (pieceId) {
      var piece = pieces[pieceId];
      getLegalMoveTargets(piece).forEach(function (target) {
        actions.push({
          type: "move",
          pieceId: piece.id,
          row: target.row,
          col: target.col,
          score: scoreNpcMoveAction(player, piece, target.row, target.col)
        });
      });
    });

    Object.keys(uiState.state.players[player].reserve).forEach(function (pieceType) {
      if (uiState.state.players[player].reserve[pieceType] <= 0) {
        return;
      }
      getLegalReserveTargets(player, pieceType).forEach(function (target) {
        actions.push({
          type: "reserve",
          pieceType: pieceType,
          row: target.row,
          col: target.col,
          score: scoreNpcReserveAction(player, pieceType, target.row, target.col)
        });
      });
    });

    uiState.state.players[player].hand.forEach(function (card, handIndex) {
      getNpcFragmentPlacements(player, card).forEach(function (placement) {
        var pieceCell = pickNpcPieceDropCell(player, card.pieceType, placement.cells);
        if (!pieceCell) {
          return;
        }
        actions.push({
          type: "fragment",
          handIndex: handIndex,
          card: card,
          rotation: placement.rotation,
          anchor: placement.anchor,
          cells: placement.cells,
          pieceCell: { row: pieceCell.row, col: pieceCell.col },
          score: scoreNpcFragmentAction(player, card, placement.cells, pieceCell)
        });
      });
    });

    getRecoverablePieces().forEach(function (target) {
      var piece = getPiece(uiState.state, target.pieceId);
      if (!piece) {
        return;
      }
      actions.push({
        type: "recoverPiece",
        row: target.row,
        col: target.col,
        pieceId: target.pieceId,
        score: scoreNpcRecoverPieceAction(piece)
      });
    });

    getRecoverablePlacements().forEach(function (placement) {
      actions.push({
        type: "recoverFragment",
        row: placement.cells[0].row,
        col: placement.cells[0].col,
        placementId: placement.id,
        score: scoreNpcRecoverFragmentAction(placement)
      });
    });

    if (canMulligan()) {
      actions.push({
        type: "mulligan",
        score: actions.length ? 2 : 18
      });
    }

    return actions;
  }

    function chooseNpcAction() {
      var npcPlayer = uiState.state.currentPlayer;
      var opponent = getOpponentPlayer(npcPlayer);
      var actions = collectNpcActions();
      var emergencyMode = isKingUnderThreatInState(uiState.state, npcPlayer);
      var immediateWins = findImmediateWinningActionsInState(uiState.state, npcPlayer, 14);
      if (!actions.length) {
        return null;
      }
      if (immediateWins.length) {
        immediateWins.sort(function (a, b) {
          return b.score - a.score;
        });
        return immediateWins[0];
      }
      actions.sort(function (a, b) {
        return b.score - a.score;
      });
      var candidateActions = refineNpcCandidateActions(uiState.state, npcPlayer, getNpcCandidateActions(actions, emergencyMode), emergencyMode);
      var bestAction = candidateActions[0];
      var bestScore = -Infinity;

      candidateActions.forEach(function (action) {
        var nextState = cloneGameState(uiState.state);
        applyNpcActionToState(nextState, action);
        var score;
        if (nextState.winner === npcPlayer) {
          score = 1000000;
        } else if (nextState.winner) {
          score = -1000000;
        } else if (emergencyMode) {
          score = evaluateStateForNpc(nextState, npcPlayer);
          if (!isKingUnderThreatInState(nextState, npcPlayer)) {
            score += 40000;
          } else {
            score -= 40000;
          }
          if (isKingUnderThreatInState(nextState, opponent)) {
            score += 5000;
          }
        } else {
          var nextDangerMap = getDangerMapForState(nextState, npcPlayer);
          var opponentImmediateWins = nextDangerMap.immediateWins.length;
          var replyActions = collectNpcActionsForState(nextState, opponent);
          replyActions.sort(function (a, b) {
            return b.score - a.score;
          });
          replyActions = refineNpcCandidateActions(nextState, opponent, getNpcCandidateActions(replyActions, isKingUnderThreatInState(nextState, opponent)), isKingUnderThreatInState(nextState, opponent)).slice(0, Math.min(6, replyActions.length));
          if (replyActions.length) {
            score = Infinity;
            replyActions.forEach(function (replyAction) {
              var replyState = cloneGameState(nextState);
              applyNpcActionToState(replyState, replyAction);
              score = Math.min(score, evaluateStateForNpc(replyState, npcPlayer));
            });
          } else {
            score = evaluateStateForNpc(nextState, npcPlayer);
          }
          if (isKingUnderThreatInState(nextState, npcPlayer)) {
            score -= 12000;
          }
          if (isKingUnderThreatInState(nextState, opponent)) {
            score += 6500;
          }
          if (opponentImmediateWins) {
            score -= 90000 + opponentImmediateWins * 4000;
          }
          if (!opponentImmediateWins && isKingUnderThreatInState(nextState, opponent)) {
            score += 12000;
          }
        }

        if (score > bestScore || (score === bestScore && action.score > (bestAction ? bestAction.score : -Infinity))) {
          bestScore = score;
          bestAction = action;
      }
    });

    return bestAction;
  }

  function scheduleNpcTurn() {
    if (!isNpcTurn() || uiState.state.winner) {
      return;
    }
    clearNpcTurnTimer();
    uiState.npc.thinking = true;
    clearSelection();
    render();
    uiState.npc.timer = window.setTimeout(function () {
      uiState.npc.timer = null;
      performNpcTurn();
    }, 520);
  }

  function performNpcTurn() {
    if (!isNpcTurn() || uiState.state.winner) {
      uiState.npc.thinking = false;
      render();
      return;
    }
    var action = chooseNpcAction();
    if (!action) {
      uiState.npc.thinking = false;
      pushLog("NPC は有効な手を見つけられませんでした");
      endTurn();
      return;
    }

    if (action.type === "fragment") {
      clearSelection();
      placeFragmentDirect(action.card, action.handIndex, action.cells, action.pieceCell.row, action.pieceCell.col);
      return;
    }

    uiState.npc.thinking = false;
    if (action.type === "move") {
      commitMove(action.pieceId, action.row, action.col);
      return;
    }
    if (action.type === "reserve") {
      clearSelection();
      placeReservePieceDirect(action.pieceType, action.row, action.col);
      return;
    }
    if (action.type === "recoverPiece") {
      tryRecoverPiece(action.row, action.col);
      return;
    }
    if (action.type === "recoverFragment") {
      tryRecoverFragment(action.row, action.col);
      return;
    }
    if (action.type === "mulligan") {
      var playerState = uiState.state.players[uiState.state.currentPlayer];
      playerState.deck = shuffle(playerState.deck.concat(playerState.hand));
      playerState.hand = [];
      fillHand(uiState.state, uiState.state.currentPlayer);
      pushLog(PLAYER_LABELS[uiState.state.currentPlayer] + " が手札を入れ替え");
      endTurn();
    }
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
      return;
    }
    if (isNpcTurn() && !uiState.state.winner) {
      scheduleNpcTurn();
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
        return "相手から待った申請が届いています。承認すると申請者の手番まで巻き戻します。";
      }
      if (uiState.online.waitRequest.requestedBy === uiState.online.side) {
        return "待った申請中です。相手の返答を待っています。";
      }
    }
    if (uiState.state.winner) {
      return PLAYER_LABELS[uiState.state.winner] + "\u306E\u52DD\u3061\u3067\u3059\u3002";
    }
    if (uiState.pendingPlacement && uiState.pendingPlacement.type === "move") {
      var pendingMovePiece = getPiece(uiState.state, uiState.pendingPlacement.pieceId);
      if (pendingMovePiece) {
        return getPieceLabel(pendingMovePiece.kind) + " を " + formatBoardCoordinate(pendingMovePiece.row, pendingMovePiece.col) + " から " + formatBoardCoordinate(uiState.pendingPlacement.row, uiState.pendingPlacement.col) + " へ動かす確認中です。金色のマスを見て確定してください。";
      }
      return "\u3053\u306E\u79FB\u52D5\u3092\u78BA\u5B9A\u3057\u307E\u3059\u304B\uFF1F";
    }
    if (uiState.pendingFragmentPiece) {
      return "\u4ECA\u7F6E\u3044\u305F\u6B20\u7247\u306E\u4E2D\u304B\u3089\u3001" + getPieceLabel(uiState.pendingFragmentPiece.pieceType) + "\u3092\u7F6E\u304F\u30DE\u30B9\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044\u3002";
    }
    if (!uiState.selection) {
      return "\u99D2\u3092\u52D5\u304B\u3059\u304B\u3001\u6301\u3061\u99D2\u3092\u6253\u3064\u304B\u3001\u624B\u672D\u306E\u6B20\u7247\u3092\u914D\u7F6E\u3057\u3066\u304F\u3060\u3055\u3044\u3002";
    }
    if (uiState.selection.type === "piece") {
      var selectedPiece = getPiece(uiState.state, uiState.selection.pieceId);
      return (selectedPiece ? getPieceLabel(selectedPiece.kind) + " \u306E" : "") + "\u79FB\u52D5\u5148\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044\u3002\u9752\u304C\u79FB\u52D5\u5148\u3067\u3001\u5225\u306E\u81EA\u99D2\u3092\u62BC\u3059\u3068\u9078\u3073\u76F4\u3057\u3001\u540C\u3058\u99D2\u3092\u3082\u3046\u4E00\u5EA6\u62BC\u3059\u3068\u89E3\u9664\u3067\u304D\u307E\u3059\u3002";
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

  function buildRequestError(response, payload, rawText) {
    var parts = [];
    var headline = payload && payload.error ? payload.error : response.status + " " + (response.statusText || "Request failed");
    parts.push(headline);
    parts.push("HTTP " + response.status + (response.statusText ? " " + response.statusText : ""));
    if (payload && payload.exception) {
      parts.push("Exception: " + payload.exception);
    }
    if (payload && payload.file) {
      parts.push("File: " + payload.file + (payload.line ? ":" + payload.line : ""));
    }
    if (rawText && (!payload || !payload.error)) {
      parts.push(rawText.slice(0, 500));
    }
    return new Error(parts.join("\n"));
  }

  function apiRequest(url, options) {
    return fetch(url, options).then(function (response) {
      return response.text().then(function (rawText) {
        var data = null;
        if (rawText) {
          try {
            data = JSON.parse(rawText);
          } catch (error) {
            data = null;
          }
        }
        if (!response.ok || !data || !data.ok) {
          throw buildRequestError(response, data, rawText);
        }
        return data;
      });
    });
  }

  function buildApiUrl(action, roomId) {
    var url = "api?action=" + encodeURIComponent(action);
    if (roomId) {
      url += "&roomId=" + encodeURIComponent(roomId);
    }
    return url;
  }

  function cloneGameState(state) {
    return JSON.parse(JSON.stringify(state));
  }

  function resetBoardCameraView() {
    if (window.UNFOLD_3D_RENDERER && typeof window.UNFOLD_3D_RENDERER.resetCameraView === "function") {
      window.UNFOLD_3D_RENDERER.resetCameraView();
    }
  }

  function startPracticeGame(modeOverride) {
    clearNpcTurnTimer();
    resetNpcState();
    uiState.practiceMode = true;
    uiState.ruleMode = modeOverride || uiState.ruleMode || (els.onlineModeSelect ? els.onlineModeSelect.value : "original");
    uiState.state = createGame(uiState.ruleMode);
    uiState.replayIndex = uiState.state.history.length - 1;
    clearSelection();
    pushLog("ひとりテストプレイを開始");
    uiState.screen = "game";
    resetBoardCameraView();
    render();
  }

  function startNpcGame(modeOverride) {
    clearNpcTurnTimer();
    resetNpcState();
    uiState.practiceMode = false;
    uiState.npc.enabled = true;
    uiState.npc.side = "P2";
    uiState.ruleMode = modeOverride || uiState.ruleMode || (els.onlineModeSelect ? els.onlineModeSelect.value : "original");
    uiState.state = createGame(uiState.ruleMode);
    uiState.replayIndex = uiState.state.history.length - 1;
    clearSelection();
    pushLog("NPC 対戦を開始");
    uiState.screen = "game";
    resetBoardCameraView();
    render();
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

  function getWaitRestoreHistoryIndex(history, currentPlayer) {
    var index;
    if (!history || history.length <= 1) {
      return -1;
    }
    for (index = history.length - 2; index >= 0; index -= 1) {
      if ((history[index].currentPlayer || "") === currentPlayer) {
        return index;
      }
    }
    return history.length - 2;
  }

  function getWaitRestoreStateFromHistory(history, currentPlayer) {
    var targetIndex = getWaitRestoreHistoryIndex(history, currentPlayer);
    var restored;
    if (targetIndex < 0) {
      return null;
    }
    restored = cloneGameState(history[targetIndex].snapshot);
    restored.history = cloneGameState(history.slice(0, targetIndex + 1));
    return restored;
  }

  function restorePreviousTurn() {
    var history = getHistoryEntries();
    var restored;
    if (history.length <= 1) {
      return false;
    }
    clearNpcTurnTimer();
    uiState.npc.thinking = false;
    restored = getWaitRestoreStateFromHistory(history, uiState.state.currentPlayer);
    if (!restored) {
      return false;
    }
    uiState.state = restored;
    uiState.replayIndex = -1;
    clearSelection();
    render();
    if (isNpcTurn() && !uiState.state.winner) {
      scheduleNpcTurn();
    }
    return true;
  }

  function applyOnlineRoom(room, playerId, side) {
    stopRoomPolling();
    resetNpcState();
    uiState.practiceMode = false;
    var previousScreen = uiState.screen;
    var previousRoomStatus = uiState.online.roomStatus;
    var resolvedSide = resolveRoomSide(room, playerId) || side || null;
    uiState.online.enabled = true;
    uiState.online.roomId = room.id;
    uiState.online.roomName = room.name || null;
    uiState.online.playerId = playerId;
    uiState.online.side = resolvedSide;
    uiState.online.room = room;
    uiState.online.roomStatus = room.status || (room.players && room.players.P2 && room.players.P2.id ? "ready" : "waiting");
    uiState.online.waitRequest = room.waitRequest || null;
    uiState.online.version = room.version;
    uiState.ruleMode = room.gameState.ruleMode || uiState.ruleMode || "original";
    uiState.state = room.gameState;
    uiState.practiceMode = false;
    uiState.replayIndex = uiState.state.history ? uiState.state.history.length - 1 : -1;
    uiState.screen = "game";
    if (previousScreen !== "game" || (previousRoomStatus !== "playing" && uiState.online.roomStatus === "playing")) {
      resetBoardCameraView();
    }
    saveOnlineSession();
    clearSelection();
    scheduleRoomPolling();
    render();
  }

  function resetOnlineState(message) {
    stopRoomPolling();
    resetNpcState();
    uiState.online.enabled = false;
    uiState.online.roomId = null;
    uiState.online.roomName = null;
    uiState.online.playerId = null;
    uiState.online.side = null;
    uiState.online.room = null;
    uiState.online.roomStatus = "offline";
    uiState.online.waitRequest = null;
    uiState.online.version = 0;
    uiState.online.syncing = false;
    clearOnlineSession();
    uiState.screen = "lobby";
    uiState.practiceMode = false;
    if (message) {
      uiState.state = createGame(uiState.ruleMode);
      clearSelection();
      pushLog(message);
    }
    render();
    refreshRoomList({ silent: !!message });
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
      uiState.online.room = data.room;
      uiState.online.version = data.room.version;
      uiState.online.roomStatus = data.room.status || uiState.online.roomStatus;
      uiState.online.side = resolveRoomSide(data.room, uiState.online.playerId) || uiState.online.side;
      uiState.online.roomName = data.room.name || uiState.online.roomName;
      uiState.online.waitRequest = data.room.waitRequest || null;
      uiState.ruleMode = data.room.gameState.ruleMode || uiState.ruleMode;
      uiState.state = data.room.gameState;
      clearSelection();
      if (forceRender !== false) {
        render();
      }
    }).catch(function (error) {
      if (/Room not found|Player is not in this room/.test(error.message)) {
        resetOnlineState("部屋が閉じられたため、オンライン対戦を終了しました");
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
      uiState.online.room = data.room;
      uiState.online.version = data.room.version;
      uiState.online.roomStatus = data.room.status || uiState.online.roomStatus;
      uiState.online.side = resolveRoomSide(data.room, uiState.online.playerId) || uiState.online.side;
      uiState.online.roomName = data.room.name || uiState.online.roomName;
      uiState.online.waitRequest = data.room.waitRequest || null;
      uiState.state = data.room.gameState;
      uiState.ruleMode = data.room.gameState.ruleMode || uiState.ruleMode;
      render();
    }).catch(function (error) {
      if (/Room not found|Player is not in this room/.test(error.message)) {
        resetOnlineState("部屋が閉じられたため、オンライン対戦を終了しました");
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
    var roomName = getOnlineRoomName();
    var password = getLobbyPassword();
    uiState.ruleMode = mode;
    return apiRequest(buildApiUrl("room.create"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: getOnlinePlayerName(),
        roomName: roomName,
        password: password,
        ruleMode: mode,
        gameState: localState
      })
    }).then(function (data) {
      rememberAdminKey(data.room.id, data.adminKey);
      applyOnlineRoom(data.room, data.playerId, data.side);
      pushLog("オンライン対戦の部屋 " + data.room.id + " を作成");
      setLobbyNotice("部屋 " + data.room.id + " を作成しました。管理キー: " + data.adminKey);
      if (els.testOutput) {
        els.testOutput.textContent = "ROOM READY\n参加コード: " + data.room.id + "\n管理キー: " + data.adminKey;
      }
    }).catch(function (error) {
      if (els.testOutput) {
        els.testOutput.textContent = "ROOM ERROR\n" + error.message;
      }
    });
  }

  function joinOnlineRoom(roomIdOverride, passwordOverride) {
    var roomId = roomIdOverride || (els.onlineRoomInput ? els.onlineRoomInput.value.trim().toUpperCase() : "");
    var password = typeof passwordOverride === "string" ? passwordOverride : getLobbyPassword();
    if (!roomId) {
      if (els.testOutput) {
        els.testOutput.textContent = "ROOM ERROR\n参加コードを入力してください。";
      }
      return Promise.resolve();
    }
    return apiRequest(buildApiUrl("room.join"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: roomId,
        name: getOnlinePlayerName(),
        password: password
      })
    }).then(function (data) {
      applyOnlineRoom(data.room, data.playerId, data.side);
      pushLog("オンライン対戦の部屋 " + data.room.id + " に参加");
      setLobbyNotice("");
      if (els.testOutput) {
        els.testOutput.textContent = "ROOM JOINED\n参加コード: " + data.room.id;
      }
    }).catch(function (error) {
      if (els.testOutput) {
        els.testOutput.textContent = "ROOM ERROR\n" + error.message;
      }
    });
  }

  function startOnlineRoom() {
    if (!isOnlineGame()) {
      return Promise.resolve();
    }
    return apiRequest(buildApiUrl("room.start", uiState.online.roomId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: uiState.online.roomId,
        playerId: uiState.online.playerId
      })
    }).then(function (data) {
      applyOnlineRoom(data.room, uiState.online.playerId, data.side);
      pushLog("オンライン対戦の部屋 " + data.room.id + " を開始");
      if (els.testOutput) {
        els.testOutput.textContent = "ROOM STARTED\n参加コード: " + data.room.id + "\n先手後手をランダムに決定しました。";
      }
    }).catch(function (error) {
      if (els.testOutput) {
        els.testOutput.textContent = "ROOM ERROR\n" + error.message;
      }
    });
  }

  function restoreOnlineSession() {
    var session = loadOnlineSession();
    if (!session || !session.roomId || !session.playerId) {
      return Promise.resolve(false);
    }
    if (els.onlineNameInput && session.playerName && !els.onlineNameInput.value.trim()) {
      els.onlineNameInput.value = session.playerName;
    }
    return apiRequest(buildApiUrl("room.get", session.roomId) + "&playerId=" + encodeURIComponent(session.playerId), {
      method: "GET"
    }).then(function (data) {
      applyOnlineRoom(data.room, session.playerId, resolveRoomSide(data.room, session.playerId));
      pushLog("オンライン対戦の部屋 " + data.room.id + " に再接続");
      if (els.testOutput) {
        els.testOutput.textContent = "ROOM RESTORED\n参加コード: " + data.room.id;
      }
      return true;
    }).catch(function () {
      clearOnlineSession();
      return false;
    });
  }

  function deleteRoomByKey(roomIdOverride, adminKeyOverride) {
    var roomId = roomIdOverride || (els.deleteRoomCodeInput ? els.deleteRoomCodeInput.value.trim().toUpperCase() : "");
    var adminKey = adminKeyOverride || (els.deleteRoomKeyInput ? els.deleteRoomKeyInput.value.trim().toUpperCase() : "");
    if (!roomId || !adminKey) {
      setLobbyNotice("削除したい参加コードと管理キーを入力してください。");
      return Promise.resolve();
    }
    return apiRequest(buildApiUrl("room.deleteByKey"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: roomId,
        adminKey: adminKey
      })
    }).then(function (data) {
      forgetAdminKey(roomId);
      if (els.deleteRoomCodeInput && !roomIdOverride) {
        els.deleteRoomCodeInput.value = "";
      }
      if (els.deleteRoomKeyInput && !adminKeyOverride) {
        els.deleteRoomKeyInput.value = "";
      }
      setLobbyNotice(data.message || ("部屋 " + roomId + " を削除しました。"));
      return refreshRoomList({ silent: true });
    }).catch(function (error) {
      if (els.testOutput) {
        els.testOutput.textContent = "ROOM ERROR\n" + error.message;
      }
      setLobbyNotice("部屋削除に失敗しました。");
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
    if (!isOnlineGame() || !isOnlineRoomOwner()) {
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
        pushLog("待ったで自分の手番まで戻しました");
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
    uiState.roomAdminKeys = loadRoomAdminKeys();
    restoreStoredOnlineName();
    setupSimpleGameLayout();
    setScreen("lobby");

    if (els.newGameBtn) {
      els.newGameBtn.addEventListener("click", function () {
        startPracticeGame("original");
      });
    }
    if (els.newGameShogiBtn) {
      els.newGameShogiBtn.addEventListener("click", function () {
        startPracticeGame("shogi");
      });
    }
    if (els.npcGameBtn) {
      els.npcGameBtn.addEventListener("click", function () {
        startNpcGame("original");
      });
    }
    if (els.npcGameShogiBtn) {
      els.npcGameShogiBtn.addEventListener("click", function () {
        startNpcGame("shogi");
      });
    }
    if (els.onlineNameInput) {
      els.onlineNameInput.addEventListener("input", function () {
        saveOnlineName(els.onlineNameInput.value.trim());
      });
    }
    if (els.toggleAiDebugBtn) {
      els.toggleAiDebugBtn.addEventListener("click", function () {
        var modes = ["off", "attack", "danger", "both"];
        var currentMode = uiState.aiDebug && uiState.aiDebug.mode ? uiState.aiDebug.mode : "off";
        var nextIndex = (modes.indexOf(currentMode) + 1) % modes.length;
        uiState.aiDebug.mode = modes[nextIndex];
        if (uiState.aiDebug.mode === "off") {
          uiState.aiDebug.overlay = null;
          uiState.aiDebug.cacheKey = "";
        }
        render();
      });
    }

    if (els.backToLobbyBtn) {
      els.backToLobbyBtn.addEventListener("click", function () {
        if (isOnlineGame()) {
          if (isOnlineRoomOwner()) {
            if (!window.confirm("部屋を解散してロビーへ戻りますか？")) {
              return;
            }
            disbandOnlineRoom();
            return;
          }
          if (!window.confirm("部屋から退出してロビーへ戻りますか？")) {
            return;
          }
          leaveOnlineRoom();
          return;
        }
        clearNpcTurnTimer();
        uiState.npc.thinking = false;
        resetNpcState();
        uiState.practiceMode = false;
        uiState.screen = "lobby";
        render();
      });
    }
    if (els.startMatchBtn) {
      els.startMatchBtn.addEventListener("click", function () {
        startOnlineRoom();
      });
    }

    if (els.practiceRestartBtn) {
      els.practiceRestartBtn.addEventListener("click", function () {
        if (!(uiState.screen === "game" && !isOnlineGame() && (uiState.practiceMode || isNpcGame()))) {
          return;
        }
        if (isNpcGame()) {
          startNpcGame();
        } else {
          startPracticeGame();
        }
      });
    }

    if (els.practiceModeBtn) {
      els.practiceModeBtn.addEventListener("click", function () {
        if (!(uiState.screen === "game" && !isOnlineGame() && (uiState.practiceMode || isNpcGame()))) {
          return;
        }
        if (!window.confirm("駒タイプを変更すると、いまの盤面はリセットされます。変更しますか？")) {
          return;
        }
        uiState.ruleMode = uiState.ruleMode === "original" ? "shogi" : "original";
        if (els.onlineModeSelect) {
          els.onlineModeSelect.value = uiState.ruleMode;
        }
        if (isNpcGame()) {
          startNpcGame();
          pushLog("NPC 対戦の駒モードを " + GAME_MODE_LABELS[uiState.ruleMode] + " に変更");
        } else {
          startPracticeGame();
          pushLog("ひとりテストプレイの駒モードを " + GAME_MODE_LABELS[uiState.ruleMode] + " に変更");
        }
        render();
      });
    }

    if (els.runTestsBtn) {
      els.runTestsBtn.addEventListener("click", function () {
        els.testOutput.textContent = runTests();
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
    if (els.refreshRoomsBtn) {
      els.refreshRoomsBtn.addEventListener("click", function () {
        refreshRoomList();
      });
    }
    if (els.submitFeedbackBtn) {
      els.submitFeedbackBtn.addEventListener("click", function () {
        submitFeedback();
      });
    }
    if (els.refreshFeedbackBtn) {
      els.refreshFeedbackBtn.addEventListener("click", function () {
        loadSiteInfo(false);
      });
    }
    if (els.deleteRoomByKeyBtn) {
      els.deleteRoomByKeyBtn.addEventListener("click", function () {
        deleteRoomByKey();
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
    if (els.p1WaitBtn) {
      els.p1WaitBtn.addEventListener("click", function () {
        requestWait();
      });
    }
    if (els.p2WaitBtn) {
      els.p2WaitBtn.addEventListener("click", function () {
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
    render();
    loadSiteInfo(true);
    refreshRoomList({ silent: true });
    restoreOnlineSession().then(function (restored) {
      if (!restored) {
        render();
      }
    });
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
      },
      getAiDebugOverlay: function () {
        return uiState.aiDebug ? uiState.aiDebug.overlay : null;
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
