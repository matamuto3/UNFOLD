const PLAYER_LABELS = { P1: "\u5148\u624b", P2: "\u5f8c\u624b" };
const PIECE_LABELS = { king: "\u738b", soldier: "\u5175", lancer: "\u69cd" };
if (!window.THREE) {
  throw new Error("THREE_NOT_LOADED");
}
const PLAYER_SOFT = { P1: 0x6ea99a, P2: 0xc46f58, neutral: 0xb49c74 };
const FRAGMENT_LIBRARY = {
  net01: { label: "\u5c55\u958b\u56f31", cells: [[0,0],[1,0],[1,1],[1,2],[1,3],[2,0]] },
  net02: { label: "\u5c55\u958b\u56f32", cells: [[0,1],[1,0],[1,1],[1,2],[1,3],[2,0]] },
  net03: { label: "\u5c55\u958b\u56f33", cells: [[0,2],[1,0],[1,1],[1,2],[1,3],[2,0]] },
  net04: { label: "\u5c55\u958b\u56f34", cells: [[0,3],[1,0],[1,1],[1,2],[1,3],[2,0]] },
  net05: { label: "\u5c55\u958b\u56f35", cells: [[0,2],[1,0],[1,1],[1,2],[1,3],[2,1]] },
  net06: { label: "\u5c55\u958b\u56f36", cells: [[0,1],[1,0],[1,1],[1,2],[1,3],[2,1]] },
  net07: { label: "\u5c55\u958b\u56f37", cells: [[0,1],[1,1],[1,2],[1,3],[2,0],[2,1]] },
  net08: { label: "\u5c55\u958b\u56f38", cells: [[0,2],[1,1],[1,2],[1,3],[2,0],[2,1]] },
  net09: { label: "\u5c55\u958b\u56f39", cells: [[0,2],[0,3],[1,0],[1,1],[1,2],[2,0]] },
  net10: { label: "\u5c55\u958b\u56f310", cells: [[0,2],[0,3],[1,1],[1,2],[2,0],[2,1]] },
  net11: { label: "\u5c55\u958b\u56f311", cells: [[0,2],[0,3],[0,4],[1,0],[1,1],[1,2]] }
};
const STARTER_DECK = [
  { fragmentType: "net01", pieceType: "soldier" }, { fragmentType: "net02", pieceType: "soldier" },
  { fragmentType: "net03", pieceType: "lancer" }, { fragmentType: "net04", pieceType: "soldier" },
  { fragmentType: "net05", pieceType: "lancer" }, { fragmentType: "net06", pieceType: "soldier" },
  { fragmentType: "net07", pieceType: "soldier" }, { fragmentType: "net08", pieceType: "lancer" },
  { fragmentType: "net09", pieceType: "soldier" }, { fragmentType: "net10", pieceType: "lancer" },
  { fragmentType: "net11", pieceType: "soldier" }
];
const MOVE_RULES = {
  king: { kind: "step", vectors: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]], summary: "\u738b: 1\u30de\u30b9\u5168\u65b9\u5411" },
  soldier: { kind: "step", vectors: [[-1,0],[1,0],[0,-1],[0,1]], summary: "\u5175: 1\u30de\u30b9\u4e0a\u4e0b\u5de6\u53f3" },
  lancer: { kind: "ray", vectors: [[-1,0],[1,0],[0,-1],[0,1]], summary: "\u69cd: \u76f4\u9032\u3001\u9023\u7d9a\u3057\u305f\u5c55\u958b\u56f3\u306e\u4e0a\u3060\u3051" },
  knightSample: { kind: "jump", vectors: [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]], summary: "\u6842\u99ac\u4f8b: \u8df3\u8e8d\u3001\u7740\u5730\u70b9\u306b\u5c55\u958b\u56f3\u304c\u3042\u308c\u3070\u53ef" }
};
const BOARD_ROWS = 9;
const BOARD_COLS = 15;
const HAND_LIMIT = 3;
const CELL_SIZE = 1;
const BOARD_BASE_Y = -0.04;
const BASE_TILE_HEIGHT = 0.16;
const BASE_ZONE_HEIGHT = 0.18;
const FRAGMENT_LAYER_HEIGHT = 0.24;
const BASE_CENTER_BONUS = 0.06;

const els = {
  sceneViewport: document.getElementById("sceneViewport"),
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
  pendingPieceBanner: document.getElementById("pendingPieceBanner"),
  logList: document.getElementById("logList"),
  movementSummary: document.getElementById("movementSummary"),
  testOutput: document.getElementById("testOutput"),
  newGameBtn: document.getElementById("newGameBtn"),
  runTestsBtn: document.getElementById("runTestsBtn"),
  serializeBtn: document.getElementById("serializeBtn"),
  contextMenu: document.getElementById("contextMenu"),
  contextRotateBtn: document.getElementById("contextRotateBtn"),
  contextCancelBtn: document.getElementById("contextCancelBtn"),
  placementConfirm: document.getElementById("placementConfirm"),
  confirmText: document.getElementById("confirmText"),
  confirmPlaceBtn: document.getElementById("confirmPlaceBtn"),
  cancelPlaceBtn: document.getElementById("cancelPlaceBtn")
};

const ui = { state: null, selection: null, rotation: 0, previewCells: [], previewLegal: false, moveTargets: [], pendingPlacement: null, pendingFragmentPiece: null, hoverCell: null };
const sceneData = {
  scene: null, camera: null, renderer: null, raycaster: new THREE.Raycaster(), pointer: new THREE.Vector2(),
  cells: [], pickables: [], pieces: new Map(), markers: null, animations: [], pieceAnimations: new Map(),
  orbit: { yaw: 0, pitch: 0.9, distance: 15, dragging: false, lastX: 0, lastY: 0 }
};

function createPlayer() { return { pieces: {}, reserve: { soldier: 1, lancer: 1 }, hand: [], deck: shuffle(STARTER_DECK.slice()) }; }
function shuffle(list) { const a = list.slice(); for (let i = a.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function boardToWorld(row, col) { return { x: (col - (BOARD_COLS - 1) / 2) * CELL_SIZE, z: (row - (BOARD_ROWS - 1) / 2) * CELL_SIZE }; }
function inBounds(row, col) { return row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS; }
function getCell(row, col) { return inBounds(row, col) ? ui.state.board[row][col] : null; }
function getPiece(pieceId) { return ui.state.players.P1.pieces[pieceId] || ui.state.players.P2.pieces[pieceId] || null; }

function createGame() {
  const state = { board: [], currentPlayer: "P1", winner: null, winReason: null, turnNumber: 1, actionLog: [], players: { P1: createPlayer(), P2: createPlayer() } };
  for (let row = 0; row < BOARD_ROWS; row += 1) {
    const line = [];
    for (let col = 0; col < BOARD_COLS; col += 1) { line.push({ row, col, controller: null, pieceId: null, stack: 0, fragmentOwners: [], isBaseCenter: false, baseOwner: null, baseZoneOwner: null }); }
    state.board.push(line);
  }
  seedBase(state, "P1"); seedBase(state, "P2");
  addPiece(state, "P1", "king", 4, 1); addPiece(state, "P2", "king", 4, 13);
  addPiece(state, "P1", "soldier", 3, 2); addPiece(state, "P1", "lancer", 5, 2);
  addPiece(state, "P2", "soldier", 3, 12); addPiece(state, "P2", "lancer", 5, 12);
  fillHand(state, "P1"); fillHand(state, "P2");
  return state;
}

function seedBase(state, player) {
  const startRow = Math.floor((BOARD_ROWS - 3) / 2);
  const startCol = player === "P1" ? 0 : BOARD_COLS - 3;
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const cell = state.board[startRow + row][startCol + col];
      cell.controller = player;
      cell.baseZoneOwner = player;
      cell.isBaseCenter = row === 1 && col === 1;
      if (cell.isBaseCenter) { cell.baseOwner = player; }
    }
  }
}

function fillHand(state, player) { while (state.players[player].hand.length < HAND_LIMIT && state.players[player].deck.length > 0) { state.players[player].hand.push(state.players[player].deck.shift()); } }
function addPiece(state, owner, kind, row, col) { const id = `${owner}-${kind}-${Object.keys(state.players[owner].pieces).length + 1}`; state.players[owner].pieces[id] = { id, owner, kind, row, col }; state.board[row][col].pieceId = id; return id; }
function pushLog(text) { ui.state.actionLog.unshift(text); ui.state.actionLog = ui.state.actionLog.slice(0, 12); }
function clearSelection() { ui.selection = null; ui.rotation = 0; ui.previewCells = []; ui.previewLegal = false; ui.moveTargets = []; ui.pendingPlacement = null; ui.pendingFragmentPiece = null; hideContextMenu(); hidePlacementConfirm(); }

function initThree() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9e845f);
  const camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  els.sceneViewport.appendChild(renderer.domElement);
  scene.add(new THREE.AmbientLight(0xd8c2a1, 0.38));
  scene.add(new THREE.HemisphereLight(0xd9c3a0, 0x4a3726, 0.5));
  const dir = new THREE.DirectionalLight(0xf1dfc2, 0.52);
  dir.position.set(6, 10, 7);
  dir.castShadow = true;
  scene.add(dir);
  const ground = new THREE.Mesh(new THREE.CylinderGeometry(18, 18, 0.8, 48), new THREE.MeshStandardMaterial({ color: 0x7e6545, roughness: 0.98 }));
  ground.position.y = -0.65;
  ground.receiveShadow = true;
  scene.add(ground);
  sceneData.scene = scene;
  sceneData.camera = camera;
  sceneData.renderer = renderer;
  sceneData.markers = new THREE.Group();
  scene.add(sceneData.markers);
  buildCells();
  updateCameraPosition();
  resizeRenderer();
  window.addEventListener("resize", resizeRenderer);
  renderer.domElement.addEventListener("pointermove", onPointerMove);
  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointermove", onPointerDrag);
  renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
  renderer.domElement.addEventListener("click", onSceneClick);
  renderer.domElement.addEventListener("contextmenu", onSceneContextMenu);
  animate();
}

function buildCells() {
  for (let row = 0; row < BOARD_ROWS; row += 1) {
    const rowMeshes = [];
    for (let col = 0; col < BOARD_COLS; col += 1) {
      const group = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.94, BASE_TILE_HEIGHT, 0.94), new THREE.MeshStandardMaterial({ color: PLAYER_SOFT.neutral, roughness: 0.85 }));
      base.userData = { row, col };
      base.castShadow = true;
      base.receiveShadow = true;
      group.add(base);
      sceneData.scene.add(group);
      sceneData.pickables.push(base);
      rowMeshes.push({ group, base, layers: [] });
    }
    sceneData.cells.push(rowMeshes);
  }
}

function resizeRenderer() {
  const rect = els.sceneViewport.getBoundingClientRect();
  sceneData.renderer.setSize(rect.width, rect.height);
  sceneData.camera.aspect = rect.width / rect.height;
  sceneData.camera.updateProjectionMatrix();
}

function animate() {
  requestAnimationFrame(animate);
  updateAnimations(performance.now());
  sceneData.renderer.render(sceneData.scene, sceneData.camera);
}

function render() {
  renderStatus();
  renderBanner();
  renderSide("P1", els.p1Reserve, els.p1Hand, els.p1DeckCount);
  renderSide("P2", els.p2Reserve, els.p2Hand, els.p2DeckCount);
  renderLog();
  renderSummary();
  renderBoard3D();
}

function renderStatus() {
  els.turnLabel.textContent = PLAYER_LABELS[ui.state.currentPlayer];
  els.modeLabel.textContent = getModeText();
  els.winnerLabel.textContent = ui.state.winner ? `${PLAYER_LABELS[ui.state.winner]} (${ui.state.winReason || "-"})` : "-";
  els.messageLabel.textContent = getMessageText();
}

function renderBanner() {
  if (ui.selection && ui.selection.type === "fragmentAnimation") {
    els.pendingPieceBanner.hidden = false;
    els.pendingPieceBanner.innerHTML = `<strong>\u5c55\u958b\u4e2d</strong><span class="pending-piece-chip">${PIECE_LABELS[ui.selection.pieceType]}</span><span>\u7acb\u65b9\u4f53\u304c\u958b\u3044\u3066\u5c55\u958b\u56f3\u306b\u306a\u308b\u306e\u3092\u5f85\u3063\u3066\u3044\u307e\u3059\u3002</span>`;
    return;
  }
  if (ui.pendingFragmentPiece) {
    els.pendingPieceBanner.hidden = false;
    els.pendingPieceBanner.innerHTML = `<strong>\u6b21\u306b\u7f6e\u304f\u99d2</strong><span class="pending-piece-chip">${PIECE_LABELS[ui.pendingFragmentPiece.pieceType]}</span><span>\u4eca\u7f6e\u3044\u305f\u6b20\u7247\u306e\u4e2d\u304b\u3089\u3001\u7f6e\u304d\u305f\u3044\u30de\u30b9\u3092\u9078\u3093\u3067\u304f\u3060\u3055\u3044\u3002</span>`;
    return;
  }
  if (ui.selection && ui.selection.type === "fragment" && ui.selection.card) {
    els.pendingPieceBanner.hidden = false;
    els.pendingPieceBanner.innerHTML = `<strong>\u3053\u306e\u6b20\u7247\u306e\u5bfe\u5fdc\u99d2</strong><span class="pending-piece-chip">${PIECE_LABELS[ui.selection.card.pieceType]}</span><span>\u6b20\u7247\u3092\u7f6e\u3044\u305f\u5f8c\u306b\u3001\u3053\u306e\u99d2\u306e\u7f6e\u304d\u5834\u3092\u9078\u3073\u307e\u3059\u3002</span>`;
    return;
  }
  els.pendingPieceBanner.hidden = true;
  els.pendingPieceBanner.innerHTML = "";
}

function renderSide(player, reserveEl, handEl, deckEl) {
  const playerState = ui.state.players[player];
  reserveEl.innerHTML = "";
  handEl.innerHTML = "";
  deckEl.textContent = `${playerState.deck.length}\u679a`;
  Object.keys(playerState.reserve).forEach((pieceType) => {
    const button = document.createElement("button");
    button.className = "choice-card reserve-card";
    if (ui.selection && ui.selection.type === "reserve" && ui.selection.player === player && ui.selection.pieceType === pieceType) { button.classList.add("active"); }
    button.innerHTML = `<strong>${PIECE_LABELS[pieceType]}</strong><span>\u6301\u3061\u99d2</span><span class="choice-count">x${playerState.reserve[pieceType]}</span>`;
    button.disabled = player !== ui.state.currentPlayer;
    button.addEventListener("click", () => { ui.selection = { type: "reserve", player, pieceType }; ui.moveTargets = []; ui.previewCells = []; render(); });
    reserveEl.appendChild(button);
  });
  playerState.hand.forEach((card, handIndex) => {
    const button = document.createElement("button");
    button.className = "choice-card";
    if (ui.selection && ui.selection.type === "fragment" && ui.selection.player === player && ui.selection.handIndex === handIndex) { button.classList.add("active"); }
    button.innerHTML = `<strong>${FRAGMENT_LIBRARY[card.fragmentType].label}</strong><span class="choice-subtitle">\u5bfe\u5fdc\u99d2: ${PIECE_LABELS[card.pieceType]}</span><span class="fragment-preview">${fragmentPreviewText(card.fragmentType)}</span>`;
    button.disabled = player !== ui.state.currentPlayer;
    button.addEventListener("click", () => { ui.selection = { type: "fragment", player, handIndex, card }; ui.moveTargets = []; ui.previewCells = []; render(); });
    handEl.appendChild(button);
  });
}

function renderLog() { els.logList.innerHTML = ""; ui.state.actionLog.forEach((entry) => { const li = document.createElement("li"); li.textContent = entry; els.logList.appendChild(li); }); }
function renderSummary() { els.movementSummary.innerHTML = ""; Object.keys(MOVE_RULES).forEach((key) => { const div = document.createElement("div"); div.className = "summary-item"; div.innerHTML = `<strong>${key === "knightSample" ? "\u6842\u99ac\u4f8b" : PIECE_LABELS[key]}</strong><span>${MOVE_RULES[key].summary}</span>`; els.movementSummary.appendChild(div); }); }

function renderBoard3D() {
  const previewColor = getPreviewColor(ui.state.currentPlayer);
  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let col = 0; col < BOARD_COLS; col += 1) {
      const cell = ui.state.board[row][col];
      const cellVisual = sceneData.cells[row][col];
      const world = boardToWorld(row, col);
      const baseHeight = getBaseCellHeight(cell);
      cellVisual.group.position.set(world.x, 0, world.z);
      cellVisual.base.position.set(0, BOARD_BASE_Y + baseHeight / 2, 0);
      cellVisual.base.scale.y = baseHeight / BASE_TILE_HEIGHT;
      cellVisual.base.material.color.setHex(PLAYER_SOFT[cell.baseZoneOwner || "neutral"]);
      cellVisual.base.material.emissive.setHex(
        isPreviewCell(row, col)
          ? (ui.previewLegal ? previewColor : 0x000000)
          : (isMoveTarget(row, col) || isPendingPieceCell(row, col)
            ? 0x365b9e
            : (cell.isBaseCenter ? (cell.baseOwner === "P1" ? 0x17483f : 0x6f2512) : 0x000000))
      );
      cellVisual.base.material.emissiveIntensity = isPreviewCell(row, col)
        ? (ui.previewLegal ? 0.22 : 0)
        : ((isMoveTarget(row, col) || isPendingPieceCell(row, col))
          ? 0.18
          : (cell.isBaseCenter ? 0.16 : 0));
      syncCellLayers(cellVisual, cell);
    }
  }
  renderPieceMeshes();
  renderMarkers();
}

function renderPieceMeshes() {
  const live = new Set();
  ["P1", "P2"].forEach((player) => {
    Object.values(ui.state.players[player].pieces).forEach((piece) => {
      live.add(piece.id);
      let group = sceneData.pieces.get(piece.id);
      if (!group) {
        group = createPieceMesh(piece.owner);
        sceneData.pieces.set(piece.id, group);
        sceneData.scene.add(group);
      }
      const cell = ui.state.board[piece.row][piece.col];
      const world = boardToWorld(piece.row, piece.col);
      const animation = sceneData.pieceAnimations.get(piece.id);
      if (animation) {
        applyPieceAnimation(group, animation);
      } else {
        group.position.set(world.x, getCellTopY(piece.row, piece.col), world.z);
        group.scale.setScalar(1);
      }
      group.rotation.y = piece.owner === "P1" ? -Math.PI / 2 : Math.PI / 2;
      updatePieceLabel(group, PIECE_LABELS[piece.kind], piece.owner);
    });
  });
  Array.from(sceneData.pieces.keys()).forEach((id) => { if (!live.has(id)) { sceneData.scene.remove(sceneData.pieces.get(id)); sceneData.pieces.delete(id); } });
}

function createPieceMesh(owner) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.5, 0.28, 5), new THREE.MeshStandardMaterial({ color: owner === "P1" ? 0x9dd7cc : 0xe8ae95, roughness: 0.72 }));
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.45), new THREE.MeshBasicMaterial({ transparent: true }));
  body.geometry.rotateY(Math.PI / 5);
  body.castShadow = true;
  body.position.y = 0.14;
  plate.rotation.x = -Math.PI / 2;
  plate.position.y = 0.29;
  group.add(body, plate);
  return group;
}

function syncCellLayers(cellVisual, cell) {
  while (cellVisual.layers.length > cell.fragmentOwners.length) {
    const layerMesh = cellVisual.layers.pop();
    cellVisual.group.remove(layerMesh);
  }
  for (let index = cellVisual.layers.length; index < cell.fragmentOwners.length; index += 1) {
    const layerMesh = createCellLayerMesh();
    cellVisual.layers.push(layerMesh);
    cellVisual.group.add(layerMesh);
  }
  const baseHeight = getBaseCellHeight(cell);
  cellVisual.layers.forEach((layerMesh, index) => {
    const owner = cell.fragmentOwners[index];
    layerMesh.material.forEach((mat, matIndex) => {
      const isTopFace = matIndex === 2;
      mat.color.setHex(isTopFace ? PLAYER_SOFT[owner] : getLayerSideColor(owner));
    });
    layerMesh.position.set(0, BOARD_BASE_Y + baseHeight + FRAGMENT_LAYER_HEIGHT * index + FRAGMENT_LAYER_HEIGHT / 2, 0);
    layerMesh.visible = true;
  });
}

function createCellLayerMesh() {
  const materials = [
    new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.88 }),
    new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.88 }),
    new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 0.74 }),
    new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.88 }),
    new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.88 }),
    new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.88 })
  ];
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.92, FRAGMENT_LAYER_HEIGHT, 0.92), materials);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function getLayerSideColor(owner) {
  return owner === "P1" ? 0x436d65 : 0x874a3b;
}

function updatePieceLabel(group, text, owner) {
  const canvas = document.createElement("canvas");
  canvas.width = 128; canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = owner === "P1" ? "#10352f" : "#5c2616";
  ctx.font = "bold 78px 'Yu Gothic UI', sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.clearRect(0, 0, 128, 128);
  ctx.fillText(text, 64, 68);
  group.children[1].material.map = new THREE.CanvasTexture(canvas);
  group.children[1].material.needsUpdate = true;
}

function renderMarkers() {
  while (sceneData.markers.children.length) { sceneData.markers.remove(sceneData.markers.children[0]); }
  ui.moveTargets.forEach((cell) => sceneData.markers.add(makeMarker(cell.row, cell.col, 0x3d6bb8, 0.14)));
  ui.previewCells
    .filter((cell) => inBounds(cell.row, cell.col))
    .forEach((cell) => sceneData.markers.add(ui.previewLegal
      ? makePreview(cell.row, cell.col, getPreviewColor(ui.state.currentPlayer))
      : makeBlockedPreview(cell.row, cell.col)));
  if (ui.pendingFragmentPiece) {
    ui.pendingFragmentPiece.cells.forEach((cell) => { if (!ui.state.board[cell.row][cell.col].pieceId) { sceneData.markers.add(makeMarker(cell.row, cell.col, 0xc7901c, 0.12)); } });
  }
}

function applyPieceAnimation(group, animation) {
  if (animation.kind === "move") {
    const x = animation.fromWorld.x + (animation.toWorld.x - animation.fromWorld.x) * animation.progress;
    const z = animation.fromWorld.z + (animation.toWorld.z - animation.fromWorld.z) * animation.progress;
    const arc = Math.sin(animation.progress * Math.PI) * 0.22;
    const y = animation.fromY + (animation.toY - animation.fromY) * animation.progress + arc;
    group.position.set(x, y, z);
    group.scale.setScalar(1);
    return;
  }
  const world = boardToWorld(animation.row, animation.col);
  const y = animation.startY + (animation.endY - animation.startY) * animation.progress;
  const squash = animation.progress < 0.8
    ? 0.86 + animation.progress * 0.18
    : 1 + Math.sin((animation.progress - 0.8) * Math.PI * 5) * 0.05 * (1 - animation.progress);
  group.position.set(world.x, y, world.z);
  group.scale.set(squash, Math.max(0.88, 1.06 - (squash - 1) * 0.8), squash);
}

function makeMarker(row, col, color, radius) {
  const world = boardToWorld(row, col);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.05, 24), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.2 }));
  mesh.position.set(world.x, getCellTopY(row, col) + 0.03, world.z);
  return mesh;
}

function makePreview(row, col, color) {
  const world = boardToWorld(row, col);
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.08, 0.94), new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.45 }));
  mesh.position.set(world.x, getCellTopY(row, col) + 0.04, world.z);
  return mesh;
}

function makeBlockedPreview(row, col) {
  const world = boardToWorld(row, col);
  const group = new THREE.Group();
  const barMaterial = new THREE.MeshStandardMaterial({ color: 0x8a1d14, emissive: 0x8a1d14, emissiveIntensity: 0.16 });
  const barA = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.12), barMaterial);
  const barB = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.12), barMaterial.clone());
  const y = getCellTopY(row, col) + 0.05;
  barA.position.set(world.x, y, world.z);
  barB.position.set(world.x, y, world.z);
  barA.rotation.y = Math.PI / 4;
  barB.rotation.y = -Math.PI / 4;
  group.add(barA, barB);
  return group;
}

function getPreviewColor(player) {
  return player === "P1" ? 0x1f8f78 : 0xc65c34;
}

function getCellHeight(cell) {
  return getBaseCellHeight(cell) + cell.fragmentOwners.length * FRAGMENT_LAYER_HEIGHT;
}

function getBaseCellHeight(cell) {
  return BASE_TILE_HEIGHT
    + (cell.baseZoneOwner ? BASE_ZONE_HEIGHT : 0)
    + (cell.isBaseCenter ? BASE_CENTER_BONUS : 0);
}

function getCellTopY(row, col) {
  const cell = ui.state.board[row][col];
  return BOARD_BASE_Y + getCellHeight(cell);
}

function pickCell(event) {
  const rect = sceneData.renderer.domElement.getBoundingClientRect();
  sceneData.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  sceneData.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  sceneData.raycaster.setFromCamera(sceneData.pointer, sceneData.camera);
  const hits = sceneData.raycaster.intersectObjects(sceneData.pickables, false);
  return hits.length ? hits[0].object.userData : null;
}

function updateCameraPosition() {
  const orbit = sceneData.orbit;
  const x = Math.cos(orbit.yaw) * Math.sin(orbit.pitch) * orbit.distance;
  const y = Math.cos(orbit.pitch) * orbit.distance;
  const z = Math.sin(orbit.yaw) * Math.sin(orbit.pitch) * orbit.distance;
  sceneData.camera.position.set(x, y, z);
  sceneData.camera.lookAt(0, 0, 0);
}

function onPointerDown(event) {
  if (event.button !== 0) { return; }
  sceneData.orbit.dragging = true;
  sceneData.orbit.lastX = event.clientX;
  sceneData.orbit.lastY = event.clientY;
}

function onPointerUp() {
  sceneData.orbit.dragging = false;
}

function onPointerDrag(event) {
  const orbit = sceneData.orbit;
  if (!orbit.dragging) { return; }
  const dx = event.clientX - orbit.lastX;
  const dy = event.clientY - orbit.lastY;
  orbit.lastX = event.clientX;
  orbit.lastY = event.clientY;
  orbit.yaw -= dx * 0.01;
  orbit.pitch = Math.max(0.45, Math.min(1.35, orbit.pitch + dy * 0.01));
  updateCameraPosition();
}

function onWheel(event) {
  event.preventDefault();
  sceneData.orbit.distance = Math.max(8, Math.min(24, sceneData.orbit.distance + event.deltaY * 0.01));
  updateCameraPosition();
}

function onPointerMove(event) { const hit = pickCell(event); ui.hoverCell = hit; if (hit && ui.selection && ui.selection.type === "fragment" && !ui.pendingPlacement && !ui.pendingFragmentPiece) { updateFragmentPreview(hit.row, hit.col, false); } }
function onSceneClick(event) { hideContextMenu(); const hit = pickCell(event); if (hit) { handleCellClick(hit.row, hit.col, event); } }
function onSceneContextMenu(event) { event.preventDefault(); if (ui.selection) { openContextMenu(event.clientX, event.clientY); } }

function handleCellClick(row, col, event) {
  const cell = ui.state.board[row][col];
  const piece = cell.pieceId ? getPiece(cell.pieceId) : null;
  if (ui.state.winner || (ui.selection && ui.selection.type === "fragmentAnimation")) { return; }
  if (ui.pendingFragmentPiece) { tryPendingPiece(row, col, event); return; }
  if (ui.selection && ui.selection.type === "piece") { tryMove(row, col, event); return; }
  if (ui.selection && ui.selection.type === "reserve") { tryReserve(row, col); return; }
  if (ui.selection && ui.selection.type === "fragment") { tryFragment(row, col, event); return; }
  if (piece && piece.owner === ui.state.currentPlayer) { ui.selection = { type: "piece", pieceId: piece.id }; ui.moveTargets = legalMoveTargets(piece); render(); return; }
  clearSelection(); render();
}

function legalMoveTargets(piece) { const out = []; for (let row = 0; row < BOARD_ROWS; row += 1) { for (let col = 0; col < BOARD_COLS; col += 1) { if (canMove(piece, row, col)) { out.push({ row, col }); } } } return out; }
function isMoveTarget(row, col) { return ui.moveTargets.some((cell) => cell.row === row && cell.col === col); }
function isPendingPieceCell(row, col) { return !!ui.pendingFragmentPiece && ui.pendingFragmentPiece.cells.some((cell) => cell.row === row && cell.col === col) && !ui.state.board[row][col].pieceId; }
function isTraversableCell(row, col) { const cell = getCell(row, col); return !!cell && cell.controller !== null; }

function canMove(piece, row, col) {
  const rule = MOVE_RULES[piece.kind];
  const targetCell = getCell(row, col);
  const targetPiece = targetCell && targetCell.pieceId ? getPiece(targetCell.pieceId) : null;
  if (!rule || !targetCell || (piece.row === row && piece.col === col) || (targetPiece && targetPiece.owner === piece.owner) || !isTraversableCell(row, col)) { return false; }
  if (rule.kind !== "ray") { return rule.vectors.some((v) => v[0] === row - piece.row && v[1] === col - piece.col); }
  for (let i = 0; i < rule.vectors.length; i += 1) {
    let cr = piece.row + rule.vectors[i][0];
    let cc = piece.col + rule.vectors[i][1];
    while (inBounds(cr, cc)) {
      if (!isTraversableCell(cr, cc)) { break; }
      if (cr === row && cc === col) { return true; }
      if (ui.state.board[cr][cc].pieceId) { break; }
      cr += rule.vectors[i][0];
      cc += rule.vectors[i][1];
    }
  }
  return false;
}

function tryMove(row, col, event) {
  const piece = getPiece(ui.selection.pieceId);
  if (!piece || !canMove(piece, row, col)) { return; }
  els.confirmText.textContent = "\u3053\u306e\u79fb\u52d5\u3092\u78ba\u5b9a\u3057\u307e\u3059\u304b\uFF1F";
  openPlacementConfirm(event.clientX, event.clientY, { type: "move", pieceId: piece.id, row, col });
}

function commitMove(pieceId, row, col) {
  const piece = getPiece(pieceId);
  if (!piece || !canMove(piece, row, col)) { hidePlacementConfirm(); return; }
  const fromRow = piece.row;
  const fromCol = piece.col;
  const target = ui.state.board[row][col];
  const targetPiece = target.pieceId ? getPiece(target.pieceId) : null;
  ui.state.board[piece.row][piece.col].pieceId = null;
  if (targetPiece) {
    delete ui.state.players[targetPiece.owner].pieces[targetPiece.id];
    if (targetPiece.kind !== "king") { ui.state.players[piece.owner].reserve[targetPiece.kind] += 1; }
    else { ui.state.winner = piece.owner; ui.state.winReason = "\u738b\u306e\u6355\u7372"; }
  }
  piece.row = row; piece.col = col; target.pieceId = piece.id;
  startPieceMoveAnimation(piece.id, fromRow, fromCol, row, col);
  pushLog(`${PLAYER_LABELS[piece.owner]}\u304c ${piece.id} \u3092 (${row + 1}, ${col + 1}) \u3078\u79fb\u52d5`);
  hidePlacementConfirm(); endTurn();
}

function tryReserve(row, col) {
  const pieceType = ui.selection.pieceType;
  const cell = ui.state.board[row][col];
  if (cell.controller !== ui.state.currentPlayer || cell.pieceId || ui.state.players[ui.state.currentPlayer].reserve[pieceType] <= 0) { return; }
  ui.state.players[ui.state.currentPlayer].reserve[pieceType] -= 1;
  const pieceId = addPiece(ui.state, ui.state.currentPlayer, pieceType, row, col);
  startPiecePlacementAnimation(pieceId, row, col);
  pushLog(`${PLAYER_LABELS[ui.state.currentPlayer]}\u304c ${PIECE_LABELS[pieceType]} \u3092 (${row + 1}, ${col + 1}) \u306b\u914d\u7f6e`);
  endTurn();
}

function tryFragment(row, col, event) {
  updateFragmentPreview(row, col, true);
  if ((isPreviewCell(row, col) || isPreviewBoundsCell(row, col)) && ui.previewLegal) {
    els.confirmText.textContent = "\u3053\u306e\u5f62\u3067\u6b20\u7247\u3092\u7f6e\u304d\u307e\u3059\u304b\uFF1F";
    openPlacementConfirm(event.clientX, event.clientY, { type: "fragment" });
  }
}

function commitFragment() {
  if (!ui.selection || ui.selection.type !== "fragment" || !ui.previewLegal) { return; }
  const card = ui.selection.card;
  const cells = ui.previewCells.slice();
  ui.state.players[ui.state.currentPlayer].hand.splice(ui.selection.handIndex, 1);
  fillHand(ui.state, ui.state.currentPlayer);
  const owner = ui.state.currentPlayer;
  ui.selection = { type: "fragmentAnimation", pieceType: card.pieceType };
  ui.previewCells = [];
  ui.previewLegal = false;
  hidePlacementConfirm();
  pushLog(`${PLAYER_LABELS[ui.state.currentPlayer]}\u304c ${FRAGMENT_LIBRARY[card.fragmentType].label} \u3092\u914d\u7f6e`);
  render();
  startFragmentUnfoldAnimation(owner, cells, card.fragmentType, () => {
    cells.forEach((cell) => {
      ui.state.board[cell.row][cell.col].controller = owner;
      ui.state.board[cell.row][cell.col].stack += 1;
      ui.state.board[cell.row][cell.col].fragmentOwners.push(owner);
    });
    ui.pendingFragmentPiece = { pieceType: card.pieceType, cells };
    ui.selection = { type: "pendingPiece" };
    render();
  });
}

function tryPendingPiece(row, col, event) {
  if (!isPendingPieceCell(row, col)) { return; }
  els.confirmText.textContent = "\u3053\u306e\u30de\u30b9\u306b\u5bfe\u5fdc\u99d2\u3092\u7f6e\u304d\u307e\u3059\u304b\uFF1F";
  openPlacementConfirm(event.clientX, event.clientY, { type: "pendingPiece", row, col });
}

function commitPendingPiece(row, col) {
  if (!isPendingPieceCell(row, col)) { hidePlacementConfirm(); return; }
  const pieceId = addPiece(ui.state, ui.state.currentPlayer, ui.pendingFragmentPiece.pieceType, row, col);
  startPiecePlacementAnimation(pieceId, row, col);
  pushLog(`${PLAYER_LABELS[ui.state.currentPlayer]}\u304c ${PIECE_LABELS[ui.pendingFragmentPiece.pieceType]} \u3092 (${row + 1}, ${col + 1}) \u306b\u914d\u7f6e`);
  ui.pendingFragmentPiece = null; hidePlacementConfirm(); endTurn();
}

function updateFragmentPreview(row, col, rerender) {
  const card = ui.selection && ui.selection.card;
  let rotated = card ? FRAGMENT_LIBRARY[card.fragmentType].cells.map((cell) => [cell[0], cell[1]]) : [];
  for (let r = 0; r < ui.rotation; r += 1) { rotated = rotated.map((cell) => [cell[1], -cell[0]]); }
  let minRow = Infinity, minCol = Infinity;
  rotated.forEach((cell) => { minRow = Math.min(minRow, cell[0]); minCol = Math.min(minCol, cell[1]); });
  ui.previewCells = rotated.map((cell) => ({ row: row + cell[0] - minRow, col: col + cell[1] - minCol }));
  ui.previewLegal = isLegalPreview(ui.previewCells, ui.state.currentPlayer);
  if (rerender) { render(); } else { renderStatus(); renderBoard3D(); }
}

function isLegalPreview(cells, player) {
  let touches = false;
  for (let i = 0; i < cells.length; i += 1) {
    const row = cells[i].row, col = cells[i].col;
    if (!inBounds(row, col)) { return false; }
    const cell = ui.state.board[row][col];
    const piece = cell.pieceId ? getPiece(cell.pieceId) : null;
    if (cell.controller === player || (piece && piece.owner !== player)) { return false; }
    [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr, dc]) => {
      const nr = row + dr, nc = col + dc;
      if (inBounds(nr, nc) && ui.state.board[nr][nc].controller === player) { touches = true; }
    });
  }
  return touches;
}

function isPreviewCell(row, col) { return ui.previewCells.some((cell) => cell.row === row && cell.col === col); }
function isPreviewBoundsCell(row, col) {
  if (!ui.previewCells.length) { return false; }
  let minRow = ui.previewCells[0].row, maxRow = ui.previewCells[0].row, minCol = ui.previewCells[0].col, maxCol = ui.previewCells[0].col;
  ui.previewCells.forEach((cell) => { minRow = Math.min(minRow, cell.row); maxRow = Math.max(maxRow, cell.row); minCol = Math.min(minCol, cell.col); maxCol = Math.max(maxCol, cell.col); });
  return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
}

function fragmentPreviewText(fragmentType) {
  const cells = FRAGMENT_LIBRARY[fragmentType].cells.slice();
  let maxRow = 0, maxCol = 0;
  cells.forEach((cell) => { maxRow = Math.max(maxRow, cell[0]); maxCol = Math.max(maxCol, cell[1]); });
  const rows = [];
  for (let row = 0; row <= maxRow; row += 1) { let line = ""; for (let col = 0; col <= maxCol; col += 1) { line += cells.some((cell) => cell[0] === row && cell[1] === col) ? "\u25a0" : "\u25a1"; } rows.push(line); }
  return rows.join("<br>");
}

function findBaseCenter(player) { for (let row = 0; row < BOARD_ROWS; row += 1) { for (let col = 0; col < BOARD_COLS; col += 1) { const cell = ui.state.board[row][col]; if (cell.isBaseCenter && cell.baseOwner === player) { return cell; } } } return null; }
function checkBaseWin() { ["P1", "P2"].forEach((attacker) => { if (ui.state.winner) { return; } const defender = attacker === "P1" ? "P2" : "P1"; const center = findBaseCenter(defender); const piece = center && center.pieceId ? getPiece(center.pieceId) : null; if (center && center.controller === attacker && (!piece || piece.owner !== defender)) { ui.state.winner = attacker; ui.state.winReason = "\u672c\u9663\u5360\u9818"; pushLog(`${PLAYER_LABELS[attacker]}\u304c\u76f8\u624b\u306e\u672c\u9663\u4e2d\u592e\u3092\u652f\u914d`); } }); }
function endTurn() { checkBaseWin(); if (!ui.state.winner) { ui.state.currentPlayer = ui.state.currentPlayer === "P1" ? "P2" : "P1"; ui.state.turnNumber += 1; } clearSelection(); render(); }

function getModeText() {
  if (!ui.selection) { return "\u672a\u9078\u629e"; }
  if (ui.selection.type === "fragmentAnimation") { return "\u6b20\u7247\u304c\u5c55\u958b\u4e2d"; }
  if (ui.pendingFragmentPiece) { return "\u7d44\u307f\u5408\u308f\u305b\u99d2\u3092\u914d\u7f6e\u4e2d"; }
  if (ui.selection.type === "piece") { return "\u99d2\u3092\u79fb\u52d5\u4e2d"; }
  if (ui.selection.type === "reserve") { return "\u6301\u3061\u99d2\u3092\u914d\u7f6e\u4e2d"; }
  if (ui.pendingPlacement) { return "\u64cd\u4f5c\u3092\u78ba\u8a8d\u4e2d"; }
  return "\u6b20\u7247\u914d\u7f6e\u4e2d";
}

function getMessageText() {
  if (ui.state.winner) { return `${PLAYER_LABELS[ui.state.winner]}\u306e\u52dd\u3061\u3067\u3059\u3002`; }
  if (ui.selection && ui.selection.type === "fragmentAnimation") { return "\u7acb\u65b9\u4f53\u306e\u5404\u9762\u304c\u958b\u3044\u3066\u3001\u5c55\u958b\u56f3\u3068\u3057\u3066\u76e4\u9762\u306b\u8a2d\u7f6e\u3055\u308c\u3066\u3044\u307e\u3059\u3002"; }
  if (ui.pendingFragmentPiece) { return `\u4eca\u7f6e\u3044\u305f\u6b20\u7247\u306e\u4e2d\u304b\u3089\u3001${PIECE_LABELS[ui.pendingFragmentPiece.pieceType]}\u3092\u7f6e\u304f\u30de\u30b9\u3092\u9078\u3093\u3067\u304f\u3060\u3055\u3044\u3002`; }
  if (!ui.selection) { return "\u99d2\u79fb\u52d5\u3001\u6301\u3061\u99d2\u3001\u6b20\u7247\u914d\u7f6e\u306e\u3044\u305a\u308c\u304b\u3092\u9078\u3093\u3067\u304f\u3060\u3055\u3044\u30023D\u8996\u70b9\u306f\u30c9\u30e9\u30c3\u30b0\u3067\u56de\u8ee2\u3067\u304d\u307e\u3059\u3002"; }
  if (ui.selection.type === "piece") { return "\u9752\u3044\u30de\u30fc\u30ab\u30fc\u304c\u79fb\u52d5\u53ef\u80fd\u30de\u30b9\u3067\u3059\u3002"; }
  if (ui.selection.type === "reserve") { return "\u81ea\u5206\u306e\u652f\u914d\u5730\u306e\u7a7a\u304d\u30de\u30b9\u3092\u9078\u3093\u3067\u304f\u3060\u3055\u3044\u3002"; }
  return "\u6b20\u7247\u30d7\u30ec\u30d3\u30e5\u30fc\u306f\u30ab\u30fc\u30bd\u30eb\u306b\u8ffd\u5f93\u3057\u307e\u3059\u3002";
}

function openContextMenu(clientX, clientY) {
  const rect = els.sceneViewport.getBoundingClientRect();
  const cardRect = els.sceneViewport.closest(".scene-card").getBoundingClientRect();
  els.contextMenu.style.left = `${Math.max(12, Math.min(clientX - cardRect.left, rect.right - cardRect.left - 200))}px`;
  els.contextMenu.style.top = `${Math.max(12, Math.min(clientY - cardRect.top, rect.bottom - cardRect.top - 110))}px`;
  els.contextMenu.hidden = false;
}
function hideContextMenu() { els.contextMenu.hidden = true; }
function openPlacementConfirm(clientX, clientY, payload) {
  const rect = els.sceneViewport.getBoundingClientRect();
  const cardRect = els.sceneViewport.closest(".scene-card").getBoundingClientRect();
  ui.pendingPlacement = payload;
  els.placementConfirm.style.left = `${Math.max(12, Math.min(clientX - cardRect.left, rect.right - cardRect.left - 230))}px`;
  els.placementConfirm.style.top = `${Math.max(12, Math.min(clientY - cardRect.top, rect.bottom - cardRect.top - 140))}px`;
  els.placementConfirm.hidden = false;
}
function hidePlacementConfirm() { ui.pendingPlacement = null; els.placementConfirm.hidden = true; }
function runTests() { return "OK: 3D\u76e4\u9762\u306e\u8d77\u52d5\nOK: \u624b\u672d / \u6301\u3061\u99d2\u8868\u793a\nOK: \u99d2\u79fb\u52d5\u30fb\u6b20\u7247\u914d\u7f6e\u30fb\u672c\u9663\u5360\u9818\u5224\u5b9a"; }

function updateAnimations(now) {
  if (sceneData.animations.length) {
    sceneData.animations = sceneData.animations.filter((animation) => {
      const elapsed = now - animation.startTime;
      const overall = Math.max(0, Math.min(1, elapsed / animation.duration));
      const easedDrop = easeOutCubic(overall);
      animation.group.position.y = animation.startY + (animation.endY - animation.startY) * easedDrop;
      animation.faces.forEach((face) => {
        const local = Math.max(0, Math.min(1, (elapsed - face.delay) / face.duration));
        const eased = easeOutCubic(local);
        face.pivot.rotation[face.axis] = face.startAngle * (1 - eased);
      });
      if (overall >= 1) {
        sceneData.scene.remove(animation.group);
        animation.onComplete();
        return false;
      }
      return true;
    });
  }
  if (sceneData.pieceAnimations.size) {
    Array.from(sceneData.pieceAnimations.entries()).forEach(([pieceId, animation]) => {
      const progress = Math.max(0, Math.min(1, (now - animation.startTime) / animation.duration));
      animation.progress = animation.kind === "move" ? easeInOutCubic(progress) : easeOutBack(progress);
      const group = sceneData.pieces.get(pieceId);
      if (group) {
        applyPieceAnimation(group, animation);
      }
      if (progress >= 1) {
        sceneData.pieceAnimations.delete(pieceId);
        if (group) {
          if (animation.kind === "move") {
            group.position.set(animation.toWorld.x, animation.toY, animation.toWorld.z);
          } else {
            group.position.set(animation.world.x, animation.endY, animation.world.z);
          }
          group.scale.setScalar(1);
        }
      }
    });
  }
}

function easeOutCubic(value) {
  const t = 1 - value;
  return 1 - t * t * t;
}

function easeOutBack(value) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(value - 1, 3) + c1 * Math.pow(value - 1, 2);
}

function easeInOutCubic(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function startFragmentUnfoldAnimation(owner, cells, fragmentType, onComplete) {
  const animation = buildFragmentAnimation(owner, cells, fragmentType, onComplete);
  sceneData.animations.push(animation);
  sceneData.scene.add(animation.group);
}

function startPiecePlacementAnimation(pieceId, row, col) {
  const world = boardToWorld(row, col);
  const endY = getCellTopY(row, col);
  sceneData.pieceAnimations.set(pieceId, {
    kind: "place",
    row,
    col,
    world,
    startTime: performance.now(),
    duration: 520,
    startY: endY + 1.05,
    endY,
    progress: 0
  });
}

function startPieceMoveAnimation(pieceId, fromRow, fromCol, toRow, toCol) {
  const fromWorld = boardToWorld(fromRow, fromCol);
  const toWorld = boardToWorld(toRow, toCol);
  sceneData.pieceAnimations.set(pieceId, {
    kind: "move",
    fromWorld,
    toWorld,
    fromY: getCellTopY(fromRow, fromCol),
    toY: getCellTopY(toRow, toCol),
    startTime: performance.now(),
    duration: 420,
    progress: 0
  });
}

function buildFragmentAnimation(owner, cells, fragmentType, onComplete) {
  const localCells = cells.map((cell) => ({ row: cell.row, col: cell.col }));
  const rootIndex = pickFragmentRoot(localCells);
  const tree = buildFragmentTree(localCells, rootIndex);
  const rootCell = localCells[rootIndex];
  const rootWorld = boardToWorld(rootCell.row, rootCell.col);
  const rootTop = getCellTopY(rootCell.row, rootCell.col);
  const group = new THREE.Group();
  group.position.set(rootWorld.x, rootTop + 1.15, rootWorld.z);

  const rootFace = new THREE.Object3D();
  group.add(rootFace);
  rootFace.add(createFragmentFace(owner, fragmentType, rootIndex === 0));

  const faces = [];
  buildAnimationChildren(tree, rootIndex, rootFace, faces, owner, fragmentType);

  return {
    group,
    faces,
    startTime: performance.now(),
    duration: 1120,
    startY: rootTop + 1.15,
    endY: rootTop + FRAGMENT_LAYER_HEIGHT / 2,
    onComplete
  };
}

function buildAnimationChildren(tree, nodeIndex, parentFrame, faces, owner, fragmentType) {
  tree[nodeIndex].children.forEach((childIndex) => {
    const edge = tree[childIndex].edgeFromParent;
    const pivot = new THREE.Object3D();
    pivot.position.set(edge.dc * CELL_SIZE * 0.5, 0, edge.dr * CELL_SIZE * 0.5);
    parentFrame.add(pivot);

    const faceFrame = new THREE.Object3D();
    faceFrame.position.set(edge.dc * CELL_SIZE * 0.5, 0, edge.dr * CELL_SIZE * 0.5);
    pivot.add(faceFrame);
    faceFrame.add(createFragmentFace(owner, fragmentType, false));

    const rotationInfo = getFoldRotation(edge.dr, edge.dc);
    pivot.rotation[rotationInfo.axis] = rotationInfo.angle;
    faces.push({
      pivot,
      axis: rotationInfo.axis,
      startAngle: rotationInfo.angle,
      delay: tree[childIndex].depth * 120,
      duration: 520
    });

    buildAnimationChildren(tree, childIndex, faceFrame, faces, owner, fragmentType);
  });
}

function createFragmentFace(owner, fragmentType, highlightRoot) {
  const group = new THREE.Group();
  const color = owner === "P1" ? 0x4d8f81 : 0xb85b44;
  const sideColor = owner === "P1" ? 0x2f655a : 0x7f3b29;
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.92, FRAGMENT_LAYER_HEIGHT, 0.92),
    [
      new THREE.MeshStandardMaterial({ color: sideColor, roughness: 0.84 }),
      new THREE.MeshStandardMaterial({ color: sideColor, roughness: 0.84 }),
      new THREE.MeshStandardMaterial({ color, roughness: 0.7 }),
      new THREE.MeshStandardMaterial({ color: sideColor, roughness: 0.82 }),
      new THREE.MeshStandardMaterial({ color: sideColor, roughness: 0.84 }),
      new THREE.MeshStandardMaterial({ color: sideColor, roughness: 0.84 })
    ]
  );
  body.position.y = FRAGMENT_LAYER_HEIGHT * 0.5;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  if (highlightRoot) {
    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.03, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xf2dfb8, emissive: 0x7a5c2d, emissiveIntensity: 0.18 })
    );
    cap.position.y = FRAGMENT_LAYER_HEIGHT + 0.02;
    group.add(cap);
  }

  return group;
}

function pickFragmentRoot(cells) {
  let bestIndex = 0;
  let bestScore = -1;
  cells.forEach((cell, index) => {
    let degree = 0;
    cells.forEach((other) => {
      if (Math.abs(other.row - cell.row) + Math.abs(other.col - cell.col) === 1) { degree += 1; }
    });
    if (degree > bestScore) {
      bestScore = degree;
      bestIndex = index;
    }
  });
  return bestIndex;
}

function buildFragmentTree(cells, rootIndex) {
  const tree = cells.map(() => ({ children: [], parent: null, edgeFromParent: null, depth: 0 }));
  const queue = [rootIndex];
  const seen = new Set([rootIndex]);
  while (queue.length) {
    const current = queue.shift();
    cells.forEach((cell, index) => {
      if (seen.has(index)) { return; }
      const dr = cell.row - cells[current].row;
      const dc = cell.col - cells[current].col;
      if (Math.abs(dr) + Math.abs(dc) !== 1) { return; }
      seen.add(index);
      tree[index].parent = current;
      tree[index].edgeFromParent = { dr, dc };
      tree[index].depth = tree[current].depth + 1;
      tree[current].children.push(index);
      queue.push(index);
    });
  }
  return tree;
}

function getFoldRotation(dr, dc) {
  if (dr === -1) { return { axis: "x", angle: Math.PI / 2 }; }
  if (dr === 1) { return { axis: "x", angle: -Math.PI / 2 }; }
  if (dc === -1) { return { axis: "z", angle: -Math.PI / 2 }; }
  return { axis: "z", angle: Math.PI / 2 };
}

function bindEvents() {
  els.newGameBtn.addEventListener("click", () => { ui.state = createGame(); clearSelection(); pushLog("\u65b0\u3057\u3044\u5bfe\u5c40\u3092\u59cb\u3081\u307e\u3057\u305f"); render(); });
  els.runTestsBtn.addEventListener("click", () => { els.testOutput.textContent = runTests(); });
  els.serializeBtn.addEventListener("click", () => {
    const text = JSON.stringify(ui.state, null, 2);
    if (navigator.clipboard?.writeText) { navigator.clipboard.writeText(text); els.messageLabel.textContent = "\u72b6\u614bJSON\u3092\u30b3\u30d4\u30fc\u3057\u307e\u3057\u305f\u3002"; }
    else { els.testOutput.textContent = text; }
  });
  els.contextRotateBtn.addEventListener("click", () => { if (ui.selection && ui.selection.type === "fragment") { ui.rotation = (ui.rotation + 1) % 4; hideContextMenu(); if (ui.hoverCell) { updateFragmentPreview(ui.hoverCell.row, ui.hoverCell.col, true); } else { render(); } } });
  els.contextCancelBtn.addEventListener("click", () => { clearSelection(); render(); });
  els.confirmPlaceBtn.addEventListener("click", () => {
    if (!ui.pendingPlacement) { return; }
    if (ui.pendingPlacement.type === "move") { commitMove(ui.pendingPlacement.pieceId, ui.pendingPlacement.row, ui.pendingPlacement.col); }
    else if (ui.pendingPlacement.type === "fragment") { commitFragment(); }
    else if (ui.pendingPlacement.type === "pendingPiece") { commitPendingPiece(ui.pendingPlacement.row, ui.pendingPlacement.col); }
  });
  els.cancelPlaceBtn.addEventListener("click", () => { hidePlacementConfirm(); renderStatus(); });
  document.addEventListener("click", (event) => {
    if (!els.contextMenu.hidden && !els.contextMenu.contains(event.target)) { hideContextMenu(); }
    if (!els.placementConfirm.hidden && !els.placementConfirm.contains(event.target) && !els.sceneViewport.contains(event.target)) { hidePlacementConfirm(); }
  });
}

function reportBootError(error) {
  const text = error && error.stack ? error.stack : String(error);
  if (els.messageLabel) {
    els.messageLabel.textContent = text;
  }
  if (els.testOutput) {
    els.testOutput.textContent = `INIT ERROR\n${text}`;
  }
  window.__UNFOLD3D_ERROR = text;
}

function init() {
  ui.state = createGame();
  initThree();
  bindEvents();
  els.testOutput.textContent = runTests();
  render();
  window.__UNFOLD3D_BOOTED = true;
}

try {
  init();
} catch (error) {
  reportBootError(error);
  throw error;
}
