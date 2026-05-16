(function () {
  var PLAYER_LABELS = { P1: "\u5148\u624b", P2: "\u5f8c\u624b" };
  var PIECE_NOTATION_STORAGE_KEY = "unfoldPieceNotation";
  var BOARD_DISPLAY_STORAGE_KEY = "unfoldBoardDisplay";
  var PIECE_NOTATION_DEFAULT = "letter";
  var BOARD_DISPLAY_DEFAULT = "3d";
  var PIECE_NOTATION_OPTIONS = [
    { value: "letter", label: "\u82F1\u8A9E1\u5B57" },
    { value: "code", label: "\u82F1\u8A9E3\u5B57" },
    { value: "kanji", label: "\u6F22\u5B57" }
  ];
  var BOARD_DISPLAY_OPTIONS = [
    { value: "3d", label: "\u7ACB\u4F53\u76E4\u9762" },
    { value: "2d", label: "2D\u76E4\u9762" }
  ];
  var ORIGINAL_PIECE_INFO = {
    king: { ja: "\u5C55\u754C\u8005", en: "Unfolder", kana: "\u30A2\u30F3\u30D5\u30A9\u30EB\u30C0\u30FC", kanji: "\u5C55", letter: "U", code: "UNF" },
    decoy: { ja: "\u8A98\u5F15\u58EB", en: "Decoy", kana: "\u30C7\u30B3\u30A4", kanji: "\u8A98", letter: "D", code: "DEC" },
    flanker: { ja: "\u5074\u6483\u58EB", en: "Flanker", kana: "\u30D5\u30E9\u30F3\u30AB\u30FC", kanji: "\u5074", letter: "F", code: "FLA" },
    guard: { ja: "\u8B77\u885B\u58EB", en: "Guardian", kana: "\u30AC\u30FC\u30C7\u30A3\u30A2\u30F3", kanji: "\u8B77", letter: "G", code: "GUA" },
    vanguard: { ja: "\u524D\u885D\u58EB", en: "Vanguard", kana: "\u30F4\u30A1\u30F3\u30AC\u30FC\u30C9", kanji: "\u524D", letter: "V", code: "VAN" },
    disruptor: { ja: "\u652A\u4E71\u58EB", en: "Harrier", kana: "\u30CF\u30EA\u30A2\u30FC", kanji: "\u652A", letter: "H", code: "HAR" },
    rider: { ja: "\u9A0E\u4E57\u58EB", en: "Rider", kana: "\u30E9\u30A4\u30C0\u30FC", kanji: "\u9A0E", letter: "R", code: "RID" },
    charger: { ja: "\u7A81\u6483\u58EB", en: "Lancer", kana: "\u30E9\u30F3\u30B5\u30FC", kanji: "\u7A81", letter: "L", code: "LAN" },
    barrier: { ja: "\u7D50\u754C\u58EB", en: "Warden", kana: "\u30A6\u30A9\u30FC\u30C7\u30F3", kanji: "\u7D50", letter: "W", code: "WRD" },
    realmKnight: { ja: "\u754C\u9A0E\u58EB", en: "Bound Knight", kana: "\u30D0\u30A6\u30F3\u30C9\u30CA\u30A4\u30C8", kanji: "\u754C", letter: "B", code: "BKN" },
    destroyer: { ja: "\u6EC5\u754C\u8005", en: "Obliterator", kana: "\u30AA\u30D6\u30EA\u30C6\u30EC\u30FC\u30BF\u30FC", kanji: "\u6EC5", letter: "O", code: "OBL" },
    chaosBeast: { ja: "\u6DF7\u6C8C\u7363", en: "Chaos Beast", kana: "\u30AB\u30AA\u30B9\u30D3\u30FC\u30B9\u30C8", kanji: "\u6DF7", letter: "C", code: "CHS" }
  };
  var SHOGI_PIECE_INFO = {
    king: { ja: "\u738B\u5C06 / \u7389\u5C06", en: "King", kana: "\u30AD\u30F3\u30B0", kanji: "\u738B", letter: "K", code: "KNG" },
    decoy: { ja: "\u9999\u8ECA", en: "Lance", kana: "\u30E9\u30F3\u30B9", kanji: "\u9999", letter: "L", code: "LNC" },
    rider: { ja: "\u6842\u99AC", en: "Knight", kana: "\u30CA\u30A4\u30C8", kanji: "\u6842", letter: "N", code: "KNT" },
    flanker: { ja: "\u9280\u5C06", en: "Silver", kana: "\u30B7\u30EB\u30D0\u30FC", kanji: "\u9280", letter: "S", code: "SLV" },
    guard: { ja: "\u91D1\u5C06", en: "Gold", kana: "\u30B4\u30FC\u30EB\u30C9", kanji: "\u91D1", letter: "G", code: "GLD" },
    vanguard: { ja: "\u6B69\u5175", en: "Pawn", kana: "\u30DD\u30FC\u30F3", kanji: "\u6B69", letter: "P", code: "PWN" },
    disruptor: { ja: "\u89D2\u884C", en: "Bishop", kana: "\u30D3\u30B7\u30E7\u30C3\u30D7", kanji: "\u89D2", letter: "B", code: "BSP" },
    charger: { ja: "\u98DB\u8ECA", en: "Rook", kana: "\u30EB\u30FC\u30AF", kanji: "\u98DB", letter: "R", code: "ROK" }
  };
  var ORIGINAL_PIECE_LABELS = makePieceLabelMap(ORIGINAL_PIECE_INFO, "ja");
  var SHOGI_PIECE_LABELS = makePieceLabelMap(SHOGI_PIECE_INFO, "ja");
  var ORIGINAL_PIECE_SHORT_LABELS = makePieceLabelMap(ORIGINAL_PIECE_INFO, "kanji");
  var SHOGI_PIECE_SHORT_LABELS = makePieceLabelMap(SHOGI_PIECE_INFO, "kanji");
  function makePieceLabelMap(infoMap, field) {
    var labels = {};
    Object.keys(infoMap).forEach(function (pieceType) {
      labels[pieceType] = infoMap[pieceType][field] || infoMap[pieceType].ja || pieceType;
    });
    return labels;
  }
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
  function isValidPieceNotation(value) {
    return PIECE_NOTATION_OPTIONS.some(function (option) {
      return option.value === value;
    });
  }

  function getStoredPieceNotation() {
    var stored;
    try {
      stored = window.localStorage.getItem(PIECE_NOTATION_STORAGE_KEY);
    } catch (error) {
      stored = null;
    }
    return isValidPieceNotation(stored) ? stored : PIECE_NOTATION_DEFAULT;
  }

  function savePieceNotation(value) {
    try {
      window.localStorage.setItem(PIECE_NOTATION_STORAGE_KEY, value);
    } catch (error) {
      // Storage can be unavailable in private or local-file contexts.
    }
  }

  function isValidBoardDisplayMode(value) {
    return BOARD_DISPLAY_OPTIONS.some(function (option) {
      return option.value === value;
    });
  }

  function getStoredBoardDisplayMode() {
    var stored;
    try {
      stored = window.localStorage.getItem(BOARD_DISPLAY_STORAGE_KEY);
    } catch (error) {
      stored = null;
    }
    return isValidBoardDisplayMode(stored) ? stored : BOARD_DISPLAY_DEFAULT;
  }

  function saveBoardDisplayMode(value) {
    try {
      window.localStorage.setItem(BOARD_DISPLAY_STORAGE_KEY, value);
    } catch (error) {
      // Storage can be unavailable in private or local-file contexts.
    }
  }

  var DEFAULT_TIME_CONTROL = "none";
  var TIME_CONTROL_OPTIONS = [
    { value: "none", label: "\u6301\u3061\u6642\u9593\u306A\u3057", seconds: 0 },
    { value: "3m", label: "3\u5206\u5207\u308C\u8CA0\u3051", seconds: 180 },
    { value: "5m", label: "5\u5206\u5207\u308C\u8CA0\u3051", seconds: 300 },
    { value: "10m", label: "10\u5206\u5207\u308C\u8CA0\u3051", seconds: 600 },
    { value: "15m", label: "15\u5206\u5207\u308C\u8CA0\u3051", seconds: 900 }
  ];
  var DEFAULT_START_SIDE = "P1";
  var START_SIDE_OPTIONS = [
    { value: "P1", npcLabel: "\u3042\u306A\u305F\u304C\u5148\u624B", practiceLabel: "\u5148\u624B\u5074\u3092\u624B\u524D" },
    { value: "P2", npcLabel: "\u3042\u306A\u305F\u304C\u5F8C\u624B", practiceLabel: "\u5F8C\u624B\u5074\u3092\u624B\u524D" },
    { value: "random", npcLabel: "\u30E9\u30F3\u30C0\u30E0\u306B\u6C7A\u3081\u308B", practiceLabel: "\u30E9\u30F3\u30C0\u30E0\u306B\u6C7A\u3081\u308B" }
  ];
  var INITIAL_STANDBY_STORAGE_KEY = "unfoldInitialStandbyRule";
  var DEFAULT_INITIAL_STANDBY_RULE = "fragments";
  var INITIAL_STANDBY_RULE_OPTIONS = [
    {
      value: "fragments",
      label: "\u5C55\u958B\u56F3\u3082\u914D\u7F6E",
      description: "\u521D\u671F\u624B\u672D3\u679A\u306E\u5C55\u958B\u56F3\u3092\u672C\u9663\u306B1\u8FBA\u3067\u63A5\u3059\u308B\u5F62\u3067\u7F6E\u304D\u307E\u3059\u3002"
    }
  ];
  function getStoredInitialStandbyRule() {
    var stored;
    try {
      stored = window.localStorage.getItem(INITIAL_STANDBY_STORAGE_KEY);
    } catch (error) {
      stored = null;
    }
    return normalizeInitialStandbyRule(stored || DEFAULT_INITIAL_STANDBY_RULE);
  }

  function saveInitialStandbyRule(value) {
    try {
      window.localStorage.setItem(INITIAL_STANDBY_STORAGE_KEY, normalizeInitialStandbyRule(value));
    } catch (error) {
      // Storage can be unavailable in private or local-file contexts.
    }
  }
  var DEFAULT_NPC_STRENGTH = "standard";
  var NPC_STRENGTH_OPTIONS = [
    { value: "quick", label: "\u8EFD\u5FEB", lookaheadDepth: 1, selfPlayFast: true },
    { value: "standard", label: "\u6A19\u6E96", lookaheadDepth: 4, selfPlayFast: false },
    { value: "expert", label: "\u4E0A\u7D1A", lookaheadDepth: 5, selfPlayFast: false }
  ];
  var REVIEW_NOTE_TAG_LABELS = {
    good: "良さそう",
    question: "要検討",
    danger: "危険",
    win: "勝ち筋",
    idea: "着想"
  };
  var SHOGI_PLAYABLE_PIECE_ORDER = ["king", "decoy", "rider", "flanker", "guard", "vanguard", "charger", "disruptor"];
  var MOVEMENT_SUMMARY_ORDER = ["decoy", "flanker", "guard", "vanguard", "rider", "charger", "disruptor", "barrier", "realmKnight", "chaosBeast", "destroyer", "king"];
  var SHOGI_MOVEMENT_SUMMARY_ORDER = ["decoy", "rider", "flanker", "guard", "vanguard", "charger", "disruptor", "king"];
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
  var FRAGMENT_SHAPE_CACHE = {};
  var CARDINAL_DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
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
    { fragmentType: "net08", pieceType: "realmKnight" },
    { fragmentType: "net09", pieceType: "flanker" },
    { fragmentType: "net09m", pieceType: "flanker" },
    { fragmentType: "net10", pieceType: "disruptor" },
    { fragmentType: "net10m", pieceType: "disruptor" },
    { fragmentType: "net11", pieceType: "decoy" },
    { fragmentType: "net11m", pieceType: "decoy" }
  ];
  var SHOGI_STARTER_DECK = [
    { fragmentType: "net01", pieceType: "vanguard" },
    { fragmentType: "net02", pieceType: "guard" },
    { fragmentType: "net02m", pieceType: "guard" },
    { fragmentType: "net03", pieceType: "flanker" },
    { fragmentType: "net03m", pieceType: "flanker" },
    { fragmentType: "net04", pieceType: "charger" },
    { fragmentType: "net04m", pieceType: "vanguard" },
    { fragmentType: "net05", pieceType: "vanguard" },
    { fragmentType: "net05m", pieceType: "vanguard" },
    { fragmentType: "net06", pieceType: "disruptor" },
    { fragmentType: "net07", pieceType: "rider" },
    { fragmentType: "net07m", pieceType: "rider" },
    { fragmentType: "net08", pieceType: "guard" },
    { fragmentType: "net08", pieceType: "vanguard" },
    { fragmentType: "net09", pieceType: "decoy" },
    { fragmentType: "net09m", pieceType: "decoy" },
    { fragmentType: "net10", pieceType: "vanguard" },
    { fragmentType: "net10m", pieceType: "vanguard" },
    { fragmentType: "net11", pieceType: "vanguard" },
    { fragmentType: "net11m", pieceType: "vanguard" }
  ];
  var BOARD_ROWS = 9;
  var BOARD_COLS = 15;
  var BOARD_ROW_LABELS = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];
  var HAND_LIMIT = 3;
  var INITIAL_STANDBY_PLACEMENTS = 3;
  var REPLAY_FILE_FORMAT = "unfold-kifu";
  var REPLAY_FILE_VERSION = 1;
  var NPC_WORKER_SCRIPT_URL = "unfold-npc-worker.js?v=20260517kifu01";
  var NPC_BOOK_URL = "api?action=npc.book.current";
  var NPC_BOOK_STATIC_URL = "unfold-npc-book.json?v=20260516a";
  var UNFOLD_WASM_URL = "unfold-engine.wasm?v=20260516c";
  var NPC_SEARCH_MEMORY_STORAGE_KEY = "unfoldNpcSearchMemoryV2";
  var NPC_SEARCH_MEMORY_VERSION = "search-v2-20260517";
  var NPC_SEARCH_MEMORY_MAX_STORAGE_ENTRIES = 360;
  var NPC_SEARCH_MEMORY_MAX_STORAGE_HISTORY = 600;
  var NPC_SEARCH_MEMORY_FLUSH_INTERVAL_MS = 2500;
  var WASM_BOARD_MAP_PTR = 0;
  var unfoldWasmRuntime = {
    supported: typeof WebAssembly === "object",
    loading: false,
    ready: false,
    error: "",
    exports: null,
    memory: null,
    uses: 0,
    batchUses: 0
  };
  var npcWorkerRuntime = {
    worker: null,
    disabled: false,
    requestId: 0,
    callbacks: {},
    fallbackReason: "",
    seeded: false
  };

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
    winnerRestartBtn: document.getElementById("winnerRestartBtn"),
    messageLabel: document.getElementById("messageLabel"),
    p1Reserve: document.getElementById("p1Reserve"),
    p2Reserve: document.getElementById("p2Reserve"),
    p1FragmentReserve: document.getElementById("p1FragmentReserve"),
    p2FragmentReserve: document.getElementById("p2FragmentReserve"),
    p1Hand: document.getElementById("p1Hand"),
    p2Hand: document.getElementById("p2Hand"),
    p1DeckCount: document.getElementById("p1DeckCount"),
    p2DeckCount: document.getElementById("p2DeckCount"),
    logList: document.getElementById("logList"),
    testOutput: document.getElementById("testOutput"),
    movementSummary: document.getElementById("movementSummary"),
    fragmentCatalog: document.getElementById("fragmentCatalog"),
    pieceNotationSelect: document.getElementById("pieceNotationSelect"),
    boardDisplaySelect: document.getElementById("boardDisplaySelect"),
    pendingPieceBanner: document.getElementById("pendingPieceBanner"),
    advicePanel: document.getElementById("advicePanel"),
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
    localRuleModeField: null,
    localRuleModeSelect: null,
    npcStrengthField: null,
    npcStrengthSelect: null,
    timeControlSelect: document.getElementById("timeControlSelect"),
    timeControlField: null,
    startSideField: null,
    startSideSelect: null,
    initialStandbyRuleField: null,
    initialStandbyRuleSelect: null,
    onlineInitialStandbyRuleField: null,
    onlineInitialStandbyRuleSelect: null,
    clockPanel: null,
    clockP1Label: null,
    clockP2Label: null,
    onlineRoomPasswordInput: document.getElementById("onlineRoomPasswordInput"),
    onlineRoomVisibilitySelect: null,
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
      historyNextBtn: document.getElementById("historyNextBtn"),
      replayExportBtn: null,
      replayImportBtn: null,
      replayReviewBtn: null,
      replayStudyBtn: null,
      replayFileInput: null,
      replayLibraryList: null,
      analysisMetaWrap: null,
      analysisTitleField: null,
      analysisCommentField: null,
      analysisMetaSaveBtn: null,
      analysisMetaStatus: null,
      variationTrailWrap: null,
      variationTrailList: null,
      compareWrap: null,
      compareSourceBar: null,
      compareSummary: null,
      compareList: null,
      reviewNoteField: null,
      reviewNoteTags: null,
      reviewNoteSaveBtn: null,
      reviewArrowModeBtn: null,
      reviewArrowClearBtn: null,
      reviewArrowStatus: null,
      reviewArrowOverlay: null,
      branchRoomsWrap: null,
      branchRoomsOrigin: null,
      branchRoomsStatus: null,
      branchRoomsList: null,
      branchRoomsRefreshBtn: null,
      branchRoomsToggleBtn: null,
      editorLaunchBtn: null,
      editorModal: null,
      editorGrid: null,
      editorOwnerSelect: null,
      editorPieceSelect: null,
      editorPaintSelect: null,
      editorCurrentPlayerSelect: null,
      editorUseCurrentBtn: null,
      editorUseBlankBtn: null,
      editorCloseBtn: null,
      editorStartPracticeBtn: null,
      editorCreateStudyBtn: null,
      replayLibrarySearch: null,
      replayLibraryFilterBar: null,
      replayLibraryStats: null,
      movementReferenceBtn: null,
      fragmentReferenceBtn: null,
      summaryReferenceBtn: null,
      referencePopup: null,
      referencePopupTitle: null,
      referencePopupBody: null,
      referencePopupCloseBtn: null
    };

  var uiState = {
    state: null,
    screen: "lobby",
    practiceMode: false,
    tsumeMode: false,
    tsumeStartedAt: null,
    replayOnly: false,
    replayArchive: null,
    lobbyMenu: "home",
    lobbyOnlineTab: "create",
    lobbySoloTab: "npc",
    lobbyRulesTab: "summary",
    onlineStudySource: "latest",
    npc: {
      enabled: false,
      side: "P2",
      thinking: false,
      timer: null,
      strategyByPlayer: null,
      selfPlayFast: false,
      bulkSelfPlay: false,
      lookaheadDepth: 1,
      strength: DEFAULT_NPC_STRENGTH,
      thinkStartedAt: null,
      lastThinkMs: 0,
      totalThinkMs: 0,
      movesThought: 0,
      lastSearchStats: null
    },
    ruleMode: "original",
    pieceNotation: getStoredPieceNotation(),
    boardDisplayMode: getStoredBoardDisplayMode(),
    initialStandbyRule: getStoredInitialStandbyRule(),
    timeControl: DEFAULT_TIME_CONTROL,
    startSidePreference: DEFAULT_START_SIDE,
    localViewerSide: DEFAULT_START_SIDE,
    clockTimer: null,
    lobbyRooms: [],
    roomAdminKeys: {},
    online: {
      enabled: false,
      roomId: null,
      roomName: null,
      playerId: null,
      viewerId: null,
      side: null,
      role: "player",
      room: null,
      finalState: null,
      reviewIndex: -1,
      roomType: "match",
      studyKind: "match",
      reviewNotes: {},
      reviewArrows: {},
      roomStatus: "offline",
      waitRequest: null,
      version: 0,
      pollTimer: null,
      syncing: false
    },
    replayIndex: -1,
    replayLibraryQuery: "",
    replayLibraryFilter: "all",
    compareSourceMode: "mainline",
    compareSiblingRoomId: null,
    reviewNoteTags: [],
    boardEditor: {
      open: false,
      working: null,
      owner: "P1",
      pieceType: "king",
      paint: "piece",
      currentPlayer: "P1"
    },
    lastActionText: "",
    branchRoomsExpanded: false,
    selection: null,
    reviewArrowMode: false,
    reviewArrowAnchor: null,
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

  function createGame(mode, timeControl, options) {
    options = options || {};
    var ruleMode = mode || uiState.ruleMode || "original";
    var clockControl = timeControl || uiState.timeControl || DEFAULT_TIME_CONTROL;
    var initialStandbyRule = normalizeInitialStandbyRule(options.initialStandbyRule || options.standbyRule || uiState.initialStandbyRule || DEFAULT_INITIAL_STANDBY_RULE);
    var state = {
      board: [],
      ruleMode: ruleMode,
      phase: "standby",
      initialSetup: createInitialSetupState(initialStandbyRule),
      clock: createClockState(clockControl),
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
    fillHand(state, "P1");
    fillHand(state, "P2");
    recordHistorySnapshot(state, "初期スタンバイ開始");

    return state;
  }

  function createInitialSetupOrder() {
    var order = [];
    for (var i = 0; i < INITIAL_STANDBY_PLACEMENTS; i += 1) {
      order.push("P1");
      order.push("P2");
    }
    return order;
  }

  function normalizeInitialStandbyCount(value) {
    if (value === true) {
      return 1;
    }
    if (value === false || value === null || typeof value === "undefined") {
      return 0;
    }
    return Math.max(0, Math.min(INITIAL_STANDBY_PLACEMENTS, Number(value) || 0));
  }

  function createInitialSetupState(rule) {
    return {
      rule: normalizeInitialStandbyRule(rule || DEFAULT_INITIAL_STANDBY_RULE),
      order: createInitialSetupOrder(),
      index: 0,
      placed: {
        P1: 0,
        P2: 0
      }
    };
  }

  function ensureInitialSetupState(state) {
    if (!state.initialSetup) {
      state.initialSetup = createInitialSetupState();
    }
    state.initialSetup.rule = normalizeInitialStandbyRule(state.initialSetup.rule);
    if (!state.initialSetup.placed) {
      state.initialSetup.placed = {
        P1: 0,
        P2: 0
      };
    }
    state.initialSetup.placed.P1 = normalizeInitialStandbyCount(state.initialSetup.placed.P1);
    state.initialSetup.placed.P2 = normalizeInitialStandbyCount(state.initialSetup.placed.P2);
    if (!state.initialSetup.order || state.initialSetup.order.length !== INITIAL_STANDBY_PLACEMENTS * 2) {
      state.initialSetup.order = createInitialSetupOrder();
    }
    if (typeof state.initialSetup.index !== "number") {
      state.initialSetup.index = 0;
    }
    state.initialSetup.index = Math.max(0, Math.min(state.initialSetup.index, state.initialSetup.order.length));
    return state.initialSetup;
  }

  function normalizeInitialStandbyRule(value) {
    return "fragments";
  }

  function getInitialStandbyRule(state) {
    return normalizeInitialStandbyRule(ensureInitialSetupState(state).rule);
  }

  function isInitialStandbyBasePieceRule(state) {
    return false;
  }

  function getInitialStandbyPlacedCount(state, player) {
    var setup = ensureInitialSetupState(state);
    return normalizeInitialStandbyCount(setup.placed[player]);
  }

  function getInitialStandbyRemainingCount(state, player) {
    return Math.max(0, INITIAL_STANDBY_PLACEMENTS - getInitialStandbyPlacedCount(state, player));
  }

  function getInitialStandbyNextCount(state, player) {
    return Math.min(INITIAL_STANDBY_PLACEMENTS, getInitialStandbyPlacedCount(state, player) + 1);
  }

  function getInitialStandbyProgressText(state, player) {
    return getInitialStandbyNextCount(state, player) + "/" + INITIAL_STANDBY_PLACEMENTS;
  }

  function getInitialStandbyStepLabel(state, player) {
    return getInitialStandbyNextCount(state, player) + "枚目 / 全" + INITIAL_STANDBY_PLACEMENTS + "枚";
  }

  function isInitialStandbyPhase(state) {
    var setup;
    if (!state || state.winner || state.phase !== "standby") {
      return false;
    }
    setup = ensureInitialSetupState(state);
    return setup.index < setup.order.length;
  }

  function getInitialStandbyPlayer(state) {
    var setup;
    if (!isInitialStandbyPhase(state)) {
      return null;
    }
    setup = ensureInitialSetupState(state);
    return setup.order[setup.index] || state.currentPlayer;
  }

  function advanceInitialStandbyForState(state, player) {
    var setup = ensureInitialSetupState(state);
    setup.placed[player] = Math.min(INITIAL_STANDBY_PLACEMENTS, normalizeInitialStandbyCount(setup.placed[player]) + 1);
    if (setup.placed[player] >= INITIAL_STANDBY_PLACEMENTS) {
      fillHand(state, player);
    }
    setup.index += 1;
    while (setup.index < setup.order.length && normalizeInitialStandbyCount(setup.placed[setup.order[setup.index]]) >= INITIAL_STANDBY_PLACEMENTS) {
      setup.index += 1;
    }
    if (setup.index >= setup.order.length) {
      state.phase = "play";
      state.currentPlayer = "P1";
      state.turnNumber = 1;
      fillHand(state, "P1");
      fillHand(state, "P2");
      if (state.clock) {
        state.clock.activePlayer = null;
        state.clock.activeSince = null;
      }
      return true;
    }
    state.currentPlayer = setup.order[setup.index];
    if (state.clock) {
      state.clock.activePlayer = null;
      state.clock.activeSince = null;
    }
    return false;
  }

  function completeInitialStandbyWithPenaltyForState(state, player) {
    var setup = ensureInitialSetupState(state);
    var skipped = getInitialStandbyRemainingCount(state, player);
    if (skipped <= 0) {
      return {
        skipped: 0,
        setupComplete: !isInitialStandbyPhase(state)
      };
    }
    setup.placed[player] = INITIAL_STANDBY_PLACEMENTS;
    fillHand(state, player);
    while (setup.index < setup.order.length && normalizeInitialStandbyCount(setup.placed[setup.order[setup.index]]) >= INITIAL_STANDBY_PLACEMENTS) {
      setup.index += 1;
    }
    if (setup.index >= setup.order.length) {
      state.phase = "play";
      state.currentPlayer = "P1";
      state.turnNumber = 1;
      fillHand(state, "P1");
      fillHand(state, "P2");
      if (state.clock) {
        state.clock.activePlayer = null;
        state.clock.activeSince = null;
      }
      return {
        skipped: skipped,
        setupComplete: true
      };
    }
    state.currentPlayer = setup.order[setup.index];
    if (state.clock) {
      state.clock.activePlayer = null;
      state.clock.activeSince = null;
    }
    return {
      skipped: skipped,
      setupComplete: false
    };
  }

  function createInitialStandbyPenaltyActionForState(state, player) {
    if (!isInitialStandbyPhase(state) || getInitialStandbyRemainingCount(state, player) <= 0) {
      return null;
    }
    if (collectNpcInitialSetupCandidateActionsForState(state, player).length) {
      return null;
    }
    return {
      type: "setupPenalty",
      player: player,
      skipped: getInitialStandbyRemainingCount(state, player),
      score: -120000
    };
  }

  function resolveBlockedInitialStandbyPenaltiesForState(state) {
    var results = [];
    var guard = 0;
    while (isInitialStandbyPhase(state) && guard < INITIAL_STANDBY_PLACEMENTS * 2) {
      var player = state.currentPlayer;
      var action = createInitialStandbyPenaltyActionForState(state, player);
      var result;
      if (!action) {
        break;
      }
      result = completeInitialStandbyWithPenaltyForState(state, player);
      results.push({
        player: player,
        skipped: result.skipped,
        setupComplete: result.setupComplete
      });
      guard += 1;
    }
    return results;
  }

  function formatInitialStandbyPenaltyLog(result) {
    return PLAYER_LABELS[result.player] + "は初期スタンバイを置けないため、残り" + result.skipped + "回を失い、手札を3枚に補充";
  }

  function createPlayer(player, mode) {
    return {
      pieces: {},
      reserve: createReservePool(),
      fragmentReserve: createFragmentReservePool(),
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

  function createFragmentReservePool() {
    return {};
  }

  function cloneFragmentCard(card) {
    return {
      fragmentType: card.fragmentType,
      pieceType: card.pieceType || null
    };
  }

  function getFragmentReserveKey(card) {
    return card && card.fragmentType ? card.fragmentType : "";
  }

  function parseFragmentReserveKey(key) {
    var parts = String(key || "").split("|");
    if (!FRAGMENT_LIBRARY[parts[0]]) {
      return null;
    }
    return {
      fragmentType: parts[0],
      pieceType: null
    };
  }

  function normalizeFragmentReservePool(value) {
    var pool = createFragmentReservePool();
    if (Array.isArray(value)) {
      value.forEach(function (card) {
        if (card && card.fragmentType && FRAGMENT_LIBRARY[card.fragmentType]) {
          pool[getFragmentReserveKey(card)] = (pool[getFragmentReserveKey(card)] || 0) + 1;
        }
      });
      return pool;
    }
    if (value && typeof value === "object") {
      Object.keys(value).forEach(function (key) {
        var card = parseFragmentReserveKey(key);
        var count = Math.max(0, Number(value[key]) || 0);
        if (card && count > 0) {
          pool[getFragmentReserveKey(card)] = (pool[getFragmentReserveKey(card)] || 0) + count;
        }
      });
    }
    return pool;
  }

  function ensurePlayerStateContainers(state, player) {
    var playerState = state && state.players ? state.players[player] : null;
    if (!playerState) {
      return null;
    }
    playerState.reserve = playerState.reserve || createReservePool();
    playerState.fragmentReserve = normalizeFragmentReservePool(playerState.fragmentReserve);
    playerState.hand = Array.isArray(playerState.hand) ? playerState.hand : [];
    playerState.deck = Array.isArray(playerState.deck) ? playerState.deck : [];
    playerState.pieces = playerState.pieces || {};
    return playerState;
  }

  function addFragmentToReserve(playerState, card, count) {
    var key;
    if (!playerState || !card || !card.fragmentType || !FRAGMENT_LIBRARY[card.fragmentType]) {
      return;
    }
    playerState.fragmentReserve = normalizeFragmentReservePool(playerState.fragmentReserve);
    key = getFragmentReserveKey(card);
    playerState.fragmentReserve[key] = (playerState.fragmentReserve[key] || 0) + (count || 1);
  }

  function moveInitialStandbyCardToHeldFragment(state, player, handIndex, card) {
    var playerState = ensurePlayerStateContainers(state, player);
    var selectedCard = card || (playerState && typeof handIndex === "number" ? playerState.hand[handIndex] : null);
    if (!playerState || !selectedCard) {
      return null;
    }
    addFragmentToReserve(playerState, selectedCard);
    if (typeof handIndex === "number") {
      playerState.hand.splice(handIndex, 1);
    }
    return selectedCard;
  }

  function removeFragmentFromReserve(playerState, key) {
    if (!playerState) {
      return false;
    }
    playerState.fragmentReserve = normalizeFragmentReservePool(playerState.fragmentReserve);
    if (!playerState.fragmentReserve[key]) {
      return false;
    }
    playerState.fragmentReserve[key] -= 1;
    if (playerState.fragmentReserve[key] <= 0) {
      delete playerState.fragmentReserve[key];
    }
    return true;
  }

  function getFragmentReserveEntries(playerState) {
    if (!playerState) {
      return [];
    }
    playerState.fragmentReserve = normalizeFragmentReservePool(playerState.fragmentReserve);
    return Object.keys(playerState.fragmentReserve).map(function (key) {
      var card = parseFragmentReserveKey(key);
      return card ? {
        key: key,
        card: card,
        count: playerState.fragmentReserve[key]
      } : null;
    }).filter(Boolean).sort(function (a, b) {
      var labelA = FRAGMENT_LIBRARY[a.card.fragmentType].label;
      var labelB = FRAGMENT_LIBRARY[b.card.fragmentType].label;
      return labelA.localeCompare(labelB, "ja");
    });
  }

  function countHeldFragments(playerState) {
    return getFragmentReserveEntries(playerState).reduce(function (total, entry) {
      return total + (entry.count || 0);
    }, 0);
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

  function getTimeControlOption(value) {
    var key = value || DEFAULT_TIME_CONTROL;
    for (var i = 0; i < TIME_CONTROL_OPTIONS.length; i += 1) {
      if (TIME_CONTROL_OPTIONS[i].value === key) {
        return TIME_CONTROL_OPTIONS[i];
      }
    }
    return TIME_CONTROL_OPTIONS[0];
  }

  function getSelectedTimeControl() {
    var liveSelect = document.getElementById("timeControlSelect") || els.timeControlSelect;
    if (uiState.screen === "game" && uiState.state && uiState.state.clock && uiState.state.clock.timeControl) {
      return uiState.state.clock.timeControl;
    }
    if (liveSelect && liveSelect.value) {
      els.timeControlSelect = liveSelect;
      return liveSelect.value;
    }
    return uiState.timeControl || DEFAULT_TIME_CONTROL;
  }

  function getSelectedStartSidePreference() {
    var liveSelect = document.getElementById("startSideSelect") || els.startSideSelect;
    if (liveSelect && liveSelect.value) {
      els.startSideSelect = liveSelect;
      return liveSelect.value;
    }
    return uiState.startSidePreference || DEFAULT_START_SIDE;
  }

  function getSelectedLocalRuleMode() {
    var liveSelect = document.getElementById("localRuleModeSelect") || els.localRuleModeSelect;
    if (liveSelect && liveSelect.value) {
      els.localRuleModeSelect = liveSelect;
      return liveSelect.value === "shogi" ? "shogi" : "original";
    }
    return uiState.ruleMode || "original";
  }

  function getNpcStrengthOption(value) {
    var key = value || DEFAULT_NPC_STRENGTH;
    for (var i = 0; i < NPC_STRENGTH_OPTIONS.length; i += 1) {
      if (NPC_STRENGTH_OPTIONS[i].value === key) {
        return NPC_STRENGTH_OPTIONS[i];
      }
    }
    return NPC_STRENGTH_OPTIONS[1] || NPC_STRENGTH_OPTIONS[0];
  }

  function getSelectedNpcStrength() {
    var liveSelect = document.getElementById("npcStrengthSelect") || els.npcStrengthSelect;
    if (liveSelect && liveSelect.value) {
      els.npcStrengthSelect = liveSelect;
      return getNpcStrengthOption(liveSelect.value).value;
    }
    return uiState.npc && uiState.npc.strength ? uiState.npc.strength : DEFAULT_NPC_STRENGTH;
  }

  function resolveStartSidePreference(value) {
    var preference = value || DEFAULT_START_SIDE;
    if (preference === "random") {
      return Math.random() < 0.5 ? "P1" : "P2";
    }
    return preference === "P2" ? "P2" : "P1";
  }

  function getNpcHumanSide() {
    return isNpcGame() ? getOpponentPlayer(uiState.npc.side || "P2") : "P1";
  }

  function getTimeControlLabel(value) {
    return getTimeControlOption(value).label;
  }

  function getInitialStandbyRuleOption(value) {
    var key = normalizeInitialStandbyRule(value || DEFAULT_INITIAL_STANDBY_RULE);
    for (var i = 0; i < INITIAL_STANDBY_RULE_OPTIONS.length; i += 1) {
      if (INITIAL_STANDBY_RULE_OPTIONS[i].value === key) {
        return INITIAL_STANDBY_RULE_OPTIONS[i];
      }
    }
    return INITIAL_STANDBY_RULE_OPTIONS[0];
  }

  function getInitialStandbyRuleLabel(value) {
    return getInitialStandbyRuleOption(value).label;
  }

  function getSelectedInitialStandbyRule(context) {
    return DEFAULT_INITIAL_STANDBY_RULE;
  }

  function createClockState(value) {
    var option = getTimeControlOption(value);
    return {
      timeControl: option.value,
      initialSeconds: option.seconds,
      remaining: {
        P1: option.seconds,
        P2: option.seconds
      },
      activeSince: null,
      activePlayer: null
    };
  }

  function ensureClockState(state) {
    var option;
    if (!state) {
      return null;
    }
    if (!state.clock || typeof state.clock !== "object") {
      state.clock = createClockState(uiState.timeControl || DEFAULT_TIME_CONTROL);
      return state.clock;
    }
    option = getTimeControlOption(state.clock.timeControl || DEFAULT_TIME_CONTROL);
    state.clock.timeControl = option.value;
    state.clock.initialSeconds = Number(state.clock.initialSeconds || option.seconds || 0);
    if (!state.clock.remaining || typeof state.clock.remaining !== "object") {
      state.clock.remaining = { P1: state.clock.initialSeconds, P2: state.clock.initialSeconds };
    }
    state.clock.remaining.P1 = Math.max(0, Number(state.clock.remaining.P1 || 0));
    state.clock.remaining.P2 = Math.max(0, Number(state.clock.remaining.P2 || 0));
    if (!state.clock.initialSeconds) {
      state.clock.activeSince = null;
      state.clock.activePlayer = null;
    } else if (state.clock.activeSince !== null && state.clock.activeSince !== undefined) {
      state.clock.activeSince = Number(state.clock.activeSince) || null;
    }
    if (state.clock.activePlayer !== "P1" && state.clock.activePlayer !== "P2") {
      state.clock.activePlayer = state.clock.activeSince ? state.currentPlayer : null;
    }
    return state.clock;
  }

  function pauseClockForSnapshot(state) {
    if (state && state.clock && typeof state.clock === "object") {
      state.clock.activeSince = null;
      state.clock.activePlayer = null;
    }
    return state;
  }

  function pauseClockInHistorySnapshots(history) {
    if (!Array.isArray(history)) {
      return history;
    }
    history.forEach(function (entry) {
      if (entry && entry.snapshot) {
        pauseClockForSnapshot(entry.snapshot);
      }
    });
    return history;
  }

  function isClockEnabled(clock) {
    return !!(clock && Number(clock.initialSeconds || 0) > 0);
  }

  function isClockRunnable(state) {
    return !!(
      state &&
      !state.winner &&
      !isInitialStandbyPhase(state) &&
      !uiState.replayOnly &&
      uiState.screen === "game" &&
      isClockEnabled(ensureClockState(state)) &&
      (!isOnlineGame() || (!isOnlineStudyRoom() && isOnlineMatchStarted()))
    );
  }

  function startClockForCurrentTurn(state) {
    var clock = ensureClockState(state);
    if (!isClockEnabled(clock) || state.winner || isInitialStandbyPhase(state)) {
      if (clock) {
        clock.activeSince = null;
        clock.activePlayer = null;
      }
      return;
    }
    clock.activeSince = Date.now();
    clock.activePlayer = state.currentPlayer;
  }

  function formatClockSeconds(seconds) {
    var safe = Math.max(0, Math.ceil(Number(seconds) || 0));
    var minutes = Math.floor(safe / 60);
    var rest = safe % 60;
    return minutes + ":" + String(rest).padStart(2, "0");
  }

  function getLiveClockRemaining(state, player) {
    var clock = ensureClockState(state);
    var remaining;
    var elapsed;
    if (!isClockEnabled(clock)) {
      return null;
    }
    remaining = Number(clock.remaining[player] || 0);
    if (state.currentPlayer === player && clock.activePlayer === player && isClockRunnable(state) && clock.activeSince) {
      elapsed = Math.max(0, Math.floor((Date.now() - Number(clock.activeSince)) / 1000));
      remaining -= elapsed;
    }
    return Math.max(0, remaining);
  }

  function settleClockForCurrentPlayer(state) {
    var clock = ensureClockState(state);
    var player;
    var now;
    var elapsed;
    if (!isClockEnabled(clock) || !state || state.winner) {
      return;
    }
    player = state.currentPlayer;
    now = Date.now();
    if (!clock.activeSince || clock.activePlayer !== player) {
      clock.activeSince = now;
      clock.activePlayer = player;
      return;
    }
    elapsed = Math.max(0, Math.floor((now - Number(clock.activeSince)) / 1000));
    if (elapsed > 0) {
      clock.remaining[player] = Math.max(0, Number(clock.remaining[player] || 0) - elapsed);
    }
    clock.activeSince = now;
    clock.activePlayer = player;
  }

  function finishByClockTimeout(state, expiredPlayer) {
    var clock;
    if (!state || state.winner) {
      return false;
    }
    clock = ensureClockState(state);
    if (!isClockEnabled(clock)) {
      return false;
    }
    state.winner = getOpponentPlayer(expiredPlayer);
    state.winReason = "\u6642\u9593\u5207\u308C";
    if (clock) {
      clock.activeSince = null;
      clock.activePlayer = null;
    }
    pushLog(PLAYER_LABELS[expiredPlayer] + " \u306E\u6301\u3061\u6642\u9593\u304C\u5207\u308C\u307E\u3057\u305F");
    recordHistorySnapshot(state, "\u6642\u9593\u5207\u308C");
    uiState.replayIndex = state.history.length - 1;
    clearSelection();
    return true;
  }

  function checkClockTimeout() {
    var state = uiState.state;
    var player;
    var remaining;
    if (!isClockRunnable(state)) {
      renderClockDisplay();
      syncClockTicker();
      return false;
    }
    player = state.currentPlayer;
    remaining = getLiveClockRemaining(state, player);
    if (remaining === null || remaining > 0) {
      renderClockDisplay();
      syncClockTicker();
      return false;
    }
    settleClockForCurrentPlayer(state);
    if (ensureClockState(state).remaining[player] > 0) {
      renderClockDisplay();
      return false;
    }
    if (!finishByClockTimeout(state, player)) {
      return false;
    }
    if (!isOnlineGame()) {
      saveLatestReplayArchive(state);
    }
    render();
    if (isOnlineGame() && !isSpectatorMode()) {
      pushRoomState();
    }
    return true;
  }

  function renderClockDisplay() {
    var clock = ensureClockState(uiState.state);
    var p1Remaining;
    var p2Remaining;
    var p1Text;
    var p2Text;
    if (!els.clockPanel || !els.clockP1Label || !els.clockP2Label) {
      return;
    }
    if (uiState.tsumeMode && uiState.screen === "game" && uiState.tsumeStartedAt && uiState.state && !uiState.replayOnly) {
      els.clockPanel.hidden = false;
      p1Text = formatClockSeconds(Math.floor((Date.now() - uiState.tsumeStartedAt) / 1000));
      els.clockP1Label.textContent = "経過 " + p1Text;
      els.clockP2Label.textContent = uiState.state.winner ? "終了" : "計測中";
      els.clockP1Label.classList.toggle("active", !uiState.state.winner);
      els.clockP2Label.classList.toggle("active", false);
      els.clockP1Label.classList.toggle("low-time", false);
      els.clockP2Label.classList.toggle("low-time", false);
      return;
    }
    if (!isClockEnabled(clock)) {
      els.clockPanel.hidden = true;
      return;
    }
    els.clockPanel.hidden = false;
    p1Remaining = getLiveClockRemaining(uiState.state, "P1");
    p2Remaining = getLiveClockRemaining(uiState.state, "P2");
    p1Text = formatClockSeconds(p1Remaining);
    p2Text = formatClockSeconds(p2Remaining);
    els.clockP1Label.textContent = PLAYER_LABELS.P1 + " " + p1Text;
    els.clockP2Label.textContent = PLAYER_LABELS.P2 + " " + p2Text;
    els.clockP1Label.classList.toggle("active", uiState.state.currentPlayer === "P1" && !uiState.state.winner);
    els.clockP2Label.classList.toggle("active", uiState.state.currentPlayer === "P2" && !uiState.state.winner);
    els.clockP1Label.classList.toggle("low-time", p1Remaining !== null && p1Remaining <= 30);
    els.clockP2Label.classList.toggle("low-time", p2Remaining !== null && p2Remaining <= 30);
  }

  function syncClockTicker() {
    var shouldRun = isClockRunnable(uiState.state)
      || !!(uiState.tsumeMode && uiState.screen === "game" && uiState.tsumeStartedAt && uiState.state && !uiState.state.winner && !uiState.replayOnly);
    if (shouldRun && !uiState.clockTimer) {
      uiState.clockTimer = window.setInterval(function () {
        checkClockTimeout();
      }, 250);
      return;
    }
    if (!shouldRun && uiState.clockTimer) {
      window.clearInterval(uiState.clockTimer);
      uiState.clockTimer = null;
    }
  }

  function isOnlineGame() {
    return !!(uiState.online && uiState.online.enabled);
  }

  function isSpectatorMode() {
    return !!(isOnlineGame() && uiState.online.role === "spectator");
  }

  function createDefaultOnlinePlayerName() {
    return "プレイヤー" + String(Math.floor(Math.random() * 9000) + 1000);
  }

  function createDefaultOnlineRoomName() {
    var now = new Date();
    return "UNFOLD対戦 " + String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
  }

  function getOnlinePlayerName() {
    if (!els.onlineNameInput || !els.onlineNameInput.value.trim()) {
      var defaultName = createDefaultOnlinePlayerName();
      if (els.onlineNameInput) {
        els.onlineNameInput.value = defaultName;
        saveOnlineName(defaultName);
      }
      return defaultName;
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
      var defaultRoomName = createDefaultOnlineRoomName();
      if (els.onlineRoomNameInput) {
        els.onlineRoomNameInput.value = defaultRoomName;
      }
      return defaultRoomName;
    }
    return els.onlineRoomNameInput.value.trim();
  }

  function getCreateRoomPassword() {
    return els.onlineRoomPasswordInput ? els.onlineRoomPasswordInput.value.trim() : "";
  }

  function getCreateRoomVisibility() {
    if (!els.onlineRoomVisibilitySelect) {
      return "public";
    }
    return els.onlineRoomVisibilitySelect.value || "public";
  }

  function getDefaultStudyRoomVisibility() {
    return "invite";
  }

  function getJoinRoomPassword() {
    return els.onlineJoinPasswordInput ? els.onlineJoinPasswordInput.value.trim() : "";
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
    if (!isOnlineGame() || !uiState.online.roomId || (!uiState.online.playerId && !uiState.online.viewerId)) {
      return;
    }
    try {
      window.localStorage.setItem("unfoldOnlineSession", JSON.stringify({
        roomId: uiState.online.roomId,
        playerId: uiState.online.playerId,
        viewerId: uiState.online.viewerId,
        role: uiState.online.role || "player",
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

  function buildReplayArchiveFromGameState(state, options) {
    var gameType = options && options.gameType ? options.gameType : "practice";
    var title = options && options.title ? options.title : (gameType === "npc" ? "NPC対戦" : "一人プレイ");
    var playerNames = options && options.playerNames ? options.playerNames : {
      P1: gameType === "npc" ? "あなた" : "プレイヤー1",
      P2: gameType === "npc" ? "NPC" : "プレイヤー2"
    };
    return {
      savedAt: new Date().toISOString(),
      ruleMode: state && state.ruleMode ? state.ruleMode : getCurrentRuleMode(),
      gameType: gameType,
      title: title,
      playerNames: playerNames,
      sourceInfo: options && options.sourceInfo ? cloneGameState(options.sourceInfo) : null,
      analysisComment: options && options.analysisComment ? String(options.analysisComment) : "",
      referenceSource: options && options.referenceSource ? cloneGameState(options.referenceSource) : null,
      history: cloneGameState(state && state.history ? state.history : []),
      finalState: snapshotGameState(state)
    };
  }

  function buildReplayArchiveFromState(state) {
    return buildReplayArchiveFromGameState(state, {
      gameType: isNpcGame() ? "npc" : "practice",
      playerNames: {
        P1: getDisplayedPlayerName("P1"),
        P2: getDisplayedPlayerName("P2")
      }
    });
  }

  function buildReplayArchiveFromOnlineRoom(room) {
    if (!room || !room.gameState) {
      return null;
    }
    return buildReplayArchiveFromGameState(room.gameState, {
      gameType: room.roomType === "study" ? "study" : "online",
      title: room.name || (room.roomType === "study" ? "検討室" : "オンライン対戦"),
      playerNames: {
        P1: room.players && room.players.P1 && room.players.P1.name ? room.players.P1.name : "プレイヤー1",
        P2: room.players && room.players.P2 && room.players.P2.name ? room.players.P2.name : "プレイヤー2"
      },
      sourceInfo: room.studyOrigin || null,
      analysisComment: room.studyComment || "",
      referenceSource: room.studyReference || null
    });
  }

  function buildReplayLibraryEntry(archive, sourceLabel) {
    var normalized = normalizeReplayArchive(archive);
    var signature;
    if (!normalized) {
      return null;
    }
    signature = JSON.stringify({
      ruleMode: normalized.ruleMode,
      title: normalized.title,
      gameType: normalized.gameType,
      winner: normalized.finalState && normalized.finalState.winner ? normalized.finalState.winner : "",
      turnNumber: normalized.finalState && normalized.finalState.turnNumber ? normalized.finalState.turnNumber : 0,
      historyLength: normalized.history ? normalized.history.length : 0,
      placements: normalized.finalState && normalized.finalState.placements ? normalized.finalState.placements.length : 0,
      actionLog: normalized.finalState && normalized.finalState.actionLog ? normalized.finalState.actionLog.slice(0, 5) : []
    });
    return {
      id: "lib-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
      signature: signature,
      source: sourceLabel || "manual",
      favorite: false,
      savedAt: normalized.savedAt || new Date().toISOString(),
      archive: normalized
    };
  }

  function normalizeReplayLibraryEntry(item, index) {
    var archive = normalizeReplayArchive(item && item.archive ? item.archive : item);
    if (!archive) {
      return null;
    }
    return {
      id: item && item.id ? item.id : ("lib-" + Date.now() + "-" + index),
      signature: item && item.signature ? item.signature : getReplayArchiveIdentity(archive),
      source: item && item.source ? item.source : (archive.gameType || "manual"),
      favorite: !!(item && item.favorite),
      savedAt: item && item.savedAt ? item.savedAt : (archive.savedAt || new Date().toISOString()),
      archive: archive
    };
  }

  function loadReplayLibrary() {
    try {
      var list = JSON.parse(window.localStorage.getItem("unfoldReplayLibrary") || "[]");
      if (!Array.isArray(list)) {
        return [];
      }
      return list.map(function (item, index) {
        return normalizeReplayLibraryEntry(item, index);
      }).filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  function saveReplayLibrary(list) {
    try {
      var payload = Array.isArray(list) ? list.map(function (item, index) {
        return normalizeReplayLibraryEntry(item, index);
      }).filter(Boolean).slice(0, 80) : [];
      window.localStorage.setItem("unfoldReplayLibrary", JSON.stringify(payload));
    } catch (error) {
      // ignore storage errors
    }
  }

  function getReplaySourceCategory(entry) {
    var source = entry && entry.source ? String(entry.source) : "manual";
    if (source === "imported" || source.indexOf("study") === 0 || source.indexOf("analysis") === 0) {
      return "study";
    }
    if (source.indexOf("npc") === 0) {
      return "npc";
    }
    if (source.indexOf("online") === 0) {
      return "online";
    }
    if (source.indexOf("practice") === 0 || source === "manual") {
      return "practice";
    }
    return "other";
  }

  function getReplaySourceLabel(source) {
    var key = String(source || "manual");
    var labels = {
      manual: "手動保存",
      imported: "読込棋譜",
      practice: "一人プレイ",
      "practice-finished": "一人プレイ終局",
      "practice-branch": "一人プレイ分岐",
      npc: "NPC対戦",
      "npc-finished": "NPC終局",
      "npc-branch": "NPC分岐",
      online: "オンライン対局",
      "online-finished": "オンライン終局",
      "online-branch": "オンライン分岐",
      study: "検討室",
      "study-room": "検討室保存",
      "study-branch": "分岐検討室",
      "analysis-edited": "検討編集"
    };
    return labels[key] || key;
  }

  function toggleReplayLibraryFavorite(entryId) {
    var changed = false;
    var list = loadReplayLibrary().map(function (entry) {
      if (!entry || entry.id !== entryId) {
        return entry;
      }
      changed = true;
      return Object.assign({}, entry, { favorite: !entry.favorite });
    });
    if (changed) {
      saveReplayLibrary(list);
    }
    return changed;
  }

  function getReplayLibraryFilteredEntries() {
    var query = String(uiState.replayLibraryQuery || "").trim().toLowerCase();
    var filter = uiState.replayLibraryFilter || "all";
    return loadReplayLibrary().filter(function (entry) {
      var archive = entry.archive || {};
      var haystack;
      if (filter === "favorite" && !entry.favorite) {
        return false;
      }
      if (filter !== "all" && filter !== "favorite" && getReplaySourceCategory(entry) !== filter) {
        return false;
      }
      haystack = [
        archive.title || "",
        archive.analysisComment || "",
        archive.gameType || "",
        getReplaySourceLabel(entry.source),
        archive.playerNames && archive.playerNames.P1 ? archive.playerNames.P1 : "",
        archive.playerNames && archive.playerNames.P2 ? archive.playerNames.P2 : ""
      ].join(" ").toLowerCase();
      return !query || haystack.indexOf(query) >= 0;
    });
  }

  function getReplayLibraryStatsText(filteredCount, totalCount) {
    var filter = uiState.replayLibraryFilter || "all";
    var filterText = {
      all: "すべて",
      favorite: "お気に入り",
      practice: "一人プレイ",
      npc: "NPC",
      online: "オンライン",
      study: "検討"
    }[filter] || filter;
    return filteredCount + "件 / 全" + totalCount + "件 (" + filterText + ")";
  }

  function getReplayArchiveIdentity(archive) {
    var normalized = normalizeReplayArchive(archive);
    var lastEntry = normalized && normalized.history && normalized.history.length
      ? normalized.history[normalized.history.length - 1]
      : null;
    if (!normalized) {
      return "";
    }
    return JSON.stringify({
      savedAt: normalized.savedAt || "",
      ruleMode: normalized.ruleMode || "",
      gameType: normalized.gameType || "",
      player1: normalized.playerNames && normalized.playerNames.P1 ? normalized.playerNames.P1 : "",
      player2: normalized.playerNames && normalized.playerNames.P2 ? normalized.playerNames.P2 : "",
      sourceRoomId: normalized.sourceInfo && normalized.sourceInfo.roomId ? normalized.sourceInfo.roomId : "",
      sourceStepLabel: normalized.sourceInfo && normalized.sourceInfo.stepLabel ? normalized.sourceInfo.stepLabel : "",
      historyLength: normalized.history ? normalized.history.length : 0,
      finalTurn: normalized.finalState && normalized.finalState.turnNumber ? normalized.finalState.turnNumber : 0,
      finalWinner: normalized.finalState && normalized.finalState.winner ? normalized.finalState.winner : "",
      finalLabel: lastEntry && lastEntry.label ? lastEntry.label : ""
    });
  }

  function replaceReplayLibraryArchive(archive, sourceLabel) {
    var entry = buildReplayLibraryEntry(archive, sourceLabel);
    var archiveIdentity = getReplayArchiveIdentity(archive);
    var list;
    var replaced = false;
    if (!entry || !archiveIdentity) {
      return false;
    }
    list = loadReplayLibrary().map(function (item) {
      var itemIdentity = item && item.archive ? getReplayArchiveIdentity(item.archive) : "";
      if (!replaced && itemIdentity && itemIdentity === archiveIdentity) {
        replaced = true;
        return {
          id: item.id || entry.id,
          signature: entry.signature,
          source: sourceLabel || item.source || entry.source,
          favorite: !!item.favorite,
          savedAt: item.savedAt || entry.savedAt,
          archive: entry.archive
        };
      }
      return item;
    });
    if (!replaced) {
      list.unshift(entry);
    }
    saveReplayLibrary(list.slice(0, 40));
    return true;
  }

  function saveReplayArchiveMetaLocally(archive) {
    var normalized = normalizeReplayArchive(archive);
    var latest = loadLatestReplayArchive();
    var imported = loadImportedReplayArchive();
    if (!normalized) {
      return false;
    }
    if (latest && getReplayArchiveIdentity(latest) === getReplayArchiveIdentity(normalized)) {
      try {
        window.localStorage.setItem("unfoldLatestReplay", JSON.stringify(normalized));
      } catch (error) {
        // ignore storage errors
      }
    }
    if (imported && getReplayArchiveIdentity(imported) === getReplayArchiveIdentity(normalized)) {
      try {
        window.localStorage.setItem("unfoldImportedReplay", JSON.stringify(normalized));
      } catch (error) {
        // ignore storage errors
      }
    }
    replaceReplayLibraryArchive(normalized, "analysis-edited");
    return true;
  }

  function upsertReplayLibraryArchive(archive, sourceLabel) {
    var entry = buildReplayLibraryEntry(archive, sourceLabel);
    var list;
    var existingIndex;
    if (!entry) {
      return null;
    }
    list = loadReplayLibrary();
    existingIndex = list.findIndex(function (item) {
      return item && item.signature === entry.signature;
    });
    if (existingIndex >= 0) {
      list[existingIndex].archive = entry.archive;
      list[existingIndex].source = sourceLabel || list[existingIndex].source || "manual";
      list[existingIndex].favorite = !!list[existingIndex].favorite;
      return list[existingIndex].archive;
    } else {
      entry.savedAt = new Date().toISOString();
      list.unshift(entry);
    }
    saveReplayLibrary(list.slice(0, 40));
    return entry.archive;
  }

  function removeReplayLibraryEntry(entryId) {
    saveReplayLibrary(loadReplayLibrary().filter(function (item) {
      return item && item.id !== entryId;
    }));
  }

  function findReplayLibraryEntry(entryId) {
    return loadReplayLibrary().find(function (item) {
      return item && item.id === entryId;
    }) || null;
  }

  function saveLatestReplayArchive(state) {
    if (!state || isOnlineGame()) {
      return;
    }
    try {
      var archive = buildReplayArchiveFromState(state);
      window.localStorage.setItem("unfoldLatestReplay", JSON.stringify(archive));
      if (state.winner) {
        upsertReplayLibraryArchive(archive, isNpcGame() ? "npc-finished" : "practice-finished");
      }
    } catch (error) {
      // ignore storage errors
    }
  }

  function loadLatestReplayArchive() {
    try {
      return JSON.parse(window.localStorage.getItem("unfoldLatestReplay") || "null");
    } catch (error) {
      return null;
    }
  }

  function saveImportedReplayArchive(archive) {
    if (!archive) {
      return;
    }
    try {
      window.localStorage.setItem("unfoldImportedReplay", JSON.stringify(archive));
      upsertReplayLibraryArchive(archive, "imported");
    } catch (error) {
      // ignore storage errors
    }
  }

  function loadImportedReplayArchive() {
    try {
      return JSON.parse(window.localStorage.getItem("unfoldImportedReplay") || "null");
    } catch (error) {
      return null;
    }
  }

  function buildReplayFilePayload(archive) {
    return {
      format: REPLAY_FILE_FORMAT,
      version: REPLAY_FILE_VERSION,
      exportedAt: new Date().toISOString(),
      archive: cloneGameState(archive)
    };
  }

  function extractReplayTitleFromFilename(filename) {
    var baseName = String(filename || "").replace(/\.[^.]+$/, "").trim();
    return baseName || "読み込み棋譜";
  }

  function normalizeReplayArchive(source, fallbackTitle) {
    var raw = source && source.format === REPLAY_FILE_FORMAT && source.archive ? source.archive : source;
    var history = raw && Array.isArray(raw.history) ? raw.history : [];
    var normalizedHistory = [];
    var finalState;
    if (!raw) {
      return null;
    }
    history.forEach(function (entry, index) {
      if (!entry || !entry.snapshot || !entry.snapshot.board || !entry.snapshot.players) {
        return;
      }
      normalizedHistory.push({
        turnNumber: typeof entry.turnNumber === "number" ? entry.turnNumber : index,
        currentPlayer: entry.currentPlayer || entry.snapshot.currentPlayer || "P1",
        label: entry.label || (index === 0 ? "初期局面" : ("第" + index + "手")),
        snapshot: pauseClockForSnapshot(cloneGameState(entry.snapshot))
      });
    });
    if (!normalizedHistory.length) {
      return null;
    }
    if (raw.finalState && raw.finalState.board && raw.finalState.players) {
      finalState = pauseClockForSnapshot(cloneGameState(raw.finalState));
    } else {
      finalState = pauseClockForSnapshot(cloneGameState(normalizedHistory[normalizedHistory.length - 1].snapshot));
    }
    return {
      savedAt: raw.savedAt || source.exportedAt || new Date().toISOString(),
      ruleMode: raw.ruleMode || finalState.ruleMode || "original",
      gameType: raw.gameType || "replay",
      title: raw.title || fallbackTitle || "読み込み棋譜",
      playerNames: {
        P1: raw.playerNames && raw.playerNames.P1 ? raw.playerNames.P1 : "プレイヤー1",
        P2: raw.playerNames && raw.playerNames.P2 ? raw.playerNames.P2 : "プレイヤー2"
      },
      sourceInfo: raw.sourceInfo ? cloneGameState(raw.sourceInfo) : null,
      analysisComment: raw.analysisComment ? String(raw.analysisComment) : "",
      referenceSource: raw.referenceSource ? cloneGameState(raw.referenceSource) : null,
      history: normalizedHistory,
      finalState: finalState
    };
  }

  function showReplayFeedback(message) {
    if (uiState.screen === "lobby") {
      setLobbyNotice(message);
      return;
    }
    if (els.testOutput) {
      els.testOutput.textContent = "REPLAY\n" + message;
    }
  }

  function showRoomFeedback(message) {
    if (uiState.screen === "lobby") {
      setLobbyNotice(message);
      return;
    }
    if (els.testOutput) {
      els.testOutput.textContent = "ROOM\n" + message;
    }
  }

  function fallbackCopyText(text) {
    var field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "readonly");
    field.style.position = "fixed";
    field.style.top = "-1000px";
    field.style.left = "-1000px";
    document.body.appendChild(field);
    field.focus();
    field.select();
    try {
      return document.execCommand("copy");
    } catch (error) {
      return false;
    } finally {
      document.body.removeChild(field);
    }
  }

  function copyTextToClipboard(text, successMessage, failureMessage) {
    if (!text) {
      showRoomFeedback(failureMessage || "コピーする内容がありません。");
      return Promise.resolve(false);
    }
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      return navigator.clipboard.writeText(text).then(function () {
        showRoomFeedback(successMessage || "コピーしました。");
        return true;
      }).catch(function () {
        var copied = fallbackCopyText(text);
        showRoomFeedback(copied ? (successMessage || "コピーしました。") : (failureMessage || "コピーに失敗しました。"));
        return copied;
      });
    }
    showRoomFeedback(fallbackCopyText(text) ? (successMessage || "コピーしました。") : (failureMessage || "コピーに失敗しました。"));
    return Promise.resolve(true);
  }

  function openReplayArchive(archive, options) {
    var normalized = normalizeReplayArchive(archive, options && options.fallbackTitle);
    var targetIndex;
    if (!normalized) {
      showReplayFeedback("棋譜データを確認できませんでした。");
      return false;
    }
    if (options && options.persistImported) {
      saveImportedReplayArchive(normalized);
    }
    clearNpcTurnTimer();
    resetNpcState();
    uiState.practiceMode = false;
    uiState.ruleMode = normalized.ruleMode || uiState.ruleMode || "original";
    uiState.replayOnly = true;
    uiState.replayArchive = normalized;
    uiState.compareSourceMode = "mainline";
    uiState.compareSiblingRoomId = null;
    uiState.screen = "game";
    targetIndex = options && typeof options.index === "number" ? options.index : normalized.history.length - 1;
    applyReplayHistoryIndex(targetIndex, false);
    resetBoardCameraView();
    render();
    return true;
  }

  function clearReplayViewerState() {
    uiState.replayOnly = false;
    uiState.replayArchive = null;
  }

  function applyReplayHistoryIndex(index, shouldRender) {
    var history = uiState.replayArchive && uiState.replayArchive.history ? uiState.replayArchive.history : [];
    var clampedIndex;
    if (!history.length) {
      return false;
    }
    clampedIndex = Math.max(0, Math.min(history.length - 1, index));
    uiState.replayIndex = clampedIndex;
    uiState.state = cloneGameState(history[clampedIndex].snapshot);
    clearSelection();
    if (shouldRender !== false) {
      render();
    }
    return true;
  }

  function openLatestReplayArchive() {
    var archive = loadLatestReplayArchive();
    if (!archive || !archive.history || !archive.history.length) {
      if (els.testOutput) {
        els.testOutput.textContent = "REPLAY\n保存された棋譜がありません。";
      }
      return false;
    }
    return openReplayArchive(archive);
  }

  function openImportedReplayArchive() {
    var archive = loadImportedReplayArchive();
    if (!archive || !archive.history || !archive.history.length) {
      showReplayFeedback("読み込み済みの棋譜がありません。");
      return false;
    }
    return openReplayArchive(archive);
  }

  function getCurrentReplayArchiveForExport() {
    if (uiState.replayOnly && uiState.replayArchive && uiState.replayArchive.history && uiState.replayArchive.history.length) {
      return normalizeReplayArchive(uiState.replayArchive);
    }
    if (!uiState.state || !uiState.state.history || !uiState.state.history.length || isOnlineGame()) {
      return null;
    }
    return buildReplayArchiveFromState(uiState.state);
  }

  function getReplayExportFilename(archive) {
    var stamp = new Date(archive && archive.savedAt ? archive.savedAt : Date.now()).toISOString()
      .replace(/[-:]/g, "")
      .replace(/\..+$/, "")
      .replace("T", "-");
    var suffix = archive && archive.ruleMode ? archive.ruleMode : "original";
    return "unfold-kifu-" + stamp + "-" + suffix + ".json";
  }

  function downloadReplayArchiveFile(archive) {
    var payload;
    var blob;
    var link;
    var url;
    if (!archive) {
      return false;
    }
    payload = buildReplayFilePayload(archive);
    blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    url = window.URL.createObjectURL(blob);
    link = document.createElement("a");
    link.href = url;
    link.download = getReplayExportFilename(archive);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () {
      window.URL.revokeObjectURL(url);
    }, 0);
    return true;
  }

  function exportCurrentReplayArchive() {
    var archive = getCurrentReplayArchiveForExport();
    if (!archive) {
      showReplayFeedback("書き出せる棋譜がありません。");
      return false;
    }
    downloadReplayArchiveFile(archive);
    showReplayFeedback("棋譜ファイルを書き出しました。");
    return true;
  }

  function triggerReplayImport() {
    if (!els.replayFileInput) {
      return false;
    }
    if (uiState.screen === "game" && !uiState.replayOnly && !isOnlineGame() && getHistoryEntries().length > 1) {
      if (!window.confirm("いまの対局表示から離れて棋譜を読み込みますか？")) {
        return false;
      }
    }
    els.replayFileInput.value = "";
    els.replayFileInput.click();
    return true;
  }

  function importReplayArchiveFile(file) {
    var reader;
    if (!file) {
      return;
    }
    reader = new FileReader();
    reader.onerror = function () {
      showReplayFeedback("棋譜ファイルを読み込めませんでした。");
    };
    reader.onload = function () {
      var parsed;
      var archive;
      try {
        parsed = JSON.parse(String(reader.result || ""));
        archive = normalizeReplayArchive(parsed, extractReplayTitleFromFilename(file.name));
      } catch (error) {
        archive = null;
      }
      if (!archive) {
        showReplayFeedback("棋譜ファイルの形式を確認できませんでした。");
        return;
      }
      if (openReplayArchive(archive, { persistImported: true })) {
        showReplayFeedback((archive.title || "読み込み棋譜") + " を開きました。");
      }
    };
    reader.readAsText(file, "utf-8");
  }

  function handleReplayFileSelected(event) {
    var file = event && event.target && event.target.files ? event.target.files[0] : null;
    if (!file) {
      return;
    }
    importReplayArchiveFile(file);
  }

  function startPracticeFromReplayPosition() {
    var history = uiState.replayArchive && uiState.replayArchive.history ? uiState.replayArchive.history : [];
    var selectedIndex = uiState.replayIndex >= 0 ? uiState.replayIndex : history.length - 1;
    var nextState;
    var replayLabel;
    if (!uiState.replayOnly || !history.length || selectedIndex < 0 || !history[selectedIndex]) {
      return false;
    }
    nextState = cloneGameState(history[selectedIndex].snapshot);
    nextState.history = cloneGameState(history.slice(0, selectedIndex + 1));
    pauseClockForSnapshot(nextState);
    pauseClockInHistorySnapshots(nextState.history);
    nextState.winner = null;
    nextState.winReason = null;
    replayLabel = selectedIndex === 0 ? "開始局面" : ("第" + selectedIndex + "手");
    clearNpcTurnTimer();
    resetNpcState();
    clearReplayViewerState();
    uiState.practiceMode = true;
    uiState.compareSourceMode = "mainline";
    uiState.compareSiblingRoomId = null;
    uiState.ruleMode = nextState.ruleMode || uiState.ruleMode || "original";
    uiState.state = nextState;
    uiState.replayIndex = uiState.state.history.length - 1;
    clearSelection();
    pushLog(replayLabel + " から検討開始");
    saveLatestReplayArchive(uiState.state);
    uiState.screen = "game";
    resetBoardCameraView();
    render();
    startClockForCurrentTurn(uiState.state);
    renderClockDisplay();
    syncClockTicker();
    return true;
  }

  function buildStudyRoomGameStateFromArchive(archive) {
    var normalized = normalizeReplayArchive(archive);
    var state;
    if (!normalized || !normalized.finalState) {
      return null;
    }
    state = cloneGameState(normalized.finalState);
    state.history = cloneGameState(normalized.history || []);
    return state;
  }

  function getCurrentHistorySliceInfo() {
    var history = getHistoryEntries();
    var selectedIndex = uiState.replayIndex >= 0 ? uiState.replayIndex : history.length - 1;
    var entry;
    if (!history.length || selectedIndex < 0 || !history[selectedIndex] || !history[selectedIndex].snapshot) {
      return null;
    }
    if (selectedIndex >= history.length) {
      selectedIndex = history.length - 1;
    }
    entry = history[selectedIndex];
    return {
      index: selectedIndex,
      history: history.slice(0, selectedIndex + 1),
      snapshot: cloneGameState(entry.snapshot),
      stepLabel: selectedIndex === 0 ? "開始局面" : ("第" + selectedIndex + "手")
    };
  }

  function createStudyTrailEntry(data) {
    if (!data) {
      return null;
    }
    return {
      sourceType: data.sourceType || "replay",
      roomId: data.roomId || "",
      roomName: data.roomName || "",
      archiveTitle: data.archiveTitle || data.roomName || "棋譜",
      stepLabel: data.stepLabel || "",
      playerNames: {
        P1: data.playerNames && data.playerNames.P1 ? data.playerNames.P1 : "",
        P2: data.playerNames && data.playerNames.P2 ? data.playerNames.P2 : ""
      }
    };
  }

  function getStudyTrailFromOrigin(origin) {
    var trail = [];
    if (!origin) {
      return trail;
    }
    if (Array.isArray(origin.originTrail)) {
      trail = origin.originTrail.map(function (entry) {
        return createStudyTrailEntry(entry);
      }).filter(Boolean);
    }
    trail.push(createStudyTrailEntry(origin));
    return trail.filter(Boolean);
  }

  function getCurrentStudyOriginTrail() {
    if (isOnlineStudyRoom() && uiState.online.room && uiState.online.room.studyOrigin) {
      return getStudyTrailFromOrigin(uiState.online.room.studyOrigin);
    }
    if (uiState.replayOnly && uiState.replayArchive && uiState.replayArchive.sourceInfo) {
      return getStudyTrailFromOrigin(uiState.replayArchive.sourceInfo);
    }
    return [];
  }

  function getCurrentStudyContextTitle() {
    if (isOnlineStudyRoom()) {
      return uiState.online.roomName || "検討室";
    }
    if (isOnlineReviewMode()) {
      return uiState.online.roomName || "オンライン対戦";
    }
    if (uiState.replayOnly && uiState.replayArchive) {
      return uiState.replayArchive.title || "棋譜";
    }
    if (isNpcGame()) {
      return "NPC対戦";
    }
    if (uiState.practiceMode) {
      return "一人プレイ";
    }
    return "棋譜";
  }

  function buildStudyReferenceFromCurrentPosition() {
    var sliceInfo = getCurrentHistorySliceInfo();
    var history = getHistoryEntries();
    var comparisonHistory;
    if (!sliceInfo || !history.length) {
      return null;
    }
    comparisonHistory = history.slice(sliceInfo.index, Math.min(history.length, sliceInfo.index + 40)).map(function (entry, relativeIndex) {
      return {
        turnNumber: typeof entry.turnNumber === "number" ? entry.turnNumber : (sliceInfo.index + relativeIndex),
        currentPlayer: entry.currentPlayer || (entry.snapshot && entry.snapshot.currentPlayer) || "P1",
        label: entry.label || (relativeIndex === 0 ? sliceInfo.stepLabel : ("第" + (sliceInfo.index + relativeIndex) + "手")),
        snapshot: cloneGameState(entry.snapshot)
      };
    });
    return {
      title: getCurrentStudyContextTitle(),
      stepLabel: sliceInfo.stepLabel,
      history: comparisonHistory
    };
  }

  function getCurrentStudySourceInfo(sliceInfo) {
    var info = sliceInfo || getCurrentHistorySliceInfo();
    var sourceType = "local";
    var roomName = "";
    var roomId = "";
    var archiveTitle = "";
    var playerNames = {
      P1: getDisplayedPlayerName("P1"),
      P2: getDisplayedPlayerName("P2")
    };
    if (!info) {
      return null;
    }
    if (isOnlineStudyRoom()) {
      sourceType = uiState.online.studyKind === "branch" ? "study-branch" : "study-review";
      roomName = uiState.online.roomName || "";
      roomId = uiState.online.roomId || "";
      archiveTitle = uiState.online.roomName || "検討室";
    } else if (isOnlineReviewMode()) {
      sourceType = "online-review";
      roomName = uiState.online.roomName || "";
      roomId = uiState.online.roomId || "";
      archiveTitle = uiState.online.roomName || "オンライン対戦";
    } else if (uiState.replayOnly && uiState.replayArchive) {
      sourceType = "replay";
      archiveTitle = uiState.replayArchive.title || "棋譜";
      if (uiState.replayArchive.playerNames) {
        playerNames = cloneGameState(uiState.replayArchive.playerNames);
      }
    } else if (isNpcGame()) {
      sourceType = "npc";
      archiveTitle = "NPC対戦";
    } else if (uiState.practiceMode) {
      sourceType = "practice";
      archiveTitle = "一人プレイ";
    }
    return {
      sourceType: sourceType,
      roomId: roomId,
      roomName: roomName,
      archiveTitle: archiveTitle,
      stepLabel: info.stepLabel,
      playerNames: playerNames,
      originTrail: getCurrentStudyOriginTrail()
    };
  }

  function buildReplayArchiveFromCurrentPosition() {
    var sliceInfo = getCurrentHistorySliceInfo();
    var state;
    var title;
    var sourceInfo;
    var gameType = "practice";
    var playerNames = {
      P1: getDisplayedPlayerName("P1"),
      P2: getDisplayedPlayerName("P2")
    };
    if (!sliceInfo) {
      return null;
    }
    state = cloneGameState(sliceInfo.snapshot);
    state.history = cloneGameState(sliceInfo.history);
    state.winner = null;
    state.winReason = null;
    sourceInfo = getCurrentStudySourceInfo(sliceInfo);
    if (isOnlineReviewMode()) {
      title = (uiState.online.roomName || "オンライン対戦") + " " + sliceInfo.stepLabel + " 分岐";
      gameType = isOnlineStudyRoom() ? "study-branch" : "online-branch";
    } else if (isOnlineStudyRoom()) {
      title = (uiState.online.roomName || "検討室") + " " + sliceInfo.stepLabel + " 分岐";
      gameType = "study-branch";
    } else if (uiState.replayOnly && uiState.replayArchive) {
      title = (uiState.replayArchive.title || "棋譜") + " " + sliceInfo.stepLabel + " 分岐";
      gameType = "replay-branch";
      playerNames = cloneGameState(uiState.replayArchive.playerNames || playerNames);
    } else if (isNpcGame()) {
      title = "NPC対戦 " + sliceInfo.stepLabel + " 分岐";
      gameType = "npc-branch";
    } else {
      title = "一人プレイ " + sliceInfo.stepLabel + " 分岐";
      gameType = "practice-branch";
    }
    return buildReplayArchiveFromGameState(state, {
      gameType: gameType,
      title: title,
      playerNames: playerNames,
      sourceInfo: sourceInfo,
      referenceSource: buildStudyReferenceFromCurrentPosition()
    });
  }

  function getStudySourceArchive() {
    if (uiState.onlineStudySource === "imported") {
      return loadImportedReplayArchive() || loadLatestReplayArchive();
    }
    return loadLatestReplayArchive() || loadImportedReplayArchive();
  }

  function createOnlineStudyRoomFromArchive(archive, roomName, password, options) {
    var normalized = normalizeReplayArchive(archive);
    var studyState = buildStudyRoomGameStateFromArchive(normalized);
    var studyKind = options && options.studyKind === "branch" ? "branch" : "review";
    var visibility = options && options.visibility ? options.visibility : getDefaultStudyRoomVisibility();
    if (!normalized || !studyState) {
      showReplayFeedback("検討室を作れる棋譜がありません。");
      return Promise.resolve();
    }
    if (studyKind === "branch") {
      studyState.winner = null;
      studyState.winReason = null;
    }
    uiState.ruleMode = normalized.ruleMode || uiState.ruleMode || "original";
    return apiRequest(buildApiUrl("room.create"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: getOnlinePlayerName(),
        roomName: roomName || (normalized.title ? normalized.title + " 検討室" : "検討室"),
        password: password || "",
        visibility: visibility,
        ruleMode: normalized.ruleMode || getCurrentRuleMode(),
        roomType: "study",
        studyKind: studyKind,
        studyOrigin: normalized.sourceInfo || null,
        studyReference: normalized.referenceSource || null,
        studyComment: normalized.analysisComment || "",
        reviewIndex: studyKind === "review" && normalized.history && normalized.history.length ? normalized.history.length - 1 : 0,
        gameState: studyState
      })
    }).then(function (data) {
      var studyLabel = data.room.studyKind === "branch" ? "分岐検討室" : "検討室";
      rememberAdminKey(data.room.id, data.adminKey);
      applyOnlineRoom(data.room, data.playerId, data.side);
      pushLog(studyLabel + " " + data.room.id + " を作成");
      setLobbyNotice(studyLabel + " " + data.room.id + " を作成しました。管理キー: " + data.adminKey);
      if (els.testOutput) {
        els.testOutput.textContent = (data.room.studyKind === "branch" ? "BRANCH ROOM READY" : "STUDY ROOM READY") + "\n参加コード: " + data.room.id + "\n管理キー: " + data.adminKey;
      }
    }).catch(function (error) {
      if (els.testOutput) {
        els.testOutput.textContent = "STUDY ROOM ERROR\n" + error.message;
      }
    });
  }

  function createStudyRoomFromCurrentReplay() {
    var archive = buildReplayArchiveFromCurrentPosition();
    var roomName;
    if (!archive) {
      showReplayFeedback("検討室にする棋譜がありません。");
      return Promise.resolve();
    }
    roomName = window.prompt("分岐検討室の名前を入れてください。", (archive.title || "棋譜") + " 検討室");
    if (roomName === null) {
      return Promise.resolve();
    }
    upsertReplayLibraryArchive(archive, "study-source");
    return createOnlineStudyRoomFromArchive(archive, roomName.trim(), "", { studyKind: "branch" });
  }

  function saveOnlineReviewNote() {
    var note;
    var index;
    var tags;
    if (!canControlOnlineReview() || !els.reviewNoteField || uiState.online.syncing) {
      return Promise.resolve(false);
    }
    note = els.reviewNoteField.value.trim();
    tags = (uiState.reviewNoteTags || []).slice();
    index = Math.max(0, uiState.replayIndex);
    if (note === getCurrentReviewNoteText() && JSON.stringify(tags) === JSON.stringify(getCurrentReviewNoteTags())) {
      return Promise.resolve(false);
    }
    uiState.online.syncing = true;
    return apiRequest(buildApiUrl("room.review.note", uiState.online.roomId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerId: uiState.online.playerId,
        index: index,
        note: note,
        tags: tags
      })
    }).then(function (data) {
      syncOnlineRoomState(data.room);
      render();
      return true;
    }).catch(function (error) {
      if (els.testOutput) {
        els.testOutput.textContent = "REVIEW NOTE ERROR\n" + error.message;
      }
      return false;
    }).finally(function () {
      uiState.online.syncing = false;
    });
  }

  function getCurrentAnalysisTitle() {
    if (isOnlineStudyRoom()) {
      return uiState.online.roomName || "";
    }
    if (uiState.replayOnly && uiState.replayArchive) {
      return uiState.replayArchive.title || "";
    }
    return "";
  }

  function getCurrentAnalysisComment() {
    if (isOnlineStudyRoom() && uiState.online.room) {
      return uiState.online.room.studyComment || "";
    }
    if (uiState.replayOnly && uiState.replayArchive) {
      return uiState.replayArchive.analysisComment || "";
    }
    return "";
  }

  function canEditAnalysisMeta() {
    return !!(uiState.screen === "game" && (uiState.replayOnly || (isOnlineStudyRoom() && !isSpectatorMode())));
  }

  function saveOnlineStudyMeta() {
    var title;
    var comment;
    if (!isOnlineStudyRoom() || isSpectatorMode() || !els.analysisTitleField || !els.analysisCommentField || uiState.online.syncing) {
      return Promise.resolve(false);
    }
    title = els.analysisTitleField.value.trim();
    comment = els.analysisCommentField.value.trim();
    if (title === getCurrentAnalysisTitle() && comment === getCurrentAnalysisComment()) {
      return Promise.resolve(false);
    }
    uiState.online.syncing = true;
    return apiRequest(buildApiUrl("room.study.meta", uiState.online.roomId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerId: uiState.online.playerId,
        roomName: title,
        studyComment: comment
      })
    }).then(function (data) {
      syncOnlineRoomState(data.room);
      showRoomFeedback("検討名とメモを保存しました。");
      render();
      return true;
    }).catch(function (error) {
      if (els.testOutput) {
        els.testOutput.textContent = "STUDY META ERROR\n" + error.message;
      }
      return false;
    }).finally(function () {
      uiState.online.syncing = false;
    });
  }

  function saveReplayAnalysisMeta() {
    var normalized;
    if (!uiState.replayOnly || !uiState.replayArchive || !els.analysisTitleField || !els.analysisCommentField) {
      return false;
    }
    normalized = normalizeReplayArchive(uiState.replayArchive);
    if (!normalized) {
      return false;
    }
    normalized.title = els.analysisTitleField.value.trim() || normalized.title || "棋譜";
    normalized.analysisComment = els.analysisCommentField.value.trim();
    uiState.replayArchive = normalized;
    saveReplayArchiveMetaLocally(normalized);
    showReplayFeedback("検討名とメモを保存しました。");
    render();
    return true;
  }

  function saveAnalysisMeta() {
    if (isOnlineStudyRoom()) {
      return saveOnlineStudyMeta();
    }
    if (uiState.replayOnly) {
      return Promise.resolve(saveReplayAnalysisMeta());
    }
    return Promise.resolve(false);
  }

  function getLobbyRouteFromLocation() {
    var path = "";
    var page = "";
    var tab = "";
    try {
      path = (window.location.pathname || "").split("/").pop().toLowerCase();
      page = new URLSearchParams(window.location.search || "").get("page") || "";
      tab = new URLSearchParams(window.location.search || "").get("tab") || "";
    } catch (error) {
      // Static file fallback.
    }
    if (page === "online" || path === "online.html") {
      return { menu: "online", tab: tab || "" };
    }
    if (page === "solo" || path === "solo.html") {
      return { menu: "solo", tab: tab || "" };
    }
    if (path === "kifu.html") {
      return { menu: "solo", tab: "practice" };
    }
    if (page === "rules" || path === "rules-menu.html") {
      return { menu: "rules", tab: tab || "" };
    }
    return { menu: "home", tab: "" };
  }

  function navigateLobbyPage(menu, tab) {
    var targets = {
      home: "index.html",
      online: "online.html",
      solo: "solo.html",
      rules: "rules-menu.html"
    };
    var route = getLobbyRouteFromLocation();
    var nextMenu = menu || "home";
    var target = targets[nextMenu] || targets.home;
    var suffix = tab ? ("?tab=" + encodeURIComponent(tab)) : "";
    if (route.menu === nextMenu && (!tab || route.tab === tab)) {
      setLobbyMenu(nextMenu, tab);
      return;
    }
    window.location.href = target + suffix;
  }

  function isLobbyChildPage() {
    var route = getLobbyRouteFromLocation();
    return route.menu !== "home";
  }

  function isKifuPage() {
    try {
      return (window.location.pathname || "").split("/").pop().toLowerCase() === "kifu.html";
    } catch (error) {
      return false;
    }
  }

  function applyInitialLobbyRoute() {
    var route = getLobbyRouteFromLocation();
    uiState.lobbyMenu = route.menu || "home";
    if (route.menu === "online") {
      uiState.lobbyOnlineTab = route.tab || "create";
    } else if (route.menu === "solo") {
      uiState.lobbySoloTab = route.tab === "study" ? "practice" : (route.tab || "npc");
    } else if (route.menu === "rules") {
      uiState.lobbyRulesTab = route.tab || "summary";
    }
  }

  function setLobbyMenu(menu, tab) {
    uiState.lobbyMenu = menu || "home";
    if (uiState.lobbyMenu === "online" && tab) {
      uiState.lobbyOnlineTab = tab;
    }
    if (uiState.lobbyMenu === "solo" && tab) {
      uiState.lobbySoloTab = tab;
    }
    if (uiState.lobbyMenu === "rules" && tab) {
      uiState.lobbyRulesTab = tab;
    }
    render();
    syncLobbyMenuViewport(uiState.lobbyMenu, tab);
    if (uiState.lobbyMenu === "online" && (!tab || tab === "list")) {
      refreshRoomList({ silent: true });
    }
  }

  function setLobbyNotice(text) {
    if (!els.lobbyNotice) {
      return;
    }
    els.lobbyNotice.textContent = text || "";
    els.lobbyNotice.hidden = !els.lobbyNotice.textContent;
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

  function getPieceInfoMapForMode(ruleMode) {
    return (ruleMode || getCurrentRuleMode()) === "shogi" ? SHOGI_PIECE_INFO : ORIGINAL_PIECE_INFO;
  }

  function getPieceInfo(pieceType, ruleMode) {
    var infoMap = getPieceInfoMapForMode(ruleMode);
    return infoMap[pieceType] || ORIGINAL_PIECE_INFO[pieceType] || SHOGI_PIECE_INFO[pieceType] || null;
  }

  function getPieceNotationMode() {
    return isValidPieceNotation(uiState.pieceNotation) ? uiState.pieceNotation : PIECE_NOTATION_DEFAULT;
  }

  function getPieceNameDetail(pieceType, ruleMode) {
    var info = getPieceInfo(pieceType, ruleMode);
    if (!info) {
      return pieceType;
    }
    return info.ja + " / " + info.en + " / " + info.kana;
  }

  function getPieceNotationTitle(pieceType, ruleMode) {
    var info = getPieceInfo(pieceType, ruleMode);
    if (!info) {
      return pieceType;
    }
    return info.ja + "\n" + info.en + " / " + info.kana + "\n" + info.letter + " / " + info.code;
  }

  function getMovementSummaryText(pieceType) {
    var rule = getMovementRule(pieceType);
    var summary = rule && rule.summary ? rule.summary : "";
    var separatorIndex = summary.indexOf(":");
    return separatorIndex >= 0 ? summary.slice(separatorIndex + 1).trim() : summary;
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

  function isBaseTerritoryCell(row, col, player) {
    var startRow = Math.floor((BOARD_ROWS - 3) / 2);
    var startCol = player === "P1" ? 0 : BOARD_COLS - 3;
    return row >= startRow && row < startRow + 3 && col >= startCol && col < startCol + 3;
  }

  function doesFragmentTouchBaseTerritory(cells, player) {
    for (var i = 0; i < cells.length; i += 1) {
      var row = cells[i].row;
      var col = cells[i].col;
      for (var d = 0; d < CARDINAL_DIRS.length; d += 1) {
        if (isBaseTerritoryCell(row + CARDINAL_DIRS[d][0], col + CARDINAL_DIRS[d][1], player)) {
          return true;
        }
      }
    }
    return false;
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
    if (status === "review") {
      return "検討中";
    }
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

  function isOnlineStudyRoom() {
    return !!(isOnlineGame() && uiState.online.roomType === "study");
  }

  function isOnlineStudyReviewRoom() {
    return isOnlineStudyRoom() && uiState.online.studyKind !== "branch";
  }

  function isOnlineStudyBranchRoom() {
    return isOnlineStudyRoom() && uiState.online.studyKind === "branch";
  }

  function getOnlineReviewHistory(room) {
    var sourceRoom = room || uiState.online.room;
    var state = sourceRoom && sourceRoom.gameState ? sourceRoom.gameState : uiState.online.finalState;
    return state && Array.isArray(state.history) ? state.history : [];
  }

  function getOnlineReviewIndex(room) {
    var history = getOnlineReviewHistory(room);
    var sourceRoom = room || uiState.online.room;
    var requestedIndex = sourceRoom && typeof sourceRoom.reviewIndex === "number" ? sourceRoom.reviewIndex : -1;
    if (!history.length) {
      return -1;
    }
    if (requestedIndex < 0) {
      return history.length - 1;
    }
    return Math.max(0, Math.min(history.length - 1, requestedIndex));
  }

  function isOnlineReviewMode() {
    return !!(isOnlineGame()
      && (isOnlineStudyReviewRoom() || (uiState.online.finalState && uiState.online.finalState.winner))
      && getOnlineReviewHistory().length);
  }

  function canControlOnlineReview() {
    return !!(isOnlineReviewMode() && !isSpectatorMode() && uiState.online.playerId);
  }

  function buildOnlineReviewDisplayState(room) {
    var sourceRoom = room || uiState.online.room;
    var finalState = sourceRoom && sourceRoom.gameState ? sourceRoom.gameState : uiState.online.finalState;
    var history = getOnlineReviewHistory(sourceRoom);
    var reviewIndex = getOnlineReviewIndex(sourceRoom);
    var snapshot;
    if (!finalState) {
      return createGame(uiState.ruleMode);
    }
    if (reviewIndex < 0 || !history[reviewIndex] || !history[reviewIndex].snapshot) {
      snapshot = cloneGameState(finalState);
    } else {
      snapshot = cloneGameState(history[reviewIndex].snapshot);
      snapshot.history = cloneGameState(history);
      snapshot.winner = finalState.winner || null;
      snapshot.winReason = finalState.winReason || null;
      snapshot.actionLog = cloneGameState(finalState.actionLog || snapshot.actionLog || []);
    }
    return snapshot;
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

  function getBoardViewerSide() {
    if (isOnlineGame() && uiState.online.side) {
      return uiState.online.side;
    }
    if (isNpcGame()) {
      return getNpcHumanSide();
    }
    if (uiState.practiceMode && uiState.localViewerSide) {
      return uiState.localViewerSide;
    }
    return "P1";
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
    uiState.npc.strategyByPlayer = null;
    uiState.npc.selfPlayFast = false;
    uiState.npc.bulkSelfPlay = false;
    uiState.npc.lookaheadDepth = 1;
    uiState.npc.strength = uiState.npc.strength || DEFAULT_NPC_STRENGTH;
    uiState.npc.thinkStartedAt = null;
    uiState.npc.lastThinkMs = 0;
    uiState.npc.totalThinkMs = 0;
    uiState.npc.movesThought = 0;
    uiState.npc.lastSearchStats = null;
  }

  function shouldLockHumanActions() {
    return uiState.replayOnly || isSpectatorMode() || isOnlineReviewMode() || (isOnlineGame() && !isOnlineMatchStarted()) || isNpcTurn() || !!uiState.npc.thinking;
  }

  function getDisplayedPlayerName(side) {
    if (uiState.replayOnly && uiState.replayArchive && uiState.replayArchive.playerNames && uiState.replayArchive.playerNames[side]) {
      return uiState.replayArchive.playerNames[side];
    }
    if (isNpcGame()) {
      return side === uiState.npc.side ? "NPC" : "あなた";
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
    return p1Name + " / " + p2Name + (room.spectators && room.spectators.length ? (" / 観戦 " + room.spectators.length) : "");
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

  function formatUpdatedText(updatedAt) {
    var date = updatedAt ? new Date(updatedAt) : null;
    if (!date || isNaN(date.getTime())) {
      return "更新: 不明";
    }
    return "更新: " +
      date.getFullYear() + "/" +
      String(date.getMonth() + 1).padStart(2, "0") + "/" +
      String(date.getDate()).padStart(2, "0") + " " +
      String(date.getHours()).padStart(2, "0") + ":" +
      String(date.getMinutes()).padStart(2, "0");
  }

  function getRoomUpdatedMs(room) {
    var updatedAt = room && room.updatedAt ? Date.parse(room.updatedAt) : 0;
    return isNaN(updatedAt) ? 0 : updatedAt;
  }

  function getRoomSortRank(room) {
    if (!room) {
      return 9;
    }
    if (!room.isFull) {
      if (room.status === "ready") {
        return 0;
      }
      if (room.status === "waiting") {
        return 1;
      }
      if (room.status === "review") {
        return 2;
      }
      if (room.status === "playing") {
        return 3;
      }
      return 4;
    }
    if (room.status === "review") {
      return 5;
    }
    if (room.status === "playing") {
      return 6;
    }
    return 7;
  }

  function compareLobbyRooms(a, b) {
    var rankDiff = getRoomSortRank(a) - getRoomSortRank(b);
    var updatedDiff;
    if (rankDiff) {
      return rankDiff;
    }
    updatedDiff = getRoomUpdatedMs(b) - getRoomUpdatedMs(a);
    if (updatedDiff) {
      return updatedDiff;
    }
    return String(a.id || "").localeCompare(String(b.id || ""));
  }

  function sortLobbyRooms(rooms) {
    return (rooms || []).slice().sort(compareLobbyRooms);
  }

  function buildLobbyRoomEntries(rooms) {
    var entries = [];
    var branchGroups = {};
    sortLobbyRooms(rooms).forEach(function (room) {
      var key;
      if (room && room.roomType === "study" && room.studyKind === "branch" && room.studyOrigin) {
        key = buildStudyReferenceKey(room.studyOrigin);
        if (!branchGroups[key]) {
          branchGroups[key] = {
            type: "branch-group",
            key: key,
            origin: room.studyOrigin,
            rooms: []
          };
        }
        branchGroups[key].rooms.push(room);
        return;
      }
      entries.push({ type: "room", room: room });
    });

    Object.keys(branchGroups).forEach(function (key) {
      var group = branchGroups[key];
      group.rooms = sortLobbyRooms(group.rooms);
      if (group.rooms.length === 1) {
        entries.push({ type: "room", room: group.rooms[0] });
        return;
      }
      entries.push(group);
    });

    entries.sort(function (a, b) {
      var aRoom = a.type === "room" ? a.room : a.rooms[0];
      var bRoom = b.type === "room" ? b.room : b.rooms[0];
      return compareLobbyRooms(aRoom, bRoom);
    });

    return entries;
  }

  function createRoomListItem(room, options) {
    var compact = !!(options && options.compact);
    var showOrigin = !options || options.showOrigin !== false;
    var item = document.createElement("article");
    var meta = document.createElement("div");
    var title = document.createElement("div");
    var sub = document.createElement("div");
    var badgeRow = document.createElement("div");
    var kindBadge = document.createElement("span");
    var statusBadge = document.createElement("span");
    var modeBadge = document.createElement("span");
    var standbyBadge = document.createElement("span");
    var timeBadge = document.createElement("span");
    var lockBadge = document.createElement("span");
    var visibilityBadge = document.createElement("span");
    var spectatorBadge = document.createElement("span");
    var expiry = document.createElement("div");
    var originMeta = document.createElement("div");
    var commentMeta = document.createElement("div");
    var actions = document.createElement("div");
    var copyBtn = document.createElement("button");
    var joinBtn = document.createElement("button");
    var spectateBtn = document.createElement("button");
    var deleteBtn = document.createElement("button");
    var adminKey = uiState.roomAdminKeys[room.id];

    item.className = "room-item" + (compact ? " compact-room-item" : "");
    meta.className = "room-item-meta";
    title.className = "room-item-title";
    sub.className = "room-item-sub";
    badgeRow.className = "room-badge-row";
    expiry.className = "room-item-expire";
    originMeta.className = "room-item-origin";
    commentMeta.className = "room-item-origin";
    actions.className = "room-item-actions";

    title.textContent = (room.name || ("部屋 " + room.id)) + " [" + room.id + "]";
    sub.textContent = "ホスト: " + (room.hostName || "-") + " / 参加: " + (room.guestName || "募集中");
    if (showOrigin && room.roomType === "study" && room.studyOrigin) {
      originMeta.textContent = (room.studyKind === "branch" ? "分岐元: " : "共有元: ") + formatStudyOriginText(room.studyOrigin);
    }

    kindBadge.className = "room-badge";
    kindBadge.textContent = room.roomType === "study"
      ? (room.studyKind === "branch" ? "分岐室" : "検討室")
      : "対局室";
    badgeRow.appendChild(kindBadge);

    statusBadge.className = "room-badge room-item-status";
    statusBadge.textContent = getRoomStatusLabel(room.status);
    badgeRow.appendChild(statusBadge);

    modeBadge.className = "room-badge";
    modeBadge.textContent = GAME_MODE_LABELS[room.ruleMode] || room.ruleMode || "-";
    badgeRow.appendChild(modeBadge);

    standbyBadge.className = "room-badge";
    standbyBadge.textContent = getInitialStandbyRuleLabel(room.initialStandbyRule);
    badgeRow.appendChild(standbyBadge);

    if (room.timeControl && room.timeControl !== DEFAULT_TIME_CONTROL) {
      timeBadge.className = "room-badge";
      timeBadge.textContent = getTimeControlLabel(room.timeControl);
      badgeRow.appendChild(timeBadge);
    }

    visibilityBadge.className = "room-badge";
    visibilityBadge.textContent = room.visibility === "private"
      ? "非公開"
      : (room.visibility === "invite" ? "招待" : "公開");
    badgeRow.appendChild(visibilityBadge);

    if (room.hasPassword) {
      lockBadge.className = "room-badge";
      lockBadge.textContent = "鍵あり";
      badgeRow.appendChild(lockBadge);
    }

    if (room.spectatorCount > 0) {
      spectatorBadge.className = "room-badge";
      spectatorBadge.textContent = "観戦 " + room.spectatorCount;
      badgeRow.appendChild(spectatorBadge);
    }

    expiry.textContent = formatExpiryText(room.expiresAt);
    if (room.studyComment) {
      commentMeta.textContent = "要点: " + String(room.studyComment).slice(0, 100);
    }

    copyBtn.type = "button";
    copyBtn.className = "ghost-button";
    copyBtn.textContent = "コードコピー";
    copyBtn.addEventListener("click", function () {
      copyTextToClipboard(room.id, "参加コード " + room.id + " をコピーしました。");
    });
    actions.appendChild(copyBtn);

    joinBtn.type = "button";
    joinBtn.className = "ghost-button";
    joinBtn.textContent = room.isFull ? "満室" : (room.roomType === "study" ? "参加" : "入室");
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

    spectateBtn.type = "button";
    spectateBtn.className = "ghost-button";
    spectateBtn.textContent = "観戦";
    spectateBtn.hidden = !(room.status === "playing" || room.status === "review");
    spectateBtn.disabled = isOnlineGame();
    spectateBtn.addEventListener("click", function () {
      var password = "";
      if (room.hasPassword) {
        password = window.prompt("この部屋は鍵付きです。合言葉を入力してください。", "") || "";
        if (!password) {
          return;
        }
      }
      spectateOnlineRoom(room.id, password);
    });
    actions.appendChild(spectateBtn);

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
    if (originMeta.textContent) {
      meta.appendChild(originMeta);
    }
    if (commentMeta.textContent) {
      meta.appendChild(commentMeta);
    }
    meta.appendChild(expiry);
    item.appendChild(meta);
    item.appendChild(actions);
    return item;
  }

  function createBranchGroupItem(group) {
    var details = document.createElement("details");
    var summary = document.createElement("summary");
    var title = document.createElement("div");
    var origin = document.createElement("p");
    var stats = document.createElement("div");
    var children = document.createElement("div");
    var waitingCount = 0;
    var playingCount = 0;
    var reviewCount = 0;

    group.rooms.forEach(function (room) {
      if (room.status === "playing") {
        playingCount += 1;
      } else if (room.status === "review") {
        reviewCount += 1;
      } else {
        waitingCount += 1;
      }
    });

    details.className = "room-item room-branch-group";
    summary.className = "branch-group-summary";
    title.className = "branch-group-title";
    title.textContent = "同じ局面からの分岐室 " + group.rooms.length + "室";
    origin.className = "branch-group-origin";
    origin.textContent = formatStudyOriginText(group.origin);
    stats.className = "branch-group-stats";
    stats.textContent = "募集中 " + waitingCount + " / 検討中 " + reviewCount + " / 対局中 " + playingCount + " / " + formatUpdatedText(group.rooms[0].updatedAt);

    summary.appendChild(title);
    summary.appendChild(origin);
    summary.appendChild(stats);
    details.appendChild(summary);

    children.className = "branch-group-children";
    group.rooms.forEach(function (room) {
      children.appendChild(createRoomListItem(room, { compact: true, showOrigin: false }));
    });
    details.appendChild(children);

    return details;
  }

  function renderRoomList() {
    var entries;
    if (!els.roomList) {
      return;
    }
    els.roomList.innerHTML = "";
    if (!uiState.lobbyRooms.length) {
      els.roomList.innerHTML = "<p class=\"room-empty\">公開中の部屋はまだありません。部屋を作るとここに並びます。</p>";
      return;
    }

    entries = buildLobbyRoomEntries(uiState.lobbyRooms);
    entries.forEach(function (entry) {
      if (entry.type === "room") {
        els.roomList.appendChild(createRoomListItem(entry.room));
        return;
      }
      els.roomList.appendChild(createBranchGroupItem(entry));
    });
  }

  function renderReplayLibrary(container) {
    var totalLibrary = loadReplayLibrary();
    var library = getReplayLibraryFilteredEntries();
    if (!container) {
      return;
    }
    container.innerHTML = "";
    if (els.replayLibraryStats) {
      els.replayLibraryStats.textContent = getReplayLibraryStatsText(library.length, totalLibrary.length);
    }
    if (!totalLibrary.length) {
      container.innerHTML = "<p class=\"room-empty\">ライブラリはまだ空です。終局棋譜や読み込んだ棋譜がここに並びます。</p>";
      return;
    }
    if (!library.length) {
      container.innerHTML = "<p class=\"room-empty\">条件に合う棋譜がありません。検索語や絞り込みを変えてみてください。</p>";
      return;
    }
    library.forEach(function (entry) {
      var item = document.createElement("article");
      var meta = document.createElement("div");
      var title = document.createElement("div");
      var sub = document.createElement("div");
      var note = document.createElement("div");
      var actions = document.createElement("div");
      var favoriteBtn = document.createElement("button");
      var openBtn = document.createElement("button");
      var exportBtn = document.createElement("button");
      var studyBtn = document.createElement("button");
      var deleteBtn = document.createElement("button");
      var archive = entry.archive;
      item.className = "room-item replay-library-item";
      meta.className = "room-item-meta";
      title.className = "room-item-title";
      sub.className = "room-item-sub";
      note.className = "room-item-origin";
      actions.className = "room-item-actions";
      title.textContent = (entry.favorite ? "★ " : "") + (archive.title || "保存棋譜");
      sub.textContent = (GAME_MODE_LABELS[archive.ruleMode || "original"] || archive.ruleMode || "-")
        + " / "
        + getReplaySourceLabel(entry.source || "manual")
        + " / "
        + new Date(entry.savedAt || archive.savedAt).toLocaleString("ja-JP");
      note.textContent = archive.analysisComment
        ? String(archive.analysisComment).slice(0, 120)
        : ((archive.playerNames && archive.playerNames.P1 ? archive.playerNames.P1 : "プレイヤー1")
          + " / "
          + (archive.playerNames && archive.playerNames.P2 ? archive.playerNames.P2 : "プレイヤー2"));

      favoriteBtn.type = "button";
      favoriteBtn.className = "ghost-button";
      favoriteBtn.textContent = entry.favorite ? "★" : "☆";
      favoriteBtn.title = entry.favorite ? "お気に入り解除" : "お気に入り";
      favoriteBtn.addEventListener("click", function () {
        if (toggleReplayLibraryFavorite(entry.id)) {
          render();
        }
      });
      actions.appendChild(favoriteBtn);

      openBtn.type = "button";
      openBtn.className = "ghost-button";
      openBtn.textContent = "開く";
      openBtn.addEventListener("click", function () {
        openReplayArchive(archive);
      });
      actions.appendChild(openBtn);

      exportBtn.type = "button";
      exportBtn.className = "ghost-button";
      exportBtn.textContent = "書き出す";
      exportBtn.addEventListener("click", function () {
        if (downloadReplayArchiveFile(archive)) {
          setLobbyNotice("棋譜ファイルを書き出しました。");
        }
      });
      actions.appendChild(exportBtn);

      studyBtn.type = "button";
      studyBtn.className = "ghost-button";
      studyBtn.textContent = "検討室";
      studyBtn.addEventListener("click", function () {
        var roomName = window.prompt("検討室の名前を入れてください。", (archive.title || "棋譜") + " 検討室");
        if (roomName === null) {
          return;
        }
        createOnlineStudyRoomFromArchive(archive, roomName.trim());
      });
      actions.appendChild(studyBtn);

      deleteBtn.type = "button";
      deleteBtn.className = "ghost-button";
      deleteBtn.textContent = "削除";
      deleteBtn.addEventListener("click", function () {
        if (!window.confirm("この棋譜をライブラリから削除しますか？")) {
          return;
        }
        removeReplayLibraryEntry(entry.id);
        render();
      });
      actions.appendChild(deleteBtn);

      meta.appendChild(title);
      meta.appendChild(sub);
      if (note.textContent) {
        meta.appendChild(note);
      }
      item.appendChild(meta);
      item.appendChild(actions);
      container.appendChild(item);
    });
  }

  function createEditorBaseState(mode) {
    var state = createGame(mode || uiState.ruleMode || "original", DEFAULT_TIME_CONTROL);
    var row;
    var col;
    for (row = 0; row < BOARD_ROWS; row += 1) {
      for (col = 0; col < BOARD_COLS; col += 1) {
        state.board[row][col].pieceId = null;
        state.board[row][col].stack = [];
        state.board[row][col].controller = state.board[row][col].baseOwner || null;
      }
    }
    state.players.P1.pieces = {};
    state.players.P2.pieces = {};
    state.players.P1.reserve = createReservePool();
    state.players.P2.reserve = createReservePool();
    state.players.P1.fragmentReserve = createFragmentReservePool();
    state.players.P2.fragmentReserve = createFragmentReservePool();
    state.players.P1.hand = [];
    state.players.P2.hand = [];
    state.players.P1.deck = [];
    state.players.P2.deck = [];
    state.placements = [];
    state.currentPlayer = "P1";
    state.winner = null;
    state.winReason = null;
    state.turnNumber = 1;
    state.actionLog = [];
    state.history = [];
    recordHistorySnapshot(state, "編集局面");
    return state;
  }

  function removePieceFromStateAt(state, row, col) {
    var cell = state && state.board && state.board[row] ? state.board[row][col] : null;
    var piece;
    if (!cell || !cell.pieceId) {
      return;
    }
    piece = getPiece(state, cell.pieceId);
    if (piece && state.players[piece.owner] && state.players[piece.owner].pieces) {
      delete state.players[piece.owner].pieces[piece.id];
    }
    cell.pieceId = null;
  }

  function createBoardEditorWorkingState(sourceState) {
    var state = cloneGameState(sourceState || createEditorBaseState(uiState.ruleMode || "original"));
    if (!state.players || !state.players.P1 || !state.players.P2 || !state.board) {
      return createEditorBaseState(uiState.ruleMode || "original");
    }
    ensurePlayerStateContainers(state, "P1");
    ensurePlayerStateContainers(state, "P2");
    state.placements = Array.isArray(state.placements) ? state.placements : [];
    state.actionLog = Array.isArray(state.actionLog) ? state.actionLog : [];
    state.history = Array.isArray(state.history) ? state.history : [];
    state.currentPlayer = state.currentPlayer || "P1";
    state.ruleMode = state.ruleMode || uiState.ruleMode || "original";
    return state;
  }

  function openBoardEditor(sourceState) {
    uiState.boardEditor.open = true;
    uiState.boardEditor.working = createBoardEditorWorkingState(sourceState || uiState.state);
    uiState.boardEditor.currentPlayer = uiState.boardEditor.working.currentPlayer || "P1";
    clearSelection();
    render();
  }

  function closeBoardEditor() {
    uiState.boardEditor.open = false;
    uiState.boardEditor.working = null;
    render();
  }

  function removeEditorPlacementsAtCell(state, row, col) {
    var placements;
    if (!state || !Array.isArray(state.placements)) {
      return;
    }
    placements = state.placements.filter(function (placement) {
      return placement
        && Array.isArray(placement.cells)
        && placement.cells.some(function (placementCell) {
          return placementCell.row === row && placementCell.col === col;
        });
    });
    placements.forEach(function (placement) {
      removePlacementFromBoardInState(state, placement);
    });
  }

  function applyBoardEditorCellAction(row, col) {
    var state = uiState.boardEditor.working;
    var cell = state && state.board && state.board[row] ? state.board[row][col] : null;
    if (!state || !cell) {
      return;
    }
    if (uiState.boardEditor.paint === "piece") {
      removePieceFromStateAt(state, row, col);
      addPiece(state, uiState.boardEditor.owner || "P1", uiState.boardEditor.pieceType || "king", row, col);
    } else if (uiState.boardEditor.paint === "erase-piece") {
      removePieceFromStateAt(state, row, col);
    } else if (uiState.boardEditor.paint === "control") {
      removeEditorPlacementsAtCell(state, row, col);
      cell.controller = uiState.boardEditor.owner || "P1";
      cell.stack = [];
    } else if (uiState.boardEditor.paint === "clear-control") {
      removeEditorPlacementsAtCell(state, row, col);
      cell.controller = cell.baseOwner || null;
      cell.stack = [];
    }
    renderBoardEditor();
  }

  function buildPlayableStateFromEditor() {
    var state;
    if (!uiState.boardEditor.working) {
      return null;
    }
    state = cloneGameState(uiState.boardEditor.working);
    state.ruleMode = state.ruleMode || uiState.ruleMode || "original";
    state.currentPlayer = uiState.boardEditor.currentPlayer || state.currentPlayer || "P1";
    state.winner = null;
    state.winReason = null;
    state.actionLog = [];
    state.history = [];
    state.turnNumber = Math.max(1, Number(state.turnNumber) || 1);
    recordHistorySnapshot(state, "編集局面");
    return state;
  }

  function buildBoardEditorReplayArchive() {
    var state = buildPlayableStateFromEditor();
    if (!state) {
      return null;
    }
    return buildReplayArchiveFromGameState(state, {
      gameType: "editor",
      title: "局面エディタ",
      playerNames: {
        P1: "プレイヤー1",
        P2: "プレイヤー2"
      },
      analysisComment: "局面エディタから作成"
    });
  }

  function startPracticeFromEditor() {
    var state = buildPlayableStateFromEditor();
    if (!state) {
      return;
    }
    clearNpcTurnTimer();
    resetNpcState();
    clearReplayViewerState();
    uiState.practiceMode = true;
    uiState.ruleMode = state.ruleMode || uiState.ruleMode || "original";
    uiState.compareSourceMode = "mainline";
    uiState.compareSiblingRoomId = null;
    uiState.state = state;
    uiState.replayIndex = state.history.length - 1;
    uiState.boardEditor.open = false;
    uiState.boardEditor.working = null;
    clearSelection();
    saveLatestReplayArchive(uiState.state);
    pushLog("局面エディタから一人プレイ開始");
    uiState.screen = "game";
    resetBoardCameraView();
    render();
    startClockForCurrentTurn(uiState.state);
    renderClockDisplay();
    syncClockTicker();
  }

  function createStudyRoomFromEditor() {
    var archive = buildBoardEditorReplayArchive();
    var roomName;
    if (!archive) {
      return;
    }
    roomName = window.prompt("検討室の名前を入れてください。", "編集局面 検討室");
    if (roomName === null) {
      return;
    }
    uiState.boardEditor.open = false;
    uiState.boardEditor.working = null;
    createOnlineStudyRoomFromArchive(archive, roomName.trim() || "編集局面 検討室", "", {
      studyKind: "branch",
      visibility: getDefaultStudyRoomVisibility()
    });
  }

  function renderBoardEditor() {
    var state = uiState.boardEditor.working;
    var pieceLabels = state && state.ruleMode === "shogi" ? SHOGI_PIECE_LABELS : ORIGINAL_PIECE_LABELS;
    var pieceShortLabels = state && state.ruleMode === "shogi" ? SHOGI_PIECE_SHORT_LABELS : ORIGINAL_PIECE_SHORT_LABELS;
    var pieceKeys = state && state.ruleMode === "shogi" ? SHOGI_PLAYABLE_PIECE_ORDER : Object.keys(pieceLabels);
    if (!els.editorModal || !els.editorGrid || !els.editorOwnerSelect || !els.editorPieceSelect || !els.editorPaintSelect || !els.editorCurrentPlayerSelect) {
      return;
    }
    els.editorModal.hidden = !uiState.boardEditor.open;
    if (!uiState.boardEditor.open || !state) {
      return;
    }

    function syncSelect(select, options, currentValue) {
      var needsRebuild;
      if (!select) {
        return;
      }
      needsRebuild = select.options.length !== options.length;
      if (!needsRebuild) {
        needsRebuild = options.some(function (option, index) {
          return !select.options[index]
            || select.options[index].value !== option.value
            || select.options[index].textContent !== option.label;
        });
      }
      if (needsRebuild) {
        select.innerHTML = "";
        options.forEach(function (option) {
          var optionEl = document.createElement("option");
          optionEl.value = option.value;
          optionEl.textContent = option.label;
          select.appendChild(optionEl);
        });
      }
      select.value = currentValue;
    }

    syncSelect(els.editorOwnerSelect, [
      { value: "P1", label: "先手" },
      { value: "P2", label: "後手" }
    ], uiState.boardEditor.owner || "P1");

    syncSelect(els.editorPieceSelect, pieceKeys.map(function (pieceKey) {
      return { value: pieceKey, label: pieceLabels[pieceKey] || pieceKey };
    }), uiState.boardEditor.pieceType || "king");

    syncSelect(els.editorPaintSelect, [
      { value: "piece", label: "駒を置く" },
      { value: "erase-piece", label: "駒を消す" },
      { value: "control", label: "陣地を塗る" },
      { value: "clear-control", label: "陣地を戻す" }
    ], uiState.boardEditor.paint || "piece");

    syncSelect(els.editorCurrentPlayerSelect, [
      { value: "P1", label: "先手番" },
      { value: "P2", label: "後手番" }
    ], uiState.boardEditor.currentPlayer || "P1");

    els.editorGrid.innerHTML = "";
    els.editorGrid.style.gridTemplateColumns = "repeat(" + BOARD_COLS + ", minmax(0, 1fr))";
    for (var row = 0; row < BOARD_ROWS; row += 1) {
      for (var col = 0; col < BOARD_COLS; col += 1) {
        var cell = state.board[row][col];
        var piece = cell.pieceId ? getPiece(state, cell.pieceId) : null;
        var button = document.createElement("button");
        var note = [];
        button.type = "button";
        button.className = "cell editor-cell " + (cell.controller ? cell.controller.toLowerCase() : "neutral");
        if (cell.isBaseCenter) {
          button.classList.add("base-center");
        }
        if (piece) {
          button.classList.add("editor-cell-has-piece");
          button.textContent = pieceShortLabels[piece.kind] || (pieceLabels[piece.kind] || piece.kind);
          button.title = (pieceLabels[piece.kind] || piece.kind) + " / " + PLAYER_LABELS[piece.owner];
        } else {
          button.textContent = "";
        }
        note.push((row + 1) + "-" + (col + 1));
        note.push(cell.controller ? ("陣地: " + PLAYER_LABELS[cell.controller]) : "陣地なし");
        if (piece) {
          note.push((pieceLabels[piece.kind] || piece.kind) + " / " + PLAYER_LABELS[piece.owner]);
        }
        button.title = note.join(" / ");
        button.addEventListener("click", (function (targetRow, targetCol) {
          return function () {
            applyBoardEditorCellAction(targetRow, targetCol);
          };
        }(row, col)));
        els.editorGrid.appendChild(button);
      }
    }
  }

  function render() {
    syncPieceNotationControl();
    syncBoardDisplayModeControl();
    applyBoardDisplayModeClass();
    renderStatus();
    renderPendingPieceBanner();
    renderAdvicePanel();
    syncAiDebugOverlay();
    syncAiDebugButton();
    renderAiDebugStatus();
    renderBoard();
    renderSide("P1", els.p1Reserve, els.p1FragmentReserve, els.p1Hand, els.p1DeckCount);
    renderSide("P2", els.p2Reserve, els.p2FragmentReserve, els.p2Hand, els.p2DeckCount);
    renderLog();
    renderHistoryPanel();
    renderReplayTools();
    renderAnalysisMetaPanel();
    renderVariationTrailPanel();
    renderComparisonPanel();
    renderReviewNotePanel();
    renderBranchRoomsPanel();
    renderReviewArrowOverlay();
    renderMovementSummary();
    renderFragmentCatalog();
    renderRoomList();
    renderOnlineStatus();
    renderSimpleLobbyLayout();
    renderBoardEditor();
    setScreen(uiState.screen || "lobby");
    syncContextMenuState();
    if (window.UNFOLD_3D_RENDERER && typeof window.UNFOLD_3D_RENDERER.renderScene === "function") {
      window.UNFOLD_3D_RENDERER.renderScene();
    }
  }

  function renderStatus() {
    ensureClockState(uiState.state);
    els.turnLabel.textContent = isInitialStandbyPhase(uiState.state)
      ? PLAYER_LABELS[uiState.state.currentPlayer] + " スタンバイ " + getInitialStandbyProgressText(uiState.state, uiState.state.currentPlayer)
      : PLAYER_LABELS[uiState.state.currentPlayer];
    els.modeLabel.textContent = GAME_MODE_LABELS[getCurrentRuleMode()] + " / " + getModeText();
    els.winnerLabel.textContent = uiState.state.winner ? PLAYER_LABELS[uiState.state.winner] : "-";
    if (els.winnerOverlay && els.winnerOverlayText && els.winnerOverlayReason) {
      if (uiState.state.winner) {
        els.winnerOverlay.hidden = false;
        els.winnerOverlayText.textContent = PLAYER_LABELS[uiState.state.winner] + " の勝利";
        els.winnerOverlayReason.textContent = uiState.state.winReason || "";
        els.winnerOverlay.classList.toggle("winner-p1", uiState.state.winner === "P1");
        els.winnerOverlay.classList.toggle("winner-p2", uiState.state.winner === "P2");
        if (els.winnerRestartBtn) {
          els.winnerRestartBtn.hidden = !isNpcGame();
        }
      } else {
        els.winnerOverlay.hidden = true;
        els.winnerOverlayText.textContent = "-";
        els.winnerOverlayReason.textContent = "";
        els.winnerOverlay.classList.remove("winner-p1", "winner-p2");
        if (els.winnerRestartBtn) {
          els.winnerRestartBtn.hidden = true;
        }
      }
    }
    var tacticalAlert = getTacticalAlertForState(uiState.state, uiState.state.currentPlayer);
    els.messageLabel.textContent = getMessageText(tacticalAlert);
    els.messageLabel.classList.toggle("tactical-alert-danger", !!tacticalAlert && tacticalAlert.severity === "danger");
    els.messageLabel.classList.toggle("tactical-alert-chance", !!tacticalAlert && tacticalAlert.severity === "chance");
    var viewerSide = getBoardViewerSide();
    if (els.turnCard) {
      els.turnCard.classList.toggle("turn-p1", uiState.state.currentPlayer === "P1");
      els.turnCard.classList.toggle("turn-p2", uiState.state.currentPlayer === "P2");
    }
    if (els.p1Panel) {
      els.p1Panel.classList.toggle("active-turn-panel", uiState.state.currentPlayer === "P1");
      els.p1Panel.classList.toggle("player-home-panel", viewerSide === "P1");
      els.p1Panel.classList.toggle("player-away-panel", viewerSide !== "P1");
    }
    if (els.p2Panel) {
      els.p2Panel.classList.toggle("active-turn-panel", uiState.state.currentPlayer === "P2");
      els.p2Panel.classList.toggle("player-home-panel", viewerSide === "P2");
      els.p2Panel.classList.toggle("player-away-panel", viewerSide !== "P2");
    }
    renderClockDisplay();
    syncClockTicker();
  }

  function getHistoryStepText(entry, index) {
    var nextPlayer = entry && entry.currentPlayer ? entry.currentPlayer : uiState.state.currentPlayer;
    var turnNumber = entry && typeof entry.turnNumber === "number" ? entry.turnNumber : (index + 1);
    var stepText;
    if (isInitialSetupHistoryEntry(entry)) {
      if (entry && entry.label === "初期スタンバイ完了") {
        return "初期準備完了 / 次: " + PLAYER_LABELS[nextPlayer] + " 1手目";
      }
      return "初期準備 / 次: " + PLAYER_LABELS[nextPlayer];
    }
    stepText = index === 0 ? "開始局面" : ("第" + getPlayableHistoryMoveNumber(index) + "手");
    return stepText + " / 次: " + PLAYER_LABELS[nextPlayer] + " " + turnNumber + "手目";
  }

  function isInitialSetupHistoryEntry(entry) {
    var label = entry && entry.label ? entry.label : "";
    return label.indexOf("初期スタンバイ") !== -1 || !!(entry && entry.snapshot && entry.snapshot.phase === "standby");
  }

  function getPlayableHistoryMoveNumber(index) {
    var history = getHistoryEntries();
    var count = 0;
    for (var i = 1; i <= index && i < history.length; i += 1) {
      if (!isInitialSetupHistoryEntry(history[i])) {
        count += 1;
      }
    }
    return Math.max(1, count);
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
      if (!isPendingFragmentPieceReady()) {
        els.pendingPieceBanner.innerHTML =
          "<strong>\u5C55\u958B\u56F3\u3092\u5C55\u958B\u4E2D</strong>" +
          "<span class=\"pending-piece-chip\">...</span>" +
          "<span>\u958B\u304D\u7D42\u308F\u308B\u3068\u3001\u99D2\u3092\u7F6E\u3051\u308B\u30DE\u30B9\u304C\u8868\u793A\u3055\u308C\u307E\u3059\u3002</span>";
        return;
      }
      els.pendingPieceBanner.innerHTML =
        "<strong>\u6B21\u306B\u7F6E\u304F\u99D2</strong>" +
        "<span class=\"pending-piece-chip\">" + getPieceLabel(uiState.pendingFragmentPiece.pieceType) + "</span>" +
        "<span>\u4ECA\u7F6E\u3044\u305F\u6B20\u7247\u306E\u4E2D\u304B\u3089\u3001\u7F6E\u304D\u305F\u3044\u30DE\u30B9\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044\u3002</span>";
      return;
    }
    if (uiState.selection && uiState.selection.type === "setupPiece" && uiState.selection.card) {
      els.pendingPieceBanner.hidden = false;
      els.pendingPieceBanner.innerHTML =
        "<strong>初期スタンバイ</strong>" +
        "<span class=\"pending-piece-chip\">" + getPieceLabel(uiState.selection.card.pieceType) + "</span>" +
        "<span>初期スタンバイでは展開図を置いてから、対応駒をその展開図上に配置します。</span>";
      return;
    }
    if (uiState.selection && uiState.selection.type === "fragment" && uiState.selection.card) {
      els.pendingPieceBanner.hidden = false;
      if (isInitialStandbyPhase(uiState.state)) {
        els.pendingPieceBanner.innerHTML =
          "<strong>初期スタンバイ</strong>" +
          "<span class=\"pending-piece-chip\">" + FRAGMENT_LIBRARY[uiState.selection.card.fragmentType].label + "</span>" +
          "<span>" + PLAYER_LABELS[uiState.state.currentPlayer] + "の " + getInitialStandbyStepLabel(uiState.state, uiState.state.currentPlayer) + "。展開図を本陣に1辺で接する形で置き、対応駒をその展開図上に置きます。</span>";
      } else {
        els.pendingPieceBanner.innerHTML =
          "<strong>\u3053\u306E\u6B20\u7247\u306E\u5BFE\u5FDC\u99D2</strong>" +
          "<span class=\"pending-piece-chip\">" + getPieceLabel(uiState.selection.card.pieceType) + "</span>" +
          "<span>\u6B20\u7247\u3092\u7F6E\u3044\u305F\u5F8C\u306B\u3001\u3053\u306E\u99D2\u306E\u7F6E\u304D\u5834\u3092\u9078\u3073\u307E\u3059\u3002</span>";
      }
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

  function ensureAdvicePanel() {
    var boardCard;
    var insertAfter;
    if (els.advicePanel) {
      return els.advicePanel;
    }
    boardCard = els.sceneViewport ? els.sceneViewport.closest(".board-card") : null;
    if (!boardCard) {
      return null;
    }
    els.advicePanel = document.createElement("div");
    els.advicePanel.id = "advicePanel";
    els.advicePanel.className = "advice-panel";
    els.advicePanel.hidden = true;
    insertAfter = els.pendingPieceBanner || boardCard.querySelector(".scene-control-guide");
    if (insertAfter && insertAfter.parentElement === boardCard) {
      insertAfter.insertAdjacentElement("afterend", els.advicePanel);
    } else {
      boardCard.insertBefore(els.advicePanel, els.sceneViewport || boardCard.firstChild);
    }
    return els.advicePanel;
  }

  function getAdviceFormationLabel(state) {
    var p1Pressure;
    var p2Pressure;
    var p1Defense;
    var p2Defense;
    var phase;
    if (state.winner) {
      return "終局";
    }
    if (isInitialStandbyPhase(state)) {
      return "初期スタンバイ";
    }
    p1Pressure = getBaseCenterPressureScore(state, "P1");
    p2Pressure = getBaseCenterPressureScore(state, "P2");
    p1Defense = getDefenseSnapshotCached(state, "P1");
    p2Defense = getDefenseSnapshotCached(state, "P2");
    phase = getNpcGamePhase(state);
    if (p1Defense.immediateWins || p2Defense.immediateWins) {
      return "即応局面";
    }
    if (phase === "setup" || phase === "early") {
      if (p1Defense.kingDanger + p2Defense.kingDanger <= 1) {
        return "本陣接続囲い";
      }
      return "序盤の受け合い";
    }
    if (Math.abs(p1Pressure - p2Pressure) >= 80) {
      return p1Pressure > p2Pressure ? "先手中央圧力型" : "後手中央圧力型";
    }
    if (getClosingPressureScoreForPlayer(state, "P1") + getClosingPressureScoreForPlayer(state, "P2") > 180000) {
      return "寄せ合い";
    }
    return "バランス戦型";
  }

  function getAdviceCandidateActions(state, player, limit) {
    var actions;
    var emergencyMode;
    if (!state || state.winner || isInitialStandbyPhase(state)) {
      return [];
    }
    try {
      actions = collectNpcActionsForState(state, player);
      if (!actions.length) {
        return [];
      }
      emergencyMode = isKingUnderThreatInState(state, player) || getDefenseSnapshotCached(state, player).immediateWins > 0;
      actions = refineNpcCandidateActions(state, player, actions, emergencyMode);
      return actions.slice(0, limit || 3);
    } catch (error) {
      return [];
    }
  }

  function getAdviceActionLabel(state, action) {
    var summary;
    try {
      summary = summarizeSelfPlayAction(state, action);
      return summary && summary.label ? summary.label : action.type;
    } catch (error) {
      return action.type;
    }
  }

  function appendAdvicePill(container, label, value) {
    var pill = document.createElement("span");
    pill.className = "advice-pill";
    pill.textContent = label + ": " + value;
    container.appendChild(pill);
  }

  function renderAdvicePanel() {
    var panel = ensureAdvicePanel();
    var state = uiState.state;
    var currentPlayer;
    var opponent;
    var currentWins;
    var opponentWins;
    var defense;
    var messages = [];
    var head;
    var title;
    var meta;
    var body;
    var list;
    if (!panel) {
      return;
    }
    panel.hidden = true;
    panel.innerHTML = "";
    return;
    if (!state || uiState.screen !== "game") {
      panel.hidden = true;
      panel.innerHTML = "";
      return;
    }

    currentPlayer = state.currentPlayer;
    opponent = getOpponentPlayer(currentPlayer);
    panel.hidden = false;
    panel.className = "advice-panel" + (uiState.tsumeMode ? " tsume-advice-panel" : "");
    panel.innerHTML = "";

    defense = (state.winner || isInitialStandbyPhase(state)) ? null : getDefenseSnapshotCached(state, currentPlayer);
    currentWins = (uiState.tsumeMode && !state.winner && !isInitialStandbyPhase(state))
      ? findImmediateWinningActionsInState(state, currentPlayer, 3)
      : [];
    opponentWins = [];

    if (uiState.tsumeMode) {
      if (state.winner) {
        messages.push("正解です。勝ち筋を実戦でも再現できるか、棋譜で手順を見返してみてください。");
      } else if (currentWins.length) {
        messages.push("詰将棋: 1手勝ちがあります。王の捕獲か本陣中央の上書きを探してください。");
      } else {
        messages.push("詰将棋: まだ1手勝ちがありません。次に勝ち筋を作る展開図・移動を考える練習局面です。");
      }
    } else if (currentWins.length) {
      messages.push("勝ち筋あり: この手番で勝てる候補があります。王の捕獲か相手本陣中央の上書きを最優先で確認してください。");
    } else if (opponentWins.length || (defense && defense.immediateWins)) {
      messages.push("受け必須: 相手に即勝ち筋があります。攻める前に王と本陣中央の危険を消してください。");
    } else if (defense && defense.kingThreatened) {
      messages.push("王が狙われています。移動、捕獲、持駒打ち、展開図で受ける候補を優先してください。");
    } else if (defense && defense.baseHot) {
      messages.push("本陣中心が危険です。中心マスを守る駒か、相手の上書きルートを切る展開図を検討してください。");
    } else {
      messages.push("次の相手手番で即負けが出ない形を保ちながら、展開図で道を伸ばしてください。");
    }

    head = document.createElement("div");
    head.className = "advice-head";
    title = document.createElement("div");
    title.innerHTML = "<span class=\"label\">ADVICE</span>";
    meta = document.createElement("div");
    meta.className = "advice-pills";
    appendAdvicePill(meta, "手番", PLAYER_LABELS[currentPlayer]);
    appendAdvicePill(meta, "型", getAdviceFormationLabel(state));
    if (defense) {
      appendAdvicePill(meta, "危険", String(defense.immediateWins));
    }
    head.appendChild(title);
    head.appendChild(meta);

    body = document.createElement("div");
    body.className = "advice-body";
    list = document.createElement("ul");
    messages.forEach(function (message) {
      var item = document.createElement("li");
      item.textContent = message;
      list.appendChild(item);
    });
    body.appendChild(list);

    panel.appendChild(head);
    panel.appendChild(body);
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
    var attackMap = getAttackMapForStateCached(state, player);
    var dangerMap = getDangerMapForStateCached(state, player);
    var defenseSnapshot = getDefenseSnapshotCached(state, player);
    var basePressureScore = getBaseCenterPressureScore(state, player);
    var opponentBasePressureScore = getBaseCenterPressureScore(state, opponent);
    var roleScore = getPieceRoleScoreForPlayer(state, player);
    var opponentRoleScore = getPieceRoleScoreForPlayer(state, opponent);
    var ownBase = findBaseCenterInState(state, player);
    var ownKing = findKingInState(state, player);
    var enemyBase = findBaseCenterInState(state, opponent);
    var cells = [];
    var mapStats = getBoardMapStatsBatch([attackMap.counts, dangerMap.counts, dangerMap.immediateCounts]);
    var attackStats = mapStats[0];
    var dangerStats = mapStats[1];
    var hotStats = mapStats[2];
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
      attackedCells: attackStats.nonzero,
      dangerCells: dangerStats.nonzero,
      hotCells: hotStats.nonzero,
      maxAttackCount: attackStats.max,
      maxDangerCount: dangerStats.max,
      maxHotCount: hotStats.max,
      statsEngine: attackStats.source === "wasm" || dangerStats.source === "wasm" || hotStats.source === "wasm" ? "wasm" : "js",
      ownBase: ownBase ? { row: ownBase.row, col: ownBase.col } : null,
      ownKing: ownKing ? { row: ownKing.row, col: ownKing.col } : null,
      enemyBase: enemyBase ? { row: enemyBase.row, col: enemyBase.col } : null,
      cells: cells
    };
  }

  function syncAiDebugOverlay() {
    if (uiState.aiDebug) {
      uiState.aiDebug.mode = "off";
      uiState.aiDebug.overlay = null;
      uiState.aiDebug.cacheKey = "";
      return;
    }
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
    if (uiState.aiDebug) {
      uiState.aiDebug.mode = "off";
      uiState.aiDebug.overlay = null;
      uiState.aiDebug.cacheKey = "";
    }
    els.toggleAiDebugBtn.hidden = true;
    els.toggleAiDebugBtn.style.display = "none";
    els.toggleAiDebugBtn.classList.remove("active-tool");
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
    summary.push("<span class=\"ai-debug-chip\">Engine " + String(overlay.statsEngine || "js").toUpperCase() + "</span>");
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
    var compareOverlay = uiState.compareOverlay || null;
    for (var row = 0; row < BOARD_ROWS; row += 1) {
      for (var col = 0; col < BOARD_COLS; col += 1) {
        var cell = uiState.state.board[row][col];
        var debugCell = overlay ? getAiDebugCellData(row, col) : null;
        var compareCell = compareOverlay && compareOverlay.cells && compareOverlay.cells[row]
          ? compareOverlay.cells[row][col]
          : null;
        var button = document.createElement("button");
        button.type = "button";
        button.className = "cell " + (cell.controller ? cell.controller.toLowerCase() : "neutral");
        if (cell.isBaseCenter) {
          button.classList.add("base-center");
        }
        if (uiState.selection && uiState.selection.type === "piece" && pieceMatchesCell(uiState.selection.pieceId, row, col)) {
          button.classList.add("selected");
        }
        if (isReviewArrowAnchorCell(row, col)) {
          button.classList.add("review-arrow-anchor-cell");
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
        if (compareCell) {
          if (compareCell.pieceChanged) {
            button.classList.add("compare-piece-cell");
          }
          if (compareCell.controlChanged) {
            button.classList.add("compare-control-cell");
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

  function getReviewOverlayAnchorElement() {
    if (window.UNFOLD_3D_RENDERER
      && typeof window.UNFOLD_3D_RENDERER.projectBoardCell === "function"
      && els.sceneViewport) {
      return els.sceneViewport;
    }
    return els.board;
  }

  function ensureReviewArrowOverlay() {
    var anchor = getReviewOverlayAnchorElement();
    var overlay = els.reviewArrowOverlay;
    if (!anchor) {
      return null;
    }
    if (!overlay || overlay.parentElement !== anchor) {
      overlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      overlay.setAttribute("class", "review-arrow-overlay");
      overlay.setAttribute("aria-hidden", "true");
      anchor.appendChild(overlay);
      els.reviewArrowOverlay = overlay;
    }
    overlay.setAttribute("width", String(anchor.clientWidth || anchor.offsetWidth || 0));
    overlay.setAttribute("height", String(anchor.clientHeight || anchor.offsetHeight || 0));
    overlay.setAttribute("viewBox", "0 0 " + (anchor.clientWidth || anchor.offsetWidth || 0) + " " + (anchor.clientHeight || anchor.offsetHeight || 0));
    return overlay;
  }

  function getReviewArrowPoint(row, col) {
    var anchor = getReviewOverlayAnchorElement();
    var width;
    var height;
    if (window.UNFOLD_3D_RENDERER
      && typeof window.UNFOLD_3D_RENDERER.projectBoardCell === "function"
      && anchor === els.sceneViewport) {
      var projected = window.UNFOLD_3D_RENDERER.projectBoardCell(row, col, 0.3);
      if (!projected || projected.visible === false) {
        return null;
      }
      return projected;
    }
    if (!anchor) {
      return null;
    }
    width = anchor.clientWidth || anchor.offsetWidth || 0;
    height = anchor.clientHeight || anchor.offsetHeight || 0;
    if (!width || !height) {
      return null;
    }
    return {
      x: ((col + 0.5) / BOARD_COLS) * width,
      y: ((row + 0.5) / BOARD_ROWS) * height
    };
  }

  function buildReviewArrowSegment(fromPoint, toPoint, arrow, index) {
    var dx = toPoint.x - fromPoint.x;
    var dy = toPoint.y - fromPoint.y;
    var distance = Math.sqrt(dx * dx + dy * dy) || 1;
    var padding = Math.min(18, Math.max(9, distance * 0.11));
    var startX = fromPoint.x + (dx / distance) * padding;
    var startY = fromPoint.y + (dy / distance) * padding;
    var endX = toPoint.x - (dx / distance) * (padding + 2);
    var endY = toPoint.y - (dy / distance) * (padding + 2);
    return [
      "<g class=\"review-arrow-group\" data-arrow-index=\"", String(index), "\">",
      "<line class=\"review-arrow-line\" x1=\"", String(startX), "\" y1=\"", String(startY), "\" x2=\"", String(endX), "\" y2=\"", String(endY), "\" marker-end=\"url(#reviewArrowHead)\" />",
      "<circle class=\"review-arrow-node from\" cx=\"", String(fromPoint.x), "\" cy=\"", String(fromPoint.y), "\" r=\"8\" />",
      "<circle class=\"review-arrow-node to\" cx=\"", String(toPoint.x), "\" cy=\"", String(toPoint.y), "\" r=\"6\" />",
      "</g>"
    ].join("");
  }

  function renderReviewArrowOverlay() {
    var overlay = ensureReviewArrowOverlay();
    var arrows = getCurrentReviewArrowList();
    var anchorPoint = uiState.reviewArrowAnchor ? getReviewArrowPoint(uiState.reviewArrowAnchor.row, uiState.reviewArrowAnchor.col) : null;
    var markup = [];
    if (!overlay) {
      return;
    }
    if (!isOnlineReviewMode() || (!arrows.length && !anchorPoint)) {
      overlay.hidden = true;
      overlay.innerHTML = "";
      return;
    }
    overlay.hidden = false;
    markup.push("<defs><marker id=\"reviewArrowHead\" markerWidth=\"14\" markerHeight=\"14\" refX=\"10\" refY=\"7\" orient=\"auto\" markerUnits=\"strokeWidth\"><path d=\"M0 0 L14 7 L0 14 Z\" fill=\"#2f72bf\" /></marker></defs>");
    arrows.forEach(function (arrow, index) {
      var fromPoint = getReviewArrowPoint(arrow.from.row, arrow.from.col);
      var toPoint = getReviewArrowPoint(arrow.to.row, arrow.to.col);
      if (!fromPoint || !toPoint) {
        return;
      }
      markup.push(buildReviewArrowSegment(fromPoint, toPoint, arrow, index));
    });
    if (anchorPoint) {
      markup.push("<circle class=\"review-arrow-anchor\" cx=\"" + String(anchorPoint.x) + "\" cy=\"" + String(anchorPoint.y) + "\" r=\"12\" />");
    }
    overlay.innerHTML = markup.join("");
  }

  function appendChoiceCardPopover(button, options) {
    var popover;
    var title;
    var section;
    var label;
    var board;
    var detail;
    if (!button || !options) {
      return;
    }
    button.classList.add("has-popover");

    popover = document.createElement("span");
    popover.className = "choice-popover";
    popover.setAttribute("aria-hidden", "true");

    title = document.createElement("strong");
    title.className = "choice-popover-title";
    title.textContent = options.title || "";
    popover.appendChild(title);

    if (options.pieceType) {
      detail = document.createElement("span");
      detail.className = "choice-popover-piece-detail";
      detail.textContent = getPieceNameDetail(options.pieceType);
      popover.appendChild(detail);
    }

    if (options.fragmentType && FRAGMENT_LIBRARY[options.fragmentType]) {
      section = document.createElement("span");
      section.className = "choice-popover-section";
      label = document.createElement("span");
      label.className = "choice-popover-label";
      label.textContent = "展開図";
      board = document.createElement("span");
      board.className = "fragment-catalog-board choice-popover-board";
      appendFragmentMiniBoard(board, FRAGMENT_LIBRARY[options.fragmentType].cells);
      section.appendChild(label);
      section.appendChild(board);
      popover.appendChild(section);
    }

    if (options.pieceType) {
      section = document.createElement("span");
      section.className = "choice-popover-section";
      label = document.createElement("span");
      label.className = "choice-popover-label";
      label.textContent = "駒の移動";
      board = document.createElement("span");
      board.className = "movement-board choice-popover-board";
      appendMovementMiniBoard(board, options.pieceType);
      section.appendChild(label);
      section.appendChild(board);
      popover.appendChild(section);
    }

    button.appendChild(popover);
  }

  function renderSide(player, reserveEl, fragmentReserveEl, handEl, deckEl) {
    var playerState = ensurePlayerStateContainers(uiState.state, player);
    var isActionLocked = shouldLockHumanActions();
    var inInitialStandby = isInitialStandbyPhase(uiState.state);
    var fragmentReserveEntries;
    reserveEl.innerHTML = "";
    if (fragmentReserveEl) {
      fragmentReserveEl.innerHTML = "";
    }
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
      button.title = getPieceNotationTitle(pieceType);
      button.innerHTML = "<strong class=\"choice-piece-title\">" + getPieceLabel(pieceType) + "</strong>" +
        "<span class=\"choice-subtitle piece-name-detail\">" + getPieceNameDetail(pieceType) + "</span>" +
        "<span>\u6301\u3061\u99D2</span><span class=\"choice-count\">x" + playerState.reserve[pieceType] + "</span>";
      appendChoiceCardPopover(button, {
        title: getPieceLabel(pieceType),
        pieceType: pieceType
      });
      button.disabled = inInitialStandby || player !== uiState.state.currentPlayer || isActionLocked || !isHumanControlledPlayer(player);
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

    fragmentReserveEntries = getFragmentReserveEntries(playerState);
    fragmentReserveEntries.forEach(function (entry) {
      var card = entry.card;
      var button = document.createElement("button");
      button.className = "choice-card hand-card fragment-reserve-card";
      if (
        uiState.selection &&
        uiState.selection.type === "fragment" &&
        uiState.selection.source === "fragmentReserve" &&
        uiState.selection.player === player &&
        uiState.selection.fragmentReserveKey === entry.key
      ) {
        button.classList.add("active");
      }
      button.innerHTML = "<strong>" + FRAGMENT_LIBRARY[card.fragmentType].label + "</strong>" +
        "<span class=\"choice-subtitle\">\u6301\u3061\u5C55\u958B\u56F3</span>" +
        "<span class=\"choice-count\">x" + entry.count + "</span>" +
        "<span class=\"fragment-preview\">" + getFragmentPreviewText(card.fragmentType) + "</span>";
      appendChoiceCardPopover(button, {
        title: "\u6301\u3061\u5C55\u958B\u56F3: " + FRAGMENT_LIBRARY[card.fragmentType].label,
        fragmentType: card.fragmentType
      });
      button.disabled = inInitialStandby || player !== uiState.state.currentPlayer || isActionLocked || !isHumanControlledPlayer(player);
      button.addEventListener("click", function () {
        uiState.selection = {
          type: "fragment",
          source: "fragmentReserve",
          player: player,
          fragmentReserveKey: entry.key,
          card: cloneFragmentCard(card)
        };
        uiState.pendingAnchor = null;
        uiState.previewCells = [];
        uiState.previewLegal = false;
        uiState.moveTargets = [];
        uiState.reserveTargets = [];
        uiState.recoverPieceTargets = [];
        uiState.recoverFragmentTargets = [];
        render();
      });
      if (fragmentReserveEl) {
        fragmentReserveEl.appendChild(button);
      }
    });
    if (fragmentReserveEl && !fragmentReserveEl.childElementCount) {
      fragmentReserveEl.innerHTML = "<p class=\"subtle\">\u306A\u3057</p>";
    }

    playerState.hand.forEach(function (card, handIndex) {
      var button = document.createElement("button");
      button.className = "choice-card hand-card";
      if (uiState.selection
        && (uiState.selection.type === "fragment" || uiState.selection.type === "setupPiece")
        && uiState.selection.source !== "fragmentReserve"
        && uiState.selection.player === player
        && uiState.selection.handIndex === handIndex) {
        button.classList.add("active");
      }
      button.title = FRAGMENT_LIBRARY[card.fragmentType].label + "\n" + getPieceNotationTitle(card.pieceType);
      button.innerHTML = "<strong>" + FRAGMENT_LIBRARY[card.fragmentType].label + "</strong>" +
        "<strong class=\"choice-piece-title\">" + getPieceLabel(card.pieceType) + "</strong>" +
        "<span class=\"choice-subtitle piece-name-detail\">" + getPieceNameDetail(card.pieceType) + "</span>" +
        "<span class=\"fragment-preview\">" + getFragmentPreviewText(card.fragmentType) + "</span>";
      appendChoiceCardPopover(button, {
        title: FRAGMENT_LIBRARY[card.fragmentType].label + " / " + getPieceLabel(card.pieceType),
        fragmentType: card.fragmentType,
        pieceType: card.pieceType
      });
      button.disabled = player !== uiState.state.currentPlayer || isActionLocked || !isHumanControlledPlayer(player);
      button.addEventListener("click", function () {
        if (isInitialStandbyPhase(uiState.state) && isInitialStandbyBasePieceRule(uiState.state)) {
          uiState.selection = { type: "setupPiece", source: "hand", player: player, handIndex: handIndex, card: card, pieceType: card.pieceType };
          uiState.reserveTargets = getInitialStandbyBasePieceCellsForState(uiState.state, player);
        } else {
          uiState.selection = { type: "fragment", source: "hand", player: player, handIndex: handIndex, card: card };
          uiState.reserveTargets = [];
        }
        uiState.pendingAnchor = null;
        uiState.previewCells = [];
        uiState.previewLegal = false;
        uiState.moveTargets = [];
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
    var reviewReadOnly = isOnlineReviewMode() && !canControlOnlineReview();
    if (!els.historyCard || !els.historyList || !els.historyTitle) {
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
    els.historyTitle.textContent = getHistoryStepText(entry, selectedIndex) + ": " + entry.label;
    els.historyList.innerHTML = "";
    history.forEach(function (historyEntry, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "history-entry" + (index === selectedIndex ? " active" : "");
      button.textContent = getHistoryStepText(historyEntry, index) + " / " + historyEntry.label;
      button.disabled = reviewReadOnly;
      button.addEventListener("click", function () {
        if (uiState.replayOnly) {
          applyReplayHistoryIndex(index);
          return;
        }
        if (isOnlineReviewMode()) {
          if (!canControlOnlineReview()) {
            return;
          }
          requestOnlineReviewIndex(index);
          return;
        }
        uiState.replayIndex = index;
        renderHistoryPanel();
      });
      els.historyList.appendChild(button);
    });
    if (els.historyBoard) {
      els.historyBoard.innerHTML = "";
      els.historyBoard.hidden = true;
    }
    if (els.historyPrevBtn) {
      els.historyPrevBtn.disabled = selectedIndex <= 0 || reviewReadOnly;
    }
    if (els.historyNextBtn) {
      els.historyNextBtn.disabled = selectedIndex >= history.length - 1 || reviewReadOnly;
    }
  }

  function renderReplayTools() {
    var canManageReplay = uiState.screen === "game" && !isOnlineGame();
    var exportArchive = getCurrentReplayArchiveForExport();
    var branchArchive = buildReplayArchiveFromCurrentPosition();
    var replayHistory = uiState.replayArchive && uiState.replayArchive.history ? uiState.replayArchive.history : [];
    var showInlineExport = canManageReplay && !!exportArchive;
    if (els.replayExportBtn) {
      els.replayExportBtn.textContent = "棋譜を書き出す";
      els.replayExportBtn.hidden = !showInlineExport;
      els.replayExportBtn.disabled = !exportArchive;
    }
    if (els.replayImportBtn) {
      els.replayImportBtn.hidden = true;
      els.replayImportBtn.disabled = false;
    }
    if (els.replayReviewBtn) {
      els.replayReviewBtn.hidden = true;
      els.replayReviewBtn.disabled = !(uiState.replayOnly && replayHistory.length);
    }
    if (els.replayStudyBtn) {
      els.replayStudyBtn.hidden = true;
      els.replayStudyBtn.disabled = !branchArchive;
      els.replayStudyBtn.textContent = (isOnlineStudyRoom() || isOnlineReviewMode() || uiState.replayOnly)
        ? "この局面から分岐検討室"
        : "この局面から検討室";
    }
    if (els.editorLaunchBtn) {
      els.editorLaunchBtn.hidden = true;
      els.editorLaunchBtn.disabled = true;
    }
  }

  function renderAnalysisMetaPanel() {
    var shouldShow = canEditAnalysisMeta();
    if (!els.analysisMetaWrap || !els.analysisTitleField || !els.analysisCommentField || !els.analysisMetaSaveBtn || !els.analysisMetaStatus) {
      return;
    }
    els.analysisMetaWrap.hidden = true;
    return;
    els.analysisMetaWrap.hidden = !shouldShow;
    if (!shouldShow) {
      return;
    }
    if (document.activeElement !== els.analysisTitleField) {
      els.analysisTitleField.value = getCurrentAnalysisTitle();
    }
    if (document.activeElement !== els.analysisCommentField) {
      els.analysisCommentField.value = getCurrentAnalysisComment();
    }
    els.analysisTitleField.disabled = isOnlineStudyRoom() ? uiState.online.syncing : false;
    els.analysisCommentField.disabled = isOnlineStudyRoom() ? uiState.online.syncing : false;
    els.analysisMetaSaveBtn.disabled = isOnlineStudyRoom() ? uiState.online.syncing : false;
    els.analysisMetaStatus.textContent = isOnlineStudyRoom()
      ? "この検討室の名前とメモを共有できます。"
      : "この棋譜を書き出すと、検討名とメモも一緒に保存されます。";
  }

  function getCurrentVariationTrail() {
    var trail = [];
    var currentEntry;
    if (isOnlineStudyRoom() && uiState.online.room && uiState.online.room.studyOrigin) {
      trail = getStudyTrailFromOrigin(uiState.online.room.studyOrigin);
      currentEntry = createStudyTrailEntry({
        sourceType: uiState.online.studyKind || "study",
        roomId: uiState.online.roomId || "",
        roomName: uiState.online.roomName || "",
        archiveTitle: uiState.online.roomName || "検討室",
        stepLabel: "",
        playerNames: {
          P1: getDisplayedPlayerName("P1"),
          P2: getDisplayedPlayerName("P2")
        }
      });
      trail.push(currentEntry);
    } else if (uiState.replayOnly && uiState.replayArchive && uiState.replayArchive.sourceInfo) {
      trail = getStudyTrailFromOrigin(uiState.replayArchive.sourceInfo);
      trail.push(createStudyTrailEntry({
        sourceType: uiState.replayArchive.gameType || "replay",
        archiveTitle: uiState.replayArchive.title || "棋譜",
        stepLabel: "",
        playerNames: uiState.replayArchive.playerNames || {}
      }));
    }
    return trail.filter(Boolean);
  }

  function renderVariationTrailPanel() {
    var trail = getCurrentVariationTrail();
    if (!els.variationTrailWrap || !els.variationTrailList) {
      return;
    }
    els.variationTrailWrap.hidden = trail.length <= 1;
    if (trail.length <= 1) {
      return;
    }
    els.variationTrailList.innerHTML = "";
    trail.forEach(function (entry, index) {
      var jumpIndex = getHistoryIndexFromStepLabel(entry.stepLabel);
      var item = document.createElement(jumpIndex >= 0 ? "button" : "div");
      var title = document.createElement("strong");
      var meta = document.createElement("span");
      item.className = "variation-trail-item" + (jumpIndex >= 0 ? " variation-trail-jump" : "");
      if (jumpIndex >= 0) {
        item.type = "button";
        item.addEventListener("click", function () {
          jumpToHistoryStepLabel(entry.stepLabel);
        });
      }
      title.textContent = entry.archiveTitle || entry.roomName || "棋譜";
      meta.textContent = entry.stepLabel || (index === trail.length - 1 ? "現在の分岐" : "分岐元");
      item.appendChild(title);
      item.appendChild(meta);
      els.variationTrailList.appendChild(item);
    });
  }

  function getCurrentReferenceSource() {
    if (isOnlineStudyRoom() && uiState.online.room && uiState.online.room.studyReference) {
      return uiState.online.room.studyReference;
    }
    if (uiState.replayOnly && uiState.replayArchive && uiState.replayArchive.referenceSource) {
      return uiState.replayArchive.referenceSource;
    }
    return null;
  }

  function getPieceLabelForSnapshot(snapshot, pieceId) {
    var piece;
    if (!snapshot || !pieceId) {
      return "";
    }
    piece = getPiece(snapshot, pieceId);
    return piece ? getPieceShortLabel(piece.kind) : "";
  }

  function buildSingleSnapshotReference(room) {
    if (!room || !room.previewSnapshot) {
      return null;
    }
    return {
      title: room.name || "兄弟分岐",
      stepLabel: "現在局面",
      history: [{
        turnNumber: room.previewSnapshot.turnNumber || 0,
        currentPlayer: room.previewSnapshot.currentPlayer || "P1",
        label: "現在局面",
        snapshot: cloneGameState(room.previewSnapshot)
      }]
    };
  }

  function getSiblingCompareCandidates() {
    return getRelatedBranchRoomsForCurrentStep().filter(function (room) {
      return room && room.previewSnapshot;
    });
  }

  function getSelectedComparisonReference(selectedIndex) {
    var mode = uiState.compareSourceMode || "mainline";
    var siblingRoom;
    if (mode.indexOf("sibling:") === 0) {
      siblingRoom = getSiblingCompareCandidates().find(function (room) {
        return room.id === mode.slice(8);
      });
      return siblingRoom ? buildSingleSnapshotReference(siblingRoom) : null;
    }
    return getCurrentReferenceSource();
  }

  function buildSnapshotDifference(currentSnapshot, referenceSnapshot) {
    var pieceDiffs = [];
    var controlDiffs = [];
    var cells = [];
    var row;
    var col;
    for (row = 0; row < BOARD_ROWS; row += 1) {
      cells[row] = [];
      for (col = 0; col < BOARD_COLS; col += 1) {
        var currentCell = currentSnapshot.board[row][col];
        var referenceCell = referenceSnapshot.board[row][col];
        var currentPiece = getPieceLabelForSnapshot(currentSnapshot, currentCell.pieceId);
        var referencePiece = getPieceLabelForSnapshot(referenceSnapshot, referenceCell.pieceId);
        var pointText = (row + 1) + "-" + (col + 1);
        cells[row][col] = {
          pieceChanged: false,
          controlChanged: false
        };
        if (currentPiece !== referencePiece) {
          pieceDiffs.push(pointText + ": " + (referencePiece || "空") + " → " + (currentPiece || "空"));
          cells[row][col].pieceChanged = true;
        } else if ((currentCell.controller || "") !== (referenceCell.controller || "")) {
          controlDiffs.push(pointText + ": " + ((referenceCell.controller || "-")) + " → " + ((currentCell.controller || "-")));
          cells[row][col].controlChanged = true;
        }
      }
    }
    return {
      pieceDiffs: pieceDiffs,
      controlDiffs: controlDiffs,
      cells: cells
    };
  }

  function renderComparisonPanel() {
    var reference = getSelectedComparisonReference(uiState.replayIndex);
    var history = getHistoryEntries();
    var selectedIndex = uiState.replayIndex >= 0 ? uiState.replayIndex : history.length - 1;
    var referenceHistory;
    var referenceEntry;
    var currentEntry;
    var diff;
    var siblingCandidates = getSiblingCompareCandidates();
    if (!els.compareWrap || !els.compareSummary || !els.compareList) {
      return;
    }
    if (els.compareSourceBar) {
      els.compareSourceBar.innerHTML = "";
      if (getCurrentReferenceSource()) {
        var baseBtn = document.createElement("button");
        baseBtn.type = "button";
        baseBtn.className = "ghost-button compare-source-chip" + ((uiState.compareSourceMode || "mainline") === "mainline" ? " active-tool" : "");
        baseBtn.textContent = "親枝 / 本譜";
        baseBtn.addEventListener("click", function () {
          uiState.compareSourceMode = "mainline";
          render();
        });
        els.compareSourceBar.appendChild(baseBtn);
      }
      siblingCandidates.slice(0, 4).forEach(function (room) {
        var button = document.createElement("button");
        var key = "sibling:" + room.id;
        button.type = "button";
        button.className = "ghost-button compare-source-chip" + ((uiState.compareSourceMode || "") === key ? " active-tool" : "");
        button.textContent = room.name || room.id;
        button.addEventListener("click", function () {
          uiState.compareSourceMode = key;
          uiState.compareSiblingRoomId = room.id;
          render();
        });
        els.compareSourceBar.appendChild(button);
      });
    }
    els.compareWrap.hidden = !reference;
    uiState.compareOverlay = null;
    if (!reference) {
      return;
    }
    referenceHistory = Array.isArray(reference.history) ? reference.history : [];
    if (!history.length || !referenceHistory.length) {
      els.compareSummary.textContent = "比較できる本譜データがありません。";
      els.compareList.innerHTML = "";
      return;
    }
    if (selectedIndex < 0) {
      selectedIndex = 0;
    }
    if (selectedIndex >= history.length) {
      selectedIndex = history.length - 1;
    }
    currentEntry = history[selectedIndex];
    referenceEntry = referenceHistory[Math.min(selectedIndex, referenceHistory.length - 1)];
    diff = buildSnapshotDifference(currentEntry.snapshot, referenceEntry.snapshot);
    uiState.compareOverlay = diff;
    els.compareSummary.textContent = (reference.title || "本譜")
      + " / "
      + (referenceEntry.label || reference.stepLabel || "開始局面")
      + " と比較";
    els.compareList.innerHTML = "";
    if (!diff.pieceDiffs.length && !diff.controlDiffs.length) {
      var same = document.createElement("p");
      same.className = "compare-empty";
      same.textContent = "この手数では、まだ本譜と同じ局面です。";
      els.compareList.appendChild(same);
      return;
    }
    if (diff.pieceDiffs.length) {
      var pieceHead = document.createElement("p");
      pieceHead.className = "compare-section-title";
      pieceHead.textContent = "駒の違い " + diff.pieceDiffs.length + " 箇所";
      els.compareList.appendChild(pieceHead);
      diff.pieceDiffs.slice(0, 8).forEach(function (text) {
        var item = document.createElement("p");
        item.className = "compare-item";
        item.textContent = text;
        els.compareList.appendChild(item);
      });
    }
    if (diff.controlDiffs.length) {
      var controlHead = document.createElement("p");
      controlHead.className = "compare-section-title";
      controlHead.textContent = "陣地の違い " + diff.controlDiffs.length + " 箇所";
      els.compareList.appendChild(controlHead);
      diff.controlDiffs.slice(0, 8).forEach(function (text) {
        var item = document.createElement("p");
        item.className = "compare-item";
        item.textContent = text;
        els.compareList.appendChild(item);
      });
    }
  }

  function getCurrentReviewNoteEntry() {
    var key = String(Math.max(0, uiState.replayIndex));
    if (!isOnlineReviewMode()) {
      return null;
    }
    return uiState.online.reviewNotes && uiState.online.reviewNotes[key] ? uiState.online.reviewNotes[key] : null;
  }

  function getCurrentReviewNoteText() {
    var entry = getCurrentReviewNoteEntry();
    if (!entry) {
      return "";
    }
    return typeof entry === "string" ? entry : (entry.text || "");
  }

  function getCurrentReviewNoteTags() {
    var entry = getCurrentReviewNoteEntry();
    if (!entry || typeof entry === "string" || !Array.isArray(entry.tags)) {
      return [];
    }
    return entry.tags.slice();
  }

  function toggleReviewNoteTag(tag) {
    var nextTags = (uiState.reviewNoteTags || []).slice();
    var index = nextTags.indexOf(tag);
    if (index >= 0) {
      nextTags.splice(index, 1);
    } else {
      nextTags.push(tag);
    }
    uiState.reviewNoteTags = nextTags.slice(0, 4);
    renderReviewNotePanel();
  }

  function normalizeReviewArrowList(arrows) {
    return (Array.isArray(arrows) ? arrows : []).map(function (arrow) {
      if (!arrow || !arrow.from || !arrow.to) {
        return null;
      }
      return {
        from: {
          row: Number(arrow.from.row),
          col: Number(arrow.from.col)
        },
        to: {
          row: Number(arrow.to.row),
          col: Number(arrow.to.col)
        }
      };
    }).filter(function (arrow) {
      return arrow
        && Number.isInteger(arrow.from.row)
        && Number.isInteger(arrow.from.col)
        && Number.isInteger(arrow.to.row)
        && Number.isInteger(arrow.to.col)
        && arrow.from.row >= 0
        && arrow.from.row < BOARD_ROWS
        && arrow.to.row >= 0
        && arrow.to.row < BOARD_ROWS
        && arrow.from.col >= 0
        && arrow.from.col < BOARD_COLS
        && arrow.to.col >= 0
        && arrow.to.col < BOARD_COLS
        && !(arrow.from.row === arrow.to.row && arrow.from.col === arrow.to.col);
    }).slice(0, 12);
  }

  function getCurrentReviewArrowList() {
    var key = String(Math.max(0, uiState.replayIndex));
    if (!isOnlineReviewMode()) {
      return [];
    }
    return normalizeReviewArrowList(uiState.online.reviewArrows && uiState.online.reviewArrows[key] ? uiState.online.reviewArrows[key] : []);
  }

  function getCurrentHistoryStepLabel() {
    var history = getHistoryEntries();
    var selectedIndex = uiState.replayIndex >= 0 ? uiState.replayIndex : history.length - 1;
    if (!history.length) {
      return "開始局面";
    }
    if (selectedIndex < 0) {
      selectedIndex = 0;
    }
    if (selectedIndex >= history.length) {
      selectedIndex = history.length - 1;
    }
    return selectedIndex === 0 ? "開始局面" : ("第" + selectedIndex + "手");
  }

  function getHistoryIndexFromStepLabel(stepLabel) {
    var match;
    if (!stepLabel) {
      return -1;
    }
    if (stepLabel === "開始局面") {
      return 0;
    }
    match = /^第(\d+)手$/.exec(String(stepLabel).trim());
    return match ? Number(match[1]) : -1;
  }

  function jumpToHistoryStepLabel(stepLabel) {
    var history = getHistoryEntries();
    var index = getHistoryIndexFromStepLabel(stepLabel);
    if (!history.length || index < 0 || index >= history.length) {
      return false;
    }
    if (uiState.replayOnly) {
      applyReplayHistoryIndex(index);
      return true;
    }
    if (isOnlineReviewMode()) {
      if (!canControlOnlineReview()) {
        return false;
      }
      requestOnlineReviewIndex(index);
      return true;
    }
    uiState.replayIndex = index;
    render();
    return true;
  }

  function buildOnlineBranchReferenceFromCurrentStep() {
    if (!isOnlineGame()) {
      return null;
    }
    return {
      sourceType: isOnlineStudyRoom()
        ? (isOnlineStudyBranchRoom() ? "study-branch" : "study-review")
        : "online-review",
      roomId: uiState.online.roomId || "",
      archiveTitle: uiState.online.roomName || "",
      stepLabel: getCurrentHistoryStepLabel()
    };
  }

  function buildStudyReferenceKey(origin) {
    if (!origin) {
      return "";
    }
    return [
      origin.sourceType || "",
      origin.roomId || "",
      origin.archiveTitle || "",
      origin.stepLabel || ""
    ].join("|");
  }

  function formatStudyOriginText(origin) {
    if (!origin) {
      return "";
    }
    return (origin.archiveTitle || origin.roomName || "棋譜")
      + (origin.stepLabel ? (" / " + origin.stepLabel) : "");
  }

  function getCurrentBranchTreePath() {
    var trail = getCurrentVariationTrail().slice();
    if (!trail.length && isOnlineGame()) {
      trail.push(createStudyTrailEntry({
        sourceType: isOnlineStudyRoom()
          ? (isOnlineStudyBranchRoom() ? "study-branch" : "study-review")
          : "online-review",
        roomId: uiState.online.roomId || "",
        roomName: uiState.online.roomName || "",
        archiveTitle: uiState.online.roomName || (isOnlineStudyRoom() ? "検討室" : "オンライン対戦"),
        stepLabel: "",
        playerNames: {
          P1: getDisplayedPlayerName("P1"),
          P2: getDisplayedPlayerName("P2")
        }
      }));
    }
    return trail.filter(Boolean);
  }

  function getBranchRoomDescendantCount(roomId) {
    if (!roomId || !uiState.lobbyRooms || !uiState.lobbyRooms.length) {
      return 0;
    }
    return uiState.lobbyRooms.filter(function (room) {
      var trail;
      if (!room || room.roomType !== "study" || room.studyKind !== "branch" || !room.studyOrigin) {
        return false;
      }
      if ((room.studyOrigin.roomId || "") === roomId) {
        return true;
      }
      trail = Array.isArray(room.studyOrigin.originTrail) ? room.studyOrigin.originTrail : [];
      return trail.some(function (entry) {
        return (entry.roomId || "") === roomId;
      });
    }).length;
  }

  function createBranchTreeRoomItem(room) {
    var item = document.createElement("article");
    var title = document.createElement("strong");
    var meta = document.createElement("span");
    var comment = document.createElement("span");
    var descendants = document.createElement("span");
    var actions = document.createElement("div");
    var copyBtn = document.createElement("button");
    var joinBtn = document.createElement("button");
    var compareBtn = document.createElement("button");
    var descendantCount = getBranchRoomDescendantCount(room.id);

    item.className = "branch-room-item branch-tree-room-item";
    title.textContent = (room.name || ("部屋 " + room.id)) + " [" + room.id + "]";
    meta.textContent = (room.hostName || "-")
      + " / "
      + (room.guestName || "募集中")
      + " / "
      + getRoomStatusLabel(room.status)
      + " / "
      + formatUpdatedText(room.updatedAt).replace("更新: ", "");
    item.appendChild(title);
    item.appendChild(meta);
    if (room.studyComment) {
      comment.className = "branch-room-descendants";
      comment.textContent = "要点: " + String(room.studyComment).slice(0, 100);
      item.appendChild(comment);
    }

    if (descendantCount > 0) {
      descendants.className = "branch-room-descendants";
      descendants.textContent = "さらに派生: " + descendantCount + "室";
      item.appendChild(descendants);
    }

    actions.className = "branch-room-item-actions";
    copyBtn.type = "button";
    copyBtn.className = "ghost-button";
    copyBtn.textContent = "コードコピー";
    copyBtn.addEventListener("click", function () {
      copyTextToClipboard(room.id, "参加コード " + room.id + " をコピーしました。");
    });
    actions.appendChild(copyBtn);

    compareBtn.type = "button";
    compareBtn.className = "ghost-button";
    compareBtn.textContent = "比較";
    compareBtn.disabled = !room.previewSnapshot;
    compareBtn.addEventListener("click", function () {
      uiState.compareSourceMode = "sibling:" + room.id;
      uiState.compareSiblingRoomId = room.id;
      render();
    });
    actions.appendChild(compareBtn);

    joinBtn.type = "button";
    joinBtn.className = "ghost-button";
    joinBtn.textContent = room.isFull ? "満室" : "参加";
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

    item.appendChild(actions);
    return item;
  }

  function getRelatedBranchRoomsForCurrentStep() {
    var reference = buildOnlineBranchReferenceFromCurrentStep();
    var referenceKey = buildStudyReferenceKey(reference);
    if (!referenceKey || !uiState.lobbyRooms || !uiState.lobbyRooms.length) {
      return [];
    }
    return uiState.lobbyRooms.filter(function (room) {
      return room
        && room.roomType === "study"
        && room.studyKind === "branch"
        && room.id !== uiState.online.roomId
        && buildStudyReferenceKey(room.studyOrigin) === referenceKey;
    }).sort(compareLobbyRooms);
  }

  function renderBranchRoomsPanel() {
    var shouldShow = uiState.screen === "game" && isOnlineGame() && (isOnlineStudyRoom() || isOnlineReviewMode());
    var origin = uiState.online.room && uiState.online.room.studyOrigin ? uiState.online.room.studyOrigin : null;
    var path = getCurrentBranchTreePath();
    var relatedRooms = getRelatedBranchRoomsForCurrentStep();
    var visibleRooms = relatedRooms;
    var hiddenCount = 0;
    if (!els.branchRoomsWrap || !els.branchRoomsOrigin || !els.branchRoomsStatus || !els.branchRoomsList || !els.branchRoomsRefreshBtn || !els.branchRoomsToggleBtn) {
      return;
    }
    els.branchRoomsWrap.hidden = !shouldShow;
    if (!shouldShow) {
      uiState.branchRoomsExpanded = false;
      return;
    }
    if (relatedRooms.length <= 3) {
      uiState.branchRoomsExpanded = false;
    }
    if (!uiState.branchRoomsExpanded && relatedRooms.length > 3) {
      visibleRooms = relatedRooms.slice(0, 3);
      hiddenCount = relatedRooms.length - visibleRooms.length;
    }
    els.branchRoomsOrigin.textContent = origin
      ? "現在の枝: " + formatStudyOriginText(origin)
      : "本譜の現在局面から、共同で検討する分岐室を作れます。";
    els.branchRoomsStatus.textContent = relatedRooms.length
      ? ("この局面から伸びている子分岐: " + relatedRooms.length + "室")
      : "この局面から伸びている子分岐はまだありません。";
    els.branchRoomsRefreshBtn.disabled = uiState.online.syncing;
    els.branchRoomsToggleBtn.hidden = relatedRooms.length <= 3;
    els.branchRoomsToggleBtn.disabled = uiState.online.syncing;
    els.branchRoomsToggleBtn.textContent = uiState.branchRoomsExpanded ? "たたむ" : ("もっと見る +" + hiddenCount);
    els.branchRoomsList.innerHTML = "";
    if (!relatedRooms.length) {
      var empty = document.createElement("p");
      empty.className = "branch-room-empty";
      empty.textContent = "この局面から新しい分岐検討室を作ると、ここに枝として並びます。";
      els.branchRoomsList.appendChild(empty);
    }
    (function renderTree() {
      var trunk = document.createElement("div");
      var currentNode;
      trunk.className = "branch-tree-trunk";

      path.forEach(function (entry, index) {
        var jumpIndex = getHistoryIndexFromStepLabel(entry.stepLabel);
        var node = document.createElement(jumpIndex >= 0 ? "button" : "div");
        var title = document.createElement("strong");
        var meta = document.createElement("span");
        var isLast = index === path.length - 1;
        var metaText = entry.stepLabel || "";
        node.className = "branch-tree-node" + (isLast ? " branch-tree-node-current" : "");
        if (jumpIndex >= 0) {
          node.type = "button";
          node.classList.add("branch-tree-node-button");
          node.addEventListener("click", function () {
            jumpToHistoryStepLabel(entry.stepLabel);
          });
        }
        if (!metaText) {
          if (isLast) {
            metaText = isOnlineStudyRoom() ? "現在の検討室" : "現在の対局";
          } else if (index === 0) {
            metaText = "起点";
          } else {
            metaText = "経由";
          }
        }
        title.textContent = entry.archiveTitle || entry.roomName || "棋譜";
        meta.textContent = metaText;
        node.appendChild(title);
        node.appendChild(meta);
        trunk.appendChild(node);
        if (isLast) {
          currentNode = node;
        }
      });

      if (!currentNode) {
        currentNode = document.createElement("div");
        currentNode.className = "branch-tree-node branch-tree-node-current";
        trunk.appendChild(currentNode);
      }

      (function appendCurrentStep() {
        var stepNode = document.createElement("div");
        var stepTitle = document.createElement("strong");
        var stepMeta = document.createElement("span");
        var childrenWrap = document.createElement("div");

        stepNode.className = "branch-tree-node branch-tree-node-step branch-tree-node-current";
        stepTitle.textContent = "現在の局面";
        stepMeta.textContent = getCurrentHistoryStepLabel();
        stepNode.appendChild(stepTitle);
        stepNode.appendChild(stepMeta);

        childrenWrap.className = "branch-tree-children";
        if (visibleRooms.length) {
          visibleRooms.forEach(function (room) {
            childrenWrap.appendChild(createBranchTreeRoomItem(room));
          });
        }
        stepNode.appendChild(childrenWrap);
        trunk.appendChild(stepNode);
      }());

      els.branchRoomsList.appendChild(trunk);
    }());
  }

  function isReviewArrowAnchorCell(row, col) {
    return !!(uiState.reviewArrowAnchor
      && uiState.reviewArrowAnchor.row === row
      && uiState.reviewArrowAnchor.col === col);
  }

  function setReviewArrowMode(enabled) {
    uiState.reviewArrowMode = !!(enabled && canControlOnlineReview());
    if (!uiState.reviewArrowMode) {
      uiState.reviewArrowAnchor = null;
    }
  }

  function getReviewArrowStatusText() {
    var currentCount = getCurrentReviewArrowList().length;
    if (!isOnlineReviewMode()) {
      return "";
    }
    if (uiState.online.syncing) {
      return "共有矢印を同期しています。";
    }
    if (!uiState.reviewArrowMode) {
      return currentCount > 0
        ? "この局面に " + currentCount + " 本の共有矢印があります。"
        : "矢印モードで盤面に共有メモを描けます。";
    }
    if (uiState.reviewArrowAnchor) {
      return "終点にしたいマスを選ぶと共有矢印を追加します。";
    }
    return "始点にしたいマスを選んでください。";
  }

  function saveOnlineReviewArrows(arrows) {
    var nextArrows;
    var key;
    var previousArrows;
    if (!canControlOnlineReview() || uiState.online.syncing) {
      return Promise.resolve(false);
    }
    nextArrows = normalizeReviewArrowList(arrows);
    key = String(Math.max(0, uiState.replayIndex));
    previousArrows = uiState.online.reviewArrows && uiState.online.reviewArrows[key]
      ? normalizeReviewArrowList(uiState.online.reviewArrows[key])
      : null;
    if (!uiState.online.reviewArrows) {
      uiState.online.reviewArrows = {};
    }
    if (nextArrows.length) {
      uiState.online.reviewArrows[key] = nextArrows;
    } else {
      delete uiState.online.reviewArrows[key];
    }
    uiState.online.syncing = true;
    render();
    return apiRequest(buildApiUrl("room.review.arrows", uiState.online.roomId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerId: uiState.online.playerId,
        index: Math.max(0, uiState.replayIndex),
        arrows: nextArrows
      })
    }).then(function (data) {
      syncOnlineRoomState(data.room);
      clearSelection();
      render();
      return true;
    }).catch(function (error) {
      if (previousArrows && previousArrows.length) {
        uiState.online.reviewArrows[key] = previousArrows;
      } else if (uiState.online.reviewArrows) {
        delete uiState.online.reviewArrows[key];
      }
      if (els.testOutput) {
        els.testOutput.textContent = "REVIEW ARROW ERROR\n" + error.message;
      }
      return false;
    }).finally(function () {
      uiState.online.syncing = false;
      render();
    });
  }

  function handleReviewArrowCellAction(row, col) {
    var anchor = uiState.reviewArrowAnchor;
    var arrows;
    var existingIndex;
    if (!canControlOnlineReview() || !uiState.reviewArrowMode || uiState.online.syncing) {
      return;
    }
    if (!anchor) {
      uiState.reviewArrowAnchor = { row: row, col: col };
      render();
      return;
    }
    if (anchor.row === row && anchor.col === col) {
      uiState.reviewArrowAnchor = null;
      render();
      return;
    }
    arrows = getCurrentReviewArrowList().slice();
    existingIndex = arrows.findIndex(function (arrow) {
      return arrow.from.row === anchor.row
        && arrow.from.col === anchor.col
        && arrow.to.row === row
        && arrow.to.col === col;
    });
    if (existingIndex >= 0) {
      arrows.splice(existingIndex, 1);
    } else {
      arrows.push({
        from: { row: anchor.row, col: anchor.col },
        to: { row: row, col: col }
      });
    }
    uiState.reviewArrowAnchor = null;
    saveOnlineReviewArrows(arrows).then(function (updated) {
      if (!updated) {
        render();
      }
    });
  }

  function renderReviewNotePanel() {
    var shouldShow = isOnlineReviewMode();
    var canControl = canControlOnlineReview();
    if (!els.reviewNoteField || !els.reviewNoteSaveBtn || !els.reviewArrowModeBtn || !els.reviewArrowClearBtn || !els.reviewArrowStatus) {
      return;
    }
    if (els.reviewNoteField.parentElement) {
      els.reviewNoteField.parentElement.hidden = !shouldShow;
    }
    if (!shouldShow) {
      setReviewArrowMode(false);
      uiState.reviewNoteTags = [];
      return;
    }
    if (!canControl) {
      setReviewArrowMode(false);
    }
    if (document.activeElement !== els.reviewNoteField) {
      els.reviewNoteField.value = getCurrentReviewNoteText();
    }
    if (!els.reviewNoteField.matches(":focus")) {
      uiState.reviewNoteTags = getCurrentReviewNoteTags();
    }
    els.reviewNoteField.disabled = false;
    els.reviewNoteField.readOnly = !canControl || uiState.online.syncing;
    els.reviewNoteSaveBtn.disabled = !canControl || uiState.online.syncing;
    els.reviewArrowModeBtn.disabled = !canControl || uiState.online.syncing;
    els.reviewArrowModeBtn.classList.toggle("active-tool", uiState.reviewArrowMode);
    els.reviewArrowClearBtn.disabled = !canControl || uiState.online.syncing || getCurrentReviewArrowList().length === 0;
    els.reviewArrowStatus.textContent = canControl ? getReviewArrowStatusText() : "観戦中はコメントと矢印を編集できません。";
    if (els.reviewNoteTags) {
      els.reviewNoteTags.innerHTML = "";
      Object.keys(REVIEW_NOTE_TAG_LABELS).forEach(function (tag) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "review-tag-chip" + ((uiState.reviewNoteTags || []).indexOf(tag) >= 0 ? " active" : "");
        button.textContent = REVIEW_NOTE_TAG_LABELS[tag];
        button.disabled = !canControl || uiState.online.syncing;
        button.addEventListener("click", function () {
          toggleReviewNoteTag(tag);
        });
        els.reviewNoteTags.appendChild(button);
      });
    }
  }

  function renderHistoryBoard(snapshot) {
    var displayRow;
    var displayCol;
    var viewerSide;
    var point;
    if (!els.historyBoard) {
      return;
    }
    els.historyBoard.innerHTML = "";
    els.historyBoard.classList.add("with-coordinates", "player-oriented");
    els.historyBoard.classList.toggle("viewer-p2", getBoardViewerSide() === "P2");
    els.historyBoard.classList.toggle("viewer-p1", getBoardViewerSide() !== "P2");
    els.historyBoard.style.gridTemplateColumns = "repeat(" + BOARD_ROWS + ", minmax(0, 1fr)) 1.5rem";
    viewerSide = getBoardViewerSide();
    for (displayCol = 0; displayCol < BOARD_ROWS; displayCol += 1) {
      point = mapHistoryBoardPoint(0, displayCol, viewerSide);
      appendHistoryCoordLabel(BOARD_ROW_LABELS[point.row] || String(point.row + 1), "col");
    }
    appendHistoryCoordLabel("", "corner");
    for (displayRow = 0; displayRow < BOARD_COLS; displayRow += 1) {
      for (displayCol = 0; displayCol < BOARD_ROWS; displayCol += 1) {
        point = mapHistoryBoardPoint(displayRow, displayCol, viewerSide);
        var cell = snapshot && snapshot.board && snapshot.board[point.row] ? snapshot.board[point.row][point.col] : null;
        var piece = cell && cell.pieceId ? getPiece(snapshot, cell.pieceId) : null;
        var cellEl = document.createElement("div");
        cellEl.className = "history-cell " + (cell && cell.controller ? cell.controller.toLowerCase() : "neutral");
        if (cell && cell.isBaseCenter) {
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
      point = mapHistoryBoardPoint(displayRow, 0, viewerSide);
      appendHistoryCoordLabel(String(point.col + 1), "row");
    }
  }

  function mapHistoryBoardPoint(displayRow, displayCol, viewerSide) {
    if (viewerSide === "P2") {
      return {
        row: BOARD_ROWS - 1 - displayCol,
        col: displayRow
      };
    }
    return {
      row: displayCol,
      col: BOARD_COLS - 1 - displayRow
    };
  }

  function appendHistoryCoordLabel(text, kind) {
    var label = document.createElement("div");
    label.className = "history-coordinate history-coordinate-" + kind;
    label.textContent = text;
    els.historyBoard.appendChild(label);
  }

  function getDebugLocationParams() {
    var raw = "";
    var hash = "";
    try {
      raw = window.location.search || "";
      hash = window.location.hash || "";
    } catch (error) {
      return new URLSearchParams("");
    }
    if (raw.charAt(0) === "?") {
      raw = raw.slice(1);
    }
    if (hash.charAt(0) === "#") {
      hash = hash.slice(1);
    }
    if (hash.charAt(0) === "?") {
      hash = hash.slice(1);
    }
    return new URLSearchParams([raw, hash].filter(Boolean).join("&"));
  }

  function isDiagnosticsUiEnabled() {
    var params;
    try {
      params = getDebugLocationParams();
      return params.get("debug") === "1" || window.localStorage.getItem("unfoldShowDiagnostics") === "1";
    } catch (error) {
      return false;
    }
  }

  function syncDiagnosticsVisibility() {
    var showDiagnostics = isDiagnosticsUiEnabled();
    var diagnosticsCard = els.testOutput ? els.testOutput.closest(".card") : null;
    if (els.runTestsBtn) {
      els.runTestsBtn.hidden = !showDiagnostics;
    }
    if (diagnosticsCard) {
      diagnosticsCard.hidden = !showDiagnostics;
    }
  }

  function stripClonedIds(node) {
    if (!node || !node.querySelectorAll) {
      return;
    }
    if (node.removeAttribute) {
      node.removeAttribute("id");
    }
    Array.prototype.forEach.call(node.querySelectorAll("[id]"), function (child) {
      child.removeAttribute("id");
    });
  }

  function ensureReferencePopup() {
    var popup = document.getElementById("referencePopup");
    var closeBtn;
    if (popup) {
      return popup;
    }
    popup = document.createElement("section");
    popup.id = "referencePopup";
    popup.className = "reference-popup";
    popup.hidden = true;
    popup.innerHTML = ""
      + "<div class=\"reference-popup-backdrop\" data-reference-close=\"1\"></div>"
      + "<div class=\"reference-popup-panel card\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"referencePopupTitle\">"
      + "<div class=\"reference-popup-head\">"
      + "<h2 id=\"referencePopupTitle\">参照</h2>"
      + "<button id=\"referencePopupCloseBtn\" type=\"button\">閉じる</button>"
      + "</div>"
      + "<div id=\"referencePopupBody\" class=\"reference-popup-body\"></div>"
      + "</div>";
    document.body.appendChild(popup);
    closeBtn = document.getElementById("referencePopupCloseBtn");
    if (closeBtn) {
      closeBtn.addEventListener("click", closeReferencePopup);
    }
    popup.addEventListener("click", function (event) {
      if (event.target && event.target.getAttribute("data-reference-close") === "1") {
        closeReferencePopup();
      }
    });
    return popup;
  }

  function closeReferencePopup() {
    var popup = document.getElementById("referencePopup");
    if (popup) {
      popup.hidden = true;
    }
  }

  function openReferencePopup(type) {
    var popup = ensureReferencePopup();
    var title = document.getElementById("referencePopupTitle");
    var body = document.getElementById("referencePopupBody");
    var movementSource = els.movementSummary ? els.movementSummary.closest(".card") : null;
    var fragmentSource = els.fragmentCatalog ? els.fragmentCatalog.closest(".card") : null;
    var source = type === "movement" ? movementSource : fragmentSource;
    var clone;
    var movementColumn;
    var fragmentColumn;
    var movementClone;
    var fragmentClone;
    if (!body || !source) {
      return;
    }
    if (title) {
      title.textContent = type === "summary" ? "\u99D2\u30FB\u5C55\u958B\u56F3\u30B5\u30DE\u30EA\u30FC" : (type === "movement" ? "\u99D2\u306E\u79FB\u52D5\u30B5\u30DE\u30EA\u30FC" : "\u5C55\u958B\u56F3\u30AB\u30BF\u30ED\u30B0");
    }
    body.innerHTML = "";
    body.classList.toggle("reference-popup-body-split", type === "summary");
    if (type === "summary") {
      if (!movementSource || !fragmentSource) {
        return;
      }
      movementColumn = document.createElement("section");
      movementColumn.className = "reference-popup-column";
      fragmentColumn = document.createElement("section");
      fragmentColumn.className = "reference-popup-column";
      movementClone = movementSource.cloneNode(true);
      fragmentClone = fragmentSource.cloneNode(true);
      stripClonedIds(movementClone);
      stripClonedIds(fragmentClone);
      [movementClone, fragmentClone].forEach(function (item) {
        item.hidden = false;
        item.classList.remove("reference-source-card");
        if (item.tagName === "DETAILS") {
          item.open = true;
        }
      });
      movementColumn.appendChild(movementClone);
      fragmentColumn.appendChild(fragmentClone);
      body.appendChild(movementColumn);
      body.appendChild(fragmentColumn);
      popup.hidden = false;
      return;
    }
    clone = source.cloneNode(true);
    stripClonedIds(clone);
    clone.hidden = false;
    clone.classList.remove("reference-source-card");
    if (clone.tagName === "DETAILS") {
      clone.open = true;
    }
    body.appendChild(clone);
    popup.hidden = false;
  }

  function ensureHeaderReferenceButtons() {
    var matchActions = els.gameView ? els.gameView.querySelector(".match-actions") : null;
    var menu = matchActions ? matchActions.querySelector(".match-menu") : null;
    var oldMovementBtn = document.getElementById("movementReferenceBtn");
    var oldFragmentBtn = document.getElementById("fragmentReferenceBtn");
    var summaryBtn;
    if (!matchActions || document.getElementById("summaryReferenceBtn")) {
      return;
    }
    if (oldMovementBtn) {
      oldMovementBtn.remove();
    }
    if (oldFragmentBtn) {
      oldFragmentBtn.remove();
    }
    summaryBtn = document.createElement("button");
    summaryBtn.id = "summaryReferenceBtn";
    summaryBtn.type = "button";
    summaryBtn.textContent = "\u99D2\u30FB\u5C55\u958B\u56F3\u30B5\u30DE\u30EA\u30FC";
    summaryBtn.addEventListener("click", function () {
      openReferencePopup("summary");
    });
    matchActions.insertBefore(summaryBtn, menu || null);
    if (els) {
      els.movementReferenceBtn = null;
      els.fragmentReferenceBtn = null;
      els.summaryReferenceBtn = summaryBtn;
    }
  }

  function setupSimpleGameLayout() {
    var center = els.gameView ? els.gameView.querySelector(".center") : null;
    var boardCard = els.gameView ? els.gameView.querySelector(".board-card") : null;
    var menu = els.gameView ? els.gameView.querySelector(".match-menu") : null;
    var movementCard = els.movementSummary ? els.movementSummary.closest(".card") : null;
    var fragmentCard = els.fragmentCatalog ? els.fragmentCatalog.closest(".card") : null;
    var testCard = els.testOutput ? els.testOutput.closest(".card") : null;
    var historyHead;
    var toolbar;
    var exportBtn;
    var importBtn;
    var reviewBtn;
    var studyBtn;
    var editorBtn;
    var fileInput;
    var noteWrap;
    var noteField;
    var noteTags;
    var noteSaveBtn;
    var noteLabel;
    var analysisWrap;
    var analysisTitleField;
    var analysisCommentField;
    var analysisMetaSaveBtn;
    var analysisMetaStatus;
    var analysisLabel;
    var analysisFieldLabel;
    var reviewTools;
    var reviewArrowModeBtn;
    var reviewArrowClearBtn;
    var reviewArrowStatus;
    var trailWrap;
    var trailList;
    var compareWrap;
    var compareSourceBar;
    var compareSummary;
    var compareList;
    var branchWrap;
    var branchOrigin;
    var branchStatus;
    var branchList;
    var branchRefreshBtn;
    var branchToggleBtn;
    var branchHeader;
    var branchActions;
    var editorModal;
    var editorBody;
    var editorControls;
    var editorActions;
    var editorGrid;
    var editorSelect;
    var editorOwnerField;
    var editorPieceField;
    var editorPaintField;
    var editorCurrentPlayerField;
    var clockPanel;

    if (els.sceneViewport && els.turnCard) {
      els.turnCard.classList.add("board-turn-badge");
      if (els.turnCard.parentElement !== els.sceneViewport) {
        els.sceneViewport.insertBefore(els.turnCard, els.sceneViewport.firstChild);
      }
      if (!document.getElementById("clockPanel")) {
        clockPanel = document.createElement("div");
        clockPanel.id = "clockPanel";
        clockPanel.className = "clock-panel";
        clockPanel.hidden = true;
        clockPanel.innerHTML = ""
          + "<span id=\"clockP1Label\" class=\"clock-chip\">\u5148\u624b --:--</span>"
          + "<span id=\"clockP2Label\" class=\"clock-chip\">\u5F8C\u624b --:--</span>";
        els.turnCard.appendChild(clockPanel);
      }
      els.clockPanel = document.getElementById("clockPanel");
      els.clockP1Label = document.getElementById("clockP1Label");
      els.clockP2Label = document.getElementById("clockP2Label");
    }
    syncDiagnosticsVisibility();
    ensureHeaderReferenceButtons();
    if (menu) {
      menu.open = true;
    }
    if (movementCard) {
      movementCard.classList.add("reference-source-card");
      movementCard.hidden = true;
    }
    if (fragmentCard) {
      fragmentCard.classList.add("reference-source-card");
      fragmentCard.hidden = true;
    }

    if (!center || !els.historyCard || !movementCard || !fragmentCard || !testCard) {
      return;
    }
    if (document.getElementById("replayExportBtn")) {
      return;
    }

    toolbar = document.createElement("div");
    toolbar.className = "extras-toolbar history-tools";
    exportBtn = document.createElement("button");
    exportBtn.id = "replayExportBtn";
    exportBtn.type = "button";
    exportBtn.textContent = "棋譜を書き出す";
    toolbar.appendChild(exportBtn);

    importBtn = document.createElement("button");
    importBtn.id = "replayImportBtn";
    importBtn.type = "button";
    importBtn.textContent = "棋譜を読み込む";
    toolbar.appendChild(importBtn);

    reviewBtn = document.createElement("button");
    reviewBtn.id = "replayReviewBtn";
    reviewBtn.type = "button";
    reviewBtn.textContent = "この局面から検討";
    toolbar.appendChild(reviewBtn);

    studyBtn = document.createElement("button");
    studyBtn.id = "replayStudyBtn";
    studyBtn.type = "button";
    studyBtn.textContent = "この棋譜で検討室";
    toolbar.appendChild(studyBtn);

    editorBtn = document.createElement("button");
    editorBtn.id = "editorLaunchBtn";
    editorBtn.type = "button";
    editorBtn.textContent = "局面エディタ";
    toolbar.appendChild(editorBtn);
    historyHead = els.historyCard.querySelector(".history-head");
    if (historyHead) {
      historyHead.insertAdjacentElement("afterend", toolbar);
    } else {
      els.historyCard.prepend(toolbar);
    }
    fileInput = document.getElementById("replayFileInput");
    if (!fileInput) {
      fileInput = document.createElement("input");
      fileInput.id = "replayFileInput";
      fileInput.type = "file";
      fileInput.accept = "application/json,.json";
      fileInput.hidden = true;
      document.body.appendChild(fileInput);
    }
    analysisWrap = document.getElementById("analysisMetaWrap");
    if (!analysisWrap) {
      analysisWrap = document.createElement("div");
      analysisWrap.id = "analysisMetaWrap";
      analysisWrap.className = "review-note-wrap analysis-meta-wrap";
      analysisLabel = document.createElement("p");
      analysisLabel.className = "label";
      analysisLabel.textContent = "検討情報";
      analysisFieldLabel = document.createElement("p");
      analysisFieldLabel.className = "subtle analysis-field-label";
      analysisFieldLabel.textContent = "検討名";
      analysisTitleField = document.createElement("input");
      analysisTitleField.id = "analysisTitleField";
      analysisTitleField.className = "review-note-field analysis-title-field";
      analysisTitleField.type = "text";
      analysisTitleField.maxLength = 80;
      analysisTitleField.placeholder = "例: 中央突破案";
      analysisMetaStatus = document.createElement("p");
      analysisMetaStatus.id = "analysisMetaStatus";
      analysisMetaStatus.className = "review-arrow-status";
      analysisCommentField = document.createElement("textarea");
      analysisCommentField.id = "analysisCommentField";
      analysisCommentField.className = "review-note-field";
      analysisCommentField.rows = 3;
      analysisCommentField.placeholder = "この分岐で見たいことや結論を書けます。";
      analysisMetaSaveBtn = document.createElement("button");
      analysisMetaSaveBtn.id = "analysisMetaSaveBtn";
      analysisMetaSaveBtn.type = "button";
      analysisMetaSaveBtn.textContent = "検討情報を保存";
      analysisWrap.appendChild(analysisLabel);
      analysisWrap.appendChild(analysisFieldLabel);
      analysisWrap.appendChild(analysisTitleField);
      analysisWrap.appendChild(analysisMetaStatus);
      analysisWrap.appendChild(analysisCommentField);
      analysisWrap.appendChild(analysisMetaSaveBtn);
      els.historyCard.appendChild(analysisWrap);
    } else {
      analysisTitleField = document.getElementById("analysisTitleField");
      analysisCommentField = document.getElementById("analysisCommentField");
      analysisMetaSaveBtn = document.getElementById("analysisMetaSaveBtn");
      analysisMetaStatus = document.getElementById("analysisMetaStatus");
    }
    trailWrap = document.getElementById("variationTrailWrap");
    if (!trailWrap) {
      trailWrap = document.createElement("div");
      trailWrap.id = "variationTrailWrap";
      trailWrap.className = "branch-rooms-wrap variation-trail-wrap";
      analysisLabel = document.createElement("p");
      analysisLabel.className = "label";
      analysisLabel.textContent = "分岐ルート";
      trailList = document.createElement("div");
      trailList.id = "variationTrailList";
      trailList.className = "variation-trail-list";
      trailWrap.appendChild(analysisLabel);
      trailWrap.appendChild(trailList);
      els.historyCard.appendChild(trailWrap);
    } else {
      trailList = document.getElementById("variationTrailList");
    }
    compareWrap = document.getElementById("compareWrap");
    if (!compareWrap) {
      compareWrap = document.createElement("div");
      compareWrap.id = "compareWrap";
      compareWrap.className = "branch-rooms-wrap compare-wrap";
      analysisLabel = document.createElement("p");
      analysisLabel.className = "label";
      analysisLabel.textContent = "本線比較";
      compareSourceBar = document.createElement("div");
      compareSourceBar.id = "compareSourceBar";
      compareSourceBar.className = "compare-source-bar";
      compareSummary = document.createElement("p");
      compareSummary.id = "compareSummary";
      compareSummary.className = "branch-room-status";
      compareList = document.createElement("div");
      compareList.id = "compareList";
      compareList.className = "compare-list";
      compareWrap.appendChild(analysisLabel);
      compareWrap.appendChild(compareSourceBar);
      compareWrap.appendChild(compareSummary);
      compareWrap.appendChild(compareList);
      els.historyCard.appendChild(compareWrap);
    } else {
      compareSourceBar = document.getElementById("compareSourceBar");
      compareSummary = document.getElementById("compareSummary");
      compareList = document.getElementById("compareList");
    }
    noteWrap = document.getElementById("reviewNoteWrap");
    if (!noteWrap) {
      noteWrap = document.createElement("div");
      noteWrap.id = "reviewNoteWrap";
      noteWrap.className = "review-note-wrap";
      noteLabel = document.createElement("p");
      noteLabel.className = "label";
      noteLabel.textContent = "共有メモ";
      reviewTools = document.createElement("div");
      reviewTools.className = "review-arrow-tools";
      reviewArrowModeBtn = document.createElement("button");
      reviewArrowModeBtn.id = "reviewArrowModeBtn";
      reviewArrowModeBtn.type = "button";
      reviewArrowModeBtn.textContent = "矢印モード";
      reviewArrowClearBtn = document.createElement("button");
      reviewArrowClearBtn.id = "reviewArrowClearBtn";
      reviewArrowClearBtn.type = "button";
      reviewArrowClearBtn.textContent = "矢印クリア";
      reviewArrowStatus = document.createElement("p");
      reviewArrowStatus.id = "reviewArrowStatus";
      reviewArrowStatus.className = "review-arrow-status";
      reviewTools.appendChild(reviewArrowModeBtn);
      reviewTools.appendChild(reviewArrowClearBtn);
      noteTags = document.createElement("div");
      noteTags.id = "reviewNoteTags";
      noteTags.className = "review-note-tags";
      noteField = document.createElement("textarea");
      noteField.id = "reviewNoteField";
      noteField.className = "review-note-field";
      noteField.rows = 4;
      noteField.placeholder = "この局面の共有メモを書けます。";
      noteSaveBtn = document.createElement("button");
      noteSaveBtn.id = "reviewNoteSaveBtn";
      noteSaveBtn.type = "button";
      noteSaveBtn.textContent = "コメント保存";
      noteWrap.appendChild(noteLabel);
      noteWrap.appendChild(reviewTools);
      noteWrap.appendChild(reviewArrowStatus);
      noteWrap.appendChild(noteTags);
      noteWrap.appendChild(noteField);
      noteWrap.appendChild(noteSaveBtn);
      els.historyCard.appendChild(noteWrap);
    } else {
      noteTags = document.getElementById("reviewNoteTags");
      noteField = document.getElementById("reviewNoteField");
      noteSaveBtn = document.getElementById("reviewNoteSaveBtn");
      reviewArrowModeBtn = document.getElementById("reviewArrowModeBtn");
      reviewArrowClearBtn = document.getElementById("reviewArrowClearBtn");
      reviewArrowStatus = document.getElementById("reviewArrowStatus");
    }
    branchWrap = document.getElementById("branchRoomsWrap");
    if (!branchWrap) {
      branchWrap = document.createElement("div");
      branchWrap.id = "branchRoomsWrap";
      branchWrap.className = "branch-rooms-wrap";
      branchHeader = document.createElement("div");
      branchHeader.className = "branch-rooms-head";
      noteLabel = document.createElement("p");
      noteLabel.className = "label";
      noteLabel.textContent = "分岐検討室";
      branchActions = document.createElement("div");
      branchActions.className = "branch-rooms-actions";
      branchRefreshBtn = document.createElement("button");
      branchRefreshBtn.id = "branchRoomsRefreshBtn";
      branchRefreshBtn.type = "button";
      branchRefreshBtn.textContent = "一覧更新";
      branchToggleBtn = document.createElement("button");
      branchToggleBtn.id = "branchRoomsToggleBtn";
      branchToggleBtn.type = "button";
      branchToggleBtn.textContent = "もっと見る";
      branchActions.appendChild(branchToggleBtn);
      branchActions.appendChild(branchRefreshBtn);
      branchHeader.appendChild(noteLabel);
      branchHeader.appendChild(branchActions);
      branchOrigin = document.createElement("p");
      branchOrigin.id = "branchRoomsOrigin";
      branchOrigin.className = "branch-room-origin";
      branchStatus = document.createElement("p");
      branchStatus.id = "branchRoomsStatus";
      branchStatus.className = "branch-room-status";
      branchList = document.createElement("div");
      branchList.id = "branchRoomsList";
      branchList.className = "branch-room-list";
      branchWrap.appendChild(branchHeader);
      branchWrap.appendChild(branchOrigin);
      branchWrap.appendChild(branchStatus);
      branchWrap.appendChild(branchList);
      els.historyCard.appendChild(branchWrap);
    } else {
      branchOrigin = document.getElementById("branchRoomsOrigin");
      branchStatus = document.getElementById("branchRoomsStatus");
      branchList = document.getElementById("branchRoomsList");
      branchRefreshBtn = document.getElementById("branchRoomsRefreshBtn");
      branchToggleBtn = document.getElementById("branchRoomsToggleBtn");
    }
    if (branchWrap) {
      var branchLabel = branchWrap.querySelector(".label");
      if (branchLabel) {
        branchLabel.textContent = "BRANCH TREE";
      }
    }
    els.replayExportBtn = exportBtn;
    els.replayImportBtn = importBtn;
    els.replayReviewBtn = reviewBtn;
    els.replayStudyBtn = studyBtn;
    els.replayFileInput = fileInput;
    els.analysisMetaWrap = analysisWrap;
    els.analysisTitleField = analysisTitleField;
    els.analysisCommentField = analysisCommentField;
    els.analysisMetaSaveBtn = analysisMetaSaveBtn;
    els.analysisMetaStatus = analysisMetaStatus;
    els.variationTrailWrap = trailWrap;
    els.variationTrailList = trailList;
    els.compareWrap = compareWrap;
    els.compareSourceBar = compareSourceBar;
    els.compareSummary = compareSummary;
    els.compareList = compareList;
    els.reviewNoteField = noteField;
    els.reviewNoteTags = noteTags;
    els.reviewNoteSaveBtn = noteSaveBtn;
    els.reviewArrowModeBtn = reviewArrowModeBtn;
    els.reviewArrowClearBtn = reviewArrowClearBtn;
    els.reviewArrowStatus = reviewArrowStatus;
    els.branchRoomsWrap = branchWrap;
    els.branchRoomsOrigin = branchOrigin;
    els.branchRoomsStatus = branchStatus;
    els.branchRoomsList = branchList;
    els.branchRoomsRefreshBtn = branchRefreshBtn;
    els.branchRoomsToggleBtn = branchToggleBtn;
    els.editorLaunchBtn = editorBtn;

    editorModal = document.getElementById("editorModal");
    if (!editorModal) {
      editorModal = document.createElement("section");
      editorModal.id = "editorModal";
      editorModal.className = "editor-modal card";
      editorModal.hidden = true;

      editorBody = document.createElement("div");
      editorBody.className = "editor-modal-body";

      branchHeader = document.createElement("div");
      branchHeader.className = "lobby-hub-head";
      noteLabel = document.createElement("p");
      noteLabel.className = "label";
      noteLabel.textContent = "POSITION EDITOR";
      summaryTitle = document.createElement("h2");
      summaryTitle.className = "lobby-hub-title";
      summaryTitle.textContent = "局面エディタ";
      branchActions = document.createElement("div");
      branchActions.className = "match-actions";
      var editorCloseBtn = document.createElement("button");
      editorCloseBtn.id = "editorCloseBtn";
      editorCloseBtn.type = "button";
      editorCloseBtn.className = "ghost-button";
      editorCloseBtn.textContent = "閉じる";
      branchActions.appendChild(editorCloseBtn);
      var editorMeta = document.createElement("div");
      editorMeta.appendChild(noteLabel);
      editorMeta.appendChild(summaryTitle);
      branchHeader.appendChild(editorMeta);
      branchHeader.appendChild(branchActions);

      editorControls = document.createElement("div");
      editorControls.className = "editor-controls";

      editorOwnerField = document.createElement("label");
      editorOwnerField.className = "field";
      editorOwnerField.innerHTML = "<span>対象陣営</span>";
      editorSelect = document.createElement("select");
      editorSelect.id = "editorOwnerSelect";
      editorOwnerField.appendChild(editorSelect);

      editorPieceField = document.createElement("label");
      editorPieceField.className = "field";
      editorPieceField.innerHTML = "<span>駒</span>";
      editorSelect = document.createElement("select");
      editorSelect.id = "editorPieceSelect";
      editorPieceField.appendChild(editorSelect);

      editorPaintField = document.createElement("label");
      editorPaintField.className = "field";
      editorPaintField.innerHTML = "<span>編集内容</span>";
      editorSelect = document.createElement("select");
      editorSelect.id = "editorPaintSelect";
      editorPaintField.appendChild(editorSelect);

      editorCurrentPlayerField = document.createElement("label");
      editorCurrentPlayerField.className = "field";
      editorCurrentPlayerField.innerHTML = "<span>手番</span>";
      editorSelect = document.createElement("select");
      editorSelect.id = "editorCurrentPlayerSelect";
      editorCurrentPlayerField.appendChild(editorSelect);

      editorControls.appendChild(editorOwnerField);
      editorControls.appendChild(editorPieceField);
      editorControls.appendChild(editorPaintField);
      editorControls.appendChild(editorCurrentPlayerField);

      editorActions = document.createElement("div");
      editorActions.className = "editor-actions";
      var editorUseCurrentBtn = document.createElement("button");
      editorUseCurrentBtn.id = "editorUseCurrentBtn";
      editorUseCurrentBtn.type = "button";
      editorUseCurrentBtn.className = "ghost-button";
      editorUseCurrentBtn.textContent = "現在局面を反映";
      var editorUseBlankBtn = document.createElement("button");
      editorUseBlankBtn.id = "editorUseBlankBtn";
      editorUseBlankBtn.type = "button";
      editorUseBlankBtn.className = "ghost-button";
      editorUseBlankBtn.textContent = "本陣だけに戻す";
      var editorStartPracticeBtn = document.createElement("button");
      editorStartPracticeBtn.id = "editorStartPracticeBtn";
      editorStartPracticeBtn.type = "button";
      editorStartPracticeBtn.className = "primary";
      editorStartPracticeBtn.textContent = "この局面で一人プレイ";
      var editorCreateStudyBtn = document.createElement("button");
      editorCreateStudyBtn.id = "editorCreateStudyBtn";
      editorCreateStudyBtn.type = "button";
      editorCreateStudyBtn.textContent = "この局面で分岐検討室";
      editorActions.appendChild(editorUseCurrentBtn);
      editorActions.appendChild(editorUseBlankBtn);
      editorActions.appendChild(editorStartPracticeBtn);
      editorActions.appendChild(editorCreateStudyBtn);

      editorGrid = document.createElement("div");
      editorGrid.id = "editorGrid";
      editorGrid.className = "board editor-grid";

      editorBody.appendChild(branchHeader);
      editorBody.appendChild(editorControls);
      editorBody.appendChild(editorActions);
      editorBody.appendChild(editorGrid);
      editorModal.appendChild(editorBody);
      document.body.appendChild(editorModal);
    }

    els.editorModal = editorModal;
    els.editorGrid = document.getElementById("editorGrid");
    els.editorOwnerSelect = document.getElementById("editorOwnerSelect");
    els.editorPieceSelect = document.getElementById("editorPieceSelect");
    els.editorPaintSelect = document.getElementById("editorPaintSelect");
    els.editorCurrentPlayerSelect = document.getElementById("editorCurrentPlayerSelect");
    els.editorUseCurrentBtn = document.getElementById("editorUseCurrentBtn");
    els.editorUseBlankBtn = document.getElementById("editorUseBlankBtn");
    els.editorCloseBtn = document.getElementById("editorCloseBtn");
    els.editorStartPracticeBtn = document.getElementById("editorStartPracticeBtn");
    els.editorCreateStudyBtn = document.getElementById("editorCreateStudyBtn");
  }

  function setupSimpleLobbyLayout() {
    var heroCard = document.querySelector("#lobbyView .hero.card");
    var heroLead = heroCard ? heroCard.querySelector(".lead") : null;
    var heroActions = heroCard ? heroCard.querySelector(".hero-actions") : null;
    var heroTitleRow = heroCard ? heroCard.querySelector(".hero-title-row") : null;
    var accessMini = heroCard ? heroCard.querySelector(".access-mini") : null;
    var heroMetaFoot;
    var onlineCard = document.querySelector(".online-card");
    var onlineHeader = onlineCard ? onlineCard.querySelector(".online-header") : null;
    var onlineHeaderLabel = onlineHeader ? onlineHeader.querySelector(".label") : null;
    var commonPlayerPanel = onlineCard ? onlineCard.querySelector(".common-player-panel") : null;
    var soloPlayGrid = commonPlayerPanel ? commonPlayerPanel.querySelector(".solo-play-grid") : null;
    var lobbyGrid = onlineCard ? onlineCard.querySelector(".lobby-grid") : null;
    var lobbyPanels = lobbyGrid ? lobbyGrid.querySelectorAll(".lobby-panel") : [];
    var createPanel = lobbyPanels.length ? lobbyPanels[0] : null;
    var joinPanel = lobbyPanels.length > 1 ? lobbyPanels[1] : null;
    var lobbyActions = onlineCard ? onlineCard.querySelector(".lobby-actions") : null;
    var roomListCard = onlineCard ? onlineCard.querySelector(".room-list-card") : null;
    var footerNote = onlineCard ? onlineCard.querySelector(":scope > .scene-note:last-of-type") : null;
    var details;
    var summary;
    var label;
    var title;
    var mainOnlineBtn;
    var mainSoloBtn;
    var mainRulesBtn;
    var mainFeedbackBtn;
    var hubCard;
    var hubHead;
    var hubMeta;
    var hubBackBtn;
    var hubBody;
    var joinFields;
    var joinPasswordField;
    var joinPasswordLabel;
    var joinPasswordInput;
    var createFields;
    var joinSourceFields;
    var homeOverview;
    var homeOverviewLead;
    var homeOverviewList;
    if (!heroCard || !heroActions || !onlineCard || !onlineHeader || !commonPlayerPanel || !lobbyGrid || !lobbyActions || !roomListCard || !createPanel || !joinPanel) {
      return;
    }
    onlineCard.classList.add("simple-lobby");
    onlineCard.hidden = true;
    if (els.onlineSideLabel && els.onlineSideLabel.parentElement) {
      els.onlineSideLabel.parentElement.hidden = true;
    }
    if (heroLead) {
      heroLead.hidden = true;
    }
    if (!document.getElementById("lobbyMainOnlineBtn")) {
      heroActions.innerHTML = "";
      heroActions.classList.add("hero-main-actions");

      mainOnlineBtn = document.createElement("button");
      mainOnlineBtn.id = "lobbyMainOnlineBtn";
      mainOnlineBtn.type = "button";
      mainOnlineBtn.className = "hero-menu-button";
      mainOnlineBtn.textContent = "オンライン対戦";
      mainOnlineBtn.addEventListener("click", function () {
        navigateLobbyPage("online");
      });

      mainSoloBtn = document.createElement("button");
      mainSoloBtn.id = "lobbyMainSoloBtn";
      mainSoloBtn.type = "button";
      mainSoloBtn.className = "hero-menu-button";
      mainSoloBtn.textContent = "一人プレイ";
      mainSoloBtn.addEventListener("click", function () {
        navigateLobbyPage("solo");
      });

      mainRulesBtn = document.createElement("button");
      mainRulesBtn.id = "lobbyMainRulesBtn";
      mainRulesBtn.type = "button";
      mainRulesBtn.className = "hero-menu-button";
      mainRulesBtn.textContent = "ルール・定石解説";
      mainRulesBtn.addEventListener("click", function () {
        navigateLobbyPage("rules");
      });

      mainFeedbackBtn = document.createElement("button");
      mainFeedbackBtn.id = "lobbyMainFeedbackBtn";
      mainFeedbackBtn.type = "button";
      mainFeedbackBtn.className = "hero-menu-button";
      mainFeedbackBtn.textContent = "意見掲示板";
      mainFeedbackBtn.addEventListener("click", function () {
        window.location.href = "feedback.html";
      });

      heroActions.appendChild(mainOnlineBtn);
      heroActions.appendChild(mainSoloBtn);
      heroActions.appendChild(mainRulesBtn);
      heroActions.appendChild(mainFeedbackBtn);
    }
    if (!document.getElementById("homeJapaneseTitle")) {
      var homeJapaneseTitle = document.createElement("p");
      homeJapaneseTitle.id = "homeJapaneseTitle";
      homeJapaneseTitle.className = "home-japanese-title";
      homeJapaneseTitle.textContent = "展界棋（てんかいき）";
      if (heroTitleRow) {
        heroTitleRow.insertAdjacentElement("afterend", homeJapaneseTitle);
      }
    }
    if (!document.getElementById("homeGameOverview")) {
      homeOverview = document.createElement("section");
      homeOverview.id = "homeGameOverview";
      homeOverview.className = "home-game-overview";
      homeOverview.setAttribute("aria-label", "UNFOLDのゲーム概要");

      homeOverviewLead = document.createElement("p");
      homeOverviewLead.appendChild(document.createTextNode("UNFOLDは、手札の展開図で陣地を広げ、"));
      homeOverviewLead.appendChild(document.createElement("br"));
      homeOverviewLead.appendChild(document.createTextNode("その上で駒を動かして相手本陣へ迫る将棋系の陣取りゲームです。"));
      homeOverview.appendChild(homeOverviewLead);

      homeOverviewList = document.createElement("ul");
      homeOverviewList.className = "home-game-points";
      [
        "展開図を置いて、駒が動ける道と陣地を作る",
        "対応する駒を配置し、攻め・受け・回収で形を整える",
        "相手本陣中心を上書きするか、展界者を取れば勝利"
      ].forEach(function (text) {
        var item = document.createElement("li");
        item.textContent = text;
        homeOverviewList.appendChild(item);
      });
      homeOverview.appendChild(homeOverviewList);
      heroActions.insertAdjacentElement("afterend", homeOverview);
    }
    if (accessMini) {
      heroMetaFoot = document.getElementById("heroMetaFoot");
      if (!heroMetaFoot) {
        heroMetaFoot = document.createElement("div");
        heroMetaFoot.id = "heroMetaFoot";
        heroMetaFoot.className = "hero-meta-foot";
        heroActions.insertAdjacentElement("afterend", heroMetaFoot);
      }
      heroMetaFoot.appendChild(accessMini);
    }
    if (heroCard && !document.getElementById("homeLogoLink")) {
      var titleNode = heroCard.querySelector("h1");
      var logoLink = document.createElement("a");
      logoLink.id = "homeLogoLink";
      logoLink.className = "home-logo-link";
      logoLink.href = "index.html";
      logoLink.textContent = "UNFOLD";
      logoLink.setAttribute("aria-label", "トップへ戻る");
      if (titleNode) {
        titleNode.replaceWith(logoLink);
      }
    }
    if (!document.getElementById("lobbyHubCard")) {
      hubCard = document.createElement("section");
      hubCard.id = "lobbyHubCard";
      hubCard.className = "card lobby-hub-card";
      hubCard.hidden = true;

      hubHead = document.createElement("div");
      hubHead.className = "lobby-hub-head";

      hubMeta = document.createElement("div");
      label = document.createElement("p");
      label.id = "lobbyHubLabel";
      label.className = "label";
      title = document.createElement("h2");
      title.id = "lobbyHubTitle";
      title.className = "lobby-hub-title";
      hubMeta.appendChild(label);
      hubMeta.appendChild(title);

      hubBackBtn = document.createElement("button");
      hubBackBtn.id = "lobbyHubBackBtn";
      hubBackBtn.type = "button";
      hubBackBtn.className = "ghost-button lobby-back-button";
      hubBackBtn.textContent = "タイトルへ";
      hubBackBtn.title = "最初のタイトル画面へ戻ります。";
      hubBackBtn.addEventListener("click", function () {
        navigateLobbyPage("home");
      });

      hubHead.appendChild(hubMeta);
      hubCard.appendChild(hubHead);

      hubBody = document.createElement("div");
      hubBody.id = "lobbyHubBody";
      hubBody.className = "lobby-hub-body";
      hubCard.appendChild(hubBody);
      hubCard.appendChild(hubBackBtn);

      heroCard.insertAdjacentElement("afterend", hubCard);
    }
    if (!els.lobbyNotice) {
      els.lobbyNotice = document.createElement("p");
      els.lobbyNotice.id = "lobbyNotice";
      els.lobbyNotice.className = "lobby-notice-banner";
      els.lobbyNotice.hidden = true;
      els.lobbyNotice.setAttribute("aria-live", "polite");
    }
    if (document.getElementById("lobbyAdvancedTools")) {
      details = document.getElementById("lobbyAdvancedTools");
    } else {
      details = document.createElement("details");
      details.id = "lobbyAdvancedTools";
      details.className = "lobby-advanced card";
      summary = document.createElement("summary");
      summary.className = "lobby-advanced-summary";
      label = document.createElement("span");
      label.className = "label";
      label.textContent = "ADVANCED";
      title = document.createElement("strong");
      title.className = "lobby-advanced-title";
      title.textContent = "管理・削除";
      summary.appendChild(label);
      summary.appendChild(title);
      details.appendChild(summary);
      lobbyActions.classList.remove("card");
      lobbyActions.classList.add("lobby-advanced-body");
      details.appendChild(lobbyActions);
      roomListCard.insertAdjacentElement("afterend", details);
    }
    details.hidden = true;

    joinFields = joinPanel.querySelector(".panel-fields");
    if (joinFields && !document.getElementById("onlineJoinPasswordInput")) {
      joinPasswordField = document.createElement("label");
      joinPasswordField.className = "field";
      joinPasswordLabel = document.createElement("span");
      joinPasswordLabel.textContent = "合言葉（任意）";
      joinPasswordInput = document.createElement("input");
      joinPasswordInput.id = "onlineJoinPasswordInput";
      joinPasswordInput.type = "password";
      joinPasswordInput.maxLength = 24;
      joinPasswordInput.placeholder = "鍵付き部屋のみ";
      joinPasswordField.appendChild(joinPasswordLabel);
      joinPasswordField.appendChild(joinPasswordInput);
      joinFields.appendChild(joinPasswordField);
    }
    if (createPanel && !document.getElementById("onlineRoomVisibilitySelect")) {
      var createPanelFields = createPanel.querySelector(".panel-fields");
      var visibilityField = document.createElement("label");
      var visibilitySelect = document.createElement("select");
      visibilityField.className = "field";
      visibilityField.innerHTML = "<span>公開範囲</span>";
      visibilitySelect.id = "onlineRoomVisibilitySelect";
      visibilitySelect.innerHTML = ""
        + "<option value=\"public\">公開</option>"
        + "<option value=\"invite\">招待</option>"
        + "<option value=\"private\">非公開</option>";
      visibilityField.appendChild(visibilitySelect);
      if (createPanelFields) {
        createPanelFields.appendChild(visibilityField);
      }
    }
    createFields = createPanel.querySelectorAll(".field");
    joinSourceFields = joinPanel.querySelectorAll(".field");

    els.lobbyMainOnlineBtn = document.getElementById("lobbyMainOnlineBtn");
    els.lobbyMainSoloBtn = document.getElementById("lobbyMainSoloBtn");
    els.lobbyMainRulesBtn = document.getElementById("lobbyMainRulesBtn");
    els.heroActions = heroActions;
    els.lobbyHubCard = document.getElementById("lobbyHubCard");
    els.lobbyHubLabel = document.getElementById("lobbyHubLabel");
    els.lobbyHubTitle = document.getElementById("lobbyHubTitle");
    els.lobbyHubBody = document.getElementById("lobbyHubBody");
    els.lobbyHubBackBtn = document.getElementById("lobbyHubBackBtn");
    els.onlineLobbyCard = onlineCard;
    els.onlineHeader = onlineHeader;
    els.onlineHeaderLabel = onlineHeaderLabel;
    els.onlinePlayerPanel = commonPlayerPanel;
    els.onlineSoloGrid = soloPlayGrid;
    els.onlineLobbyGrid = lobbyGrid;
    els.onlineCreatePanel = createPanel;
    els.onlineJoinPanel = joinPanel;
    els.onlineRoomListCard = roomListCard;
    els.onlineLobbyFootnote = footerNote;
    els.lobbyAdvancedTools = details;
    els.onlineJoinPasswordInput = document.getElementById("onlineJoinPasswordInput");
    els.onlineRoomVisibilitySelect = document.getElementById("onlineRoomVisibilitySelect");
    els.onlineNameField = commonPlayerPanel.querySelector(".field");
    els.onlineCreateRoomNameField = createFields[0] || null;
    els.onlineCreateModeField = createFields[1] || null;
    els.onlineCreatePasswordField = createFields[2] || null;
    els.onlineCreateVisibilityField = createFields[3] || null;
    els.onlineJoinCodeField = joinSourceFields[0] || null;
    els.onlineJoinPasswordField = els.onlineJoinPasswordInput ? els.onlineJoinPasswordInput.closest(".field") : null;
    els.onlineRoomListHead = roomListCard.querySelector(".room-list-head");
    els.onlineDeleteRoomBox = lobbyActions.querySelector(".delete-room-box");
    els.lobbyNotice = els.lobbyNotice || document.getElementById("lobbyNotice");
  }

  function createLobbyStageSummary(labelText, titleText, bodyText, hintText) {
    var section = document.createElement("section");
    var badge = document.createElement("p");
    var title = document.createElement("h3");
    var body = document.createElement("p");
    section.className = "lobby-stage-summary";
    badge.className = "label lobby-stage-badge";
    badge.textContent = labelText;
    title.className = "lobby-stage-heading";
    title.textContent = titleText;
    body.className = "lobby-stage-copy";
    body.textContent = bodyText;
    section.appendChild(badge);
    section.appendChild(title);
    section.appendChild(body);
    if (hintText) {
      var hint = document.createElement("p");
      hint.className = "lobby-stage-hint";
      hint.textContent = hintText;
      section.appendChild(hint);
    }
    return section;
  }

  function appendLobbyNotice(container) {
    if (!container || !els.lobbyNotice) {
      return;
    }
    els.lobbyNotice.hidden = !els.lobbyNotice.textContent;
    container.appendChild(els.lobbyNotice);
  }

  function setLobbySectionWidth(section, widthPx) {
    if (!section) {
      return;
    }
    section.style.width = (widthPx || 620) + "px";
    section.style.maxWidth = "100%";
    section.style.boxSizing = "border-box";
  }

  function ensureTimeControlField() {
    var field = document.getElementById("timeControlField");
    var label;
    var select;
    if (!field) {
      field = document.createElement("label");
      field.id = "timeControlField";
      field.className = "field time-control-field";
      label = document.createElement("span");
      label.textContent = "\u6301\u3061\u6642\u9593";
      select = document.createElement("select");
      select.id = "timeControlSelect";
      TIME_CONTROL_OPTIONS.forEach(function (option) {
        var item = document.createElement("option");
        item.value = option.value;
        item.textContent = option.label;
        select.appendChild(item);
      });
      field.appendChild(label);
      field.appendChild(select);
    }
    els.timeControlField = field;
    els.timeControlSelect = document.getElementById("timeControlSelect");
    if (els.timeControlSelect) {
      els.timeControlSelect.value = uiState.timeControl || DEFAULT_TIME_CONTROL;
      if (!els.timeControlSelect.dataset.boundTimeControl) {
        els.timeControlSelect.dataset.boundTimeControl = "1";
        els.timeControlSelect.addEventListener("change", function () {
          uiState.timeControl = getSelectedTimeControl();
          if (!isOnlineGame() && uiState.screen === "lobby") {
            uiState.state = createGame(uiState.ruleMode, uiState.timeControl, {
              initialStandbyRule: uiState.initialStandbyRule
            });
            uiState.replayIndex = uiState.state.history.length - 1;
          }
          render();
        });
      }
    }
    return field;
  }

  function ensureLocalRuleModeField() {
    var field = document.getElementById("localRuleModeField");
    var label;
    var select;
    if (!field) {
      field = document.createElement("label");
      field.id = "localRuleModeField";
      field.className = "field local-rule-mode-field";
      label = document.createElement("span");
      label.textContent = "\u99D2\u30E2\u30FC\u30C9";
      select = document.createElement("select");
      select.id = "localRuleModeSelect";
      [
        { value: "original", label: GAME_MODE_LABELS.original },
        { value: "shogi", label: GAME_MODE_LABELS.shogi }
      ].forEach(function (option) {
        var item = document.createElement("option");
        item.value = option.value;
        item.textContent = option.label;
        select.appendChild(item);
      });
      field.appendChild(label);
      field.appendChild(select);
    }
    els.localRuleModeField = field;
    els.localRuleModeSelect = document.getElementById("localRuleModeSelect");
    if (els.localRuleModeSelect) {
      els.localRuleModeSelect.value = uiState.ruleMode || "original";
      if (!els.localRuleModeSelect.dataset.boundLocalRuleMode) {
        els.localRuleModeSelect.dataset.boundLocalRuleMode = "1";
        els.localRuleModeSelect.addEventListener("change", function () {
          uiState.ruleMode = getSelectedLocalRuleMode();
          if (!isOnlineGame() && uiState.screen === "lobby") {
            uiState.state = createGame(uiState.ruleMode, uiState.timeControl, {
              initialStandbyRule: uiState.initialStandbyRule
            });
            uiState.replayIndex = uiState.state.history.length - 1;
          }
          render();
        });
      }
    }
    return field;
  }

  function ensureNpcStrengthField() {
    var field = document.getElementById("npcStrengthField");
    var label;
    var select;
    if (!field) {
      field = document.createElement("label");
      field.id = "npcStrengthField";
      field.className = "field npc-strength-field";
      label = document.createElement("span");
      label.textContent = "\u004E\u0050\u0043\u5F37\u3055";
      select = document.createElement("select");
      select.id = "npcStrengthSelect";
      NPC_STRENGTH_OPTIONS.forEach(function (option) {
        var item = document.createElement("option");
        item.value = option.value;
        item.textContent = option.label;
        select.appendChild(item);
      });
      select.value = uiState.npc && uiState.npc.strength ? uiState.npc.strength : DEFAULT_NPC_STRENGTH;
      field.appendChild(label);
      field.appendChild(select);
    }
    els.npcStrengthField = field;
    els.npcStrengthSelect = document.getElementById("npcStrengthSelect");
    if (els.npcStrengthSelect) {
      els.npcStrengthSelect.value = getSelectedNpcStrength();
      if (!els.npcStrengthSelect.dataset.boundNpcStrength) {
        els.npcStrengthSelect.dataset.boundNpcStrength = "1";
        els.npcStrengthSelect.addEventListener("change", function () {
          uiState.npc.strength = getSelectedNpcStrength();
          render();
        });
      }
    }
    return field;
  }

  function ensureStartSideField(context) {
    var mode = context === "npc" ? "npc" : "practice";
    var field = document.getElementById("startSideField");
    var label;
    var select;
    if (!field) {
      field = document.createElement("label");
      field.id = "startSideField";
      field.className = "field start-side-field";
      label = document.createElement("span");
      select = document.createElement("select");
      select.id = "startSideSelect";
      field.appendChild(label);
      field.appendChild(select);
    }
    label = field.querySelector("span");
    select = field.querySelector("select");
    if (label) {
      label.textContent = mode === "npc" ? "\u3042\u306A\u305F\u306E\u9663\u55B6" : "\u76E4\u9762\u306E\u624B\u524D";
    }
    if (select && select.dataset.startSideContext !== mode) {
      select.innerHTML = "";
      START_SIDE_OPTIONS.forEach(function (option) {
        var item = document.createElement("option");
        item.value = option.value;
        item.textContent = mode === "npc" ? option.npcLabel : option.practiceLabel;
        select.appendChild(item);
      });
      select.dataset.startSideContext = mode;
    }
    els.startSideField = field;
    els.startSideSelect = document.getElementById("startSideSelect");
    if (els.startSideSelect) {
      els.startSideSelect.value = uiState.startSidePreference || DEFAULT_START_SIDE;
      if (!els.startSideSelect.dataset.boundStartSide) {
        els.startSideSelect.dataset.boundStartSide = "1";
        els.startSideSelect.addEventListener("change", function () {
          uiState.startSidePreference = getSelectedStartSidePreference();
          render();
        });
      }
    }
    return field;
  }

  function ensureInitialStandbyRuleField(context) {
    var online = context === "online";
    var fieldId = online ? "onlineInitialStandbyRuleField" : "initialStandbyRuleField";
    var selectId = online ? "onlineInitialStandbyRuleSelect" : "initialStandbyRuleSelect";
    var field = document.getElementById(fieldId);
    var label;
    var select;
    if (!field) {
      field = document.createElement("label");
      field.id = fieldId;
      field.className = "field initial-standby-rule-field";
      label = document.createElement("span");
      label.textContent = "\u521D\u671F\u30B9\u30BF\u30F3\u30D0\u30A4";
      select = document.createElement("select");
      select.id = selectId;
      INITIAL_STANDBY_RULE_OPTIONS.forEach(function (option) {
        var item = document.createElement("option");
        item.value = option.value;
        item.textContent = option.label;
        item.title = option.description;
        select.appendChild(item);
      });
      field.appendChild(label);
      field.appendChild(select);
    }
    select = document.getElementById(selectId);
    if (select) {
      var currentOptions = Array.from(select.options || []).map(function (option) {
        return option.value;
      }).join(",");
      var nextOptions = INITIAL_STANDBY_RULE_OPTIONS.map(function (option) {
        return option.value;
      }).join(",");
      if (currentOptions !== nextOptions) {
        select.innerHTML = "";
        INITIAL_STANDBY_RULE_OPTIONS.forEach(function (option) {
          var item = document.createElement("option");
          item.value = option.value;
          item.textContent = option.label;
          item.title = option.description;
          select.appendChild(item);
        });
      }
    }
    if (online) {
      els.onlineInitialStandbyRuleField = field;
      els.onlineInitialStandbyRuleSelect = select;
    } else {
      els.initialStandbyRuleField = field;
      els.initialStandbyRuleSelect = select;
    }
    if (select) {
      uiState.initialStandbyRule = normalizeInitialStandbyRule(uiState.initialStandbyRule);
      select.value = uiState.initialStandbyRule || DEFAULT_INITIAL_STANDBY_RULE;
      if (!select.dataset.boundInitialStandbyRule) {
        select.dataset.boundInitialStandbyRule = "1";
        select.addEventListener("change", function () {
          uiState.initialStandbyRule = getSelectedInitialStandbyRule(online ? "online" : "local");
          saveInitialStandbyRule(uiState.initialStandbyRule);
          if (!isOnlineGame() && uiState.screen === "lobby") {
            uiState.state = createGame(uiState.ruleMode, uiState.timeControl, {
              initialStandbyRule: uiState.initialStandbyRule
            });
            uiState.replayIndex = uiState.state.history.length - 1;
          }
          render();
        });
      }
    }
    field.hidden = INITIAL_STANDBY_RULE_OPTIONS.length <= 1;
    return field;
  }

  function removeInitialStandbyRuleFieldElements() {
    ["initialStandbyRuleField", "onlineInitialStandbyRuleField"].forEach(function (fieldId) {
      var field = document.getElementById(fieldId);
      if (field && field.parentNode) {
        field.parentNode.removeChild(field);
      }
    });
    els.initialStandbyRuleField = null;
    els.initialStandbyRuleSelect = null;
    els.onlineInitialStandbyRuleField = null;
    els.onlineInitialStandbyRuleSelect = null;
    uiState.initialStandbyRule = DEFAULT_INITIAL_STANDBY_RULE;
  }

  function createLocalStartSettingsRow(context) {
    var row = document.createElement("div");
    row.className = "lobby-settings-row";
    removeInitialStandbyRuleFieldElements();
    row.appendChild(ensureLocalRuleModeField());
    if (context === "npc") {
      row.classList.add("npc-settings-row");
      row.appendChild(ensureNpcStrengthField());
    } else if (context !== "tsume") {
      row.appendChild(ensureTimeControlField());
    }
    if (context !== "tsume") {
      row.appendChild(ensureStartSideField(context));
    }
    return row;
  }

  function ensureNpcRestartDialog() {
    var dialog = document.getElementById("npcRestartDialog");
    var modeSelect;
    var strengthSelect;
    var sideSelect;
    if (dialog) {
      return dialog;
    }
    dialog = document.createElement("section");
    dialog.id = "npcRestartDialog";
    dialog.className = "npc-restart-dialog";
    dialog.hidden = true;
    dialog.innerHTML = ""
      + "<div class=\"npc-restart-backdrop\" data-npc-restart-close=\"1\"></div>"
      + "<div class=\"npc-restart-panel card\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"npcRestartTitle\">"
      + "<div class=\"npc-restart-head\">"
      + "<div><p class=\"label\">NEW NPC MATCH</p><h2 id=\"npcRestartTitle\">NPC戦を最初から</h2></div>"
      + "<button type=\"button\" class=\"small-button\" data-npc-restart-close=\"1\">閉じる</button>"
      + "</div>"
      + "<p class=\"scene-note\">駒モード、NPC強さ、先手後手を選び直して新しく始めます。</p>"
      + "<div class=\"npc-restart-grid\">"
      + "<label class=\"field\"><span>駒モード</span><select id=\"npcRestartModeSelect\"></select></label>"
      + "<label class=\"field\"><span>NPC強さ</span><select id=\"npcRestartStrengthSelect\"></select></label>"
      + "<label class=\"field\"><span>あなたの陣営</span><select id=\"npcRestartSideSelect\"></select></label>"
      + "</div>"
      + "<div class=\"panel-actions npc-restart-actions\">"
      + "<button type=\"button\" class=\"primary\" id=\"npcRestartApplyBtn\">この設定で開始</button>"
      + "<button type=\"button\" id=\"npcRestartCancelBtn\">キャンセル</button>"
      + "</div>"
      + "</div>";
    document.body.appendChild(dialog);
    modeSelect = dialog.querySelector("#npcRestartModeSelect");
    strengthSelect = dialog.querySelector("#npcRestartStrengthSelect");
    sideSelect = dialog.querySelector("#npcRestartSideSelect");
    [
      { value: "original", label: GAME_MODE_LABELS.original },
      { value: "shogi", label: GAME_MODE_LABELS.shogi }
    ].forEach(function (option) {
      var item = document.createElement("option");
      item.value = option.value;
      item.textContent = option.label;
      modeSelect.appendChild(item);
    });
    NPC_STRENGTH_OPTIONS.forEach(function (option) {
      var item = document.createElement("option");
      item.value = option.value;
      item.textContent = option.label;
      strengthSelect.appendChild(item);
    });
    START_SIDE_OPTIONS.forEach(function (option) {
      var item = document.createElement("option");
      item.value = option.value;
      item.textContent = option.npcLabel;
      sideSelect.appendChild(item);
    });
    dialog.addEventListener("click", function (event) {
      if (event.target && event.target.dataset && event.target.dataset.npcRestartClose) {
        closeNpcRestartDialog();
      }
    });
    dialog.querySelector("#npcRestartCancelBtn").addEventListener("click", closeNpcRestartDialog);
    dialog.querySelector("#npcRestartApplyBtn").addEventListener("click", function () {
      var mode = modeSelect.value || uiState.ruleMode || "original";
      var strength = strengthSelect.value || DEFAULT_NPC_STRENGTH;
      var side = sideSelect.value || DEFAULT_START_SIDE;
      uiState.ruleMode = mode;
      uiState.npc.strength = strength;
      uiState.startSidePreference = side;
      if (els.localRuleModeSelect) {
        els.localRuleModeSelect.value = mode;
      }
      if (els.npcStrengthSelect) {
        els.npcStrengthSelect.value = strength;
      }
      if (els.startSideSelect) {
        els.startSideSelect.value = side;
      }
      closeNpcRestartDialog();
      startNpcGame(mode, {
        npcStrength: strength,
        startSidePreference: side
      });
    });
    return dialog;
  }

  function openNpcRestartDialog() {
    var dialog = ensureNpcRestartDialog();
    var modeSelect = dialog.querySelector("#npcRestartModeSelect");
    var strengthSelect = dialog.querySelector("#npcRestartStrengthSelect");
    var sideSelect = dialog.querySelector("#npcRestartSideSelect");
    if (modeSelect) {
      modeSelect.value = uiState.ruleMode || getSelectedLocalRuleMode();
    }
    if (strengthSelect) {
      strengthSelect.value = (uiState.npc && uiState.npc.strength) ? uiState.npc.strength : getSelectedNpcStrength();
    }
    if (sideSelect) {
      sideSelect.value = uiState.startSidePreference || getSelectedStartSidePreference();
    }
    dialog.hidden = false;
    window.setTimeout(function () {
      var firstSelect = dialog.querySelector("select");
      if (firstSelect) {
        firstSelect.focus();
      }
    }, 0);
  }

  function closeNpcRestartDialog() {
    var dialog = document.getElementById("npcRestartDialog");
    if (dialog) {
      dialog.hidden = true;
    }
  }

  function getLobbyPrimaryFocusElement(menu, tab) {
    var currentMenu = menu || uiState.lobbyMenu || "home";
    var currentTab = tab || (currentMenu === "online"
      ? uiState.lobbyOnlineTab
      : (currentMenu === "solo" ? uiState.lobbySoloTab : uiState.lobbyRulesTab));
    if (currentMenu === "online") {
      if (els.onlineNameInput && !String(els.onlineNameInput.value || "").trim()) {
        return els.onlineNameInput;
      }
      if (currentTab === "create") {
        return els.onlineRoomNameInput || els.createRoomBtn;
      }
      if (currentTab === "join") {
        return els.onlineRoomInput || els.joinRoomBtn;
      }
      return els.refreshRoomsBtn || els.roomList;
    }
    if (currentMenu === "solo") {
      return currentTab === "replay" ? null : null;
    }
    return null;
  }

  function syncLobbyMenuViewport(menu, tab) {
    var currentMenu = menu || uiState.lobbyMenu || "home";
    var currentTab = tab || null;
    if (uiState.screen !== "lobby" || typeof window === "undefined") {
      return;
    }
    window.requestAnimationFrame(function () {
      var target = currentMenu === "home"
        ? document.querySelector("#lobbyView .hero.card")
        : (els.lobbyHubCard || document.querySelector("#lobbyView .hero.card"));
      var focusTarget = getLobbyPrimaryFocusElement(currentMenu, currentTab);
      if (target && typeof target.scrollIntoView === "function") {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (focusTarget && typeof focusTarget.focus === "function") {
        window.setTimeout(function () {
          try {
            focusTarget.focus({ preventScroll: true });
          } catch (error) {
            focusTarget.focus();
          }
          if (typeof focusTarget.select === "function" && focusTarget.tagName === "INPUT") {
            focusTarget.select();
          }
        }, 160);
      }
    });
  }

  function renderSimpleLobbyLayout() {
    var menu = uiState.lobbyMenu || "home";
    var activeOnlineTab = uiState.lobbyOnlineTab || "";
    var activeSoloTab = uiState.lobbySoloTab || "";
    var replayArchive = loadLatestReplayArchive();
    var importedReplay = loadImportedReplayArchive();
    var hubBody;
    var nav;
    var info;
    var actionGrid;
    var launchGrid;
    var primaryBtn;
    var secondaryBtn;
    var replayBtn;
    var createTabBtn;
    var listTabBtn;
    var joinTabBtn;
    var npcTabBtn;
    var soloTabBtn;
    var replayTabBtn;
    var summaryBtn;
    var detailBtn;
    var josekiBtn;
    var formationsBtn;

    if (menu === "solo" && activeSoloTab === "tsume") {
      uiState.lobbySoloTab = "npc";
      activeSoloTab = "npc";
    }
    if (menu === "solo" && activeSoloTab === "replay") {
      uiState.lobbySoloTab = "practice";
      activeSoloTab = "practice";
    }
    var importBtn;
    var importedBtn;
    var studyRoomBtn;
    var studyArchive;
    var librarySection;
    var libraryTitle;
    var libraryList;
    var hubSection;
    var stageLayout;
    var stageStack;
    var stageSummary;
    var row;
    var nameTitle;
    var inlineLabel;
    var listTitle;
    var listToolbar;
    if (!els.lobbyHubCard || !els.lobbyHubBody || !els.onlineLobbyCard) {
      return;
    }

    if (els.lobbyView) {
      els.lobbyView.classList.toggle("lobby-home-mode", menu === "home");
      els.lobbyView.classList.toggle("lobby-submenu-mode", menu !== "home");
      els.lobbyView.classList.toggle("lobby-child-page", isLobbyChildPage());
      els.lobbyView.classList.toggle("lobby-online-mode", menu === "online");
      els.lobbyView.classList.toggle("lobby-solo-mode", menu === "solo");
      els.lobbyView.classList.toggle("lobby-rules-mode", menu === "rules");
    }

    if (els.lobbyMainOnlineBtn) {
      els.lobbyMainOnlineBtn.classList.toggle("active", menu === "online");
    }
    if (els.lobbyMainSoloBtn) {
      els.lobbyMainSoloBtn.classList.toggle("active", menu === "solo");
    }
    if (els.lobbyMainRulesBtn) {
      els.lobbyMainRulesBtn.classList.toggle("active", menu === "rules");
    }
    if (document.querySelector("#lobbyView .hero .lead")) {
      document.querySelector("#lobbyView .hero .lead").hidden = true;
    }

    els.lobbyHubCard.hidden = menu === "home";
    if (els.lobbyHubBackBtn) {
      els.lobbyHubBackBtn.hidden = menu === "home";
    }
    els.onlineLobbyCard.hidden = true;
    if (els.lobbyAdvancedTools) {
      els.lobbyAdvancedTools.hidden = true;
    }

    if (menu === "home") {
      return;
    }

    hubBody = els.lobbyHubBody;
    hubBody.innerHTML = "";

    if (menu === "online") {
      if (els.lobbyHubLabel) {
        els.lobbyHubLabel.textContent = "ONLINE";
      }
      if (els.lobbyHubTitle) {
        els.lobbyHubTitle.textContent = "オンライン対戦";
      }
      nav = document.createElement("div");
      nav.className = "lobby-submenu-buttons";

      createTabBtn = document.createElement("button");
      createTabBtn.type = "button";
      createTabBtn.className = "lobby-submenu-button" + (activeOnlineTab === "create" ? " active" : "");
      createTabBtn.textContent = "部屋を作る";
      createTabBtn.addEventListener("click", function () {
        setLobbyMenu("online", "create");
      });

      listTabBtn = document.createElement("button");
      listTabBtn.type = "button";
      listTabBtn.className = "lobby-submenu-button" + (activeOnlineTab === "list" ? " active" : "");
      listTabBtn.textContent = "部屋一覧";
      listTabBtn.addEventListener("click", function () {
        setLobbyMenu("online", "list");
      });

      joinTabBtn = document.createElement("button");
      joinTabBtn.type = "button";
      joinTabBtn.className = "lobby-submenu-button" + (activeOnlineTab === "join" ? " active" : "");
      joinTabBtn.textContent = "参加コード";
      joinTabBtn.addEventListener("click", function () {
        setLobbyMenu("online", "join");
      });

      nav.appendChild(createTabBtn);
      nav.appendChild(listTabBtn);
      nav.appendChild(joinTabBtn);
      hubBody.appendChild(nav);

      if (!activeOnlineTab) {
        return;
      }

      if (activeOnlineTab === "create") {
        stageSummary = null;
      } else if (activeOnlineTab === "list") {
        stageSummary = null;
      } else {
        stageSummary = null;
      }
      stageLayout = document.createElement("div");
      stageLayout.className = "lobby-stage-layout solo-stage-layout";
      stageStack = document.createElement("div");
      stageStack.className = "lobby-stage-stack";
      if (stageSummary) {
        stageLayout.appendChild(stageSummary);
      }

      if (els.onlineNameField) {
        hubSection = document.createElement("section");
        hubSection.className = "hub-simple-section hub-name-section";
        setLobbySectionWidth(hubSection, 620);
        nameTitle = document.createElement("p");
        nameTitle.className = "label compact-inline-label";
        nameTitle.textContent = "YOUR NAME";
        info = document.createElement("p");
        info.className = "scene-note lobby-submenu-note";
        info.textContent = "オンラインではこの名前が部屋作成時と参加時の両方で使われます。";
        hubSection.appendChild(nameTitle);
        hubSection.appendChild(info);
        hubSection.appendChild(els.onlineNameField);
        stageStack.appendChild(hubSection);
      }

      appendLobbyNotice(stageStack);

      hubSection = document.createElement("section");
      hubSection.className = "hub-simple-section hub-online-section hub-main-stage";
      setLobbySectionWidth(hubSection, 720);
      info = document.createElement("p");
      info.className = "label compact-inline-label";
      info.textContent = activeOnlineTab === "create"
        ? "ROOM SETUP"
        : (activeOnlineTab === "list" ? "PUBLIC ROOMS" : "JOIN ROOM");
      hubSection.appendChild(info);
      inlineLabel = document.createElement("p");
      inlineLabel.className = "scene-note lobby-submenu-note";
      inlineLabel.textContent = activeOnlineTab === "create"
        ? "部屋名と駒モードを選んで作成します。"
        : (activeOnlineTab === "list" ? "公開中の部屋から参加または観戦できます。" : "参加コードを入力して入室します。");
      hubSection.appendChild(inlineLabel);

      if (activeOnlineTab === "create") {
        row = document.createElement("div");
        row.className = "hub-online-fields hub-online-fields-create";
        if (els.onlineCreateRoomNameField) {
          row.appendChild(els.onlineCreateRoomNameField);
        }
        if (els.onlineCreateModeField) {
          row.appendChild(els.onlineCreateModeField);
        }
        removeInitialStandbyRuleFieldElements();
        row.appendChild(ensureTimeControlField());
        if (els.onlineCreatePasswordField) {
          row.appendChild(els.onlineCreatePasswordField);
        }
        if (els.onlineCreateVisibilityField) {
          row.appendChild(els.onlineCreateVisibilityField);
        }
        hubSection.appendChild(row);
        if (els.createRoomBtn) {
          els.createRoomBtn.textContent = "部屋を作る";
          els.createRoomBtn.classList.add("primary");
          els.createRoomBtn.classList.add("hub-primary-button");
          hubSection.appendChild(els.createRoomBtn);
        }
      } else if (activeOnlineTab === "join") {
        row = document.createElement("div");
        row.className = "hub-online-fields hub-join-fields";
        if (els.onlineJoinCodeField) {
          row.appendChild(els.onlineJoinCodeField);
        }
        if (els.onlineJoinPasswordField) {
          row.appendChild(els.onlineJoinPasswordField);
        }
        hubSection.appendChild(row);
        actionGrid = document.createElement("div");
        actionGrid.className = "lobby-launch-grid lobby-launch-stack";
        if (els.joinRoomBtn) {
          els.joinRoomBtn.textContent = "参加コードで入る";
          els.joinRoomBtn.classList.add("primary");
          actionGrid.appendChild(els.joinRoomBtn);
        }
        secondaryBtn = document.createElement("button");
        secondaryBtn.type = "button";
        secondaryBtn.textContent = "参加コードで観戦";
        secondaryBtn.disabled = isOnlineGame();
        secondaryBtn.addEventListener("click", function () {
          spectateOnlineRoom();
        });
        actionGrid.appendChild(secondaryBtn);
        hubSection.appendChild(actionGrid);
      } else {
        listToolbar = document.createElement("div");
        listToolbar.className = "hub-list-toolbar";
        listTitle = document.createElement("strong");
        listTitle.textContent = "公開中の部屋";
        listToolbar.appendChild(listTitle);
        if (els.refreshRoomsBtn) {
          els.refreshRoomsBtn.textContent = "更新";
          listToolbar.appendChild(els.refreshRoomsBtn);
        }
        hubSection.appendChild(listToolbar);
        if (els.roomList) {
          hubSection.appendChild(els.roomList);
        }
      }

      stageStack.appendChild(hubSection);

      if (els.lobbyAdvancedTools && els.onlineDeleteRoomBox) {
        els.lobbyAdvancedTools.hidden = false;
        stageStack.appendChild(els.lobbyAdvancedTools);
      }
      stageLayout.appendChild(stageStack);
      hubBody.appendChild(stageLayout);
      return;
    }

    if (menu === "solo") {
      if (els.lobbyHubLabel) {
        els.lobbyHubLabel.textContent = "SOLO";
      }
      if (els.lobbyHubTitle) {
        els.lobbyHubTitle.textContent = "一人プレイ";
      }
      nav = document.createElement("div");
      nav.className = "lobby-submenu-buttons";

      npcTabBtn = document.createElement("button");
      npcTabBtn.type = "button";
      npcTabBtn.className = "lobby-submenu-button" + (activeSoloTab === "npc" ? " active" : "");
      npcTabBtn.textContent = "NPCと対戦";
      npcTabBtn.addEventListener("click", function () {
        setLobbyMenu("solo", "npc");
      });

      soloTabBtn = document.createElement("button");
      soloTabBtn.type = "button";
      soloTabBtn.className = "lobby-submenu-button" + (activeSoloTab === "practice" || activeSoloTab === "replay" ? " active" : "");
      soloTabBtn.textContent = "\u4E00\u4EBA\u691C\u8A0E";
      soloTabBtn.addEventListener("click", function () {
        setLobbyMenu("solo", "practice");
      });

      replayTabBtn = document.createElement("button");
      replayTabBtn.type = "button";
      replayTabBtn.className = "lobby-submenu-button";
      replayTabBtn.textContent = "\u68CB\u8B5C\u3092\u898B\u308B";
      replayTabBtn.addEventListener("click", function () {
        window.location.href = "kifu.html";
      });

      nav.appendChild(npcTabBtn);
      nav.appendChild(soloTabBtn);
      nav.appendChild(replayTabBtn);
      hubBody.appendChild(nav);

      if (!activeSoloTab) {
        return;
      }

      stageLayout = document.createElement("div");
      stageLayout.className = "lobby-stage-layout solo-stage-layout";
      stageStack = document.createElement("div");
      stageStack.className = "lobby-stage-stack";
      appendLobbyNotice(stageStack);

      if (activeSoloTab === "practice" || activeSoloTab === "replay" || activeSoloTab === "tsume") {
        hubSection = document.createElement("section");
        hubSection.className = "hub-simple-section";
        setLobbySectionWidth(hubSection, 720);

        info = document.createElement("p");
        info.className = "label compact-inline-label";
        info.textContent = activeSoloTab === "tsume" ? "TSUME TRAINING" : "LOCAL BOARD";
        hubSection.appendChild(info);
        inlineLabel = document.createElement("p");
        inlineLabel.className = "scene-note lobby-submenu-note";
        inlineLabel.textContent = activeSoloTab === "tsume"
          ? "1手勝ちを自分で探す練習です。王の捕獲か本陣中央の上書きを意識します。"
          : "一人で盤面を動かして操作を試せます。";
        hubSection.appendChild(inlineLabel);
        hubSection.appendChild(createLocalStartSettingsRow(activeSoloTab === "tsume" ? "tsume" : "practice"));
        if (activeSoloTab !== "tsume") {
          info = document.createElement("div");
          info.className = "local-play-help";
          info.innerHTML = ""
            + "<strong>操作の流れ</strong>"
            + "<ol>"
            + "<li>駒モードと盤面の手前を選びます。</li>"
            + "<li>開始後は、手札・持駒・盤面の順に選んで操作します。</li>"
            + "<li>保存棋譜や読込棋譜は下の棋譜メニューから開けます。</li>"
            + "</ol>";
          hubSection.appendChild(info);
        } else {
          info = document.createElement("p");
          info.className = "scene-note lobby-submenu-note tsume-timer-note";
          info.textContent = "詰将棋では持ち時間を設定せず、開始後に経過時間だけを計測します。";
          hubSection.appendChild(info);
        }

        launchGrid = document.createElement("div");
        launchGrid.className = "lobby-launch-grid lobby-launch-grid-solo";
        primaryBtn = document.createElement("button");
        primaryBtn.type = "button";
        primaryBtn.className = "primary";
        primaryBtn.textContent = activeSoloTab === "tsume" ? "この設定で詰将棋開始" : "この設定で一人プレイ開始";
        primaryBtn.addEventListener("click", function () {
          if (activeSoloTab === "tsume") {
            startTsumeTraining(getSelectedLocalRuleMode());
            return;
          }
          startPracticeGame(getSelectedLocalRuleMode());
        });
        launchGrid.appendChild(primaryBtn);
        hubSection.appendChild(launchGrid);
        stageStack.appendChild(hubSection);
        if (activeSoloTab !== "tsume") {
          stageLayout.appendChild(stageStack);
          hubBody.appendChild(stageLayout);
          return;
        }

        if (activeSoloTab === "tsume") {
          stageLayout.appendChild(stageStack);
          hubBody.appendChild(stageLayout);
          return;
        }

        hubSection = document.createElement("section");
        hubSection.className = "hub-simple-section";

        info = document.createElement("p");
        info.className = "scene-note lobby-submenu-note";
        info.textContent = replayArchive && replayArchive.history && replayArchive.history.length
          ? "最新: " + (replayArchive.title || "保存棋譜") + " / " + GAME_MODE_LABELS[replayArchive.ruleMode || "original"] + " / " + new Date(replayArchive.savedAt).toLocaleString("ja-JP")
          : "最新の保存棋譜はまだありません。ひとりプレイか NPC対戦を始めると、ここから見返せます。";
        hubSection.appendChild(info);

        info = document.createElement("p");
        info.className = "scene-note lobby-submenu-note";
        info.textContent = importedReplay && importedReplay.history && importedReplay.history.length
          ? "読込済み: " + (importedReplay.title || "読み込み棋譜") + " / " + GAME_MODE_LABELS[importedReplay.ruleMode || "original"] + " / " + new Date(importedReplay.savedAt).toLocaleString("ja-JP")
          : "棋譜ファイルを読み込むと、ここから再度開けます。";
        hubSection.appendChild(info);
        stageStack.appendChild(hubSection);

        actionGrid = document.createElement("div");
        actionGrid.className = "lobby-launch-grid lobby-launch-grid-replay";
        studyArchive = getStudySourceArchive();
        replayBtn = document.createElement("button");
        replayBtn.type = "button";
        replayBtn.className = "primary";
        replayBtn.textContent = replayArchive && replayArchive.history && replayArchive.history.length ? "最新の棋譜を開く" : "保存棋譜なし";
        replayBtn.disabled = !(replayArchive && replayArchive.history && replayArchive.history.length);
        replayBtn.addEventListener("click", function () {
          openLatestReplayArchive();
        });
        actionGrid.appendChild(replayBtn);

        importBtn = document.createElement("button");
        importBtn.type = "button";
        importBtn.textContent = "棋譜ファイルを読み込む";
        importBtn.addEventListener("click", function () {
          triggerReplayImport();
        });
        actionGrid.appendChild(importBtn);

        importedBtn = document.createElement("button");
        importedBtn.type = "button";
        importedBtn.textContent = importedReplay && importedReplay.history && importedReplay.history.length ? "読み込み済み棋譜を開く" : "読込済み棋譜なし";
        importedBtn.disabled = !(importedReplay && importedReplay.history && importedReplay.history.length);
        importedBtn.addEventListener("click", function () {
          openImportedReplayArchive();
        });
        actionGrid.appendChild(importedBtn);

        studyRoomBtn = document.createElement("button");
        studyRoomBtn.type = "button";
        studyRoomBtn.textContent = studyArchive
          ? (replayArchive ? "最新棋譜で検討室" : "読込棋譜で検討室")
          : "検討室用棋譜なし";
        studyRoomBtn.disabled = !studyArchive;
        studyRoomBtn.addEventListener("click", function () {
          createOnlineStudyRoomFromArchive(studyArchive);
        });
        studyRoomBtn.hidden = true;

        stageStack.appendChild(actionGrid);

        librarySection = document.createElement("section");
        librarySection.className = "hub-simple-section";
        libraryTitle = document.createElement("p");
        libraryTitle.className = "label compact-inline-label";
        libraryTitle.textContent = "KIFU LIBRARY";
        inlineLabel = document.createElement("input");
        inlineLabel.type = "search";
        inlineLabel.className = "review-note-field replay-library-search";
        inlineLabel.placeholder = "タイトル・メモ・名前で検索";
        inlineLabel.value = uiState.replayLibraryQuery || "";
        inlineLabel.addEventListener("input", function () {
          uiState.replayLibraryQuery = inlineLabel.value;
          render();
        });
        librarySection.appendChild(libraryTitle);
        librarySection.appendChild(inlineLabel);
        info = document.createElement("div");
        info.className = "compare-source-bar replay-library-filter-bar";
        [
          { key: "all", label: "すべて" },
          { key: "favorite", label: "★" },
          { key: "practice", label: "一人" },
          { key: "npc", label: "NPC" },
          { key: "online", label: "対局" }
        ].forEach(function (entry) {
          var filterBtn = document.createElement("button");
          filterBtn.type = "button";
          filterBtn.className = "ghost-button compare-source-chip" + ((uiState.replayLibraryFilter || "all") === entry.key ? " active-tool" : "");
          filterBtn.textContent = entry.label;
          filterBtn.addEventListener("click", function () {
            uiState.replayLibraryFilter = entry.key;
            render();
          });
          info.appendChild(filterBtn);
        });
        librarySection.appendChild(info);
        listTitle = document.createElement("p");
        listTitle.className = "subtle replay-library-stats";
        librarySection.appendChild(listTitle);
        libraryList = document.createElement("div");
        libraryList.className = "replay-library-list";
        els.replayLibrarySearch = inlineLabel;
        els.replayLibraryFilterBar = info;
        els.replayLibraryStats = listTitle;
        renderReplayLibrary(libraryList);
        librarySection.appendChild(libraryList);
        stageStack.appendChild(librarySection);
        stageLayout.appendChild(stageStack);
        hubBody.appendChild(stageLayout);
        return;
      }

      hubSection = document.createElement("section");
      hubSection.className = "hub-simple-section hub-main-stage";
      setLobbySectionWidth(hubSection, 720);
      info = document.createElement("p");
      info.className = "label compact-inline-label";
      info.textContent = activeSoloTab === "npc" ? "VS NPC" : "LOCAL BOARD";
      hubSection.appendChild(info);
      inlineLabel = document.createElement("p");
      inlineLabel.className = "scene-note lobby-submenu-note";
      inlineLabel.textContent = activeSoloTab === "npc"
        ? "NPC対戦です。駒モードを選んで開始します。"
        : "一人で両陣営を動かして盤面を確認できます。";
      hubSection.appendChild(inlineLabel);
      hubSection.appendChild(createLocalStartSettingsRow(activeSoloTab === "npc" ? "npc" : "practice"));

      launchGrid = document.createElement("div");
      launchGrid.className = "lobby-launch-grid lobby-launch-grid-solo";
      primaryBtn = document.createElement("button");
      primaryBtn.type = "button";
      primaryBtn.className = "primary";
      primaryBtn.textContent = activeSoloTab === "npc" ? "この設定でNPC対戦開始" : "この設定で一人プレイ開始";
      primaryBtn.addEventListener("click", function () {
        if (activeSoloTab === "npc") {
          startNpcGame(getSelectedLocalRuleMode());
          return;
        }
        startPracticeGame(getSelectedLocalRuleMode());
      });

      launchGrid.appendChild(primaryBtn);
      hubSection.appendChild(launchGrid);
      if (activeSoloTab === "npc") {
        stageStack.appendChild(hubSection);
        stageLayout.appendChild(stageStack);
        hubBody.appendChild(stageLayout);
        return;
      }
      stageStack.appendChild(hubSection);
      stageLayout.appendChild(stageStack);
      hubBody.appendChild(stageLayout);
      return;
    }

    if (els.lobbyHubLabel) {
      els.lobbyHubLabel.textContent = "RULES";
    }
    if (els.lobbyHubTitle) {
      els.lobbyHubTitle.textContent = "ルール";
    }
    stageLayout = document.createElement("div");
    stageLayout.className = "lobby-stage-layout";
    stageSummary = createLobbyStageSummary(
      "RULE GUIDE",
      "ルールを開く",
      "まずは全体像を短くつかむか、詳細版で順番に読み進めるかを選べます。",
      "このページからそのまま開けます。対局中のルール確認は別タブで開きます。"
    );
    stageLayout.appendChild(stageSummary);
    stageStack = document.createElement("div");
    stageStack.className = "lobby-stage-stack";
    appendLobbyNotice(stageStack);

    actionGrid = document.createElement("div");
    actionGrid.className = "lobby-launch-grid lobby-launch-grid-rules";

    summaryBtn = document.createElement("button");
    summaryBtn.type = "button";
    summaryBtn.className = "primary";
    summaryBtn.textContent = "簡易ルール";
    summaryBtn.addEventListener("click", function () {
      window.location.href = "rules-summary.html";
    });

    detailBtn = document.createElement("button");
    detailBtn.type = "button";
    detailBtn.textContent = "詳細ルール";
    detailBtn.addEventListener("click", function () {
      window.location.href = "rules.html";
    });

    josekiBtn = document.createElement("button");
    josekiBtn.type = "button";
    josekiBtn.textContent = "攻守ガイド";
    josekiBtn.addEventListener("click", function () {
      window.location.href = "joseki.html";
    });

    formationsBtn = document.createElement("button");
    formationsBtn.type = "button";
    formationsBtn.textContent = "囲い・戦型ガイド";
    formationsBtn.addEventListener("click", function () {
      window.location.href = "formations.html";
    });

    actionGrid.appendChild(summaryBtn);
    actionGrid.appendChild(detailBtn);
    actionGrid.appendChild(josekiBtn);
    actionGrid.appendChild(formationsBtn);
    stageStack.appendChild(actionGrid);
    stageLayout.appendChild(stageStack);
    hubBody.appendChild(stageLayout);
  }

  function renderMovementSummary() {
    var summaryOrder = getCurrentRuleMode() === "shogi" ? SHOGI_MOVEMENT_SUMMARY_ORDER : MOVEMENT_SUMMARY_ORDER;
    if (!els.movementSummary) {
      return;
    }
    els.movementSummary.innerHTML = "";
    summaryOrder.forEach(function (ruleKey) {
      var item = document.createElement("div");
      var preview = document.createElement("div");
      var desc = document.createElement("span");
      item.className = "summary-item";
      preview.className = "movement-board";
      desc.className = "choice-subtitle";
      appendMovementMiniBoard(preview, ruleKey);
      item.innerHTML = "<strong>" + getPieceLabel(ruleKey) + "</strong>" +
        "<span class=\"choice-subtitle piece-name-detail\">" + getPieceNameDetail(ruleKey) + "</span>";
      desc.textContent = getMovementSummaryText(ruleKey);
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
      piece.className = "choice-subtitle choice-piece-title piece-name-detail";
      piece.textContent = getPieceLabel(getCatalogPieceType(fragmentType)) + " / " + getPieceNameDetail(getCatalogPieceType(fragmentType));
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
    var deck = getStarterDeck(getCurrentRuleMode());
    for (var i = 0; i < deck.length; i += 1) {
      if (deck[i].fragmentType === fragmentType || deck[i].fragmentType === fragmentType + "m") {
        return deck[i].pieceType;
      }
    }
    return "";
  }

  function renderOnlineStatus() {
    var modeText = GAME_MODE_LABELS[getCurrentRuleMode()];
    var statusText = "タイトルから遊び方を選んでください。";
    var matchTitle = "オンライン対戦";
    var matchMeta = "最初に遊び方を選びます。";
    var isGameScreen = uiState.screen === "game";
    var isLocalMatch = isGameScreen && !isOnlineGame();
    var isLocalPlayableMatch = isLocalMatch && !uiState.replayOnly && (isNpcGame() || uiState.practiceMode);
    var studyOrigin = uiState.online.room && uiState.online.room.studyOrigin ? uiState.online.room.studyOrigin : null;
    var studyOriginText = "";
    if (studyOrigin) {
      studyOriginText = (studyOrigin.archiveTitle || studyOrigin.roomName || "棋譜")
        + (studyOrigin.stepLabel ? (" / " + studyOrigin.stepLabel) : "");
    }
    if (uiState.replayOnly && uiState.screen === "game") {
      statusText = "棋譜鑑賞";
      matchTitle = "棋譜鑑賞";
      matchMeta = "保存された棋譜を見返しています。";
    } else if (!isOnlineGame() && uiState.screen === "game" && isNpcGame()) {
      statusText = "対NPC戦 (" + modeText + ")";
      matchTitle = "対NPC戦";
      matchMeta = uiState.npc.thinking
        ? "NPC が次の一手を考えています。"
        : "\u3042\u306A\u305F\u306F" + PLAYER_LABELS[getNpcHumanSide()] + "\u3001NPC \u306F" + PLAYER_LABELS[uiState.npc.side] + "\u3067\u3059\u3002\u30ED\u30FC\u30AB\u30EB\u3067\u7DF4\u7FD2\u5BFE\u5C40\u3067\u304D\u307E\u3059\u3002";
      if (getNpcThinkStatsText()) {
        matchMeta += " " + getNpcThinkStatsText();
      }
    } else if (!isOnlineGame() && uiState.screen === "game" && uiState.tsumeMode) {
      statusText = "詰将棋 (" + modeText + ")";
      matchTitle = "詰将棋";
      matchMeta = "先手の1手勝ちを探す練習です。王の捕獲か本陣中央の上書きを意識してください。";
    } else if (!isOnlineGame() && uiState.screen === "game" && uiState.practiceMode) {
      statusText = "ひとりテストプレイ (" + modeText + ")";
      matchTitle = "ひとりテストプレイ";
      matchMeta = "1人で盤面や駒挙動を確認するための練習用ルームです。";
    } else if (uiState.screen === "lobby" && uiState.lobbyMenu === "online") {
      matchTitle = "オンライン対戦";
      matchMeta = "作成・一覧・参加コードの3つから選べます。";
      if (uiState.lobbyOnlineTab === "create") {
        statusText = "部屋を作る";
      } else if (uiState.lobbyOnlineTab === "list") {
        statusText = "公開中の部屋一覧";
      } else {
        statusText = "参加コードで入る";
      }
    }
    if (isOnlineGame()) {
      statusText = isOnlineStudyRoom() ? (isOnlineStudyBranchRoom() ? "分岐検討室" : "オンライン検討室") : "オンライン対戦中";
      matchTitle = isOnlineStudyRoom() ? (isOnlineStudyBranchRoom() ? "分岐検討室" : "オンライン検討室") : "オンライン対戦";
      matchMeta = (uiState.online.roomName || ("部屋 " + uiState.online.roomId)) + " / " + uiState.online.roomId + " / " + (isSpectatorMode() ? "観戦" : (uiState.online.side ? PLAYER_LABELS[uiState.online.side] : "-")) + " / " + modeText;
      if (isOnlineStudyBranchRoom() && studyOriginText) {
        matchMeta += " / 分岐元: " + studyOriginText;
      } else if (isOnlineStudyReviewRoom() && studyOriginText) {
        matchMeta += " / 共有棋譜: " + studyOriginText;
      }
      if (isSpectatorMode()) {
        statusText = isOnlineStudyRoom() ? "検討室を観戦中" : "対局を観戦中";
        matchMeta += " / 観戦者として閲覧しています。";
      }
      if (isOnlineReviewMode()) {
        var reviewStepLabel = uiState.online.reviewIndex <= 0 ? "開始局面" : ("第" + uiState.online.reviewIndex + "手");
        statusText = "感想戦 / " + reviewStepLabel;
        matchTitle = isOnlineStudyRoom() ? "オンライン検討室" : "オンライン感想戦";
        matchMeta += isOnlineStudyRoom() ? " / 棋譜を共有しながら検討中" : " / 終局後の手順確認を共有中";
      } else if (isOnlineStudyBranchRoom() && uiState.online.roomStatus === "waiting") {
        statusText += " / 参加待ち";
        matchMeta += " / 相手が入ると、この局面から変化手順を進められます。";
      } else if (isOnlineStudyBranchRoom() && uiState.online.roomStatus === "playing") {
        statusText += " / 検討中 (" + modeText + ")";
        matchMeta += " / 分岐局面から手を進めて検討できます。";
      } else if (uiState.online.roomStatus === "waiting") {
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
    if (els.gameView) {
      var viewerSide = getBoardViewerSide();
      els.gameView.classList.toggle("local-match", isLocalMatch);
      els.gameView.classList.toggle("local-playable-match", isLocalPlayableMatch);
      els.gameView.classList.toggle("online-match", isGameScreen && isOnlineGame());
      els.gameView.classList.toggle("replay-match", isGameScreen && !!uiState.replayOnly);
      els.gameView.classList.toggle("viewer-p1", isGameScreen && viewerSide === "P1");
      els.gameView.classList.toggle("viewer-p2", isGameScreen && viewerSide === "P2");
    }
    if (els.onlineStatus) {
      els.onlineStatus.textContent = statusText;
    }
    if (els.matchRoomCode) {
      els.matchRoomCode.textContent = uiState.replayOnly ? "REPLAY" : (uiState.online.roomId || "-");
    }
    if (els.matchPlayers) {
      els.matchPlayers.textContent = uiState.replayOnly
        ? getDisplayedPlayerName("P1") + " / " + getDisplayedPlayerName("P2")
        : getMatchPlayersText();
    }
    if (els.matchAdminKey) {
      els.matchAdminKey.textContent = uiState.replayOnly
        ? "-"
        : (isSpectatorMode()
        ? "-"
        : (uiState.online.roomId && uiState.roomAdminKeys[uiState.online.roomId]
        ? uiState.roomAdminKeys[uiState.online.roomId]
        : "-"));
    }
    if (els.onlineSideLabel) {
      els.onlineSideLabel.textContent = isSpectatorMode() ? "観戦" : (uiState.online.side ? PLAYER_LABELS[uiState.online.side] : "");
    }
    if (els.matchTitle) {
      els.matchTitle.textContent = matchTitle;
    }
    if (els.matchMeta) {
      els.matchMeta.textContent = matchMeta;
    }
    if (els.backToLobbyBtn) {
      var showBackToLobby = isGameScreen && !isOnlineGame();
      els.backToLobbyBtn.hidden = !showBackToLobby;
      if (showBackToLobby) {
        if (uiState.replayOnly) {
          els.backToLobbyBtn.textContent = "棋譜メニューへ";
          els.backToLobbyBtn.title = "棋譜鑑賞メニューに戻ります。";
        } else if (isNpcGame() || uiState.practiceMode) {
          els.backToLobbyBtn.textContent = "一人プレイへ";
          els.backToLobbyBtn.title = "一人プレイメニューに戻ります。";
        } else {
          els.backToLobbyBtn.textContent = "メニューへ";
          els.backToLobbyBtn.title = "現在のメニューに戻ります。";
        }
      }
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
    if (els.localRuleModeSelect) {
      els.localRuleModeSelect.value = uiState.ruleMode || "original";
      els.localRuleModeSelect.disabled = isOnlineGame();
    }
    if (els.timeControlSelect) {
      els.timeControlSelect.value = uiState.timeControl || DEFAULT_TIME_CONTROL;
      els.timeControlSelect.disabled = isOnlineGame();
    }
    if (els.npcStrengthSelect) {
      els.npcStrengthSelect.value = getSelectedNpcStrength();
      els.npcStrengthSelect.disabled = isOnlineGame();
    }
    if (els.startSideSelect) {
      els.startSideSelect.value = uiState.startSidePreference || DEFAULT_START_SIDE;
      els.startSideSelect.disabled = isOnlineGame();
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
      var showLocalRestart = uiState.screen === "game" && !uiState.replayOnly && !isOnlineGame() && (uiState.practiceMode || isNpcGame());
      els.practiceRestartBtn.hidden = !showLocalRestart;
      if (showLocalRestart) {
        els.practiceRestartBtn.textContent = uiState.tsumeMode ? "詰将棋を新しく" : (isNpcGame() ? "NPC戦を最初から" : "最初から");
        els.practiceRestartBtn.title = "現在の盤面をリセットして最初から始めます。";
      }
    }
    if (els.practiceModeBtn) {
      els.practiceModeBtn.hidden = true;
      els.practiceModeBtn.title = "現在の駒モード: " + modeText + "。変更すると盤面をリセットします。";
    }
    syncDiagnosticsVisibility();
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
      var showStartMatch = isOnlineGame() && !isOnlineStudyRoom() && uiState.online.roomStatus !== "playing";
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
    if (els.onlineJoinPasswordInput) {
      els.onlineJoinPasswordInput.disabled = isOnlineGame();
    }
    if (els.onlineRoomNameInput) {
      els.onlineRoomNameInput.disabled = isOnlineGame();
    }
    if (els.onlineRoomVisibilitySelect) {
      els.onlineRoomVisibilitySelect.disabled = isOnlineGame();
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
      uiState.lobbyRooms = sortLobbyRooms(data.rooms || []);
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
      els.contextRotateBtn.disabled = !!uiState.pendingFragmentPiece || !(uiState.selection && uiState.selection.type === "fragment");
    }
    if (els.contextCancelBtn) {
      els.contextCancelBtn.disabled = !!uiState.pendingFragmentPiece || !uiState.selection;
    }
    syncActionButtons();
  }

  function isTextEntryTarget(target) {
    if (!target) {
      return false;
    }
    var tagName = target.tagName ? target.tagName.toLowerCase() : "";
    return tagName === "input" || tagName === "textarea" || tagName === "select" || !!target.isContentEditable;
  }

  function rotateSelectedFragment() {
    if (!(uiState.selection && uiState.selection.type === "fragment")) {
      return false;
    }
    uiState.rotation = (uiState.rotation + 1) % 4;
    hideContextMenu();
    hidePlacementConfirm();
    if (uiState.pendingAnchor) {
      updateFragmentPreview(uiState.pendingAnchor.row, uiState.pendingAnchor.col, true);
      return true;
    }
    render();
    return true;
  }

  function handleGlobalKeyDown(event) {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || isTextEntryTarget(event.target)) {
      return;
    }
    if ((event.key || "").toLowerCase() === "r" && rotateSelectedFragment()) {
      event.preventDefault();
    }
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
    var canAct = isCurrentPlayer && isOnlineMatchStarted() && isHumanControlledPlayer(player) && !uiState.npc.thinking && !isInitialStandbyPhase(uiState.state);
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
      && !isInitialStandbyPhase(uiState.state)
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
    if (!els.contextMenu || !anchor || !uiState.selection || uiState.pendingFragmentPiece) {
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
        button.classList.remove("selected", "piece-preview-source", "pending-move-source", "pending-move-target", "anchor", "target", "preview-invalid", "move-target", "reserve-target", "recover-piece-target", "recover-fragment-target");
        if (uiState.selection && uiState.selection.type === "piece" && pieceMatchesCell(uiState.selection.pieceId, row, col)) {
          button.classList.add("selected");
        }
        if (uiState.selection && uiState.selection.type === "piecePreview" && pieceMatchesCell(uiState.selection.pieceId, row, col)) {
          button.classList.add("piece-preview-source");
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
    if (isOnlineReviewMode() && uiState.reviewArrowMode) {
      handleReviewArrowCellAction(row, col);
      return;
    }
    if (uiState.state.winner) {
      return;
    }
    if (shouldLockHumanActions()) {
      return;
    }

    var cell = uiState.state.board[row][col];
    var piece = cell.pieceId ? getPiece(uiState.state, cell.pieceId) : null;

    if (isNpcGame() && uiState.npc.thinking) {
      return "\u004E\u0050\u0043\u304C\u6B21\u306E\u624B\u3092\u8003\u3048\u3066\u3044\u307E\u3059\u3002";
    }
    if (isInitialStandbyPhase(uiState.state)) {
      if (uiState.pendingFragmentPiece) {
        tryFragmentPieceDrop(row, col, event);
        return;
      }
      if (uiState.selection && uiState.selection.type === "setupPiece") {
        tryInitialStandbyPieceDrop(row, col);
        return;
      }
      if (uiState.selection && uiState.selection.type === "fragment") {
        tryFragmentPlace(row, col, event);
      }
      return;
    }

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
      if (piece && piece.owner !== uiState.state.currentPlayer && !isMoveTarget(row, col)) {
        selectPieceForPreview(piece.id);
        render();
        return;
      }
      tryMove(row, col, event);
      return;
    }

    if (uiState.selection && uiState.selection.type === "piecePreview") {
      if (piece && piece.owner === uiState.state.currentPlayer) {
        selectPieceForMove(piece.id);
        render();
        return;
      }
      if (piece && piece.owner !== uiState.state.currentPlayer) {
        if (uiState.selection.pieceId === piece.id) {
          clearSelection();
        } else {
          selectPieceForPreview(piece.id);
        }
        render();
        return;
      }
      clearSelection();
      render();
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

    if (piece && piece.owner !== uiState.state.currentPlayer) {
      selectPieceForPreview(piece.id);
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

  function pushMoveCandidate(targets, seen, row, col) {
    var key;
    if (!isInBounds(row, col)) {
      return;
    }
    key = row + ":" + col;
    if (seen[key]) {
      return;
    }
    seen[key] = true;
    targets.push({ row: row, col: col });
  }

  function appendVectorMoveCandidates(piece, vectors, targets, seen) {
    (vectors || []).forEach(function (vector) {
      var transformed = transformVectorForPiece(piece, vector);
      pushMoveCandidate(targets, seen, piece.row + transformed[0], piece.col + transformed[1]);
    });
  }

  function appendRayMoveCandidates(piece, vectors, targets, seen) {
    (vectors || []).forEach(function (vector) {
      var transformed = transformVectorForPiece(piece, vector);
      var currentRow = piece.row + transformed[0];
      var currentCol = piece.col + transformed[1];
      while (isInBounds(currentRow, currentCol)) {
        if (!isTraversableCell(currentRow, currentCol)) {
          break;
        }
        pushMoveCandidate(targets, seen, currentRow, currentCol);
        if (uiState.state.board[currentRow][currentCol].pieceId) {
          break;
        }
        currentRow += transformed[0];
        currentCol += transformed[1];
      }
    });
  }

  function getMoveCandidateCells(piece) {
    var rule = piece ? getMovementRule(piece.kind) : null;
    var targets = [];
    var seen = {};
    if (!rule) {
      return targets;
    }
    if (rule.kind === "ray") {
      appendRayMoveCandidates(piece, rule.vectors, targets, seen);
    } else if (rule.kind === "rayStep") {
      appendVectorMoveCandidates(piece, rule.vectors, targets, seen);
      appendRayMoveCandidates(piece, rule.rayVectors, targets, seen);
    } else if (rule.kind === "mixed") {
      appendVectorMoveCandidates(piece, rule.vectors, targets, seen);
      appendVectorMoveCandidates(piece, rule.jumpVectors, targets, seen);
    } else {
      appendVectorMoveCandidates(piece, rule.vectors, targets, seen);
      appendVectorMoveCandidates(piece, rule.jumpVectors, targets, seen);
    }
    return targets;
  }

  function computeLegalMoveTargets(piece) {
    return getMoveCandidateCells(piece).filter(function (target) {
      return canMovePiece(piece, target.row, target.col);
    });
  }

  function getFullScanLegalMoveTargets(piece) {
    var targets = [];
    var row;
    var col;
    for (row = 0; row < BOARD_ROWS; row += 1) {
      for (col = 0; col < BOARD_COLS; col += 1) {
        if (canMovePiece(piece, row, col)) {
          targets.push({ row: row, col: col });
        }
      }
    }
    return targets;
  }

  function getLegalMoveTargets(piece) {
    var key;
    if (!piece || !activeNpcSearchCache || !uiState.state) {
      return computeLegalMoveTargets(piece);
    }
    key = getCachedNpcSearchStateKey(uiState.state)
      + "|legalMoves|" + getCurrentRuleMode()
      + "|" + piece.id + "|" + piece.kind + "|" + piece.owner + "|" + piece.row + ":" + piece.col;
    return getNpcSearchCachedValue("legalMoves", key, function () {
      return computeLegalMoveTargets(piece);
    }).slice();
  }

  function normalizeMoveTargetKeys(targets) {
    return (targets || []).map(function (target) {
      return target.row + ":" + target.col;
    }).sort();
  }

  function findMoveGenerationMismatches(state) {
    var targetState = state || uiState.state;
    var mismatches = [];
    var totalPieces = 0;
    if (!targetState) {
      return { ok: false, totalPieces: 0, mismatches: [{ error: "state is missing" }] };
    }
    withTemporaryState(targetState, function () {
      ["P1", "P2"].forEach(function (player) {
        Object.keys(targetState.players[player].pieces).forEach(function (pieceId) {
          var piece = targetState.players[player].pieces[pieceId];
          var optimized = normalizeMoveTargetKeys(computeLegalMoveTargets(piece));
          var fullScan = normalizeMoveTargetKeys(getFullScanLegalMoveTargets(piece));
          totalPieces += 1;
          if (optimized.join("|") !== fullScan.join("|")) {
            mismatches.push({
              pieceId: pieceId,
              owner: piece.owner,
              kind: piece.kind,
              row: piece.row,
              col: piece.col,
              optimized: optimized,
              fullScan: fullScan
            });
          }
        });
      });
    });
    return {
      ok: mismatches.length === 0,
      totalPieces: totalPieces,
      mismatches: mismatches
    };
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
    if (!isPendingFragmentPieceReady()) {
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
    var info = getPieceInfo(pieceType);
    var notation = getPieceNotationMode();
    if (!info) {
      return getPieceLabels()[pieceType] || pieceType;
    }
    if (notation === "code") {
      return info.code || info.letter || info.ja || pieceType;
    }
    if (notation === "letter") {
      return info.letter || info.code || info.ja || pieceType;
    }
    return info.ja || pieceType;
  }

  function getPieceShortLabel(pieceType) {
    var info = getPieceInfo(pieceType);
    var notation = getPieceNotationMode();
    if (!info) {
      return getPieceShortLabels()[pieceType] || getPieceLabel(pieceType);
    }
    if (notation === "code") {
      return info.code || info.letter || info.kanji || pieceType;
    }
    if (notation === "letter") {
      return info.letter || info.code || info.kanji || pieceType;
    }
    return info.kanji || info.ja || pieceType;
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

  function selectPieceForPreview(pieceId) {
    var piece = getPiece(uiState.state, pieceId);
    if (!piece) {
      return false;
    }
    uiState.selection = { type: "piecePreview", pieceId: piece.id };
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
        els.confirmText.textContent = isInitialStandbyPhase(uiState.state)
          ? "この形で展開図を置きますか？"
          : "\u3053\u306E\u5F62\u3067\u6B20\u7247\u3092\u7F6E\u304D\u307E\u3059\u304B\uFF1F";
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

  function addFragmentPlacementToState(state, player, card, handIndex, cells, shouldRefillHand, sourceInfo) {
    var placementId = "placement-" + (state.placements.length + 1);
    var placement;
    var playerState = ensurePlayerStateContainers(state, player);
    var source = sourceInfo && sourceInfo.source ? sourceInfo.source : "hand";
    var fragmentReserveKey = sourceInfo && sourceInfo.fragmentReserveKey ? sourceInfo.fragmentReserveKey : getFragmentReserveKey(card);
    var j;
    if (source === "fragmentReserve") {
      playerState.fragmentReserve = normalizeFragmentReservePool(playerState.fragmentReserve);
      if (!playerState.fragmentReserve[fragmentReserveKey]) {
        return null;
      }
    }
    placement = {
      id: placementId,
      owner: player,
      card: {
        fragmentType: card.fragmentType,
        pieceType: card.pieceType
      },
      cells: cells.map(function (cell) {
        return { row: cell.row, col: cell.col };
      })
    };
    state.placements.push(placement);

    for (j = 0; j < cells.length; j += 1) {
      var cell = state.board[cells[j].row][cells[j].col];
      cell.controller = player;
      cell.stack.push(placementId);
    }

    if (source === "fragmentReserve") {
      removeFragmentFromReserve(playerState, fragmentReserveKey);
    } else if (typeof handIndex === "number") {
      playerState.hand.splice(handIndex, 1);
      if (shouldRefillHand !== false) {
        fillHand(state, player);
      }
    }
    return placement;
  }

  function startFragmentPlacementAnimation(player, placement) {
    var duration = 0;
    if (window.UNFOLD_3D_RENDERER && typeof window.UNFOLD_3D_RENDERER.startFragmentUnfoldAnimation === "function") {
      duration = window.UNFOLD_3D_RENDERER.startFragmentUnfoldAnimation(player, placement.cells, placement.card.fragmentType, placement.id) || 0;
    }
    return duration;
  }

  function getAnimationNow() {
    if (window.performance && typeof window.performance.now === "function") {
      return window.performance.now();
    }
    return Date.now();
  }

  function isPendingFragmentPieceReady() {
    var pending = uiState.pendingFragmentPiece;
    if (!pending) {
      return false;
    }
    return !pending.readyAt || getAnimationNow() >= pending.readyAt;
  }

  function schedulePendingFragmentReadyRender(readyAt) {
    var delay = Math.max(0, readyAt - getAnimationNow()) + 30;
    window.setTimeout(function () {
      if (uiState.pendingFragmentPiece && uiState.pendingFragmentPiece.readyAt === readyAt) {
        render();
      }
    }, delay);
  }

  function createPendingFragmentPiece(base, animationDuration) {
    var pending = {};
    Object.keys(base).forEach(function (key) {
      pending[key] = base[key];
    });
    if (animationDuration > 0) {
      pending.readyAt = getAnimationNow() + animationDuration;
      schedulePendingFragmentReadyRender(pending.readyAt);
    }
    return pending;
  }

  function finishInitialStandbyPlacement(player, card, placement, pieceCell) {
    var setupComplete;
    var progressText = getInitialStandbyProgressText(uiState.state, player);
    var logText = PLAYER_LABELS[player] + "が初期スタンバイで " + FRAGMENT_LIBRARY[card.fragmentType].label + " を設置 (" + progressText + ")";
    var selectedPieceCell = pieceCell || pickInitialStandbyPieceCell(player, card.pieceType, placement.cells);
    if (selectedPieceCell) {
      addPiece(uiState.state, player, card.pieceType, selectedPieceCell.row, selectedPieceCell.col);
      logText += " / " + getPieceLabel(card.pieceType) + "を配置";
    }
    uiState.pendingFragmentPiece = null;
    uiState.selection = null;
    uiState.pendingAnchor = null;
    uiState.previewCells = [];
    uiState.previewLegal = false;
    uiState.moveTargets = [];
    uiState.reserveTargets = [];
    uiState.recoverPieceTargets = [];
    uiState.recoverFragmentTargets = [];
    pushLog(logText);
    setupComplete = advanceInitialStandbyForState(uiState.state, player);
    resolveBlockedInitialStandbyPenaltiesForState(uiState.state).forEach(function (result) {
      pushLog(formatInitialStandbyPenaltyLog(result));
      setupComplete = setupComplete || result.setupComplete;
    });
    if (setupComplete) {
      pushLog("初期スタンバイ完了。先手の通常手番を開始");
      startClockForCurrentTurn(uiState.state);
    }
    recordHistorySnapshot(uiState.state, setupComplete ? "初期スタンバイ完了" : logText);
    uiState.lastActionText = "";
    uiState.replayIndex = uiState.state.history.length - 1;
    if (!isOnlineGame()) {
      saveLatestReplayArchive(uiState.state);
    }
    render();
    if (isOnlineGame()) {
      pushRoomState();
      return;
    }
    if (isNpcTurn() && !uiState.state.winner) {
      scheduleNpcTurn();
    }
  }

  function finishInitialStandbyPiecePlacement(player, card, handIndex, row, col) {
    var cell = uiState.state.board[row][col];
    var selectedCard;
    var setupComplete;
    if (!isInitialStandbyPhase(uiState.state) || !isInitialStandbyBasePieceRule(uiState.state)) {
      return false;
    }
    if (player !== uiState.state.currentPlayer || !isBaseTerritoryCell(row, col, player) || cell.pieceId) {
      return false;
    }
    selectedCard = moveInitialStandbyCardToHeldFragment(uiState.state, player, handIndex, card);
    if (!selectedCard) {
      return false;
    }
    addPiece(uiState.state, player, selectedCard.pieceType, row, col);
    clearSelection();
    uiState.pendingAnchor = null;
    uiState.previewCells = [];
    uiState.previewLegal = false;
    uiState.moveTargets = [];
    uiState.reserveTargets = [];
    uiState.recoverPieceTargets = [];
    uiState.recoverFragmentTargets = [];
    pushLog(PLAYER_LABELS[player] + "が初期スタンバイで " + getPieceLabel(selectedCard.pieceType) + " を本陣に配置し、" + FRAGMENT_LIBRARY[selectedCard.fragmentType].label + " を持ち展開図に追加");
    setupComplete = advanceInitialStandbyForState(uiState.state, player);
    resolveBlockedInitialStandbyPenaltiesForState(uiState.state).forEach(function (result) {
      pushLog(formatInitialStandbyPenaltyLog(result));
      setupComplete = setupComplete || result.setupComplete;
    });
    if (setupComplete) {
      pushLog("初期スタンバイ完了。先手の通常手番を開始");
      startClockForCurrentTurn(uiState.state);
    }
    recordHistorySnapshot(uiState.state, setupComplete ? "初期スタンバイ完了" : "初期スタンバイ駒配置");
    uiState.lastActionText = "";
    uiState.replayIndex = uiState.state.history.length - 1;
    if (!isOnlineGame()) {
      saveLatestReplayArchive(uiState.state);
    }
    render();
    if (isOnlineGame()) {
      pushRoomState();
      return true;
    }
    if (isNpcTurn() && !uiState.state.winner) {
      scheduleNpcTurn();
    }
    return true;
  }

  function tryInitialStandbyPieceDrop(row, col) {
    if (!uiState.selection || uiState.selection.type !== "setupPiece") {
      return false;
    }
    return finishInitialStandbyPiecePlacement(
      uiState.state.currentPlayer,
      uiState.selection.card,
      uiState.selection.handIndex,
      row,
      col
    );
  }

  function placeInitialStandbyPieceDirect(action) {
    return finishInitialStandbyPiecePlacement(
      uiState.state.currentPlayer,
      action.card,
      action.handIndex,
      action.row,
      action.col
    );
  }

  function commitFragmentPlacement(target) {
    if (!uiState.selection || uiState.selection.type !== "fragment" || !uiState.previewLegal) {
      return;
    }
    var card = uiState.selection.card;
    var isHeldFragment = uiState.selection.source === "fragmentReserve" || !card.pieceType;
    var cells = uiState.previewCells.slice();
    var inInitialStandby = isInitialStandbyPhase(uiState.state);
    var placement;
    hidePlacementConfirm();

    placement = addFragmentPlacementToState(
      uiState.state,
      uiState.state.currentPlayer,
      card,
      uiState.selection.handIndex,
      cells,
      false,
      uiState.selection
    );
    if (!placement) {
      hidePlacementConfirm();
      render();
      return;
    }
    var animationDuration = startFragmentPlacementAnimation(uiState.state.currentPlayer, placement);
    if (inInitialStandby) {
      uiState.pendingFragmentPiece = createPendingFragmentPiece({
        pieceType: card.pieceType,
        cells: placement.cells,
        initialStandby: {
          player: uiState.state.currentPlayer,
          card: card,
          placement: placement
        }
      }, animationDuration);
      uiState.selection = { type: "fragmentPiece", pieceType: card.pieceType };
      uiState.pendingAnchor = null;
      uiState.previewCells = [];
      uiState.previewLegal = false;
      uiState.moveTargets = [];
      uiState.reserveTargets = [];
      uiState.recoverPieceTargets = [];
      uiState.recoverFragmentTargets = [];
      render();
      return;
    }
    if (isHeldFragment) {
      uiState.selection = null;
      uiState.pendingAnchor = null;
      uiState.previewCells = [];
      uiState.previewLegal = false;
      uiState.moveTargets = [];
      uiState.reserveTargets = [];
      uiState.recoverPieceTargets = [];
      uiState.recoverFragmentTargets = [];
      pushLog(PLAYER_LABELS[uiState.state.currentPlayer] + "\u304C " + FRAGMENT_LIBRARY[card.fragmentType].label + " \u3092\u914D\u7F6E");
      endTurn();
      return;
    }
    uiState.pendingFragmentPiece = createPendingFragmentPiece({
      pieceType: card.pieceType,
      cells: placement.cells,
      refillHandPlayer: uiState.selection.source === "fragmentReserve" ? null : uiState.state.currentPlayer
    }, animationDuration);
    uiState.selection = { type: "fragmentPiece", pieceType: card.pieceType };
    uiState.pendingAnchor = null;
    uiState.previewCells = [];
    uiState.previewLegal = false;
    pushLog(PLAYER_LABELS[uiState.state.currentPlayer] + "\u304C " + FRAGMENT_LIBRARY[card.fragmentType].label + " \u3092\u914D\u7F6E");
    render();
  }

  function placeFragmentDirect(card, handIndex, cells, pieceRow, pieceCol, source, fragmentReserveKey) {
    var isHeldFragment = source === "fragmentReserve" || !card.pieceType;
    var shouldRefillAfterPiece = source !== "fragmentReserve" && !!card.pieceType;
    var placement = addFragmentPlacementToState(
      uiState.state,
      uiState.state.currentPlayer,
      card,
      handIndex,
      cells,
      false,
      { source: source || "hand", fragmentReserveKey: fragmentReserveKey }
    );
    if (!placement) {
      uiState.npc.thinking = false;
      render();
      return;
    }
    var animationDuration = startFragmentPlacementAnimation(uiState.state.currentPlayer, placement);
    pushLog(PLAYER_LABELS[uiState.state.currentPlayer] + "\u304C " + FRAGMENT_LIBRARY[card.fragmentType].label + " \u3092\u914D\u7F6E");

    if (isHeldFragment) {
      uiState.pendingFragmentPiece = null;
      uiState.npc.thinking = false;
      endTurn();
      return;
    }

    uiState.pendingFragmentPiece = createPendingFragmentPiece({
      pieceType: card.pieceType,
      cells: placement.cells
    }, animationDuration);
    render();

    uiState.npc.timer = window.setTimeout(function () {
      uiState.npc.timer = null;
      var pieceId = addPiece(uiState.state, uiState.state.currentPlayer, card.pieceType, pieceRow, pieceCol);
      if (window.UNFOLD_3D_RENDERER && typeof window.UNFOLD_3D_RENDERER.startPiecePlacementAnimation === "function") {
        window.UNFOLD_3D_RENDERER.startPiecePlacementAnimation(pieceId, pieceRow, pieceCol);
      }
      if (shouldRefillAfterPiece) {
        fillHand(uiState.state, uiState.state.currentPlayer);
      }
      pushLog(PLAYER_LABELS[uiState.state.currentPlayer] + "\u304C " + getPieceLabel(card.pieceType) + " \u3092 (" + (pieceRow + 1) + ", " + (pieceCol + 1) + ") \u306B\u914D\u7F6E");
      uiState.pendingFragmentPiece = null;
      uiState.npc.thinking = false;
      endTurn();
      }, Math.max(1180, animationDuration + 140));
  }

  function placeInitialStandbyFragmentDirect(action) {
    var player = uiState.state.currentPlayer;
    var placement = addFragmentPlacementToState(uiState.state, player, action.card, action.handIndex, action.cells, false);
    var pieceCell = action.pieceCell || pickInitialStandbyPieceCell(player, action.card.pieceType, placement.cells);
    var animationDuration = startFragmentPlacementAnimation(player, placement);
    if (animationDuration > 0) {
      render();
      uiState.npc.timer = window.setTimeout(function () {
        uiState.npc.timer = null;
        finishInitialStandbyPlacement(player, action.card, placement, pieceCell);
      }, animationDuration + 140);
      return;
    }
    finishInitialStandbyPlacement(player, action.card, placement, pieceCell);
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
    if (pending.initialStandby) {
      hidePlacementConfirm();
      finishInitialStandbyPlacement(
        pending.initialStandby.player,
        pending.initialStandby.card,
        pending.initialStandby.placement,
        { row: row, col: col }
      );
      return;
    }
    pieceId = addPiece(uiState.state, uiState.state.currentPlayer, pending.pieceType, row, col);
    if (window.UNFOLD_3D_RENDERER && typeof window.UNFOLD_3D_RENDERER.startPiecePlacementAnimation === "function") {
      window.UNFOLD_3D_RENDERER.startPiecePlacementAnimation(pieceId, row, col);
    }
    if (pending.refillHandPlayer) {
      fillHand(uiState.state, pending.refillHandPlayer);
    }
    pushLog(PLAYER_LABELS[uiState.state.currentPlayer] + "\u304C " + getPieceLabel(pending.pieceType) + " \u3092 (" + (row + 1) + ", " + (col + 1) + ") \u306B\u914D\u7F6E");
    hidePlacementConfirm();
    uiState.pendingFragmentPiece = null;
    endTurn();
  }

  function updateFragmentPreview(row, col, shouldRender) {
    var card = uiState.selection && uiState.selection.card;
    var preview = card ? getFragmentCells(card.fragmentType, uiState.rotation, { row: row, col: col }) : [];
    var legal = card ? isLegalFragment(preview, uiState.state.currentPlayer) : false;
    if (legal && isInitialStandbyPhase(uiState.state)) {
      legal = doesInitialSetupActionKeepCompletion(uiState.state.currentPlayer, {
        type: "setupFragment",
        handIndex: uiState.selection.handIndex,
        card: card,
        rotation: uiState.rotation,
        anchor: { row: row, col: col },
        cells: preview
      });
    }
    uiState.pendingAnchor = { row: row, col: col };
    uiState.previewCells = preview;
    uiState.previewLegal = legal;
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
    addFragmentToReserve(uiState.state.players[player], {
      fragmentType: placement.card.fragmentType
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
      var cell;
      var piece;
      var d;
      var nr;
      var nc;
      if (row < 0 || row >= BOARD_ROWS || col < 0 || col >= BOARD_COLS) {
        return false;
      }
      cell = uiState.state.board[row][col];
      if (cell.controller === player) {
        return false;
      }
      piece = cell.pieceId ? getPiece(uiState.state, cell.pieceId) : null;
      if (piece && piece.owner !== player) {
        return false;
      }
      for (d = 0; d < CARDINAL_DIRS.length; d += 1) {
        nr = row + CARDINAL_DIRS[d][0];
        nc = col + CARDINAL_DIRS[d][1];
        if (nr >= 0 && nr < BOARD_ROWS && nc >= 0 && nc < BOARD_COLS) {
          if (uiState.state.board[nr][nc].controller === player) {
            touches = true;
          }
        }
      }
    }
    if (isInitialStandbyPhase(uiState.state)
      && !doesFragmentTouchBaseTerritory(cells, player)) {
      return false;
    }
    return touches;
  }

  function getNormalizedFragmentShape(fragmentType, rotation) {
    var normalizedRotation = ((rotation % 4) + 4) % 4;
    var key = fragmentType + ":" + normalizedRotation;
    var fragment;
    var rotated;
    var minRow = Infinity;
    var minCol = Infinity;
    var maxRow = 0;
    var maxCol = 0;
    var shape;
    var r;
    var i;
    if (FRAGMENT_SHAPE_CACHE[key]) {
      return FRAGMENT_SHAPE_CACHE[key];
    }
    fragment = FRAGMENT_LIBRARY[fragmentType];
    if (!fragment) {
      shape = { cells: [], maxRow: 0, maxCol: 0 };
      FRAGMENT_SHAPE_CACHE[key] = shape;
      return shape;
    }
    rotated = fragment.cells.map(function (cell) { return [cell[0], cell[1]]; });
    for (r = 0; r < normalizedRotation; r += 1) {
      rotated = rotated.map(function (cell) {
        return [cell[1], -cell[0]];
      });
    }
    for (i = 0; i < rotated.length; i += 1) {
      minRow = Math.min(minRow, rotated[i][0]);
      minCol = Math.min(minCol, rotated[i][1]);
    }
    shape = {
      cells: rotated.map(function (cell) {
        var normalized = { row: cell[0] - minRow, col: cell[1] - minCol };
        maxRow = Math.max(maxRow, normalized.row);
        maxCol = Math.max(maxCol, normalized.col);
        return normalized;
      }),
      maxRow: 0,
      maxCol: 0
    };
    shape.maxRow = maxRow;
    shape.maxCol = maxCol;
    FRAGMENT_SHAPE_CACHE[key] = shape;
    return shape;
  }

  function getFragmentCells(fragmentType, rotation, anchor) {
    var shape = getNormalizedFragmentShape(fragmentType, rotation);
    return shape.cells.map(function (cell) {
      return { row: anchor.row + cell.row, col: anchor.col + cell.col };
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

  function normalizeNpcStrategy(value) {
    var key = String(value || "balanced").toLowerCase();
    if (key === "attack" || key === "attacker" || key === "win" || key === "winning") {
      return "attack";
    }
    if (key === "defense" || key === "defender" || key === "guard" || key === "protect") {
      return "defense";
    }
    return "balanced";
  }

  function getNpcStrategy(player) {
    var map = uiState.npc.strategyByPlayer || {};
    return normalizeNpcStrategy(map[player] || "balanced");
  }

  function normalizeNpcLookaheadDepth(value) {
    var depth = Number(value) || 1;
    if (depth < 1) {
      return 1;
    }
    return Math.min(5, Math.floor(depth));
  }

  function createSelfPlayStrategyMap(options) {
    var profile = String(options && options.strategyProfile || options && options.strategy || "").toLowerCase();
    var p1Default = "balanced";
    var p2Default = "balanced";
    if (profile === "attack-defense" || profile === "attacker-defender" || profile === "win-guard") {
      p1Default = "attack";
      p2Default = "defense";
    }
    return {
      P1: normalizeNpcStrategy(options && options.p1Strategy || p1Default),
      P2: normalizeNpcStrategy(options && options.p2Strategy || p2Default)
    };
  }

  function getSelfPlayStrategyLabel(strategies) {
    var map = strategies || {};
    return "P1:" + normalizeNpcStrategy(map.P1) + " / P2:" + normalizeNpcStrategy(map.P2);
  }

  var npcEvalCache = typeof WeakMap === "function" ? new WeakMap() : null;
  var activeNpcSearchCache = null;
  var activeNpcSearchRootPlayer = null;
  var activeNpcSearchDeadlineAt = 0;
  var activeNpcSearchNodeCount = 0;
  var activeNpcSearchAborted = false;
  var NPC_PERSISTENT_TT_MAX_ENTRIES = 9000;
  var NPC_HISTORY_MAX_SCORE = 260000;
  var npcPersistentSearchTable = {};
  var npcPersistentSearchKeys = [];
  var npcPersistentSearchDirtyKeys = {};
  var npcSearchHistoryScores = {};
  var npcSearchMemoryLoaded = false;
  var npcSearchMemoryFlushTimer = null;
  var npcSearchMemoryLastFlushAt = 0;

  function isNpcSearchMemoryStorageAvailable() {
    return typeof window !== "undefined"
      && !window.__UNFOLD_NPC_WORKER__
      && window.localStorage;
  }

  function normalizeNpcSearchMemoryEntry(entry) {
    var score;
    var flag;
    if (!entry || typeof entry !== "object") {
      return null;
    }
    score = Number(entry.score);
    if (!isFinite(score)) {
      return null;
    }
    flag = entry.flag === "lower" || entry.flag === "upper" ? entry.flag : "exact";
    return {
      score: score,
      flag: flag,
      bestActionKey: String(entry.bestActionKey || "").slice(0, 260)
    };
  }

  function trimNpcPersistentSearchTable(maxEntries) {
    var limit = Math.max(20, Number(maxEntries) || NPC_PERSISTENT_TT_MAX_ENTRIES);
    while (npcPersistentSearchKeys.length > limit) {
      var key = npcPersistentSearchKeys.shift();
      delete npcPersistentSearchTable[key];
      delete npcPersistentSearchDirtyKeys[key];
    }
  }

  function importNpcSearchMemorySnapshot(snapshot, options) {
    var imported = 0;
    var maxEntries = options && options.maxEntries ? options.maxEntries : NPC_PERSISTENT_TT_MAX_ENTRIES;
    var markDirty = !!(options && options.markDirty);
    if (!snapshot || typeof snapshot !== "object") {
      return 0;
    }
    if (snapshot.version && snapshot.version !== NPC_SEARCH_MEMORY_VERSION) {
      return 0;
    }
    (Array.isArray(snapshot.entries) ? snapshot.entries : []).forEach(function (pair) {
      var key;
      var entry;
      if (!Array.isArray(pair) || typeof pair[0] !== "string") {
        return;
      }
      key = pair[0];
      entry = normalizeNpcSearchMemoryEntry(pair[1]);
      if (!key || !entry) {
        return;
      }
      if (!Object.prototype.hasOwnProperty.call(npcPersistentSearchTable, key)) {
        npcPersistentSearchKeys.push(key);
      }
      npcPersistentSearchTable[key] = entry;
      if (markDirty) {
        npcPersistentSearchDirtyKeys[key] = true;
      }
      imported += 1;
    });
    if (snapshot.historyScores && typeof snapshot.historyScores === "object") {
      Object.keys(snapshot.historyScores).slice(0, NPC_SEARCH_MEMORY_MAX_STORAGE_HISTORY).forEach(function (key) {
        var value = Number(snapshot.historyScores[key]);
        if (isFinite(value) && value > 0) {
          npcSearchHistoryScores[key] = Math.min(NPC_HISTORY_MAX_SCORE, Math.max(npcSearchHistoryScores[key] || 0, value));
        }
      });
    }
    trimNpcPersistentSearchTable(maxEntries);
    return imported;
  }

  function exportNpcSearchMemorySnapshot(options) {
    var dirtyOnly = !!(options && options.dirtyOnly);
    var clearDirty = !!(options && options.clearDirty);
    var maxEntries = Math.max(1, Number(options && options.maxEntries) || NPC_SEARCH_MEMORY_MAX_STORAGE_ENTRIES);
    var sourceKeys = dirtyOnly ? Object.keys(npcPersistentSearchDirtyKeys) : npcPersistentSearchKeys.slice();
    var entries = [];
    var historyScores = {};
    sourceKeys.slice(Math.max(0, sourceKeys.length - maxEntries)).forEach(function (key) {
      var entry = normalizeNpcSearchMemoryEntry(npcPersistentSearchTable[key]);
      if (!entry) {
        delete npcPersistentSearchDirtyKeys[key];
        return;
      }
      entries.push([key, entry]);
      if (clearDirty) {
        delete npcPersistentSearchDirtyKeys[key];
      }
    });
    Object.keys(npcSearchHistoryScores).sort(function (a, b) {
      return (npcSearchHistoryScores[b] || 0) - (npcSearchHistoryScores[a] || 0);
    }).slice(0, NPC_SEARCH_MEMORY_MAX_STORAGE_HISTORY).forEach(function (key) {
      historyScores[key] = npcSearchHistoryScores[key];
    });
    if (!entries.length && !Object.keys(historyScores).length) {
      return null;
    }
    return {
      version: NPC_SEARCH_MEMORY_VERSION,
      savedAt: new Date().toISOString(),
      entries: entries,
      historyScores: historyScores
    };
  }

  function loadNpcSearchMemoryFromStorage() {
    var raw;
    if (npcSearchMemoryLoaded || !isNpcSearchMemoryStorageAvailable()) {
      return;
    }
    npcSearchMemoryLoaded = true;
    try {
      raw = window.localStorage.getItem(NPC_SEARCH_MEMORY_STORAGE_KEY);
      if (raw) {
        importNpcSearchMemorySnapshot(JSON.parse(raw), {
          maxEntries: NPC_PERSISTENT_TT_MAX_ENTRIES,
          markDirty: false
        });
      }
    } catch (error) {
      // Invalid or unavailable storage should never block an NPC turn.
    }
  }

  function saveNpcSearchMemoryToStorage() {
    var snapshot;
    var attempts;
    if (!isNpcSearchMemoryStorageAvailable()) {
      return false;
    }
    loadNpcSearchMemoryFromStorage();
    for (attempts = 0; attempts < 4; attempts += 1) {
      snapshot = exportNpcSearchMemorySnapshot({
        dirtyOnly: false,
        clearDirty: false,
        maxEntries: Math.max(40, Math.floor(NPC_SEARCH_MEMORY_MAX_STORAGE_ENTRIES / Math.pow(2, attempts)))
      });
      try {
        if (snapshot) {
          window.localStorage.setItem(NPC_SEARCH_MEMORY_STORAGE_KEY, JSON.stringify(snapshot));
        }
        npcSearchMemoryLastFlushAt = Date.now();
        return true;
      } catch (error) {
        trimNpcPersistentSearchTable(Math.max(40, Math.floor(npcPersistentSearchKeys.length / 2)));
      }
    }
    return false;
  }

  function scheduleNpcSearchMemoryFlush() {
    var elapsed;
    if (!isNpcSearchMemoryStorageAvailable() || npcSearchMemoryFlushTimer) {
      return;
    }
    elapsed = Date.now() - npcSearchMemoryLastFlushAt;
    npcSearchMemoryFlushTimer = window.setTimeout(function () {
      npcSearchMemoryFlushTimer = null;
      saveNpcSearchMemoryToStorage();
    }, Math.max(120, NPC_SEARCH_MEMORY_FLUSH_INTERVAL_MS - elapsed));
  }

  function mergeNpcSearchMemoryFromWorker(snapshot) {
    if (!snapshot) {
      return;
    }
    loadNpcSearchMemoryFromStorage();
    importNpcSearchMemorySnapshot(snapshot, {
      maxEntries: NPC_PERSISTENT_TT_MAX_ENTRIES,
      markDirty: true
    });
    saveNpcSearchMemoryToStorage();
  }

  function getCachedNpcEvalMetric(state, player, key, compute) {
    var stateCache;
    var cacheKey;
    if (!npcEvalCache || !state) {
      return compute();
    }
    stateCache = npcEvalCache.get(state);
    if (!stateCache) {
      stateCache = {};
      npcEvalCache.set(state, stateCache);
    }
    cacheKey = player + ":" + key;
    if (!Object.prototype.hasOwnProperty.call(stateCache, cacheKey)) {
      stateCache[cacheKey] = compute();
    }
    return stateCache[cacheKey];
  }

  function createNpcSearchCache() {
    return {
      stateKeys: typeof WeakMap === "function" ? new WeakMap() : null,
      actions: {},
      immediateWins: {},
      threatCreation: {},
      evaluations: {},
      attackMaps: {},
      dangerMaps: {},
      defenseSnapshots: {},
      legalMoves: {},
      fragmentPlacements: {},
      kingThreats: {},
      baseOverwrites: {},
      searchScores: {},
      searchBounds: {},
      killerMoves: {}
    };
  }

  function withNpcSearchCache(callback) {
    var previousCache;
    if (activeNpcSearchCache) {
      return callback();
    }
    loadNpcSearchMemoryFromStorage();
    previousCache = activeNpcSearchCache;
    activeNpcSearchCache = createNpcSearchCache();
    try {
      return callback();
    } finally {
      activeNpcSearchCache = previousCache;
    }
  }

  function getNpcSearchTimestampMs() {
    return Date.now();
  }

  function getNpcSearchTimeBudgetMs(depth, emergencyMode) {
    var normalizedDepth = normalizeNpcLookaheadDepth(depth);
    if (normalizedDepth < 5) {
      return 0;
    }
    if (uiState.npc && uiState.npc.bulkSelfPlay) {
      return emergencyMode ? 1800 : 1200;
    }
    if (window.__UNFOLD_NPC_WORKER__) {
      return emergencyMode ? 12000 : 8500;
    }
    return emergencyMode ? 6500 : 4500;
  }

  function shouldStopNpcSearchForBudget() {
    if (activeNpcSearchAborted) {
      return !!activeNpcSearchAborted;
    }
    if (activeNpcSearchRootPlayer) {
      activeNpcSearchNodeCount += 1;
    }
    if (!activeNpcSearchDeadlineAt) {
      return false;
    }
    if (activeNpcSearchNodeCount % 8 !== 0) {
      return false;
    }
    if (getNpcSearchTimestampMs() >= activeNpcSearchDeadlineAt) {
      activeNpcSearchAborted = true;
      return true;
    }
    return false;
  }

  function getCardSearchKey(card) {
    if (!card) {
      return "";
    }
    return [
      card.fragmentType || "",
      card.pieceType || "",
      card.id || "",
      card.key || "",
      card.name || ""
    ].join("/");
  }

  function getReserveSearchKey(reserve) {
    if (!reserve) {
      return "";
    }
    return Object.keys(reserve).sort().map(function (key) {
      return key + ":" + reserve[key];
    }).join(",");
  }

  function getFragmentReserveSearchKey(fragmentReserve) {
    if (!fragmentReserve) {
      return "";
    }
    return Object.keys(fragmentReserve).sort().map(function (key) {
      var value = fragmentReserve[key];
      if (Array.isArray(value)) {
        return key + ":" + value.map(getCardSearchKey).join(".");
      }
      if (value && typeof value === "object") {
        return key + ":" + getCardSearchKey(value.card || value);
      }
      return key + ":" + String(value);
    }).join(",");
  }

  function getNpcSearchStateKey(state) {
    var boardTokens = [];
    var pieceTokens = [];
    var placementTokens = [];
    var playerTokens = [];
    var setup;
    var setupPlaced;
    var row;
    var col;
    if (!state) {
      return "null";
    }
    setup = state.initialSetup || {};
    setupPlaced = setup.placed || {};
    ["P1", "P2"].forEach(function (side) {
      var playerState = state.players[side];
      Object.keys(playerState.pieces).sort().forEach(function (pieceId) {
        var piece = playerState.pieces[pieceId];
        pieceTokens.push([
          pieceId,
          piece.kind || "",
          piece.owner || side,
          piece.row,
          piece.col
        ].join(":"));
      });
      playerTokens.push([
        side,
        (playerState.hand || []).map(getCardSearchKey).join("."),
        (playerState.deck || []).map(getCardSearchKey).join("."),
        getReserveSearchKey(playerState.reserve),
        getFragmentReserveSearchKey(playerState.fragmentReserve)
      ].join("|"));
    });
    for (row = 0; row < BOARD_ROWS; row += 1) {
      for (col = 0; col < BOARD_COLS; col += 1) {
        var cell = state.board[row][col];
        if (cell.pieceId || cell.controller || cell.stack.length) {
          boardTokens.push([
            row,
            col,
            cell.controller || "",
            cell.pieceId || "",
            cell.stack.join(".")
          ].join(":"));
        }
      }
    }
    (state.placements || []).slice().sort(function (a, b) {
      return a.id.localeCompare(b.id);
    }).forEach(function (placement) {
      placementTokens.push([
        placement.id,
        placement.owner,
        getCardSearchKey(placement.card),
        (placement.cells || []).map(function (cell) {
          return cell.row + "," + cell.col;
        }).join(".")
      ].join(":"));
    });
    return [
      state.ruleMode || "",
      BOARD_ROWS + "x" + BOARD_COLS,
      state.phase || "",
      state.currentPlayer || "",
      state.turnNumber || 0,
      state.winner || "",
      setup.index || 0,
      setupPlaced.P1 || 0,
      setupPlaced.P2 || 0,
      pieceTokens.join(";"),
      playerTokens.join(";"),
      boardTokens.join(";"),
      placementTokens.join(";")
    ].join("||");
  }

  function getCachedNpcSearchStateKey(state) {
    var cache = activeNpcSearchCache;
    var key;
    if (!cache || !state) {
      return getNpcSearchStateKey(state);
    }
    if (cache.stateKeys) {
      key = cache.stateKeys.get(state);
      if (!key) {
        key = getNpcSearchStateKey(state);
        cache.stateKeys.set(state, key);
      }
      return key;
    }
    return getNpcSearchStateKey(state);
  }

  function getNpcSearchCachedValue(bucketName, key, compute) {
    var bucket;
    if (!activeNpcSearchCache) {
      return compute();
    }
    bucket = activeNpcSearchCache[bucketName];
    if (!Object.prototype.hasOwnProperty.call(bucket, key)) {
      bucket[key] = compute();
    }
    return bucket[key];
  }

  function getNpcActionSearchKey(action) {
    if (!action) {
      return "";
    }
    if (action.type === "move") {
      return "m:" + action.pieceId + ":" + action.row + ":" + action.col;
    }
    if (action.type === "reserve") {
      return "r:" + action.pieceType + ":" + action.row + ":" + action.col;
    }
    if (action.type === "fragment" || action.type === "setupFragment") {
      return [
        action.type === "setupFragment" ? "sf" : "f",
        action.source || "hand",
        typeof action.handIndex === "number" ? action.handIndex : "",
        action.fragmentReserveKey || "",
        action.card ? getCardSearchKey(action.card) : "",
        action.rotation || 0,
        action.anchor ? action.anchor.row : "",
        action.anchor ? action.anchor.col : "",
        action.pieceCell ? action.pieceCell.row : "",
        action.pieceCell ? action.pieceCell.col : ""
      ].join(":");
    }
    if (action.type === "recoverPiece") {
      return "rp:" + action.pieceId;
    }
    if (action.type === "recoverFragment") {
      return "rf:" + action.placementId;
    }
    if (action.type === "mulligan") {
      return "mu";
    }
    return action.type || "";
  }

  function getNpcActionHistoryKey(state, player, action) {
    var phase = getNpcGamePhase(state);
    var strategy = getNpcStrategy(player);
    var piece;
    var card;
    if (!action) {
      return player + ":none";
    }
    if (action.type === "move") {
      piece = getPiece(state, action.pieceId);
      return [player, strategy, phase, "move", piece ? piece.kind : "", action.row, action.col].join(":");
    }
    if (action.type === "reserve") {
      return [player, strategy, phase, "reserve", action.pieceType, action.row, action.col].join(":");
    }
    if (action.type === "fragment" || action.type === "setupFragment") {
      card = action.card || {};
      return [
        player,
        strategy,
        phase,
        action.type,
        action.source || "hand",
        card.fragmentType || "",
        card.pieceType || "",
        action.rotation || 0,
        action.pieceCell ? "piece" : "noPiece"
      ].join(":");
    }
    return [player, strategy, phase, action.type || ""].join(":");
  }

  function getNpcHistoryScore(state, player, action) {
    var key = getNpcActionHistoryKey(state, player, action);
    return npcSearchHistoryScores[key] || 0;
  }

  function recordNpcHistorySuccess(state, player, action, depth, amount) {
    var key;
    var value;
    if (!state || !action || !player) {
      return;
    }
    key = getNpcActionHistoryKey(state, player, action);
    value = npcSearchHistoryScores[key] || 0;
    value += (amount || 1) * Math.max(1, depth || 1) * Math.max(1, depth || 1);
    npcSearchHistoryScores[key] = Math.min(NPC_HISTORY_MAX_SCORE, value);
    scheduleNpcSearchMemoryFlush();
  }

  function recordNpcKillerMove(state, player, action, depth) {
    var key;
    var moveKey;
    var bucket;
    if (!activeNpcSearchCache || !state || !action || !player || !depth) {
      return;
    }
    key = player + "|d" + depth;
    moveKey = getNpcActionSearchKey(action);
    bucket = activeNpcSearchCache.killerMoves[key] || [];
    if (bucket.indexOf(moveKey) !== -1) {
      return;
    }
    bucket.unshift(moveKey);
    activeNpcSearchCache.killerMoves[key] = bucket.slice(0, 2);
  }

  function isNpcKillerMove(state, player, action, depth) {
    var key;
    var bucket;
    if (!activeNpcSearchCache || !state || !action || !player || !depth) {
      return false;
    }
    key = player + "|d" + depth;
    bucket = activeNpcSearchCache.killerMoves[key] || [];
    return bucket.indexOf(getNpcActionSearchKey(action)) !== -1;
  }

  function shouldUseNpcPersistentSearchTable() {
    return !!activeNpcSearchCache && !uiState.npc.bulkSelfPlay;
  }

  function readNpcPersistentSearchEntry(cacheKey) {
    if (!shouldUseNpcPersistentSearchTable() || !cacheKey) {
      return null;
    }
    return npcPersistentSearchTable[cacheKey] || null;
  }

  function writeNpcPersistentSearchEntry(cacheKey, entry) {
    if (!shouldUseNpcPersistentSearchTable() || !cacheKey || !entry) {
      return;
    }
    if (!Object.prototype.hasOwnProperty.call(npcPersistentSearchTable, cacheKey)) {
      npcPersistentSearchKeys.push(cacheKey);
    }
    npcPersistentSearchTable[cacheKey] = entry;
    npcPersistentSearchDirtyKeys[cacheKey] = true;
    trimNpcPersistentSearchTable(NPC_PERSISTENT_TT_MAX_ENTRIES);
    scheduleNpcSearchMemoryFlush();
  }

  function collectNpcActionsForStateCached(state, player) {
    var key;
    if (!activeNpcSearchCache) {
      return collectNpcActionsForState(state, player);
    }
    key = getCachedNpcSearchStateKey(state) + "|actions|" + player;
    return getNpcSearchCachedValue("actions", key, function () {
      return collectNpcActionsForState(state, player);
    }).slice();
  }

  function findImmediateWinningActionsInStateCached(state, player, limit) {
    var key;
    if (!activeNpcSearchCache) {
      return findImmediateWinningActionsInState(state, player, limit);
    }
    key = getCachedNpcSearchStateKey(state) + "|wins|" + player;
    return getNpcSearchCachedValue("immediateWins", key, function () {
      return findImmediateWinningActionsInState(state, player, 64);
    }).slice(0, limit || 12);
  }

  function countImmediateWinningActionsInStateCached(state, player, limit) {
    return findImmediateWinningActionsInStateCached(state, player, limit).length;
  }

  function countImmediateThreatCreatingActionsInStateCached(state, attacker, limit) {
    var key;
    if (!activeNpcSearchCache) {
      return countImmediateThreatCreatingActionsInState(state, attacker, limit);
    }
    key = getCachedNpcSearchStateKey(state) + "|threat|" + attacker + "|" + (limit || 0);
    return getNpcSearchCachedValue("threatCreation", key, function () {
      return countImmediateThreatCreatingActionsInState(state, attacker, limit);
    });
  }

  function evaluateStateForNpcCached(state, player) {
    var key;
    if (!activeNpcSearchCache) {
      return evaluateStateForNpc(state, player);
    }
    key = getCachedNpcSearchStateKey(state) + "|eval|" + player + "|" + getNpcStrategy("P1") + "|" + getNpcStrategy("P2");
    return getNpcSearchCachedValue("evaluations", key, function () {
      return evaluateStateForNpc(state, player);
    });
  }

  function getDangerMapForStateCached(state, player) {
    var key;
    if (!activeNpcSearchCache) {
      return getDangerMapForState(state, player);
    }
    key = getCachedNpcSearchStateKey(state) + "|danger|" + player;
    return getNpcSearchCachedValue("dangerMaps", key, function () {
      return getDangerMapForState(state, player);
    });
  }

  function getAttackMapForStateCached(state, player) {
    var key;
    if (!activeNpcSearchCache) {
      return getAttackMapForState(state, player);
    }
    key = getCachedNpcSearchStateKey(state) + "|attack|" + player;
    return getNpcSearchCachedValue("attackMaps", key, function () {
      return getAttackMapForState(state, player);
    });
  }

  function getDefenseSnapshotCached(state, player) {
    var key;
    if (!activeNpcSearchCache) {
      return getDefenseSnapshot(state, player);
    }
    key = getCachedNpcSearchStateKey(state) + "|defense|" + player;
    return getNpcSearchCachedValue("defenseSnapshots", key, function () {
      return getDefenseSnapshot(state, player);
    });
  }

  function isKingUnderThreatInStateCached(state, player) {
    var key;
    if (!activeNpcSearchCache) {
      return isKingUnderThreatInState(state, player);
    }
    key = getCachedNpcSearchStateKey(state) + "|kingThreat|" + player;
    return getNpcSearchCachedValue("kingThreats", key, function () {
      return isKingUnderThreatInState(state, player);
    });
  }

  function canPlayerOverwriteBaseCenterInStateCached(state, attacker, defender) {
    var key;
    if (!activeNpcSearchCache) {
      return canPlayerOverwriteBaseCenterInState(state, attacker, defender);
    }
    key = getCachedNpcSearchStateKey(state) + "|baseOverwrite|" + attacker + "|" + defender;
    return getNpcSearchCachedValue("baseOverwrites", key, function () {
      return canPlayerOverwriteBaseCenterInState(state, attacker, defender);
    });
  }

  function readNpcSearchBound(cacheKey, alpha, beta) {
    var entry;
    if (!activeNpcSearchCache || !cacheKey || !activeNpcSearchCache.searchBounds) {
      return null;
    }
    entry = activeNpcSearchCache.searchBounds[cacheKey];
    if (!entry) {
      entry = readNpcPersistentSearchEntry(cacheKey);
    }
    if (!entry) {
      return null;
    }
    if (entry.flag === "exact") {
      return { hit: true, score: entry.score, alpha: alpha, beta: beta, bestActionKey: entry.bestActionKey || "" };
    }
    if (entry.flag === "lower") {
      alpha = Math.max(alpha, entry.score);
    } else if (entry.flag === "upper") {
      beta = Math.min(beta, entry.score);
    }
    if (alpha >= beta) {
      return { hit: true, score: entry.score, alpha: alpha, beta: beta, bestActionKey: entry.bestActionKey || "" };
    }
    return { hit: false, score: entry.score, alpha: alpha, beta: beta, bestActionKey: entry.bestActionKey || "" };
  }

  function writeNpcSearchBound(cacheKey, score, alphaOriginal, betaOriginal, bestActionKey) {
    var flag = "exact";
    var entry;
    if (!activeNpcSearchCache || !cacheKey || !activeNpcSearchCache.searchBounds) {
      return;
    }
    if (score <= alphaOriginal) {
      flag = "upper";
    } else if (score >= betaOriginal) {
      flag = "lower";
    }
    entry = {
      score: score,
      flag: flag,
      bestActionKey: bestActionKey || ""
    };
    activeNpcSearchCache.searchBounds[cacheKey] = entry;
    writeNpcPersistentSearchEntry(cacheKey, entry);
    if (flag === "exact") {
      activeNpcSearchCache.searchScores[cacheKey] = score;
    }
  }

  function writeNpcSearchExact(cacheKey, score, bestActionKey) {
    var entry;
    if (!activeNpcSearchCache || !cacheKey) {
      return;
    }
    activeNpcSearchCache.searchScores[cacheKey] = score;
    if (activeNpcSearchCache.searchBounds) {
      entry = {
        score: score,
        flag: "exact",
        bestActionKey: bestActionKey || ""
      };
      activeNpcSearchCache.searchBounds[cacheKey] = entry;
      writeNpcPersistentSearchEntry(cacheKey, entry);
    }
  }

  function getNpcGamePhase(state) {
    var turn = state && state.turnNumber ? state.turnNumber : 1;
    var p1Deck = state && state.players && state.players.P1 && state.players.P1.deck ? state.players.P1.deck.length : 0;
    var p2Deck = state && state.players && state.players.P2 && state.players.P2.deck ? state.players.P2.deck.length : 0;
    if (state && isInitialStandbyPhase(state)) {
      return "setup";
    }
    if (turn <= 10) {
      return "early";
    }
    if (turn >= 60 || Math.min(p1Deck, p2Deck) <= 5) {
      return "late";
    }
    return "mid";
  }

  function getNpcPhaseWeights(strategy, phase) {
    if (uiState.npc && uiState.npc.bulkSelfPlay) {
      return { attack: 1, defense: 1, closing: 1, recovery: 1, counter: 1 };
    }
    var table = {
      attack: {
        setup: { attack: 0.95, defense: 0.95, closing: 0.55, recovery: 0.25, counter: 0.9 },
        early: { attack: 1.1, defense: 0.82, closing: 0.85, recovery: 0.3, counter: 0.95 },
        mid: { attack: 1.18, defense: 0.86, closing: 1.18, recovery: 0.35, counter: 0.98 },
        late: { attack: 1.32, defense: 0.82, closing: 1.45, recovery: 0.28, counter: 1.05 }
      },
      defense: {
        setup: { attack: 0.68, defense: 1.48, closing: 0.46, recovery: 0.72, counter: 1.08 },
        early: { attack: 0.82, defense: 1.38, closing: 0.68, recovery: 0.74, counter: 1.18 },
        mid: { attack: 1.0, defense: 1.18, closing: 1.0, recovery: 0.82, counter: 1.24 },
        late: { attack: 1.16, defense: 0.92, closing: 1.28, recovery: 0.58, counter: 1.28 }
      },
      balanced: {
        setup: { attack: 0.72, defense: 1.24, closing: 0.5, recovery: 0.48, counter: 1.0 },
        early: { attack: 0.86, defense: 1.18, closing: 0.72, recovery: 0.52, counter: 1.08 },
        mid: { attack: 1.0, defense: 1.0, closing: 1.0, recovery: 0.62, counter: 1.06 },
        late: { attack: 1.12, defense: 0.9, closing: 1.28, recovery: 0.5, counter: 1.16 }
      }
    };
    return (table[strategy] || table.balanced)[phase] || table.balanced.mid;
  }

  var NPC_KIFU_LEARNED_WEIGHTS = {
    dangerousOpeningFragments: {
      net04: 0.755,
      net01: 0.732,
      net04m: 0.728,
      net05: 0.71,
      net09m: 0.709,
      net02m: 0.707,
      net10m: 0.695,
      net02: 0.691,
      net06: 0.69,
      net03m: 0.682,
      net10: 0.681,
      net09: 0.678,
      net08: 0.673,
      net11m: 0.673,
      net05m: 0.668,
      net03: 0.666,
      net07m: 0.655,
      net11: 0.629,
      net07: 0.604
    },
    shogiDangerousOpeningFragments: {
      net04: 0.778,
      net09: 0.769,
      net09m: 0.759,
      net06: 0.702,
      net01: 0.693,
      net10: 0.67,
      net11: 0.656,
      net02: 0.653,
      net08: 0.646,
      net04m: 0.641,
      net10m: 0.638,
      net03: 0.63,
      net02m: 0.624,
      net05: 0.612,
      net07m: 0.609,
      net07: 0.603,
      net11m: 0.601,
      net03m: 0.601,
      net05m: 0.591
    },
    kingCapturePressurePieces: {
      realmKnight: 1,
      barrier: 0.935,
      destroyer: 0.832,
      charger: 0.648,
      disruptor: 0.633,
      chaosBeast: 0.615,
      rider: 0.61,
      flanker: 0.445,
      guard: 0.283,
      decoy: 0.18,
      vanguard: 0.18,
      king: 0.18
    },
    shogiKingCapturePressurePieces: {
      guard: 1,
      charger: 0.915,
      flanker: 0.672,
      decoy: 0.472,
      disruptor: 0.424,
      rider: 0.413,
      vanguard: 0.318,
      king: 0.18,
      chaosBeast: 0.18,
      destroyer: 0.18,
      barrier: 0.18
    }
  };

  var NPC_OPENING_RESCUE_JOSEKI = {
    setup: {
      preferredBandEdges: { 9: 1, 10: 0.96, 8: 0.55 },
      shieldPieces: { guard: true, barrier: true, realmKnight: true, flanker: true, vanguard: true },
      attackPieces: { charger: true, rider: true, destroyer: true, chaosBeast: true, disruptor: true },
      softPieces: { decoy: true }
    },
    responseWeights: {
      "move:destroyer:capture": 1,
      "move:realmKnight:capture": 0.917,
      "fragment:net07m/rider": 0.917,
      "fragment:net03m/barrier": 0.875,
      "fragment:net09m/flanker": 0.864,
      "fragment:net04/charger": 0.859,
      "fragment:net03/barrier": 0.825,
      "fragment:net04m/charger": 0.825,
      "fragment:net09/flanker": 0.792,
      "fragment:net11/decoy": 0.786,
      "fragment:net01/chaosBeast": 0.78,
      "fragment:net02m/guard": 0.724,
      "fragment:net05/vanguard": 0.72,
      "fragment:net08/realmKnight": 0.708
    }
  };

  var NPC_COUNTERATTACK_TRANSITION_WEIGHTS = {
    actions: {
      "move:disruptor:capture:flanker": 0.677,
      "move:disruptor:capture:destroyer": 0.6,
      "fragment:net06/destroyer": 0.542,
      "move:barrier:capture:rider": 0.514,
      "move:disruptor:capture:realmKnight": 0.484,
      "move:king:capture:chaosBeast": 0.478,
      "move:chaosBeast:capture:realmKnight": 0.476,
      "move:barrier:capture:disruptor": 0.471,
      "fragment:net04/charger": 0.467,
      "fragment:net01/chaosBeast": 0.465,
      "move:guard:capture:rider": 0.459,
      "move:disruptor:capture:barrier": 0.45,
      "fragment:net09m/flanker": 0.371,
      "fragment:net09/flanker": 0.357,
      "fragment:net02m/guard": 0.355,
      "fragment:net07/rider": 0.333,
      "fragment:net10/disruptor": 0.329,
      "fragment:net08/realmKnight": 0.318
    }
  };

  var npcBookStatus = {
    loaded: false,
    source: "embedded",
    error: ""
  };

  function isMergeableNpcBookObject(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
  }

  function mergeNpcBookObject(target, source) {
    Object.keys(source || {}).forEach(function (key) {
      var value = source[key];
      if (isMergeableNpcBookObject(value) && isMergeableNpcBookObject(target[key])) {
        mergeNpcBookObject(target[key], value);
      } else if (isMergeableNpcBookObject(value)) {
        target[key] = mergeNpcBookObject({}, value);
      } else {
        target[key] = value;
      }
    });
    return target;
  }

  function applyNpcBookOverrides(book, source) {
    if (!book || typeof book !== "object") {
      return false;
    }
    if (book.kifuLearnedWeights) {
      mergeNpcBookObject(NPC_KIFU_LEARNED_WEIGHTS, book.kifuLearnedWeights);
    }
    if (book.openingRescueJoseki) {
      mergeNpcBookObject(NPC_OPENING_RESCUE_JOSEKI, book.openingRescueJoseki);
    }
    if (book.counterattackTransitionWeights) {
      mergeNpcBookObject(NPC_COUNTERATTACK_TRANSITION_WEIGHTS, book.counterattackTransitionWeights);
    }
    npcBookStatus = {
      loaded: true,
      source: source || book.source || "external",
      version: book.version || "",
      generatedAt: book.generatedAt || "",
      error: ""
    };
    npcEvalCache = typeof WeakMap === "function" ? new WeakMap() : null;
    activeNpcSearchCache = null;
    if (typeof window !== "undefined") {
      window.UNFOLD_NPC_BOOK_STATUS = npcBookStatus;
    }
    return true;
  }

  function loadNpcBookOverrides() {
    if (typeof window === "undefined" || typeof window.fetch !== "function") {
      return;
    }
    function fetchNpcBook(url) {
      return window.fetch(url, { cache: "no-cache" })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("NPC book HTTP " + response.status);
          }
          return response.json();
        })
        .then(function (payload) {
          return payload && payload.ok && payload.book ? payload.book : payload;
        });
    }
    fetchNpcBook(NPC_BOOK_URL)
      .catch(function () {
        return fetchNpcBook(NPC_BOOK_STATIC_URL);
      })
      .then(function (response) {
        applyNpcBookOverrides(response, response && response.source ? response.source : NPC_BOOK_URL);
      })
      .catch(function (error) {
        npcBookStatus = {
          loaded: false,
          source: "embedded",
          error: error && error.message ? error.message : String(error)
        };
        window.UNFOLD_NPC_BOOK_STATUS = npcBookStatus;
      });
  }

  function getUnfoldWasmStatus() {
    return {
      supported: unfoldWasmRuntime.supported,
      loading: unfoldWasmRuntime.loading,
      ready: unfoldWasmRuntime.ready,
      error: unfoldWasmRuntime.error,
      uses: unfoldWasmRuntime.uses,
      batchUses: unfoldWasmRuntime.batchUses,
      stats1: !!(unfoldWasmRuntime.exports && typeof unfoldWasmRuntime.exports.stats1 === "function"),
      stats3: !!(unfoldWasmRuntime.exports && typeof unfoldWasmRuntime.exports.stats3 === "function"),
      source: UNFOLD_WASM_URL
    };
  }

  function installUnfoldWasmInstance(instance) {
    var exports = instance && instance.exports ? instance.exports : {};
    if (!exports.memory || typeof exports.count_nonzero !== "function" || typeof exports.max_u8 !== "function" || typeof exports.sum_u8 !== "function") {
      throw new Error("UNFOLD WASM exports are incomplete");
    }
    unfoldWasmRuntime.exports = exports;
    unfoldWasmRuntime.memory = exports.memory;
    unfoldWasmRuntime.ready = true;
    unfoldWasmRuntime.loading = false;
    unfoldWasmRuntime.error = "";
    if (typeof window !== "undefined") {
      window.UNFOLD_WASM_STATUS = getUnfoldWasmStatus();
    }
  }

  function fetchUnfoldWasmBytes() {
    if (typeof window !== "undefined" && typeof window.fetch === "function") {
      return window.fetch(UNFOLD_WASM_URL, { cache: "no-cache" })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("WASM HTTP " + response.status);
          }
          return response.arrayBuffer();
        });
    }
    if (typeof XMLHttpRequest === "function") {
      return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        request.open("GET", UNFOLD_WASM_URL, true);
        request.responseType = "arraybuffer";
        request.onload = function () {
          if (request.status >= 200 && request.status < 300 && request.response) {
            resolve(request.response);
            return;
          }
          reject(new Error("WASM XHR " + request.status));
        };
        request.onerror = function () {
          reject(new Error("WASM XHR failed"));
        };
        request.send(null);
      });
    }
    return Promise.reject(new Error("fetch is unavailable"));
  }

  function loadUnfoldWasmEngine() {
    if (!unfoldWasmRuntime.supported || unfoldWasmRuntime.ready || unfoldWasmRuntime.loading) {
      return Promise.resolve(getUnfoldWasmStatus());
    }
    unfoldWasmRuntime.loading = true;
    return fetchUnfoldWasmBytes()
      .then(function (bytes) {
        return WebAssembly.instantiate(bytes, {});
      })
      .then(function (result) {
        installUnfoldWasmInstance(result.instance);
        return getUnfoldWasmStatus();
      })
      .catch(function (error) {
        unfoldWasmRuntime.ready = false;
        unfoldWasmRuntime.loading = false;
        unfoldWasmRuntime.error = error && error.message ? error.message : String(error);
        if (typeof window !== "undefined") {
          window.UNFOLD_WASM_STATUS = getUnfoldWasmStatus();
        }
        return getUnfoldWasmStatus();
      });
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

  function getKifuPiecePressureWeight(pieceType, state) {
    var table = state && state.ruleMode === "shogi"
      ? NPC_KIFU_LEARNED_WEIGHTS.shogiKingCapturePressurePieces
      : NPC_KIFU_LEARNED_WEIGHTS.kingCapturePressurePieces;
    return table[pieceType] || 0.18;
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

  function getDistanceToOwnBase(player, row, col) {
    var center = findBaseCenter(player);
    if (!center) {
      return 99;
    }
    return Math.abs(center.row - row) + Math.abs(center.col - col);
  }

  function getDistanceToOwnBaseInState(state, player, row, col) {
    var center = findBaseCenterInState(state, player);
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

  function getEnemyKingProximityScoreForCell(state, player, row, col, pieceType) {
    var enemyKing = findKingInState(state, getOpponentPlayer(player));
    var distance;
    var value;
    if (!enemyKing) {
      return 0;
    }
    distance = getWeightedDistance(row, col, enemyKing.row, enemyKing.col);
    value = getPieceStrategicValue(pieceType || "vanguard");
    if (distance > 6) {
      return 0;
    }
    return Math.max(0, 7 - distance) * (160 + value * 2.4) + (distance <= 2 ? 2600 : 0);
  }

  function getOwnBaseFortressCellBonus(state, player, row, col) {
    var base = findBaseCenterInState(state, player);
    var distance;
    var cell;
    if (!base) {
      return 0;
    }
    distance = getWeightedDistance(row, col, base.row, base.col);
    cell = state.board[row][col];
    if (distance === 0) {
      return cell.pieceId ? 70 : 120;
    }
    if (distance === 1) {
      return 86;
    }
    if (distance === 2) {
      return 34;
    }
    return 0;
  }

  function getOwnBaseGateCellInState(state, player) {
    var base = findBaseCenterInState(state, player);
    var forward = player === "P1" ? 1 : -1;
    var col;
    if (!base) {
      return null;
    }
    col = base.col + forward * 4;
    if (!isInBounds(base.row, col)) {
      return null;
    }
    return { row: base.row, col: col };
  }

  function getOwnBaseGateCellBonus(state, player, row, col) {
    var gate = getOwnBaseGateCellInState(state, player);
    var distance;
    var cell;
    if (!gate) {
      return 0;
    }
    distance = getWeightedDistance(row, col, gate.row, gate.col);
    if (distance > 3) {
      return 0;
    }
    cell = state.board[row][col];
    if (distance === 0) {
      return cell.pieceId ? 180 : 140;
    }
    if (distance === 1) {
      return 82;
    }
    if (distance === 2) {
      return 36;
    }
    return 12;
  }

  function isBaseReliefPieceType(pieceType) {
    return pieceType === "guard" ||
      pieceType === "barrier" ||
      pieceType === "realmKnight" ||
      pieceType === "flanker" ||
      pieceType === "vanguard" ||
      pieceType === "rider" ||
      pieceType === "disruptor" ||
      pieceType === "silver" ||
      pieceType === "gold";
  }

  function getOwnBaseReliefCellBonus(state, player, pieceType, row, col) {
    var base = findBaseCenterInState(state, player);
    var distance;
    var score;
    if (!base || !pieceType || pieceType === "king") {
      return 0;
    }
    distance = getWeightedDistance(row, col, base.row, base.col);
    if (distance > 3) {
      return 0;
    }
    score = distance === 0 ? 180 : (distance === 1 ? 132 : (distance === 2 ? 58 : 18));
    if (isBaseReliefPieceType(pieceType)) {
      score += distance <= 1 ? 52 : 18;
    }
    return score;
  }

  function getOwnBaseGateControlScoreForPlayer(state, player) {
    if (uiState.npc && uiState.npc.bulkSelfPlay) {
      return 0;
    }
    return getCachedNpcEvalMetric(state, player, "ownBaseGateControl", function () {
      var opponent = getOpponentPlayer(player);
      var gate = getOwnBaseGateCellInState(state, player);
      var ownAttack;
      var opponentAttack;
      var score = 0;
      if (!gate) {
        return 0;
      }
      ownAttack = getAttackMapForStateCached(state, player).counts;
      opponentAttack = getAttackMapForStateCached(state, opponent).counts;
      for (var row = Math.max(0, gate.row - 2); row <= Math.min(BOARD_ROWS - 1, gate.row + 2); row += 1) {
        for (var col = Math.max(0, gate.col - 2); col <= Math.min(BOARD_COLS - 1, gate.col + 2); col += 1) {
          var distance = getWeightedDistance(row, col, gate.row, gate.col);
          var weight;
          var cell;
          var piece;
          if (distance > 2) {
            continue;
          }
          weight = distance === 0 ? 1 : (distance === 1 ? 0.42 : 0.16);
          cell = state.board[row][col];
          piece = cell.pieceId ? getPiece(state, cell.pieceId) : null;
          if (cell.controller === player) {
            score += 6200 * weight;
          } else if (cell.controller === opponent) {
            score -= 9800 * weight;
          }
          if (piece && piece.owner === player) {
            score += (piece.kind === "king" ? 4200 : 13500) * weight;
            if (piece.kind === "guard" || piece.kind === "barrier" || piece.kind === "realmKnight" || piece.kind === "flanker") {
              score += 5200 * weight;
            }
          } else if (piece && piece.owner === opponent) {
            score -= (piece.kind === "king" ? 6500 : 26000) * weight;
          }
          score += Math.min(4, ownAttack[row][col]) * 3600 * weight;
          score -= Math.min(4, opponentAttack[row][col]) * 7200 * weight;
        }
      }
      return score;
    });
  }

  function getOwnBaseReliefScoreForPlayer(state, player) {
    return getCachedNpcEvalMetric(state, player, "ownBaseRelief", function () {
      var base = findBaseCenterInState(state, player);
      var opponent = getOpponentPlayer(player);
      var pieces;
      var opponentPieces;
      var score = 0;
      if (!base) {
        return -12000;
      }
      pieces = state.players[player].pieces;
      opponentPieces = state.players[opponent].pieces;
      Object.keys(pieces).forEach(function (pieceId) {
        var piece = pieces[pieceId];
        var distance;
        if (piece.kind === "king") {
          return;
        }
        distance = getWeightedDistance(piece.row, piece.col, base.row, base.col);
        if (distance <= 3) {
          score += getOwnBaseReliefCellBonus(state, player, piece.kind, piece.row, piece.col) * 46;
        }
      });
      return withTemporaryState(state, function () {
        Object.keys(opponentPieces).forEach(function (targetId) {
          var targetPiece = opponentPieces[targetId];
          var distance = getWeightedDistance(targetPiece.row, targetPiece.col, base.row, base.col);
          var weight;
          var nonKingAttackers = 0;
          var kingAttackers = 0;
          if (distance > 3) {
            return;
          }
          weight = distance === 0 ? 1.35 : (distance === 1 ? 1 : (distance === 2 ? 0.46 : 0.16));
          score -= (14000 + getPieceStrategicValue(targetPiece.kind) * 12) * weight;
          Object.keys(pieces).forEach(function (pieceId) {
            var attacker = pieces[pieceId];
            if (getWeightedDistance(attacker.row, attacker.col, base.row, base.col) > 4) {
              return;
            }
            if (canMovePiece(attacker, targetPiece.row, targetPiece.col)) {
              if (attacker.kind === "king") {
                kingAttackers += 1;
              } else {
                nonKingAttackers += 1;
              }
            }
          });
          if (nonKingAttackers) {
            score += (24000 + getPieceStrategicValue(targetPiece.kind) * 28) * weight;
            score += Math.min(3, nonKingAttackers) * 5200 * weight;
          } else if (kingAttackers) {
            score -= 36000 * weight;
          } else {
            score -= 18000 * weight;
          }
        });
        return score;
      });
    });
  }

  function wouldKingBeThreatenedAfterMove(state, player, piece, row, col) {
    var nextState;
    var nextPiece;
    var originCell;
    var targetCell;
    var targetPiece;
    if (!piece || piece.kind !== "king") {
      return false;
    }
    nextState = cloneNpcSimulationState(state);
    nextPiece = getPiece(nextState, piece.id);
    if (!nextPiece) {
      return false;
    }
    originCell = nextState.board[nextPiece.row][nextPiece.col];
    targetCell = nextState.board[row][col];
    targetPiece = targetCell && targetCell.pieceId ? getPiece(nextState, targetCell.pieceId) : null;
    if (originCell) {
      originCell.pieceId = null;
    }
    if (targetPiece && targetPiece.owner !== player) {
      delete nextState.players[targetPiece.owner].pieces[targetPiece.id];
    }
    nextPiece.row = row;
    nextPiece.col = col;
    targetCell.pieceId = nextPiece.id;
    return isKingUnderThreatInState(nextState, player);
  }

  function getOwnKingShieldLineBonus(state, player, row, col) {
    var king = findKingInState(state, player);
    var base = findBaseCenterInState(state, player);
    var forward = player === "P1" ? 1 : -1;
    var score = 0;
    var kingForwardDelta;
    var kingRowDelta;
    var baseForwardDelta;
    var baseRowDelta;
    if (king) {
      kingForwardDelta = (col - king.col) * forward;
      kingRowDelta = Math.abs(row - king.row);
      if (kingForwardDelta > 0 && kingForwardDelta <= 4) {
        if (kingRowDelta === 0) {
          score += 210 - kingForwardDelta * 24;
        } else if (kingRowDelta === 1 && kingForwardDelta <= 3) {
          score += 96 - kingForwardDelta * 18;
        }
      }
    }
    if (base) {
      baseForwardDelta = (col - base.col) * forward;
      baseRowDelta = Math.abs(row - base.row);
      if (baseForwardDelta > 0 && baseForwardDelta <= 3) {
        if (baseRowDelta === 0) {
          score += 150 - baseForwardDelta * 26;
        } else if (baseRowDelta === 1) {
          score += 70 - baseForwardDelta * 14;
        }
      }
    }
    return Math.max(0, score);
  }

  function getOwnKingImmediateGuardBonus(state, player, row, col) {
    if (uiState.npc && uiState.npc.bulkSelfPlay) {
      return 0;
    }
    var king = findKingInState(state, player);
    var forward = player === "P1" ? 1 : -1;
    var forwardDelta;
    var rowDelta;
    if (!king) {
      return 0;
    }
    forwardDelta = (col - king.col) * forward;
    rowDelta = Math.abs(row - king.row);
    if (forwardDelta === 1 && rowDelta === 0) {
      return 3600;
    }
    if (forwardDelta === 1 && rowDelta === 1) {
      return 3000;
    }
    if (forwardDelta === 2 && rowDelta <= 1) {
      return 1200;
    }
    if (forwardDelta === 0 && rowDelta === 1) {
      return 800;
    }
    return 0;
  }

  function getPieceRolePreviewBonus(player, pieceType, row, col) {
    return getPieceRoleBonusInState(uiState.state, {
      owner: player,
      kind: pieceType,
      row: row,
      col: col
    }) * 0.32;
  }

  function countCellSupportInState(state, player, row, col, excludePieceId) {
    if (!state || !state.players[player] || !state.players[player].pieces || !isInBounds(row, col)) {
      return 0;
    }
    return withTemporaryState(state, function () {
      var pieces = state.players[player].pieces;
      return Object.keys(pieces).reduce(function (count, pieceId) {
        if (pieceId === excludePieceId) {
          return count;
        }
        return canMovePiece(pieces[pieceId], row, col) ? count + 1 : count;
      }, 0);
    });
  }

  function countNonKingCellSupportInState(state, player, row, col, excludePieceId) {
    if (!state || !state.players[player] || !state.players[player].pieces || !isInBounds(row, col)) {
      return 0;
    }
    return withTemporaryState(state, function () {
      var pieces = state.players[player].pieces;
      return Object.keys(pieces).reduce(function (count, pieceId) {
        if (pieceId === excludePieceId || pieces[pieceId].kind === "king") {
          return count;
        }
        return canMovePiece(pieces[pieceId], row, col) ? count + 1 : count;
      }, 0);
    });
  }

  function isPlannedFragmentCell(cells, row, col) {
    return !!(cells || []).some(function (cell) {
      return cell.row === row && cell.col === col;
    });
  }

  function getEnemyKingSupportedPressureScore(state, player, row, col, pieceType, excludePieceId, plannedCells) {
    var opponent = getOpponentPlayer(player);
    var enemyKing = findKingInState(state, opponent);
    var distance;
    var supportCount;
    var supported;
    var controlled;
    var enemyCanTake;
    var value;
    var score = 0;
    if (!enemyKing || pieceType === "king") {
      return 0;
    }
    distance = getWeightedDistance(row, col, enemyKing.row, enemyKing.col);
    if (distance > 2) {
      return 0;
    }
    supportCount = countCellSupportInState(state, player, row, col, excludePieceId);
    supported = supportCount > 0;
    controlled = isPlannedFragmentCell(plannedCells, row, col) || (state.board[row] && state.board[row][col] && state.board[row][col].controller === player);
    enemyCanTake = isCellThreatenedInState(state, opponent, row, col);
    value = getPieceStrategicValue(pieceType);
    if (distance === 1) {
      score += supported ? 14000 + Math.min(9000, value * 22) : -14000;
      score += controlled ? 3600 : -2400;
      if (enemyCanTake && !supported) {
        score -= 12000;
      } else if (enemyCanTake && supported) {
        score += 2800 + supportCount * 900;
      }
    } else {
      score += supported ? 5200 + Math.min(4200, value * 8) : -2200;
      score += controlled ? 1400 : -900;
      if (enemyCanTake && !supported) {
        score -= 2600;
      }
    }
    return score;
  }

  function getEnemyBaseRingPressureScore(state, player, row, col) {
    var enemyBase = findBaseCenterInState(state, getOpponentPlayer(player));
    var distance;
    if (!enemyBase || !isInBounds(row, col)) {
      return 0;
    }
    distance = getWeightedDistance(row, col, enemyBase.row, enemyBase.col);
    if (distance === 1) {
      return 11000;
    }
    if (distance === 2) {
      return 3600;
    }
    if (distance === 3) {
      return 1200;
    }
    return 0;
  }

  function getOwnKingUnsupportedGuardPenalty(state, player, row, col, pieceType, excludePieceId) {
    var opponent = getOpponentPlayer(player);
    var ownKing = findKingInState(state, player);
    var ownBase = findBaseCenterInState(state, player);
    var distance;
    var supportCount;
    var kingOnBase;
    if (!ownKing || pieceType === "king" || !isInBounds(row, col)) {
      return 0;
    }
    distance = getWeightedDistance(row, col, ownKing.row, ownKing.col);
    if (distance > 2 || !isCellThreatenedInState(state, opponent, row, col)) {
      return 0;
    }
    supportCount = countNonKingCellSupportInState(state, player, row, col, excludePieceId);
    if (supportCount > 0) {
      return 0;
    }
    kingOnBase = !!ownBase && ownKing.row === ownBase.row && ownKing.col === ownBase.col;
    if (!kingOnBase && (state.turnNumber || 1) > 28) {
      return 0;
    }
    if (distance <= 1) {
      return kingOnBase ? 22000 : 8000;
    }
    return kingOnBase ? 6000 : 2400;
  }

  function getOpponentFragmentBlockadeScore(state, player, row, col, pieceType, excludePieceId, plannedCells) {
    var opponent = getOpponentPlayer(player);
    var ownBase = findBaseCenterInState(state, player);
    var enemyBase = findBaseCenterInState(state, opponent);
    var boardCell;
    var ownBaseDistance;
    var enemyBaseDistance;
    var adjacentOpponent = 0;
    var adjacentOwn = 0;
    var supportCount;
    var enemyCanTake;
    var score = 0;
    if (!state || !isInBounds(row, col) || pieceType === "king") {
      return 0;
    }
    boardCell = state.board[row][col];
    if (boardCell.controller === opponent) {
      return 0;
    }
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(function (dir) {
      var nr = row + dir[0];
      var nc = col + dir[1];
      if (!isInBounds(nr, nc)) {
        return;
      }
      if (state.board[nr][nc].controller === opponent) {
        adjacentOpponent += 1;
      }
      if (state.board[nr][nc].controller === player || isPlannedFragmentCell(plannedCells, nr, nc)) {
        adjacentOwn += 1;
      }
    });
    if (!adjacentOpponent) {
      return 0;
    }
    ownBaseDistance = ownBase ? getWeightedDistance(row, col, ownBase.row, ownBase.col) : 99;
    enemyBaseDistance = enemyBase ? getWeightedDistance(row, col, enemyBase.row, enemyBase.col) : 99;
    supportCount = countNonKingCellSupportInState(state, player, row, col, excludePieceId);
    enemyCanTake = isCellThreatenedInState(state, opponent, row, col);

    score += adjacentOpponent * 2800;
    if (adjacentOpponent >= 2) {
      score += 6200;
    }
    if (ownBaseDistance <= 2) {
      score += 18000;
    } else if (ownBaseDistance <= 4) {
      score += 9200;
    } else if (ownBaseDistance <= 6) {
      score += 3600;
    }
    if (enemyBaseDistance <= 2) {
      score += 2400;
    }
    if (boardCell.controller === player) {
      score += 1600;
    } else {
      score += 700;
    }
    score += Math.min(3, supportCount + adjacentOwn) * 1800;
    if (enemyCanTake && supportCount + adjacentOwn === 0) {
      score -= ownBaseDistance <= 4 ? 11000 : 4200;
    } else if (enemyCanTake) {
      score += 2600;
    }
    return score;
  }

  function getPieceCoordinationScore(state, player, row, col, pieceType, excludePieceId, plannedCells) {
    var ownKing = findKingInState(state, player);
    var enemyKing = findKingInState(state, getOpponentPlayer(player));
    var ownBase = findBaseCenterInState(state, player);
    var enemyBase = findBaseCenterInState(state, getOpponentPlayer(player));
    var supportCount;
    var nonKingSupportCount;
    var adjacentOwn = 0;
    var adjacentPlanned = 0;
    var ownKingDistance;
    var enemyKingDistance;
    var ownBaseDistance;
    var enemyBaseDistance;
    var enemyCanTake;
    var score = 0;
    if (!state || !isInBounds(row, col)) {
      return 0;
    }
    supportCount = countCellSupportInState(state, player, row, col, excludePieceId);
    nonKingSupportCount = countNonKingCellSupportInState(state, player, row, col, excludePieceId);
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(function (dir) {
      var nr = row + dir[0];
      var nc = col + dir[1];
      if (!isInBounds(nr, nc)) {
        return;
      }
      if (state.board[nr][nc].controller === player) {
        adjacentOwn += 1;
      }
      if (isPlannedFragmentCell(plannedCells, nr, nc)) {
        adjacentPlanned += 1;
      }
    });
    ownKingDistance = ownKing ? getWeightedDistance(row, col, ownKing.row, ownKing.col) : 99;
    enemyKingDistance = enemyKing ? getWeightedDistance(row, col, enemyKing.row, enemyKing.col) : 99;
    ownBaseDistance = ownBase ? getWeightedDistance(row, col, ownBase.row, ownBase.col) : 99;
    enemyBaseDistance = enemyBase ? getWeightedDistance(row, col, enemyBase.row, enemyBase.col) : 99;
    enemyCanTake = isCellThreatenedInState(state, getOpponentPlayer(player), row, col);

    score += nonKingSupportCount * 2600;
    if (nonKingSupportCount >= 2) {
      score += 6200;
    } else if (supportCount > 0) {
      score += 900;
    }
    score += Math.min(3, adjacentOwn + adjacentPlanned) * 850;
    if (enemyCanTake && nonKingSupportCount === 0 && pieceType !== "king") {
      score -= enemyBaseDistance <= 3 || ownKingDistance <= 2 ? 7200 : 3200;
    }
    if ((pieceType === "guard" || pieceType === "barrier" || pieceType === "realmKnight" || pieceType === "flanker") && ownKingDistance <= 2) {
      score += 5600 + Math.max(0, 3 - ownBaseDistance) * 1600;
    }
    if ((pieceType === "realmKnight" || pieceType === "rider" || pieceType === "charger" || pieceType === "destroyer" || pieceType === "chaosBeast") && enemyBaseDistance <= 3) {
      score += nonKingSupportCount > 0 ? 5200 : 1300;
      if (enemyKingDistance <= 3 && nonKingSupportCount > 0) {
        score += 4200;
      }
    }
    if (pieceType === "decoy" && enemyBaseDistance <= 2 && nonKingSupportCount > 0) {
      score += 3600;
    }
    return score;
  }

  function getShogiInspiredFormationScore(state, player, row, col, pieceType, excludePieceId, plannedCells) {
    var opponent = getOpponentPlayer(player);
    var ownBase = findBaseCenterInState(state, player);
    var enemyBase = findBaseCenterInState(state, opponent);
    var ownKing = findKingInState(state, player);
    var enemyKing = findKingInState(state, opponent);
    var forward = player === "P1" ? 1 : -1;
    var baseForwardDelta;
    var baseRowDelta;
    var enemyForwardDelta;
    var enemyRowDelta;
    var ownKingDistance;
    var enemyKingDistance;
    var supportCount;
    var nonKingSupportCount;
    var enemyCanTake;
    var score = 0;
    if (!state || !isInBounds(row, col)) {
      return 0;
    }
    baseForwardDelta = ownBase ? (col - ownBase.col) * forward : 99;
    baseRowDelta = ownBase ? Math.abs(row - ownBase.row) : 99;
    enemyForwardDelta = enemyBase ? (enemyBase.col - col) * forward : 99;
    enemyRowDelta = enemyBase ? Math.abs(row - enemyBase.row) : 99;
    ownKingDistance = ownKing ? getWeightedDistance(row, col, ownKing.row, ownKing.col) : 99;
    enemyKingDistance = enemyKing ? getWeightedDistance(row, col, enemyKing.row, enemyKing.col) : 99;
    supportCount = countCellSupportInState(state, player, row, col, excludePieceId);
    nonKingSupportCount = countNonKingCellSupportInState(state, player, row, col, excludePieceId);
    enemyCanTake = isCellThreatenedInState(state, opponent, row, col);

    if (pieceType === "guard" || pieceType === "barrier" || pieceType === "flanker" || pieceType === "realmKnight") {
      if (baseForwardDelta === 1 && baseRowDelta <= 1) {
        score += 16000;
        if (nonKingSupportCount > 0 || isPlannedFragmentCell(plannedCells, row, col)) {
          score += 7200;
        }
      } else if (baseForwardDelta === 0 && baseRowDelta === 1) {
        score += 7800;
      } else if (baseForwardDelta === 2 && baseRowDelta <= 1) {
        score += 5200;
      }
      if (ownKingDistance <= 2) {
        score += 4200;
      }
    }

    if (pieceType === "vanguard" || pieceType === "decoy") {
      if (enemyForwardDelta >= 0 && enemyForwardDelta <= 2 && enemyRowDelta <= 1) {
        score += nonKingSupportCount > 0 ? 7600 : 2400;
      }
      if (baseForwardDelta === 1 && baseRowDelta === 0) {
        score += 3600;
      }
    }

    if (pieceType === "charger" || pieceType === "destroyer" || pieceType === "disruptor" || pieceType === "rider" || pieceType === "chaosBeast") {
      if (enemyForwardDelta >= 0 && enemyForwardDelta <= 4 && enemyRowDelta <= 2) {
        score += nonKingSupportCount > 0 ? 9400 : 1800;
      }
      if (enemyKingDistance <= 3 && supportCount > 0) {
        score += 5200;
      }
      if (ownKingDistance <= 2 && baseForwardDelta <= 1) {
        score -= 3600;
      }
    }

    if (enemyCanTake && nonKingSupportCount === 0 && (enemyForwardDelta <= 3 || ownKingDistance <= 2)) {
      score -= 8600;
    }
    if (pieceType === "king" && enemyCanTake) {
      score -= 22000;
    }
    return score;
  }

  function scoreNpcMoveAction(player, piece, row, col) {
    var cell = uiState.state.board[row][col];
    var targetPiece = cell.pieceId ? getPiece(uiState.state, cell.pieceId) : null;
    var strategy = getNpcStrategy(player);
    var score = 40 + getCenterPressureScore(player, row, col) + getBaseCenterTargetBonus(player, row, col) + getPieceStrategicValue(piece.kind) * 0.08;
    score += getEnemyKingProximityScoreForCell(uiState.state, player, row, col, piece.kind);
    score += getEnemyKingSupportedPressureScore(uiState.state, player, row, col, piece.kind, piece.id);
    score += getOpponentFragmentBlockadeScore(uiState.state, player, row, col, piece.kind, piece.id) * (strategy === "defense" ? 1 : strategy === "attack" ? 0.45 : 0.7);
    score += getPieceCoordinationScore(uiState.state, player, row, col, piece.kind, piece.id) * (strategy === "defense" ? 1.15 : strategy === "attack" ? 0.85 : 1);
    score += getShogiInspiredFormationScore(uiState.state, player, row, col, piece.kind, piece.id) * (strategy === "defense" ? 1.2 : strategy === "attack" ? 0.8 : 1);
    score += getPieceRolePreviewBonus(player, piece.kind, row, col);
    if (cell.controller === player) {
      score += 6;
    }
    if (targetPiece && targetPiece.owner !== player) {
      score += targetPiece.kind === "king" ? 100000 : 180 + getPieceStrategicValue(targetPiece.kind) * 4;
    }
    if (cell.isBaseCenter && cell.baseOwner === getOpponentPlayer(player) && cell.controller === player) {
      score += 7200;
    }
    if (cell.isBaseCenter && cell.baseOwner === player && piece.kind !== "king") {
      score += 6200;
    }
    if (
      piece.kind === "king" &&
      uiState.state.board[piece.row][piece.col].isBaseCenter &&
      uiState.state.board[piece.row][piece.col].baseOwner === player &&
      cell.controller === player
    ) {
      score += 500;
    }
    if (piece.kind === "king" && uiState.state.turnNumber <= 10) {
      score -= 7200;
    }
    if (
      strategy === "defense" &&
      piece.kind === "king" &&
      uiState.state.board[piece.row][piece.col].isBaseCenter &&
      uiState.state.board[piece.row][piece.col].baseOwner === player &&
      !(targetPiece && targetPiece.kind === "king")
    ) {
      score -= targetPiece && targetPiece.owner !== player ? 48000 : 62000;
    }
    if (wouldKingBeThreatenedAfterMove(uiState.state, player, piece, row, col)) {
      score -= 320000;
    }
    if (!(targetPiece && targetPiece.kind === "king")) {
      score -= getEarlyKingRushPenalty(uiState.state, player, row, col) * (strategy === "attack" ? 0.45 : strategy === "defense" ? 1.65 : 1.15);
    }
    if (strategy === "attack") {
      score += getBaseCenterTargetBonus(player, row, col) * 1.25;
      score += getEnemyKingProximityScoreForCell(uiState.state, player, row, col, piece.kind) * 0.85;
      score += Math.max(0, 18 - getDistanceToEnemyBaseInState(uiState.state, player, row, col)) * 18;
    }
    if (strategy === "defense") {
      var counterWindow = getDefenseCounterattackWindow(uiState.state, player);
      score -= getOwnKingUnsupportedGuardPenalty(uiState.state, player, row, col, piece.kind, piece.id);
      score += getOwnBaseFortressCellBonus(uiState.state, player, row, col) * 18;
      score += getOwnBaseGateCellBonus(uiState.state, player, row, col) * 42;
      score += getOwnBaseReliefCellBonus(uiState.state, player, piece.kind, row, col) * 54;
      score += getOwnKingShieldLineBonus(uiState.state, player, row, col) * 26;
      score += getOwnKingImmediateGuardBonus(uiState.state, player, row, col) * 5.5;
      score += getDefensiveBandCellBonus(uiState.state, player, row, col) * 16;
      if (counterWindow >= 0.45) {
        score += getEnemyBaseTargetBonusInState(uiState.state, player, row, col) * 950 * counterWindow;
        score += getEnemyBaseRingPressureScore(uiState.state, player, row, col) * 0.72 * counterWindow;
        score += getEnemyKingProximityScoreForCell(uiState.state, player, row, col, piece.kind) * 0.35 * counterWindow;
        score += getEnemyKingSupportedPressureScore(uiState.state, player, row, col, piece.kind, piece.id) * 0.55 * counterWindow;
        if (targetPiece && targetPiece.owner !== player && targetPiece.kind !== "king") {
          score += 4200 * counterWindow;
        }
      }
      if (piece.kind === "king" && !(targetPiece && targetPiece.kind === "king")) {
        var ownBase = findBaseCenterInState(uiState.state, player);
        var ownBaseDistance = ownBase ? getWeightedDistance(row, col, ownBase.row, ownBase.col) : 0;
        var currentOwnBaseDistance = ownBase ? getWeightedDistance(piece.row, piece.col, ownBase.row, ownBase.col) : 0;
        score -= Math.max(0, ownBaseDistance - 1) * 3800;
        score -= Math.max(0, ownBaseDistance - 2) * 6200;
        if (ownBaseDistance > 2 && ownBaseDistance >= currentOwnBaseDistance) {
          score -= 26000;
        }
        if (targetPiece && targetPiece.owner !== player && (uiState.state.turnNumber || 1) >= 18) {
          score -= 9600;
        }
        if (targetPiece && targetPiece.owner !== player && targetPiece.kind !== "king") {
          score -= 9200 + getPieceStrategicValue(targetPiece.kind) * 10;
        }
      }
      if (!targetPiece && cell.controller !== player) {
        score -= 1800;
      }
    } else if (strategy === "balanced") {
      score += getDefensiveBandCellBonus(uiState.state, player, row, col) * 5;
    }
    return score;
  }

  function scoreNpcReserveAction(player, pieceType, row, col) {
    var cell = uiState.state.board[row][col];
    var strategy = getNpcStrategy(player);
    var score = 26 + getCenterPressureScore(player, row, col) + getBaseCenterTargetBonus(player, row, col) + getPieceStrategicValue(pieceType) * 0.22;
    score += getEnemyKingProximityScoreForCell(uiState.state, player, row, col, pieceType) * 0.72;
    score += getEnemyKingSupportedPressureScore(uiState.state, player, row, col, pieceType);
    score += getOpponentFragmentBlockadeScore(uiState.state, player, row, col, pieceType) * (strategy === "defense" ? 1.1 : strategy === "attack" ? 0.4 : 0.7);
    score += getPieceCoordinationScore(uiState.state, player, row, col, pieceType) * (strategy === "defense" ? 1.2 : strategy === "attack" ? 0.75 : 1);
    score += getShogiInspiredFormationScore(uiState.state, player, row, col, pieceType) * (strategy === "defense" ? 1.25 : strategy === "attack" ? 0.75 : 1);
    score += getPieceRolePreviewBonus(player, pieceType, row, col);
    score += getDefensiveBandCellBonus(uiState.state, player, row, col) * (strategy === "defense" ? 13 : 4);
    if (strategy === "defense") {
      var reserveCounterWindow = getDefenseCounterattackWindow(uiState.state, player);
      score -= getOwnKingUnsupportedGuardPenalty(uiState.state, player, row, col, pieceType);
      score += getOwnBaseGateCellBonus(uiState.state, player, row, col) * 46;
      score += getOwnBaseReliefCellBonus(uiState.state, player, pieceType, row, col) * 62;
      if (reserveCounterWindow >= 0.45) {
        score += getEnemyBaseTargetBonusInState(uiState.state, player, row, col) * 760 * reserveCounterWindow;
        score += getEnemyBaseRingPressureScore(uiState.state, player, row, col) * 0.68 * reserveCounterWindow;
        score += getEnemyKingProximityScoreForCell(uiState.state, player, row, col, pieceType) * 0.28 * reserveCounterWindow;
        score += getEnemyKingSupportedPressureScore(uiState.state, player, row, col, pieceType) * 0.48 * reserveCounterWindow;
      }
    }
    if (cell.isBaseCenter && cell.baseOwner === getOpponentPlayer(player)) {
      score += 6200;
    }
    if (cell.isBaseCenter && cell.baseOwner === player) {
      score += 7600;
      if (pieceType === "guard" || pieceType === "barrier" || pieceType === "flanker") {
        score += 1800;
      }
    }
    return score;
  }

  function scoreNpcPieceDropTarget(player, pieceType, cell) {
    var strategy = getNpcStrategy(player);
    var boardCell = uiState.state.board[cell.row][cell.col];
    var score = 10 + getCenterPressureScore(player, cell.row, cell.col) + getPieceStrategicValue(pieceType) * 0.15;
    score += getEnemyKingProximityScoreForCell(uiState.state, player, cell.row, cell.col, pieceType) * 0.8;
    score += getEnemyKingSupportedPressureScore(uiState.state, player, cell.row, cell.col, pieceType);
    score += getOpponentFragmentBlockadeScore(uiState.state, player, cell.row, cell.col, pieceType) * (strategy === "defense" ? 1.15 : strategy === "attack" ? 0.45 : 0.75);
    score += getPieceCoordinationScore(uiState.state, player, cell.row, cell.col, pieceType) * (strategy === "defense" ? 1.25 : strategy === "attack" ? 0.8 : 1);
    score += getShogiInspiredFormationScore(uiState.state, player, cell.row, cell.col, pieceType) * (strategy === "defense" ? 1.3 : strategy === "attack" ? 0.8 : 1);
    if (boardCell.isBaseCenter && boardCell.baseOwner === getOpponentPlayer(player)) {
      score += 6200;
    }
    if (boardCell.isBaseCenter && boardCell.baseOwner === player && pieceType !== "king") {
      score += 7600;
    }
    score += getPieceRolePreviewBonus(player, pieceType, cell.row, cell.col);
    score -= getEarlyKingRushPenalty(uiState.state, player, cell.row, cell.col) * (strategy === "attack" ? 0.35 : strategy === "defense" ? 1.55 : 1);
    if (strategy === "defense") {
      var dropCounterWindow = getDefenseCounterattackWindow(uiState.state, player);
      score -= getOwnKingUnsupportedGuardPenalty(uiState.state, player, cell.row, cell.col, pieceType);
      score += getOwnBaseFortressCellBonus(uiState.state, player, cell.row, cell.col) * 24;
      score += getOwnBaseGateCellBonus(uiState.state, player, cell.row, cell.col) * 52;
      score += getOwnBaseReliefCellBonus(uiState.state, player, pieceType, cell.row, cell.col) * 72;
      score += getOwnKingShieldLineBonus(uiState.state, player, cell.row, cell.col) * 34;
      score += getOwnKingImmediateGuardBonus(uiState.state, player, cell.row, cell.col) * 7;
      score += getDefensiveBandCellBonus(uiState.state, player, cell.row, cell.col) * 14;
      if (dropCounterWindow >= 0.45) {
        score += getEnemyBaseTargetBonusInState(uiState.state, player, cell.row, cell.col) * 820 * dropCounterWindow;
        score += getEnemyBaseRingPressureScore(uiState.state, player, cell.row, cell.col) * 0.72 * dropCounterWindow;
        score += getEnemyKingProximityScoreForCell(uiState.state, player, cell.row, cell.col, pieceType) * 0.3 * dropCounterWindow;
        score += getEnemyKingSupportedPressureScore(uiState.state, player, cell.row, cell.col, pieceType) * 0.5 * dropCounterWindow;
      }
    } else if (strategy === "attack") {
      score += getBaseCenterTargetBonus(player, cell.row, cell.col) * 1.5;
      score += getEnemyKingProximityScoreForCell(uiState.state, player, cell.row, cell.col, pieceType) * 0.85;
    } else {
      score += getDefensiveBandCellBonus(uiState.state, player, cell.row, cell.col) * 4;
    }
    return score;
  }

  function pickNpcPieceDropCells(player, pieceType, cells, limit) {
    return cells
      .filter(function (cell) {
        return !uiState.state.board[cell.row][cell.col].pieceId;
      })
      .map(function (cell) {
        return {
          row: cell.row,
          col: cell.col,
          score: scoreNpcPieceDropTarget(player, pieceType, cell)
        };
      })
      .sort(function (a, b) {
        return b.score - a.score;
      })
      .slice(0, Math.max(1, limit || 1));
  }

  function pickNpcPieceDropCell(player, pieceType, cells) {
    var bestCells = pickNpcPieceDropCells(player, pieceType, cells, 1);
    return bestCells[0] || null;
  }

  function pickInitialStandbyPieceCell(player, pieceType, cells) {
    var candidates = pickNpcPieceDropCells(player, pieceType, cells, 4);
    if (!candidates.length) {
      return null;
    }
    candidates.sort(function (a, b) {
      var immediateGuardDelta = getOwnKingImmediateGuardBonus(uiState.state, player, b.row, b.col) - getOwnKingImmediateGuardBonus(uiState.state, player, a.row, a.col);
      if (immediateGuardDelta) {
        return immediateGuardDelta;
      }
      var shieldDelta = getOwnKingShieldLineBonus(uiState.state, player, b.row, b.col) - getOwnKingShieldLineBonus(uiState.state, player, a.row, a.col);
      if (shieldDelta) {
        return shieldDelta;
      }
      var gateDelta = getOwnBaseGateCellBonus(uiState.state, player, b.row, b.col) - getOwnBaseGateCellBonus(uiState.state, player, a.row, a.col);
      if (gateDelta) {
        return gateDelta;
      }
      var reliefDelta = getOwnBaseReliefCellBonus(uiState.state, player, pieceType, b.row, b.col) - getOwnBaseReliefCellBonus(uiState.state, player, pieceType, a.row, a.col);
      if (reliefDelta) {
        return reliefDelta;
      }
      return b.score - a.score;
    });
    return candidates[0];
  }

  function scoreNpcFragmentAction(player, card, cells, pieceCell) {
    var score = 48;
    var strategy = getNpcStrategy(player);
    var counterWindow = strategy === "defense" ? getDefenseCounterattackWindow(uiState.state, player) : 0;
    var pieceType = card.pieceType || null;
    var hasLinkedPiece = !!pieceType;
    cells.forEach(function (cell) {
      var boardCell = uiState.state.board[cell.row][cell.col];
      score += 5 + getCenterPressureScore(player, cell.row, cell.col) * 0.8 + getBaseCenterTargetBonus(player, cell.row, cell.col);
      if (boardCell.controller && boardCell.controller !== player) {
        score += 12;
      }
      if (boardCell.isBaseCenter && boardCell.baseOwner === getOpponentPlayer(player) && !boardCell.pieceId) {
        score += 70000;
      }
      if (strategy === "defense") {
        score += getOwnBaseFortressCellBonus(uiState.state, player, cell.row, cell.col) * 24;
        score += getOwnBaseGateCellBonus(uiState.state, player, cell.row, cell.col) * 22;
        score += getOwnBaseReliefCellBonus(uiState.state, player, pieceType, cell.row, cell.col) * 26;
        score += getOwnKingShieldLineBonus(uiState.state, player, cell.row, cell.col) * 30;
        score += getOwnKingImmediateGuardBonus(uiState.state, player, cell.row, cell.col) * 4.8;
        score += getDefensiveBandCellBonus(uiState.state, player, cell.row, cell.col) * 12;
        if (counterWindow >= 0.45) {
          score += getEnemyBaseTargetBonusInState(uiState.state, player, cell.row, cell.col) * 680 * counterWindow;
          score += getEnemyBaseRingPressureScore(uiState.state, player, cell.row, cell.col) * 0.32 * counterWindow;
          if (hasLinkedPiece) {
            score += getEnemyKingProximityScoreForCell(uiState.state, player, cell.row, cell.col, pieceType) * 0.12 * counterWindow;
          }
        }
      } else if (strategy === "attack") {
        score += getBaseCenterTargetBonus(player, cell.row, cell.col) * 1.2;
        if (hasLinkedPiece) {
          score += getEnemyKingProximityScoreForCell(uiState.state, player, cell.row, cell.col, pieceType) * 0.18;
        }
      } else {
        score += getDefensiveBandCellBonus(uiState.state, player, cell.row, cell.col) * 3.8;
      }
    });
    if (pieceCell && hasLinkedPiece) {
      score += pieceCell.score;
      score += getEnemyKingProximityScoreForCell(uiState.state, player, pieceCell.row, pieceCell.col, pieceType) * 0.45;
      score += getEnemyKingSupportedPressureScore(uiState.state, player, pieceCell.row, pieceCell.col, pieceType, null, cells);
      score += getOpponentFragmentBlockadeScore(uiState.state, player, pieceCell.row, pieceCell.col, pieceType, null, cells) * (strategy === "defense" ? 1.2 : strategy === "attack" ? 0.5 : 0.8);
      score += getPieceCoordinationScore(uiState.state, player, pieceCell.row, pieceCell.col, pieceType, null, cells) * (strategy === "defense" ? 1.25 : strategy === "attack" ? 0.85 : 1);
      score += getShogiInspiredFormationScore(uiState.state, player, pieceCell.row, pieceCell.col, pieceType, null, cells) * (strategy === "defense" ? 1.3 : strategy === "attack" ? 0.85 : 1);
      if (strategy === "defense") {
        score -= getOwnKingUnsupportedGuardPenalty(uiState.state, player, pieceCell.row, pieceCell.col, pieceType);
        score += getOwnBaseGateCellBonus(uiState.state, player, pieceCell.row, pieceCell.col) * 72;
        score += getOwnBaseReliefCellBonus(uiState.state, player, pieceType, pieceCell.row, pieceCell.col) * 88;
        score += getOwnKingImmediateGuardBonus(uiState.state, player, pieceCell.row, pieceCell.col) * 8;
        score += getDefensiveBandCellBonus(uiState.state, player, pieceCell.row, pieceCell.col) * 16;
        if (counterWindow >= 0.45) {
          score += getEnemyBaseTargetBonusInState(uiState.state, player, pieceCell.row, pieceCell.col) * 1250 * counterWindow;
          score += getEnemyBaseRingPressureScore(uiState.state, player, pieceCell.row, pieceCell.col) * 0.95 * counterWindow;
          score += getEnemyKingProximityScoreForCell(uiState.state, player, pieceCell.row, pieceCell.col, pieceType) * 0.36 * counterWindow;
          score += getEnemyKingSupportedPressureScore(uiState.state, player, pieceCell.row, pieceCell.col, pieceType, null, cells) * 0.62 * counterWindow;
        }
      }
    }
    if (hasLinkedPiece) {
      score += getPieceStrategicValue(pieceType) * 0.12;
      score += getPieceRolePreviewBonus(player, pieceType, pieceCell ? pieceCell.row : cells[0].row, pieceCell ? pieceCell.col : cells[0].col);
    }
    score += getFragmentDisruptionScoreForCells(uiState.state, player, cells);
    return score;
  }

  function scoreNpcSetupFragmentAction(player, card, cells) {
    var base = findBaseCenter(player);
    var strategy = getNpcStrategy(player);
    var score = 30 + getPieceStrategicValue(card.pieceType) * 0.12;
    var directBaseContacts = 0;
    var fortressScore = 0;
    var farthestDistance = 0;
    cells.forEach(function (cell) {
      var distance = base ? getWeightedDistance(cell.row, cell.col, base.row, base.col) : 6;
      var forwardDrift = player === "P1" ? Math.max(0, cell.col - 5) : Math.max(0, 9 - cell.col);
      var adjacentToBase = [[-1, 0], [1, 0], [0, -1], [0, 1]].some(function (direction) {
        var row = cell.row + direction[0];
        var col = cell.col + direction[1];
        return isInBounds(row, col) && isBaseTerritoryCell(row, col, player);
      });
      score += Math.max(0, 8 - distance) * 7;
      score -= Math.max(0, distance - 5) * 42;
      score -= forwardDrift * 48;
      farthestDistance = Math.max(farthestDistance, distance);
      fortressScore += getOwnBaseFortressCellBonus(uiState.state, player, cell.row, cell.col);
      score += getOwnBaseGateCellBonus(uiState.state, player, cell.row, cell.col) * (strategy === "defense" ? 36 : 10);
      score += getOwnBaseReliefCellBonus(uiState.state, player, card.pieceType, cell.row, cell.col) * (strategy === "defense" ? 38 : 6);
      if (adjacentToBase) {
        directBaseContacts += 1;
        score += 44;
      }
      if (strategy === "defense") {
        score += getOwnKingShieldLineBonus(uiState.state, player, cell.row, cell.col) * 5.5;
        score += getOwnKingImmediateGuardBonus(uiState.state, player, cell.row, cell.col) * 1.4;
        score += getDefensiveBandCellBonus(uiState.state, player, cell.row, cell.col) * 2.2;
      }
      if (cell.row >= 2 && cell.row <= 6) {
        score += 3;
      }
    });
    if (!directBaseContacts) {
      score -= 120;
    } else if (directBaseContacts >= 2) {
      score += 80;
    }
    if (strategy === "defense") {
      score += fortressScore * 7.5;
      score += directBaseContacts * 120;
      score -= farthestDistance * 24;
      if (card.pieceType === "guard" || card.pieceType === "barrier" || card.pieceType === "realmKnight") {
        score += 260;
      } else if (card.pieceType === "decoy" || card.pieceType === "flanker" || card.pieceType === "vanguard") {
        score += 120;
      }
    } else if (strategy === "attack") {
      score += getPieceStrategicValue(card.pieceType) * 0.65;
      if (card.pieceType === "charger" || card.pieceType === "rider" || card.pieceType === "destroyer" || card.pieceType === "chaosBeast") {
        score += 210;
      }
      score += Math.max(0, farthestDistance - 2) * 18;
    }
    score += getKifuFragmentDangerWeight(card, uiState.state) * (strategy === "attack" ? 260 : strategy === "defense" ? 150 : 190);
    if (NPC_OPENING_RESCUE_JOSEKI.setup.shieldPieces[card.pieceType]) {
      score += strategy === "defense" ? 180 : 70;
    } else if (NPC_OPENING_RESCUE_JOSEKI.setup.attackPieces[card.pieceType]) {
      score += strategy === "attack" ? 150 : 35;
    }
    return score;
  }

  function scoreNpcSetupPieceAction(player, card, row, col) {
    var strategy = getNpcStrategy(player);
    var pieceType = card.pieceType;
    var score = 42 + getPieceStrategicValue(pieceType) * 0.35;
    score += getCenterPressureScore(player, row, col) * 0.35;
    score += getOwnBaseFortressCellBonus(uiState.state, player, row, col) * 56;
    score += getOwnBaseReliefCellBonus(uiState.state, player, pieceType, row, col) * 118;
    score += getOwnKingShieldLineBonus(uiState.state, player, row, col) * 74;
    score += getOwnKingImmediateGuardBonus(uiState.state, player, row, col) * 12;
    score += getDefensiveBandCellBonus(uiState.state, player, row, col) * 10;
    if (strategy === "defense") {
      score += getOwnBaseReliefCellBonus(uiState.state, player, pieceType, row, col) * 88;
      if (isBaseReliefPieceType(pieceType)) {
        score += 5200;
      }
    } else if (strategy === "attack") {
      score += Math.max(0, 18 - getDistanceToEnemyBaseInState(uiState.state, player, row, col)) * 72;
      if (pieceType === "charger" || pieceType === "rider" || pieceType === "destroyer" || pieceType === "chaosBeast") {
        score += 2600;
      }
    }
    return score;
  }

  function scoreNpcRecoverPieceAction(piece) {
    var cell = uiState.state.board[piece.row][piece.col];
    var player = piece.owner;
    var strategy = getNpcStrategy(player);
    var score = 10 + getPieceStrategicValue(piece.kind) * 0.18;
    var fortressBonus = getOwnBaseFortressCellBonus(uiState.state, player, piece.row, piece.col);
    if (cell && cell.isBaseCenter && cell.baseOwner === piece.owner) {
      return -4000;
    }
    if (isCellThreatenedInState(uiState.state, getOpponentPlayer(player), piece.row, piece.col)) {
      score += 1800 + getPieceStrategicValue(piece.kind) * 18;
    }
    if (strategy === "defense") {
      score += Math.max(0, getDistanceToOwnBase(player, piece.row, piece.col) - 3) * 720;
      score -= getOwnKingShieldLineBonus(uiState.state, player, piece.row, piece.col) * 38;
      if (fortressBonus < 30) {
        score += 900;
      } else {
        score -= 2400 + fortressBonus * 36;
      }
    }
    if (strategy === "attack" && getDistanceToEnemyBase(player, piece.row, piece.col) <= 3) {
      score -= 2600;
    }
    return score;
  }

  function scoreNpcRecoverFragmentAction(placement) {
    var player = placement.owner;
    var strategy = getNpcStrategy(player);
    var playerState = uiState.state.players[player];
    var heldFragmentCount = getFragmentReserveEntries(playerState).reduce(function (total, entry) {
      return total + entry.count;
    }, 0);
    var score = 8;
    var minOwnBaseDistance = 99;
    placement.cells.forEach(function (cell) {
      minOwnBaseDistance = Math.min(minOwnBaseDistance, getDistanceToOwnBase(player, cell.row, cell.col));
    });
    if (heldFragmentCount <= 1) {
      score += 1200;
    }
    if (strategy === "defense" && minOwnBaseDistance > 4) {
      score += 1700;
    }
    if (strategy === "defense" && minOwnBaseDistance > 5 && (uiState.state.turnNumber || 1) >= 18) {
      score += 5200;
    }
    if (strategy === "attack" && minOwnBaseDistance > 5) {
      score += 900;
    }
    return score;
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

  function scoreNpcFrontierCell(player, cell) {
    var strategy = getNpcStrategy(player);
    var boardCell = uiState.state.board[cell.row][cell.col];
    var opponent = getOpponentPlayer(player);
    var score = 0;
    var piece = boardCell.pieceId ? getPiece(uiState.state, boardCell.pieceId) : null;

    score += getBaseCenterTargetBonus(player, cell.row, cell.col) * (strategy === "attack" ? 9.5 : 3.6);
    score += getOwnBaseFortressCellBonus(uiState.state, player, cell.row, cell.col) * (strategy === "defense" ? 6.8 : 2.2);
    score += getOwnKingShieldLineBonus(uiState.state, player, cell.row, cell.col) * (strategy === "defense" ? 7.2 : 1.6);
    score += Math.max(0, 16 - getDistanceToEnemyBaseInState(uiState.state, player, cell.row, cell.col)) * (strategy === "attack" ? 9 : 3);
    score -= Math.max(0, getDistanceToOwnBaseInState(uiState.state, player, cell.row, cell.col) - 8) * (strategy === "defense" ? 18 : 4);

    if (boardCell.controller === opponent) {
      score += strategy === "defense" ? 64 : 120;
    }
    if (piece && piece.owner === opponent) {
      score += 90 + getPieceStrategicValue(piece.kind) * 2.4;
    }
    if (boardCell.isBaseCenter && boardCell.baseOwner === opponent) {
      score += 120000;
    }
    if (boardCell.isBaseCenter && boardCell.baseOwner === player) {
      score += strategy === "defense" ? 16000 : 2400;
    }

    return score;
  }

  function rankNpcFrontierCells(player, cells, limit) {
    if (!limit || cells.length <= limit) {
      return cells;
    }
    return cells
      .map(function (cell) {
        return {
          row: cell.row,
          col: cell.col,
          score: scoreNpcFrontierCell(player, cell)
        };
      })
      .sort(function (a, b) {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        if (a.col !== b.col) {
          return player === "P1" ? b.col - a.col : a.col - b.col;
        }
        return Math.abs(a.row - 4) - Math.abs(b.row - 4);
      })
      .slice(0, Math.max(1, limit))
      .map(function (cell) {
        return { row: cell.row, col: cell.col };
      });
  }

  function getNpcFragmentFrontierLimit(player, emergencyMode) {
    var strategy = getNpcStrategy(player);
    if (normalizeNpcLookaheadDepth(uiState.npc.lookaheadDepth) >= 3 && !isInitialStandbyPhase(uiState.state)) {
      if (emergencyMode) {
        return 8;
      }
      if (strategy === "defense") {
        return 5;
      }
      if (strategy === "attack") {
        return 4;
      }
      return 5;
    }
    if (!isInitialStandbyPhase(uiState.state) && (isNpcGame() || uiState.npc.selfPlayFast)) {
      if (emergencyMode) {
        return 16;
      }
      if (strategy === "defense") {
        return 12;
      }
      if (strategy === "attack") {
        return 10;
      }
      return 11;
    }
    if (!uiState.npc.bulkSelfPlay || isInitialStandbyPhase(uiState.state)) {
      return 0;
    }
    if (emergencyMode) {
      return 24;
    }
    if (strategy === "defense") {
      return 16;
    }
    if (strategy === "attack") {
      return 14;
    }
    return 15;
  }

  function getInitialStandbyBaseTouchCells(player) {
    var cells = {};
    for (var row = 0; row < BOARD_ROWS; row += 1) {
      for (var col = 0; col < BOARD_COLS; col += 1) {
        if (isBaseTerritoryCell(row, col, player)) {
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
    }
    return Object.keys(cells).map(function (key) {
      return cells[key];
    });
  }

  function getInitialStandbyBasePieceCellsForState(state, player) {
    var cells = [];
    for (var row = 0; row < BOARD_ROWS; row += 1) {
      for (var col = 0; col < BOARD_COLS; col += 1) {
        if (!isBaseTerritoryCell(row, col, player) || state.board[row][col].pieceId) {
          continue;
        }
        cells.push({ row: row, col: col });
      }
    }
    return cells;
  }

  function getDeploymentFrontierProfile(state, player) {
    var opponent = getOpponentPlayer(player);
    var cells = {};
    var profile = {
      count: 0,
      neutral: 0,
      opponentControlled: 0,
      occupiedByOpponent: 0,
      nearOwnBase: 0,
      nearEnemyBase: 0,
      keys: {}
    };
    var ownBase = findBaseCenterInState(state, player);
    var enemyBase = findBaseCenterInState(state, opponent);
    for (var row = 0; row < BOARD_ROWS; row += 1) {
      for (var col = 0; col < BOARD_COLS; col += 1) {
        if (state.board[row][col].controller !== player) {
          continue;
        }
        [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(function (dir) {
          var nr = row + dir[0];
          var nc = col + dir[1];
          var cell;
          var piece;
          var key;
          if (!isInBounds(nr, nc) || state.board[nr][nc].controller === player) {
            return;
          }
          key = nr + ":" + nc;
          if (cells[key]) {
            return;
          }
          cell = state.board[nr][nc];
          piece = cell.pieceId ? getPiece(state, cell.pieceId) : null;
          cells[key] = { row: nr, col: nc };
          profile.count += 1;
          profile.keys[key] = true;
          if (cell.controller === opponent) {
            profile.opponentControlled += 1;
          } else {
            profile.neutral += 1;
          }
          if (piece && piece.owner === opponent) {
            profile.occupiedByOpponent += 1;
          }
          if (ownBase && getWeightedDistance(nr, nc, ownBase.row, ownBase.col) <= 3) {
            profile.nearOwnBase += 1;
          }
          if (enemyBase && getWeightedDistance(nr, nc, enemyBase.row, enemyBase.col) <= 3) {
            profile.nearEnemyBase += 1;
          }
        });
      }
    }
    return profile;
  }

  function countLegalFragmentPlacementsForState(state, player, limit) {
    return withTemporaryState(state, function () {
      var count = 0;
      var cap = limit || 80;
      state.players[player].hand.some(function (card) {
        var placements = getNpcFragmentPlacements(player, card);
        count += placements.length;
        return count >= cap;
      });
      return Math.min(count, cap);
    });
  }

  function getDeploymentControlScoreForPlayer(state, player) {
    var profile = getDeploymentFrontierProfile(state, player);
    var legalCount = countLegalFragmentPlacementsForState(state, player, 80);
    var score = 0;
    score += legalCount * 95;
    score += profile.count * 32;
    score += profile.neutral * 18;
    score += profile.opponentControlled * 58;
    score += profile.nearOwnBase * 28;
    score += profile.nearEnemyBase * 75;
    score -= profile.occupiedByOpponent * 64;
    if (!legalCount) {
      score -= 7200;
    } else if (legalCount <= 5) {
      score -= (6 - legalCount) * 650;
    }
    return score;
  }

  function getBaseCenterShieldScoreForPlayer(state, player) {
    var center = findBaseCenterInState(state, player);
    var opponent = getOpponentPlayer(player);
    var score = 0;
    var piece;
    var pressure;
    if (!center) {
      return -12000;
    }
    piece = center.pieceId ? getPiece(state, center.pieceId) : null;
    if (!piece) {
      score -= canPlayerOverwriteBaseCenterInState(state, opponent, player) ? 42000 : 26000;
    } else if (piece.owner === player) {
      if (piece.kind === "king") {
        score -= 1800;
      } else {
        score += 8200 + getPieceStrategicValue(piece.kind) * 8;
        if (piece.kind === "guard" || piece.kind === "barrier" || piece.kind === "flanker") {
          score += 2200;
        }
      }
    } else {
      score -= 18000;
    }
    pressure = getNearbyPiecePressureScore(state, opponent, center.row, center.col);
    score -= Math.min(8, pressure) * 620;
    return score;
  }

  function getKingShieldLineScoreForPlayer(state, player) {
    var pieces = state.players[player].pieces;
    var score = 0;
    Object.keys(pieces).forEach(function (pieceId) {
      var piece = pieces[pieceId];
      if (piece.kind === "king") {
        return;
      }
      score += getOwnKingShieldLineBonus(state, player, piece.row, piece.col) * 8;
    });
    for (var row = 0; row < BOARD_ROWS; row += 1) {
      for (var col = 0; col < BOARD_COLS; col += 1) {
        if (state.board[row][col].controller === player) {
          score += getOwnKingShieldLineBonus(state, player, row, col) * 0.55;
        }
      }
    }
    return score;
  }

  function getNearbyPiecePressureScore(state, player, row, col) {
    var pieces = state.players[player].pieces;
    var pressure = 0;
    Object.keys(pieces).forEach(function (pieceId) {
      var piece = pieces[pieceId];
      var distance = getWeightedDistance(row, col, piece.row, piece.col);
      if (distance === 1) {
        pressure += 3;
      } else if (distance === 2) {
        pressure += 1;
      }
      if (distance <= 2 && (piece.kind === "destroyer" || piece.kind === "charger" || piece.kind === "rider")) {
        pressure += 1;
      }
    });
    return pressure;
  }

  function getEarlyKingRushPenalty(state, player, row, col) {
    var enemyKing = findKingInState(state, getOpponentPlayer(player));
    var distance;
    var earlyWeight;
    if (!enemyKing || state.turnNumber > 10) {
      return 0;
    }
    distance = getWeightedDistance(row, col, enemyKing.row, enemyKing.col);
    if (distance > 2) {
      return 0;
    }
    earlyWeight = 11 - Math.max(1, state.turnNumber || 1);
    return earlyWeight * (distance === 1 ? 1500 : 720);
  }

  function getLongGameActionBias(state, action, player) {
    var playerState = state.players[player];
    var deckCount = playerState ? playerState.deck.length : 0;
    if (!deckCount || action.winsImmediately) {
      return 0;
    }
    if (action.type === "fragment") {
      return 9000 + Math.min(10, deckCount) * 650;
    }
    if (action.type === "move") {
      var cell = state.board[action.row][action.col];
      var targetPiece = cell && cell.pieceId ? getPiece(state, cell.pieceId) : null;
      if (targetPiece && targetPiece.owner !== player) {
        return targetPiece.kind === "king" ? 0 : -2400;
      }
      return -4200;
    }
    if (action.type === "reserve") {
      return -2500;
    }
    if (action.type === "recoverPiece" || action.type === "recoverFragment") {
      return -3600;
    }
    if (action.type === "mulligan") {
      return -1600;
    }
    return 0;
  }

  function getGameClosingUrgency(state) {
    var turn = state && state.turnNumber ? state.turnNumber : 1;
    var totalDeck = (state.players.P1.deck ? state.players.P1.deck.length : 0) + (state.players.P2.deck ? state.players.P2.deck.length : 0);
    var turnPressure = Math.max(0, turn - 48) / 70;
    var deckPressure = Math.max(0, 16 - totalDeck) / 18;
    return Math.min(2.4, 0.45 + turnPressure + deckPressure);
  }

  function getClosingPressureScoreForPlayer(state, player) {
    var opponent = getOpponentPlayer(player);
    var enemyKing = findKingInState(state, opponent);
    var enemyBase = findBaseCenterInState(state, opponent);
    var attackMap = getAttackMapForStateCached(state, player);
    var immediateThreats = findImmediateWinningThreatsShallow(state, player, 8).length;
    var score = immediateThreats * 64000;
    var pieceIds = Object.keys(state.players[player].pieces);
    if (enemyKing) {
      var safeEscapes = countKingSafeEscapeSquares(state, opponent);
      score += Math.max(0, 5 - safeEscapes) * 12500;
      if (safeEscapes === 0) {
        score += 30000;
      }
      if (isKingUnderThreatInState(state, opponent)) {
        score += 56000;
      }
      pieceIds.forEach(function (pieceId) {
        var piece = state.players[player].pieces[pieceId];
        var distance = getWeightedDistance(piece.row, piece.col, enemyKing.row, enemyKing.col);
        if (distance <= 7) {
          score += Math.max(0, 8 - distance) * (420 + getPieceStrategicValue(piece.kind) * 4);
        }
        if (distance <= 3 && piece.kind !== "king") {
          score += getPieceStrategicValue(piece.kind) * 75;
        }
      });
    }
    if (enemyBase) {
      var basePiece = enemyBase.pieceId ? getPiece(state, enemyBase.pieceId) : null;
      score += Math.min(4, attackMap.counts[enemyBase.row][enemyBase.col]) * 18000;
      if (enemyBase.controller === player) {
        score += 42000;
      }
      if (!basePiece || basePiece.owner !== opponent) {
        score += 18000;
      }
      pieceIds.forEach(function (pieceId) {
        var piece = state.players[player].pieces[pieceId];
        var distance = getWeightedDistance(piece.row, piece.col, enemyBase.row, enemyBase.col);
        if (distance <= 6) {
          score += Math.max(0, 7 - distance) * (360 + getPieceStrategicValue(piece.kind) * 3);
        }
      });
    }
    score += getDeploymentFrontierProfile(state, player).nearEnemyBase * 900;
    return score;
  }

  function createsImmediateWinThreatAfterAction(state, player, action, limit) {
    var nextState;
    if (!action || action.type === "mulligan") {
      return false;
    }
    nextState = cloneNpcSimulationState(state);
    nextState.currentPlayer = player;
    applyNpcActionToState(nextState, action);
    if (nextState.winner === player) {
      return true;
    }
    if (nextState.winner) {
      return false;
    }
    return findImmediateWinningThreatsShallow(nextState, player, limit || 3).length > 0;
  }

  function getGameClosingActionBias(state, action, player, nextState, emergencyMode) {
    var opponent = getOpponentPlayer(player);
    var urgency = getGameClosingUrgency(state);
    var strategy = getNpcStrategy(player);
    var phaseWeights = getNpcPhaseWeights(strategy, getNpcGamePhase(state));
    var beforePressure = getClosingPressureScoreForPlayer(state, player) - getClosingPressureScoreForPlayer(state, opponent);
    var afterPressure = getClosingPressureScoreForPlayer(nextState, player) - getClosingPressureScoreForPlayer(nextState, opponent);
    var ownThreats = nextState.winner === player ? 4 : findImmediateWinningThreatsShallow(nextState, player, 4).length;
    var opponentThreats = nextState.winner ? 0 : findImmediateWinningThreatsShallow(nextState, opponent, 4).length;
    var score = (afterPressure - beforePressure) * (0.28 + urgency * 0.14);
    score += ownThreats * (14000 + urgency * 9000);
    score -= opponentThreats * (9000 + urgency * 6000);
    if (isKingUnderThreatInState(nextState, opponent)) {
      score += 12000 + urgency * 7000;
    }
    if (action.type === "fragment" || action.type === "move" || action.type === "reserve") {
      score += urgency * 2200;
    }
    if ((action.type === "recoverPiece" || action.type === "recoverFragment" || action.type === "mulligan") && !ownThreats) {
      score -= emergencyMode ? 1800 : (7600 + urgency * 4200);
    }
    return score * phaseWeights.closing;
  }

  function getNpcPhaseActionBias(state, action, player, nextState, emergencyMode) {
    if (uiState.npc && uiState.npc.bulkSelfPlay) {
      return 0;
    }
    var strategy = getNpcStrategy(player);
    var phase = getNpcGamePhase(state);
    var phaseWeights = getNpcPhaseWeights(strategy, phase);
    var opponent = getOpponentPlayer(player);
    var beforeRisk = getFastLossRiskScoreForPlayer(state, player);
    var afterRisk = getFastLossRiskScoreForPlayer(nextState, player);
    var beforeCounter = getCounterPressureScoreForPlayer(state, player);
    var afterCounter = getCounterPressureScoreForPlayer(nextState, player);
    var beforeLanding = getKingLandingControlScoreForPlayer(state, player);
    var afterLanding = getKingLandingControlScoreForPlayer(nextState, player);
    var beforeBand = getDefensiveBandScoreForPlayer(state, player);
    var afterBand = getDefensiveBandScoreForPlayer(nextState, player);
    var beforeGate = getOwnBaseGateControlScoreForPlayer(state, player);
    var afterGate = getOwnBaseGateControlScoreForPlayer(nextState, player);
    var beforeRelief = getOwnBaseReliefScoreForPlayer(state, player);
    var afterRelief = getOwnBaseReliefScoreForPlayer(nextState, player);
    var beforeThreatCreation = getThreatCreationRiskScoreForPlayer(state, player);
    var afterThreatCreation = getThreatCreationRiskScoreForPlayer(nextState, player);
    var beforePieceThreat = getPieceCaptureThreatScoreForPlayer(state, player);
    var afterPieceThreat = getPieceCaptureThreatScoreForPlayer(nextState, player);
    var score = (beforeRisk - afterRisk) * ((phase === "setup" || phase === "early") ? 0.3 : 0.18) * phaseWeights.defense;
    score += (afterCounter - beforeCounter) * (0.2 * phaseWeights.counter);
    score += (afterLanding - beforeLanding) * ((phase === "setup" || phase === "early") ? 0.42 : 0.2) * phaseWeights.defense;
    score += (afterBand - beforeBand) * ((phase === "setup" || phase === "early") ? 0.48 : 0.14) * phaseWeights.defense;
    score += (afterGate - beforeGate) * ((phase === "setup" || phase === "early") ? 0.54 : 0.16) * phaseWeights.defense;
    score += (afterRelief - beforeRelief) * ((phase === "setup" || phase === "early") ? 0.62 : 0.2) * phaseWeights.defense;
    score += (beforeThreatCreation - afterThreatCreation) * ((phase === "setup" || phase === "early") ? 0.72 : 0.34) * phaseWeights.defense;
    score += (beforePieceThreat - afterPieceThreat) * ((phase === "setup" || phase === "early") ? 0.86 : 0.58) * phaseWeights.defense;
    score += getJosekiDefenseResponseScore(state, player, action, nextState) * phaseWeights.defense;
    if (afterRisk > beforeRisk && (phase === "setup" || phase === "early")) {
      score -= Math.min(260000, (afterRisk - beforeRisk) * 0.48);
    }
    if ((phase === "setup" || phase === "early") && afterLanding < -90000) {
      score -= 36000;
    }
    if ((phase === "setup" || phase === "early") && afterBand < -16000 && !emergencyMode) {
      score -= 18000;
    }
    if ((phase === "setup" || phase === "early") && afterGate < -16000 && !emergencyMode) {
      score -= 54000;
    }
    if ((phase === "setup" || phase === "early") && afterRelief < -26000 && !emergencyMode) {
      score -= 62000;
    }
    if ((phase === "setup" || phase === "early") && afterThreatCreation > beforeThreatCreation && !emergencyMode) {
      score -= Math.min(220000, (afterThreatCreation - beforeThreatCreation) * 0.68);
    }
    if (afterPieceThreat > beforePieceThreat && !emergencyMode) {
      score -= Math.min(260000, (afterPieceThreat - beforePieceThreat) * ((phase === "setup" || phase === "early") ? 0.72 : 0.48));
    }
    if ((strategy === "defense" || strategy === "balanced") && phase !== "late" && afterCounter <= beforeCounter && !emergencyMode) {
      score -= strategy === "defense" ? 11000 : 6500;
    }
    if (strategy === "balanced" && (phase === "setup" || phase === "early")) {
      if (action.type === "move" || action.type === "reserve" || action.type === "fragment") {
        score -= findImmediateWinningThreatsShallow(nextState, player, 3).length * 9000;
      }
      score += (getDefenseCriteriaScoreForPlayer(nextState, player) - getDefenseCriteriaScoreForPlayer(state, player)) * 0.22;
    }
    if (phase === "late") {
      score += (getClosingPressureScoreForPlayer(nextState, player) - getClosingPressureScoreForPlayer(state, player)) * (0.16 * phaseWeights.closing);
      if (!nextState.winner && !findImmediateWinningThreatsShallow(nextState, player, 2).length && action.type === "mulligan") {
        score -= 10000;
      }
    }
    if (action.type === "recoverPiece" || action.type === "recoverFragment") {
      score += getPurposefulRecoveryScore(state, player, action, nextState) * phaseWeights.recovery;
    }
    score += getCounterattackTransitionActionBias(state, action, player, nextState, emergencyMode) * phaseWeights.counter;
    if (isKingUnderThreatInState(nextState, opponent)) {
      score += 5000 * phaseWeights.attack;
    }
    return score;
  }

  function getNpcStrategyActionBias(state, action, player, nextState, emergencyMode) {
    var strategy = getNpcStrategy(player);
    var score = 0;
    var piece;
    var cell;
    if (strategy === "attack") {
      if ((action.type === "move" || action.type === "reserve") && typeof action.row === "number") {
        score += getBaseCenterTargetBonus(player, action.row, action.col) * 900;
      }
      if (action.type === "fragment") {
        action.cells.forEach(function (fragmentCell) {
          score += getBaseCenterTargetBonus(player, fragmentCell.row, fragmentCell.col) * 420;
        });
      }
      return score;
    }
    if (strategy === "balanced") {
      var balancedPhase = getNpcGamePhase(state);
      if (balancedPhase === "setup" || balancedPhase === "early") {
        if (action.type === "move") {
          var balancedPiece = getPiece(state, action.pieceId);
          score += getOwnBaseFortressCellBonus(state, player, action.row, action.col) * 24;
          score += getOwnBaseGateCellBonus(state, player, action.row, action.col) * 24;
          score += getOwnBaseReliefCellBonus(state, player, balancedPiece ? balancedPiece.kind : null, action.row, action.col) * 28;
          score += getOwnKingShieldLineBonus(state, player, action.row, action.col) * 34;
          score += getOwnKingImmediateGuardBonus(state, player, action.row, action.col) * 4.5;
        } else if (action.type === "reserve") {
          score += getOwnBaseFortressCellBonus(state, player, action.row, action.col) * 28;
          score += getOwnBaseGateCellBonus(state, player, action.row, action.col) * 28;
          score += getOwnBaseReliefCellBonus(state, player, action.pieceType, action.row, action.col) * 32;
          score += getOwnKingShieldLineBonus(state, player, action.row, action.col) * 38;
          score += getOwnKingImmediateGuardBonus(state, player, action.row, action.col) * 5.2;
        } else if (action.type === "fragment") {
          action.cells.forEach(function (fragmentCell) {
            score += getOwnBaseFortressCellBonus(state, player, fragmentCell.row, fragmentCell.col) * 16;
            score += getOwnBaseGateCellBonus(state, player, fragmentCell.row, fragmentCell.col) * 18;
            score += getOwnBaseReliefCellBonus(state, player, action.card ? action.card.pieceType : null, fragmentCell.row, fragmentCell.col) * 18;
            score += getOwnKingShieldLineBonus(state, player, fragmentCell.row, fragmentCell.col) * 22;
            score += getOwnKingImmediateGuardBonus(state, player, fragmentCell.row, fragmentCell.col) * 3.5;
          });
          if (action.pieceCell) {
            score += getOwnBaseGateCellBonus(state, player, action.pieceCell.row, action.pieceCell.col) * 42;
            score += getOwnBaseReliefCellBonus(state, player, action.card ? action.card.pieceType : null, action.pieceCell.row, action.pieceCell.col) * 44;
            score += getOwnKingShieldLineBonus(state, player, action.pieceCell.row, action.pieceCell.col) * 58;
            score += getOwnKingImmediateGuardBonus(state, player, action.pieceCell.row, action.pieceCell.col) * 7;
          }
        }
      } else if (balancedPhase === "late") {
        score += getGameClosingUrgency(state) * 4200;
      }
      if (nextState) {
        score += (getCounterPressureScoreForPlayer(nextState, player) - getCounterPressureScoreForPlayer(state, player)) * 0.12;
      }
      return score;
    }
    if (strategy !== "defense") {
      return 0;
    }
    if (action.type === "move") {
      piece = getPiece(state, action.pieceId);
      if (piece && piece.kind === "king" && state.turnNumber <= 18) {
        score -= emergencyMode ? 9000 : 24000;
      }
      if (doesActionMoveKingOffOwnBaseCenter(state, player, action)) {
        score -= emergencyMode ? 52000 : 98000;
      }
      if (piece && piece.kind === "king" && nextState && isKingUnderThreatInState(nextState, player)) {
        score -= 260000;
      }
      score += getOwnBaseFortressCellBonus(state, player, action.row, action.col) * 58;
      score += getOwnBaseGateCellBonus(state, player, action.row, action.col) * 92;
      score += getOwnBaseReliefCellBonus(state, player, piece ? piece.kind : null, action.row, action.col) * 108;
      score += getOwnKingShieldLineBonus(state, player, action.row, action.col) * 82;
      score += getOwnKingImmediateGuardBonus(state, player, action.row, action.col) * 8.5;
      cell = state.board[action.row][action.col];
      if (cell && cell.pieceId) {
        var targetPiece = getPiece(state, cell.pieceId);
        if (targetPiece && targetPiece.owner !== player && targetPiece.kind !== "king" && getOwnBaseFortressCellBonus(state, player, action.row, action.col) < 30) {
          score -= getDefenseCounterattackWindow(state, player) > 0.35 ? 900 : 4800;
        }
      }
    } else if (action.type === "reserve") {
      score += getOwnBaseFortressCellBonus(state, player, action.row, action.col) * 64;
      score += getOwnBaseGateCellBonus(state, player, action.row, action.col) * 106;
      score += getOwnBaseReliefCellBonus(state, player, action.pieceType, action.row, action.col) * 118;
      score += getOwnKingShieldLineBonus(state, player, action.row, action.col) * 94;
      score += getOwnKingImmediateGuardBonus(state, player, action.row, action.col) * 9.5;
    } else if (action.type === "setupPiece") {
      score += getOwnBaseFortressCellBonus(state, player, action.row, action.col) * 72;
      score += getOwnBaseReliefCellBonus(state, player, action.pieceType || (action.card ? action.card.pieceType : null), action.row, action.col) * 146;
      score += getOwnKingShieldLineBonus(state, player, action.row, action.col) * 116;
      score += getOwnKingImmediateGuardBonus(state, player, action.row, action.col) * 10;
    } else if (action.type === "fragment") {
      action.cells.forEach(function (fragmentCell) {
        score += getOwnBaseFortressCellBonus(state, player, fragmentCell.row, fragmentCell.col) * 46;
        score += getOwnBaseGateCellBonus(state, player, fragmentCell.row, fragmentCell.col) * 58;
        score += getOwnBaseReliefCellBonus(state, player, action.card ? action.card.pieceType : null, fragmentCell.row, fragmentCell.col) * 54;
        score += getOwnKingShieldLineBonus(state, player, fragmentCell.row, fragmentCell.col) * 62;
        score += getOwnKingImmediateGuardBonus(state, player, fragmentCell.row, fragmentCell.col) * 5.5;
      });
      if (action.pieceCell) {
        score += getOwnBaseFortressCellBonus(state, player, action.pieceCell.row, action.pieceCell.col) * 72;
        score += getOwnBaseGateCellBonus(state, player, action.pieceCell.row, action.pieceCell.col) * 128;
        score += getOwnBaseReliefCellBonus(state, player, action.card ? action.card.pieceType : null, action.pieceCell.row, action.pieceCell.col) * 146;
        score += getOwnKingShieldLineBonus(state, player, action.pieceCell.row, action.pieceCell.col) * 116;
        score += getOwnKingImmediateGuardBonus(state, player, action.pieceCell.row, action.pieceCell.col) * 10;
      }
    } else if (action.type === "recoverPiece") {
      piece = getPiece(state, action.pieceId);
      if (piece && isCellThreatenedInState(state, getOpponentPlayer(player), piece.row, piece.col)) {
        score += 12000 + getPieceStrategicValue(piece.kind) * 30;
      }
      if (piece && getDistanceToOwnBaseInState(state, player, piece.row, piece.col) > 4) {
        score += 5200;
      }
      if (piece) {
        score -= getOwnKingShieldLineBonus(state, player, piece.row, piece.col) * 95;
        score -= getOwnBaseGateCellBonus(state, player, piece.row, piece.col) * 86;
      }
    } else if (action.type === "recoverFragment") {
      score += 1800;
    }
    if (nextState) {
      score += (getBaseCenterShieldScoreForPlayer(nextState, player) - getBaseCenterShieldScoreForPlayer(state, player)) * 1.15;
      score += (getOwnBaseGateControlScoreForPlayer(nextState, player) - getOwnBaseGateControlScoreForPlayer(state, player)) * 0.74;
      score += (getOwnBaseReliefScoreForPlayer(nextState, player) - getOwnBaseReliefScoreForPlayer(state, player)) * 0.82;
    }
    return score;
  }

  function getFragmentDisruptionScoreForCells(state, player, cells) {
    var opponent = getOpponentPlayer(player);
    var opponentFrontier = getDeploymentFrontierProfile(state, opponent);
    var ownBase = findBaseCenterInState(state, player);
    var enemyBase = findBaseCenterInState(state, opponent);
    var plannedKeys = {};
    var enemyBaseRingDirections = {};
    var ownContacts = 0;
    var plannedContacts = 0;
    var opponentOverlapCount = 0;
    var nearEnemyBaseCount = 0;
    var includesEnemyBaseCenter = false;
    var score = 0;
    cells.forEach(function (cell) {
      plannedKeys[cell.row + ":" + cell.col] = true;
    });
    cells.forEach(function (cell) {
      var boardCell = state.board[cell.row][cell.col];
      var key = cell.row + ":" + cell.col;
      var ownBaseDistance = ownBase ? getWeightedDistance(cell.row, cell.col, ownBase.row, ownBase.col) : 99;
      var enemyBaseDistance = enemyBase ? getWeightedDistance(cell.row, cell.col, enemyBase.row, enemyBase.col) : 99;
      var adjacentOpponent = 0;
      var adjacentOwn = 0;
      var adjacentPlanned = 0;
      if (opponentFrontier.keys[key]) {
        score += 240;
      }
      if (boardCell.controller === opponent && !boardCell.pieceId) {
        opponentOverlapCount += 1;
        score += 220;
        score += Math.max(0, 8 - ownBaseDistance) * 520;
        score += Math.max(0, 6 - enemyBaseDistance) * 360;
      }
      if (enemyBase && cell.row === enemyBase.row && cell.col === enemyBase.col) {
        includesEnemyBaseCenter = true;
      }
      if (enemyBaseDistance <= 2) {
        nearEnemyBaseCount += 1;
      }
      if (enemyBaseDistance === 1 && enemyBase) {
        enemyBaseRingDirections[(cell.row - enemyBase.row) + ":" + (cell.col - enemyBase.col)] = true;
      }
      [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(function (dir) {
        var row = cell.row + dir[0];
        var col = cell.col + dir[1];
        var neighborKey = row + ":" + col;
        if (isInBounds(row, col) && state.board[row][col].controller === opponent) {
          adjacentOpponent += 1;
          score += 32;
        }
        if (isInBounds(row, col) && state.board[row][col].controller === player && !plannedKeys[neighborKey]) {
          adjacentOwn += 1;
        }
        if (plannedKeys[neighborKey]) {
          adjacentPlanned += 1;
        }
      });
      ownContacts += adjacentOwn;
      plannedContacts += adjacentPlanned;
      if (boardCell.controller === opponent && adjacentOpponent >= 2) {
        score += ownBaseDistance <= 6 ? 2200 : 900;
      }
      if (adjacentOwn >= 2) {
        score += 420;
      } else if (adjacentOwn === 0 && adjacentPlanned <= 1) {
        score -= 260;
      }
    });
    var ringDirectionCount = Object.keys(enemyBaseRingDirections).length;
    if (ownContacts >= 2) {
      score += 1800;
    } else if (ownContacts === 0) {
      score -= 3200;
    }
    score += Math.min(8, plannedContacts) * 180;
    if (ringDirectionCount >= 2) {
      score += 9200 + (ringDirectionCount - 2) * 5200;
    } else if (ringDirectionCount === 1) {
      score += 1800;
    }
    if (includesEnemyBaseCenter) {
      score += 24000;
    } else if (nearEnemyBaseCount >= 4 && ringDirectionCount < 2) {
      score -= 4200;
    }
    if (opponentOverlapCount >= 2) {
      score += 1600 + opponentOverlapCount * 420;
    }
    return score;
  }

  function getNormalizedFragmentCells(fragmentType, rotation) {
    return getNormalizedFragmentShape(fragmentType, rotation).cells.map(function (cell) {
      return { row: cell.row, col: cell.col };
    });
  }

  function isFragmentShapeInBoundsAt(shape, anchorRow, anchorCol) {
    return anchorRow >= 0
      && anchorCol >= 0
      && anchorRow + shape.maxRow < BOARD_ROWS
      && anchorCol + shape.maxCol < BOARD_COLS;
  }

  function buildFragmentCellsFromShapeAt(shape, anchorRow, anchorCol) {
    return shape.cells.map(function (cell) {
      return { row: anchorRow + cell.row, col: anchorCol + cell.col };
    });
  }

  function isLegalFragmentShapeAt(shape, anchorRow, anchorCol, player, initialStandby) {
    var board = uiState.state.board;
    var touches = false;
    var touchesBase = false;
    var i;
    var d;
    var row;
    var col;
    var cell;
    var piece;
    var nr;
    var nc;
    if (!isFragmentShapeInBoundsAt(shape, anchorRow, anchorCol)) {
      return false;
    }
    if (typeof initialStandby !== "boolean") {
      initialStandby = isInitialStandbyPhase(uiState.state);
    }
    for (i = 0; i < shape.cells.length; i += 1) {
      row = anchorRow + shape.cells[i].row;
      col = anchorCol + shape.cells[i].col;
      cell = board[row][col];
      if (cell.controller === player) {
        return false;
      }
      piece = cell.pieceId ? getPiece(uiState.state, cell.pieceId) : null;
      if (piece && piece.owner !== player) {
        return false;
      }
      if (touches && (!initialStandby || touchesBase)) {
        continue;
      }
      for (d = 0; d < CARDINAL_DIRS.length; d += 1) {
        nr = row + CARDINAL_DIRS[d][0];
        nc = col + CARDINAL_DIRS[d][1];
        if (nr < 0 || nr >= BOARD_ROWS || nc < 0 || nc >= BOARD_COLS) {
          continue;
        }
        if (board[nr][nc].controller === player) {
          touches = true;
        }
        if (initialStandby && !touchesBase && isBaseTerritoryCell(nr, nc, player)) {
          touchesBase = true;
        }
      }
    }
    return touches && (!initialStandby || touchesBase);
  }

  function getNpcFragmentPlacements(player, card, options) {
    var frontierLimit = options && options.frontierLimit ? Number(options.frontierLimit) : 0;
    var cacheKey = null;
    var initialStandby = isInitialStandbyPhase(uiState.state);
    var frontierCells = initialStandby
      ? getInitialStandbyBaseTouchCells(player)
      : getNpcFrontierCells(player);
    var placements = [];
    var seen = {};
    var rotation;
    var shape;
    var frontierIndex;
    var shapeIndex;
    var frontierCell;
    var shapeCell;
    var anchorRow;
    var anchorCol;
    var anchor;
    var key;
    if (activeNpcSearchCache) {
      cacheKey = getCachedNpcSearchStateKey(uiState.state) +
        "|fragmentPlacements|" + player +
        "|" + getCardSearchKey(card) +
        "|" + frontierLimit;
      if (Object.prototype.hasOwnProperty.call(activeNpcSearchCache.fragmentPlacements, cacheKey)) {
        return activeNpcSearchCache.fragmentPlacements[cacheKey].slice();
      }
    }
    frontierCells = rankNpcFrontierCells(player, frontierCells, frontierLimit);
    for (rotation = 0; rotation < 4; rotation += 1) {
      shape = getNormalizedFragmentShape(card.fragmentType, rotation);
      for (frontierIndex = 0; frontierIndex < frontierCells.length; frontierIndex += 1) {
        frontierCell = frontierCells[frontierIndex];
        for (shapeIndex = 0; shapeIndex < shape.cells.length; shapeIndex += 1) {
          shapeCell = shape.cells[shapeIndex];
          anchorRow = frontierCell.row - shapeCell.row;
          anchorCol = frontierCell.col - shapeCell.col;
          key = rotation + ":" + anchorRow + ":" + anchorCol;
          if (seen[key]) {
            continue;
          }
          seen[key] = true;
          if (!isLegalFragmentShapeAt(shape, anchorRow, anchorCol, player, initialStandby)) {
            continue;
          }
          anchor = { row: anchorRow, col: anchorCol };
          placements.push({
            rotation: rotation,
            anchor: anchor,
            cells: buildFragmentCellsFromShapeAt(shape, anchorRow, anchorCol)
          });
        }
      }
    }
    if (cacheKey) {
      activeNpcSearchCache.fragmentPlacements[cacheKey] = placements;
    }
    return placements;
  }

  function getNpcPlacementOptionSummaryForState(state, player) {
    return getCachedNpcEvalMetric(state, player, "placementOptions", function () {
      return withTemporaryState(state, function () {
        var playerState = ensurePlayerStateContainers(uiState.state, player);
        var seenCells = {};
        var optionCount = 0;
        var cellCount = 0;
        var limit = isInitialStandbyPhase(uiState.state) ? 18 : 14;

        function addCells(cells) {
          (cells || []).forEach(function (cell) {
            seenCells[cell.row + ":" + cell.col] = true;
          });
        }

        if (!playerState) {
          return { options: 0, cells: 0 };
        }
        (playerState.hand || []).forEach(function (card) {
          var placements = getNpcFragmentPlacements(player, card, { frontierLimit: limit }).slice(0, 96);
          optionCount += placements.length;
          placements.forEach(function (placement) {
            addCells(placement.cells);
          });
        });
        getFragmentReserveEntries(playerState).forEach(function (entry) {
          var placements = getNpcFragmentPlacements(player, entry.card, { frontierLimit: limit }).slice(0, 64);
          optionCount += placements.length * Math.max(1, entry.count || 1);
          placements.forEach(function (placement) {
            addCells(placement.cells);
          });
        });
        cellCount = Object.keys(seenCells).length;
        return {
          options: Math.min(260, optionCount),
          cells: Math.min(160, cellCount)
        };
      });
    });
  }

  function getTerritoryThicknessScoreForPlayer(state, player) {
    return getCachedNpcEvalMetric(state, player, "territoryThickness", function () {
      var score = 0;
      var row;
      var col;
      for (row = 0; row < BOARD_ROWS; row += 1) {
        for (col = 0; col < BOARD_COLS; col += 1) {
          var cell = state.board[row][col];
          var ownNeighbors = 0;
          var stackHeight = cell && cell.stack ? cell.stack.length : 0;
          if (!cell || cell.controller !== player) {
            continue;
          }
          CARDINAL_DIRS.forEach(function (dir) {
            var nr = row + dir[0];
            var nc = col + dir[1];
            if (nr >= 0 && nr < BOARD_ROWS && nc >= 0 && nc < BOARD_COLS &&
              state.board[nr][nc].controller === player) {
              ownNeighbors += 1;
            }
          });
          score += 18 + ownNeighbors * 16 + Math.min(4, stackHeight) * 18;
          if (cell.pieceId) {
            score += 34;
          }
          if (getOwnBaseGateCellBonus(state, player, row, col) > 0) {
            score += 120 + ownNeighbors * 24;
          }
          if (cell.isBaseCenter && cell.baseOwner === player) {
            score += cell.pieceId ? 420 : 180;
          }
        }
      }
      return score;
    });
  }

  function getPathBlockageScoreForPlayer(state, player) {
    return getCachedNpcEvalMetric(state, player, "pathBlockage", function () {
      var opponent = getOpponentPlayer(player);
      var base = findBaseCenterInState(state, player);
      var score = 0;
      var step;
      var dc;
      if (!base) {
        return 0;
      }
      for (step = 1; step <= 7; step += 1) {
        var row = base.row + (player === "P1" ? -step : step);
        if (row < 0 || row >= BOARD_ROWS) {
          continue;
        }
        for (dc = -2; dc <= 2; dc += 1) {
          var col = base.col + dc;
          var cell;
          var piece;
          if (col < 0 || col >= BOARD_COLS) {
            continue;
          }
          cell = state.board[row][col];
          if (cell.controller === player) {
            score += (8 - step) * (dc === 0 ? 70 : 42);
          } else if (cell.controller === opponent) {
            score -= (8 - step) * (dc === 0 ? 88 : 52);
          }
          if (cell.pieceId) {
            piece = getPiece(state, cell.pieceId);
            if (piece && piece.owner === player) {
              score += (8 - step) * 24;
            } else if (piece && piece.owner === opponent) {
              score -= (8 - step) * 34;
            }
          }
        }
      }
      return score;
    });
  }

  function getTerritoryPuzzleScoreForPlayer(state, player) {
    return getCachedNpcEvalMetric(state, player, "territoryPuzzle", function () {
      var placementSummary = getNpcPlacementOptionSummaryForState(state, player);
      var opponentPlacementSummary = getNpcPlacementOptionSummaryForState(state, getOpponentPlayer(player));
      return placementSummary.options * 42 +
        placementSummary.cells * 86 -
        opponentPlacementSummary.options * 36 -
        opponentPlacementSummary.cells * 74 +
        getTerritoryThicknessScoreForPlayer(state, player) * 1.35 +
        getPathBlockageScoreForPlayer(state, player) * 1.05;
    });
  }

  function collectNpcInitialSetupCandidateActionsForState(state, player) {
    var actions = [];
    if (isInitialStandbyBasePieceRule(state)) {
      return collectNpcInitialSetupPieceActionsForState(state, player);
    }
    return withTemporaryState(state, function () {
    state.players[player].hand.forEach(function (card, handIndex) {
      getNpcFragmentPlacements(player, card).forEach(function (placement) {
        var pieceCell = pickInitialStandbyPieceCell(player, card.pieceType, placement.cells);
        var action;
        if (!pieceCell) {
          return;
        }
          action = {
            type: "setupFragment",
            handIndex: handIndex,
            card: card,
            rotation: placement.rotation,
            anchor: placement.anchor,
            cells: placement.cells,
            pieceCell: { row: pieceCell.row, col: pieceCell.col },
            score: 0
          };
          action.score =
            scoreNpcSetupFragmentAction(player, card, placement.cells) +
            pieceCell.score * 0.22 +
            getOwnBaseGateCellBonus(uiState.state, player, pieceCell.row, pieceCell.col) * 145 +
            getOwnKingShieldLineBonus(uiState.state, player, pieceCell.row, pieceCell.col) * 12 +
            getSetupSafetyActionBias(uiState.state, player, action) +
            getInitialSetupTacticalBias(uiState.state, player, action);
          actions.push(action);
        });
      });
      return actions;
    });
  }

  function collectNpcInitialSetupPieceActionsForState(state, player) {
    return withTemporaryState(state, function () {
      var actions = [];
      var cells = getInitialStandbyBasePieceCellsForState(state, player);
      state.players[player].hand.forEach(function (card, handIndex) {
        cells.forEach(function (cell) {
          actions.push({
            type: "setupPiece",
            handIndex: handIndex,
            card: card,
            pieceType: card.pieceType,
            row: cell.row,
            col: cell.col,
            score: scoreNpcSetupPieceAction(player, card, cell.row, cell.col)
          });
        });
      });
      return actions;
    });
  }

  function countPiecesForPlayerInState(state, player) {
    return Object.keys(state.players[player].pieces).length;
  }

  function getInitialSetupPlanningKey(state, player) {
    return [
      player,
      getInitialStandbyPlacedCount(state, player),
      state.players[player].hand.map(function (card) {
        return card.fragmentType + "/" + card.pieceType;
      }).join(","),
      state.placements
        .filter(function (placement) { return placement.owner === player; })
        .map(function (placement) {
          return placement.card.fragmentType + ":" + placement.cells.map(function (cell) {
            return cell.row + "." + cell.col;
          }).join("-");
        })
        .sort()
        .join("|"),
      Object.keys(state.players[player].pieces)
        .map(function (pieceId) {
          var piece = state.players[player].pieces[pieceId];
          return piece.kind + ":" + piece.row + "." + piece.col;
        })
        .sort()
        .join("|")
    ].join("::");
  }

  function simulateInitialSetupActionForPlayer(state, player, action) {
    var nextState = cloneNpcSimulationState(state);
    var setup = ensureInitialSetupState(nextState);
    if (action.type === "setupPiece") {
      moveInitialStandbyCardToHeldFragment(nextState, player, action.handIndex, action.card);
      addPiece(nextState, player, action.pieceType || action.card.pieceType, action.row, action.col);
    } else {
      addFragmentPlacementToState(nextState, player, action.card, action.handIndex, action.cells, false);
    }
    if (action.type !== "setupPiece" && action.pieceCell) {
      addPiece(nextState, player, action.card.pieceType, action.pieceCell.row, action.pieceCell.col);
    }
    setup.placed[player] = Math.min(
      INITIAL_STANDBY_PLACEMENTS,
      normalizeInitialStandbyCount(setup.placed[player]) + 1
    );
    nextState.currentPlayer = player;
    nextState.phase = "standby";
    return nextState;
  }

  function canCompleteInitialSetupFromState(state, player, memo) {
    var key;
    var actions;
    if (getInitialStandbyPlacedCount(state, player) >= INITIAL_STANDBY_PLACEMENTS) {
      return true;
    }
    key = getInitialSetupPlanningKey(state, player);
    if (Object.prototype.hasOwnProperty.call(memo, key)) {
      return memo[key];
    }
    actions = collectNpcInitialSetupCandidateActionsForState(state, player).sort(function (a, b) {
      return b.score - a.score;
    });
    memo[key] = actions.some(function (action) {
      return canCompleteInitialSetupFromState(
        simulateInitialSetupActionForPlayer(state, player, action),
        player,
        memo
      );
    });
    return memo[key];
  }

  function doesInitialSetupActionKeepCompletion(player, action) {
    if (!isInitialStandbyPhase(uiState.state)
      || getInitialStandbyPlacedCount(uiState.state, player) >= INITIAL_STANDBY_PLACEMENTS - 1) {
      return true;
    }
    return canCompleteInitialSetupFromState(
      simulateInitialSetupActionForPlayer(uiState.state, player, action),
      player,
      {}
    );
  }

  function collectNpcInitialSetupActions(player) {
    var actions = collectNpcInitialSetupCandidateActionsForState(uiState.state, player);
    var penaltyAction;
    if (actions.length) {
      return actions;
    }
    penaltyAction = createInitialStandbyPenaltyActionForState(uiState.state, player);
    if (penaltyAction) {
      return [penaltyAction];
    }
    return actions;
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

  function countOwnPieceSupportInState(state, player, targetPiece) {
    if (!state || !targetPiece || !state.players[player]) {
      return 0;
    }
    return withTemporaryState(state, function () {
      var cell = state.board[targetPiece.row] && state.board[targetPiece.row][targetPiece.col];
      var previousPieceId = cell ? cell.pieceId : null;
      var pieces = state.players[player].pieces;
      var support = 0;
      if (!cell) {
        return 0;
      }
      cell.pieceId = null;
      try {
        Object.keys(pieces).forEach(function (pieceId) {
          if (pieceId === targetPiece.id) {
            return;
          }
          if (canMovePiece(pieces[pieceId], targetPiece.row, targetPiece.col)) {
            support += 1;
          }
        });
      } finally {
        cell.pieceId = previousPieceId;
      }
      return support;
    });
  }

  function simulatePieceCaptureForExchange(state, attackerPiece, targetPiece) {
    var nextState;
    var nextAttacker;
    var nextTarget;
    var originCell;
    var targetCell;
    if (!state || !attackerPiece || !targetPiece) {
      return null;
    }
    nextState = cloneNpcSimulationState(state);
    nextAttacker = getPiece(nextState, attackerPiece.id);
    nextTarget = getPiece(nextState, targetPiece.id);
    if (!nextAttacker || !nextTarget) {
      return null;
    }
    originCell = nextState.board[nextAttacker.row] && nextState.board[nextAttacker.row][nextAttacker.col];
    targetCell = nextState.board[nextTarget.row] && nextState.board[nextTarget.row][nextTarget.col];
    if (!targetCell) {
      return null;
    }
    if (originCell) {
      originCell.pieceId = null;
    }
    delete nextState.players[nextTarget.owner].pieces[nextTarget.id];
    nextAttacker.row = targetPiece.row;
    nextAttacker.col = targetPiece.col;
    targetCell.pieceId = nextAttacker.id;
    return nextState;
  }

  function getPieceFormationAnchorScore(state, player, piece) {
    var ownBase;
    var ownKing;
    var baseDistance;
    var kingDistance;
    var value;
    var score = 0;
    if (!state || !piece || !state.players[player]) {
      return 0;
    }
    if (piece.kind === "king") {
      return 900000;
    }
    value = getPieceStrategicValue(piece.kind);
    ownBase = findBaseCenterInState(state, player);
    ownKing = findKingInState(state, player);
    score += getOwnBaseFortressCellBonus(state, player, piece.row, piece.col) * 115;
    score += getOwnBaseGateCellBonus(state, player, piece.row, piece.col) * 125;
    score += getOwnBaseReliefCellBonus(state, player, piece.kind, piece.row, piece.col) * 110;
    score += getOwnKingShieldLineBonus(state, player, piece.row, piece.col) * 95;
    if (isBaseReliefPieceType(piece.kind)) {
      score += value * 95;
    }
    if (ownBase) {
      baseDistance = getWeightedDistance(piece.row, piece.col, ownBase.row, ownBase.col);
      if (baseDistance <= 2) {
        score += (3 - baseDistance) * (7600 + value * 115);
      }
      if (piece.row === ownBase.row && piece.col === ownBase.col) {
        score += 78000;
      }
    }
    if (ownKing) {
      kingDistance = getWeightedDistance(piece.row, piece.col, ownKing.row, ownKing.col);
      if (kingDistance <= 2) {
        score += (3 - kingDistance) * (6800 + value * 95);
      }
    }
    return Math.max(0, score);
  }

  function getBestRecaptureAfterExchangeScore(captureState, defender, targetRow, targetCol, attackerPiece) {
    var pieces;
    var bestRecovery = 0;
    var bestExchange = 0;
    var count = 0;
    if (!captureState || !captureState.players[defender] || !attackerPiece) {
      return { count: 0, recovery: 0, exchange: 0 };
    }
    pieces = captureState.players[defender].pieces;
    return withTemporaryState(captureState, function () {
      Object.keys(pieces).forEach(function (pieceId) {
        var piece = pieces[pieceId];
        var value;
        var recovery;
        var exchange;
        if (!canMovePiece(piece, targetRow, targetCol)) {
          return;
        }
        count += 1;
        value = getPieceStrategicValue(piece.kind);
        recovery = getPieceFormationAnchorScore(captureState, defender, {
          id: piece.id,
          owner: piece.owner,
          kind: piece.kind,
          row: targetRow,
          col: targetCol
        });
        exchange = getPieceStrategicValue(attackerPiece.kind) * 880 - value * 390;
        if (piece.kind === "king") {
          exchange -= 42000;
        } else {
          exchange += 9000;
        }
        bestRecovery = Math.max(bestRecovery, recovery);
        bestExchange = Math.max(bestExchange, exchange);
      });
      return { count: count, recovery: bestRecovery, exchange: bestExchange };
    });
  }

  function getCaptureExchangeThreatSeverity(state, defender, targetPiece, attackerPiece, support) {
    var targetValue;
    var attackerValue;
    var formationValue;
    var captureState;
    var recapture;
    var exchangeLoss;
    var shapeLoss;
    var severity;
    if (!targetPiece || !attackerPiece) {
      return 0;
    }
    if (targetPiece.kind === "king") {
      return 460000 + getPieceStrategicValue(attackerPiece.kind) * 520;
    }
    targetValue = getPieceStrategicValue(targetPiece.kind);
    attackerValue = getPieceStrategicValue(attackerPiece.kind);
    formationValue = getPieceFormationAnchorScore(state, defender, targetPiece);
    captureState = simulatePieceCaptureForExchange(state, attackerPiece, targetPiece);
    recapture = captureState
      ? getBestRecaptureAfterExchangeScore(captureState, defender, targetPiece.row, targetPiece.col, attackerPiece)
      : { count: support || 0, recovery: 0, exchange: 0 };
    exchangeLoss = targetValue - attackerValue;
    shapeLoss = Math.max(0, formationValue - recapture.recovery * 0.82);
    severity = 10000 + targetValue * 1280 + formationValue * 0.88 + Math.max(0, exchangeLoss) * 1180;
    if (recapture.count) {
      severity -= 14000 + attackerValue * 680 + Math.max(0, attackerValue - targetValue) * 1180;
      severity -= Math.max(0, recapture.exchange) * 0.22;
      severity += shapeLoss * 0.62;
      if (attackerPiece.kind === "king") {
        severity *= 0.42;
      }
    } else {
      severity += 15500 + targetValue * 430 + formationValue * 0.28;
    }
    if (captureState && isKingUnderThreatInState(captureState, defender)) {
      severity += 76000;
    }
    if (attackerValue <= targetValue * 0.72 && formationValue > 24000) {
      severity += 18000 + (targetValue - attackerValue) * 520;
    }
    return Math.max(0, severity);
  }

  function computePieceCaptureThreatScoreForPlayer(state, player) {
      var opponent = getOpponentPlayer(player);
      var attackMap = getAttackMapForStateCached(state, opponent);
      var pieces = state.players[player].pieces;
      var score = 0;
      Object.keys(pieces).forEach(function (pieceId) {
        var piece = pieces[pieceId];
        var key = piece.row + ":" + piece.col;
        var attackers = attackMap.attackers[key] || [];
        var support;
        var localScore;
        var bestAttackerScore = 0;
        if (!attackers.length) {
          return;
        }
        support = countOwnPieceSupportInState(state, player, piece);
        attackers.forEach(function (attackerId) {
          var attacker = getPiece(state, attackerId);
          if (!attacker || attacker.owner !== opponent) {
            return;
          }
          bestAttackerScore = Math.max(
            bestAttackerScore,
            getCaptureExchangeThreatSeverity(state, player, piece, attacker, support)
          );
        });
        if (piece.kind === "king") {
          localScore = 460000 + Math.min(4, attackers.length) * 52000;
        } else {
          localScore = bestAttackerScore;
          localScore += Math.max(0, attackers.length - 1) * (5200 + getPieceStrategicValue(piece.kind) * 240);
          if (!support) {
            localScore += 12000 + getPieceStrategicValue(piece.kind) * 360;
          } else {
            localScore -= Math.min(3, support) * (2200 + getPieceStrategicValue(piece.kind) * 110);
          }
        }
        score += Math.max(0, localScore);
      });
      return Math.round(score);
  }

  function getPieceCaptureThreatScoreForPlayer(state, player) {
    if (!state || !state.players[player]) {
      return 0;
    }
    if (state === uiState.state && !activeNpcSearchCache) {
      return computePieceCaptureThreatScoreForPlayer(state, player);
    }
    return getCachedNpcEvalMetric(state, player, "pieceCaptureThreat", function () {
      return computePieceCaptureThreatScoreForPlayer(state, player);
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
    } else if (action.type === "setupFragment") {
      addFragmentPlacementToState(state, player, action.card, action.handIndex, action.cells, false);
      if (action.pieceCell) {
        addPiece(state, player, action.card.pieceType, action.pieceCell.row, action.pieceCell.col);
      }
      advanceInitialStandbyForState(state, player);
      return;
    } else if (action.type === "setupPiece") {
      moveInitialStandbyCardToHeldFragment(state, player, action.handIndex, action.card);
      addPiece(state, player, action.pieceType || action.card.pieceType, action.row, action.col);
      advanceInitialStandbyForState(state, player);
      return;
    } else if (action.type === "setupPenalty") {
      completeInitialStandbyWithPenaltyForState(state, player);
      resolveBlockedInitialStandbyPenaltiesForState(state);
      return;
    } else if (action.type === "fragment") {
      var shouldRefillAfterFragmentPiece = action.source !== "fragmentReserve" && action.card && !!action.card.pieceType;
      placement = addFragmentPlacementToState(
        state,
        player,
        action.card,
        action.handIndex,
        action.cells,
        false,
        { source: action.source || "hand", fragmentReserveKey: action.fragmentReserveKey }
      );
      if (!placement) {
        return;
      }
      if (action.pieceCell && action.card.pieceType && action.source !== "fragmentReserve") {
        addPiece(state, player, action.card.pieceType, action.pieceCell.row, action.pieceCell.col);
        if (shouldRefillAfterFragmentPiece) {
          fillHand(state, player);
        }
      }
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
      addFragmentToReserve(state.players[player], {
        fragmentType: placement.card.fragmentType
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
      var strategy = getNpcStrategy(npcPlayer);
      var phase = getNpcGamePhase(state);
      var phaseWeights = getNpcPhaseWeights(strategy, phase);
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
        var kingSafetyDelta = getKingSafetyScoreForPlayer(state, npcPlayer) - getKingSafetyScoreForPlayer(state, opponent);
        var deploymentDelta = getDeploymentControlScoreForPlayer(state, npcPlayer) - getDeploymentControlScoreForPlayer(state, opponent);
        var baseShieldDelta = getBaseCenterShieldScoreForPlayer(state, npcPlayer) - getBaseCenterShieldScoreForPlayer(state, opponent);
        var kingShieldLineDelta = getKingShieldLineScoreForPlayer(state, npcPlayer) - getKingShieldLineScoreForPlayer(state, opponent);
        var defenseCriteriaDelta = getDefenseCriteriaScoreForPlayer(state, npcPlayer) - getDefenseCriteriaScoreForPlayer(state, opponent);
        var closingPressureDelta = getClosingPressureScoreForPlayer(state, npcPlayer) - getClosingPressureScoreForPlayer(state, opponent);
        var fastLossRiskDelta = getFastLossRiskScoreForPlayer(state, npcPlayer) - getFastLossRiskScoreForPlayer(state, opponent);
        var counterPressureDelta = getCounterPressureScoreForPlayer(state, npcPlayer) - getCounterPressureScoreForPlayer(state, opponent);
        var kingLandingDelta = getKingLandingControlScoreForPlayer(state, npcPlayer) - getKingLandingControlScoreForPlayer(state, opponent);
        var defensiveBandDelta = getDefensiveBandScoreForPlayer(state, npcPlayer) - getDefensiveBandScoreForPlayer(state, opponent);
        var openingPressureDelta = getOpeningAttackPressureScoreForPlayer(state, npcPlayer) - getOpeningAttackPressureScoreForPlayer(state, opponent);
        var threatCreationRiskDelta = getThreatCreationRiskScoreForPlayer(state, npcPlayer) - getThreatCreationRiskScoreForPlayer(state, opponent);
        var gateControlDelta = getOwnBaseGateControlScoreForPlayer(state, npcPlayer) - getOwnBaseGateControlScoreForPlayer(state, opponent);
        var baseReliefDelta = getOwnBaseReliefScoreForPlayer(state, npcPlayer) - getOwnBaseReliefScoreForPlayer(state, opponent);
        var pieceCaptureThreatDelta = getPieceCaptureThreatScoreForPlayer(state, npcPlayer) - getPieceCaptureThreatScoreForPlayer(state, opponent);
        var territoryPuzzleDelta = getTerritoryPuzzleScoreForPlayer(state, npcPlayer) - getTerritoryPuzzleScoreForPlayer(state, opponent);
        var counterattackWindow = getDefenseCounterattackWindow(state, npcPlayer);
        var ownImmediateWins = getCachedNpcEvalMetric(state, npcPlayer, "ownImmediateWins3", function () {
          return countImmediateWinningActionsInState(state, npcPlayer, 3);
        });
        var opponentImmediateWins = getCachedNpcEvalMetric(state, npcPlayer, "opponentImmediateWins3", function () {
          return countImmediateWinningActionsInState(state, opponent, 3);
        });
        var closingUrgency = getGameClosingUrgency(state);
        total += (npcAttack.mobility - opponentAttack.mobility) * 3.4 * phaseWeights.attack;
        total += (npcAttack.attackedCells - opponentAttack.attackedCells) * 2.2 * phaseWeights.attack;
        total -= npcAttack.hotCells * 1800;
        total += opponentAttack.hotCells * 900;
        total += (npcAttack.captureValue - opponentAttack.captureValue) * 16 * phaseWeights.attack;
        total += (npcAttack.basePressure - opponentAttack.basePressure) * 4200 * phaseWeights.attack;
        total += (npcAttack.kingPressure - opponentAttack.kingPressure) * 11000 * phaseWeights.attack;
        total += baseCenterPressureDelta * 1.15 * phaseWeights.attack;
        total += roleScoreDelta * 0.9;
        total += kingSafetyDelta * 1.05 * phaseWeights.defense;
        total += deploymentDelta * 0.72;
        total += baseShieldDelta * phaseWeights.defense;
        total += kingShieldLineDelta * 0.92 * phaseWeights.defense;
        total += defenseCriteriaDelta * 0.18 * phaseWeights.defense;
        total += counterPressureDelta * 0.18 * phaseWeights.counter;
        total += kingLandingDelta * 0.42 * phaseWeights.defense;
        total += defensiveBandDelta * ((phase === "setup" || phase === "early") ? 0.46 : 0.14) * phaseWeights.defense;
        total += gateControlDelta * ((phase === "setup" || phase === "early") ? 0.5 : 0.16) * phaseWeights.defense;
        total += baseReliefDelta * ((phase === "setup" || phase === "early") ? 0.56 : 0.2) * phaseWeights.defense;
        total += openingPressureDelta * ((phase === "setup" || phase === "early") ? 0.22 : 0.08) * phaseWeights.counter;
        total += territoryPuzzleDelta * ((phase === "setup" || phase === "early") ? 0.44 : 0.22);
        total -= fastLossRiskDelta * 0.2 * phaseWeights.defense;
        total -= threatCreationRiskDelta * ((phase === "setup" || phase === "early") ? 0.36 : 0.18) * phaseWeights.defense;
        total -= pieceCaptureThreatDelta * ((phase === "setup" || phase === "early") ? 0.92 : 0.74) * phaseWeights.defense;
        if (counterattackWindow) {
          total += counterPressureDelta * 0.34 * counterattackWindow;
          total += closingPressureDelta * 0.3 * counterattackWindow;
          total += openingPressureDelta * 0.18 * counterattackWindow;
          total += baseCenterPressureDelta * 0.72 * counterattackWindow;
        }
        total += ownImmediateWins * 120000 * phaseWeights.attack;
        total -= opponentImmediateWins * 260000 * phaseWeights.defense;
        total += closingPressureDelta * (0.18 + closingUrgency * 0.1) * phaseWeights.closing;
        if (strategy === "attack") {
          total += (npcAttack.basePressure - opponentAttack.basePressure) * 2300;
          total += baseCenterPressureDelta * 0.9;
          total += closingPressureDelta * 0.32;
        } else if (strategy === "defense") {
          total += kingSafetyDelta * 0.7;
          total += baseShieldDelta * 1.15;
          total += kingShieldLineDelta * 0.8;
          total += defenseCriteriaDelta * 0.42;
          total += deploymentDelta * 0.45;
          total += kingLandingDelta * 0.56;
          total += defensiveBandDelta * (phase === "setup" || phase === "early" ? 0.62 : 0.2);
          total += gateControlDelta * (phase === "setup" || phase === "early" ? 0.68 : 0.22);
          total += baseReliefDelta * (phase === "setup" || phase === "early" ? 0.8 : 0.26);
          total += openingPressureDelta * (phase === "setup" || phase === "early" ? 0.18 : 0.05);
          total += territoryPuzzleDelta * (phase === "setup" || phase === "early" ? 0.56 : 0.26);
          total += closingPressureDelta * (0.22 + closingUrgency * 0.12);
          total += counterPressureDelta * 0.16;
          total -= threatCreationRiskDelta * 0.22;
          total -= pieceCaptureThreatDelta * 0.38;
          total -= npcAttack.hotCells * 700;
        } else {
          total += defenseCriteriaDelta * (phase === "early" || phase === "setup" ? 0.28 : 0.14);
          total += kingLandingDelta * (phase === "early" || phase === "setup" ? 0.32 : 0.16);
          total += defensiveBandDelta * (phase === "early" || phase === "setup" ? 0.34 : 0.08);
          total += gateControlDelta * (phase === "early" || phase === "setup" ? 0.28 : 0.08);
          total += baseReliefDelta * (phase === "early" || phase === "setup" ? 0.32 : 0.1);
          total += openingPressureDelta * (phase === "early" || phase === "setup" ? 0.14 : 0.05);
          total += territoryPuzzleDelta * (phase === "early" || phase === "setup" ? 0.32 : 0.14);
          total += closingPressureDelta * (phase === "late" ? 0.2 : -0.05);
          total -= pieceCaptureThreatDelta * (phase === "early" || phase === "setup" ? 0.24 : 0.14);
        }
        total -= npcAttack.hangingPenalty * 9;
        total += opponentAttack.hangingPenalty * 6;
        if (isKingUnderThreatInState(state, npcPlayer)) {
          total -= 95000;
        }
        if (isKingUnderThreatInState(state, opponent)) {
          total += 9000;
        }
        return total;
      }

    function isNpcImmediateWinAction(action, state, player) {
      state = state || uiState.state;
      player = player || state.currentPlayer;
      return !!getImmediateWinningActionKindInState(state, player, action);
    }

    function getNpcMovePickerTerritoryActionScore(state, player, action, emergencyMode) {
      var score = 0;
      var opponent = getOpponentPlayer(player);
      var strategy = getNpcStrategy(player);
      var phase = getNpcGamePhase(state);

      function scoreCell(row, col, weight) {
        var cell = state.board[row] && state.board[row][col];
        var ownNeighbors = 0;
        var opponentNeighbors = 0;
        var stackHeight;
        if (!cell) {
          return;
        }
        CARDINAL_DIRS.forEach(function (dir) {
          var nr = row + dir[0];
          var nc = col + dir[1];
          if (nr < 0 || nr >= BOARD_ROWS || nc < 0 || nc >= BOARD_COLS) {
            return;
          }
          if (state.board[nr][nc].controller === player) {
            ownNeighbors += 1;
          } else if (state.board[nr][nc].controller === opponent) {
            opponentNeighbors += 1;
          }
        });
        stackHeight = cell.stack ? cell.stack.length : 0;
        score += ownNeighbors * 150 * weight;
        score -= opponentNeighbors * 80 * weight;
        score += Math.min(4, stackHeight) * 70 * weight;
        if (cell.controller === opponent) {
          score += (strategy === "defense" ? 340 : 220) * weight;
        } else if (cell.controller === player) {
          score += 95 * weight;
        }
        score += getOwnBaseGateCellBonus(state, player, row, col) * (strategy === "defense" ? 760 : 220) * weight;
        score += getOwnBaseReliefCellBonus(state, player, action.card ? action.card.pieceType : action.pieceType, row, col) * (strategy === "defense" ? 520 : 160) * weight;
        if (cell.isBaseCenter && cell.baseOwner === opponent && !cell.pieceId) {
          score += 900000 * weight;
        }
      }

      if (action.type === "fragment" || action.type === "setupFragment") {
        (action.cells || []).forEach(function (cell) {
          scoreCell(cell.row, cell.col, 1);
        });
        if (action.pieceCell) {
          scoreCell(action.pieceCell.row, action.pieceCell.col, 0.6);
        }
        if (action.source === "fragmentReserve") {
          score += emergencyMode || strategy === "defense" ? 7200 : 2200;
        }
        if (phase === "setup" || phase === "early") {
          score += strategy === "defense" ? 5200 : 1800;
        }
      } else if (action.type === "move" || action.type === "reserve") {
        scoreCell(action.row, action.col, action.type === "reserve" ? 0.78 : 0.62);
      } else if (action.type === "recoverFragment") {
        score += emergencyMode ? 16000 : 2200;
      } else if (action.type === "recoverPiece") {
        score += emergencyMode ? 12000 : 1500;
      }
      return score;
    }

    function getNpcActionMoveOrderScore(state, player, action, emergencyMode) {
      var score = action.refinedScore || action.forceDefenseScore || action.score || 0;
      var phase = getNpcGamePhase(state);
      var strategy = getNpcStrategy(player);
      var opponent = getOpponentPlayer(player);
      var winKind = getImmediateWinningActionKindInState(state, player, action);
      var cell;
      var piece;
      var targetPiece;
      var card;
      if (winKind) {
        score += 4000000 + getImmediateWinningActionPriority(winKind) * 50000;
      }
      if (action.forceDefenseScore) {
        score += action.forceDefenseScore * 0.32;
      }
      score += getNpcMovePickerTerritoryActionScore(state, player, action, emergencyMode);
      score += getOpeningRescueResponseScore(state, player, action) * 1.8;
      score += getNpcOpeningBookActionBias(state, player, action, null, emergencyMode) * 0.35;
      if (action.type === "move") {
        piece = getPiece(state, action.pieceId);
        cell = state.board[action.row] && state.board[action.row][action.col];
        targetPiece = cell && cell.pieceId ? getPiece(state, cell.pieceId) : null;
        if (targetPiece && targetPiece.owner === opponent) {
          score += targetPiece.kind === "king" ? 3500000 : 65000 + getPieceStrategicValue(targetPiece.kind) * 950;
          score += piece ? Math.max(0, getPieceStrategicValue(targetPiece.kind) - getPieceStrategicValue(piece.kind)) * 520 : 0;
        }
        score += getBaseCenterTargetBonus(player, action.row, action.col) * (strategy === "attack" ? 8500 : 2600);
        score += getOwnBaseGateCellBonus(state, player, action.row, action.col) * (strategy === "defense" ? 5200 : 1100);
        score += getOwnBaseReliefCellBonus(state, player, piece ? piece.kind : null, action.row, action.col) * (strategy === "defense" ? 4200 : 900);
        if (piece && piece.kind === "king" && phase !== "late" && !emergencyMode) {
          score -= 52000;
        }
      } else if (action.type === "reserve") {
        score += getBaseCenterTargetBonus(player, action.row, action.col) * (strategy === "attack" ? 7200 : 2400);
        score += getOwnBaseGateCellBonus(state, player, action.row, action.col) * (strategy === "defense" ? 5600 : 1200);
        score += getOwnBaseReliefCellBonus(state, player, action.pieceType, action.row, action.col) * (strategy === "defense" ? 4800 : 1000);
        score += getPieceStrategicValue(action.pieceType) * 120;
      } else if (action.type === "fragment" || action.type === "setupFragment") {
        card = action.card || {};
        score += getKifuFragmentDangerWeight(card, state) * (strategy === "attack" ? 46000 : strategy === "defense" ? 16000 : 28000);
        score += getPieceStrategicValue(card.pieceType) * 160;
        (action.cells || []).forEach(function (fragmentCell) {
          var boardCell = state.board[fragmentCell.row] && state.board[fragmentCell.row][fragmentCell.col];
          score += getBaseCenterTargetBonus(player, fragmentCell.row, fragmentCell.col) * (strategy === "attack" ? 6200 : 2100);
          score += getOwnBaseGateCellBonus(state, player, fragmentCell.row, fragmentCell.col) * (strategy === "defense" ? 3600 : 800);
          score += getOwnBaseReliefCellBonus(state, player, card.pieceType, fragmentCell.row, fragmentCell.col) * (strategy === "defense" ? 3000 : 700);
          if (boardCell && boardCell.isBaseCenter && boardCell.baseOwner === opponent && !boardCell.pieceId) {
            score += 2600000;
          }
        });
        if (action.pieceCell) {
          score += getOwnBaseGateCellBonus(state, player, action.pieceCell.row, action.pieceCell.col) * (strategy === "defense" ? 5200 : 900);
          score += getOwnBaseReliefCellBonus(state, player, card.pieceType, action.pieceCell.row, action.pieceCell.col) * (strategy === "defense" ? 4300 : 850);
        }
      } else if (action.type === "recoverPiece" || action.type === "recoverFragment") {
        score += emergencyMode ? 18000 : -12000;
        if (phase === "early" && strategy === "defense") {
          score += 9000;
        }
      } else if (action.type === "mulligan") {
        score += emergencyMode ? -30000 : -6500;
      }
      if ((phase === "setup" || phase === "early") && strategy === "defense") {
        score += getOpeningRescueResponseScore(state, player, action) * 1.4;
      }
      return score;
    }

    function orderNpcActionsForSearch(state, player, actions, emergencyMode, depth, bestActionKey) {
      return (actions || []).map(function (action, index) {
        action.moveOrderScore = getNpcActionMoveOrderScore(state, player, action, emergencyMode);
        if (bestActionKey && getNpcActionSearchKey(action) === bestActionKey) {
          action.moveOrderScore += 1800000;
        }
        if (isNpcKillerMove(state, player, action, depth)) {
          action.moveOrderScore += 260000;
        }
        action.moveOrderScore += getNpcHistoryScore(state, player, action) * 0.42;
        return {
          action: action,
          index: index
        };
      }).sort(function (a, b) {
        var delta = (b.action.moveOrderScore || 0) - (a.action.moveOrderScore || 0);
        if (delta) {
          return delta;
        }
        delta = (b.action.refinedScore || b.action.forceDefenseScore || b.action.score || 0) -
          (a.action.refinedScore || a.action.forceDefenseScore || a.action.score || 0);
        return delta || a.index - b.index;
      }).map(function (entry) {
        return entry.action;
      });
    }

    function getNpcOpeningBookCandidateActions(state, player, actions, emergencyMode, limit) {
      var phase = getNpcGamePhase(state);
      var candidates = [];
      if (phase !== "setup" && phase !== "early") {
        return candidates;
      }
      actions.forEach(function (action, index) {
        var score = getNpcOpeningBookActionBias(state, player, action, null, emergencyMode);
        if (score <= 0) {
          return;
        }
        candidates.push({
          action: action,
          index: index,
          score: score + (action.moveOrderScore || action.refinedScore || action.score || 0) * 0.02
        });
      });
      candidates.sort(function (a, b) {
        return b.score - a.score || a.index - b.index;
      });
      return candidates.slice(0, limit || (emergencyMode ? 3 : 5)).map(function (entry) {
        return entry.action;
      });
    }

    function getNpcCandidateActions(actions, emergencyMode, state, player) {
      state = state || uiState.state;
      player = player || state.currentPlayer;
      actions = orderNpcActionsForSearch(state, player, actions, emergencyMode);
      var unique = {};
      var selected = [];

      function actionKey(action) {
        return getNpcActionSearchKey(action);
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
          return isNpcImmediateWinAction(action, state, player);
        })
        .forEach(addAction);

      actions
        .filter(function (action) {
          return action.type === "move" && (function () {
            var cell = state.board[action.row][action.col];
            var targetPiece = cell && cell.pieceId ? getPiece(state, cell.pieceId) : null;
            return targetPiece && targetPiece.owner !== player;
          }());
        })
        .slice(0, emergencyMode ? 6 : 8)
        .forEach(addAction);

      if (emergencyMode) {
        getEmergencyDefenseActions(state, player, actions, 12).forEach(addAction);
      }

      getNpcOpeningBookCandidateActions(state, player, actions, emergencyMode, emergencyMode ? 3 : 5)
        .forEach(addAction);

      if (!activeNpcSearchCache && !isNpcGame()) {
        (uiState.npc && uiState.npc.bulkSelfPlay ? actions.slice(0, emergencyMode ? 18 : 32) : actions)
          .filter(function (action) {
            return createsImmediateWinThreatAfterAction(state, player, action, 2);
          })
          .slice(0, emergencyMode ? 4 : 6)
          .forEach(addAction);
      }

      actions
        .filter(function (action) {
          return action.type === "fragment" || action.type === "setupFragment";
        })
        .slice(0, emergencyMode ? 2 : 6)
        .forEach(addAction);

      actions
        .slice(0, emergencyMode ? 8 : 10)
        .forEach(addAction);

      return selected;
    }

    function getDefenseSnapshotUrgency(snapshot) {
      if (!snapshot) {
        return 0;
      }
    return (snapshot.kingCaptureThreats || 0) * 1200000 +
      (snapshot.foldThreats || 0) * 820000 +
      (snapshot.baseInvaded || 0) * 980000 +
      (snapshot.immediateWins || 0) * 420000 +
      (snapshot.baseHot || 0) * 220000 +
        (snapshot.kingThreatened ? 260000 : 0) +
        (snapshot.kingDanger || 0) * 42000 +
        (snapshot.baseThreat || 0) * 16000 +
        (snapshot.dangerCells || 0) * 1800;
    }

    function getEmergencyDefenseActions(state, player, actions, limit) {
      var opponent = getOpponentPlayer(player);
      var baseline = getDefenseSnapshotCached(state, player);
      var baselineUrgency = getDefenseSnapshotUrgency(baseline);
      var scored = [];
      actions.forEach(function (action) {
        var nextState = cloneNpcSimulationState(state);
        var nextSnapshot;
        var nextUrgency;
        var improvement;
        nextState.currentPlayer = player;
        applyNpcActionToState(nextState, action);
        if (nextState.winner === player) {
          improvement = baselineUrgency + 1600000;
        } else if (nextState.winner === opponent) {
          improvement = -1600000;
        } else {
          nextSnapshot = getDefenseSnapshotCached(nextState, player);
          nextUrgency = getDefenseSnapshotUrgency(nextSnapshot);
          improvement = baselineUrgency - nextUrgency;
          if (!isDefenseSnapshotBetter(nextSnapshot, baseline) && improvement <= 0) {
            return;
          }
        }
        action.forceDefenseScore = Math.max(
          action.forceDefenseScore || -Infinity,
          improvement + (action.refinedScore || action.score || 0) * 0.04
        );
        scored.push(action);
      });
      scored.sort(function (a, b) {
        return (b.forceDefenseScore || b.score || 0) - (a.forceDefenseScore || a.score || 0);
      });
      return scored.slice(0, limit || 10);
    }

    function getNpcCandidateActionsQuick(actions, emergencyMode, state, player) {
      state = state || uiState.state;
      player = player || state.currentPlayer;
      actions = orderNpcActionsForSearch(state, player, actions, emergencyMode);
      var unique = {};
      var selected = [];

      function actionKey(action) {
        return getNpcActionSearchKey(action);
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
          return isNpcImmediateWinAction(action, state, player);
        })
        .forEach(addAction);

      actions
        .filter(function (action) {
          return action.type === "move" && (function () {
            var cell = state.board[action.row][action.col];
            var targetPiece = cell && cell.pieceId ? getPiece(state, cell.pieceId) : null;
            return targetPiece && targetPiece.owner !== player;
          }());
        })
        .slice(0, emergencyMode ? 4 : 5)
        .forEach(addAction);

      if (emergencyMode) {
        getEmergencyDefenseActions(state, player, actions, 8).forEach(addAction);
      }

      getNpcOpeningBookCandidateActions(state, player, actions, emergencyMode, emergencyMode ? 2 : 4)
        .forEach(addAction);

      actions
        .filter(function (action) {
          return action.type === "fragment" || action.type === "setupFragment";
        })
        .slice(0, emergencyMode ? 3 : 4)
        .forEach(addAction);

      actions
        .slice(0, emergencyMode ? 7 : 8)
        .forEach(addAction);

      return selected.slice(0, emergencyMode ? 8 : 10);
    }

    function filterImmediateBlunderActionsQuick(state, player, actions) {
      var opponent = getOpponentPlayer(player);
      var safeActions = [];
      if (!actions.length) {
        return actions;
      }
      actions.forEach(function (action) {
        var nextState = cloneNpcSimulationState(state);
        var nextSnapshot;
        nextState.currentPlayer = player;
        applyNpcActionToState(nextState, action);
        if (nextState.winner === player) {
          safeActions.push(action);
          return;
        }
        if (nextState.winner === opponent) {
          action.allowsImmediateLoss = true;
          action.immediateLossCount = 99;
          return;
        }
        nextSnapshot = getDefenseSnapshotCached(nextState, player);
        if (nextSnapshot.kingCaptureThreats > 0 || nextSnapshot.kingThreatened) {
          action.allowsImmediateLoss = true;
          action.immediateLossCount = 99;
          return;
        }
        if (nextSnapshot.foldThreats > 0) {
          action.allowsImmediateLoss = true;
          action.immediateLossCount = 94;
          return;
        }
        if (nextSnapshot.baseInvaded > 0) {
          action.allowsImmediateLoss = true;
          action.immediateLossCount = 93;
          return;
        }
        if (canPlayerOverwriteBaseCenterInState(nextState, opponent, player)) {
          action.allowsImmediateLoss = true;
          action.immediateLossCount = 92;
          return;
        }
        if ((state.turnNumber || 1) <= 12 &&
          doesActionMoveKingOffOwnBaseCenter(state, player, action) &&
          doesNextStateVacateOwnBaseCenterWithoutReplacement(state, player, nextState)) {
          action.allowsImmediateLoss = true;
          action.immediateLossCount = 80;
          return;
        }
        action.immediateLossCount = 0;
        safeActions.push(action);
      });
      if (safeActions.length) {
        return safeActions;
      }
      return actions.slice().sort(function (a, b) {
        var lossDelta = (a.immediateLossCount || 0) - (b.immediateLossCount || 0);
        if (lossDelta) {
          return lossDelta;
        }
        return (b.score || 0) - (a.score || 0);
      }).slice(0, Math.min(actions.length, 4));
    }

    function chooseNpcActionFast(actions, npcPlayer, emergencyMode) {
      var candidates;
      var bestAction = null;
      var bestScore = -Infinity;
      var opponent = getOpponentPlayer(npcPlayer);
      var quickMode = !!(uiState.npc && uiState.npc.selfPlayFast && !uiState.npc.bulkSelfPlay);
      var immediateWins = actions.filter(function (action) {
        return isNpcImmediateWinAction(action, uiState.state, npcPlayer);
      });
      if (immediateWins.length) {
        immediateWins.sort(function (a, b) {
          return compareImmediateWinningActionsInState(uiState.state, npcPlayer, a, b);
        });
        return immediateWins[0];
      }

      actions = orderNpcActionsForSearch(uiState.state, npcPlayer, actions, emergencyMode);
      if (!emergencyMode && getPieceCaptureThreatScoreForPlayer(uiState.state, npcPlayer) >= 90000) {
        emergencyMode = true;
      }
      if (!quickMode && !emergencyMode && countImmediateWinningActionsInState(uiState.state, opponent, 8) > 0) {
        emergencyMode = true;
      }
      if (quickMode) {
        candidates = getNpcCandidateActionsQuick(actions, emergencyMode, uiState.state, npcPlayer);
        candidates = emergencyMode ? filterForcedDefenseActions(uiState.state, npcPlayer, candidates) : candidates;
        candidates = filterImmediateBlunderActionsQuick(uiState.state, npcPlayer, candidates);
        candidates = getNpcCandidateActionsQuick(candidates, emergencyMode, uiState.state, npcPlayer).slice(0, emergencyMode ? 7 : 8);
      } else {
        candidates = shouldUseFullDefenseCandidateSet(uiState.state, npcPlayer)
          ? actions
          : getNpcCandidateActions(actions, emergencyMode, uiState.state, npcPlayer);
        candidates = filterForcedDefenseActions(uiState.state, npcPlayer, candidates);
        candidates = filterImmediateBlunderActions(uiState.state, npcPlayer, candidates);
        candidates = getNpcCandidateActions(candidates, emergencyMode, uiState.state, npcPlayer).slice(0, emergencyMode ? 12 : 14);
      }
      candidates.forEach(function (action) {
        var nextState = cloneNpcSimulationState(uiState.state);
        var score;
        var nextDefenseSnapshot;
        nextState.currentPlayer = npcPlayer;
        applyNpcActionToState(nextState, action);
        if (nextState.winner === npcPlayer) {
          score = 6000000;
        } else if (nextState.winner) {
          score = -6000000;
        } else {
          score = action.score + getNpcStrategyActionBias(uiState.state, action, npcPlayer, nextState, emergencyMode);
          score += getGameClosingActionBias(uiState.state, action, npcPlayer, nextState, emergencyMode);
          score += getNpcPhaseActionBias(uiState.state, action, npcPlayer, nextState, emergencyMode);
          if (isKingUnderThreatInState(nextState, npcPlayer)) {
            score -= 1200000;
          }
          nextDefenseSnapshot = getDefenseSnapshotCached(nextState, npcPlayer);
          if (nextDefenseSnapshot.kingCaptureThreats > 0) {
            score -= 3000000 + nextDefenseSnapshot.kingCaptureThreats * 420000;
          }
          if (nextDefenseSnapshot.foldThreats > 0) {
            score -= 2400000 + nextDefenseSnapshot.foldThreats * 300000;
          }
          if (nextDefenseSnapshot.baseInvaded > 0) {
            score -= 2600000 + nextDefenseSnapshot.baseInvaded * 360000;
          }
          if (!quickMode) {
            score -= countImmediateWinningActionsInState(nextState, opponent, 4) * 52000;
          }
          score += getLongGameActionBias(uiState.state, action, npcPlayer) * 0.35;
        }
        if (score > bestScore || (score === bestScore && action.score > (bestAction ? bestAction.score : -Infinity))) {
          bestScore = score;
          bestAction = action;
        }
      });
      return bestAction || actions[0];
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

  function getLookaheadBreadth(depth, emergencyMode) {
    if (activeNpcSearchCache && uiState.npc && !uiState.npc.bulkSelfPlay) {
      if (emergencyMode) {
        return depth >= 3 ? 4 : 3;
      }
      if (depth >= 3) {
        return 3;
      }
      return 2;
    }
    if (uiState.npc && uiState.npc.bulkSelfPlay) {
      if (emergencyMode) {
        return depth >= 3 ? 4 : 5;
      }
      if (depth >= 3) {
        return 2;
      }
      return 3;
    }
    if (emergencyMode) {
      return depth >= 4 ? 8 : 7;
    }
    if (depth >= 5) {
      return 5;
    }
    if (depth >= 3) {
      return 5;
    }
      return 4;
    }

    function getLookaheadCandidateActions(state, player, actions, depth, emergencyMode, bestActionKey) {
      var candidates;
      var fullDefense = shouldUseFullDefenseCandidateSet(state, player);
      var threatCreationEmergency = false;
      actions = orderNpcActionsForSearch(state, player, actions, emergencyMode, depth, bestActionKey);
      if (depth >= 3 || emergencyMode || (state.turnNumber || 1) <= 10) {
        actions = filterBaseCenterOverwriteEmergencyActions(state, player, actions);
        actions = filterOwnBaseCenterRefillActions(state, player, actions);
        actions = filterOwnBaseVacatingActions(state, player, actions);
        actions = filterEmergencyBaseHoldingActions(state, player, actions);
      }
      if (activeNpcSearchCache && !uiState.npc.bulkSelfPlay) {
        candidates = getNpcCandidateActions(actions, emergencyMode || fullDefense, state, player);
        if (fullDefense || emergencyMode) {
          candidates = filterForcedDefenseActions(state, player, candidates);
        }
        if (depth >= 2 || emergencyMode || fullDefense) {
          candidates = filterImmediateBlunderActions(state, player, candidates);
        }
        candidates = orderNpcActionsForSearch(state, player, candidates, emergencyMode || fullDefense, depth, bestActionKey);
        return candidates.slice(0, Math.min(Math.max(getLookaheadBreadth(depth, emergencyMode), emergencyMode || fullDefense ? (depth >= 4 ? 5 : 7) : (depth >= 4 ? 4 : 5)), candidates.length));
      }
      if (fullDefense) {
        candidates = filterImmediateBlunderActions(state, player, actions);
        candidates = filterForcedDefenseActions(state, player, candidates);
        candidates = orderNpcActionsForSearch(state, player, candidates, true, depth, bestActionKey);
        return candidates.slice(0, Math.min(uiState.npc.bulkSelfPlay ? getLookaheadBreadth(depth, emergencyMode) : Math.max(getLookaheadBreadth(depth, emergencyMode), depth >= 4 ? 6 : 8), candidates.length));
      } else {
        threatCreationEmergency = !uiState.npc.bulkSelfPlay &&
          (state.turnNumber || 1) <= 10 &&
          countImmediateThreatCreatingActionsInStateCached(state, getOpponentPlayer(player), 2) > 0;
        if (threatCreationEmergency) {
          candidates = orderNpcActionsForSearch(state, player, filterImmediateBlunderActions(state, player, actions), true, depth, bestActionKey);
          return candidates.slice(0, Math.min(uiState.npc.bulkSelfPlay ? getLookaheadBreadth(depth, emergencyMode) : Math.max(getLookaheadBreadth(depth, emergencyMode), depth >= 4 ? 6 : 10), candidates.length));
        }
        candidates = getNpcCandidateActions(actions, emergencyMode, state, player);
      }
      candidates = getNpcCandidateActions(candidates, emergencyMode, state, player);
      if (depth >= 3 || emergencyMode) {
        candidates = filterImmediateBlunderActions(state, player, candidates);
      }
      candidates = orderNpcActionsForSearch(state, player, candidates, emergencyMode, depth, bestActionKey);
      return candidates.slice(0, Math.min(getLookaheadBreadth(depth, emergencyMode), candidates.length));
    }

    function isKingZoneVolatileForLookahead(state, player) {
      if (!state || uiState.npc && uiState.npc.bulkSelfPlay) {
        return false;
      }
      return isKingUnderThreatInStateCached(state, player) ||
        countImmediateWinningActionsInStateCached(state, getOpponentPlayer(player), 2) > 0 ||
        getFastLossRiskScoreForPlayer(state, player) >= 135000 ||
        getKingLandingControlScoreForPlayer(state, player) <= -76000 ||
        getOwnBaseGateControlScoreForPlayer(state, player) <= -22000;
    }

    function getSelectiveNpcLookaheadDepth(rootState, nextState, player, baseDepth, emergencyMode) {
      var depth = normalizeNpcLookaheadDepth(baseDepth);
      return depth;
    }

    function getNpcTerminalSearchScore(state, rootPlayer, remainingDepth) {
      var margin;
      if (!state || !state.winner) {
        return null;
      }
      margin = 5200000 + Math.max(0, Number(remainingDepth) || 0) * 14000;
      return state.winner === rootPlayer ? margin : -margin;
    }

    function isNpcQuiescenceVolatile(state, player, defenseSnapshot) {
      return !!(defenseSnapshot && (
        defenseSnapshot.kingThreatened ||
        defenseSnapshot.kingCaptureThreats > 0 ||
        defenseSnapshot.foldThreats > 0 ||
        defenseSnapshot.baseInvaded > 0 ||
        defenseSnapshot.immediateWins > 0 ||
        defenseSnapshot.baseHot > 0
      )) ||
        getPieceCaptureThreatScoreForPlayer(state, player) >= 90000;
    }

    function getNpcQuiescenceCandidateActions(state, player, actions, emergencyMode, ply) {
      var selected = [];
      var seen = {};
      var opponent = getOpponentPlayer(player);

      function addAction(action) {
        var key = getNpcActionSearchKey(action);
        if (!action || seen[key]) {
          return;
        }
        seen[key] = true;
        selected.push(action);
      }

      actions
        .filter(function (action) {
          return isImmediateWinningActionInState(state, player, action);
        })
        .sort(function (a, b) {
          return compareImmediateWinningActionsInState(state, player, a, b);
        })
        .slice(0, 4)
        .forEach(addAction);

      if (emergencyMode) {
        filterForcedDefenseActions(state, player, actions).slice(0, 6).forEach(addAction);
      }

      actions
        .filter(function (action) {
          if (action.type !== "move") {
            return false;
          }
          var cell = state.board[action.row] && state.board[action.row][action.col];
          var targetPiece = cell && cell.pieceId ? getPiece(state, cell.pieceId) : null;
          return targetPiece && targetPiece.owner === opponent;
        })
        .slice(0, ply > 1 ? 5 : 3)
        .forEach(addAction);

      actions
        .filter(function (action) {
          if (action.type === "fragment") {
            return (action.cells || []).some(function (cell) {
              var boardCell = state.board[cell.row] && state.board[cell.row][cell.col];
              return boardCell && boardCell.isBaseCenter && boardCell.baseOwner === opponent && !boardCell.pieceId;
            });
          }
          if (action.type === "reserve") {
            var targetCell = state.board[action.row] && state.board[action.row][action.col];
            return targetCell && targetCell.isBaseCenter && targetCell.baseOwner === opponent && !targetCell.pieceId;
          }
          return false;
        })
        .slice(0, 3)
        .forEach(addAction);

      return orderNpcActionsForSearch(state, player, selected, emergencyMode, 0).slice(0, emergencyMode ? 7 : 5);
    }

    function searchNpcQuiescence(state, rootPlayer, alpha, beta, ply) {
      var currentPlayer;
      var maximizing;
      var standPat;
      var defenseSnapshot;
      var actions;
      var candidates;
      var cacheKey;
      var alphaOriginal = alpha;
      var betaOriginal = beta;
      var bound;
      var immediateWins;
      if (shouldStopNpcSearchForBudget()) {
        return evaluateStateForNpcCached(state, rootPlayer);
      }
      if (state.winner) {
        return getNpcTerminalSearchScore(state, rootPlayer, ply);
      }
      if (ply <= 0) {
        return evaluateStateForNpcCached(state, rootPlayer);
      }
      currentPlayer = state.currentPlayer;
      immediateWins = findImmediateWinningActionsInStateCached(state, currentPlayer, 4);
      if (immediateWins.length) {
        return currentPlayer === rootPlayer ? 4800000 : -4800000;
      }
      cacheKey = activeNpcSearchCache
        ? getCachedNpcSearchStateKey(state) + "|q|" + rootPlayer + "|ply|" + ply
        : "";
      if (cacheKey) {
        bound = readNpcSearchBound(cacheKey, alpha, beta);
        if (bound) {
          if (bound.hit) {
            return bound.score;
          }
          alpha = bound.alpha;
          beta = bound.beta;
        }
      }
      standPat = evaluateStateForNpcCached(state, rootPlayer);
      maximizing = currentPlayer === rootPlayer;
      if (maximizing) {
        if (standPat >= beta) {
          writeNpcSearchBound(cacheKey, standPat, alphaOriginal, betaOriginal);
          return standPat;
        }
        alpha = Math.max(alpha, standPat);
      } else {
        if (standPat <= alpha) {
          writeNpcSearchBound(cacheKey, standPat, alphaOriginal, betaOriginal);
          return standPat;
        }
        beta = Math.min(beta, standPat);
      }
      defenseSnapshot = getDefenseSnapshotCached(state, currentPlayer);
      if (!isNpcQuiescenceVolatile(state, currentPlayer, defenseSnapshot)) {
        writeNpcSearchExact(cacheKey, standPat);
        return standPat;
      }
      actions = collectNpcActionsForStateCached(state, currentPlayer);
      candidates = getNpcQuiescenceCandidateActions(state, currentPlayer, actions, defenseSnapshot.kingThreatened || defenseSnapshot.immediateWins > 0 || defenseSnapshot.baseHot > 0, ply);
      if (!candidates.length) {
        writeNpcSearchExact(cacheKey, standPat);
        return standPat;
      }
      candidates.some(function (action) {
        var nextState = cloneNpcSimulationState(state);
        var score;
        if (shouldStopNpcSearchForBudget()) {
          return true;
        }
        nextState.currentPlayer = currentPlayer;
        applyNpcActionToState(nextState, action);
        score = searchNpcQuiescence(nextState, rootPlayer, alpha, beta, ply - 1);
        if (maximizing) {
          if (score > standPat) {
            standPat = score;
          }
          alpha = Math.max(alpha, standPat);
        } else {
          if (score < standPat) {
            standPat = score;
          }
          beta = Math.min(beta, standPat);
        }
        if (beta <= alpha) {
          recordNpcKillerMove(state, currentPlayer, action, ply);
          recordNpcHistorySuccess(state, currentPlayer, action, ply, 180);
          return true;
        }
        return false;
      });
      if (activeNpcSearchAborted) {
        return standPat;
      }
      writeNpcSearchBound(cacheKey, standPat, alphaOriginal, betaOriginal);
      return standPat;
    }

    function isNpcSearchTacticalAction(state, player, action, emergencyMode) {
      var opponent = getOpponentPlayer(player);
      var cell;
      var targetPiece;
      if (!state || !action) {
        return false;
      }
      if (emergencyMode || action.forceDefenseScore || isImmediateWinningActionInState(state, player, action)) {
        return true;
      }
      if (action.type === "move") {
        cell = state.board[action.row] && state.board[action.row][action.col];
        targetPiece = cell && cell.pieceId ? getPiece(state, cell.pieceId) : null;
        return !!(targetPiece && targetPiece.owner === opponent) ||
          !!(cell && cell.isBaseCenter) ||
          getOwnBaseGateCellBonus(state, player, action.row, action.col) > 0;
      }
      if (action.type === "reserve") {
        cell = state.board[action.row] && state.board[action.row][action.col];
        return !!(cell && cell.isBaseCenter) ||
          getOwnBaseGateCellBonus(state, player, action.row, action.col) > 0 ||
          getOwnBaseReliefCellBonus(state, player, action.pieceType, action.row, action.col) > 0;
      }
      if (action.type === "fragment" || action.type === "setupFragment") {
        return (action.cells || []).some(function (fragmentCell) {
          var boardCell = state.board[fragmentCell.row] && state.board[fragmentCell.row][fragmentCell.col];
          return !!boardCell && (
            boardCell.isBaseCenter ||
            boardCell.controller === opponent ||
            getOwnBaseGateCellBonus(state, player, fragmentCell.row, fragmentCell.col) > 0 ||
            getOwnBaseReliefCellBonus(state, player, action.card ? action.card.pieceType : null, fragmentCell.row, fragmentCell.col) > 0
          );
        });
      }
      return action.type === "recoverPiece" || action.type === "recoverFragment";
    }

    function getNpcSearchChildDepth(depth, index, tactical, emergencyMode) {
      if (emergencyMode || tactical || depth < 3 || index < 3) {
        return depth - 1;
      }
      if (depth >= 5 && index >= 5) {
        return Math.max(0, depth - 3);
      }
      return Math.max(0, depth - 2);
    }

    function searchNpcLookahead(state, rootPlayer, depth, alpha, beta) {
      var currentPlayer;
      var actions;
      var emergencyMode;
      var candidates;
      var maximizing;
      var bestScore;
      var immediateWins;
      var currentDefenseSnapshot;
      var cacheKey;
      var alphaOriginal = alpha;
      var betaOriginal = beta;
      var bound;
      var bestAction = null;
      var bestActionKey = "";
      var terminalScore = getNpcTerminalSearchScore(state, rootPlayer, depth);
      if (shouldStopNpcSearchForBudget()) {
        return evaluateStateForNpcCached(state, rootPlayer);
      }
      if (terminalScore !== null) {
        return terminalScore;
      }
      if (activeNpcSearchCache) {
        cacheKey = getCachedNpcSearchStateKey(state) +
          "|search|" + rootPlayer +
          "|depth|" + depth +
          "|strategy|" + getNpcStrategy("P1") + ":" + getNpcStrategy("P2");
        bound = readNpcSearchBound(cacheKey, alpha, beta);
        if (bound) {
          if (bound.hit) {
            return bound.score;
          }
          alpha = bound.alpha;
          beta = bound.beta;
        }
      }
      if (depth <= 0) {
        if (!state.winner && depth <= 0) {
          bestScore = searchNpcQuiescence(
            state,
            rootPlayer,
            alpha,
            beta,
            !uiState.npc.bulkSelfPlay && normalizeNpcLookaheadDepth(uiState.npc.lookaheadDepth) >= 5 ? 2 : 1
          );
          if (!activeNpcSearchAborted) {
            writeNpcSearchExact(cacheKey, bestScore);
          }
          return bestScore;
        }
        bestScore = evaluateStateForNpcCached(state, rootPlayer);
        if (!activeNpcSearchAborted) {
          writeNpcSearchExact(cacheKey, bestScore);
        }
        return bestScore;
      }
      currentPlayer = state.currentPlayer;
      actions = collectNpcActionsForStateCached(state, currentPlayer);
      if (!actions.length) {
        bestScore = evaluateStateForNpcCached(state, rootPlayer);
        writeNpcSearchExact(cacheKey, bestScore);
        return bestScore;
      }
      immediateWins = findImmediateWinningActionsInStateCached(state, currentPlayer, 8);
      if (immediateWins.length) {
        bestScore = currentPlayer === rootPlayer ? 5000000 : -5000000;
        writeNpcSearchExact(cacheKey, bestScore, getNpcActionSearchKey(immediateWins[0]));
        return bestScore;
      }
      currentDefenseSnapshot = getDefenseSnapshotCached(state, currentPlayer);
      emergencyMode = currentDefenseSnapshot.kingThreatened ||
      currentDefenseSnapshot.kingCaptureThreats > 0 ||
      currentDefenseSnapshot.foldThreats > 0 ||
      currentDefenseSnapshot.baseInvaded > 0 ||
      currentDefenseSnapshot.immediateWins > 0 ||
        currentDefenseSnapshot.baseHot > 0 ||
        getPieceCaptureThreatScoreForPlayer(state, currentPlayer) >= 90000;
      candidates = getLookaheadCandidateActions(state, currentPlayer, actions, depth, emergencyMode, bound && bound.bestActionKey);
      maximizing = currentPlayer === rootPlayer;
      bestScore = maximizing ? -Infinity : Infinity;
      for (var i = 0; i < candidates.length; i += 1) {
        var nextState = cloneNpcSimulationState(state);
        var score;
        var tactical;
        var childDepth;
        var fullDepth;
        var useScoutWindow;
        if (shouldStopNpcSearchForBudget()) {
          break;
        }
        nextState.currentPlayer = currentPlayer;
        applyNpcActionToState(nextState, candidates[i]);
        tactical = isNpcSearchTacticalAction(state, currentPlayer, candidates[i], emergencyMode);
        childDepth = getNpcSearchChildDepth(depth, i, tactical, emergencyMode);
        fullDepth = depth - 1;
        useScoutWindow = i > 0 && depth >= 4 && !emergencyMode && isFinite(alpha) && isFinite(beta);
        if (useScoutWindow) {
          if (maximizing) {
            score = searchNpcLookahead(nextState, rootPlayer, childDepth, alpha, Math.min(beta, alpha + 1));
            if (score > alpha && score < beta) {
              score = searchNpcLookahead(nextState, rootPlayer, childDepth, alpha, beta);
            }
          } else {
            score = searchNpcLookahead(nextState, rootPlayer, childDepth, Math.max(alpha, beta - 1), beta);
            if (score < beta && score > alpha) {
              score = searchNpcLookahead(nextState, rootPlayer, childDepth, alpha, beta);
            }
          }
        } else {
          score = searchNpcLookahead(nextState, rootPlayer, childDepth, alpha, beta);
        }
        if (childDepth < fullDepth && (emergencyMode || tactical || i < 2)) {
          if ((maximizing && score > alpha) || (!maximizing && score < beta)) {
            score = searchNpcLookahead(nextState, rootPlayer, fullDepth, alpha, beta);
          }
        }
        if (maximizing) {
          if (score > bestScore) {
            bestScore = score;
            bestAction = candidates[i];
          }
          alpha = Math.max(alpha, bestScore);
        } else {
          if (score < bestScore) {
            bestScore = score;
            bestAction = candidates[i];
          }
          beta = Math.min(beta, bestScore);
        }
        if (beta <= alpha) {
          recordNpcKillerMove(state, currentPlayer, candidates[i], depth);
          recordNpcHistorySuccess(state, currentPlayer, candidates[i], depth, 420);
          break;
        }
      }
      if (!bestAction || !isFinite(bestScore)) {
        bestScore = evaluateStateForNpcCached(state, rootPlayer);
        if (!activeNpcSearchAborted) {
          writeNpcSearchExact(cacheKey, bestScore);
        }
        return bestScore;
      }
      bestActionKey = getNpcActionSearchKey(bestAction);
      if (bestAction) {
        recordNpcHistorySuccess(state, currentPlayer, bestAction, depth, 36);
      }
      if (!activeNpcSearchAborted) {
        writeNpcSearchBound(cacheKey, bestScore, alphaOriginal, betaOriginal, bestActionKey);
      }
      return bestScore;
    }

    function getNpcRootIterationCandidateLimit(targetDepth, iterationDepth, emergencyMode) {
      if (targetDepth < 5) {
        return 0;
      }
      if (emergencyMode) {
        return iterationDepth >= 3 ? 4 : 5;
      }
      if (iterationDepth >= 4) {
        return 2;
      }
      if (iterationDepth >= 2) {
        return 3;
      }
      return 0;
    }

    function chooseNpcActionWithLookahead(actions, npcPlayer, emergencyMode, depth) {
      return withNpcSearchCache(function () {
        var previousRootPlayer = activeNpcSearchRootPlayer;
        var previousDeadlineAt = activeNpcSearchDeadlineAt;
        var previousNodeCount = activeNpcSearchNodeCount;
        var previousAborted = activeNpcSearchAborted;
        var rootCacheKey = getCachedNpcSearchStateKey(uiState.state) +
          "|search|" + npcPlayer +
          "|depth|" + depth +
          "|strategy|" + getNpcStrategy("P1") + ":" + getNpcStrategy("P2");
        var rootHint = readNpcSearchBound(rootCacheKey, -Infinity, Infinity);
        var candidates = getLookaheadCandidateActions(uiState.state, npcPlayer, actions, depth, emergencyMode, rootHint && rootHint.bestActionKey);
        var bestAction = candidates[0] || actions[0];
        var bestScore = -Infinity;
        var opponent = getOpponentPlayer(npcPlayer);
        var childStateCache = {};
        var targetDepth = normalizeNpcLookaheadDepth(depth);
        var budgetMs = getNpcSearchTimeBudgetMs(targetDepth, emergencyMode);
        var searchStartedAt = getNpcSearchTimestampMs();
        var initialRootCandidateCount = candidates.length;
        var completedDepth = 0;
        var searchStats = null;
        function getRootChildInfo(action) {
          var key = getNpcActionSearchKey(action);
          var info = childStateCache[key];
          if (info) {
            return info;
          }
          info = {
            state: cloneNpcSimulationState(uiState.state),
            opponentImmediateWins: 0,
            defenseSnapshot: null
          };
          info.state.currentPlayer = npcPlayer;
          applyNpcActionToState(info.state, action);
          info.opponentImmediateWins = info.state.winner ? 0 : countImmediateWinningActionsInStateCached(info.state, opponent, 10);
          if (!info.state.winner) {
            info.defenseSnapshot = getDefenseSnapshotCached(info.state, npcPlayer);
          }
          childStateCache[key] = info;
          return info;
        }

        function scoreRootAction(action, iterationDepth, alphaFloor, rootIndex) {
          var childInfo = getRootChildInfo(action);
          var nextState = childInfo.state;
          var score;
          var actionDepth;
          var rootTactical;
          var opponentImmediateWins;
          var nextDefenseSnapshot;
          var terminalScore = getNpcTerminalSearchScore(nextState, npcPlayer, iterationDepth);
          if (terminalScore !== null) {
            return terminalScore;
          }
          opponentImmediateWins = childInfo.opponentImmediateWins;
          actionDepth = Math.min(
            getSelectiveNpcLookaheadDepth(uiState.state, nextState, npcPlayer, iterationDepth, emergencyMode),
            iterationDepth
          );
          rootTactical = isNpcSearchTacticalAction(uiState.state, npcPlayer, action, emergencyMode) || opponentImmediateWins > 0;
          if (iterationDepth >= 5 && !rootTactical) {
            actionDepth = Math.min(actionDepth, rootIndex < 3 ? 4 : 3);
          }
          score = searchNpcLookahead(nextState, npcPlayer, actionDepth - 1, alphaFloor, Infinity);
          if (opponentImmediateWins) {
            score -= 2200000 + opponentImmediateWins * 260000;
            if (doesActionMoveKingOffOwnBaseCenter(uiState.state, npcPlayer, action)) {
              score -= 1200000;
            }
          }
          if (!nextState.winner) {
            nextDefenseSnapshot = childInfo.defenseSnapshot || getDefenseSnapshotCached(nextState, npcPlayer);
            if (nextDefenseSnapshot.kingCaptureThreats > 0) {
              score -= 3600000 + nextDefenseSnapshot.kingCaptureThreats * 520000;
            }
            if (nextDefenseSnapshot.foldThreats > 0) {
              score -= 2800000 + nextDefenseSnapshot.foldThreats * 360000;
            }
          }
          if ((uiState.state.turnNumber || 1) <= 12 &&
            doesActionMoveKingOffOwnBaseCenter(uiState.state, npcPlayer, action) &&
            doesNextStateVacateOwnBaseCenterWithoutReplacement(uiState.state, npcPlayer, nextState)) {
            score -= 780000;
          }
          if (!nextState.winner) {
            score += Math.max(-180000, Math.min(180000, (action.refinedScore || action.score || 0) * 0.16));
            score += getNpcStrategyActionBias(uiState.state, action, npcPlayer, nextState, emergencyMode) * 0.38;
            score += getGameClosingActionBias(uiState.state, action, npcPlayer, nextState, emergencyMode) * 0.24;
            if (!emergencyMode) {
              score += getLongGameActionBias(uiState.state, action, npcPlayer) * 0.45;
            }
          }
          return score;
        }

        activeNpcSearchRootPlayer = npcPlayer;
        activeNpcSearchDeadlineAt = budgetMs ? getNpcSearchTimestampMs() + budgetMs : 0;
        activeNpcSearchNodeCount = 0;
        activeNpcSearchAborted = false;
        try {
          for (var iterationDepth = targetDepth >= 3 ? 1 : targetDepth; iterationDepth <= targetDepth; iterationDepth += 1) {
            var iterationResults = [];
            var candidateIndex;
            var rootLimit;
            bestScore = -Infinity;
            for (candidateIndex = 0; candidateIndex < candidates.length; candidateIndex += 1) {
              var action = candidates[candidateIndex];
              var score;
              if (shouldStopNpcSearchForBudget()) {
                break;
              }
              score = scoreRootAction(action, iterationDepth, bestScore, candidateIndex);
              iterationResults.push({ action: action, score: score });
              if (score > bestScore || (score === bestScore && action.score > (bestAction ? bestAction.score : -Infinity))) {
                bestScore = score;
                bestAction = action;
              }
            }
            if (!iterationResults.length) {
              break;
            }
            completedDepth = iterationDepth;
            iterationResults.sort(function (a, b) {
              var delta = b.score - a.score;
              if (delta) {
                return delta;
              }
              return (b.action.moveOrderScore || b.action.refinedScore || b.action.score || 0) -
                (a.action.moveOrderScore || a.action.refinedScore || a.action.score || 0);
            });
            candidates = iterationResults.map(function (entry) {
              return entry.action;
            });
            rootLimit = getNpcRootIterationCandidateLimit(targetDepth, iterationDepth, emergencyMode);
            if (rootLimit && candidates.length > rootLimit) {
              candidates = candidates.slice(0, rootLimit);
            }
            if (activeNpcSearchAborted) {
              break;
            }
          }
          if (bestAction && isFinite(bestScore) && !activeNpcSearchAborted) {
            writeNpcSearchBound(rootCacheKey, bestScore, -Infinity, Infinity, getNpcActionSearchKey(bestAction));
            recordNpcHistorySuccess(uiState.state, npcPlayer, bestAction, targetDepth, 120);
          }
          searchStats = {
            depth: targetDepth,
            completedDepth: completedDepth,
            budgetMs: budgetMs,
            elapsedMs: Math.max(0, getNpcSearchTimestampMs() - searchStartedAt),
            nodes: activeNpcSearchNodeCount,
            aborted: !!activeNpcSearchAborted,
            emergency: !!emergencyMode,
            initialCandidates: initialRootCandidateCount,
            finalCandidates: candidates.length,
            bestActionKey: bestAction ? getNpcActionSearchKey(bestAction) : ""
          };
          uiState.npc.lastSearchStats = searchStats;
        } finally {
          activeNpcSearchRootPlayer = previousRootPlayer;
          activeNpcSearchDeadlineAt = previousDeadlineAt;
          activeNpcSearchNodeCount = previousNodeCount;
          activeNpcSearchAborted = previousAborted;
        }
        return bestAction;
      });
    }

    function getImmediateWinningActionKindInState(state, player, action) {
      var opponent = getOpponentPlayer(player);
      var cell;
      var targetPiece;
      if (!state || !action) {
        return "";
      }
      if (action.type === "move") {
        cell = state.board[action.row][action.col];
        targetPiece = cell && cell.pieceId ? getPiece(state, cell.pieceId) : null;
        if (targetPiece && targetPiece.owner === opponent && targetPiece.kind === "king") {
          return "kingCapture";
        }
        if (cell && cell.isBaseCenter && cell.baseOwner === opponent) {
          return "baseOccupation";
        }
      }
      if (action.type === "reserve") {
        cell = state.board[action.row][action.col];
        if (cell && cell.isBaseCenter && cell.baseOwner === opponent && !cell.pieceId) {
          return "baseOccupation";
        }
      }
      if (action.type === "fragment") {
        if (action.cells.some(function (fragmentCell) {
          cell = state.board[fragmentCell.row][fragmentCell.col];
          return cell.isBaseCenter && cell.baseOwner === opponent && !cell.pieceId;
        })) {
          return "fold";
        }
      }
      return "";
    }

    function getImmediateWinningActionPriority(kind) {
      if (kind === "kingCapture") {
        return 40;
      }
      if (kind === "fold") {
        return 36;
      }
      if (kind === "baseOccupation") {
        return 28;
      }
      return 0;
    }

    function compareImmediateWinningActionsInState(state, player, a, b) {
      var leftKind = getImmediateWinningActionKindInState(state, player, a);
      var rightKind = getImmediateWinningActionKindInState(state, player, b);
      var priorityDelta = getImmediateWinningActionPriority(rightKind) - getImmediateWinningActionPriority(leftKind);
      if (priorityDelta) {
        return priorityDelta;
      }
      return (b.score || 0) - (a.score || 0);
    }

    function isImmediateWinningActionInState(state, player, action) {
      return !!getImmediateWinningActionKindInState(state, player, action);
    }

    function findImmediateWinningActionsInState(state, player, limit) {
      var actions = collectNpcActionsForState(state, player);
      return actions
        .filter(function (action) {
          return isImmediateWinningActionInState(state, player, action);
        })
        .sort(function (a, b) {
          return compareImmediateWinningActionsInState(state, player, a, b);
        })
        .slice(0, Math.min(limit || 12, actions.length));
    }

  function shouldUseFullDefenseCandidateSet(state, player) {
    var snapshot = getDefenseSnapshotCached(state, player);
    return snapshot.kingThreatened ||
      snapshot.kingCaptureThreats > 0 ||
      snapshot.foldThreats > 0 ||
      snapshot.baseInvaded > 0 ||
      snapshot.immediateWins > 0 ||
      snapshot.baseHot > 0 ||
      getPieceCaptureThreatScoreForPlayer(state, player) >= 65000;
  }

  function countImmediateWinningActionsInState(state, player, limit) {
    return findImmediateWinningActionsInState(state, player, limit).length;
  }

  function isKingOnOwnBaseCenterInState(state, player) {
    var king = findKingInState(state, player);
    var base = findBaseCenterInState(state, player);
    return !!king && !!base && king.row === base.row && king.col === base.col;
  }

  function isOwnBaseCenterHeldInState(state, player) {
    var base = findBaseCenterInState(state, player);
    var piece;
    if (!base || !base.pieceId) {
      return false;
    }
    piece = getPiece(state, base.pieceId);
    return !!piece && piece.owner === player;
  }

  function isOwnBaseCenterHeldByNonKingInState(state, player) {
    var base = findBaseCenterInState(state, player);
    var piece;
    if (!base || !base.pieceId) {
      return false;
    }
    piece = getPiece(state, base.pieceId);
    return !!piece && piece.owner === player && piece.kind !== "king";
  }

  function canPlayerOverwriteBaseCenterInState(state, attacker, defender) {
    var base = findBaseCenterInState(state, defender);
    var basePiece;
    var attackerState;
    var cards = [];
    if (!state || !base) {
      return false;
    }
    basePiece = base.pieceId ? getPiece(state, base.pieceId) : null;
    if (basePiece && basePiece.owner === defender) {
      return false;
    }
    attackerState = state.players[attacker];
    if (!attackerState) {
      return false;
    }
    cards = cards.concat(attackerState.hand || []);
    getFragmentReserveEntries(attackerState).forEach(function (entry) {
      cards.push(entry.card);
    });
    return withTemporaryState(state, function () {
      return cards.some(function (card) {
        return getNpcFragmentPlacements(attacker, card, { frontierLimit: activeNpcSearchCache ? 24 : 0 }).some(function (placement) {
          return placement.cells.some(function (cell) {
            return cell.row === base.row && cell.col === base.col;
          });
        });
      });
    });
  }

  function isBaseCenterOpenForWinningFragmentInState(state, attacker, defender) {
    var base = findBaseCenterInState(state, defender);
    var basePiece;
    if (!state || !base) {
      return false;
    }
    basePiece = base.pieceId ? getPiece(state, base.pieceId) : null;
    return !basePiece || basePiece.owner === attacker;
  }

  function filterBaseCenterOverwriteEmergencyActions(state, player, actions) {
    var opponent = getOpponentPlayer(player);
    var baseHoldingActions = [];
    if (!actions.length || !canPlayerOverwriteBaseCenterInStateCached(state, opponent, player)) {
      return actions;
    }
    actions.forEach(function (action) {
      var nextState = cloneNpcSimulationState(state);
      nextState.currentPlayer = player;
      applyNpcActionToState(nextState, action);
      if (nextState.winner === player) {
        baseHoldingActions.push(action);
        return;
      }
      if (nextState.winner === opponent) {
        return;
      }
      if (!isOwnBaseCenterHeldInState(nextState, player)) {
        return;
      }
      if (isKingUnderThreatInStateCached(nextState, player)) {
        return;
      }
      if (countImmediateWinningActionsInStateCached(nextState, opponent, 4) > 0) {
        return;
      }
      baseHoldingActions.push(action);
    });
    return baseHoldingActions.length ? baseHoldingActions : actions;
  }

  function filterOwnBaseCenterRefillActions(state, player, actions) {
    var refillActions = [];
    var nonKingRefillActions = [];
    var winningActions = [];
    if (!actions.length || isOwnBaseCenterHeldInState(state, player)) {
      return actions;
    }
    if (isKingUnderThreatInStateCached(state, player)) {
      return actions;
    }
    if (getNpcStrategy(player) !== "defense" && (state.turnNumber || 1) > 24) {
      return actions;
    }
    actions.forEach(function (action) {
      var nextState = cloneNpcSimulationState(state);
      nextState.currentPlayer = player;
      applyNpcActionToState(nextState, action);
      if (nextState.winner === player) {
        winningActions.push(action);
        return;
      }
      if (isOwnBaseCenterHeldByNonKingInState(nextState, player)) {
        nonKingRefillActions.push(action);
        return;
      }
      if (isOwnBaseCenterHeldInState(nextState, player)) {
        refillActions.push(action);
      }
    });
    if (winningActions.length) {
      return winningActions;
    }
    if (nonKingRefillActions.length) {
      return nonKingRefillActions;
    }
    return refillActions.length ? refillActions : actions;
  }

  function countImmediateThreatCreatingActionsInState(state, attacker, limit) {
    var actions;
    var count = 0;
    var cap = limit || 6;
    if (!state || activeNpcSearchCache || (uiState.npc && uiState.npc.bulkSelfPlay)) {
      return 0;
    }
    actions = collectNpcActionsForStateCached(state, attacker);
    actions.sort(function (a, b) {
      return (b.refinedScore || b.score) - (a.refinedScore || a.score);
    });
    actions.some(function (action) {
      if (createsImmediateWinThreatAfterAction(state, attacker, action, 2)) {
        count += 1;
      }
      return count >= cap;
    });
    return count;
  }

  function getThreatCreationRiskScoreForPlayer(state, player) {
    if (activeNpcSearchCache || uiState.npc && uiState.npc.bulkSelfPlay) {
      return 0;
    }
    return getCachedNpcEvalMetric(state, player, "threatCreationRisk", function () {
      var opponent = getOpponentPlayer(player);
      var phase = getNpcGamePhase(state);
      var count = countImmediateThreatCreatingActionsInState(state, opponent, phase === "early" || phase === "setup" ? 4 : 3);
      var score = count * 76000;
      if (count && isKingOnOwnBaseCenterInState(state, player)) {
        score += 68000;
      }
      if (phase === "setup" || phase === "early") {
        score *= 1.28;
      }
      return score;
    });
  }

  function doesActionMoveKingOffOwnBaseCenter(state, player, action) {
    var piece;
    var base;
    if (!state || !action || action.type !== "move") {
      return false;
    }
    piece = getPiece(state, action.pieceId);
    base = findBaseCenterInState(state, player);
    if (!piece || piece.kind !== "king" || !base) {
      return false;
    }
    return piece.row === base.row && piece.col === base.col &&
      (action.row !== base.row || action.col !== base.col);
  }

  function doesActionVacateOwnBaseCenterWithoutReplacement(state, player, action) {
    var nextState;
    if (!state || !action) {
      return false;
    }
    nextState = cloneNpcSimulationState(state);
    nextState.currentPlayer = player;
    applyNpcActionToState(nextState, action);
    return doesNextStateVacateOwnBaseCenterWithoutReplacement(state, player, nextState);
  }

  function doesNextStateVacateOwnBaseCenterWithoutReplacement(state, player, nextState) {
    var base = findBaseCenterInState(state, player);
    var basePiece;
    var nextBase;
    var nextBasePiece;
    if (!base || !nextState || !base.pieceId) {
      return false;
    }
    basePiece = getPiece(state, base.pieceId);
    if (!basePiece || basePiece.owner !== player || basePiece.kind !== "king") {
      return false;
    }
    if (nextState.winner) {
      return false;
    }
    nextBase = findBaseCenterInState(nextState, player);
    nextBasePiece = nextBase && nextBase.pieceId ? getPiece(nextState, nextBase.pieceId) : null;
    return !nextBasePiece || nextBasePiece.owner !== player;
  }

  function filterImmediateBlunderActions(state, player, actions) {
    var opponent = getOpponentPlayer(player);
    var safeActions = [];
    if (!actions.length) {
      return actions;
    }
    actions.forEach(function (action) {
      var nextState = cloneNpcSimulationState(state);
      var immediateLossCount;
      var nextSnapshot;
      nextState.currentPlayer = player;
      applyNpcActionToState(nextState, action);
      if (nextState.winner === player) {
        safeActions.push(action);
        return;
      }
      if (nextState.winner === opponent) {
        action.allowsImmediateLoss = true;
        action.immediateLossCount = 99;
        return;
      }
      nextSnapshot = getDefenseSnapshotCached(nextState, player);
      if (nextSnapshot.kingCaptureThreats > 0 || nextSnapshot.kingThreatened) {
        action.allowsImmediateLoss = true;
        action.immediateLossCount = 99;
        return;
      }
      if (nextSnapshot.foldThreats > 0) {
        action.allowsImmediateLoss = true;
        action.immediateLossCount = 94;
        return;
      }
      if (nextSnapshot.baseInvaded > 0) {
        action.allowsImmediateLoss = true;
        action.immediateLossCount = 93;
        return;
      }
      if (canPlayerOverwriteBaseCenterInStateCached(nextState, opponent, player)) {
        action.allowsImmediateLoss = true;
        action.immediateLossCount = 92;
        return;
      }
      if ((state.turnNumber || 1) <= 12 &&
        doesActionMoveKingOffOwnBaseCenter(state, player, action) &&
        doesNextStateVacateOwnBaseCenterWithoutReplacement(state, player, nextState)) {
        action.allowsImmediateLoss = true;
        action.immediateLossCount = 80;
        return;
      }
      immediateLossCount = countImmediateWinningActionsInStateCached(nextState, opponent, state.turnNumber <= 10 ? 8 : 3);
      if (immediateLossCount > 0) {
        action.allowsImmediateLoss = true;
        action.immediateLossCount = immediateLossCount;
        return;
      }
      var threatCreationCount = (state.turnNumber || 1) <= 10
        ? countImmediateThreatCreatingActionsInStateCached(nextState, opponent, 3)
        : 0;
      if (threatCreationCount > 0) {
        action.allowsImmediateLoss = true;
        action.immediateLossCount = 12 + threatCreationCount;
        return;
      }
      action.immediateLossCount = 0;
      safeActions.push(action);
    });
    if (safeActions.length) {
      return safeActions;
    }
    var fallbackActions = actions.slice().sort(function (a, b) {
      var lossDelta = (a.immediateLossCount || 0) - (b.immediateLossCount || 0);
      if (lossDelta) {
        return lossDelta;
      }
      return (doesActionMoveKingOffOwnBaseCenter(state, player, a) ? 1 : 0) -
        (doesActionMoveKingOffOwnBaseCenter(state, player, b) ? 1 : 0);
    });
    var minimumLossCount = fallbackActions.length ? (fallbackActions[0].immediateLossCount || 0) : 0;
    return fallbackActions.filter(function (action) {
      return (action.immediateLossCount || 0) === minimumLossCount;
    }).slice(0, Math.min(actions.length, 10));
  }

  function filterOwnBaseVacatingActions(state, player, actions) {
    var safeActions;
    if (!actions.length || isKingUnderThreatInStateCached(state, player)) {
      return actions;
    }
    if ((state.turnNumber || 1) > 40 && getNpcStrategy(player) !== "defense") {
      return actions;
    }
    safeActions = actions.filter(function (action) {
      if (!doesActionMoveKingOffOwnBaseCenter(state, player, action)) {
        return true;
      }
      return !doesActionVacateOwnBaseCenterWithoutReplacement(state, player, action);
    });
    return safeActions.length ? safeActions : actions;
  }

  function filterEmergencyBaseHoldingActions(state, player, actions) {
    var winningActions = [];
    var baseHoldingActions = [];
    if (!actions.length || (state.turnNumber || 1) > 18 || !isKingUnderThreatInStateCached(state, player)) {
      return actions;
    }
    actions.forEach(function (action) {
      var nextState = cloneNpcSimulationState(state);
      var opponent = getOpponentPlayer(player);
      nextState.currentPlayer = player;
      applyNpcActionToState(nextState, action);
      if (nextState.winner === player) {
        winningActions.push(action);
        return;
      }
      if (nextState.winner === opponent || isKingUnderThreatInStateCached(nextState, player)) {
        return;
      }
      if (countImmediateWinningActionsInStateCached(nextState, opponent, 6) > 0) {
        return;
      }
      if (doesNextStateVacateOwnBaseCenterWithoutReplacement(state, player, nextState)) {
        return;
      }
      baseHoldingActions.push(action);
    });
    if (winningActions.length) {
      return winningActions;
    }
    return baseHoldingActions.length ? baseHoldingActions : actions;
  }

  function makeBoardMap() {
    return Array.from({ length: BOARD_ROWS }, function () {
      return Array.from({ length: BOARD_COLS }, function () {
        return 0;
      });
    });
  }

  function getBoardMapStatsFallback(map) {
    var nonzero = 0;
    var max = 0;
    var sum = 0;
    var row;
    var col;
    var value;
    for (row = 0; row < BOARD_ROWS; row += 1) {
      for (col = 0; col < BOARD_COLS; col += 1) {
        value = map[row][col] || 0;
        if (value > 0) {
          nonzero += 1;
          max = Math.max(max, value);
          sum += value;
        }
      }
    }
    return { nonzero: nonzero, max: max, sum: sum, source: "js" };
  }

  function getBoardMapStatsBatchFallback(maps) {
    return maps.map(function (map) {
      return getBoardMapStatsFallback(map);
    });
  }

  function alignWasmOffset(offset, alignment) {
    return Math.ceil(offset / alignment) * alignment;
  }

  function getBoardMapStatsWithWasm(map) {
    var exports = unfoldWasmRuntime.exports;
    var length = BOARD_ROWS * BOARD_COLS;
    var bytes;
    var outputPtr;
    var output;
    var row;
    var col;
    var index = 0;
    if (!unfoldWasmRuntime.ready || !exports || !unfoldWasmRuntime.memory) {
      return null;
    }
    bytes = new Uint8Array(unfoldWasmRuntime.memory.buffer);
    if (WASM_BOARD_MAP_PTR + length > bytes.length) {
      return null;
    }
    for (row = 0; row < BOARD_ROWS; row += 1) {
      for (col = 0; col < BOARD_COLS; col += 1) {
        bytes[WASM_BOARD_MAP_PTR + index] = Math.max(0, Math.min(255, map[row][col] || 0));
        index += 1;
      }
    }
    unfoldWasmRuntime.uses += 1;
    if (typeof exports.stats1 === "function") {
      outputPtr = alignWasmOffset(WASM_BOARD_MAP_PTR + length, 4);
      if (outputPtr + 12 <= bytes.length) {
        exports.stats1(WASM_BOARD_MAP_PTR, length, outputPtr);
        output = new Uint32Array(unfoldWasmRuntime.memory.buffer, outputPtr, 3);
        return {
          nonzero: output[0],
          max: output[1],
          sum: output[2],
          source: "wasm"
        };
      }
    }
    return {
      nonzero: exports.count_nonzero(WASM_BOARD_MAP_PTR, length),
      max: exports.max_u8(WASM_BOARD_MAP_PTR, length),
      sum: exports.sum_u8(WASM_BOARD_MAP_PTR, length),
      source: "wasm"
    };
  }

  function getBoardMapStats(map) {
    return getBoardMapStatsWithWasm(map) || getBoardMapStatsFallback(map);
  }

  function getBoardMapStatsBatchWithWasm(maps) {
    var exports = unfoldWasmRuntime.exports;
    var length = BOARD_ROWS * BOARD_COLS;
    var bytes;
    var outputPtr;
    var output;
    var row;
    var col;
    var mapIndex;
    var index;
    var writePtr;
    if (!unfoldWasmRuntime.ready || !exports || typeof exports.stats3 !== "function" || !unfoldWasmRuntime.memory || maps.length !== 3) {
      return null;
    }
    bytes = new Uint8Array(unfoldWasmRuntime.memory.buffer);
    outputPtr = alignWasmOffset(WASM_BOARD_MAP_PTR + length * 3, 4);
    if (outputPtr + 36 > bytes.length) {
      return null;
    }
    for (mapIndex = 0; mapIndex < maps.length; mapIndex += 1) {
      index = 0;
      writePtr = WASM_BOARD_MAP_PTR + length * mapIndex;
      for (row = 0; row < BOARD_ROWS; row += 1) {
        for (col = 0; col < BOARD_COLS; col += 1) {
          bytes[writePtr + index] = Math.max(0, Math.min(255, maps[mapIndex][row][col] || 0));
          index += 1;
        }
      }
    }
    exports.stats3(WASM_BOARD_MAP_PTR, WASM_BOARD_MAP_PTR + length, WASM_BOARD_MAP_PTR + length * 2, length, outputPtr);
    output = new Uint32Array(unfoldWasmRuntime.memory.buffer, outputPtr, 9);
    unfoldWasmRuntime.uses += maps.length;
    unfoldWasmRuntime.batchUses += 1;
    return [
      { nonzero: output[0], max: output[1], sum: output[2], source: "wasm" },
      { nonzero: output[3], max: output[4], sum: output[5], source: "wasm" },
      { nonzero: output[6], max: output[7], sum: output[8], source: "wasm" }
    ];
  }

  function getBoardMapStatsBatch(maps) {
    return getBoardMapStatsBatchWithWasm(maps) || getBoardMapStatsBatchFallback(maps);
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

  function getKingSafetyScoreForPlayer(state, player) {
    var king = findKingInState(state, player);
    var opponent = getOpponentPlayer(player);
    var ownAttack = getAttackMapForStateCached(state, player).counts;
    var opponentAttack = getAttackMapForStateCached(state, opponent).counts;
    var score = 0;
    var row;
    var col;

    if (!king) {
      return -220000;
    }

    if (isKingUnderThreatInState(state, player)) {
      score -= 140000;
    }

    for (row = Math.max(0, king.row - 2); row <= Math.min(BOARD_ROWS - 1, king.row + 2); row += 1) {
      for (col = Math.max(0, king.col - 2); col <= Math.min(BOARD_COLS - 1, king.col + 2); col += 1) {
        var distance = Math.abs(row - king.row) + Math.abs(col - king.col);
        var weight;
        var cell;
        var piece;
        if (!distance || distance > 2) {
          continue;
        }
        weight = distance === 1 ? 1 : 0.45;
        cell = state.board[row][col];
        piece = cell.pieceId ? getPiece(state, cell.pieceId) : null;
        if (cell.controller === player) {
          score += 1800 * weight;
        } else if (cell.controller === opponent) {
          score -= 2600 * weight;
        }
        if (piece && piece.owner === player) {
          score += 1600 * weight;
          if (piece.kind === "guard" || piece.kind === "barrier") {
            score += 1300 * weight;
          }
        } else if (piece && piece.owner === opponent) {
          score -= 3600 * weight;
        }
        score += Math.min(2, ownAttack[row][col]) * 700 * weight;
        score -= Math.min(3, opponentAttack[row][col]) * 1500 * weight;
      }
    }

    return score;
  }

  function findImmediateWinningThreatsShallow(state, attacker, limit) {
    var defender = getOpponentPlayer(attacker);
    var threats = [];
    var seen = {};
    var defenderBase = findBaseCenterInState(state, defender);

    function addThreat(threat) {
      var key;
      if (threats.length >= (limit || 16)) {
        return;
      }
      key = threat.type + ":" + (threat.pieceId || threat.fragmentReserveKey || (typeof threat.handIndex === "number" ? "hand-" + threat.handIndex : threat.pieceType || "")) + ":" + (typeof threat.row === "number" ? threat.row : "") + ":" + (typeof threat.col === "number" ? threat.col : "") + ":" + (threat.cells ? threat.cells.map(function (cell) { return cell.row + "." + cell.col; }).join("-") : "");
      if (seen[key]) {
        return;
      }
      seen[key] = true;
      threats.push(threat);
    }

    return withTemporaryState(state, function () {
      var pieces = state.players[attacker].pieces;
      Object.keys(pieces).forEach(function (pieceId) {
        var piece;
        if (threats.length >= (limit || 16)) {
          return;
        }
        piece = pieces[pieceId];
        getLegalMoveTargets(piece).forEach(function (target) {
          var cell;
          var targetPiece;
          if (threats.length >= (limit || 16)) {
            return;
          }
          cell = state.board[target.row][target.col];
          targetPiece = cell && cell.pieceId ? getPiece(state, cell.pieceId) : null;
          if (targetPiece && targetPiece.owner === defender && targetPiece.kind === "king") {
            addThreat({ type: "move", pieceId: piece.id, row: target.row, col: target.col });
            return;
          }
          if (cell && cell.isBaseCenter && cell.baseOwner === defender) {
            addThreat({ type: "move", pieceId: piece.id, row: target.row, col: target.col });
          }
        });
      });

      Object.keys(state.players[attacker].reserve).forEach(function (pieceType) {
        if (threats.length >= (limit || 16)) {
          return;
        }
        getLegalReserveTargets(attacker, pieceType).forEach(function (target) {
          var cell;
          if (threats.length >= (limit || 16)) {
            return;
          }
          cell = state.board[target.row][target.col];
          if (cell && cell.isBaseCenter && cell.baseOwner === defender) {
            addThreat({ type: "reserve", pieceType: pieceType, row: target.row, col: target.col });
          }
        });
      });

      if (isBaseCenterOpenForWinningFragmentInState(state, attacker, defender)) {
        state.players[attacker].hand.forEach(function (card, handIndex) {
          if (threats.length >= (limit || 16)) {
            return;
          }
          getNpcFragmentPlacements(attacker, card, { frontierLimit: uiState.npc.bulkSelfPlay || activeNpcSearchCache ? 18 : 0 }).forEach(function (placement) {
            if (threats.length >= (limit || 16)) {
              return;
            }
            if (placement.cells.some(function (cell) { return cell.row === defenderBase.row && cell.col === defenderBase.col; })) {
              addThreat({
                type: "fragment",
                handIndex: handIndex,
                card: card,
                rotation: placement.rotation,
                anchor: placement.anchor,
                cells: placement.cells
              });
            }
          });
        });
        getFragmentReserveEntries(state.players[attacker]).forEach(function (entry) {
          var card = entry.card;
          if (threats.length >= (limit || 16)) {
            return;
          }
          getNpcFragmentPlacements(attacker, card, { frontierLimit: uiState.npc.bulkSelfPlay || activeNpcSearchCache ? 18 : 0 }).forEach(function (placement) {
            if (threats.length >= (limit || 16)) {
              return;
            }
            if (placement.cells.some(function (cell) { return cell.row === defenderBase.row && cell.col === defenderBase.col; })) {
              addThreat({
                type: "fragment",
                source: "fragmentReserve",
                fragmentReserveKey: entry.key,
                card: card,
                rotation: placement.rotation,
                anchor: placement.anchor,
                cells: placement.cells
              });
            }
          });
        });
      }

      return threats;
    });
  }

  function getThreatKindForImmediateAction(state, attacker, action) {
    var defender = getOpponentPlayer(attacker);
    var defenderBase = findBaseCenterInState(state, defender);
    var cell;
    var targetPiece;
    if (!state || !action) {
      return "";
    }
    if (action.type === "move") {
      cell = state.board[action.row][action.col];
      targetPiece = cell && cell.pieceId ? getPiece(state, cell.pieceId) : null;
      if (targetPiece && targetPiece.owner === defender && targetPiece.kind === "king") {
        return "kingCapture";
      }
      if (cell && cell.isBaseCenter && cell.baseOwner === defender) {
        return "baseOccupation";
      }
    }
    if (action.type === "reserve") {
      cell = state.board[action.row][action.col];
      if (cell && cell.isBaseCenter && cell.baseOwner === defender) {
        return "baseOccupation";
      }
    }
    if (action.type === "fragment" && defenderBase && action.cells && action.cells.some(function (fragmentCell) {
      return fragmentCell.row === defenderBase.row && fragmentCell.col === defenderBase.col;
    })) {
      return "fold";
    }
    return "";
  }

  function getImmediateThreatSummaryForPlayer(state, defender, limit) {
    var attacker = getOpponentPlayer(defender);
    var threats = findImmediateWinningThreatsShallow(state, attacker, limit || 24);
    var summary = {
      total: threats.length,
      kingCapture: 0,
      fold: 0,
      baseOccupation: 0
    };
    threats.forEach(function (threat) {
      var kind = getThreatKindForImmediateAction(state, attacker, threat);
      if (kind === "kingCapture") {
        summary.kingCapture += 1;
      } else if (kind === "fold") {
        summary.fold += 1;
      } else if (kind === "baseOccupation") {
        summary.baseOccupation += 1;
      }
    });
    return summary;
  }

  function getDangerMapForState(state, player) {
    var opponent = getOpponentPlayer(player);
    var attackMap = getAttackMapForStateCached(state, opponent);
    var immediateWins = findImmediateWinningThreatsShallow(state, opponent, 16);
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
    var ownBasePiece;
    var ownKing = findKingInState(state, player);
    var dangerMap = getDangerMapForStateCached(state, player);
    var threatSummary = getImmediateThreatSummaryForPlayer(state, player, 24);
    var hotStats = getBoardMapStats(dangerMap.immediateCounts);
    var snapshot = {
      immediateWins: dangerMap.immediateWins.length,
      kingCaptureThreats: threatSummary.kingCapture,
      foldThreats: threatSummary.fold,
      baseOccupationThreats: threatSummary.baseOccupation,
      baseInvaded: 0,
      baseHot: 0,
      baseThreat: 0,
      kingThreatened: false,
      kingDanger: 0,
      dangerCells: hotStats.nonzero,
      statsEngine: hotStats.source
    };

    if (ownBase) {
      ownBasePiece = ownBase.pieceId ? getPiece(state, ownBase.pieceId) : null;
      if (ownBasePiece && ownBasePiece.owner === opponent) {
        snapshot.baseInvaded = 1;
      }
      snapshot.baseHot = dangerMap.immediateCounts[ownBase.row][ownBase.col];
      snapshot.baseThreat = dangerMap.counts[ownBase.row][ownBase.col];
    }
    if (ownKing) {
      snapshot.kingThreatened = isCellThreatenedInState(state, opponent, ownKing.row, ownKing.col);
      snapshot.kingDanger = dangerMap.counts[ownKing.row][ownKing.col];
    }

    return snapshot;
  }

  function isDefenseSnapshotBetter(candidate, baseline) {
    if (!baseline) {
      return true;
    }
    if ((candidate.kingCaptureThreats || 0) !== (baseline.kingCaptureThreats || 0)) {
      return (candidate.kingCaptureThreats || 0) < (baseline.kingCaptureThreats || 0);
    }
    if (candidate.immediateWins !== baseline.immediateWins) {
      return candidate.immediateWins < baseline.immediateWins;
    }
    if ((candidate.foldThreats || 0) !== (baseline.foldThreats || 0)) {
      return (candidate.foldThreats || 0) < (baseline.foldThreats || 0);
    }
    if ((candidate.baseInvaded || 0) !== (baseline.baseInvaded || 0)) {
      return (candidate.baseInvaded || 0) < (baseline.baseInvaded || 0);
    }
    if ((candidate.baseOccupationThreats || 0) !== (baseline.baseOccupationThreats || 0)) {
      return (candidate.baseOccupationThreats || 0) < (baseline.baseOccupationThreats || 0);
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
      (left.kingCaptureThreats || 0) === (right.kingCaptureThreats || 0) &&
      (left.foldThreats || 0) === (right.foldThreats || 0) &&
      (left.baseInvaded || 0) === (right.baseInvaded || 0) &&
      (left.baseOccupationThreats || 0) === (right.baseOccupationThreats || 0) &&
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
    var playerAttack = getAttackMapForStateCached(state, player).counts;
    var opponentAttack = getAttackMapForStateCached(state, opponent).counts;
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

  function isLongRangeRule(rule) {
    if (!rule) {
      return false;
    }
    if (rule.kind === "ray" || rule.kind === "rayStep") {
      return true;
    }
    return (rule.vectors || []).some(function (vector) {
      return Math.max(Math.abs(vector[0]), Math.abs(vector[1])) >= 2;
    });
  }

  function hasJumpThreatRule(rule) {
    return !!rule && (rule.kind === "jump" || rule.kind === "mixed");
  }

  function countKingSafeEscapeSquares(state, player) {
    var king = findKingInState(state, player);
    if (!king) {
      return 0;
    }
    return withTemporaryState(state, function () {
      return getLegalMoveTargets(king).filter(function (target) {
        return !wouldKingBeThreatenedAfterMove(state, player, king, target.row, target.col);
      }).length;
    });
  }

  function countOpenLongRangeThreatsToKing(state, player) {
    var king = findKingInState(state, player);
    var opponent = getOpponentPlayer(player);
    var count = 0;
    if (!king) {
      return 0;
    }
    return withTemporaryState(state, function () {
      Object.keys(state.players[opponent].pieces).forEach(function (pieceId) {
        var piece = state.players[opponent].pieces[pieceId];
        var rule = getMovementRule(piece.kind);
        var distance = Math.max(Math.abs(piece.row - king.row), Math.abs(piece.col - king.col));
        if (distance >= 2 && isLongRangeRule(rule) && canMovePiece(piece, king.row, king.col)) {
          count += 1;
        }
      });
      return count;
    });
  }

  function countJumpLandingThreatsNearKing(state, player) {
    var king = findKingInState(state, player);
    var opponent = getOpponentPlayer(player);
    var count = 0;
    if (!king) {
      return 0;
    }
    return withTemporaryState(state, function () {
      Object.keys(state.players[opponent].pieces).forEach(function (pieceId) {
        var piece = state.players[opponent].pieces[pieceId];
        var rule = getMovementRule(piece.kind);
        if (!hasJumpThreatRule(rule)) {
          return;
        }
        getLegalMoveTargets(piece).forEach(function (target) {
          var distance = Math.abs(target.row - king.row) + Math.abs(target.col - king.col);
          if (distance <= 1) {
            count += 1;
          }
        });
      });
      return count;
    });
  }

  function countProtectedKingBlockers(state, player) {
    var king = findKingInState(state, player);
    var count = 0;
    if (!king) {
      return 0;
    }
    Object.keys(state.players[player].pieces).forEach(function (pieceId) {
      var piece = state.players[player].pieces[pieceId];
      var distance;
      if (piece.kind === "king") {
        return;
      }
      distance = Math.abs(piece.row - king.row) + Math.abs(piece.col - king.col);
      if (distance <= 2 && isCellThreatenedInState(state, player, piece.row, piece.col)) {
        count += 1;
      }
    });
    return count;
  }

  function countSteppingStoneBlockers(state, player) {
    var king = findKingInState(state, player);
    var opponent = getOpponentPlayer(player);
    var count = 0;
    if (!king) {
      return 0;
    }
    return withTemporaryState(state, function () {
      Object.keys(state.players[player].pieces).forEach(function (pieceId) {
        var blocker = state.players[player].pieces[pieceId];
        var distance;
        if (blocker.kind === "king") {
          return;
        }
        distance = Math.abs(blocker.row - king.row) + Math.abs(blocker.col - king.col);
        if (distance > 3) {
          return;
        }
        Object.keys(state.players[opponent].pieces).some(function (attackerId) {
          var attacker = state.players[opponent].pieces[attackerId];
          var nextState;
          var nextAttacker;
          if (!canMovePiece(attacker, blocker.row, blocker.col)) {
            return false;
          }
          nextState = cloneNpcSimulationState(state);
          nextAttacker = getPiece(nextState, attacker.id);
          nextState.board[nextAttacker.row][nextAttacker.col].pieceId = null;
          delete nextState.players[player].pieces[blocker.id];
          nextAttacker.row = blocker.row;
          nextAttacker.col = blocker.col;
          nextState.board[blocker.row][blocker.col].pieceId = nextAttacker.id;
          if (isKingUnderThreatInState(nextState, player)) {
            count += 1;
            return true;
          }
          return false;
        });
      });
      return count;
    });
  }

  function countReserveDropsNearKing(state, player) {
    var king = findKingInState(state, player);
    var count = 0;
    if (!king) {
      return 0;
    }
    return withTemporaryState(state, function () {
      Object.keys(state.players[player].reserve).forEach(function (pieceType) {
        if (!state.players[player].reserve[pieceType]) {
          return;
        }
        getLegalReserveTargets(player, pieceType).some(function (target) {
          var distance = Math.abs(target.row - king.row) + Math.abs(target.col - king.col);
          if (distance <= 2) {
            count += 1;
            return true;
          }
          return false;
        });
      });
      return count;
    });
  }

  function getDefenseCriteriaScoreForPlayer(state, player) {
    var safeEscapes = countKingSafeEscapeSquares(state, player);
    var openLongRays = countOpenLongRangeThreatsToKing(state, player);
    var steppingStones = countSteppingStoneBlockers(state, player);
    var jumpLandings = countJumpLandingThreatsNearKing(state, player);
    var protectedBlockers = countProtectedKingBlockers(state, player);
    var reserveDrops = countReserveDropsNearKing(state, player);
    var score =
      safeEscapes * 12000 +
      protectedBlockers * 8000 +
      reserveDrops * 4000 -
      openLongRays * 30000 -
      steppingStones * 20000 -
      jumpLandings * 6000;
    if (safeEscapes === 0) {
      score -= 25000;
    }
    if (isKingUnderThreatInState(state, player)) {
      score -= 100000;
    }
    return score;
  }

  function isNpcShieldPiece(pieceType) {
    return pieceType === "guard" ||
      pieceType === "barrier" ||
      pieceType === "realmKnight" ||
      pieceType === "flanker" ||
      pieceType === "vanguard";
  }

  function getDefensiveBandTargetCol(state, player) {
    var base = findBaseCenterInState(state, player);
    var forward = player === "P1" ? 1 : -1;
    var fallback = player === "P1" ? 4 : Math.max(BOARD_COLS - 5, 1);
    if (!base) {
      return Math.max(1, Math.min(BOARD_COLS - 2, fallback));
    }
    return Math.max(1, Math.min(BOARD_COLS - 2, base.col + forward * 3));
  }

  function getDefensiveBandCellBonus(state, player, row, col) {
    var base = findBaseCenterInState(state, player);
    var forward = player === "P1" ? 1 : -1;
    var targetCol;
    var forwardDelta;
    var rowDelta;
    var bandDelta;
    var bonus;
    if (!base) {
      return 0;
    }
    targetCol = getDefensiveBandTargetCol(state, player);
    forwardDelta = (col - base.col) * forward;
    rowDelta = Math.abs(row - base.row);
    bandDelta = Math.abs(col - targetCol);
    if (forwardDelta >= 2 && forwardDelta <= 4 && rowDelta <= 4) {
      bonus = Math.max(0, 4 - bandDelta) * (rowDelta <= 1 ? 165 : rowDelta <= 3 ? 96 : 42);
      if (forwardDelta === 3) {
        bonus += 140;
      }
      return bonus;
    }
    if (forwardDelta >= 5 && rowDelta <= 2) {
      return -240;
    }
    if (forwardDelta >= 0 && forwardDelta <= 1 && rowDelta <= 1) {
      return 80;
    }
    return 0;
  }

  function getDefensiveBandScoreForPlayer(state, player) {
    if (uiState.npc && uiState.npc.bulkSelfPlay) {
      return 0;
    }
    return getCachedNpcEvalMetric(state, player, "defensiveBand", function () {
      var base = findBaseCenterInState(state, player);
      var opponent = getOpponentPlayer(player);
      var ownAttack = getAttackMapForStateCached(state, player).counts;
      var opponentAttack = getAttackMapForStateCached(state, opponent).counts;
      var forward = player === "P1" ? 1 : -1;
      var targetCol = getDefensiveBandTargetCol(state, player);
      var score = 0;
      var controlledBand = 0;
      var solidBandPieces = 0;
      var coveredBand = 0;
      var overextendedRoad = 0;
      var row;
      var col;
      if (!base) {
        return -22000;
      }
      for (row = 0; row < BOARD_ROWS; row += 1) {
        for (col = 0; col < BOARD_COLS; col += 1) {
          var cell = state.board[row][col];
          var piece = cell.pieceId ? getPiece(state, cell.pieceId) : null;
          var forwardDelta = (col - base.col) * forward;
          var rowDelta = Math.abs(row - base.row);
          var bandDelta = Math.abs(col - targetCol);
          var weight = Math.max(0, 3 - bandDelta) * (rowDelta <= 1 ? 1.15 : rowDelta <= 3 ? 0.7 : 0.25);
          if (forwardDelta >= 2 && forwardDelta <= 4 && rowDelta <= 4) {
            if (cell.controller === player) {
              controlledBand += 1;
              score += 1550 * weight;
            } else if (cell.controller === opponent) {
              score -= 2100 * weight;
            }
            if (piece && piece.owner === player && piece.kind !== "king") {
              solidBandPieces += isNpcShieldPiece(piece.kind) ? 1 : 0;
              score += (isNpcShieldPiece(piece.kind) ? 2550 : 1150) * weight;
            } else if (piece && piece.owner === opponent) {
              score -= (piece.kind === "king" ? 0 : 3600) * weight;
            }
            if (ownAttack[row][col] > 0) {
              coveredBand += 1;
              score += Math.min(2, ownAttack[row][col]) * 760 * weight;
            }
            score -= Math.min(3, opponentAttack[row][col]) * 980 * weight;
          }
          if (forwardDelta >= 5 && rowDelta <= 2 && cell.controller === player) {
            overextendedRoad += 1;
            score -= 920;
            if (opponentAttack[row][col] > 0 && ownAttack[row][col] === 0) {
              score -= 2600;
            }
          }
          if (forwardDelta >= 0 && forwardDelta <= 1 && rowDelta <= 1) {
            if (cell.controller === opponent) {
              score -= 4200;
            }
            score -= Math.min(3, opponentAttack[row][col]) * 2400;
          }
        }
      }
      if (controlledBand < 4) {
        score -= (4 - controlledBand) * 4800;
      }
      if (coveredBand < 3) {
        score -= (3 - coveredBand) * 3600;
      }
      if (!solidBandPieces) {
        score -= 5200;
      }
      if (overextendedRoad >= 5) {
        score -= (overextendedRoad - 4) * 2400;
      }
      return score;
    });
  }

  function getKingLandingControlScoreForPlayer(state, player) {
    if (uiState.npc && uiState.npc.bulkSelfPlay) {
      return 0;
    }
    return getCachedNpcEvalMetric(state, player, "kingLandingControl", function () {
      var king = findKingInState(state, player);
      var opponent = getOpponentPlayer(player);
      var ownAttack = getAttackMapForStateCached(state, player).counts;
      var opponentAttack = getAttackMapForStateCached(state, opponent).counts;
      var safeEscapes = countKingSafeEscapeSquares(state, player);
      var score = safeEscapes * 9200 -
        countOpenLongRangeThreatsToKing(state, player) * 36000 -
        countJumpLandingThreatsNearKing(state, player) * 16000 -
        countSteppingStoneBlockers(state, player) * 28000;
      var row;
      var col;
      if (!king) {
        return -240000;
      }
      if (isKingUnderThreatInState(state, player)) {
        score -= 180000;
      }
      if (safeEscapes === 0) {
        score -= 52000;
      } else if (safeEscapes === 1) {
        score -= 18000;
      }
      for (row = Math.max(0, king.row - 2); row <= Math.min(BOARD_ROWS - 1, king.row + 2); row += 1) {
        for (col = Math.max(0, king.col - 2); col <= Math.min(BOARD_COLS - 1, king.col + 2); col += 1) {
          var distance = Math.abs(row - king.row) + Math.abs(col - king.col);
          var weight;
          var cell;
          var piece;
          if (distance > 2) {
            continue;
          }
          weight = distance === 0 ? 3.4 : distance === 1 ? 2.1 : 0.9;
          cell = state.board[row][col];
          piece = cell.pieceId ? getPiece(state, cell.pieceId) : null;
          if (cell.controller === player) {
            score += 1050 * weight;
          } else if (cell.controller === opponent) {
            score -= 1800 * weight;
          }
          score += Math.min(3, ownAttack[row][col]) * 1250 * weight;
          score -= Math.min(4, opponentAttack[row][col]) * 2450 * weight;
          if (piece && piece.owner === player && piece.kind !== "king") {
            score += (isNpcShieldPiece(piece.kind) ? 3400 : 1550) * weight;
          } else if (piece && piece.owner === opponent) {
            score -= (piece.kind === "king" ? 0 : 5200) * weight;
          }
          if (distance <= 1 && opponentAttack[row][col] > ownAttack[row][col]) {
            score -= (opponentAttack[row][col] - ownAttack[row][col]) * 6400;
          }
          if (cell.controller === player && opponentAttack[row][col] > 0 && ownAttack[row][col] === 0) {
            score -= 4200 * weight;
          }
        }
      }
      return score;
    });
  }

  function getKifuFragmentDangerWeight(card, state) {
    var table;
    if (!card || !card.fragmentType) {
      return 0;
    }
    table = state && state.ruleMode === "shogi"
      ? NPC_KIFU_LEARNED_WEIGHTS.shogiDangerousOpeningFragments
      : NPC_KIFU_LEARNED_WEIGHTS.dangerousOpeningFragments;
    return table[card.fragmentType] || 0;
  }

  function getOpeningRescueSetupStats(state, player) {
    var stats = {
      minCol: Infinity,
      maxCol: -Infinity,
      cells: 0,
      shield: 0,
      attack: 0,
      soft: 0
    };
    (state.placements || []).forEach(function (placement) {
      if (!placement || placement.owner !== player || !placement.card) {
        return;
      }
      (placement.cells || []).forEach(function (cell) {
        stats.minCol = Math.min(stats.minCol, cell.col);
        stats.maxCol = Math.max(stats.maxCol, cell.col);
        stats.cells += 1;
      });
    });
    Object.keys(state.players[player].pieces || {}).forEach(function (pieceId) {
      var piece = state.players[player].pieces[pieceId];
      if (!piece || piece.kind === "king") {
        return;
      }
      if (NPC_OPENING_RESCUE_JOSEKI.setup.shieldPieces[piece.kind]) {
        stats.shield += 1;
      } else if (NPC_OPENING_RESCUE_JOSEKI.setup.attackPieces[piece.kind]) {
        stats.attack += 1;
      } else if (NPC_OPENING_RESCUE_JOSEKI.setup.softPieces[piece.kind]) {
        stats.soft += 1;
      }
    });
    if (!stats.cells) {
      stats.minCol = null;
      stats.maxCol = null;
    }
    return stats;
  }

  function getOpeningRescueBandEdge(stats, player) {
    if (!stats || stats.minCol === null || stats.maxCol === null) {
      return null;
    }
    return player === "P2" ? stats.minCol : (BOARD_COLS - 1 - stats.maxCol);
  }

  function getOpeningRescueSetupBias(state, player, nextState, finalSetup) {
    var strategy = getNpcStrategy(player);
    var stats;
    var edge;
    var bandWeight;
    var score = 0;
    if (uiState.npc && uiState.npc.bulkSelfPlay) {
      return 0;
    }
    if (strategy !== "defense" && strategy !== "balanced") {
      return 0;
    }
    stats = getOpeningRescueSetupStats(nextState || state, player);
    edge = getOpeningRescueBandEdge(stats, player);
    if (edge === null) {
      return 0;
    }
    bandWeight = NPC_OPENING_RESCUE_JOSEKI.setup.preferredBandEdges[String(edge)] || 0;
    score += bandWeight * (finalSetup ? 42000 : 15000);
    if (edge < 8) {
      score -= finalSetup ? 62000 : 18000;
    } else if (edge > 10) {
      score -= finalSetup ? 26000 : 9000;
    }
    if (stats.shield >= 2) {
      score += finalSetup ? 28000 : 8500;
    } else if (stats.shield >= 1) {
      score += finalSetup ? 15000 : 5000;
    }
    if (finalSetup && stats.shield === 0 && stats.attack >= 3 && edge <= 8) {
      score -= 46000;
    }
    if (finalSetup && stats.attack >= 1 && stats.shield >= 1 && edge >= 9 && edge <= 10) {
      score += 12000;
    }
    return score;
  }

  function getOpeningRescueActionKey(state, player, action) {
    var piece;
    var targetCell;
    var targetPiece;
    if (!action) {
      return "";
    }
    if (action.type === "fragment" && action.card) {
      return "fragment:" + action.card.fragmentType + "/" + action.card.pieceType;
    }
    if (action.type === "move") {
      piece = getPiece(state, action.pieceId);
      targetCell = state.board[action.row] && state.board[action.row][action.col];
      targetPiece = targetCell && targetCell.pieceId ? getPiece(state, targetCell.pieceId) : null;
      if (piece && targetPiece && targetPiece.owner !== player) {
        return "move:" + piece.kind + ":capture";
      }
      return piece ? "move:" + piece.kind : "move";
    }
    if (action.type === "reserve") {
      return "reserve:" + action.pieceType;
    }
    return action.type || "";
  }

  function getOpeningRescueResponseScore(state, player, action) {
    var phase = getNpcGamePhase(state);
    var strategy = getNpcStrategy(player);
    var key;
    var weight;
    var scale;
    if (uiState.npc && uiState.npc.bulkSelfPlay) {
      return 0;
    }
    if (strategy !== "defense" && strategy !== "balanced") {
      return 0;
    }
    if (phase !== "setup" && phase !== "early") {
      return 0;
    }
    key = getOpeningRescueActionKey(state, player, action);
    weight = NPC_OPENING_RESCUE_JOSEKI.responseWeights[key] || 0;
    if (!weight) {
      return 0;
    }
    scale = (state.turnNumber || 1) <= 2 ? 32000 : 16000;
    return weight * scale;
  }

  function getNpcOpeningBookActionBias(state, player, action, nextState, emergencyMode) {
    var phase = getNpcGamePhase(state);
    var strategy = getNpcStrategy(player);
    var card;
    var weight;
    var stats;
    var score = 0;
    if (uiState.npc && uiState.npc.bulkSelfPlay) {
      return 0;
    }
    if (phase !== "setup" && phase !== "early") {
      return 0;
    }
    score += getOpeningRescueResponseScore(state, player, action) * (strategy === "defense" ? 1.45 : 0.75);
    if (action.type === "setupFragment" || action.type === "fragment") {
      card = action.card || {};
      weight = getKifuFragmentDangerWeight(card, state);
      if (strategy === "attack") {
        score += weight * (phase === "setup" ? 26000 : 34000);
      } else if (strategy === "defense") {
        score += weight * 9000;
      } else {
        score += weight * 17000;
      }
      if (card.pieceType && NPC_OPENING_RESCUE_JOSEKI.setup.shieldPieces[card.pieceType]) {
        score += strategy === "defense" ? 22000 : 9000;
      } else if (card.pieceType && NPC_OPENING_RESCUE_JOSEKI.setup.attackPieces[card.pieceType]) {
        score += strategy === "attack" ? 17000 : 4500;
      } else if (card.pieceType && NPC_OPENING_RESCUE_JOSEKI.setup.softPieces[card.pieceType]) {
        score -= strategy === "defense" && !emergencyMode ? 5000 : 1200;
      }
      if (nextState && (strategy === "defense" || strategy === "balanced")) {
        score += getOpeningRescueSetupBias(state, player, nextState, !isInitialStandbyPhase(nextState)) * 0.68;
        stats = getOpeningRescueSetupStats(nextState, player);
        if (stats.shield === 0 && stats.attack >= 2 && !emergencyMode) {
          score -= strategy === "defense" ? 26000 : 12000;
        }
      }
    }
    if ((action.type === "recoverPiece" || action.type === "recoverFragment") && emergencyMode) {
      score += strategy === "defense" ? 18000 : 6000;
    }
    return score;
  }

  function applyOpeningRescueActionScoreBias(state, player, actions) {
    if (!state || !actions || isInitialStandbyPhase(state)) {
      return actions;
    }
    actions.forEach(function (action) {
      action.score += getOpeningRescueResponseScore(state, player, action);
    });
    return actions;
  }

  function getEnemyBaseTargetBonusInState(state, player, row, col) {
    var enemyBase = findBaseCenterInState(state, getOpponentPlayer(player));
    if (!enemyBase) {
      return 0;
    }
    return Math.max(0, 9 - getWeightedDistance(row, col, enemyBase.row, enemyBase.col)) * 4.5;
  }

  function getDefenseCounterattackWindow(state, player) {
    var strategy = getNpcStrategy(player);
    var phase = getNpcGamePhase(state);
    var opponent;
    var snapshot;
    var risk;
    var landing;
    var band;
    var enemyPressure;
    var ownCounter;
    var deckCount;
    var factor;
    if (!state || isInitialStandbyPhase(state)) {
      return 0;
    }
    if (strategy !== "defense" && strategy !== "balanced") {
      return 0;
    }
    if (uiState.npc && uiState.npc.bulkSelfPlay) {
      if (isKingUnderThreatInState(state, player)) {
        return 0;
      }
      factor = strategy === "defense" ? 0.22 : 0.14;
      if ((state.turnNumber || 1) >= 18) {
        factor += 0.18;
      }
      if ((state.turnNumber || 1) >= 36) {
        factor += 0.18;
      }
      if (state.players[player] && state.players[player].deck && state.players[player].deck.length <= 8) {
        factor += 0.16;
      }
      return Math.max(0, Math.min(0.88, factor));
    }
    snapshot = getDefenseSnapshotCached(state, player);
    if (snapshot.kingThreatened || snapshot.immediateWins || snapshot.baseHot) {
      return 0;
    }
    risk = getFastLossRiskScoreForPlayer(state, player);
    landing = getKingLandingControlScoreForPlayer(state, player);
    band = getDefensiveBandScoreForPlayer(state, player);
    if (risk >= 135000 || landing <= -90000 || band <= -26000) {
      return 0;
    }

    opponent = getOpponentPlayer(player);
    enemyPressure = getOpeningAttackPressureScoreForPlayer(state, opponent);
    ownCounter = getCounterPressureScoreForPlayer(state, player);
    deckCount = state.players[player] && state.players[player].deck ? state.players[player].deck.length : 0;
    factor = strategy === "defense" ? 0.3 : 0.2;
    if (phase === "early") {
      factor += (state.turnNumber || 1) >= 8 ? 0.16 : 0.04;
    } else if (phase === "mid") {
      factor += 0.3;
    } else if (phase === "late") {
      factor += 0.48;
    }
    if (risk < 45000) {
      factor += 0.22;
    } else if (risk < 75000) {
      factor += 0.12;
    }
    if (landing > 0) {
      factor += 0.18;
    } else if (landing > -12000) {
      factor += 0.1;
    }
    if (band > 0) {
      factor += 0.14;
    } else if (band > -9000) {
      factor += 0.06;
    }
    if (enemyPressure < 35000) {
      factor += 0.08;
    } else if (enemyPressure > 80000) {
      factor -= 0.18;
    }
    if (ownCounter > 70000) {
      factor += 0.14;
    } else if (ownCounter > 30000) {
      factor += 0.08;
    }
    if ((state.turnNumber || 1) >= 14 || deckCount <= 8) {
      factor += 0.08;
    }
    return Math.max(0, Math.min(1.25, factor));
  }

  function getCounterattackTransitionActionKey(state, player, action) {
    var piece;
    var targetCell;
    var targetPiece;
    if (!action) {
      return "";
    }
    if (action.type === "fragment" && action.card) {
      return "fragment:" + action.card.fragmentType + "/" + action.card.pieceType;
    }
    if (action.type === "move") {
      piece = getPiece(state, action.pieceId);
      targetCell = state.board[action.row] && state.board[action.row][action.col];
      targetPiece = targetCell && targetCell.pieceId ? getPiece(state, targetCell.pieceId) : null;
      if (piece && targetPiece && targetPiece.owner !== player) {
        return "move:" + piece.kind + ":capture:" + targetPiece.kind;
      }
      return piece ? "move:" + piece.kind : "move";
    }
    if (action.type === "reserve") {
      return "reserve:" + action.pieceType;
    }
    return action.type || "";
  }

  function getCounterattackTransitionWeight(state, player, action) {
    var key = getCounterattackTransitionActionKey(state, player, action);
    return NPC_COUNTERATTACK_TRANSITION_WEIGHTS.actions[key] || 0;
  }

  function getCounterattackLaneBonus(state, action, player) {
    var score = 0;
    var piece;
    var targetCell;
    var targetPiece;

    function addCell(row, col, pieceType, weight) {
      if (!isInBounds(row, col)) {
        return;
      }
      score += getEnemyBaseTargetBonusInState(state, player, row, col) * 240 * weight;
      score += getEnemyKingProximityScoreForCell(state, player, row, col, pieceType) * 0.9 * weight;
    }

    if (!action) {
      return 0;
    }
    if (action.type === "move") {
      piece = getPiece(state, action.pieceId);
      if (!piece) {
        return 0;
      }
      addCell(action.row, action.col, piece.kind, 1.05);
      targetCell = state.board[action.row] && state.board[action.row][action.col];
      targetPiece = targetCell && targetCell.pieceId ? getPiece(state, targetCell.pieceId) : null;
      if (targetCell && targetCell.isBaseCenter && targetCell.baseOwner === getOpponentPlayer(player)) {
        score += 8800;
      }
      if (targetPiece && targetPiece.owner !== player) {
        score += targetPiece.kind === "king"
          ? 220000
          : 9000 + getPieceStrategicValue(targetPiece.kind) * 44;
      }
    } else if (action.type === "reserve") {
      addCell(action.row, action.col, action.pieceType, 0.72);
    } else if (action.type === "fragment" && action.card) {
      action.cells.forEach(function (fragmentCell) {
        addCell(fragmentCell.row, fragmentCell.col, action.card.pieceType, 0.24);
      });
      if (action.pieceCell) {
        addCell(action.pieceCell.row, action.pieceCell.col, action.card.pieceType, 1.08);
      }
    }
    return score;
  }

  function getCounterattackTransitionActionBias(state, action, player, nextState, emergencyMode) {
    var opponent = getOpponentPlayer(player);
    var factor = getDefenseCounterattackWindow(state, player);
    var beforeRisk;
    var afterRisk;
    var beforeCounter;
    var afterCounter;
    var beforeOpening;
    var afterOpening;
    var beforeClosing;
    var afterClosing;
    var beforeBasePressure;
    var afterBasePressure;
    var afterSnapshot;
    var ownThreats;
    var opponentThreats;
    var score = 0;
    if (!factor) {
      return 0;
    }
    if (emergencyMode) {
      factor *= 0.35;
    }
    if (!nextState) {
      nextState = cloneNpcSimulationState(state);
      nextState.currentPlayer = player;
      applyNpcActionToState(nextState, action);
    }
    if (nextState.winner === player) {
      return 260000;
    }
    if (nextState.winner === opponent) {
      return -260000;
    }

    beforeRisk = getFastLossRiskScoreForPlayer(state, player);
    afterRisk = getFastLossRiskScoreForPlayer(nextState, player);
    beforeCounter = getCounterPressureScoreForPlayer(state, player);
    afterCounter = getCounterPressureScoreForPlayer(nextState, player);
    beforeOpening = getOpeningAttackPressureScoreForPlayer(state, player);
    afterOpening = getOpeningAttackPressureScoreForPlayer(nextState, player);
    beforeClosing = getClosingPressureScoreForPlayer(state, player);
    afterClosing = getClosingPressureScoreForPlayer(nextState, player);
    beforeBasePressure = getBaseCenterPressureScore(state, player);
    afterBasePressure = getBaseCenterPressureScore(nextState, player);
    afterSnapshot = getDefenseSnapshotCached(nextState, player);
    ownThreats = findImmediateWinningThreatsShallow(nextState, player, 4).length;
    opponentThreats = findImmediateWinningThreatsShallow(nextState, opponent, 4).length;

    score += getCounterattackTransitionWeight(state, player, action) * 36000 * factor;
    score += getCounterattackLaneBonus(state, action, player) * factor;
    score += (afterCounter - beforeCounter) * 0.58 * factor;
    score += (afterOpening - beforeOpening) * 0.24 * factor;
    score += (afterClosing - beforeClosing) * 0.46 * factor;
    score += (afterBasePressure - beforeBasePressure) * 1.15 * factor;
    score += ownThreats * (24000 + factor * 9000);
    score -= opponentThreats * (62000 + factor * 16000);
    if (afterRisk > beforeRisk) {
      score -= Math.min(150000, (afterRisk - beforeRisk) * 0.46) * factor;
    } else {
      score += Math.min(36000, (beforeRisk - afterRisk) * 0.2) * factor;
    }
    if (afterSnapshot.kingThreatened || afterSnapshot.immediateWins || afterSnapshot.baseHot) {
      score -= 220000 * factor;
    } else if (afterSnapshot.baseThreat === 0 && afterSnapshot.kingDanger <= 1) {
      score += 9000 * factor;
    }
    if ((action.type === "recoverPiece" || action.type === "recoverFragment" || action.type === "mulligan") && !ownThreats) {
      score -= (action.type === "mulligan" ? 18000 : 9000) * factor;
    }
    return score;
  }

  function applyCounterattackTransitionScoreBias(state, player, actions) {
    var factor;
    if (!state || !actions || isInitialStandbyPhase(state)) {
      return actions;
    }
    factor = getDefenseCounterattackWindow(state, player);
    if (!factor) {
      return actions;
    }
    if (uiState.npc && uiState.npc.bulkSelfPlay) {
      actions.forEach(function (action) {
        action.score += getCounterattackTransitionWeight(state, player, action) * 9000 * factor;
        if (action.type === "move" || action.type === "reserve") {
          action.score += getEnemyBaseTargetBonusInState(state, player, action.row, action.col) * 260 * factor;
        } else if (action.type === "fragment" && action.pieceCell) {
          action.score += getEnemyBaseTargetBonusInState(state, player, action.pieceCell.row, action.pieceCell.col) * 280 * factor;
        }
        if (action.type === "recoverPiece" || action.type === "recoverFragment" || action.type === "mulligan") {
          action.score -= 2600 * factor;
        }
      });
      return actions;
    }
    actions.forEach(function (action) {
      action.score += getCounterattackTransitionWeight(state, player, action) * 18000 * factor;
      action.score += getCounterattackLaneBonus(state, action, player) * 0.34 * factor;
      if (action.type === "recoverPiece" || action.type === "recoverFragment" || action.type === "mulligan") {
        action.score -= 4200 * factor;
      }
    });
    return actions;
  }

  function getOpeningAttackPressureScoreForPlayer(state, player) {
    if (uiState.npc && uiState.npc.bulkSelfPlay) {
      return 0;
    }
    return getCachedNpcEvalMetric(state, player, "openingAttackPressure", function () {
      var opponent = getOpponentPlayer(player);
      var enemyBase = findBaseCenterInState(state, opponent);
      var enemyKing = findKingInState(state, opponent);
      var phase = getNpcGamePhase(state);
      var earlyWeight = phase === "setup" ? 1.35 : (phase === "early" ? 1 : 0.38);
      var score = 0;
      if (!enemyBase && !enemyKing) {
        return 0;
      }
      (state.placements || []).forEach(function (placement) {
        var dangerWeight;
        var minBaseDistance = 99;
        var minKingDistance = 99;
        var hasPiece = false;
        if (!placement || placement.owner !== player || !placement.card) {
          return;
        }
        dangerWeight = getKifuFragmentDangerWeight(placement.card, state);
        placement.cells.forEach(function (cell) {
          var boardCell = state.board[cell.row][cell.col];
          var piece = boardCell && boardCell.pieceId ? getPiece(state, boardCell.pieceId) : null;
          if (enemyBase) {
            minBaseDistance = Math.min(minBaseDistance, getWeightedDistance(cell.row, cell.col, enemyBase.row, enemyBase.col));
          }
          if (enemyKing) {
            minKingDistance = Math.min(minKingDistance, getWeightedDistance(cell.row, cell.col, enemyKing.row, enemyKing.col));
          }
          if (piece && piece.owner === player) {
            hasPiece = true;
          }
        });
        if (dangerWeight) {
          score += dangerWeight * Math.max(0, 9 - minBaseDistance) * 5400 * earlyWeight;
          score += dangerWeight * Math.max(0, 7 - minKingDistance) * 6200 * earlyWeight;
          if (hasPiece) {
            score += dangerWeight * 6800 * earlyWeight;
          }
        }
      });
      Object.keys(state.players[player].pieces).forEach(function (pieceId) {
        var piece = state.players[player].pieces[pieceId];
        var pieceWeight = getKifuPiecePressureWeight(piece.kind, state);
        var baseDistance = enemyBase ? getWeightedDistance(piece.row, piece.col, enemyBase.row, enemyBase.col) : 99;
        var kingDistance = enemyKing ? getWeightedDistance(piece.row, piece.col, enemyKing.row, enemyKing.col) : 99;
        score += pieceWeight * Math.max(0, 8 - kingDistance) * 4200;
        score += pieceWeight * Math.max(0, 7 - baseDistance) * 3200;
      });
      return score;
    });
  }

  function getJosekiDefenseResponseScore(state, player, action, nextState) {
    var phase = getNpcGamePhase(state);
    var opponent = getOpponentPlayer(player);
    var beforeEnemyPressure;
    var afterEnemyPressure;
    var beforeOwnPressure;
    var afterOwnPressure;
    var score;
    if (phase !== "setup" && phase !== "early") {
      return 0;
    }
    beforeEnemyPressure = getOpeningAttackPressureScoreForPlayer(state, opponent);
    afterEnemyPressure = getOpeningAttackPressureScoreForPlayer(nextState, opponent);
    beforeOwnPressure = getOpeningAttackPressureScoreForPlayer(state, player);
    afterOwnPressure = getOpeningAttackPressureScoreForPlayer(nextState, player);
    score = Math.max(0, beforeEnemyPressure - afterEnemyPressure) * 0.56;
    score += (afterOwnPressure - beforeOwnPressure) * 0.18;
    score += getOpeningRescueResponseScore(state, player, action);
    if (beforeEnemyPressure >= 42000) {
      score += (getKingLandingControlScoreForPlayer(nextState, player) - getKingLandingControlScoreForPlayer(state, player)) * 0.48;
      score += (getDefensiveBandScoreForPlayer(nextState, player) - getDefensiveBandScoreForPlayer(state, player)) * 0.58;
      if (action.type === "recoverPiece" || action.type === "recoverFragment") {
        score += 6800;
      }
      if (afterEnemyPressure > beforeEnemyPressure + 12000) {
        score -= 36000;
      }
    }
    return score;
  }

  function getFastLossRiskScoreForPlayer(state, player) {
    if (uiState.npc && uiState.npc.bulkSelfPlay) {
      return 0;
    }
    return getCachedNpcEvalMetric(state, player, "fastLossRisk", function () {
      var snapshot = getDefenseSnapshotCached(state, player);
      var phase = getNpcGamePhase(state);
      var useLightSelfPlay = uiState.npc && uiState.npc.bulkSelfPlay;
      var safeEscapes = useLightSelfPlay
        ? (snapshot.kingThreatened || snapshot.immediateWins || snapshot.baseHot ? 1 : 3)
        : countKingSafeEscapeSquares(state, player);
      var openLongRays = useLightSelfPlay ? 0 : countOpenLongRangeThreatsToKing(state, player);
      var steppingStones = useLightSelfPlay ? 0 : countSteppingStoneBlockers(state, player);
      var jumpLandings = useLightSelfPlay ? 0 : countJumpLandingThreatsNearKing(state, player);
      var kingLandingScore = useLightSelfPlay ? 0 : getKingLandingControlScoreForPlayer(state, player);
      var defensiveBandScore = useLightSelfPlay ? 0 : getDefensiveBandScoreForPlayer(state, player);
      var earlyMultiplier = phase === "setup" ? 1.8 : (phase === "early" ? 1.35 : 1);
      var risk = 0;
      risk += (snapshot.kingCaptureThreats || 0) * 260000;
      risk += (snapshot.foldThreats || 0) * 180000;
      risk += snapshot.immediateWins * 120000;
      risk += snapshot.baseHot * 90000;
      risk += (snapshot.kingThreatened ? 150000 : 0);
      risk += snapshot.kingDanger * 22000;
      risk += snapshot.baseThreat * 14000;
      risk += openLongRays * 85000;
      risk += jumpLandings * 32000;
      risk += steppingStones * 52000;
      risk += Math.max(0, -kingLandingScore) * 0.58;
      if (phase === "setup" || phase === "early") {
        risk += Math.max(0, -defensiveBandScore) * 0.42;
      }
      if (safeEscapes <= 1) {
        risk += (2 - safeEscapes) * 56000;
      }
      return risk * earlyMultiplier;
    });
  }

  function getCounterPressureScoreForPlayer(state, player) {
    if (uiState.npc && uiState.npc.bulkSelfPlay) {
      return 0;
    }
    return getCachedNpcEvalMetric(state, player, "counterPressure", function () {
      var opponent = getOpponentPlayer(player);
      var enemyKing = findKingInState(state, opponent);
      var enemyBase = findBaseCenterInState(state, opponent);
      var useLightSelfPlay = uiState.npc && uiState.npc.bulkSelfPlay;
      var score = 0;
      score += (useLightSelfPlay ? 0 : findImmediateWinningThreatsShallow(state, player, 4).length) * 70000;
      if (isKingUnderThreatInState(state, opponent)) {
        score += 36000;
      }
      if (enemyBase) {
        var attackMap = getAttackMapForStateCached(state, player);
        score += Math.min(4, attackMap.counts[enemyBase.row][enemyBase.col]) * 17000;
        if (enemyBase.controller === player) {
          score += 24000;
        }
      }
      if (enemyKing && !useLightSelfPlay) {
        Object.keys(state.players[player].pieces).forEach(function (pieceId) {
          var piece = state.players[player].pieces[pieceId];
          var distance = getWeightedDistance(piece.row, piece.col, enemyKing.row, enemyKing.col);
          if (distance <= 5) {
            score += Math.max(0, 6 - distance) * (800 + getPieceStrategicValue(piece.kind) * 7);
          }
        });
      }
      score += getDeploymentFrontierProfile(state, player).nearEnemyBase * 1200;
      return score;
    });
  }

  function getPurposefulRecoveryScore(state, player, action, nextState) {
    var phase = getNpcGamePhase(state);
    var beforeRisk;
    var afterRisk;
    var defenseDelta;
    var baseDelta;
    var deploymentDelta;
    var counterDelta;
    var landingDelta;
    var bandDelta;
    var score;
    if (!action || (action.type !== "recoverPiece" && action.type !== "recoverFragment")) {
      return 0;
    }
    beforeRisk = getFastLossRiskScoreForPlayer(state, player);
    afterRisk = getFastLossRiskScoreForPlayer(nextState, player);
    defenseDelta = getDefenseCriteriaScoreForPlayer(nextState, player) - getDefenseCriteriaScoreForPlayer(state, player);
    baseDelta = getBaseCenterShieldScoreForPlayer(nextState, player) - getBaseCenterShieldScoreForPlayer(state, player);
    deploymentDelta = getDeploymentControlScoreForPlayer(nextState, player) - getDeploymentControlScoreForPlayer(state, player);
    counterDelta = getCounterPressureScoreForPlayer(nextState, player) - getCounterPressureScoreForPlayer(state, player);
    landingDelta = getKingLandingControlScoreForPlayer(nextState, player) - getKingLandingControlScoreForPlayer(state, player);
    bandDelta = getDefensiveBandScoreForPlayer(nextState, player) - getDefensiveBandScoreForPlayer(state, player);
    score = Math.max(0, beforeRisk - afterRisk) * 0.45;
    score += Math.max(0, defenseDelta) * 0.72;
    score += Math.max(0, baseDelta) * 1.05;
    score += Math.max(0, counterDelta) * 0.28;
    score += Math.max(0, landingDelta) * 0.82;
    score += Math.max(0, bandDelta) * 0.62;
    if (deploymentDelta > 0) {
      score += deploymentDelta * 0.55;
    }
    if (score < 5000) {
      score -= phase === "late" ? 12000 : 18000;
    }
    if (phase === "setup" || phase === "early") {
      score -= 6000;
    }
    return score;
  }

  function getSetupSafetyActionBias(state, player, action) {
    if (uiState.npc && uiState.npc.bulkSelfPlay) {
      return 0;
    }
    var strategy = getNpcStrategy(player);
    var phaseWeights = getNpcPhaseWeights(strategy, "setup");
    var nextState;
    var beforeRisk;
    var afterRisk;
    var beforeCounter;
    var afterCounter;
    var beforeLanding;
    var afterLanding;
    var beforeBand;
    var afterBand;
    var beforeGate;
    var afterGate;
    var score;
    if (!action || action.type !== "setupFragment") {
      return 0;
    }
    nextState = cloneNpcSimulationState(state);
    nextState.currentPlayer = player;
    applyNpcActionToState(nextState, action);
    beforeRisk = getFastLossRiskScoreForPlayer(state, player);
    afterRisk = getFastLossRiskScoreForPlayer(nextState, player);
    beforeCounter = getCounterPressureScoreForPlayer(state, player);
    afterCounter = getCounterPressureScoreForPlayer(nextState, player);
    beforeLanding = getKingLandingControlScoreForPlayer(state, player);
    afterLanding = getKingLandingControlScoreForPlayer(nextState, player);
    beforeBand = getDefensiveBandScoreForPlayer(state, player);
    afterBand = getDefensiveBandScoreForPlayer(nextState, player);
    beforeGate = getOwnBaseGateControlScoreForPlayer(state, player);
    afterGate = getOwnBaseGateControlScoreForPlayer(nextState, player);
    score = (beforeRisk - afterRisk) * (0.5 * phaseWeights.defense);
    score += (afterCounter - beforeCounter) * (0.16 * phaseWeights.counter);
    score += (getBaseCenterShieldScoreForPlayer(nextState, player) - getBaseCenterShieldScoreForPlayer(state, player)) * (0.5 * phaseWeights.defense);
    score += (getKingShieldLineScoreForPlayer(nextState, player) - getKingShieldLineScoreForPlayer(state, player)) * (0.34 * phaseWeights.defense);
    score += (afterLanding - beforeLanding) * (0.54 * phaseWeights.defense);
    score += (afterBand - beforeBand) * (0.7 * phaseWeights.defense);
    score += (afterGate - beforeGate) * (0.72 * phaseWeights.defense);
    if (afterRisk > beforeRisk && state.turnNumber <= 2) {
      score -= 42000;
    }
    if (afterRisk >= 120000 && state.turnNumber <= 2) {
      score -= 90000;
    }
    if (strategy === "defense" && afterCounter <= beforeCounter) {
      score -= 9000;
    }
    if (strategy === "defense" && afterGate < -18000 && state.turnNumber <= 2) {
      score -= 52000;
    }
    return score;
  }

  function getInitialSetupTacticalBias(state, player, action) {
    var nextState;
    var opponent;
    var finalSetup;
    var opponentImmediateWins;
    var ownImmediateWins;
    var opponentThreatCreation;
    var ownThreatCreation;
    var snapshot;
    var defenseDelta;
    var landingDelta;
    var bandDelta;
    var gateDelta;
    var score;
    if (!action || action.type !== "setupFragment" || !state || !isInitialStandbyPhase(state)) {
      return 0;
    }
    nextState = cloneNpcSimulationState(state);
    nextState.currentPlayer = player;
    applyNpcActionToState(nextState, action);
    opponent = getOpponentPlayer(player);
    finalSetup = !isInitialStandbyPhase(nextState);
    snapshot = getDefenseSnapshotCached(nextState, player);
    defenseDelta = getDefenseCriteriaScoreForPlayer(nextState, player) - getDefenseCriteriaScoreForPlayer(state, player);
    landingDelta = getKingLandingControlScoreForPlayer(nextState, player) - getKingLandingControlScoreForPlayer(state, player);
    bandDelta = getDefensiveBandScoreForPlayer(nextState, player) - getDefensiveBandScoreForPlayer(state, player);
    gateDelta = getOwnBaseGateControlScoreForPlayer(nextState, player) - getOwnBaseGateControlScoreForPlayer(state, player);
    score = defenseDelta * 0.48;
    score += landingDelta * 0.38;
    score += bandDelta * 0.96;
    score += gateDelta * (finalSetup ? 1.16 : 0.58);
    action.cells.forEach(function (cell) {
      score += getOwnBaseGateCellBonus(nextState, player, cell.row, cell.col) * (finalSetup ? 28 : 14);
    });
    if (action.pieceCell) {
      score += getOwnBaseGateCellBonus(nextState, player, action.pieceCell.row, action.pieceCell.col) * (finalSetup ? 155 : 90);
    }
    score += getOpeningRescueSetupBias(state, player, nextState, finalSetup);

    if (finalSetup) {
      opponentImmediateWins = countImmediateWinningActionsInState(nextState, opponent, 12);
      ownImmediateWins = countImmediateWinningActionsInState(nextState, player, 6);
      opponentThreatCreation = countImmediateThreatCreatingActionsInState(nextState, opponent, 6);
      ownThreatCreation = countImmediateThreatCreatingActionsInState(nextState, player, 3);
      score -= opponentImmediateWins * 185000;
      score += ownImmediateWins * 9000;
      score -= opponentThreatCreation * (isKingOnOwnBaseCenterInState(nextState, player) ? 145000 : 90000);
      score += ownThreatCreation * 11000;
      if (getOwnBaseGateControlScoreForPlayer(nextState, player) < -12000) {
        score -= 78000;
      }
    } else {
      score -= snapshot.immediateWins * 22000;
    }

    score -= snapshot.baseHot * (finalSetup ? 90000 : 26000);
    score -= snapshot.baseThreat * (finalSetup ? 16000 : 5200);
    score -= snapshot.kingDanger * (finalSetup ? 28000 : 7600);
    if (snapshot.kingThreatened) {
      score -= finalSetup ? 170000 : 48000;
    }
    if (finalSetup && getDefensiveBandScoreForPlayer(nextState, player) < -12000) {
      score -= 38000;
    }
    return score;
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
    var strategy = getNpcStrategy(player);
    var currentPressure = getBaseCenterPressureScore(state, player) - getBaseCenterPressureScore(state, opponent);
    var currentRole = getPieceRoleScoreForPlayer(state, player) - getPieceRoleScoreForPlayer(state, opponent);
    var currentKingSafety = getKingSafetyScoreForPlayer(state, player) - getKingSafetyScoreForPlayer(state, opponent);
    var currentDeployment = getDeploymentControlScoreForPlayer(state, player) - getDeploymentControlScoreForPlayer(state, opponent);
    var currentBaseShield = getBaseCenterShieldScoreForPlayer(state, player) - getBaseCenterShieldScoreForPlayer(state, opponent);
    var currentKingLineShield = getKingShieldLineScoreForPlayer(state, player) - getKingShieldLineScoreForPlayer(state, opponent);
    var currentDefenseCriteria = getDefenseCriteriaScoreForPlayer(state, player) - getDefenseCriteriaScoreForPlayer(state, opponent);
    var currentClosingPressure = getClosingPressureScoreForPlayer(state, player) - getClosingPressureScoreForPlayer(state, opponent);
    var currentKingLanding = getKingLandingControlScoreForPlayer(state, player) - getKingLandingControlScoreForPlayer(state, opponent);
    var currentDefensiveBand = getDefensiveBandScoreForPlayer(state, player) - getDefensiveBandScoreForPlayer(state, opponent);
    var currentOpeningPressure = getOpeningAttackPressureScoreForPlayer(state, player) - getOpeningAttackPressureScoreForPlayer(state, opponent);
    var currentGateControl = getOwnBaseGateControlScoreForPlayer(state, player) - getOwnBaseGateControlScoreForPlayer(state, opponent);
    var currentPieceThreat = getPieceCaptureThreatScoreForPlayer(state, player) - getPieceCaptureThreatScoreForPlayer(state, opponent);
    var currentTerritoryPuzzle = getTerritoryPuzzleScoreForPlayer(state, player) - getTerritoryPuzzleScoreForPlayer(state, opponent);
    var closingUrgency = getGameClosingUrgency(state);
    var refined = filterImmediateBlunderActions(state, player, filterForcedDefenseActions(state, player, actions)).map(function (action) {
      var nextState = cloneNpcSimulationState(state);
      var defenseSnapshot;
      var pressureDelta;
      var roleDelta;
      var kingSafetyDelta;
      var deploymentDelta;
      var baseShieldDelta;
      var kingLineShieldDelta;
      var defenseCriteriaDelta;
      var closingPressureDelta;
      var kingLandingDelta;
      var defensiveBandDelta;
      var openingPressureDelta;
      var gateControlDelta;
      var pieceThreatDelta;
      var territoryPuzzleDelta;
      nextState.currentPlayer = player;
      applyNpcActionToState(nextState, action);
      defenseSnapshot = getDefenseSnapshotCached(nextState, player);
      pressureDelta = (getBaseCenterPressureScore(nextState, player) - getBaseCenterPressureScore(nextState, opponent)) - currentPressure;
      roleDelta = (getPieceRoleScoreForPlayer(nextState, player) - getPieceRoleScoreForPlayer(nextState, opponent)) - currentRole;
      kingSafetyDelta = (getKingSafetyScoreForPlayer(nextState, player) - getKingSafetyScoreForPlayer(nextState, opponent)) - currentKingSafety;
      deploymentDelta = (getDeploymentControlScoreForPlayer(nextState, player) - getDeploymentControlScoreForPlayer(nextState, opponent)) - currentDeployment;
      baseShieldDelta = (getBaseCenterShieldScoreForPlayer(nextState, player) - getBaseCenterShieldScoreForPlayer(nextState, opponent)) - currentBaseShield;
      kingLineShieldDelta = (getKingShieldLineScoreForPlayer(nextState, player) - getKingShieldLineScoreForPlayer(nextState, opponent)) - currentKingLineShield;
      defenseCriteriaDelta = (getDefenseCriteriaScoreForPlayer(nextState, player) - getDefenseCriteriaScoreForPlayer(nextState, opponent)) - currentDefenseCriteria;
      closingPressureDelta = (getClosingPressureScoreForPlayer(nextState, player) - getClosingPressureScoreForPlayer(nextState, opponent)) - currentClosingPressure;
      kingLandingDelta = (getKingLandingControlScoreForPlayer(nextState, player) - getKingLandingControlScoreForPlayer(nextState, opponent)) - currentKingLanding;
      defensiveBandDelta = (getDefensiveBandScoreForPlayer(nextState, player) - getDefensiveBandScoreForPlayer(nextState, opponent)) - currentDefensiveBand;
      openingPressureDelta = (getOpeningAttackPressureScoreForPlayer(nextState, player) - getOpeningAttackPressureScoreForPlayer(nextState, opponent)) - currentOpeningPressure;
      gateControlDelta = (getOwnBaseGateControlScoreForPlayer(nextState, player) - getOwnBaseGateControlScoreForPlayer(nextState, opponent)) - currentGateControl;
      pieceThreatDelta = (getPieceCaptureThreatScoreForPlayer(nextState, player) - getPieceCaptureThreatScoreForPlayer(nextState, opponent)) - currentPieceThreat;
      territoryPuzzleDelta = (getTerritoryPuzzleScoreForPlayer(nextState, player) - getTerritoryPuzzleScoreForPlayer(nextState, opponent)) - currentTerritoryPuzzle;
      action.winsImmediately = nextState.winner === player;
        action.selfKingThreatened = !action.winsImmediately &&
        (isKingUnderThreatInState(nextState, player) || defenseSnapshot.kingCaptureThreats > 0);
      action.selfFoldThreatened = !action.winsImmediately && defenseSnapshot.foldThreats > 0;
      action.refinedScore =
        action.score +
        pressureDelta * 1.7 +
        roleDelta * 1.05 +
        kingSafetyDelta * 1.15 +
        deploymentDelta * 0.92 +
        baseShieldDelta * 1.25 +
        kingLineShieldDelta * 1.1 +
        defenseCriteriaDelta * (strategy === "defense" ? 0.92 : 0.35) +
        kingLandingDelta * (strategy === "defense" ? 1.05 : 0.42) +
        defensiveBandDelta * (strategy === "defense" ? 0.92 : 0.34) +
        gateControlDelta * (strategy === "defense" ? 1.12 : 0.38) +
        openingPressureDelta * (strategy === "defense" ? 0.34 : 0.22) +
        territoryPuzzleDelta * (strategy === "defense" ? 0.78 : 0.36) +
        closingPressureDelta * (0.52 + closingUrgency * 0.18) -
        pieceThreatDelta * (strategy === "defense" ? 0.98 : 0.54) -
        (defenseSnapshot.kingThreatened ? 700000 : 0) -
        (defenseSnapshot.kingCaptureThreats || 0) * 2800000 -
        (defenseSnapshot.foldThreats || 0) * 2200000 -
        (defenseSnapshot.baseInvaded || 0) * 2400000 -
        defenseSnapshot.immediateWins * 42000 -
        defenseSnapshot.baseHot * 26000 -
        defenseSnapshot.kingDanger * 5200 -
        defenseSnapshot.baseThreat * 360;
      action.refinedScore += getNpcPhaseActionBias(state, action, player, nextState, emergencyMode);
      action.refinedScore += getNpcOpeningBookActionBias(state, player, action, nextState, emergencyMode);
      action.defenseSnapshot = defenseSnapshot;
      return action;
    });
    var safeRefined = refined.filter(function (action) {
      return action.winsImmediately || (!action.selfKingThreatened && !action.selfFoldThreatened);
    });
    if (safeRefined.length) {
      refined = safeRefined;
    }

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
    var attackMap = getAttackMapForStateCached(state, player);
    var dangerMap = getDangerMapForStateCached(state, player);
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
      var currentSnapshot = getDefenseSnapshotCached(state, player);
    var forced = [];
    var bestSnapshot = null;
    var positionalEmergency = false;
    var bestPositionalValue = Infinity;
    var currentPieceThreat = getPieceCaptureThreatScoreForPlayer(state, player);

    if (!currentSnapshot.kingThreatened &&
      !currentSnapshot.kingCaptureThreats &&
      !currentSnapshot.foldThreats &&
      !currentSnapshot.baseInvaded &&
      !currentSnapshot.immediateWins &&
      !currentSnapshot.baseHot) {
      positionalEmergency =
        getFastLossRiskScoreForPlayer(state, player) >= 140000 ||
        getKingLandingControlScoreForPlayer(state, player) <= -90000 ||
        getOwnBaseGateControlScoreForPlayer(state, player) <= -24000 ||
        currentPieceThreat >= (getNpcGamePhase(state) === "late" ? 125000 : 90000) ||
        (getNpcGamePhase(state) !== "late" && getDefensiveBandScoreForPlayer(state, player) <= -24000);
        if (!positionalEmergency) {
          return actions;
        }
      }

      actions.forEach(function (action) {
        var nextState = cloneNpcSimulationState(state);
        var nextSnapshot;
        var positionalValue;
        nextState.currentPlayer = player;
        applyNpcActionToState(nextState, action);
        nextSnapshot = getDefenseSnapshotCached(nextState, player);

        if (nextState.winner === player) {
          forced = [action];
          bestPositionalValue = -Infinity;
          bestSnapshot = nextSnapshot;
          return;
        }

        if (bestPositionalValue === -Infinity) {
          return;
        }

        if (positionalEmergency) {
          positionalValue =
            getFastLossRiskScoreForPlayer(nextState, player) -
            getKingLandingControlScoreForPlayer(nextState, player) * 0.34 -
            getOwnBaseGateControlScoreForPlayer(nextState, player) * 0.28 -
            getDefensiveBandScoreForPlayer(nextState, player) * 0.18 +
            getPieceCaptureThreatScoreForPlayer(nextState, player) * 0.58 +
            getDefenseSnapshotUrgency(nextSnapshot) * 0.72;
          if (positionalValue < bestPositionalValue - 2000) {
            bestPositionalValue = positionalValue;
            bestSnapshot = nextSnapshot;
            forced = [action];
            return;
          }
          if (Math.abs(positionalValue - bestPositionalValue) <= 2000) {
            forced.push(action);
          }
          return;
        }

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
      var defenseEmergency;
      var frontierLimit;
    if (isInitialStandbyPhase(uiState.state)) {
      return collectNpcInitialSetupActions(player);
    }
    defenseEmergency = shouldUseFullDefenseCandidateSet(uiState.state, player);
    frontierLimit = getNpcFragmentFrontierLimit(player, defenseEmergency);
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
      var fragmentActions = [];
      getNpcFragmentPlacements(player, card, { frontierLimit: frontierLimit }).forEach(function (placement) {
        var pieceDropLimit = getNpcStrategy(player) === "defense" || defenseEmergency ? 4 : 1;
        if (!isInitialStandbyPhase(uiState.state) && normalizeNpcLookaheadDepth(uiState.npc.lookaheadDepth) >= 3) {
          pieceDropLimit = defenseEmergency ? 2 : (getNpcStrategy(player) === "defense" ? 2 : 1);
        }
        if (uiState.npc.bulkSelfPlay && !defenseEmergency) {
          pieceDropLimit = getNpcStrategy(player) === "defense" ? 3 : 1;
        }
        var pieceCells = pickNpcPieceDropCells(player, card.pieceType, placement.cells, pieceDropLimit);
        if (!pieceCells.length) {
          return;
        }
        pieceCells.forEach(function (pieceCell) {
          fragmentActions.push({
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
      fragmentActions.sort(function (a, b) {
        return b.score - a.score;
      });
      if (uiState.npc.bulkSelfPlay && normalizeNpcLookaheadDepth(uiState.npc.lookaheadDepth) >= 3) {
        fragmentActions = fragmentActions.slice(0, defenseEmergency ? 8 : (getNpcStrategy(player) === "defense" ? 4 : 3));
      } else if (normalizeNpcLookaheadDepth(uiState.npc.lookaheadDepth) >= 3) {
        fragmentActions = fragmentActions.slice(0, defenseEmergency ? 24 : (getNpcStrategy(player) === "defense" ? 10 : 7));
      } else if (uiState.npc.bulkSelfPlay) {
        fragmentActions = fragmentActions.slice(0, defenseEmergency ? 18 : (getNpcStrategy(player) === "defense" ? 7 : 5));
      } else if (uiState.npc.selfPlayFast) {
        fragmentActions = fragmentActions.slice(0, defenseEmergency ? 30 : (getNpcStrategy(player) === "defense" ? 12 : 9));
      } else {
        fragmentActions = fragmentActions.slice(0, defenseEmergency ? 36 : (getNpcStrategy(player) === "defense" ? 16 : 12));
      }
      fragmentActions.forEach(function (action) {
        actions.push(action);
      });
    });

    getFragmentReserveEntries(uiState.state.players[player]).forEach(function (entry) {
      var card = entry.card;
      var fragmentActions = [];
      getNpcFragmentPlacements(player, card, { frontierLimit: frontierLimit }).forEach(function (placement) {
        fragmentActions.push({
          type: "fragment",
          source: "fragmentReserve",
          fragmentReserveKey: entry.key,
          card: card,
          rotation: placement.rotation,
          anchor: placement.anchor,
          cells: placement.cells,
          pieceCell: null,
          score: scoreNpcFragmentAction(player, card, placement.cells, null) + 14
        });
      });
      fragmentActions.sort(function (a, b) {
        return b.score - a.score;
      });
      if (uiState.npc.bulkSelfPlay && normalizeNpcLookaheadDepth(uiState.npc.lookaheadDepth) >= 3) {
        fragmentActions = fragmentActions.slice(0, defenseEmergency ? 6 : (getNpcStrategy(player) === "defense" ? 3 : 2));
      } else if (normalizeNpcLookaheadDepth(uiState.npc.lookaheadDepth) >= 3) {
        fragmentActions = fragmentActions.slice(0, defenseEmergency ? 18 : (getNpcStrategy(player) === "defense" ? 8 : 5));
      } else if (uiState.npc.bulkSelfPlay) {
        fragmentActions = fragmentActions.slice(0, defenseEmergency ? 12 : (getNpcStrategy(player) === "defense" ? 5 : 4));
      } else if (uiState.npc.selfPlayFast) {
        fragmentActions = fragmentActions.slice(0, defenseEmergency ? 18 : (getNpcStrategy(player) === "defense" ? 8 : 6));
      } else {
        fragmentActions = fragmentActions.slice(0, defenseEmergency ? 24 : (getNpcStrategy(player) === "defense" ? 10 : 8));
      }
      fragmentActions.forEach(function (action) {
        actions.push(action);
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

    actions = applyOpeningRescueActionScoreBias(uiState.state, player, actions);
    return applyCounterattackTransitionScoreBias(uiState.state, player, actions);
  }

    function chooseNpcAction() {
      var npcPlayer = uiState.state.currentPlayer;
      var opponent = getOpponentPlayer(npcPlayer);
      var actions = collectNpcActions();
      var emergencyMode;
      var immediateWins;
      var lookaheadDepth = normalizeNpcLookaheadDepth(uiState.npc.lookaheadDepth);
      if (!actions.length) {
        return null;
      }
      if (isInitialStandbyPhase(uiState.state)) {
        actions.sort(function (a, b) {
          return b.score - a.score;
        });
        return actions[0];
      }
      if (lookaheadDepth >= 3) {
        return withNpcSearchCache(function () {
          var deepActions = actions.slice();
          var deepEmergencyMode = isKingUnderThreatInStateCached(uiState.state, npcPlayer) ||
            getPieceCaptureThreatScoreForPlayer(uiState.state, npcPlayer) >= 90000;
          var deepImmediateWins;
          deepActions = filterBaseCenterOverwriteEmergencyActions(uiState.state, npcPlayer, deepActions);
          deepActions = filterOwnBaseCenterRefillActions(uiState.state, npcPlayer, deepActions);
          if (!deepEmergencyMode && countImmediateWinningActionsInStateCached(uiState.state, opponent, 8) > 0) {
            deepEmergencyMode = true;
          }
          deepImmediateWins = findImmediateWinningActionsInStateCached(uiState.state, npcPlayer, 14);
          if (deepImmediateWins.length) {
            deepImmediateWins.sort(function (a, b) {
              return compareImmediateWinningActionsInState(uiState.state, npcPlayer, a, b);
            });
            return deepImmediateWins[0];
          }
          return chooseNpcActionWithLookahead(deepActions, npcPlayer, deepEmergencyMode, lookaheadDepth);
        });
      }
      emergencyMode = isKingUnderThreatInState(uiState.state, npcPlayer) ||
        getPieceCaptureThreatScoreForPlayer(uiState.state, npcPlayer) >= 90000;
      actions = filterBaseCenterOverwriteEmergencyActions(uiState.state, npcPlayer, actions);
      actions = filterOwnBaseCenterRefillActions(uiState.state, npcPlayer, actions);
      if (!emergencyMode && countImmediateWinningActionsInState(uiState.state, opponent, 8) > 0) {
        emergencyMode = true;
      }
      immediateWins = findImmediateWinningActionsInState(uiState.state, npcPlayer, 14);
      if (immediateWins.length) {
        immediateWins.sort(function (a, b) {
          return compareImmediateWinningActionsInState(uiState.state, npcPlayer, a, b);
        });
        return immediateWins[0];
      }
      if (uiState.npc.selfPlayFast) {
        return chooseNpcActionFast(actions, npcPlayer, emergencyMode);
      }
      actions.sort(function (a, b) {
        return b.score - a.score;
      });
      var rawCandidateActions = shouldUseFullDefenseCandidateSet(uiState.state, npcPlayer)
        ? actions
        : getNpcCandidateActions(actions, emergencyMode, uiState.state, npcPlayer);
      var candidateActions = refineNpcCandidateActions(uiState.state, npcPlayer, rawCandidateActions, emergencyMode);
      var bestAction = candidateActions[0];
      var bestScore = -Infinity;

      candidateActions.forEach(function (action) {
        var nextState = cloneNpcSimulationState(uiState.state);
        applyNpcActionToState(nextState, action);
        var score;
        if (nextState.winner === npcPlayer) {
          score = 6000000;
        } else if (nextState.winner) {
          score = -6000000;
        } else if (emergencyMode) {
          score = evaluateStateForNpc(nextState, npcPlayer);
          if (!isKingUnderThreatInState(nextState, npcPlayer)) {
            score += 90000;
          } else {
            score -= 220000;
          }
          if (isKingUnderThreatInState(nextState, opponent)) {
            score += 5000;
          }
        } else {
          var nextDangerMap = getDangerMapForStateCached(nextState, npcPlayer);
          var opponentImmediateWins = nextDangerMap.immediateWins.length;
          var replyActions = collectNpcActionsForState(nextState, opponent);
          var replyEmergencyMode = isKingUnderThreatInState(nextState, opponent);
          replyActions = orderNpcActionsForSearch(nextState, opponent, replyActions, replyEmergencyMode);
          var replyCandidateSource = shouldUseFullDefenseCandidateSet(nextState, opponent)
            ? replyActions
            : getNpcCandidateActions(replyActions, replyEmergencyMode, nextState, opponent);
          replyActions = refineNpcCandidateActions(nextState, opponent, replyCandidateSource, replyEmergencyMode).slice(0, Math.min(6, replyActions.length));
          if (replyActions.length) {
            score = Infinity;
            replyActions.forEach(function (replyAction) {
              var replyState = cloneNpcSimulationState(nextState);
              applyNpcActionToState(replyState, replyAction);
              score = Math.min(score, evaluateStateForNpc(replyState, npcPlayer));
            });
          } else {
            score = evaluateStateForNpc(nextState, npcPlayer);
          }
          if (isKingUnderThreatInState(nextState, npcPlayer)) {
            score -= 1400000;
          }
          if (isKingUnderThreatInState(nextState, opponent)) {
            score += 6500;
          }
          if (opponentImmediateWins) {
            score -= 1800000 + opponentImmediateWins * 180000;
          }
          if (!opponentImmediateWins && isKingUnderThreatInState(nextState, opponent)) {
            score += 12000;
          }
        }
        if (!emergencyMode && !nextState.winner) {
          score += getLongGameActionBias(uiState.state, action, npcPlayer);
        }
        if (!nextState.winner) {
          score += getNpcStrategyActionBias(uiState.state, action, npcPlayer, nextState, emergencyMode);
          score += getGameClosingActionBias(uiState.state, action, npcPlayer, nextState, emergencyMode);
          score += getNpcPhaseActionBias(uiState.state, action, npcPlayer, nextState, emergencyMode);
        }

        if (score > bestScore || (score === bestScore && action.score > (bestAction ? bestAction.score : -Infinity))) {
          bestScore = score;
          bestAction = action;
      }
    });

    return bestAction;
  }

  function traceNpcDecisionForCurrentState(limit) {
    var player = uiState.state.currentPlayer;
    var opponent = getOpponentPlayer(player);
    var actions = collectNpcActions().sort(function (a, b) {
      return (b.refinedScore || b.score) - (a.refinedScore || a.score);
    });
    var emergencyMode = isKingUnderThreatInState(uiState.state, player) ||
      countImmediateWinningActionsInState(uiState.state, opponent, 8) > 0;
    var candidates = actions;
    return {
      player: player,
      turnNumber: uiState.state.turnNumber,
      phase: uiState.state.phase,
      emergencyMode: emergencyMode,
      kingThreatened: isKingUnderThreatInState(uiState.state, player),
      opponentImmediateWinsNow: countImmediateWinningActionsInState(uiState.state, opponent, 12),
      actionCount: actions.length,
      candidateCount: candidates.length,
      candidates: candidates.slice(0, limit || 12).map(function (action) {
        var nextState = cloneNpcSimulationState(uiState.state);
        var summary;
        nextState.currentPlayer = player;
        applyNpcActionToState(nextState, action);
        summary = summarizeSelfPlayAction(uiState.state, action);
        summary.exposesOwnBaseCenter = doesActionVacateOwnBaseCenterWithoutReplacement(uiState.state, player, action);
        summary.afterKingThreatened = nextState.winner ? false : isKingUnderThreatInState(nextState, player);
        summary.movesKingOffBase = doesActionMoveKingOffOwnBaseCenter(uiState.state, player, action);
        summary.afterGate = nextState.winner ? null : Math.round(getOwnBaseGateControlScoreForPlayer(nextState, player));
        summary.allowsImmediateLoss = !!action.allowsImmediateLoss;
        summary.immediateLossCount = action.immediateLossCount || 0;
        return summary;
      })
    };
  }

  function completeTacticalScenarioState(state, currentPlayer, turnNumber) {
    var setup = ensureInitialSetupState(state);
    setup.index = setup.order.length;
    setup.placed.P1 = INITIAL_STANDBY_PLACEMENTS;
    setup.placed.P2 = INITIAL_STANDBY_PLACEMENTS;
    state.phase = "play";
    state.currentPlayer = currentPlayer || "P2";
    state.turnNumber = Math.max(1, Number(turnNumber) || 8);
    state.winner = null;
    state.winReason = null;
    state.actionLog = [];
    state.history = [];
    if (state.clock) {
      state.clock.activePlayer = null;
      state.clock.activeSince = null;
    }
    return state;
  }

  function createTacticalScenarioState(mode, currentPlayer, turnNumber) {
    var state = createGame(mode || "original", DEFAULT_TIME_CONTROL);
    var row;
    var col;
    for (row = 0; row < BOARD_ROWS; row += 1) {
      for (col = 0; col < BOARD_COLS; col += 1) {
        state.board[row][col].pieceId = null;
        state.board[row][col].stack = [];
        state.board[row][col].controller = null;
        state.board[row][col].isBaseCenter = false;
        state.board[row][col].baseOwner = null;
      }
    }
    state.placements = [];
    state.players.P1.pieces = {};
    state.players.P2.pieces = {};
    state.players.P1.reserve = createReservePool();
    state.players.P2.reserve = createReservePool();
    state.players.P1.fragmentReserve = createFragmentReservePool();
    state.players.P2.fragmentReserve = createFragmentReservePool();
    state.players.P1.hand = [];
    state.players.P2.hand = [];
    state.players.P1.deck = [];
    state.players.P2.deck = [];
    seedBase(state, "P1");
    seedBase(state, "P2");
    addPiece(state, "P1", "king", 4, 1);
    addPiece(state, "P2", "king", 4, 13);
    return completeTacticalScenarioState(state, currentPlayer, turnNumber);
  }

  function addTacticalFragmentShape(state, owner, fragmentType, pieceType, anchorRow, anchorCol, rotation) {
    var card = { fragmentType: fragmentType, pieceType: pieceType };
    var cells = getFragmentCells(fragmentType, rotation || 0, { row: anchorRow, col: anchorCol }).filter(function (cell) {
      return isInBounds(cell.row, cell.col);
    });
    if (!cells.length) {
      return null;
    }
    return addFragmentPlacementToState(state, owner, card, null, cells, false, { source: "scenario" });
  }

  function addTacticalHeldFragment(state, player, fragmentType, count) {
    addFragmentToReserve(state.players[player], {
      fragmentType: fragmentType
    }, count || 1);
  }

  function addTacticalHandCards(state, player, cards) {
    state.players[player].hand = (cards || []).map(function (card) {
      return {
        fragmentType: card.fragmentType,
        pieceType: card.pieceType
      };
    });
  }

  function addTacticalReservePieces(state, player, reserve) {
    Object.keys(reserve || {}).forEach(function (pieceType) {
      if (state.players[player].reserve[pieceType] !== undefined) {
        state.players[player].reserve[pieceType] = Math.max(0, Number(reserve[pieceType]) || 0);
      }
    });
  }

  function setTacticalPiece(state, owner, kind, row, col) {
    removePieceFromStateAt(state, row, col);
    return addPiece(state, owner, kind, row, col);
  }

  function clearTacticalPlayerPieces(state, player) {
    Object.keys(state.players[player].pieces).forEach(function (pieceId) {
      var piece = state.players[player].pieces[pieceId];
      if (piece && state.board[piece.row] && state.board[piece.row][piece.col]) {
        state.board[piece.row][piece.col].pieceId = null;
      }
    });
    state.players[player].pieces = {};
  }

  function getCoreTacticalScenarioDefinitions(mode) {
    var attackerCard = mode === "shogi"
      ? { fragmentType: "net04", pieceType: "charger" }
      : { fragmentType: "net04", pieceType: "charger" };
    return [
      {
        id: "forced-defense-charger-line",
        title: "Forced defense: stop a direct charger line",
        player: "P2",
        goal: "P2 must answer a one-move king-capture lane without creating another immediate loss.",
        expectations: {
          noImmediateLoss: true,
          keepOwnBaseCenter: true
        },
        setup: function () {
          var state = createTacticalScenarioState(mode, "P2", 6);
          addTacticalFragmentShape(state, "P1", "net04", "charger", 3, 5, 0);
          addTacticalFragmentShape(state, "P1", "net11", "vanguard", 3, 8, 0);
          addTacticalFragmentShape(state, "P2", "net02", "guard", 3, 9, 0);
          addPiece(state, "P1", "charger", 4, 10);
          addPiece(state, "P2", "guard", 3, 13);
          addPiece(state, "P2", "flanker", 5, 13);
          addTacticalReservePieces(state, "P2", { guard: 1, barrier: 1, flanker: 1 });
          addTacticalHeldFragment(state, "P2", "net02");
          addTacticalHeldFragment(state, "P2", "net03");
          return state;
        }
      },
      {
        id: "base-center-refill",
        title: "Castle repair: refill the exposed home center",
        player: "P2",
        goal: "P2 should prefer putting a non-king guard on the base center instead of leaving the home center empty.",
        expectations: {
          noImmediateLoss: true,
          keepOwnBaseCenter: true,
          ownBaseCenterNonKing: true
        },
        setup: function () {
          var state = createTacticalScenarioState(mode, "P2", 8);
          removePieceFromStateAt(state, 4, 13);
          addPiece(state, "P2", "king", 3, 13);
          addPiece(state, "P2", "guard", 5, 13);
          addTacticalFragmentShape(state, "P1", "net01", "chaosBeast", 3, 8, 0);
          addTacticalFragmentShape(state, "P2", "net06", "destroyer", 3, 10, 0);
          addTacticalReservePieces(state, "P2", { guard: 1, flanker: 1 });
          addTacticalHeldFragment(state, "P2", "net02");
          return state;
        }
      },
      {
        id: "attacker-capture-finish",
        title: "Closing: take the exposed king",
        player: "P2",
        goal: "P2 has a direct capture; the selected action should finish the game.",
        expectations: {
          winNow: true
        },
        setup: function () {
          var state = createTacticalScenarioState(mode, "P2", 18);
          addTacticalFragmentShape(state, "P2", "net04", "charger", 3, 2, 0);
          addTacticalFragmentShape(state, "P2", "net11", "vanguard", 3, 0, 0);
          addPiece(state, "P2", "charger", 4, 4);
          return state;
        }
      },
      {
        id: "fragment-ring-pressure",
        title: "Attack pattern: build ring pressure around enemy base",
        player: "P1",
        goal: "P1 should value a fragment placement that creates pressure near the enemy base ring.",
        expectations: {
          expectedTypes: ["fragment"],
          noImmediateLoss: true
        },
        setup: function () {
          var state = createTacticalScenarioState(mode, "P1", 14);
          addTacticalFragmentShape(state, "P1", "net08", "realmKnight", 3, 6, 0);
          addTacticalFragmentShape(state, "P1", "net04", "charger", 3, 8, 0);
          addTacticalFragmentShape(state, "P2", "net02", "guard", 3, 10, 0);
          addPiece(state, "P1", "realmKnight", 4, 8);
          addPiece(state, "P1", "charger", 4, 9);
          addPiece(state, "P2", "guard", 3, 13);
          addPiece(state, "P2", "flanker", 5, 13);
          addTacticalHeldFragment(state, "P1", attackerCard.fragmentType);
          addTacticalHeldFragment(state, "P1", "net01");
          return state;
        }
      },
      {
        id: "fragment-recovery-lab",
        title: "Recovery: removable fragment should be visible as a candidate",
        player: "P2",
        goal: "P2 has an empty top fragment near its base; the lab records whether recovery is available or chosen.",
        expectations: {
          candidateTypes: ["recoverFragment"],
          noImmediateLoss: true
        },
        setup: function () {
          var state = createTacticalScenarioState(mode, "P2", 22);
          addTacticalFragmentShape(state, "P2", "net03", "barrier", 2, 9, 0);
          addTacticalFragmentShape(state, "P2", "net02", "guard", 4, 9, 0);
          addTacticalFragmentShape(state, "P1", "net09", "flanker", 3, 7, 0);
          addPiece(state, "P2", "guard", 3, 13);
          addPiece(state, "P2", "barrier", 5, 13);
          addTacticalReservePieces(state, "P2", { guard: 1, barrier: 1 });
          addTacticalHeldFragment(state, "P2", "net11");
          return state;
        }
      }
    ];
  }

  function getTranslatedCastleLayouts() {
    return [
      {
        id: "yagura",
        label: "矢倉型",
        note: "王を奥へずらし、金銀相当の駒で本陣中心と前面を固める形。",
        pieces: [
          { kind: "king", row: 4, col: 14 },
          { kind: "guard", row: 4, col: 13 },
          { kind: "flanker", row: 3, col: 13 },
          { kind: "guard", row: 5, col: 13 },
          { kind: "vanguard", row: 4, col: 12 }
        ]
      },
      {
        id: "mino",
        label: "美濃型",
        note: "王を上隅へ寄せ、横と中央を金銀相当で受ける軽い囲い。",
        pieces: [
          { kind: "king", row: 3, col: 14 },
          { kind: "guard", row: 4, col: 13 },
          { kind: "flanker", row: 3, col: 13 },
          { kind: "guard", row: 5, col: 14 },
          { kind: "vanguard", row: 4, col: 12 }
        ]
      },
      {
        id: "anaguma",
        label: "穴熊型",
        note: "王を角へ潜らせ、本陣中心を金相当で塞ぐ耐久寄りの形。",
        pieces: [
          { kind: "king", row: 3, col: 14 },
          { kind: "guard", row: 4, col: 14 },
          { kind: "flanker", row: 3, col: 13 },
          { kind: "guard", row: 4, col: 13 },
          { kind: "decoy", row: 5, col: 13 }
        ]
      },
      {
        id: "boat",
        label: "舟囲い型",
        note: "王を下へ寄せ、中心と斜め前を軽く固める早囲い。",
        pieces: [
          { kind: "king", row: 5, col: 14 },
          { kind: "guard", row: 4, col: 13 },
          { kind: "flanker", row: 5, col: 13 },
          { kind: "guard", row: 3, col: 13 },
          { kind: "vanguard", row: 4, col: 12 }
        ]
      },
      {
        id: "silver-crown",
        label: "銀冠型",
        note: "左右の銀相当で王周辺を支え、中央金で本陣中心を守る形。",
        pieces: [
          { kind: "king", row: 4, col: 14 },
          { kind: "guard", row: 4, col: 13 },
          { kind: "flanker", row: 3, col: 13 },
          { kind: "flanker", row: 5, col: 13 },
          { kind: "realmKnight", row: 4, col: 12 }
        ]
      }
    ];
  }

  function applyTranslatedCastleLayout(state, player, layout) {
    clearTacticalPlayerPieces(state, player);
    layout.pieces.forEach(function (piece) {
      setTacticalPiece(state, player, piece.kind, piece.row, piece.col);
    });
  }

  function addCastleDefenseTerritory(state) {
    addTacticalFragmentShape(state, "P2", "net02", "guard", 3, 9, 0);
    addTacticalFragmentShape(state, "P2", "net03", "barrier", 4, 9, 0);
    addTacticalHeldFragment(state, "P2", "net02");
    addTacticalHeldFragment(state, "P2", "net03");
    addTacticalHeldFragment(state, "P2", "net11");
    addTacticalReservePieces(state, "P2", {
      guard: 1,
      flanker: 1,
      barrier: 1,
      vanguard: 1
    });
  }

  function addCastleAttackPressure(state, mode, attackType) {
    addTacticalFragmentShape(state, "P1", "net04", "charger", 3, 6, 0);
    addTacticalFragmentShape(state, "P1", "net11", "vanguard", 3, 8, 0);
    addTacticalHeldFragment(state, "P1", "net04");
    addTacticalHeldFragment(state, "P1", "net01");
    addTacticalReservePieces(state, "P1", {
      charger: 1,
      rider: 1,
      flanker: 1
    });
    if (attackType === "side-hook") {
      addTacticalFragmentShape(state, "P1", "net09", "flanker", 2, 8, 0);
      setTacticalPiece(state, "P1", "flanker", 3, 11);
      setTacticalPiece(state, "P1", "rider", 5, 10);
      setTacticalPiece(state, "P1", "charger", 4, 10);
      return;
    }
    setTacticalPiece(state, "P1", "charger", 4, 10);
    setTacticalPiece(state, "P1", "realmKnight", 3, 10);
  }

  function makeTranslatedCastleScenario(mode, layout, attackType) {
    var attackLabel = attackType === "side-hook" ? "側面フック攻め" : "中央突破攻め";
    return {
      id: "castle-" + layout.id + "-" + attackType,
      title: layout.label + " / " + attackLabel,
      player: "P2",
      castleName: layout.label,
      attackPattern: attackLabel,
      goal: layout.note + " 代表的な攻めを受けても即負けせず、本陣中心を自駒で保持できるかを見る。",
      expectations: {
        noImmediateLoss: true,
        keepOwnBaseCenter: true,
        ownBaseCenterNonKing: true
      },
      setup: function () {
        var state = createTacticalScenarioState(mode, "P2", attackType === "side-hook" ? 13 : 11);
        applyTranslatedCastleLayout(state, "P2", layout);
        addCastleDefenseTerritory(state);
        addCastleAttackPressure(state, mode, attackType);
        return state;
      }
    };
  }

  function getTranslatedCastleScenarioDefinitions(mode) {
    var scenarios = [];
    getTranslatedCastleLayouts().forEach(function (layout) {
      scenarios.push(makeTranslatedCastleScenario(mode, layout, "central-break"));
      scenarios.push(makeTranslatedCastleScenario(mode, layout, "side-hook"));
    });
    return scenarios;
  }

  function getTacticalScenarioDefinitions(mode, suite) {
    var scenarioSuite = String(suite || "core").toLowerCase();
    if (scenarioSuite === "castle" || scenarioSuite === "castles" || scenarioSuite === "shogi-castle") {
      return getTranslatedCastleScenarioDefinitions(mode);
    }
    if (scenarioSuite === "all") {
      return getCoreTacticalScenarioDefinitions(mode).concat(getTranslatedCastleScenarioDefinitions(mode));
    }
    return getCoreTacticalScenarioDefinitions(mode);
  }

  function getTacticalScenarioMetrics(state, player) {
    var opponent = getOpponentPlayer(player);
    return withTemporaryState(state, function () {
      return {
        player: player,
        currentPlayer: state.currentPlayer,
        winner: state.winner || null,
        winReason: state.winReason || null,
        ownKingThreatened: isKingUnderThreatInState(state, player),
        opponentKingThreatened: isKingUnderThreatInState(state, opponent),
        ownImmediateWins: countImmediateWinningActionsInState(state, player, 12),
        opponentImmediateWins: countImmediateWinningActionsInState(state, opponent, 12),
        ownBaseGate: Math.round(getOwnBaseGateControlScoreForPlayer(state, player)),
        ownBaseShield: Math.round(getBaseCenterShieldScoreForPlayer(state, player)),
        ownFastLossRisk: Math.round(getFastLossRiskScoreForPlayer(state, player)),
        evaluation: Math.round(evaluateStateForNpc(state, player))
      };
    });
  }

  function actionMatchesTacticalExpectation(actionSummary, expectation) {
    if (!expectation || !actionSummary) {
      return true;
    }
    if (expectation.expectedTypes && expectation.expectedTypes.indexOf(actionSummary.type) === -1) {
      return false;
    }
    return true;
  }

  function candidateTypesContain(actionTypes, types) {
    var found = {};
    if (!types || !types.length) {
      return true;
    }
    (actionTypes || []).forEach(function (type) {
      found[type] = true;
    });
    return types.every(function (type) {
      return !!found[type];
    });
  }

  function getBaseCenterPieceInState(state, player) {
    var center = findBaseCenterInState(state, player);
    if (!center || !center.pieceId) {
      return null;
    }
    return getPiece(state, center.pieceId);
  }

  function getBaseCenterPieceOwnerInState(state, player) {
    var piece = getBaseCenterPieceInState(state, player);
    return piece ? piece.owner : null;
  }

  function evaluateTacticalScenarioExpectations(scenario, actionSummary, beforeMetrics, afterMetrics, actionTypes, afterState) {
    var expectations = scenario.expectations || {};
    var checks = [];
    var baseCenterPiece;
    if (expectations.winNow) {
      checks.push({
        id: "winNow",
        ok: afterMetrics.winner === scenario.player,
        detail: afterMetrics.winner || "none"
      });
    }
    if (expectations.noImmediateLoss) {
      checks.push({
        id: "noImmediateLoss",
        ok: afterMetrics.winner === scenario.player || afterMetrics.opponentImmediateWins === 0,
        detail: afterMetrics.opponentImmediateWins
      });
    }
    if (expectations.keepOwnBaseCenter) {
      checks.push({
        id: "keepOwnBaseCenter",
        ok: getBaseCenterPieceOwnerInState(afterState, scenario.player) === scenario.player,
        detail: getBaseCenterPieceOwnerInState(afterState, scenario.player) || "empty"
      });
    }
    if (expectations.ownBaseCenterNonKing) {
      baseCenterPiece = getBaseCenterPieceInState(afterState, scenario.player);
      checks.push({
        id: "ownBaseCenterNonKing",
        ok: !!baseCenterPiece && baseCenterPiece.owner === scenario.player && baseCenterPiece.kind !== "king",
        detail: baseCenterPiece ? baseCenterPiece.kind : "empty"
      });
    }
    if (expectations.expectedTypes) {
      checks.push({
        id: "expectedTypes",
        ok: afterMetrics.winner === scenario.player || actionMatchesTacticalExpectation(actionSummary, expectations),
        detail: actionSummary ? actionSummary.type : "none"
      });
    }
    if (expectations.candidateTypes) {
      checks.push({
        id: "candidateTypes",
        ok: candidateTypesContain(actionTypes, expectations.candidateTypes),
        detail: actionTypes
      });
    }
    return {
      pass: checks.every(function (check) { return check.ok; }),
      checks: checks,
      before: beforeMetrics,
      after: afterMetrics
    };
  }

  function runNpcTacticalScenario(scenario, options) {
    var state = scenario.setup();
    var traceLimit = Number(options && options.traceLimit) || 10;
    var beforeMetrics;
    var action;
    var actionSummary = null;
    var afterState;
    var afterMetrics;
    var trace;
    var actionCount;
    var actions;
    var actionTypes;
    return withTemporaryState(state, function () {
      beforeMetrics = getTacticalScenarioMetrics(state, scenario.player);
      actions = collectNpcActionsForState(state, scenario.player);
      actionCount = actions.length;
      actionTypes = Object.keys(actions.reduce(function (map, currentAction) {
        map[currentAction.type] = true;
        return map;
      }, {})).sort();
      trace = traceNpcDecisionForCurrentState(traceLimit);
      action = chooseNpcAction();
      if (action) {
        actionSummary = summarizeSelfPlayAction(state, action);
      }
      afterState = cloneNpcSimulationState(state);
      afterState.currentPlayer = scenario.player;
      if (action) {
        applyNpcActionToState(afterState, action);
      }
      afterMetrics = getTacticalScenarioMetrics(afterState, scenario.player);
      return {
        id: scenario.id,
        title: scenario.title,
        player: scenario.player,
        castleName: scenario.castleName || "",
        attackPattern: scenario.attackPattern || "",
        goal: scenario.goal,
        mode: state.ruleMode,
        actionCount: actionCount,
        actionTypes: actionTypes,
        selectedAction: actionSummary,
        trace: trace,
        result: evaluateTacticalScenarioExpectations(scenario, actionSummary, beforeMetrics, afterMetrics, actionTypes, afterState)
      };
    });
  }

  function runNpcTacticalScenarioSuite(options) {
    var mode = (options && options.mode) || "original";
    var previousRuleMode = uiState.ruleMode;
    var previousNpc = JSON.parse(JSON.stringify(uiState.npc));
    var previousState = uiState.state;
    var scenarios;
    var results;
    uiState.ruleMode = mode;
    uiState.npc.strategyByPlayer = createSelfPlayStrategyMap({
      strategyProfile: options && (options.strategyProfile || options.strategy) || "attack-defense",
      p1Strategy: options && options.p1Strategy,
      p2Strategy: options && options.p2Strategy
    });
    uiState.npc.lookaheadDepth = normalizeNpcLookaheadDepth(options && options.lookaheadDepth || options && options.lookahead || 3);
    uiState.npc.selfPlayFast = !!(options && options.fast);
    uiState.npc.bulkSelfPlay = !!(options && options.bulk);
    try {
      scenarios = getTacticalScenarioDefinitions(mode, options && options.suite);
      if (options && options.scenario) {
        scenarios = scenarios.filter(function (scenario) {
          return scenario.id === options.scenario;
        });
      }
      results = scenarios.map(function (scenario) {
        return runNpcTacticalScenario(scenario, options || {});
      });
      return {
        generatedAt: new Date().toISOString(),
        mode: mode,
        suite: options && options.suite || "core",
        lookaheadDepth: uiState.npc.lookaheadDepth,
        strategies: {
          P1: getNpcStrategy("P1"),
          P2: getNpcStrategy("P2")
        },
        scenarioCount: results.length,
        passCount: results.filter(function (result) {
          return result.result && result.result.pass;
        }).length,
        results: results
      };
    } finally {
      uiState.ruleMode = previousRuleMode;
      uiState.npc = previousNpc;
      uiState.state = previousState;
    }
  }

  function createSeededRandom(seed) {
    var value = Number(seed) || 1;
    return function () {
      value += 0x6D2B79F5;
      var t = value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function cloneNpcSearchStats(stats) {
    if (!stats) {
      return null;
    }
    return {
      depth: Number(stats.depth) || 0,
      completedDepth: Number(stats.completedDepth) || 0,
      budgetMs: Number(stats.budgetMs) || 0,
      elapsedMs: Number(stats.elapsedMs) || 0,
      nodes: Number(stats.nodes) || 0,
      aborted: !!stats.aborted,
      emergency: !!stats.emergency,
      initialCandidates: Number(stats.initialCandidates) || 0,
      finalCandidates: Number(stats.finalCandidates) || 0,
      bestActionKey: String(stats.bestActionKey || "").slice(0, 260)
    };
  }

  function summarizeSelfPlayAction(state, action) {
    var player = state.currentPlayer;
    var summary = {
      player: player,
      turnNumber: state.turnNumber,
      phase: state.phase || "play",
      type: action.type,
      score: Math.round(action.score || 0),
      refinedScore: typeof action.refinedScore === "number" ? Math.round(action.refinedScore) : null,
      moveOrderScore: typeof action.moveOrderScore === "number" ? Math.round(action.moveOrderScore) : null,
      defenseSnapshot: action.defenseSnapshot || null
    };
    var piece;
    var placement;
    var targetCell;
    var targetPiece;
    if (action.type === "setupPenalty") {
      summary.skipped = action.skipped || getInitialStandbyRemainingCount(state, player);
      summary.label = PLAYER_LABELS[player] + " 初期スタンバイ不可 / 残り" + summary.skipped + "回を失う";
      return summary;
    }
    if (action.type === "setupFragment") {
      summary.fragment = action.card.fragmentType;
      summary.fragmentName = FRAGMENT_LIBRARY[action.card.fragmentType].label;
      summary.pieceType = action.card.pieceType;
      summary.pieceName = getPieceLabel(action.card.pieceType);
      if (!action.card.pieceType) {
        summary.pieceName = "";
      }
      summary.rotation = action.rotation;
      summary.anchor = action.anchor;
      summary.cells = action.cells;
      summary.pieceCell = action.pieceCell || null;
      summary.label = PLAYER_LABELS[player] + " 初期 " + summary.fragmentName + "/" + summary.pieceName;
      if (summary.pieceCell) {
        summary.label += " " + formatBoardCoordinate(summary.pieceCell.row, summary.pieceCell.col) + "に配置";
      }
    } else if (action.type === "setupPiece") {
      summary.fragment = action.card ? action.card.fragmentType : "";
      summary.fragmentName = action.card && FRAGMENT_LIBRARY[action.card.fragmentType] ? FRAGMENT_LIBRARY[action.card.fragmentType].label : "";
      summary.pieceType = action.pieceType || (action.card ? action.card.pieceType : "");
      summary.pieceName = getPieceLabel(summary.pieceType);
      summary.to = { row: action.row, col: action.col };
      summary.label = PLAYER_LABELS[player] + " 初期駒 " + summary.pieceName + " " + formatBoardCoordinate(action.row, action.col);
    } else if (action.type === "fragment") {
      summary.source = action.source === "fragmentReserve" ? "fragmentReserve" : "hand";
      summary.fragment = action.card.fragmentType;
      summary.fragmentName = FRAGMENT_LIBRARY[action.card.fragmentType].label;
      summary.pieceType = action.card.pieceType;
      summary.pieceName = getPieceLabel(action.card.pieceType);
      summary.rotation = action.rotation;
      summary.anchor = action.anchor;
      summary.cells = action.cells;
      summary.pieceCell = action.pieceCell;
      summary.label = PLAYER_LABELS[player] + " " + summary.fragmentName + "を展開し" + summary.pieceName + "を置く";
      if (summary.source === "fragmentReserve" || !summary.pieceCell || !summary.pieceName) {
        summary.pieceCell = summary.pieceCell || null;
        summary.label = PLAYER_LABELS[player] + " " + summary.fragmentName + "\u3092\u5C55\u958B";
      }
    } else if (action.type === "move") {
      piece = getPiece(state, action.pieceId);
      targetCell = state.board[action.row][action.col];
      targetPiece = targetCell.pieceId ? getPiece(state, targetCell.pieceId) : null;
      summary.pieceType = piece ? piece.kind : "";
      summary.pieceName = piece ? getPieceLabel(piece.kind) : "";
      summary.from = piece ? { row: piece.row, col: piece.col } : null;
      summary.to = { row: action.row, col: action.col };
      summary.capture = targetPiece ? { owner: targetPiece.owner, pieceType: targetPiece.kind, pieceName: getPieceLabel(targetPiece.kind) } : null;
      summary.label = PLAYER_LABELS[player] + " " + summary.pieceName + " " + (summary.from ? formatBoardCoordinate(summary.from.row, summary.from.col) : "?") + "->" + formatBoardCoordinate(action.row, action.col);
      if (summary.capture) {
        summary.label += " 捕獲:" + summary.capture.pieceName;
      }
    } else if (action.type === "reserve") {
      summary.pieceType = action.pieceType;
      summary.pieceName = getPieceLabel(action.pieceType);
      summary.to = { row: action.row, col: action.col };
      summary.label = PLAYER_LABELS[player] + " 持駒 " + summary.pieceName + "を" + formatBoardCoordinate(action.row, action.col) + "へ";
    } else if (action.type === "recoverPiece") {
      piece = getPiece(state, action.pieceId);
      summary.pieceType = piece ? piece.kind : "";
      summary.pieceName = piece ? getPieceLabel(piece.kind) : "";
      summary.at = { row: action.row, col: action.col };
      summary.recoverContext = piece ? {
        threatened: isCellThreatenedInState(state, getOpponentPlayer(player), piece.row, piece.col),
        distanceToOwnBase: getDistanceToOwnBaseInState(state, player, piece.row, piece.col),
        distanceToEnemyBase: getDistanceToEnemyBase(player, piece.row, piece.col),
        fortressBonus: getOwnBaseFortressCellBonus(state, player, piece.row, piece.col)
      } : null;
      summary.label = PLAYER_LABELS[player] + " " + summary.pieceName + "を回収";
    } else if (action.type === "recoverFragment") {
      placement = state.placements.find(function (entry) {
        return entry.id === action.placementId;
      }) || null;
      summary.placementId = action.placementId;
      summary.fragment = placement ? placement.card.fragmentType : "";
      summary.fragmentName = placement && FRAGMENT_LIBRARY[placement.card.fragmentType] ? FRAGMENT_LIBRARY[placement.card.fragmentType].label : "";
      summary.pieceType = "";
      summary.pieceName = "";
      summary.recoverContext = placement ? {
        heldFragmentCount: getFragmentReserveEntries(state.players[player]).reduce(function (total, entry) {
          return total + entry.count;
        }, 0),
        minDistanceToOwnBase: Math.min.apply(null, placement.cells.map(function (cell) {
          return getDistanceToOwnBaseInState(state, player, cell.row, cell.col);
        }))
      } : null;
      summary.label = PLAYER_LABELS[player] + " 展開図を回収";
    } else if (action.type === "mulligan") {
      summary.label = PLAYER_LABELS[player] + " 手札入れ替え";
    }
    return summary;
  }

  function getSelfPlaySetupKey(game) {
    return game.moves
      .filter(function (move) { return move.type === "setupFragment" || move.type === "setupPiece"; })
      .map(function (move) { return move.player + ":" + (move.type === "setupPiece" ? "piece" : move.fragment) + "/" + move.pieceType; })
      .join(" | ");
  }

  function getSelfPlayPlayerSetupKey(game, player) {
    return game.moves
      .filter(function (move) { return (move.type === "setupFragment" || move.type === "setupPiece") && move.player === player; })
      .map(function (move) { return (move.type === "setupPiece" ? "piece" : move.fragment) + "/" + move.pieceType; })
      .join(" | ");
  }

  function getSelfPlayPlayerSetupProfileKey(game, player) {
    var profile = {
      solid: 0,
      screen: 0,
      attack: 0
    };
    game.moves
      .filter(function (move) { return (move.type === "setupFragment" || move.type === "setupPiece") && move.player === player; })
      .forEach(function (move) {
        if (move.pieceType === "guard" || move.pieceType === "barrier" || move.pieceType === "realmKnight") {
          profile.solid += 1;
        } else if (move.pieceType === "decoy" || move.pieceType === "flanker" || move.pieceType === "vanguard" || move.pieceType === "disruptor") {
          profile.screen += 1;
        } else {
          profile.attack += 1;
        }
      });
    return "堅守" + profile.solid + " / 妨害" + profile.screen + " / 反撃" + profile.attack;
  }

  function getSelfPlayFirstActionKey(game, limit) {
    return game.moves
      .filter(function (move) { return move.phase !== "standby"; })
      .slice(0, limit || 8)
      .map(function (move) {
        if (move.type === "fragment") {
          return move.player + ":展開-" + move.fragment + "/" + move.pieceType;
        }
        if (move.type === "move") {
          return move.player + ":移動-" + move.pieceType;
        }
        return move.player + ":" + move.type;
      })
      .join(" | ");
  }

  function summarizeSelfPlayBatch(games) {
    var summary = {
      games: games.length,
      wins: { P1: 0, P2: 0, draw: 0 },
      reasons: {},
      averageTurns: 0,
      averagePlies: 0,
      strategyProfile: games[0] && games[0].strategies ? getSelfPlayStrategyLabel(games[0].strategies) : getSelfPlayStrategyLabel(null),
      setupPatterns: [],
      defenderSetupPatterns: [],
      defenderSetupOutcomes: [],
      defenderSetupProfileOutcomes: [],
      firstActionPatterns: [],
      actionUsage: {},
      recoveryStats: {
        pieceRecoveries: 0,
        fragmentRecoveries: 0,
        byPlayer: {
          P1: { piece: 0, fragment: 0, winsAfterRecovery: 0 },
          P2: { piece: 0, fragment: 0, winsAfterRecovery: 0 }
        },
        threatenedPieceRecoveries: 0,
        lowHandFragmentRecoveries: 0,
        examples: []
      },
      searchStats: {
        moves: 0,
        aborted: 0,
        abortRate: 0,
        averageNodes: 0,
        averageElapsedMs: 0,
        averageCompletedDepth: 0,
        maxNodes: 0,
        maxElapsedMs: 0,
        depthCounts: {},
        slowestMoves: [],
        abortedExamples: []
      },
      pieceUsage: {},
      decisiveGames: 0,
      winRates: { P1: 0, P2: 0, draw: 0 },
      decisiveWinRates: { P1: 0, P2: 0 },
      winRateGap: 0,
      defenderResults: {
        attackWins: 0,
        defenderWins: 0,
        defenderHolds: 0,
        defenderSuccesses: 0,
        attackWinRate: 0,
        defenderSuccessRate: 0,
        attackDefenseGap: 0
      },
      averageFinalDecks: { P1: 0, P2: 0 },
      averageCardsDrawn: { P1: 0, P2: 0 },
      deckExhaustedGames: 0,
      bothDecksExhaustedGames: 0,
      notes: []
    };
    var setupCounts = {};
    var defenderSetupCounts = {};
    var defenderSetupOutcomeMap = {};
    var defenderProfileOutcomeMap = {};
    var actionCounts = {};
    var totalTurns = 0;
    var totalPlies = 0;
    var totalP1Deck = 0;
    var totalP2Deck = 0;
    var totalSearchNodes = 0;
    var totalSearchElapsedMs = 0;
    var totalSearchCompletedDepth = 0;
    function recordDefenderOutcome(map, key, game) {
      if (!key) {
        return;
      }
      if (!map[key]) {
        map[key] = {
          count: 0,
          p1Wins: 0,
          p2Wins: 0,
          draws: 0,
          totalTurns: 0,
          totalP1Deck: 0,
          totalP2Deck: 0
        };
      }
      map[key].count += 1;
      map[key].p1Wins += game.winner === "P1" ? 1 : 0;
      map[key].p2Wins += game.winner === "P2" ? 1 : 0;
      map[key].draws += game.winner ? 0 : 1;
      map[key].totalTurns += game.turns;
      map[key].totalP1Deck += game.final && typeof game.final.p1Deck === "number" ? game.final.p1Deck : 0;
      map[key].totalP2Deck += game.final && typeof game.final.p2Deck === "number" ? game.final.p2Deck : 0;
    }
    function formatDefenderOutcomes(map) {
      return Object.keys(map).map(function (key) {
        var entry = map[key];
        return {
          pattern: key,
          count: entry.count,
          wins: { P1: entry.p1Wins, P2: entry.p2Wins, draw: entry.draws },
          p2WinRate: Math.round((entry.p2Wins / entry.count) * 1000) / 10,
          p2DefenseSuccessRate: Math.round(((entry.p2Wins + entry.draws) / entry.count) * 1000) / 10,
          averageTurns: Math.round((entry.totalTurns / entry.count) * 10) / 10,
          averageFinalDecks: {
            P1: Math.round((entry.totalP1Deck / entry.count) * 10) / 10,
            P2: Math.round((entry.totalP2Deck / entry.count) * 10) / 10
          }
        };
      }).sort(function (a, b) {
        if (b.p2DefenseSuccessRate !== a.p2DefenseSuccessRate) {
          return b.p2DefenseSuccessRate - a.p2DefenseSuccessRate;
        }
        if (b.p2WinRate !== a.p2WinRate) {
          return b.p2WinRate - a.p2WinRate;
        }
        if (b.averageTurns !== a.averageTurns) {
          return b.averageTurns - a.averageTurns;
        }
        return b.count - a.count;
      }).slice(0, 12);
    }
    games.forEach(function (game) {
      var winnerKey = game.winner || "draw";
      var p1Deck = game.final && typeof game.final.p1Deck === "number" ? game.final.p1Deck : 0;
      var p2Deck = game.final && typeof game.final.p2Deck === "number" ? game.final.p2Deck : 0;
      summary.wins[winnerKey] = (summary.wins[winnerKey] || 0) + 1;
      summary.reasons[game.reason || "未決着"] = (summary.reasons[game.reason || "未決着"] || 0) + 1;
      totalTurns += game.turns;
      totalPlies += game.plies;
      totalP1Deck += p1Deck;
      totalP2Deck += p2Deck;
      if (p1Deck === 0 || p2Deck === 0) {
        summary.deckExhaustedGames += 1;
      }
      if (p1Deck === 0 && p2Deck === 0) {
        summary.bothDecksExhaustedGames += 1;
      }
      setupCounts[getSelfPlaySetupKey(game)] = (setupCounts[getSelfPlaySetupKey(game)] || 0) + 1;
      if (game.strategies && game.strategies.P2 === "defense") {
        defenderSetupCounts[getSelfPlayPlayerSetupKey(game, "P2")] = (defenderSetupCounts[getSelfPlayPlayerSetupKey(game, "P2")] || 0) + 1;
        recordDefenderOutcome(defenderSetupOutcomeMap, getSelfPlayPlayerSetupKey(game, "P2"), game);
        recordDefenderOutcome(defenderProfileOutcomeMap, getSelfPlayPlayerSetupProfileKey(game, "P2"), game);
      }
      actionCounts[getSelfPlayFirstActionKey(game, 8)] = (actionCounts[getSelfPlayFirstActionKey(game, 8)] || 0) + 1;
      game.moves.forEach(function (move) {
        var stats = move.searchStats || null;
        summary.actionUsage[move.type] = (summary.actionUsage[move.type] || 0) + 1;
        if (move.pieceType) {
          summary.pieceUsage[move.pieceType] = (summary.pieceUsage[move.pieceType] || 0) + 1;
        }
        if (stats) {
          var searchExample = {
            gameId: game.id,
            player: move.player,
            turnNumber: move.turnNumber,
            type: move.type,
            label: move.label || "",
            depth: Number(stats.depth) || 0,
            completedDepth: Number(stats.completedDepth) || 0,
            elapsedMs: Number(stats.elapsedMs) || 0,
            nodes: Number(stats.nodes) || 0,
            aborted: !!stats.aborted,
            emergency: !!stats.emergency
          };
          summary.searchStats.moves += 1;
          summary.searchStats.aborted += stats.aborted ? 1 : 0;
          totalSearchNodes += Number(stats.nodes) || 0;
          totalSearchElapsedMs += Number(stats.elapsedMs) || 0;
          totalSearchCompletedDepth += Number(stats.completedDepth) || 0;
          summary.searchStats.maxNodes = Math.max(summary.searchStats.maxNodes, Number(stats.nodes) || 0);
          summary.searchStats.maxElapsedMs = Math.max(summary.searchStats.maxElapsedMs, Number(stats.elapsedMs) || 0);
          summary.searchStats.depthCounts[stats.depth || 0] = (summary.searchStats.depthCounts[stats.depth || 0] || 0) + 1;
          summary.searchStats.slowestMoves.push(searchExample);
          if (stats.aborted) {
            summary.searchStats.abortedExamples.push(searchExample);
          }
        }
        if (move.type === "recoverPiece" || move.type === "recoverFragment") {
          var recoveryKind = move.type === "recoverPiece" ? "piece" : "fragment";
          summary.recoveryStats.byPlayer[move.player][recoveryKind] += 1;
          if (game.winner === move.player) {
            summary.recoveryStats.byPlayer[move.player].winsAfterRecovery += 1;
          }
          if (move.type === "recoverPiece") {
            summary.recoveryStats.pieceRecoveries += 1;
            if (move.recoverContext && move.recoverContext.threatened) {
              summary.recoveryStats.threatenedPieceRecoveries += 1;
            }
          } else {
            summary.recoveryStats.fragmentRecoveries += 1;
            if (move.recoverContext && move.recoverContext.handCount <= 1) {
              summary.recoveryStats.lowHandFragmentRecoveries += 1;
            }
          }
          if (summary.recoveryStats.examples.length < 12) {
            summary.recoveryStats.examples.push({
              gameId: game.id,
              winner: game.winner || "draw",
              player: move.player,
              turnNumber: move.turnNumber,
              type: move.type,
              pieceType: move.pieceType || "",
              fragment: move.fragment || "",
              context: move.recoverContext || null,
              label: move.label
            });
          }
        }
      });
    });
    summary.averageTurns = games.length ? Math.round((totalTurns / games.length) * 10) / 10 : 0;
    summary.averagePlies = games.length ? Math.round((totalPlies / games.length) * 10) / 10 : 0;
    summary.decisiveGames = (summary.wins.P1 || 0) + (summary.wins.P2 || 0);
    summary.winRates.P1 = games.length ? Math.round(((summary.wins.P1 || 0) / games.length) * 1000) / 10 : 0;
    summary.winRates.P2 = games.length ? Math.round(((summary.wins.P2 || 0) / games.length) * 1000) / 10 : 0;
    summary.winRates.draw = games.length ? Math.round(((summary.wins.draw || 0) / games.length) * 1000) / 10 : 0;
    summary.decisiveWinRates.P1 = summary.decisiveGames ? Math.round(((summary.wins.P1 || 0) / summary.decisiveGames) * 1000) / 10 : 0;
    summary.decisiveWinRates.P2 = summary.decisiveGames ? Math.round(((summary.wins.P2 || 0) / summary.decisiveGames) * 1000) / 10 : 0;
    summary.winRateGap = Math.round(Math.abs(summary.winRates.P1 - summary.winRates.P2) * 10) / 10;
    summary.defenderResults.attackWins = summary.wins.P1 || 0;
    summary.defenderResults.defenderWins = summary.wins.P2 || 0;
    summary.defenderResults.defenderHolds = summary.wins.draw || 0;
    summary.defenderResults.defenderSuccesses = summary.defenderResults.defenderWins + summary.defenderResults.defenderHolds;
    summary.defenderResults.attackWinRate = summary.winRates.P1;
    summary.defenderResults.defenderSuccessRate = games.length ? Math.round((summary.defenderResults.defenderSuccesses / games.length) * 1000) / 10 : 0;
    summary.defenderResults.attackDefenseGap = Math.round(Math.abs(summary.defenderResults.attackWinRate - summary.defenderResults.defenderSuccessRate) * 10) / 10;
    summary.averageFinalDecks.P1 = games.length ? Math.round((totalP1Deck / games.length) * 10) / 10 : 0;
    summary.averageFinalDecks.P2 = games.length ? Math.round((totalP2Deck / games.length) * 10) / 10 : 0;
    summary.averageCardsDrawn.P1 = games.length ? Math.round((getStarterDeck(games[0] && games[0].mode).length - summary.averageFinalDecks.P1) * 10) / 10 : 0;
    summary.averageCardsDrawn.P2 = games.length ? Math.round((getStarterDeck(games[0] && games[0].mode).length - summary.averageFinalDecks.P2) * 10) / 10 : 0;
    if (summary.searchStats.moves) {
      summary.searchStats.abortRate = Math.round((summary.searchStats.aborted / summary.searchStats.moves) * 1000) / 10;
      summary.searchStats.averageNodes = Math.round((totalSearchNodes / summary.searchStats.moves) * 10) / 10;
      summary.searchStats.averageElapsedMs = Math.round((totalSearchElapsedMs / summary.searchStats.moves) * 10) / 10;
      summary.searchStats.averageCompletedDepth = Math.round((totalSearchCompletedDepth / summary.searchStats.moves) * 10) / 10;
      summary.searchStats.slowestMoves = summary.searchStats.slowestMoves.sort(function (a, b) {
        return b.elapsedMs - a.elapsedMs;
      }).slice(0, 10);
      summary.searchStats.abortedExamples = summary.searchStats.abortedExamples.sort(function (a, b) {
        return b.elapsedMs - a.elapsedMs;
      }).slice(0, 10);
    }
    summary.setupPatterns = Object.keys(setupCounts).sort(function (a, b) {
      return setupCounts[b] - setupCounts[a];
    }).slice(0, 10).map(function (key) {
      return { count: setupCounts[key], pattern: key };
    });
    summary.defenderSetupPatterns = Object.keys(defenderSetupCounts).sort(function (a, b) {
      return defenderSetupCounts[b] - defenderSetupCounts[a];
    }).slice(0, 10).map(function (key) {
      return { count: defenderSetupCounts[key], pattern: key };
    });
    summary.defenderSetupOutcomes = formatDefenderOutcomes(defenderSetupOutcomeMap);
    summary.defenderSetupProfileOutcomes = formatDefenderOutcomes(defenderProfileOutcomeMap);
    summary.firstActionPatterns = Object.keys(actionCounts).sort(function (a, b) {
      return actionCounts[b] - actionCounts[a];
    }).slice(0, 10).map(function (key) {
      return { count: actionCounts[key], pattern: key };
    });
    summary.notes.push("初期スタンバイの出現頻度が高い並びは、基本囲いとして重み付けできます。");
    summary.notes.push("短手数で勝った棋譜は、勝ち筋評価と即負け回避フィルタのテストケース候補。");
    summary.notes.push("主指標は defenderResults.attackDefenseGap。未決着は後手が守り切った守備成功として扱う。");
    summary.notes.push("山札消費は副指標。averageFinalDecks と deckExhaustedGames は長期戦化の確認に使う。");
    summary.notes.push("未決着が多い場合は、後手の守備成功として見ながら終盤の勝ち筋評価を調整する。");
    summary.notes.push("searchStats は読み探索の重さ確認用。abortRate と averageCompletedDepth で読み切り精度を見る。");
    return summary;
  }

  function runNpcSelfPlayGame(options) {
    var state = createGame(options.mode || "original", DEFAULT_TIME_CONTROL);
    var moves = [];
    var traces = [];
    var maxPlies = options.maxPlies || 240;
    var staleLimit = options.staleLimit || 80;
    var staleCount = 0;
    state.initialSetup.rule = normalizeInitialStandbyRule(options.initialStandbyRule || options.standbyRule);
    uiState.state = state;
    uiState.ruleMode = state.ruleMode;
    uiState.npc.enabled = false;
    uiState.online.enabled = false;
    uiState.selection = null;
    uiState.pendingFragmentPiece = null;
    uiState.pendingAnchor = null;

    for (var ply = 0; ply < maxPlies && !state.winner; ply += 1) {
      var beforeCurrentPlayer = state.currentPlayer;
      var beforeTurnNumber = state.turnNumber;
      var beforePhase = state.phase;
      var beforePlacementCount = state.placements.length;
      var beforeP1PieceCount = Object.keys(state.players.P1.pieces).length;
      var beforeP2PieceCount = Object.keys(state.players.P2.pieces).length;
      var trace = options.traceDecisions ? traceNpcDecisionForCurrentState(options.traceLimit || 12) : null;
      var action;
      var searchStats;
      var moveSummary;
      uiState.npc.lastSearchStats = null;
      action = chooseNpcAction();
      searchStats = cloneNpcSearchStats(uiState.npc.lastSearchStats);
      if (!action) {
        break;
      }
      moveSummary = summarizeSelfPlayAction(state, action);
      if (searchStats) {
        moveSummary.searchStats = searchStats;
      }
      if (trace) {
        trace.selected = moveSummary;
        traces.push(trace);
      }
      moves.push(moveSummary);
      applyNpcActionToState(state, action);
      if (
        state.currentPlayer === beforeCurrentPlayer &&
        state.turnNumber === beforeTurnNumber &&
        state.phase === beforePhase &&
        state.placements.length === beforePlacementCount &&
        Object.keys(state.players.P1.pieces).length === beforeP1PieceCount &&
        Object.keys(state.players.P2.pieces).length === beforeP2PieceCount
      ) {
        staleCount += 1;
      } else {
        staleCount = 0;
      }
      if (staleCount >= staleLimit) {
        break;
      }
    }

    return {
      id: options.id,
      seed: options.seed,
      mode: state.ruleMode,
      initialStandbyRule: getInitialStandbyRule(state),
      strategies: options.strategies || { P1: getNpcStrategy("P1"), P2: getNpcStrategy("P2") },
      winner: state.winner,
      reason: state.winReason || (state.winner ? "勝利" : "未決着"),
      turns: Math.max(0, state.turnNumber - 1),
      plies: moves.length,
      moves: moves,
      traces: traces,
      final: {
        currentPlayer: state.currentPlayer,
        phase: state.phase,
        p1Pieces: Object.keys(state.players.P1.pieces).length,
        p2Pieces: Object.keys(state.players.P2.pieces).length,
        p1Deck: state.players.P1.deck.length,
        p2Deck: state.players.P2.deck.length
      }
    };
  }

  function runNpcSelfPlayBatch(options) {
    var count = Math.max(1, Math.min(5000, Number(options && options.count) || 100));
    var seed = Number(options && options.seed) || 20260503;
    var previousState = uiState.state;
    var previousRuleMode = uiState.ruleMode;
    var previousNpc = JSON.parse(JSON.stringify(uiState.npc));
    var previousOnlineEnabled = uiState.online.enabled;
    var originalRandom = Math.random;
    var games = [];
    var startedAt = new Date().toISOString();
    var strategies = createSelfPlayStrategyMap(options || {});
    var fast = !!(options && options.fast);
    var bulk = !!(options && options.bulk);
    var lookaheadDepth = normalizeNpcLookaheadDepth(options && options.lookaheadDepth);
    try {
      Math.random = createSeededRandom(seed);
      uiState.npc.strategyByPlayer = strategies;
      uiState.npc.selfPlayFast = fast;
      uiState.npc.bulkSelfPlay = bulk;
      uiState.npc.lookaheadDepth = lookaheadDepth;
      for (var index = 0; index < count; index += 1) {
        var game = runNpcSelfPlayGame({
          id: index + 1,
          seed: seed + index,
          strategies: strategies,
          mode: options && options.mode ? options.mode : "original",
          maxPlies: options && options.maxPlies ? Number(options.maxPlies) : 240,
          initialStandbyRule: normalizeInitialStandbyRule(options && (options.initialStandbyRule || options.standbyRule)),
          traceDecisions: !!(options && options.traceDecisions),
          traceLimit: Number(options && options.traceLimit) || 12
        });
        games.push(game);
        if (typeof window.__UNFOLD_SELFPLAY_ON_GAME__ === "function") {
          try {
            window.__UNFOLD_SELFPLAY_ON_GAME__({
              game: game,
              index: index,
              total: count,
              generatedAt: startedAt,
              options: {
                count: count,
                mode: options && options.mode ? options.mode : "original",
                maxPlies: options && options.maxPlies ? Number(options.maxPlies) : 240,
                strategyProfile: getSelfPlayStrategyLabel(strategies),
                fast: fast,
                bulk: bulk,
                lookaheadDepth: lookaheadDepth,
                initialStandbyRule: normalizeInitialStandbyRule(options && (options.initialStandbyRule || options.standbyRule))
              },
              summary: summarizeSelfPlayBatch(games)
            });
          } catch (progressError) {
            if (window.console && typeof window.console.error === "function") {
              window.console.error(progressError);
            }
          }
        }
      }
    } finally {
      Math.random = originalRandom;
      uiState.state = previousState;
      uiState.ruleMode = previousRuleMode;
      uiState.npc = previousNpc;
      uiState.online.enabled = previousOnlineEnabled;
    }
    return {
      generatedAt: startedAt,
      seed: seed,
      options: {
        count: count,
        mode: options && options.mode ? options.mode : "original",
        maxPlies: options && options.maxPlies ? Number(options.maxPlies) : 240,
        strategyProfile: getSelfPlayStrategyLabel(strategies),
        fast: fast,
        bulk: bulk,
        lookaheadDepth: lookaheadDepth,
        initialStandbyRule: normalizeInitialStandbyRule(options && (options.initialStandbyRule || options.standbyRule)),
        traceDecisions: !!(options && options.traceDecisions)
      },
      summary: summarizeSelfPlayBatch(games),
      games: games
    };
  }

  function cloneAndApplyOpeningRescueAction(state, player, action) {
    var nextState = cloneNpcSimulationState(state);
    nextState.currentPlayer = player;
    applyNpcActionToState(nextState, action);
    return nextState;
  }

  function getOpeningRescueRefinedActions(state, player, limit) {
    return withTemporaryState(state, function () {
      var actions = collectNpcActionsForState(state, player);
      var emergencyMode;
      if (!actions.length) {
        return [];
      }
      emergencyMode = isKingUnderThreatInState(state, player) ||
        countImmediateWinningActionsInState(state, getOpponentPlayer(player), 4) > 0 ||
        getFastLossRiskScoreForPlayer(state, player) >= 120000;
      actions = refineNpcCandidateActions(state, player, actions, emergencyMode);
      actions.sort(function (a, b) {
        return (b.refinedScore || b.score) - (a.refinedScore || a.score);
      });
      return actions.slice(0, Math.min(limit || 8, actions.length));
    });
  }

  function scoreOpeningRescueThreatAction(state, attacker, action) {
    var nextState = cloneAndApplyOpeningRescueAction(state, attacker, action);
    var defender = getOpponentPlayer(attacker);
    var score = action.score || 0;
    if (nextState.winner === attacker) {
      score += 1000000;
    }
    score += getOpeningAttackPressureScoreForPlayer(nextState, attacker) * 0.24;
    score += Math.max(0, -getKingLandingControlScoreForPlayer(nextState, defender)) * 0.32;
    score += countImmediateWinningActionsInState(nextState, attacker, 4) * 80000;
    if (isKingUnderThreatInState(nextState, defender)) {
      score += 90000;
    }
    return score;
  }

  function getOpeningRescueThreatActions(state, attacker, limit) {
    var actions = getOpeningRescueRefinedActions(state, attacker, Math.max(8, (limit || 6) * 2));
    actions.sort(function (a, b) {
      return scoreOpeningRescueThreatAction(state, attacker, b) - scoreOpeningRescueThreatAction(state, attacker, a);
    });
    return actions.slice(0, Math.min(limit || 6, actions.length));
  }

  function evaluateOpeningRescueReply(state, defender, threatAction, options) {
    var attacker = getOpponentPlayer(defender);
    var threatState = cloneAndApplyOpeningRescueAction(state, attacker, threatAction);
    var replies;
    var best = null;
    var lookaheadDepth = Math.max(1, Math.min(3, Number(options && options.lookaheadDepth) || 3));
    if (threatState.winner === attacker) {
      return {
        safe: false,
        threat: summarizeSelfPlayAction(state, threatAction),
        reason: "attacker-immediate-win",
        bestReply: null
      };
    }
    if (threatState.winner === defender) {
      return {
        safe: true,
        threat: summarizeSelfPlayAction(state, threatAction),
        reason: "threat-backfired",
        bestReply: null
      };
    }
    replies = getOpeningRescueRefinedActions(threatState, defender, options && options.replyLimit || 8);
    replies.forEach(function (reply) {
      var replyState = cloneAndApplyOpeningRescueAction(threatState, defender, reply);
      var opponentWins;
      var score;
      var safe;
      if (replyState.winner === defender) {
        score = 6000000;
        safe = true;
      } else if (replyState.winner === attacker) {
        score = -6000000;
        safe = false;
      } else {
        opponentWins = countImmediateWinningActionsInState(replyState, attacker, 4);
        score = searchNpcLookahead(replyState, defender, lookaheadDepth - 1, -Infinity, Infinity);
        score += getFastLossRiskScoreForPlayer(threatState, defender) - getFastLossRiskScoreForPlayer(replyState, defender);
        score += getOpeningRescueResponseScore(threatState, defender, reply);
        if (opponentWins) {
          score -= 240000 + opponentWins * 50000;
        }
        if (isKingUnderThreatInState(replyState, defender)) {
          score -= 180000;
        }
        safe = opponentWins === 0 && !isKingUnderThreatInState(replyState, defender) && score > -220000;
      }
      if (!best || score > best.score) {
        best = {
          safe: safe,
          score: Math.round(score),
          reply: summarizeSelfPlayAction(threatState, reply)
        };
      }
    });
    return {
      safe: !!(best && best.safe),
      threat: summarizeSelfPlayAction(state, threatAction),
      reason: best && best.safe ? "reply-found" : "no-safe-reply",
      bestReply: best
    };
  }

  function evaluateOpeningRescueStandbyState(state, defender, options) {
    var attacker = getOpponentPlayer(defender);
    var threats = getOpeningRescueThreatActions(state, attacker, options && options.threatLimit || 6);
    var results = threats.map(function (threat) {
      return evaluateOpeningRescueReply(state, defender, threat, options || {});
    });
    var unsafe = results.filter(function (result) {
      return !result.safe;
    });
    return {
      safe: threats.length > 0 && unsafe.length === 0,
      threatCount: threats.length,
      unsafeCount: unsafe.length,
      safeCount: results.length - unsafe.length,
      results: results
    };
  }

  function scoreOpeningRescueSetupCandidate(state, player, action, options) {
    var nextState = cloneAndApplyOpeningRescueAction(state, player, action);
    var finalSetup = !isInitialStandbyPhase(nextState);
    var score = action.score || 0;
    var rescue = null;
    score += getOpeningRescueSetupBias(state, player, nextState, finalSetup);
    if (finalSetup) {
      rescue = evaluateOpeningRescueStandbyState(nextState, player, options || {});
      score += rescue.safe ? 260000 : -rescue.unsafeCount * 90000;
      score += rescue.safeCount * 18000;
    } else {
      score += getDefensiveBandScoreForPlayer(nextState, player) * 0.22;
      score -= getFastLossRiskScoreForPlayer(nextState, player) * 0.18;
    }
    return {
      action: action,
      score: Math.round(score),
      finalSetup: finalSetup,
      rescue: rescue
    };
  }

  function chooseOpeningRescueSetupActionForSearch(state, player, options) {
    return withTemporaryState(state, function () {
      var actions = collectNpcInitialSetupActions(player);
      var candidates = actions.map(function (action) {
        return scoreOpeningRescueSetupCandidate(state, player, action, options || {});
      });
      candidates.sort(function (a, b) {
        return b.score - a.score;
      });
      return {
        best: candidates[0] || null,
        candidates: candidates.slice(0, Math.min(Number(options && options.setupLimit) || 8, candidates.length))
      };
    });
  }

  function runOpeningRescueSearchScenario(options, index) {
    var state = createGame(options.mode || "original", DEFAULT_TIME_CONTROL);
    var setupDecisions = [];
    var safety = null;
    var guard = 0;
    uiState.state = state;
    uiState.ruleMode = state.ruleMode;
    while (isInitialStandbyPhase(state) && guard < 12) {
      var player = state.currentPlayer;
      var decision;
      var action;
      if (player === "P2") {
        decision = chooseOpeningRescueSetupActionForSearch(state, player, options);
        action = decision.best ? decision.best.action : null;
        setupDecisions.push({
          step: setupDecisions.length + 1,
          player: player,
          chosenScore: decision.best ? decision.best.score : null,
          finalSetup: !!(decision.best && decision.best.finalSetup),
          chosen: action ? summarizeSelfPlayAction(state, action) : null,
          candidateCount: decision.candidates.length,
          candidates: decision.candidates.map(function (candidate) {
            return {
              score: candidate.score,
              finalSetup: candidate.finalSetup,
              safe: candidate.rescue ? candidate.rescue.safe : null,
              unsafeCount: candidate.rescue ? candidate.rescue.unsafeCount : null,
              action: summarizeSelfPlayAction(state, candidate.action)
            };
          })
        });
      } else {
        action = chooseNpcAction();
      }
      if (!action) {
        break;
      }
      applyNpcActionToState(state, action);
      guard += 1;
    }
    if (!isInitialStandbyPhase(state)) {
      safety = evaluateOpeningRescueStandbyState(state, "P2", options || {});
    }
    return {
      id: index + 1,
      mode: state.ruleMode,
      safe: safety ? safety.safe : false,
      threatCount: safety ? safety.threatCount : 0,
      unsafeCount: safety ? safety.unsafeCount : null,
      setupDecisions: setupDecisions,
      finalSetup: {
        p2Profile: getOpeningRescueSetupStats(state, "P2"),
        p1Profile: getOpeningRescueSetupStats(state, "P1")
      },
      safety: safety
    };
  }

  function summarizeOpeningRescueSearch(results) {
    var safe = results.filter(function (result) { return result.safe; }).length;
    return {
      scenarios: results.length,
      safe: safe,
      unsafe: results.length - safe,
      safeRate: results.length ? Math.round((safe / results.length) * 1000) / 10 : 0,
      averageUnsafeThreats: results.length ? Math.round((results.reduce(function (sum, result) {
        return sum + (Number(result.unsafeCount) || 0);
      }, 0) / results.length) * 10) / 10 : 0
    };
  }

  function runOpeningRescueSearchBatch(options) {
    var count = Math.max(1, Math.min(100, Number(options && options.count) || 10));
    var seed = Number(options && options.seed) || 20260507;
    var previousState = uiState.state;
    var previousRuleMode = uiState.ruleMode;
    var previousNpc = JSON.parse(JSON.stringify(uiState.npc));
    var previousOnlineEnabled = uiState.online.enabled;
    var originalRandom = Math.random;
    var results = [];
    var strategies = createSelfPlayStrategyMap({
      p1Strategy: "attack",
      p2Strategy: "defense"
    });
    try {
      Math.random = createSeededRandom(seed);
      uiState.npc.strategyByPlayer = strategies;
      uiState.npc.selfPlayFast = false;
      uiState.npc.bulkSelfPlay = false;
      uiState.npc.lookaheadDepth = normalizeNpcLookaheadDepth(options && options.lookaheadDepth || 3);
      uiState.online.enabled = false;
      for (var index = 0; index < count; index += 1) {
        results.push(runOpeningRescueSearchScenario(options || {}, index));
      }
    } finally {
      Math.random = originalRandom;
      uiState.state = previousState;
      uiState.ruleMode = previousRuleMode;
      uiState.npc = previousNpc;
      uiState.online.enabled = previousOnlineEnabled;
    }
    return {
      generatedAt: new Date().toISOString(),
      seed: seed,
      options: {
        count: count,
        mode: options && options.mode ? options.mode : "original",
        lookaheadDepth: normalizeNpcLookaheadDepth(options && options.lookaheadDepth || 3),
        setupLimit: Number(options && options.setupLimit) || 8,
        threatLimit: Number(options && options.threatLimit) || 6,
        replyLimit: Number(options && options.replyLimit) || 8
      },
      summary: summarizeOpeningRescueSearch(results),
      results: results
    };
  }

  function runOpeningRescueSearchFromQueryIfRequested() {
    var params;
    var count;
    if (!isDiagnosticsUiEnabled()) {
      return false;
    }
    try {
      params = getDebugLocationParams();
    } catch (error) {
      return false;
    }
    count = Number(params.get("rescueSearch") || params.get("openingRescue") || 0);
    if (!count) {
      return false;
    }
    var result = runOpeningRescueSearchBatch({
      count: count,
      seed: Number(params.get("seed") || 20260507),
      mode: params.get("mode") || "original",
      lookaheadDepth: Number(params.get("lookahead") || params.get("lookaheadDepth") || 3),
      setupLimit: Number(params.get("setupLimit") || 8),
      threatLimit: Number(params.get("threatLimit") || 6),
      replyLimit: Number(params.get("replyLimit") || 8)
    });
    window.__UNFOLD_OPENING_RESCUE_RESULT__ = result;
    document.body.innerHTML = "<pre id=\"rescueSearchResult\">" + JSON.stringify(result, null, 2).replace(/[&<>]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[char];
    }) + "</pre>";
    return true;
  }

  function runSelfPlayFromQueryIfRequested() {
    var params;
    var count;
    if (!isDiagnosticsUiEnabled()) {
      return false;
    }
    try {
      params = getDebugLocationParams();
    } catch (error) {
      return false;
    }
    count = Number(params.get("selfplay") || 0);
    if (!count) {
      return false;
    }
    var result = runNpcSelfPlayBatch({
      count: count,
      seed: Number(params.get("seed") || 20260503),
      mode: params.get("mode") || "original",
      maxPlies: Number(params.get("maxPlies") || 240),
      strategyProfile: params.get("strategy") || params.get("strategyProfile") || "",
      p1Strategy: params.get("p1Strategy") || "",
      p2Strategy: params.get("p2Strategy") || "",
      lookaheadDepth: Number(params.get("lookahead") || params.get("lookaheadDepth") || 1),
      initialStandbyRule: params.get("standbyRule") || params.get("initialStandbyRule") || DEFAULT_INITIAL_STANDBY_RULE,
      traceDecisions: params.get("trace") === "1" || params.get("traceDecisions") === "1",
      traceLimit: Number(params.get("traceLimit") || 12),
      fast: params.get("fast") === "1" || params.get("fast") === "true",
      bulk: params.get("bulk") === "1" || params.get("bulk") === "true" || params.get("turbo") === "1" || params.get("turbo") === "true"
    });
    window.__UNFOLD_SELFPLAY_RESULT__ = result;
    document.body.innerHTML = "<pre id=\"selfplayResult\">" + JSON.stringify(result, null, 2).replace(/[&<>]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[char];
    }) + "</pre>";
    return true;
  }

  function runTacticalScenarioFromQueryIfRequested() {
    var params;
    var result;
    if (!isDiagnosticsUiEnabled()) {
      return false;
    }
    try {
      params = getDebugLocationParams();
    } catch (error) {
      return false;
    }
    if (params.get("tactical") !== "1" && params.get("tacticalScenario") !== "1") {
      return false;
    }
    result = runNpcTacticalScenarioSuite({
      mode: params.get("mode") || "original",
      suite: params.get("suite") || "core",
      scenario: params.get("scenario") || "",
      strategyProfile: params.get("strategy") || params.get("strategyProfile") || "attack-defense",
      p1Strategy: params.get("p1Strategy") || "",
      p2Strategy: params.get("p2Strategy") || "",
      lookaheadDepth: Number(params.get("lookahead") || params.get("lookaheadDepth") || 3),
      traceLimit: Number(params.get("traceLimit") || 10),
      fast: params.get("fast") === "1" || params.get("fast") === "true",
      bulk: params.get("bulk") === "1" || params.get("bulk") === "true" || params.get("turbo") === "1" || params.get("turbo") === "true"
    });
    window.__UNFOLD_TACTICAL_RESULT__ = result;
    document.body.innerHTML = "<pre id=\"tacticalScenarioResult\">" + JSON.stringify(result, null, 2).replace(/[&<>]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[char];
    }) + "</pre>";
    return true;
  }

  function chooseNpcActionForExternalState(payload) {
    var previousState = uiState.state;
    var previousNpc = JSON.parse(JSON.stringify(uiState.npc));
    var previousOnlineEnabled = uiState.online.enabled;
    var previousSelection = uiState.selection;
    var previousPendingFragmentPiece = uiState.pendingFragmentPiece;
    var action;
    payload = payload || {};
    try {
      uiState.state = cloneGameState(payload.state);
      uiState.online.enabled = false;
      uiState.selection = null;
      uiState.pendingFragmentPiece = null;
      uiState.npc.enabled = true;
      uiState.npc.side = payload.npcSide || (uiState.state && uiState.state.currentPlayer) || "P2";
      uiState.npc.strategyByPlayer = payload.strategyByPlayer || null;
      uiState.npc.selfPlayFast = !!payload.selfPlayFast;
      uiState.npc.bulkSelfPlay = !!payload.bulkSelfPlay;
      uiState.npc.lookaheadDepth = normalizeNpcLookaheadDepth(payload.lookaheadDepth || 1);
      uiState.npc.strength = payload.strength || DEFAULT_NPC_STRENGTH;
      uiState.npc.thinking = false;
      action = chooseNpcAction();
      return {
        action: action ? JSON.parse(JSON.stringify(action)) : null,
        searchStats: uiState.npc.lastSearchStats ? JSON.parse(JSON.stringify(uiState.npc.lastSearchStats)) : null,
        searchMemory: exportNpcSearchMemorySnapshot({
          dirtyOnly: true,
          clearDirty: true,
          maxEntries: NPC_SEARCH_MEMORY_MAX_STORAGE_ENTRIES
        })
      };
    } finally {
      uiState.state = previousState;
      uiState.npc = previousNpc;
      uiState.online.enabled = previousOnlineEnabled;
      uiState.selection = previousSelection;
      uiState.pendingFragmentPiece = previousPendingFragmentPiece;
    }
  }

  function applyNpcStrengthSettings(strengthValue) {
    var option = getNpcStrengthOption(strengthValue);
    uiState.npc.strength = option.value;
    uiState.npc.selfPlayFast = !!option.selfPlayFast;
    uiState.npc.lookaheadDepth = normalizeNpcLookaheadDepth(option.lookaheadDepth || 1);
  }

  function resetNpcThinkMetrics() {
    uiState.npc.thinkStartedAt = null;
    uiState.npc.lastThinkMs = 0;
    uiState.npc.totalThinkMs = 0;
    uiState.npc.movesThought = 0;
    uiState.npc.lastSearchStats = null;
  }

  function recordNpcThinkTime(ms) {
    var value = Math.max(0, Number(ms) || 0);
    uiState.npc.lastThinkMs = value;
    uiState.npc.totalThinkMs = Math.max(0, Number(uiState.npc.totalThinkMs || 0)) + value;
    uiState.npc.movesThought = Math.max(0, Number(uiState.npc.movesThought || 0)) + 1;
    uiState.npc.thinkStartedAt = null;
  }

  function formatNpcThinkSeconds(ms) {
    return (Math.max(0, Number(ms) || 0) / 1000).toFixed(2) + "\u79D2";
  }

  function formatNpcSearchStatsText(stats) {
    var parts = [];
    if (!stats || !stats.depth) {
      return "";
    }
    parts.push("\u63A2\u7D22 " + stats.depth + "\u624B");
    if (stats.completedDepth && stats.completedDepth < stats.depth) {
      parts.push("\u5230\u9054 " + stats.completedDepth);
    }
    if (stats.nodes) {
      parts.push(Math.max(0, Number(stats.nodes) || 0) + "n");
    }
    if (stats.initialCandidates || stats.finalCandidates) {
      parts.push("候補 " + Math.max(0, Number(stats.initialCandidates) || 0) + "\u2192" + Math.max(0, Number(stats.finalCandidates) || 0));
    }
    if (stats.aborted) {
      parts.push("\u4E88\u7B97\u5230\u9054");
    }
    return parts.join(" / ");
  }

  function getNpcThinkStatsText() {
    var searchStatsText;
    if (!uiState.npc || !uiState.npc.movesThought) {
      return "";
    }
    searchStatsText = formatNpcSearchStatsText(uiState.npc.lastSearchStats);
    return "\u004E\u0050\u0043\u601D\u8003: \u76F4\u8FD1 " + formatNpcThinkSeconds(uiState.npc.lastThinkMs)
      + " / \u5E73\u5747 " + formatNpcThinkSeconds(uiState.npc.totalThinkMs / uiState.npc.movesThought)
      + (searchStatsText ? " / " + searchStatsText : "");
  }

  function shouldAllowNpcWorker() {
    return typeof Worker === "function"
      && !npcWorkerRuntime.disabled
      && isNpcGame()
      && !isOnlineGame()
      && !uiState.replayOnly
      && !uiState.tsumeMode
      && !uiState.npc.selfPlayFast
      && !uiState.npc.bulkSelfPlay;
  }

  function shouldUseNpcWorkerForTurn() {
    return shouldAllowNpcWorker();
  }

  function prewarmNpcWorker() {
    if (shouldAllowNpcWorker()) {
      getNpcWorker();
    }
  }

  function getNpcTurnStartDelayMs() {
    return shouldAllowNpcWorker() ? 140 : 220;
  }

  function getNpcTurnToken() {
    var state = uiState.state || {};
    return [
      state.currentPlayer || "",
      state.turnNumber || 0,
      state.phase || "",
      state.winner || "",
      state.placements ? state.placements.length : 0,
      state.actionLog ? state.actionLog.length : 0
    ].join("|");
  }

  function getNpcSearchMemorySeedSnapshot() {
    loadNpcSearchMemoryFromStorage();
    return exportNpcSearchMemorySnapshot({
      dirtyOnly: false,
      clearDirty: false,
      maxEntries: NPC_SEARCH_MEMORY_MAX_STORAGE_ENTRIES
    });
  }

  function seedNpcWorkerSearchMemory() {
    var worker = npcWorkerRuntime.worker;
    var snapshot;
    if (!worker || npcWorkerRuntime.seeded) {
      return;
    }
    snapshot = getNpcSearchMemorySeedSnapshot();
    if (!snapshot) {
      npcWorkerRuntime.seeded = true;
      return;
    }
    try {
      worker.postMessage({
        type: "seedSearchMemory",
        payload: snapshot
      });
      npcWorkerRuntime.seeded = true;
    } catch (error) {
      npcWorkerRuntime.seeded = true;
    }
  }

  function isNpcTurnTokenCurrent(token) {
    return token === getNpcTurnToken() && isNpcTurn() && !uiState.state.winner;
  }

  function clearNpcWorkerCallbacks(error) {
    Object.keys(npcWorkerRuntime.callbacks).forEach(function (key) {
      var callback = npcWorkerRuntime.callbacks[key];
      window.clearTimeout(callback.timeout);
      callback.reject(error || new Error("NPC worker stopped"));
      delete npcWorkerRuntime.callbacks[key];
    });
  }

  function getNpcWorker() {
    if (!shouldUseNpcWorkerForTurn()) {
      return null;
    }
    if (npcWorkerRuntime.worker) {
      return npcWorkerRuntime.worker;
    }
    try {
      npcWorkerRuntime.worker = new Worker(NPC_WORKER_SCRIPT_URL);
      npcWorkerRuntime.seeded = false;
      npcWorkerRuntime.worker.onmessage = function (event) {
        var data = event.data || {};
        var callback;
        if (data.type !== "result") {
          if (data.type === "ready") {
            seedNpcWorkerSearchMemory();
          }
          if (data.type === "init-error") {
            npcWorkerRuntime.disabled = true;
            npcWorkerRuntime.fallbackReason = data.error || "NPC worker init error";
            clearNpcWorkerCallbacks(new Error(npcWorkerRuntime.fallbackReason));
          }
          return;
        }
        callback = npcWorkerRuntime.callbacks[data.requestId];
        if (!callback) {
          return;
        }
        window.clearTimeout(callback.timeout);
        delete npcWorkerRuntime.callbacks[data.requestId];
        if (!data.ok) {
          callback.reject(new Error(data.error || "NPC worker failed"));
          return;
        }
        if (data.searchMemory) {
          mergeNpcSearchMemoryFromWorker(data.searchMemory);
        }
        if (data.searchStats) {
          uiState.npc.lastSearchStats = data.searchStats;
        }
        callback.resolve(data);
      };
      npcWorkerRuntime.worker.onerror = function (event) {
        npcWorkerRuntime.disabled = true;
        npcWorkerRuntime.fallbackReason = event && event.message ? event.message : "NPC worker error";
        clearNpcWorkerCallbacks(new Error(npcWorkerRuntime.fallbackReason));
        if (npcWorkerRuntime.worker) {
          npcWorkerRuntime.worker.terminate();
        }
        npcWorkerRuntime.worker = null;
        npcWorkerRuntime.seeded = false;
      };
    } catch (error) {
      npcWorkerRuntime.disabled = true;
      npcWorkerRuntime.fallbackReason = error.message;
      return null;
    }
    return npcWorkerRuntime.worker;
  }

  function requestNpcActionFromWorker(turnToken) {
    var worker = getNpcWorker();
    var requestId;
    var payload;
    if (!worker) {
      return Promise.reject(new Error(npcWorkerRuntime.fallbackReason || "NPC worker unavailable"));
    }
    seedNpcWorkerSearchMemory();
    requestId = "npc-" + (++npcWorkerRuntime.requestId);
    payload = {
      state: cloneGameState(uiState.state),
      npcSide: uiState.state.currentPlayer,
      strategyByPlayer: uiState.npc.strategyByPlayer,
      selfPlayFast: false,
      bulkSelfPlay: false,
      lookaheadDepth: uiState.npc.lookaheadDepth,
      strength: uiState.npc.strength,
      ruleMode: uiState.ruleMode
    };
    return new Promise(function (resolve, reject) {
      npcWorkerRuntime.callbacks[requestId] = {
        resolve: resolve,
        reject: reject,
        timeout: window.setTimeout(function () {
          delete npcWorkerRuntime.callbacks[requestId];
          reject(new Error("NPC worker timeout"));
        }, 30000)
      };
      worker.postMessage({
        type: "chooseAction",
        requestId: requestId,
        turnToken: turnToken,
        payload: payload
      });
    });
  }

  function scheduleNpcTurn() {
    if (!isNpcTurn() || uiState.state.winner) {
      return;
    }
    clearNpcTurnTimer();
    uiState.npc.thinking = true;
    uiState.npc.thinkStartedAt = Date.now();
    clearSelection();
    prewarmNpcWorker();
    render();
    uiState.npc.timer = window.setTimeout(function () {
      uiState.npc.timer = null;
      performNpcTurn();
    }, getNpcTurnStartDelayMs());
  }

  function performNpcTurn() {
    var startedAt = uiState.npc.thinkStartedAt || Date.now();
    var turnToken;
    if (!isNpcTurn() || uiState.state.winner) {
      uiState.npc.thinking = false;
      uiState.npc.thinkStartedAt = null;
      render();
      return;
    }
    turnToken = getNpcTurnToken();
    if (shouldUseNpcWorkerForTurn()) {
      requestNpcActionFromWorker(turnToken).then(function (result) {
        if (!isNpcTurnTokenCurrent(turnToken)) {
          uiState.npc.thinking = false;
          uiState.npc.thinkStartedAt = null;
          render();
          return;
        }
        if (result.searchStats) {
          uiState.npc.lastSearchStats = result.searchStats;
        }
        recordNpcThinkTime(Date.now() - startedAt);
        finishNpcTurnAction(result.action || null);
      }).catch(function () {
        var fallbackAction;
        if (!isNpcTurnTokenCurrent(turnToken)) {
          uiState.npc.thinking = false;
          uiState.npc.thinkStartedAt = null;
          render();
          return;
        }
        fallbackAction = chooseNpcAction();
        recordNpcThinkTime(Date.now() - startedAt);
        finishNpcTurnAction(fallbackAction);
      });
      return;
    }
    var action = chooseNpcAction();
    recordNpcThinkTime(Date.now() - startedAt);
    finishNpcTurnAction(action);
  }

  function finishNpcTurnAction(action) {
    if (!action) {
      uiState.npc.thinking = false;
      pushLog("NPC は有効な手を見つけられませんでした");
      endTurn();
      return;
    }

    if (action.type === "fragment") {
      clearSelection();
      placeFragmentDirect(
        action.card,
        action.handIndex,
        action.cells,
        action.pieceCell ? action.pieceCell.row : null,
        action.pieceCell ? action.pieceCell.col : null,
        action.source,
        action.fragmentReserveKey
      );
      return;
    }
    if (action.type === "setupFragment") {
      clearSelection();
      uiState.npc.thinking = false;
      placeInitialStandbyFragmentDirect(action);
      return;
    }
    if (action.type === "setupPiece") {
      clearSelection();
      uiState.npc.thinking = false;
      placeInitialStandbyPieceDirect(action);
      return;
    }
    if (action.type === "setupPenalty") {
      var penaltyResults;
      var penaltyPlayer = uiState.state.currentPlayer;
      clearSelection();
      uiState.npc.thinking = false;
      penaltyResults = resolveBlockedInitialStandbyPenaltiesForState(uiState.state);
      if (!penaltyResults.length) {
        var fallbackPenalty = completeInitialStandbyWithPenaltyForState(uiState.state, penaltyPlayer);
        penaltyResults = [{
          player: penaltyPlayer,
          skipped: fallbackPenalty.skipped,
          setupComplete: fallbackPenalty.setupComplete
        }];
      }
      penaltyResults.forEach(function (result) {
        if (result.player) {
          pushLog(formatInitialStandbyPenaltyLog(result));
        }
      });
      if (penaltyResults.some(function (result) { return result.setupComplete; })) {
        pushLog("初期スタンバイ完了。先手の通常手番を開始");
        startClockForCurrentTurn(uiState.state);
      }
      recordHistorySnapshot(uiState.state, "初期スタンバイ不可");
      uiState.replayIndex = uiState.state.history.length - 1;
      if (!isOnlineGame()) {
        saveLatestReplayArchive(uiState.state);
      }
      render();
      if (isOnlineGame()) {
        pushRoomState();
      } else if (isNpcTurn() && !uiState.state.winner) {
        scheduleNpcTurn();
      }
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
    var clockFinished = false;
    var clock;
    checkBaseOccupationWin();
    if (!uiState.state.winner) {
      settleClockForCurrentPlayer(uiState.state);
      clock = ensureClockState(uiState.state);
      if (isClockEnabled(clock) && clock.remaining[uiState.state.currentPlayer] <= 0) {
        clockFinished = finishByClockTimeout(uiState.state, uiState.state.currentPlayer);
      }
    }
    if (!uiState.state.winner) {
      uiState.state.currentPlayer = uiState.state.currentPlayer === "P1" ? "P2" : "P1";
      uiState.state.turnNumber += 1;
      startClockForCurrentTurn(uiState.state);
    }
    if (!clockFinished) {
      recordHistorySnapshot(uiState.state, uiState.lastActionText || "手番終了");
    }
    uiState.lastActionText = "";
    uiState.replayIndex = uiState.state.history.length - 1;
    clearSelection();
    if (!isOnlineGame()) {
      saveLatestReplayArchive(uiState.state);
    }
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
    if (isInitialStandbyPhase(uiState.state)) {
      if (uiState.selection && uiState.selection.type === "setupPiece") {
        return "初期駒を配置中 " + getInitialStandbyProgressText(uiState.state, uiState.state.currentPlayer);
      }
      if (uiState.pendingAnchor) {
        if (isInitialStandbyBasePieceRule(uiState.state)) {
          return uiState.previewLegal ? "初期駒位置を確認中" : "初期駒位置を調整中";
        }
        return uiState.previewLegal ? "初期展開図を確認中" : "初期展開図を調整中";
      }
      return uiState.selection && uiState.selection.type === "fragment"
        ? "初期カードを選択中 " + getInitialStandbyProgressText(uiState.state, uiState.state.currentPlayer)
        : "初期スタンバイ " + getInitialStandbyProgressText(uiState.state, uiState.state.currentPlayer);
    }
    if (!uiState.selection) {
      return "\u672A\u9078\u629E";
    }
    if (uiState.pendingFragmentPiece) {
      if (!isPendingFragmentPieceReady()) {
        return "\u5C55\u958B\u56F3\u5C55\u958B\u4E2D";
      }
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
    if (uiState.selection.type === "piecePreview") {
      return "\u76F8\u624B\u99D2\u306E\u79FB\u52D5\u5148\u3092\u78BA\u8A8D\u4E2D";
    }
    if (uiState.selection.type === "reserve") {
      return "\u6301\u3061\u99D2\u3092\u914D\u7F6E\u4E2D";
    }
    if (uiState.pendingAnchor) {
      return uiState.previewLegal ? "\u6B20\u7247\u3092\u78BA\u8A8D\u4E2D" : "\u6B20\u7247\u306E\u7F6E\u304D\u5834\u3092\u8ABF\u6574\u4E2D";
    }
    return "\u6B20\u7247\u914D\u7F6E\u4E2D";
  }

  function getTacticalAlertForState(state, player) {
    var defensive;
    var attacking;
    var messages = [];
    var severity = "";
    if (!state || state.winner || isInitialStandbyPhase(state)) {
      return null;
    }
    defensive = getImmediateThreatSummaryForPlayer(state, player, 24);
    attacking = getImmediateThreatSummaryForPlayer(state, getOpponentPlayer(player), 24);
    if (defensive.kingCapture > 0) {
      messages.push("\u738B\u624B: \u6B21\u306E\u4E00\u624B\u3067\u5C55\u754C\u8005/\u738B\u304C\u53D6\u3089\u308C\u307E\u3059\u3002\u53D7\u3051\u3092\u512A\u5148\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
      severity = "danger";
    }
    if (defensive.fold > 0) {
      messages.push("FOLD(\u30D5\u30A9\u30FC\u30EB\u30C9)\u8B66\u6212: \u76F8\u624B\u304C\u6B21\u306E\u4E00\u624B\u3067\u5C55\u958B\u56F3\u306B\u3088\u308A\u672C\u9663\u4E2D\u5FC3\u3092\u4E0A\u66F8\u304D\u3067\u304D\u307E\u3059\u3002");
      severity = "danger";
    }
    if (!messages.length) {
      if (attacking.kingCapture > 0) {
        messages.push("\u738B\u624B\u53EF: \u76F8\u624B\u306E\u5C55\u754C\u8005/\u738B\u3092\u53D6\u308C\u308B\u624B\u304C\u3042\u308A\u307E\u3059\u3002");
        severity = "chance";
      }
      if (attacking.fold > 0) {
        messages.push("FOLD(\u30D5\u30A9\u30FC\u30EB\u30C9)\u53EF: \u6B21\u306E\u4E00\u624B\u3067\u5C55\u958B\u56F3\u306B\u3088\u308B\u672C\u9663\u4E2D\u5FC3\u306E\u4E0A\u66F8\u304D\u52DD\u3061\u304C\u3042\u308A\u307E\u3059\u3002");
        severity = "chance";
      }
    }
    if (!messages.length) {
      return null;
    }
    return {
      text: messages.join(" "),
      severity: severity,
      defenseCritical: defensive.kingCapture > 0 || defensive.fold > 0
    };
  }

  function getMessageText(tacticalAlert) {
    if (isOnlineGame() && uiState.online.waitRequest) {
      if (uiState.online.waitRequest.requestedTo === uiState.online.side) {
        return "相手から待った申請が届いています。承認すると申請者の手番まで巻き戻します。";
      }
      if (uiState.online.waitRequest.requestedBy === uiState.online.side) {
        return "待った申請中です。相手の返答を待っています。";
      }
    }
    if (uiState.replayOnly) {
      return "保存した棋譜を閲覧中です。棋譜一覧から見たい局面を選べます。";
    }
    if (isOnlineReviewMode()) {
      return "終局後の感想戦です。棋譜一覧や前後ボタンで、両者同じ局面を見ながら確認できます。";
    }
    if (uiState.state.winner) {
      return PLAYER_LABELS[uiState.state.winner] + "\u306E\u52DD\u3061\u3067\u3059\u3002";
    }
    if (uiState.tsumeMode) {
      return "詰将棋です。先手の1手勝ちを探してください。";
    }
    if (isInitialStandbyPhase(uiState.state)) {
      if (isInitialStandbyBasePieceRule(uiState.state)) {
        if (uiState.selection && uiState.selection.type === "setupPiece") {
          return PLAYER_LABELS[uiState.state.currentPlayer] + "の初期スタンバイ " + getInitialStandbyStepLabel(uiState.state, uiState.state.currentPlayer) + " です。展開図を本陣に1辺で接する形で置き、対応駒をその展開図上に配置してください。";
        }
        return PLAYER_LABELS[uiState.state.currentPlayer] + "の初期スタンバイ " + getInitialStandbyStepLabel(uiState.state, uiState.state.currentPlayer) + " です。手札から1枚選び、展開図を本陣に1辺で接する形で置いてください。";
      }
      if (uiState.selection && uiState.selection.type === "fragment") {
        if (uiState.pendingAnchor) {
          return uiState.previewLegal
            ? PLAYER_LABELS[uiState.state.currentPlayer] + "の初期スタンバイ " + getInitialStandbyStepLabel(uiState.state, uiState.state.currentPlayer) + " です。この位置でよければ、展開図の候補マスをクリックして確定してください。"
            : "展開図を自分の本陣に1辺で接する形に調整してください。角だけ接している位置や、本陣に重なる位置には置けません。";
      }
      return PLAYER_LABELS[uiState.state.currentPlayer] + "の初期スタンバイ " + getInitialStandbyStepLabel(uiState.state, uiState.state.currentPlayer) + " です。手札から1枚選び、展開図を本陣に1辺で接する形で置いてください。";
    }
    return PLAYER_LABELS[uiState.state.currentPlayer] + "の初期スタンバイ " + getInitialStandbyStepLabel(uiState.state, uiState.state.currentPlayer) + " です。手札から1枚選び、展開図を本陣に1辺で接する形で置いてください。対応駒はその展開図上に配置されます。";
    }
    if (uiState.pendingPlacement && uiState.pendingPlacement.type === "move") {
      var pendingMovePiece = getPiece(uiState.state, uiState.pendingPlacement.pieceId);
      if (pendingMovePiece) {
        return getPieceLabel(pendingMovePiece.kind) + " を " + formatBoardCoordinate(pendingMovePiece.row, pendingMovePiece.col) + " から " + formatBoardCoordinate(uiState.pendingPlacement.row, uiState.pendingPlacement.col) + " へ動かす確認中です。金色のマスを見て確定してください。";
      }
      return "\u3053\u306E\u79FB\u52D5\u3092\u78BA\u5B9A\u3057\u307E\u3059\u304B\uFF1F";
    }
    if (uiState.pendingFragmentPiece) {
      if (!isPendingFragmentPieceReady()) {
        return "\u5C55\u958B\u56F3\u3092\u958B\u3044\u3066\u3044\u307E\u3059\u3002\u958B\u304D\u7D42\u308F\u308B\u3068\u3001\u99D2\u3092\u7F6E\u3051\u308B\u30DE\u30B9\u304C\u8868\u793A\u3055\u308C\u307E\u3059\u3002";
      }
      return "\u4ECA\u7F6E\u3044\u305F\u6B20\u7247\u306E\u4E2D\u304B\u3089\u3001" + getPieceLabel(uiState.pendingFragmentPiece.pieceType) + "\u3092\u7F6E\u304F\u30DE\u30B9\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044\u3002";
    }
    if (tacticalAlert && (tacticalAlert.defenseCritical || !uiState.selection)) {
      return tacticalAlert.text;
    }
    if (!uiState.selection) {
      var npcThinkStats = isNpcGame() ? getNpcThinkStatsText() : "";
      return "\u99D2\u3092\u52D5\u304B\u3059\u304B\u3001\u6301\u3061\u99D2\u3092\u6253\u3064\u304B\u3001\u624B\u672D\u3084\u6301\u3061\u5C55\u958B\u56F3\u3092\u914D\u7F6E\u3057\u3066\u304F\u3060\u3055\u3044\u3002" + (npcThinkStats ? "\u3000" + npcThinkStats : "");
    }
    if (uiState.selection.type === "piece") {
      var selectedPiece = getPiece(uiState.state, uiState.selection.pieceId);
      return (selectedPiece ? getPieceLabel(selectedPiece.kind) + " \u306E" : "") + "\u79FB\u52D5\u5148\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044\u3002\u9752\u304C\u79FB\u52D5\u5148\u3067\u3001\u5225\u306E\u81EA\u99D2\u3092\u62BC\u3059\u3068\u9078\u3073\u76F4\u3057\u3001\u540C\u3058\u99D2\u3092\u3082\u3046\u4E00\u5EA6\u62BC\u3059\u3068\u89E3\u9664\u3067\u304D\u307E\u3059\u3002";
    }
    if (uiState.selection.type === "piecePreview") {
      var previewPiece = getPiece(uiState.state, uiState.selection.pieceId);
      return (previewPiece ? "\u76F8\u624B\u306E " + getPieceLabel(previewPiece.kind) + " \u306F" : "\u76F8\u624B\u99D2\u306F") + "\u9752\u3044\u30DE\u30B9\u3078\u79FB\u52D5\u3067\u304D\u307E\u3059\u3002\u81EA\u99D2\u3092\u9078\u3076\u3068\u5B9F\u969B\u306E\u79FB\u52D5\u9078\u629E\u306B\u623B\u308A\u307E\u3059\u3002";
    }
    if (uiState.selection.type === "recoverPiece") {
      return "\u6A59\u306E\u67A0\u3067\u8868\u793A\u3055\u308C\u305F\u81EA\u99D2\u3092\u9078\u3076\u3068\u3001\u6301\u99D2\u3068\u3057\u3066\u56DE\u53CE\u3057\u307E\u3059\u3002";
    }
    if (uiState.selection.type === "recoverFragment") {
      return "\u7D2B\u306E\u67A0\u3067\u8868\u793A\u3055\u308C\u305F\u5C55\u958B\u56F3\u3092\u9078\u3076\u3068\u3001\u6301\u3061\u5C55\u958B\u56F3\u306B\u3057\u307E\u3059\u3002";
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
    var lines = [
      "OK: \u65B0\u3057\u3044\u5BFE\u5C40\u3092\u59CB\u3081\u308B",
      "OK: \u76E4\u9762\u8868\u793A",
      "OK: \u6301\u3061\u99D2\u30FB\u6301\u3061\u5C55\u958B\u56F3\u30FB\u624B\u672D\u8868\u793A",
      "OK: " + GAME_MODE_LABELS[getCurrentRuleMode()] + " \u306E\u79FB\u52D5\u30EB\u30FC\u30EB\u3092\u8868\u793A"
    ];
    var noTimeState = createGame(getCurrentRuleMode(), DEFAULT_TIME_CONTROL);
    var noTimeClock = ensureClockState(noTimeState);
    var noTimeTimeout = finishByClockTimeout(noTimeState, "P1");
    var setupState = createGame(getCurrentRuleMode(), DEFAULT_TIME_CONTROL);
    var setup = ensureInitialSetupState(setupState);
    var standbyPieceState = createGame(getCurrentRuleMode(), DEFAULT_TIME_CONTROL);
    var tsumeState = buildTsumeTrainingState(getCurrentRuleMode(), DEFAULT_TIME_CONTROL);
    var reservePoolState = createGame(getCurrentRuleMode(), DEFAULT_TIME_CONTROL);
    var drawTimingState = createGame(getCurrentRuleMode(), DEFAULT_TIME_CONTROL);
    var drawTimingCard = drawTimingState.players.P1.hand[0];
    var drawTimingDeckBefore = drawTimingState.players.P1.deck.length;
    var drawTimingNoEarlyDraw;
    var drawTimingRefilledAfterPiece;
    var blockedStandbyState = createGame(getCurrentRuleMode(), DEFAULT_TIME_CONTROL);
    var blockedPenaltyAction;
    var blockedPenaltyResult;
    var reserveEntry;
    getInitialStandbyBasePieceCellsForState(blockedStandbyState, "P1").forEach(function (cell) {
      addPiece(blockedStandbyState, "P1", "decoy", cell.row, cell.col);
    });
    blockedPenaltyAction = createInitialStandbyPenaltyActionForState(blockedStandbyState, "P1");
    blockedPenaltyResult = blockedPenaltyAction ? completeInitialStandbyWithPenaltyForState(blockedStandbyState, "P1") : null;
    lines.push((blockedPenaltyAction && blockedPenaltyResult && blockedPenaltyResult.skipped === INITIAL_STANDBY_PLACEMENTS && blockedStandbyState.players.P1.hand.length === HAND_LIMIT && getInitialStandbyPlacedCount(blockedStandbyState, "P1") === INITIAL_STANDBY_PLACEMENTS ? "OK" : "NG") + ": 初期スタンバイで置けない時は残り回数を失い手札3枚へ補充");
    addFragmentToReserve(reservePoolState.players.P1, { fragmentType: "net01", pieceType: "vanguard" });
    reserveEntry = getFragmentReserveEntries(reservePoolState.players.P1)[0];
    removeFragmentFromReserve(reservePoolState.players.P1, "net01");
    drawTimingState.phase = "play";
    addFragmentPlacementToState(drawTimingState, "P1", drawTimingCard, 0, [{ row: 0, col: 0 }], false, { source: "hand" });
    drawTimingNoEarlyDraw = drawTimingState.players.P1.hand.length === HAND_LIMIT - 1 && drawTimingState.players.P1.deck.length === drawTimingDeckBefore;
    addPiece(drawTimingState, "P1", drawTimingCard.pieceType, 0, 0);
    fillHand(drawTimingState, "P1");
    drawTimingRefilledAfterPiece = drawTimingState.players.P1.hand.length === HAND_LIMIT && drawTimingState.players.P1.deck.length === drawTimingDeckBefore - 1;
    lines.push((drawTimingNoEarlyDraw && drawTimingRefilledAfterPiece ? "OK" : "NG") + ": 手札補充は展開図と対応駒の配置完了後に行う");
    lines.push((reserveEntry && reserveEntry.key === "net01" && reserveEntry.card.pieceType === null ? "OK" : "NG") + ": 持ち展開図は対応駒を持たない");
    withTemporaryState(standbyPieceState, function () {
      for (var i = 0; i < INITIAL_STANDBY_PLACEMENTS * 2 && isInitialStandbyPhase(standbyPieceState); i += 1) {
        var setupAction = chooseNpcAction();
        if (!setupAction) {
          break;
        }
        applyNpcActionToState(standbyPieceState, setupAction);
      }
    });
    lines.push((setup.order.length === INITIAL_STANDBY_PLACEMENTS * 2 ? "OK" : "NG") + ": 初期スタンバイは各3枚ずつ展開図と対応駒を置く");
    lines.push((countPiecesForPlayerInState(standbyPieceState, "P1") === INITIAL_STANDBY_PLACEMENTS + 1 && countPiecesForPlayerInState(standbyPieceState, "P2") === INITIAL_STANDBY_PLACEMENTS + 1 ? "OK" : "NG") + ": 初期スタンバイ後は王と対応駒3つが盤面にある");
    lines.push((standbyPieceState.placements.length >= INITIAL_STANDBY_PLACEMENTS * 2 ? "OK" : "NG") + ": 初期スタンバイでは展開図も盤面に置く");
    lines.push((countHeldFragments(standbyPieceState.players.P1) === 0 && countHeldFragments(standbyPieceState.players.P2) === 0 ? "OK" : "NG") + ": 初期スタンバイで設置した展開図は持ち展開図にしない");
    lines.push((setupState.players.P1.hand.length === HAND_LIMIT && setupState.players.P1.deck.length === getStarterDeck(getCurrentRuleMode()).length - HAND_LIMIT ? "OK" : "NG") + ": 山札は初期手札3枚を引いた残り枚数になる");
    lines.push((getFragmentReserveEntries(reservePoolState.players.P1).length === 0 ? "OK" : "NG") + ": 持ち展開図は手札とは別に増減できる");
    lines.push((findImmediateWinningActionsInState(tsumeState, "P1", 3).length > 0 ? "OK" : "NG") + ": 詰将棋は先手の1手勝ち局面として作成される");
    lines.push((!isClockEnabled(noTimeClock) && noTimeClock.activeSince === null ? "OK" : "NG") + ": \u6301\u3061\u6642\u9593\u306A\u3057\u306F\u6642\u8A08\u3092\u8D77\u52D5\u3057\u306A\u3044");
    lines.push((!noTimeTimeout && !noTimeState.winner ? "OK" : "NG") + ": \u6301\u3061\u6642\u9593\u306A\u3057\u306F0\u79D2\u3067\u3082\u6642\u9593\u5207\u308C\u306B\u3057\u306A\u3044");
    return lines.join("\n");
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

  function cloneNpcPlainObject(source) {
    var result = {};
    if (!source || typeof source !== "object") {
      return result;
    }
    Object.keys(source).forEach(function (key) {
      result[key] = source[key];
    });
    return result;
  }

  function cloneNpcCard(card) {
    if (!card || typeof card !== "object") {
      return card;
    }
    return cloneNpcPlainObject(card);
  }

  function cloneNpcCardList(cards) {
    var result = [];
    var i;
    if (!Array.isArray(cards)) {
      return result;
    }
    for (i = 0; i < cards.length; i += 1) {
      result.push(cloneNpcCard(cards[i]));
    }
    return result;
  }

  function cloneNpcPieceMap(pieces) {
    var result = {};
    if (!pieces || typeof pieces !== "object") {
      return result;
    }
    Object.keys(pieces).forEach(function (pieceId) {
      result[pieceId] = cloneNpcPlainObject(pieces[pieceId]);
    });
    return result;
  }

  function cloneNpcBoard(board) {
    var result = [];
    var row;
    var col;
    var sourceRow;
    var resultRow;
    var cell;
    var nextCell;
    if (!Array.isArray(board)) {
      return result;
    }
    for (row = 0; row < board.length; row += 1) {
      sourceRow = board[row];
      resultRow = [];
      if (Array.isArray(sourceRow)) {
        for (col = 0; col < sourceRow.length; col += 1) {
          cell = sourceRow[col];
          if (!cell || typeof cell !== "object") {
            resultRow.push(cell);
          } else {
            nextCell = cloneNpcPlainObject(cell);
            nextCell.stack = Array.isArray(cell.stack) ? cell.stack.slice() : [];
            resultRow.push(nextCell);
          }
        }
      }
      result.push(resultRow);
    }
    return result;
  }

  function cloneNpcPlacements(placements) {
    var result = [];
    var i;
    var placement;
    var nextPlacement;
    if (!Array.isArray(placements)) {
      return result;
    }
    for (i = 0; i < placements.length; i += 1) {
      placement = placements[i];
      if (!placement || typeof placement !== "object") {
        result.push(placement);
      } else {
        nextPlacement = cloneNpcPlainObject(placement);
        nextPlacement.card = cloneNpcCard(placement.card);
        nextPlacement.cells = Array.isArray(placement.cells) ? placement.cells.map(function (cell) {
          return cloneNpcPlainObject(cell);
        }) : [];
        result.push(nextPlacement);
      }
    }
    return result;
  }

  function cloneNpcInitialSetup(initialSetup) {
    var source = initialSetup && typeof initialSetup === "object" ? initialSetup : createInitialSetupState();
    var result = cloneNpcPlainObject(source);
    result.order = Array.isArray(source.order) ? source.order.slice() : createInitialSetupOrder();
    result.placed = cloneNpcPlainObject(source.placed || { P1: 0, P2: 0 });
    return result;
  }

  function cloneNpcClock(clock) {
    var result;
    if (!clock || typeof clock !== "object") {
      return createClockState(DEFAULT_TIME_CONTROL);
    }
    result = cloneNpcPlainObject(clock);
    result.remaining = cloneNpcPlainObject(clock.remaining || { P1: 0, P2: 0 });
    return result;
  }

  function cloneNpcPlayer(playerState) {
    var source = playerState && typeof playerState === "object" ? playerState : {};
    var result = cloneNpcPlainObject(source);
    result.pieces = cloneNpcPieceMap(source.pieces);
    result.reserve = cloneNpcPlainObject(source.reserve || createReservePool());
    result.fragmentReserve = cloneNpcPlainObject(source.fragmentReserve || createFragmentReservePool());
    result.hand = cloneNpcCardList(source.hand);
    result.deck = cloneNpcCardList(source.deck);
    return result;
  }

  function cloneNpcSimulationState(state) {
    var result;
    if (!state || typeof state !== "object") {
      return state;
    }
    result = {
      board: cloneNpcBoard(state.board),
      ruleMode: state.ruleMode,
      phase: state.phase,
      initialSetup: cloneNpcInitialSetup(state.initialSetup),
      clock: cloneNpcClock(state.clock),
      currentPlayer: state.currentPlayer,
      winner: state.winner || null,
      winReason: state.winReason || null,
      turnNumber: state.turnNumber || 1,
      actionLog: [],
      history: [],
      placements: cloneNpcPlacements(state.placements),
      players: {
        P1: cloneNpcPlayer(state.players && state.players.P1),
        P2: cloneNpcPlayer(state.players && state.players.P2)
      }
    };
    Object.keys(state).forEach(function (key) {
      var value = state[key];
      if (Object.prototype.hasOwnProperty.call(result, key) || key === "history" || key === "actionLog") {
        return;
      }
      if (!value || typeof value !== "object") {
        result[key] = value;
      }
    });
    return result;
  }

  function resetBoardCameraView() {
    if (window.UNFOLD_3D_RENDERER && typeof window.UNFOLD_3D_RENDERER.resetCameraView === "function") {
      window.UNFOLD_3D_RENDERER.resetCameraView();
    }
  }

  function buildTsumeTrainingState(mode, timeControl) {
    var state = createGame(mode || uiState.ruleMode || "original", timeControl || DEFAULT_TIME_CONTROL);
    var attackCard = { fragmentType: "net04", pieceType: "charger" };
    var supportCard = { fragmentType: "net08", pieceType: "guard" };
    var attackCells = [
      { row: 3, col: 10 },
      { row: 4, col: 9 },
      { row: 4, col: 10 },
      { row: 4, col: 11 },
      { row: 4, col: 12 },
      { row: 5, col: 10 }
    ];
    var supportCells = [
      { row: 3, col: 12 },
      { row: 3, col: 13 },
      { row: 3, col: 14 },
      { row: 4, col: 12 },
      { row: 5, col: 12 },
      { row: 5, col: 13 }
    ];
    state.phase = "play";
    state.initialSetup = createInitialSetupState();
    state.initialSetup.index = state.initialSetup.order.length;
    state.initialSetup.placed.P1 = INITIAL_STANDBY_PLACEMENTS;
    state.initialSetup.placed.P2 = INITIAL_STANDBY_PLACEMENTS;
    state.currentPlayer = "P1";
    state.turnNumber = 1;
    state.players.P1.hand = [];
    state.players.P2.hand = [];
    state.players.P1.deck = [];
    state.players.P2.deck = [];
    state.players.P1.reserve = createReservePool();
    state.players.P2.reserve = createReservePool();
    state.players.P1.fragmentReserve = createFragmentReservePool();
    state.players.P2.fragmentReserve = createFragmentReservePool();
    addFragmentPlacementToState(state, "P1", attackCard, null, attackCells, false);
    addFragmentPlacementToState(state, "P2", supportCard, null, supportCells, false);
    addPiece(state, "P1", "charger", 4, 10);
    state.actionLog = ["詰将棋: 先手の1手勝ちを探す"];
    state.history = [];
    recordHistorySnapshot(state, "詰将棋開始局面");
    return state;
  }

  function startPracticeGame(modeOverride) {
    var viewerSide = resolveStartSidePreference(getSelectedStartSidePreference());
    clearNpcTurnTimer();
    resetNpcState();
    clearReplayViewerState();
    uiState.practiceMode = true;
    uiState.tsumeMode = false;
    uiState.tsumeStartedAt = null;
    uiState.ruleMode = modeOverride || uiState.ruleMode || (els.onlineModeSelect ? els.onlineModeSelect.value : "original");
    uiState.timeControl = getSelectedTimeControl();
    uiState.initialStandbyRule = getSelectedInitialStandbyRule("local");
    saveInitialStandbyRule(uiState.initialStandbyRule);
    uiState.startSidePreference = getSelectedStartSidePreference();
    uiState.localViewerSide = viewerSide;
    uiState.compareSourceMode = "mainline";
    uiState.compareSiblingRoomId = null;
    uiState.state = createGame(uiState.ruleMode, uiState.timeControl, {
      initialStandbyRule: uiState.initialStandbyRule
    });
    uiState.replayIndex = uiState.state.history.length - 1;
    clearSelection();
    saveLatestReplayArchive(uiState.state);
    pushLog("\u3072\u3068\u308A\u30C6\u30B9\u30C8\u30D7\u30EC\u30A4\u3092\u958B\u59CB (" + PLAYER_LABELS[viewerSide] + "\u5074\u3092\u624B\u524D)");
    uiState.screen = "game";
    resetBoardCameraView();
    render();
    startClockForCurrentTurn(uiState.state);
    renderClockDisplay();
    syncClockTicker();
  }

  function startTsumeTraining(modeOverride) {
    clearNpcTurnTimer();
    resetNpcState();
    clearReplayViewerState();
    uiState.practiceMode = true;
    uiState.tsumeMode = true;
    uiState.ruleMode = modeOverride || uiState.ruleMode || (els.onlineModeSelect ? els.onlineModeSelect.value : "original");
    uiState.timeControl = DEFAULT_TIME_CONTROL;
    uiState.startSidePreference = "P1";
    uiState.localViewerSide = "P1";
    uiState.compareSourceMode = "mainline";
    uiState.compareSiblingRoomId = null;
    uiState.state = buildTsumeTrainingState(uiState.ruleMode, DEFAULT_TIME_CONTROL);
    uiState.tsumeStartedAt = Date.now();
    uiState.replayIndex = uiState.state.history.length - 1;
    clearSelection();
    saveLatestReplayArchive(uiState.state);
    pushLog("詰将棋を開始: 先手の1手勝ちを探してください");
    uiState.screen = "game";
    resetBoardCameraView();
    render();
    startClockForCurrentTurn(uiState.state);
    renderClockDisplay();
    syncClockTicker();
  }

  function startNpcGame(modeOverride, options) {
    var startOptions = options || {};
    var startSidePreference = startOptions.startSidePreference || getSelectedStartSidePreference();
    var humanSide = resolveStartSidePreference(startSidePreference);
    var npcStrength = startOptions.npcStrength || getSelectedNpcStrength();
    clearNpcTurnTimer();
    resetNpcState();
    clearReplayViewerState();
    uiState.practiceMode = false;
    uiState.tsumeMode = false;
    uiState.tsumeStartedAt = null;
    uiState.npc.enabled = true;
    uiState.npc.side = getOpponentPlayer(humanSide);
    uiState.npc.bulkSelfPlay = false;
    uiState.npc.strategyByPlayer = createSelfPlayStrategyMap({
      p1Strategy: "attack",
      p2Strategy: "defense"
    });
    applyNpcStrengthSettings(npcStrength);
    resetNpcThinkMetrics();
    uiState.ruleMode = modeOverride || startOptions.ruleMode || uiState.ruleMode || (els.onlineModeSelect ? els.onlineModeSelect.value : "original");
    uiState.timeControl = DEFAULT_TIME_CONTROL;
    uiState.initialStandbyRule = getSelectedInitialStandbyRule("local");
    saveInitialStandbyRule(uiState.initialStandbyRule);
    uiState.startSidePreference = startSidePreference;
    uiState.localViewerSide = humanSide;
    uiState.compareSourceMode = "mainline";
    uiState.compareSiblingRoomId = null;
    uiState.state = createGame(uiState.ruleMode, uiState.timeControl, {
      initialStandbyRule: uiState.initialStandbyRule
    });
    uiState.replayIndex = uiState.state.history.length - 1;
    clearSelection();
    saveLatestReplayArchive(uiState.state);
    pushLog("NPC \u5BFE\u6226\u3092\u958B\u59CB (" + (humanSide === "P1" ? "\u3042\u306A\u305F\u304C\u5148\u624B" : "\u3042\u306A\u305F\u304C\u5F8C\u624B") + ")");
    uiState.screen = "game";
    resetBoardCameraView();
    render();
    startClockForCurrentTurn(uiState.state);
    renderClockDisplay();
    syncClockTicker();
    if (isNpcTurn() && !uiState.state.winner) {
      scheduleNpcTurn();
    }
  }

  function snapshotGameState(state) {
    var snapshot = cloneGameState(state);
    snapshot.history = [];
    pauseClockForSnapshot(snapshot);
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
    if (uiState.replayOnly && uiState.replayArchive && uiState.replayArchive.history) {
      return uiState.replayArchive.history;
    }
    if (isOnlineReviewMode()) {
      return getOnlineReviewHistory();
    }
    return uiState.state && uiState.state.history ? uiState.state.history : [];
  }

  function canUseWait() {
    return !isInitialStandbyPhase(uiState.state) && !uiState.pendingFragmentPiece && !uiState.selection && !uiState.state.winner && getHistoryEntries().length > 1;
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
    startClockForCurrentTurn(uiState.state);
    uiState.replayIndex = -1;
    clearSelection();
    saveLatestReplayArchive(uiState.state);
    render();
    if (isNpcTurn() && !uiState.state.winner) {
      scheduleNpcTurn();
    }
    return true;
  }

  function syncOnlineRoomState(room) {
    var finalState = room && room.gameState ? cloneGameState(room.gameState) : null;
    uiState.online.room = room;
    uiState.online.version = room.version;
    uiState.online.roomStatus = room.status || uiState.online.roomStatus;
    uiState.online.roomType = room.roomType || "match";
    uiState.online.studyKind = room.studyKind || (uiState.online.roomType === "study" ? "review" : "match");
    uiState.online.side = resolveRoomSide(room, uiState.online.playerId) || uiState.online.side;
    uiState.online.roomName = room.name || uiState.online.roomName;
    uiState.online.waitRequest = room.waitRequest || null;
    uiState.online.reviewNotes = room.reviewNotes || {};
    uiState.online.reviewArrows = room.reviewArrows || {};
    uiState.ruleMode = room.gameState.ruleMode || uiState.ruleMode;
    uiState.timeControl = room.gameState.clock && room.gameState.clock.timeControl
      ? room.gameState.clock.timeControl
      : uiState.timeControl;
    uiState.online.finalState = ((uiState.online.roomType === "study" && uiState.online.studyKind !== "branch") || (finalState && finalState.winner))
      ? finalState
      : null;
    uiState.online.reviewIndex = uiState.online.finalState ? getOnlineReviewIndex(room) : -1;
    uiState.reviewArrowAnchor = null;
    if (!uiState.online.finalState || isSpectatorMode()) {
      setReviewArrowMode(false);
    }
    uiState.state = uiState.online.finalState ? buildOnlineReviewDisplayState(room) : room.gameState;
    ensurePlayerStateContainers(uiState.state, "P1");
    ensurePlayerStateContainers(uiState.state, "P2");
    uiState.initialStandbyRule = getInitialStandbyRule(uiState.state);
    ensureClockState(uiState.state);
    if (!uiState.online.finalState && uiState.online.roomStatus === "playing" && isClockEnabled(uiState.state.clock) && !uiState.state.clock.activeSince) {
      startClockForCurrentTurn(uiState.state);
    }
    uiState.replayIndex = uiState.online.finalState
      ? uiState.online.reviewIndex
      : (uiState.state.history ? uiState.state.history.length - 1 : -1);
    if (uiState.online.finalState && (uiState.online.roomType === "study" || uiState.online.finalState.winner)) {
      upsertReplayLibraryArchive(buildReplayArchiveFromOnlineRoom(room), uiState.online.roomType === "study" ? "study-room" : "online-finished");
    }
  }

  function requestOnlineReviewIndex(index) {
    var history = getOnlineReviewHistory();
    var nextIndex;
    if (!canControlOnlineReview() || !history.length || uiState.online.syncing) {
      return Promise.resolve(false);
    }
    nextIndex = Math.max(0, Math.min(history.length - 1, index));
    if (nextIndex === uiState.online.reviewIndex) {
      return Promise.resolve(false);
    }
    uiState.reviewArrowAnchor = null;
    uiState.online.syncing = true;
    return apiRequest(buildApiUrl("room.review", uiState.online.roomId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerId: uiState.online.playerId,
        index: nextIndex
      })
    }).then(function (data) {
      syncOnlineRoomState(data.room);
      clearSelection();
      render();
      return true;
    }).catch(function (error) {
      if (els.testOutput) {
        els.testOutput.textContent = "REVIEW ERROR\n" + error.message;
      }
      return false;
    }).finally(function () {
      uiState.online.syncing = false;
    });
  }

  function applyOnlineRoom(room, playerId, side, options) {
    stopRoomPolling();
    clearReplayViewerState();
    resetNpcState();
    uiState.practiceMode = false;
    var previousScreen = uiState.screen;
    var previousRoomStatus = uiState.online.roomStatus;
    var role = options && options.role === "spectator" ? "spectator" : "player";
    var resolvedSide = resolveRoomSide(room, playerId) || side || null;
    uiState.online.enabled = true;
    uiState.online.roomId = room.id;
    uiState.online.roomName = room.name || null;
    uiState.online.playerId = role === "spectator" ? null : playerId;
    uiState.online.viewerId = role === "spectator" ? ((options && options.viewerId) || null) : null;
    uiState.online.role = role;
    uiState.online.side = role === "spectator" ? null : resolvedSide;
    uiState.branchRoomsExpanded = false;
    uiState.compareSourceMode = "mainline";
    uiState.compareSiblingRoomId = null;
    syncOnlineRoomState(room);
    uiState.practiceMode = false;
    uiState.screen = "game";
    if (previousScreen !== "game" || (previousRoomStatus !== "playing" && uiState.online.roomStatus === "playing")) {
      resetBoardCameraView();
    }
    saveOnlineSession();
    clearSelection();
    scheduleRoomPolling();
    render();
    refreshRoomList({ silent: true });
  }

  function resetOnlineState(message) {
    stopRoomPolling();
    clearReplayViewerState();
    resetNpcState();
    uiState.online.enabled = false;
    uiState.online.roomId = null;
    uiState.online.roomName = null;
    uiState.online.playerId = null;
    uiState.online.viewerId = null;
    uiState.online.side = null;
    uiState.online.role = "player";
    uiState.online.room = null;
    uiState.online.finalState = null;
    uiState.online.reviewIndex = -1;
    uiState.online.roomType = "match";
    uiState.online.studyKind = "match";
    uiState.online.reviewNotes = {};
    uiState.online.reviewArrows = {};
    uiState.online.roomStatus = "offline";
    uiState.online.waitRequest = null;
    uiState.online.version = 0;
    uiState.online.syncing = false;
    uiState.branchRoomsExpanded = false;
    uiState.compareSourceMode = "mainline";
    uiState.compareSiblingRoomId = null;
    setReviewArrowMode(false);
    clearOnlineSession();
    uiState.screen = "lobby";
    uiState.practiceMode = false;
    applyInitialLobbyRoute();
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
    return apiRequest(
      buildApiUrl("room.get", uiState.online.roomId)
      + (uiState.online.playerId ? ("&playerId=" + encodeURIComponent(uiState.online.playerId)) : "")
      + (uiState.online.viewerId ? ("&viewerId=" + encodeURIComponent(uiState.online.viewerId)) : ""),
      {
      method: "GET"
    }).then(function (data) {
      syncOnlineRoomState(data.room);
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
      syncOnlineRoomState(data.room);
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
    var timeControl = getSelectedTimeControl();
    var initialStandbyRule = getSelectedInitialStandbyRule("online");
    var localState = createGame(mode, timeControl, {
      initialStandbyRule: initialStandbyRule
    });
    var roomName = getOnlineRoomName();
    var password = getCreateRoomPassword();
    uiState.ruleMode = mode;
    uiState.timeControl = timeControl;
    uiState.initialStandbyRule = initialStandbyRule;
    saveInitialStandbyRule(uiState.initialStandbyRule);
    return apiRequest(buildApiUrl("room.create"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: getOnlinePlayerName(),
        roomName: roomName,
        password: password,
        visibility: getCreateRoomVisibility(),
        ruleMode: mode,
        timeControl: timeControl,
        initialStandbyRule: initialStandbyRule,
        roomType: "match",
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
    var password = typeof passwordOverride === "string" ? passwordOverride : getJoinRoomPassword();
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
      var roomLabel = data.room.roomType === "study"
        ? (data.room.studyKind === "branch" ? "分岐検討室" : "検討室")
        : "オンライン対戦の部屋";
      applyOnlineRoom(data.room, data.playerId, data.side);
      pushLog(roomLabel + " " + data.room.id + " に参加");
      setLobbyNotice("");
      if (els.testOutput) {
        els.testOutput.textContent = (data.room.roomType === "study"
          ? (data.room.studyKind === "branch" ? "BRANCH ROOM JOINED" : "STUDY ROOM JOINED")
          : "ROOM JOINED") + "\n参加コード: " + data.room.id;
      }
    }).catch(function (error) {
      if (els.testOutput) {
        els.testOutput.textContent = "ROOM ERROR\n" + error.message;
      }
    });
  }

  function spectateOnlineRoom(roomIdOverride, passwordOverride) {
    var roomId = roomIdOverride || (els.onlineRoomInput ? els.onlineRoomInput.value.trim().toUpperCase() : "");
    var password = typeof passwordOverride === "string" ? passwordOverride : getJoinRoomPassword();
    if (!roomId) {
      if (els.testOutput) {
        els.testOutput.textContent = "ROOM ERROR\n参加コードを入力してください。";
      }
      return Promise.resolve();
    }
    return apiRequest(buildApiUrl("room.spectate"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: roomId,
        name: getOnlinePlayerName(),
        password: password
      })
    }).then(function (data) {
      applyOnlineRoom(data.room, null, null, {
        role: "spectator",
        viewerId: data.viewerId
      });
      pushLog("観戦として部屋 " + data.room.id + " を表示");
      setLobbyNotice("");
      if (els.testOutput) {
        els.testOutput.textContent = "SPECTATING\n参加コード: " + data.room.id;
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
    if (!session || !session.roomId || (!session.playerId && !session.viewerId)) {
      return Promise.resolve(false);
    }
    if (els.onlineNameInput && session.playerName && !els.onlineNameInput.value.trim()) {
      els.onlineNameInput.value = session.playerName;
    }
    return apiRequest(
      buildApiUrl("room.get", session.roomId)
      + (session.playerId ? ("&playerId=" + encodeURIComponent(session.playerId)) : "")
      + (session.viewerId ? ("&viewerId=" + encodeURIComponent(session.viewerId)) : ""),
      {
      method: "GET"
    }).then(function (data) {
      applyOnlineRoom(data.room, session.playerId || null, resolveRoomSide(data.room, session.playerId), {
        role: session.role === "spectator" ? "spectator" : "player",
        viewerId: session.viewerId || null
      });
      pushLog("オンライン対戦の部屋 " + data.room.id + " に再接続");
      if (els.testOutput) {
        els.testOutput.textContent = (session.role === "spectator" ? "SPECTATE RESTORED" : "ROOM RESTORED") + "\n参加コード: " + data.room.id;
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
        playerId: uiState.online.playerId,
        viewerId: uiState.online.viewerId
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

  function syncPieceNotationControl() {
    if (els.pieceNotationSelect) {
      els.pieceNotationSelect.value = getPieceNotationMode();
    }
  }

  function syncBoardDisplayModeControl() {
    if (els.boardDisplaySelect) {
      els.boardDisplaySelect.value = isValidBoardDisplayMode(uiState.boardDisplayMode)
        ? uiState.boardDisplayMode
        : BOARD_DISPLAY_DEFAULT;
    }
  }

  function applyBoardDisplayModeClass() {
    var mode = isValidBoardDisplayMode(uiState.boardDisplayMode)
      ? uiState.boardDisplayMode
      : BOARD_DISPLAY_DEFAULT;
    document.body.classList.toggle("board-display-2d", mode === "2d");
    document.body.classList.toggle("board-display-3d", mode !== "2d");
  }

  function installPieceNotationControl() {
    var container = document.querySelector(".board-display-menu .board-tool-buttons");
    var label;
    var select;
    var boardLabel;
    var boardSelect;
    if (!container) {
      return;
    }
    select = document.getElementById("pieceNotationSelect");
    if (!select) {
      label = document.createElement("label");
      label.className = "piece-notation-control";
      label.setAttribute("for", "pieceNotationSelect");
      label.innerHTML = "<span>\u99D2\u8868\u8A18</span>";
      select = document.createElement("select");
      select.id = "pieceNotationSelect";
      PIECE_NOTATION_OPTIONS.forEach(function (option) {
        var optionEl = document.createElement("option");
        optionEl.value = option.value;
        optionEl.textContent = option.label;
        select.appendChild(optionEl);
      });
      label.appendChild(select);
      container.insertBefore(label, container.firstChild);
    }
    els.pieceNotationSelect = select;
    syncPieceNotationControl();
    if (!select.dataset.boundPieceNotation) {
      select.dataset.boundPieceNotation = "1";
      select.addEventListener("change", function () {
        uiState.pieceNotation = isValidPieceNotation(select.value) ? select.value : PIECE_NOTATION_DEFAULT;
        savePieceNotation(uiState.pieceNotation);
        render();
      });
    }
    boardSelect = document.getElementById("boardDisplaySelect");
    if (!boardSelect) {
      boardLabel = document.createElement("label");
      boardLabel.className = "board-display-control";
      boardLabel.setAttribute("for", "boardDisplaySelect");
      boardLabel.innerHTML = "<span>\u76E4\u9762\u8868\u793A</span>";
      boardSelect = document.createElement("select");
      boardSelect.id = "boardDisplaySelect";
      BOARD_DISPLAY_OPTIONS.forEach(function (option) {
        var optionEl = document.createElement("option");
        optionEl.value = option.value;
        optionEl.textContent = option.label;
        boardSelect.appendChild(optionEl);
      });
      boardLabel.appendChild(boardSelect);
      container.insertBefore(boardLabel, select && select.parentElement ? select.parentElement.nextSibling : container.firstChild);
    }
    els.boardDisplaySelect = boardSelect;
    syncBoardDisplayModeControl();
    if (!boardSelect.dataset.boundBoardDisplay) {
      boardSelect.dataset.boundBoardDisplay = "1";
      boardSelect.addEventListener("change", function () {
        uiState.boardDisplayMode = isValidBoardDisplayMode(boardSelect.value) ? boardSelect.value : BOARD_DISPLAY_DEFAULT;
        saveBoardDisplayMode(uiState.boardDisplayMode);
        render();
      });
    }
  }

  function init() {
    uiState.state = createGame(uiState.ruleMode);
    uiState.replayIndex = uiState.state.history.length - 1;
    uiState.roomAdminKeys = loadRoomAdminKeys();
    restoreStoredOnlineName();
    setupSimpleGameLayout();
    setupSimpleLobbyLayout();
    installPieceNotationControl();
    applyInitialLobbyRoute();
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
        clearReplayViewerState();
        resetNpcState();
        uiState.practiceMode = false;
        uiState.tsumeMode = false;
        uiState.screen = "lobby";
        applyInitialLobbyRoute();
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
          openNpcRestartDialog();
        } else if (uiState.tsumeMode) {
          startTsumeTraining();
        } else {
          startPracticeGame();
        }
      });
    }

    if (els.winnerRestartBtn) {
      els.winnerRestartBtn.addEventListener("click", function () {
        if (isNpcGame()) {
          openNpcRestartDialog();
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
        } else if (uiState.tsumeMode) {
          startTsumeTraining();
          pushLog("詰将棋の駒モードを " + GAME_MODE_LABELS[uiState.ruleMode] + " に変更");
        } else {
          startPracticeGame();
          pushLog("ひとりテストプレイの駒モードを " + GAME_MODE_LABELS[uiState.ruleMode] + " に変更");
        }
        render();
      });
    }

    if (els.replayExportBtn) {
      els.replayExportBtn.addEventListener("click", function () {
        exportCurrentReplayArchive();
      });
    }

    if (els.replayImportBtn) {
      els.replayImportBtn.addEventListener("click", function () {
        triggerReplayImport();
      });
    }

    if (els.replayReviewBtn) {
      els.replayReviewBtn.addEventListener("click", function () {
        startPracticeFromReplayPosition();
      });
    }

    if (els.replayStudyBtn) {
      els.replayStudyBtn.addEventListener("click", function () {
        createStudyRoomFromCurrentReplay();
      });
    }

    if (els.editorLaunchBtn) {
      els.editorLaunchBtn.addEventListener("click", function () {
        openBoardEditor(uiState.replayOnly ? cloneGameState(uiState.state) : uiState.state);
      });
    }

    if (els.replayFileInput) {
      els.replayFileInput.addEventListener("change", handleReplayFileSelected);
    }

    if (els.analysisMetaSaveBtn) {
      els.analysisMetaSaveBtn.addEventListener("click", function () {
        saveAnalysisMeta();
      });
    }

    if (els.reviewNoteSaveBtn) {
      els.reviewNoteSaveBtn.addEventListener("click", function () {
        saveOnlineReviewNote();
      });
    }

    if (els.reviewArrowModeBtn) {
      els.reviewArrowModeBtn.addEventListener("click", function () {
        setReviewArrowMode(!uiState.reviewArrowMode);
        render();
      });
    }

    if (els.reviewArrowClearBtn) {
      els.reviewArrowClearBtn.addEventListener("click", function () {
        uiState.reviewArrowAnchor = null;
        saveOnlineReviewArrows([]);
      });
    }

    if (els.branchRoomsRefreshBtn) {
      els.branchRoomsRefreshBtn.addEventListener("click", function () {
        refreshRoomList({ silent: true });
      });
    }

    if (els.branchRoomsToggleBtn) {
      els.branchRoomsToggleBtn.addEventListener("click", function () {
        uiState.branchRoomsExpanded = !uiState.branchRoomsExpanded;
        renderBranchRoomsPanel();
      });
    }

    if (els.editorOwnerSelect) {
      els.editorOwnerSelect.addEventListener("change", function () {
        uiState.boardEditor.owner = els.editorOwnerSelect.value || "P1";
      });
    }
    if (els.editorPieceSelect) {
      els.editorPieceSelect.addEventListener("change", function () {
        uiState.boardEditor.pieceType = els.editorPieceSelect.value || "king";
      });
    }
    if (els.editorPaintSelect) {
      els.editorPaintSelect.addEventListener("change", function () {
        uiState.boardEditor.paint = els.editorPaintSelect.value || "piece";
      });
    }
    if (els.editorCurrentPlayerSelect) {
      els.editorCurrentPlayerSelect.addEventListener("change", function () {
        uiState.boardEditor.currentPlayer = els.editorCurrentPlayerSelect.value || "P1";
        if (uiState.boardEditor.working) {
          uiState.boardEditor.working.currentPlayer = uiState.boardEditor.currentPlayer;
        }
      });
    }
    if (els.editorUseCurrentBtn) {
      els.editorUseCurrentBtn.addEventListener("click", function () {
        uiState.boardEditor.working = createBoardEditorWorkingState(uiState.state);
        uiState.boardEditor.currentPlayer = uiState.boardEditor.working.currentPlayer || "P1";
        renderBoardEditor();
      });
    }
    if (els.editorUseBlankBtn) {
      els.editorUseBlankBtn.addEventListener("click", function () {
        uiState.boardEditor.working = createEditorBaseState(uiState.ruleMode || "original");
        uiState.boardEditor.currentPlayer = "P1";
        renderBoardEditor();
      });
    }
    if (els.editorCloseBtn) {
      els.editorCloseBtn.addEventListener("click", function () {
        closeBoardEditor();
      });
    }
    if (els.editorStartPracticeBtn) {
      els.editorStartPracticeBtn.addEventListener("click", function () {
        startPracticeFromEditor();
      });
    }
    if (els.editorCreateStudyBtn) {
      els.editorCreateStudyBtn.addEventListener("click", function () {
        createStudyRoomFromEditor();
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
          uiState.timeControl = getSelectedTimeControl();
          uiState.state = createGame(uiState.ruleMode, uiState.timeControl);
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
        if (uiState.replayOnly) {
          applyReplayHistoryIndex(uiState.replayIndex - 1);
          return;
        }
        if (isOnlineReviewMode()) {
          if (!canControlOnlineReview()) {
            return;
          }
          requestOnlineReviewIndex(uiState.replayIndex - 1);
          return;
        }
        uiState.replayIndex = Math.max(0, uiState.replayIndex - 1);
        renderHistoryPanel();
      });
    }
    if (els.historyNextBtn) {
      els.historyNextBtn.addEventListener("click", function () {
        if (uiState.replayOnly) {
          applyReplayHistoryIndex(uiState.replayIndex + 1);
          return;
        }
        if (isOnlineReviewMode()) {
          if (!canControlOnlineReview()) {
            return;
          }
          requestOnlineReviewIndex(uiState.replayIndex + 1);
          return;
        }
        uiState.replayIndex = Math.min(getHistoryEntries().length - 1, uiState.replayIndex + 1);
        renderHistoryPanel();
      });
    }

    els.contextCancelBtn.addEventListener("click", function () {
      if (uiState.pendingFragmentPiece) {
        hideContextMenu();
        return;
      }
      clearSelection();
      render();
    });

    els.contextRotateBtn.addEventListener("click", function () {
      rotateSelectedFragment();
    });

    document.addEventListener("keydown", handleGlobalKeyDown);

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

    window.UNFOLD_NPC_ENGINE = {
      chooseActionForState: chooseNpcActionForExternalState,
      runNpcSelfPlayBatch: runNpcSelfPlayBatch,
      runNpcTacticalScenarioSuite: runNpcTacticalScenarioSuite,
      findMoveGenerationMismatches: findMoveGenerationMismatches,
      applyNpcBookOverrides: applyNpcBookOverrides,
      importNpcSearchMemory: function (snapshot) {
        return importNpcSearchMemorySnapshot(snapshot, {
          maxEntries: NPC_PERSISTENT_TT_MAX_ENTRIES,
          markDirty: false
        });
      },
      exportNpcSearchMemory: function (options) {
        return exportNpcSearchMemorySnapshot(options || {});
      },
      getNpcBookStatus: function () {
        return npcBookStatus;
      },
      loadWasmEngine: function () {
        return loadUnfoldWasmEngine();
      },
      getWasmStatus: function () {
        return getUnfoldWasmStatus();
      }
    };
    if (window.__UNFOLD_NPC_WORKER__) {
      window.__UNFOLD_BOOTED = true;
      return;
    }
    loadUnfoldWasmEngine();
    loadNpcBookOverrides();
    if (runOpeningRescueSearchFromQueryIfRequested() || runTacticalScenarioFromQueryIfRequested() || runSelfPlayFromQueryIfRequested()) {
      window.__UNFOLD_BOOTED = true;
      document.documentElement.classList.remove("unfold-booting");
      return;
    }
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
      getViewerSide: getBoardViewerSide,
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
      hasPendingFragmentPiece: function () {
        return !!uiState.pendingFragmentPiece;
      },
      render: render,
      getAiDebugOverlay: function () {
        return uiState.aiDebug ? uiState.aiDebug.overlay : null;
      },
      getCompareOverlay: function () {
        return uiState.compareOverlay || null;
      }
    };
    if (isDiagnosticsUiEnabled()) {
      window.UNFOLD_DEV_API = {
        runNpcSelfPlayBatch: runNpcSelfPlayBatch,
        runNpcTacticalScenarioSuite: runNpcTacticalScenarioSuite,
        chooseActionForState: chooseNpcActionForExternalState,
        findMoveGenerationMismatches: findMoveGenerationMismatches,
        applyNpcBookOverrides: applyNpcBookOverrides,
        importNpcSearchMemory: function (snapshot) {
          return importNpcSearchMemorySnapshot(snapshot, {
            maxEntries: NPC_PERSISTENT_TT_MAX_ENTRIES,
            markDirty: false
          });
        },
        exportNpcSearchMemory: function (options) {
          return exportNpcSearchMemorySnapshot(options || {});
        },
        getNpcBookStatus: function () {
          return npcBookStatus;
        },
        getWasmStatus: function () {
          return getUnfoldWasmStatus();
        }
      };
    }
    window.UNFOLD_REVIEW_OVERLAY_SYNC = renderReviewArrowOverlay;
    render();
    window.__UNFOLD_BOOTED = true;
    document.documentElement.classList.remove("unfold-booting");
  }

  try {
    init();
  } catch (error) {
    document.documentElement.classList.remove("unfold-booting");
    els.messageLabel.textContent = "\u521D\u671F\u5316\u30A8\u30E9\u30FC: " + error.message;
    els.testOutput.textContent = "INIT ERROR\n" + (error.stack || error.message);
  }
})();
