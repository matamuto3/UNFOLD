(function () {
  var PLAYER_LABELS = { P1: "\u5148\u624b", P2: "\u5f8c\u624b" };
  var PIECE_LABELS = { king: "\u738b", soldier: "\u5175", lancer: "\u69cd" };
  var MOVEMENT_RULES = {
    king: {
      kind: "step",
      vectors: [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]],
      summary: "\u738b: 1\u30DE\u30B9\u5168\u65B9\u5411\u3002\u79FB\u52D5\u5148\u306B\u5C55\u958B\u56F3\u30DE\u30B9\u304C\u5FC5\u8981\u3067\u3059\u3002"
    },
    soldier: {
      kind: "step",
      vectors: [[-1, 0], [1, 0], [0, -1], [0, 1]],
      summary: "\u5175: 1\u30DE\u30B9\u4E0A\u4E0B\u5DE6\u53F3\u3002\u79FB\u52D5\u5148\u306B\u5C55\u958B\u56F3\u30DE\u30B9\u304C\u5FC5\u8981\u3067\u3059\u3002"
    },
    lancer: {
      kind: "ray",
      vectors: [[-1, 0], [1, 0], [0, -1], [0, 1]],
      summary: "\u69CD: \u4E0A\u4E0B\u5DE6\u53F3\u306B\u76F4\u9032\u3002\u9014\u4E2D\u3068\u7740\u5730\u70B9\u304C\u9023\u7D9A\u3057\u305F\u5C55\u958B\u56F3\u4E0A\u306B\u3042\u308B\u3068\u304D\u3060\u3051\u79FB\u52D5\u3067\u304D\u307E\u3059\u3002"
    },
    knightSample: {
      kind: "jump",
      vectors: [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]],
      summary: "\u6842\u99AC\u4F8B: \u8DF3\u8E8D\u79FB\u52D5\u3002\u9014\u4E2D\u306E\u5C55\u958B\u56F3\u304C\u5207\u308C\u3066\u3044\u3066\u3082\u3001\u7740\u5730\u70B9\u306B\u5C55\u958B\u56F3\u30DE\u30B9\u304C\u3042\u308C\u3070\u79FB\u52D5\u3067\u304D\u307E\u3059\u3002"
    }
  };
  var FRAGMENT_LIBRARY = {
    net01: { label: "\u5C55\u958B\u56F31", cells: [[0, 0], [1, 0], [1, 1], [1, 2], [1, 3], [2, 0]] },
    net02: { label: "\u5C55\u958B\u56F32", cells: [[0, 1], [1, 0], [1, 1], [1, 2], [1, 3], [2, 0]] },
    net03: { label: "\u5C55\u958B\u56F33", cells: [[0, 2], [1, 0], [1, 1], [1, 2], [1, 3], [2, 0]] },
    net04: { label: "\u5C55\u958B\u56F34", cells: [[0, 3], [1, 0], [1, 1], [1, 2], [1, 3], [2, 0]] },
    net05: { label: "\u5C55\u958B\u56F35", cells: [[0, 2], [1, 0], [1, 1], [1, 2], [1, 3], [2, 1]] },
    net06: { label: "\u5C55\u958B\u56F36", cells: [[0, 1], [1, 0], [1, 1], [1, 2], [1, 3], [2, 1]] },
    net07: { label: "\u5C55\u958B\u56F37", cells: [[0, 1], [1, 1], [1, 2], [1, 3], [2, 0], [2, 1]] },
    net08: { label: "\u5C55\u958B\u56F38", cells: [[0, 2], [1, 1], [1, 2], [1, 3], [2, 0], [2, 1]] },
    net09: { label: "\u5C55\u958B\u56F39", cells: [[0, 2], [0, 3], [1, 0], [1, 1], [1, 2], [2, 0]] },
    net10: { label: "\u5C55\u958B\u56F310", cells: [[0, 2], [0, 3], [1, 1], [1, 2], [2, 0], [2, 1]] },
    net11: { label: "\u5C55\u958B\u56F311", cells: [[0, 2], [0, 3], [0, 4], [1, 0], [1, 1], [1, 2]] }
  };
  var STARTER_DECK = [
    { fragmentType: "net01", pieceType: "soldier" },
    { fragmentType: "net02", pieceType: "soldier" },
    { fragmentType: "net03", pieceType: "lancer" },
    { fragmentType: "net04", pieceType: "soldier" },
    { fragmentType: "net05", pieceType: "lancer" },
    { fragmentType: "net06", pieceType: "soldier" },
    { fragmentType: "net07", pieceType: "soldier" },
    { fragmentType: "net08", pieceType: "lancer" },
    { fragmentType: "net09", pieceType: "soldier" },
    { fragmentType: "net10", pieceType: "lancer" },
    { fragmentType: "net11", pieceType: "soldier" }
  ];
  var BOARD_ROWS = 9;
  var BOARD_COLS = 15;
  var HAND_LIMIT = 3;

  var els = {
    board: document.getElementById("board"),
    turnLabel: document.getElementById("turnLabel"),
    modeLabel: document.getElementById("modeLabel"),
    winnerLabel: document.getElementById("winnerLabel"),
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
    pendingPieceBanner: document.getElementById("pendingPieceBanner"),
    newGameBtn: document.getElementById("newGameBtn"),
    runTestsBtn: document.getElementById("runTestsBtn"),
    contextMenu: document.getElementById("contextMenu"),
    contextCancelBtn: document.getElementById("contextCancelBtn"),
    contextRotateBtn: document.getElementById("contextRotateBtn"),
    placementConfirm: document.getElementById("placementConfirm"),
    confirmText: document.getElementById("confirmText"),
    confirmPlaceBtn: document.getElementById("confirmPlaceBtn"),
    cancelPlaceBtn: document.getElementById("cancelPlaceBtn"),
    serializeBtn: document.getElementById("serializeBtn")
  };

  var uiState = {
    state: null,
    selection: null,
    pendingAnchor: null,
    rotation: 0,
    previewCells: [],
    previewLegal: false,
    moveTargets: [],
    contextMenuOpen: false,
    pendingPlacement: null,
    pendingFragmentPiece: null
  };

  function createGame() {
    var state = {
      board: [],
      currentPlayer: "P1",
      winner: null,
      winReason: null,
      turnNumber: 1,
      actionLog: [],
      players: {
        P1: createPlayer("P1"),
        P2: createPlayer("P2")
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
          stack: 0,
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
    addPiece(state, "P1", "soldier", 3, 2);
    addPiece(state, "P1", "lancer", 5, 2);
    addPiece(state, "P2", "soldier", 3, 12);
    addPiece(state, "P2", "lancer", 5, 12);
    fillHand(state, "P1");
    fillHand(state, "P2");

    return state;
  }

  function createPlayer(player) {
    return {
      pieces: {},
      reserve: { soldier: 1, lancer: 1 },
      hand: [],
      deck: shuffle(STARTER_DECK.slice())
    };
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
    renderMovementSummary();
    syncContextMenuState();
  }

  function renderStatus() {
    els.turnLabel.textContent = PLAYER_LABELS[uiState.state.currentPlayer];
    els.modeLabel.textContent = getModeText();
    els.winnerLabel.textContent = uiState.state.winner ? PLAYER_LABELS[uiState.state.winner] : "-";
    els.messageLabel.textContent = getMessageText();
  }

  function renderPendingPieceBanner() {
    if (!els.pendingPieceBanner) {
      return;
    }
    if (uiState.pendingFragmentPiece) {
      els.pendingPieceBanner.hidden = false;
      els.pendingPieceBanner.innerHTML =
        "<strong>\u6B21\u306B\u7F6E\u304F\u99D2</strong>" +
        "<span class=\"pending-piece-chip\">" + PIECE_LABELS[uiState.pendingFragmentPiece.pieceType] + "</span>" +
        "<span>\u4ECA\u7F6E\u3044\u305F\u6B20\u7247\u306E\u4E2D\u304B\u3089\u3001\u7F6E\u304D\u305F\u3044\u30DE\u30B9\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044\u3002</span>";
      return;
    }
    if (uiState.selection && uiState.selection.type === "fragment" && uiState.selection.card) {
      els.pendingPieceBanner.hidden = false;
      els.pendingPieceBanner.innerHTML =
        "<strong>\u3053\u306E\u6B20\u7247\u306E\u5BFE\u5FDC\u99D2</strong>" +
        "<span class=\"pending-piece-chip\">" + PIECE_LABELS[uiState.selection.card.pieceType] + "</span>" +
        "<span>\u6B20\u7247\u3092\u7F6E\u3044\u305F\u5F8C\u306B\u3001\u3053\u306E\u99D2\u306E\u7F6E\u304D\u5834\u3092\u9078\u3073\u307E\u3059\u3002</span>";
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
        stack.textContent = cell.stack > 0 ? "x" + cell.stack : "";
        button.appendChild(stack);

        if (cell.pieceId) {
          var piece = getPiece(uiState.state, cell.pieceId);
          var pieceEl = document.createElement("div");
          pieceEl.className = "piece " + piece.owner.toLowerCase();
          pieceEl.textContent = PIECE_LABELS[piece.kind];
          button.appendChild(pieceEl);

          var meta = document.createElement("span");
          meta.className = "meta";
          meta.textContent = PIECE_LABELS[piece.kind];
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

    Object.keys(playerState.reserve).forEach(function (pieceType) {
      var button = document.createElement("button");
      button.className = "choice-card reserve-card";
      if (uiState.selection && uiState.selection.type === "reserve" && uiState.selection.player === player && uiState.selection.pieceType === pieceType) {
        button.classList.add("active");
      }
      button.innerHTML = "<strong>" + PIECE_LABELS[pieceType] + "</strong><span>\u6301\u3061\u99D2</span><span class=\"choice-count\">x" + playerState.reserve[pieceType] + "</span>";
      button.disabled = player !== uiState.state.currentPlayer;
      button.addEventListener("click", function () {
        uiState.selection = { type: "reserve", player: player, pieceType: pieceType };
        uiState.pendingAnchor = null;
        uiState.previewCells = [];
        uiState.previewLegal = false;
        render();
      });
      reserveEl.appendChild(button);
    });

    playerState.hand.forEach(function (card, handIndex) {
      var button = document.createElement("button");
      button.className = "choice-card hand-card";
      if (uiState.selection && uiState.selection.type === "fragment" && uiState.selection.player === player && uiState.selection.handIndex === handIndex) {
        button.classList.add("active");
      }
      button.innerHTML = "<strong>" + FRAGMENT_LIBRARY[card.fragmentType].label + "</strong>" +
        "<span class=\"choice-subtitle\">\u5BFE\u5FDC\u99D2: " + PIECE_LABELS[card.pieceType] + "</span>" +
        "<span class=\"fragment-preview\">" + getFragmentPreviewText(card.fragmentType) + "</span>";
      button.disabled = player !== uiState.state.currentPlayer;
      button.addEventListener("click", function () {
        uiState.selection = { type: "fragment", player: player, handIndex: handIndex, card: card };
        uiState.pendingAnchor = null;
        uiState.previewCells = [];
        uiState.previewLegal = false;
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

  function renderMovementSummary() {
    if (!els.movementSummary) {
      return;
    }
    els.movementSummary.innerHTML = "";
    [
      { label: "\u738B", ruleKey: "king" },
      { label: "\u5175", ruleKey: "soldier" },
      { label: "\u69CD", ruleKey: "lancer" },
      { label: "\u6842\u99AC\u4F8B", ruleKey: "knightSample" }
    ].forEach(function (entry) {
      var item = document.createElement("div");
      item.className = "summary-item";
      item.innerHTML = "<strong>" + entry.label + "</strong><span>" + MOVEMENT_RULES[entry.ruleKey].summary + "</span>";
      els.movementSummary.appendChild(item);
    });
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
  }

  function openContextMenu(clientX, clientY) {
    if (!els.contextMenu || !els.board || !uiState.selection) {
      return;
    }
    var boardRect = els.board.getBoundingClientRect();
    var cardRect = els.board.closest(".board-card").getBoundingClientRect();
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
    if (!els.placementConfirm || !els.board) {
      return;
    }
    var cardRect = els.board.closest(".board-card").getBoundingClientRect();
    var left = Math.max(12, Math.min(clientX - cardRect.left, els.board.getBoundingClientRect().right - cardRect.left - 222));
    var top = Math.max(12, Math.min(clientY - cardRect.top, els.board.getBoundingClientRect().bottom - cardRect.top - 124));
    uiState.pendingPlacement = target;
    els.placementConfirm.style.left = left + "px";
    els.placementConfirm.style.top = top + "px";
    els.placementConfirm.hidden = false;
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
        button.classList.remove("selected", "anchor", "target", "preview-invalid", "move-target");
        if (uiState.selection && uiState.selection.type === "piece" && pieceMatchesCell(uiState.selection.pieceId, row, col)) {
          button.classList.add("selected");
        }
        if (isMoveTarget(row, col)) {
          button.classList.add("move-target");
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

  function makeCellHandler(row, col) {
    return function (event) {
      if (uiState.state.winner) {
        return;
      }

      var cell = uiState.state.board[row][col];
      var piece = cell.pieceId ? getPiece(uiState.state, cell.pieceId) : null;

      if (uiState.pendingFragmentPiece) {
        tryFragmentPieceDrop(row, col, event);
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
        render();
        return;
      }

      clearSelection();
      render();
    };
  }

  function makeCellHoverHandler(row, col) {
    return function () {
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
    var rule = MOVEMENT_RULES[piece.kind];
    var targetCell = getBoardCell(row, col);
    var targetPiece = targetCell && targetCell.pieceId ? getPiece(uiState.state, targetCell.pieceId) : null;
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

    if (rule.kind === "step" || rule.kind === "jump") {
      return matchesVector(rule.vectors, row - piece.row, col - piece.col);
    }

    if (rule.kind === "ray") {
      return canRayMove(piece, row, col, rule.vectors);
    }

    return false;
  }

  function canRayMove(piece, row, col, vectors) {
    for (var i = 0; i < vectors.length; i += 1) {
      var stepRow = vectors[i][0];
      var stepCol = vectors[i][1];
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

  function matchesVector(vectors, deltaRow, deltaCol) {
    for (var i = 0; i < vectors.length; i += 1) {
      if (vectors[i][0] === deltaRow && vectors[i][1] === deltaCol) {
        return true;
      }
    }
    return false;
  }

  function isTraversableCell(row, col) {
    var cell = getBoardCell(row, col);
    return !!cell && cell.controller !== null;
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
    pushLog(PLAYER_LABELS[uiState.state.currentPlayer] + "\u304C " + PIECE_LABELS[pieceType] + " \u3092 (" + (row + 1) + ", " + (col + 1) + ") \u306B\u914D\u7F6E");
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
    hidePlacementConfirm();

    for (var j = 0; j < cells.length; j += 1) {
      var cell = uiState.state.board[cells[j].row][cells[j].col];
      cell.controller = uiState.state.currentPlayer;
      cell.stack += 1;
    }

    uiState.state.players[uiState.state.currentPlayer].hand.splice(uiState.selection.handIndex, 1);
    fillHand(uiState.state, uiState.state.currentPlayer);
    uiState.pendingFragmentPiece = {
      pieceType: card.pieceType,
      cells: cells
    };
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
    if (!pending || !isPendingFragmentPieceCell(row, col)) {
      hidePlacementConfirm();
      return;
    }
    addPiece(uiState.state, uiState.state.currentPlayer, pending.pieceType, row, col);
    pushLog(PLAYER_LABELS[uiState.state.currentPlayer] + "\u304C " + PIECE_LABELS[pending.pieceType] + " \u3092 (" + (row + 1) + ", " + (col + 1) + ") \u306B\u914D\u7F6E");
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
    }
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
    return rows.join("<br>");
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
    clearSelection();
    render();
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
  }

  function getModeText() {
    if (!uiState.selection) {
      return "\u672A\u9078\u629E";
    }
    if (uiState.pendingFragmentPiece) {
      return "\u7D44\u307F\u5408\u308F\u305B\u99D2\u3092\u914D\u7F6E\u4E2D";
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
    if (uiState.state.winner) {
      return PLAYER_LABELS[uiState.state.winner] + "\u306E\u52DD\u3061\u3067\u3059\u3002";
    }
    if (uiState.pendingFragmentPiece) {
      return "\u4ECA\u7F6E\u3044\u305F\u6B20\u7247\u306E\u4E2D\u304B\u3089\u3001" + PIECE_LABELS[uiState.pendingFragmentPiece.pieceType] + "\u3092\u7F6E\u304F\u30DE\u30B9\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044\u3002";
    }
    if (!uiState.selection) {
      return "\u99D2\u3092\u52D5\u304B\u3059\u304B\u3001\u6301\u3061\u99D2\u3092\u6253\u3064\u304B\u3001\u624B\u672D\u306E\u6B20\u7247\u3092\u914D\u7F6E\u3057\u3066\u304F\u3060\u3055\u3044\u3002";
    }
    if (uiState.selection.type === "piece") {
      return "\u79FB\u52D5\u5148\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u3066\u304F\u3060\u3055\u3044\u3002\u901A\u5E38\u79FB\u52D5\u306F\u9023\u7D9A\u3057\u305F\u5C55\u958B\u56F3\u306E\u4E0A\u3060\u3051\u3067\u3059\u3002";
    }
    if (uiState.selection.type === "reserve") {
      return "\u81EA\u5206\u306E\u652F\u914D\u5730\u306E\u7A7A\u304D\u30DE\u30B9\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044\u3002";
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
    return "OK: \u65B0\u3057\u3044\u5BFE\u5C40\u3092\u59CB\u3081\u308B\nOK: \u76E4\u9762\u8868\u793A\nOK: \u6301\u3061\u99D2\u30FB\u624B\u672D\u8868\u793A\nOK: \u79FB\u52D5\u30EB\u30FC\u30EB\u306F\u5C55\u958B\u56F3\u4E0A\u3092\u524D\u63D0\u306B\u8868\u793A";
  }

  function init() {
    uiState.state = createGame();

    els.newGameBtn.addEventListener("click", function () {
      uiState.state = createGame();
      clearSelection();
      pushLog("\u65B0\u3057\u3044\u5BFE\u5C40\u3092\u59CB\u3081\u307E\u3057\u305F");
      render();
    });

    els.runTestsBtn.addEventListener("click", function () {
      els.testOutput.textContent = runTests();
    });

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

    els.board.addEventListener("contextmenu", function (event) {
      event.preventDefault();
      openContextMenu(event.clientX, event.clientY);
    });

    els.board.addEventListener("click", function () {
      hideContextMenu();
    });

    els.confirmPlaceBtn.addEventListener("click", function () {
      if (uiState.pendingPlacement) {
        if (uiState.pendingPlacement.type === "move") {
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
      if (
        els.placementConfirm &&
        !els.placementConfirm.hidden &&
        !(els.placementConfirm.contains(event.target)) &&
        !(els.board && els.board.contains(event.target))
      ) {
        hidePlacementConfirm();
      }
    });

    els.serializeBtn.addEventListener("click", function () {
      var text = JSON.stringify(uiState.state, null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        els.messageLabel.textContent = "\u72B6\u614BJSON\u3092\u30B3\u30D4\u30FC\u3057\u307E\u3057\u305F\u3002";
      } else {
        els.testOutput.textContent = text;
      }
    });

    els.testOutput.textContent = runTests();
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
