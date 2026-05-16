(function () {
  if (!window.THREE || !window.UNFOLD_3D_API) {
    return;
  }

  var THREE = window.THREE;
  var api = window.UNFOLD_3D_API;
  var viewport = document.getElementById("sceneViewport");
  var toggle3DLabelsBtn = document.getElementById("toggle3DLabelsBtn");
  if (!viewport) {
    return;
  }

  var BOARD_ROWS = api.boardRows;
  var BOARD_COLS = api.boardCols;
  var BOARD_ROW_LABELS = ["\u4e00", "\u4e8c", "\u4e09", "\u56db", "\u4e94", "\u516d", "\u4e03", "\u516b", "\u4e5d"];
  var CELL_SIZE = 1;
  var COORDINATE_OUTSET = 1.95;
  var BASE_HEIGHT = 0.025;
  var ZONE_HEIGHT = 0;
  var CENTER_HEIGHT = 0;
  var STACK_HEIGHT = 0.105;
  var MARBLE_TEXTURE_URL = "assets/materials/marble_01_diff_1k.jpg";
  var PLAYER_CAMERA_VIEW_HEIGHT = 17.2;
  var LANDSCAPE_CAMERA_VIEW_HEIGHT = 11.2;
  var DEFAULT_CAMERA_ORBIT = {
    yaw: Math.PI,
    pitch: 0,
    distance: 22,
    viewHeight: PLAYER_CAMERA_VIEW_HEIGHT,
    targetX: 0,
    targetZ: 0
  };
  var sceneData = {
    scene: null,
    camera: null,
    renderer: null,
    raycaster: new THREE.Raycaster(),
    pointer: new THREE.Vector2(),
    cells: [],
    pickables: [],
    pieces: new Map(),
    pieceLabels: new Map(),
    markers: null,
    animations: [],
    pieceAnimations: new Map(),
    hiddenPlacementIds: {},
    labelsEnabled: false,
    coordinateOverlay: null,
    coordinateLabels: { rows: [], cols: [] },
    orbit: {
      yaw: DEFAULT_CAMERA_ORBIT.yaw,
      pitch: DEFAULT_CAMERA_ORBIT.pitch,
      distance: DEFAULT_CAMERA_ORBIT.distance,
      viewHeight: DEFAULT_CAMERA_ORBIT.viewHeight,
      viewMode: "player",
      userZoomed: false,
      dragging: false,
      moved: false,
      lastX: 0,
      lastY: 0,
      mode: "rotate",
      targetX: DEFAULT_CAMERA_ORBIT.targetX,
      targetZ: DEFAULT_CAMERA_ORBIT.targetZ
    }
  };

  function syncReviewOverlay() {
    if (typeof window.UNFOLD_REVIEW_OVERLAY_SYNC === "function") {
      window.UNFOLD_REVIEW_OVERLAY_SYNC();
    }
  }

  function getViewerSide() {
    if (api && typeof api.getViewerSide === "function") {
      return api.getViewerSide() === "P2" ? "P2" : "P1";
    }
    return "P1";
  }

  function getBoardViewMode() {
    return "player";
  }

  function getDefaultViewHeight(viewMode) {
    return viewMode === "landscape" ? LANDSCAPE_CAMERA_VIEW_HEIGHT : PLAYER_CAMERA_VIEW_HEIGHT;
  }

  function syncBoardViewMode() {
    var nextMode = getBoardViewMode();
    var currentMode = sceneData.orbit.viewMode || nextMode;
    var oldDefault = getDefaultViewHeight(currentMode);
    var shouldUseDefaultZoom = !sceneData.orbit.userZoomed
      || Math.abs((sceneData.orbit.viewHeight || oldDefault) - oldDefault) < 0.4;
    if (currentMode !== nextMode) {
      sceneData.orbit.viewMode = nextMode;
      if (shouldUseDefaultZoom) {
        sceneData.orbit.viewHeight = getDefaultViewHeight(nextMode);
      }
    } else {
      sceneData.orbit.viewMode = nextMode;
    }
    document.body.classList.toggle("board-view-landscape", nextMode === "landscape");
    document.body.classList.toggle("board-view-player", nextMode !== "landscape");
    return nextMode;
  }

  function getDefaultCameraOrbit() {
    var side = getViewerSide();
    var viewMode = getBoardViewMode();
    return {
      yaw: side === "P2" ? 0 : Math.PI,
      pitch: DEFAULT_CAMERA_ORBIT.pitch,
      distance: DEFAULT_CAMERA_ORBIT.distance,
      viewHeight: getDefaultViewHeight(viewMode),
      viewMode: viewMode,
      targetX: DEFAULT_CAMERA_ORBIT.targetX,
      targetZ: DEFAULT_CAMERA_ORBIT.targetZ
    };
  }

  function resetCameraView() {
    var defaultOrbit = getDefaultCameraOrbit();
    sceneData.orbit.yaw = defaultOrbit.yaw;
    sceneData.orbit.pitch = defaultOrbit.pitch;
    sceneData.orbit.distance = defaultOrbit.distance;
    sceneData.orbit.viewHeight = defaultOrbit.viewHeight;
    sceneData.orbit.viewMode = defaultOrbit.viewMode;
    sceneData.orbit.userZoomed = false;
    sceneData.orbit.targetX = defaultOrbit.targetX;
    sceneData.orbit.targetZ = defaultOrbit.targetZ;
    applyCameraPreset();
    resizeRenderer();
    updateCameraPosition();
    renderScene();
  }

  function applyCameraPreset() {
    var preset = window.UNFOLD_3D_CAMERA_PRESET;
    if (!preset) {
      return;
    }
    if (typeof preset.yaw === "number") {
      sceneData.orbit.yaw = preset.yaw;
    }
    if (typeof preset.pitch === "number") {
      sceneData.orbit.pitch = preset.pitch;
    }
    if (typeof preset.distance === "number") {
      sceneData.orbit.distance = preset.distance;
    }
    if (typeof preset.viewHeight === "number") {
      sceneData.orbit.viewHeight = preset.viewHeight;
    }
    if (typeof preset.targetX === "number") {
      sceneData.orbit.targetX = preset.targetX;
    }
    if (typeof preset.targetZ === "number") {
      sceneData.orbit.targetZ = preset.targetZ;
    }
  }

  function boardToWorld(row, col) {
    return {
      x: (col - (BOARD_COLS - 1) / 2) * CELL_SIZE,
      z: (row - (BOARD_ROWS - 1) / 2) * CELL_SIZE
    };
  }

  function getCellTopY(cell) {
    return getCellHeight(cell);
  }

  function getCellTerritoryLayerCount(cell) {
    if (!cell) {
      return 0;
    }
    if (cell.stack && cell.stack.length) {
      return cell.stack.length;
    }
    return cell.controller ? 1 : 0;
  }

  function getCellHeight(cell) {
    return BASE_HEIGHT +
      (cell.baseOwner ? ZONE_HEIGHT : 0) +
      (cell.isBaseCenter ? CENTER_HEIGHT : 0) +
      (getCellTerritoryLayerCount(cell) * STACK_HEIGHT);
  }

  function projectBoardCell(row, col, yOffset) {
    var state = api.getState();
    var cell = state && state.board && state.board[row] ? state.board[row][col] : null;
    var world = boardToWorld(row, col);
    var vector;
    var width;
    var height;
    if (!sceneData.camera || !sceneData.renderer) {
      return null;
    }
    vector = new THREE.Vector3(
      world.x,
      (cell ? getCellTopY(cell) : BASE_HEIGHT) + (typeof yOffset === "number" ? yOffset : 0.24),
      world.z
    );
    vector.project(sceneData.camera);
    width = sceneData.renderer.domElement.clientWidth || viewport.clientWidth || 0;
    height = sceneData.renderer.domElement.clientHeight || viewport.clientHeight || 0;
    if (!width || !height || !isFinite(vector.x) || !isFinite(vector.y) || !isFinite(vector.z)) {
      return null;
    }
    return {
      x: (vector.x * 0.5 + 0.5) * width,
      y: (-vector.y * 0.5 + 0.5) * height,
      visible: vector.z >= -1 && vector.z <= 1
    };
  }

  function ensureCoordinateOverlay() {
    var row;
    var col;
    var label;
    if (sceneData.coordinateOverlay) {
      return sceneData.coordinateOverlay;
    }
    sceneData.coordinateOverlay = document.createElement("div");
    sceneData.coordinateOverlay.className = "board-coordinate-overlay";
    viewport.appendChild(sceneData.coordinateOverlay);
    for (col = 0; col < BOARD_COLS; col += 1) {
      label = document.createElement("span");
      label.className = "board-coordinate-label col";
      label.textContent = String(col + 1);
      sceneData.coordinateOverlay.appendChild(label);
      sceneData.coordinateLabels.cols.push(label);
    }
    for (row = 0; row < BOARD_ROWS; row += 1) {
      label = document.createElement("span");
      label.className = "board-coordinate-label row";
      label.textContent = BOARD_ROW_LABELS[row] || String(row + 1);
      sceneData.coordinateOverlay.appendChild(label);
      sceneData.coordinateLabels.rows.push(label);
    }
    return sceneData.coordinateOverlay;
  }

  function placeCoordinateLabel(label, projection, offsetX, offsetY) {
    if (!label || !projection || projection.visible === false) {
      if (label) {
        label.hidden = true;
      }
      return;
    }
    label.hidden = false;
    label.style.left = (projection.x + offsetX) + "px";
    label.style.top = (projection.y + offsetY) + "px";
  }

  function updateCoordinateLabels() {
    var row;
    var col;
    var colProjection;
    var rowProjection;
    var viewerSide;
    var colLabelRow;
    var rowLabelCol;
    if (!sceneData.camera || !sceneData.renderer) {
      return;
    }
    ensureCoordinateOverlay();
    viewerSide = getViewerSide();
    colLabelRow = viewerSide === "P2" ? -COORDINATE_OUTSET : BOARD_ROWS - 1 + COORDINATE_OUTSET;
    rowLabelCol = viewerSide === "P2" ? BOARD_COLS - 1 + COORDINATE_OUTSET : -COORDINATE_OUTSET;
    for (col = 0; col < BOARD_COLS; col += 1) {
      colProjection = projectBoardCell(colLabelRow, col, 0.34);
      placeCoordinateLabel(sceneData.coordinateLabels.cols[col], colProjection, 0, 0);
    }
    for (row = 0; row < BOARD_ROWS; row += 1) {
      rowProjection = projectBoardCell(row, rowLabelCol, 0.34);
      placeCoordinateLabel(sceneData.coordinateLabels.rows[row], rowProjection, 0, 0);
    }
  }

  function getOwnerColor(owner) {
    if (owner === "P1") {
      return 0x4fbfad;
    }
    if (owner === "P2") {
      return 0xe08a68;
    }
    return 0xdfc79a;
  }

  function getSideColor(owner) {
    if (owner === "P1") {
      return 0x318f82;
    }
    if (owner === "P2") {
      return 0xbc624a;
    }
    return 0xae8b56;
  }

  function getPreviewColor(player) {
    return getOwnerColor(player);
  }

  var stoneTextureCache = {};
  var imageTextureCache = {};

  function seededRandom(seed) {
    var value = Math.sin(seed) * 10000;
    return value - Math.floor(value);
  }

  function getStoneTexture(key, base, vein, softVein) {
    if (stoneTextureCache[key]) {
      return stoneTextureCache[key];
    }

    var canvas = document.createElement("canvas");
    var size = 256;
    var ctx = canvas.getContext("2d");
    var i;
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = base;
    ctx.fillRect(0, 0, size, size);

    var glow = ctx.createRadialGradient(58, 44, 8, 58, 44, 190);
    glow.addColorStop(0, "rgba(255, 255, 255, 0.34)");
    glow.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);

    for (i = 0; i < 18; i += 1) {
      var seed = key.length * 31 + i * 17;
      var startY = seededRandom(seed) * size;
      var drift = 44 + seededRandom(seed + 1) * 80;
      ctx.beginPath();
      ctx.moveTo(-24, startY);
      ctx.bezierCurveTo(
        size * 0.28,
        startY + drift * (seededRandom(seed + 2) - 0.5),
        size * 0.62,
        startY + drift * (seededRandom(seed + 3) - 0.5),
        size + 24,
        startY + drift * (seededRandom(seed + 4) - 0.5)
      );
      ctx.strokeStyle = i % 3 === 0 ? vein : softVein;
      ctx.globalAlpha = i % 3 === 0 ? 0.32 : 0.18;
      ctx.lineWidth = i % 4 === 0 ? 2.2 : 1.1;
      ctx.lineCap = "round";
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    var texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    texture.anisotropy = 4;
    stoneTextureCache[key] = texture;
    return texture;
  }

  function getImageStoneTexture(key, url, repeatX, repeatY) {
    if (imageTextureCache[key]) {
      return imageTextureCache[key];
    }
    var texture = new THREE.TextureLoader().load(url, function () {
      texture.needsUpdate = true;
      renderScene();
    });
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX || 1, repeatY || 1);
    texture.anisotropy = 4;
    if ("colorSpace" in texture && THREE.SRGBColorSpace) {
      texture.colorSpace = THREE.SRGBColorSpace;
    } else if ("encoding" in texture && THREE.sRGBEncoding) {
      texture.encoding = THREE.sRGBEncoding;
    }
    imageTextureCache[key] = texture;
    return texture;
  }

  function createStoneMaterial(key, base, vein, options) {
    var materialOptions;
    var textureUrl;
    var repeat;
    options = options || {};
    textureUrl = options.textureUrl;
    repeat = options.textureRepeat || [1, 1];
    delete options.textureUrl;
    delete options.textureRepeat;
    materialOptions = Object.assign({
      color: 0xffffff,
      map: textureUrl
        ? getImageStoneTexture(key + "-image", textureUrl, repeat[0], repeat[1])
        : getStoneTexture(key, base, vein, "rgba(255, 255, 255, 0.36)"),
      roughness: 0.84,
      metalness: 0.02
    }, options);
    return new THREE.MeshStandardMaterial(materialOptions);
  }

  function createGeneratedStoneMaterial(key, base, vein, options) {
    var materialOptions = Object.assign({
      color: 0xffffff,
      map: getStoneTexture(key, base, vein, "rgba(255, 255, 255, 0.36)"),
      roughness: 0.84,
      metalness: 0.02
    }, options || {});
    return new THREE.MeshStandardMaterial(materialOptions);
  }

  function createScene() {
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1eee8);

    var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.shadowMap.enabled = true;
    if ("outputColorSpace" in renderer) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    } else if ("outputEncoding" in renderer) {
      renderer.outputEncoding = THREE.sRGBEncoding;
    }
    if ("toneMapping" in renderer) {
      renderer.toneMapping = THREE.LinearToneMapping || THREE.NoToneMapping || THREE.ReinhardToneMapping;
      renderer.toneMappingExposure = 0.84;
    }

    viewport.appendChild(renderer.domElement);
    document.body.classList.add("has-3d-board");
    document.body.classList.add("has-flat-board");

    scene.add(new THREE.AmbientLight(0xf8f6ef, 0.52));
    var hemi = new THREE.HemisphereLight(0xf7f5ef, 0x343a42, 0.3);
    scene.add(hemi);

    var dir = new THREE.DirectionalLight(0xfffcf2, 0.56);
    dir.position.set(6, 13, 4);
    dir.castShadow = true;
    dir.shadow.mapSize.width = 1024;
    dir.shadow.mapSize.height = 1024;
    scene.add(dir);

    var table = new THREE.Mesh(
      new THREE.CylinderGeometry(12.6, 13.6, 0.24, 64),
      createGeneratedStoneMaterial("obsidian-table-warm", "#3f3c35", "rgba(255, 248, 230, 0.18)", {
        color: 0x5f5a50,
        roughness: 0.76,
        metalness: 0.12
      })
    );
    table.position.y = -0.32;
    table.receiveShadow = true;
    scene.add(table);

    var blackFrame = new THREE.Mesh(
      new THREE.BoxGeometry(BOARD_COLS * 1.14, 0.08, BOARD_ROWS * 1.12),
      createGeneratedStoneMaterial("obsidian-board-frame-warm", "#47433c", "rgba(255, 248, 230, 0.18)", {
        color: 0x6a6257,
        roughness: 0.74,
        metalness: 0.14
      })
    );
    blackFrame.position.y = -0.13;
    blackFrame.receiveShadow = true;
    scene.add(blackFrame);

    var boardBase = new THREE.Mesh(
      new THREE.BoxGeometry(BOARD_COLS * 1.015, 0.045, BOARD_ROWS * 1.015),
      createGeneratedStoneMaterial("white-board-base", "#f2f0ea", "rgba(76, 84, 96, 0.18)", {
        color: 0xffffff,
        roughness: 0.76,
        metalness: 0.04
      })
    );
    boardBase.position.y = -0.055;
    boardBase.receiveShadow = true;
    scene.add(boardBase);
    scene.add(createBoardGridLines());

    sceneData.scene = scene;
    sceneData.camera = camera;
    sceneData.renderer = renderer;
    sceneData.markers = new THREE.Group();
    scene.add(sceneData.markers);
  }

  function createBoardGridLines() {
    var group = new THREE.Group();
    var material = new THREE.MeshBasicMaterial({
      color: 0x6f5130,
      transparent: true,
      opacity: 0.68,
      depthWrite: false
    });
    var lineWidth = 0.014;
    var lineHeight = 0.008;
    var topY = BASE_HEIGHT + 0.012;
    var i;
    var line;
    for (i = 0; i <= BOARD_COLS; i += 1) {
      line = new THREE.Mesh(
        new THREE.BoxGeometry(lineWidth, lineHeight, BOARD_ROWS * CELL_SIZE),
        material
      );
      line.position.set((i - BOARD_COLS / 2) * CELL_SIZE, topY, 0);
      group.add(line);
    }
    for (i = 0; i <= BOARD_ROWS; i += 1) {
      line = new THREE.Mesh(
        new THREE.BoxGeometry(BOARD_COLS * CELL_SIZE, lineHeight, lineWidth),
        material
      );
      line.position.set(0, topY, (i - BOARD_ROWS / 2) * CELL_SIZE);
      group.add(line);
    }
    return group;
  }

  function createCellLayerMesh(owner) {
    var materials = [
      new THREE.MeshStandardMaterial({ color: getSideColor(owner), roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: getSideColor(owner), roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: getOwnerColor(owner), roughness: 0.72 }),
      new THREE.MeshStandardMaterial({ color: getSideColor(owner), roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: getSideColor(owner), roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: getSideColor(owner), roughness: 0.9 })
    ];
    var mesh = new THREE.Mesh(new THREE.BoxGeometry(0.9, STACK_HEIGHT, 0.9), materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  function buildCells() {
    for (var row = 0; row < BOARD_ROWS; row += 1) {
      var cellRow = [];
      for (var col = 0; col < BOARD_COLS; col += 1) {
        var group = new THREE.Group();
        var base = new THREE.Mesh(
          new THREE.BoxGeometry(0.94, BASE_HEIGHT, 0.94),
          createGeneratedStoneMaterial("white-board-cell", "#f5f3ee", "rgba(71, 78, 90, 0.2)", {
            color: 0xffffff,
            roughness: 0.8
          })
        );
        base.castShadow = false;
        base.receiveShadow = true;
        base.userData = { row: row, col: col };
        base.userData.defaultMap = base.material.map;
        group.add(base);

        var ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.18, 0.025, 12, 24),
          new THREE.MeshStandardMaterial({ color: 0xbda76a, roughness: 0.34, metalness: 0.28 })
        );
        ring.rotation.x = Math.PI / 2;
        ring.visible = false;
        group.add(ring);

        var world = boardToWorld(row, col);
        group.position.set(world.x, 0, world.z);
        sceneData.scene.add(group);
        sceneData.pickables.push(base);
        cellRow.push({ group: group, base: base, ring: ring, layers: [] });
      }
      sceneData.cells.push(cellRow);
    }
  }

  function getVisiblePlacementIds(cell) {
    return (cell.stack || []).filter(function (placementId) {
      return !sceneData.hiddenPlacementIds[placementId];
    });
  }

  function updateCellVisual(row, col, cell, uiState) {
    var visual = sceneData.cells[row][col];
    var visiblePlacementIds = getVisiblePlacementIds(cell);
    var hasBuiltInTerritoryLayer = !visiblePlacementIds.length && !!cell.controller;
    var stackCount = visiblePlacementIds.length + (hasBuiltInTerritoryLayer ? 1 : 0);
    var baseHeight = BASE_HEIGHT;
    visual.base.scale.y = 1;
    visual.base.position.y = baseHeight / 2;
    visual.base.material.map = visual.base.userData.defaultMap;
    visual.base.material.color.setHex(getOwnerColor(null));
    visual.base.material.needsUpdate = true;
    visual.base.material.emissive.setHex(0x000000);
    visual.base.material.emissiveIntensity = 0;

    if (isPendingConfirmCell(uiState, row, col)) {
      visual.base.material.emissive.setHex(0xc78f18);
      visual.base.material.emissiveIntensity = 0.34;
    } else if (api.isMoveTarget(row, col) || api.isPendingFragmentPieceCell(row, col)) {
      visual.base.material.emissive.setHex(api.isPendingFragmentPieceCell(row, col) ? 0xc78f18 : 0x285bb3);
      visual.base.material.emissiveIntensity = api.isPendingFragmentPieceCell(row, col) ? 0.28 : 0.4;
    } else if (api.isReserveTarget(row, col)) {
      visual.base.material.emissive.setHex(0x1677c3);
      visual.base.material.emissiveIntensity = 0.42;
    } else if (api.isRecoverPieceTarget(row, col)) {
      visual.base.material.emissive.setHex(0xcc8b19);
      visual.base.material.emissiveIntensity = 0.38;
    } else if (api.isRecoverFragmentTarget(row, col)) {
      visual.base.material.emissive.setHex(0x6b4fad);
      visual.base.material.emissiveIntensity = 0.4;
    } else if (api.isPreviewCell(row, col)) {
      visual.base.material.emissive.setHex(uiState.previewLegal ? 0x2f8e69 : 0xa3342d);
      visual.base.material.emissiveIntensity = uiState.previewLegal ? 0.34 : 0.42;
    }

    while (visual.layers.length > stackCount) {
      visual.group.remove(visual.layers.pop());
    }
    while (visual.layers.length < stackCount) {
      var nextPlacementId = hasBuiltInTerritoryLayer ? null : visiblePlacementIds[visual.layers.length];
      var nextPlacement = nextPlacementId ? api.getPlacementById(nextPlacementId) : null;
      var nextOwner = nextPlacement ? nextPlacement.owner : null;
      var layer = createCellLayerMesh(nextOwner || cell.controller || null);
      visual.layers.push(layer);
      visual.group.add(layer);
    }

    for (var index = 0; index < visual.layers.length; index += 1) {
      var placement = hasBuiltInTerritoryLayer ? null : api.getPlacementById(visiblePlacementIds[index]);
      var owner = hasBuiltInTerritoryLayer ? cell.controller : (placement ? placement.owner : null);
      var layerMesh = visual.layers[index];
      var insetScale = Math.max(0.82, 1 - index * 0.06);
      for (var matIndex = 0; matIndex < layerMesh.material.length; matIndex += 1) {
        var isTop = matIndex === 2;
        layerMesh.material[matIndex].color.setHex(isTop ? getOwnerColor(owner) : getSideColor(owner));
      }
      layerMesh.position.y = baseHeight + (index * STACK_HEIGHT) + STACK_HEIGHT / 2;
      layerMesh.scale.set(insetScale, 1, insetScale);
    }

    visual.ring.visible = !!cell.isBaseCenter;
    visual.ring.position.y = getCellTopY(cell) + 0.03;
    if (cell.baseOwner === "P1") {
      visual.ring.material.color.setHex(0x5f8f87);
    } else if (cell.baseOwner === "P2") {
      visual.ring.material.color.setHex(0x986b66);
    } else {
      visual.ring.material.color.setHex(0xbda76a);
    }

    visual.ring.scale.set(1, 1, 1);
  }

  function makeLabelTexture(text, owner) {
    var key = owner + ":" + text;
    if (sceneData.pieceLabels.has(key)) {
      return sceneData.pieceLabels.get(key);
    }
    var canvas = document.createElement("canvas");
    var chars = Array.from(text).slice(0, 3);
    canvas.width = 256;
    canvas.height = 384;
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "bold 104px 'Yu Gothic UI', 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 13;
    ctx.strokeStyle = owner === "P1" ? "rgba(12, 42, 37, 0.9)" : "rgba(66, 26, 16, 0.9)";
    ctx.fillStyle = owner === "P1" ? "#f3fffb" : "#fff7f1";
    chars.forEach(function (char, index) {
      var y = 78 + index * 114;
      ctx.strokeText(char, canvas.width / 2, y);
      ctx.fillText(char, canvas.width / 2, y);
    });
    var texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    sceneData.pieceLabels.set(key, texture);
    return texture;
  }

  function makeTopLabelTexture(text) {
    var key = "top:" + text;
    if (sceneData.pieceLabels.has(key)) {
      return sceneData.pieceLabels.get(key);
    }
    var canvas = document.createElement("canvas");
    var label = String(text || "").slice(0, 3);
    var fontSize = label.length >= 3 ? 72 : (label.length === 2 ? 92 : 126);
    var ctx;
    canvas.width = 256;
    canvas.height = 256;
    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "bold " + fontSize + "px 'Yu Gothic UI', 'Segoe UI', sans-serif";
    while (ctx.measureText(label).width > 218 && fontSize > 42) {
      fontSize -= 4;
      ctx.font = "bold " + fontSize + "px 'Yu Gothic UI', 'Segoe UI', sans-serif";
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#111111";
    ctx.fillText(label, canvas.width / 2, canvas.height / 2 + 4);
    var texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    sceneData.pieceLabels.set(key, texture);
    return texture;
  }

  function makeDebugBadgeTexture(kind, text) {
    var key = "debug:" + kind + ":" + text;
    var palette;
    var canvas;
    var ctx;
    var texture;
    if (sceneData.pieceLabels.has(key)) {
      return sceneData.pieceLabels.get(key);
    }
    palette = {
      attack: { fill: "#2f7fd6", stroke: "#173e68", text: "#f7fbff" },
      danger: { fill: "#d65a49", stroke: "#7b241a", text: "#fff6f1" },
      hot: { fill: "#e1a12f", stroke: "#845513", text: "#fff8eb" }
    }[kind] || { fill: "#7b6950", stroke: "#473826", text: "#fff9ef" };
    canvas = document.createElement("canvas");
    canvas.width = 112;
    canvas.height = 112;
    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 42, 0, Math.PI * 2);
    ctx.fillStyle = palette.fill;
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = palette.stroke;
    ctx.stroke();
    ctx.font = "bold 42px 'Yu Gothic UI', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = palette.text;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 2);
    texture = new THREE.CanvasTexture(canvas);
    sceneData.pieceLabels.set(key, texture);
    return texture;
  }

  function makeAiDebugBadge(row, col, kind, text, xOffset, zOffset, yOffset, scale) {
    var world = boardToWorld(row, col);
    var state = api.getState();
    var cell = state.board[row][col];
    var sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: makeDebugBadgeTexture(kind, text),
        transparent: true,
        depthWrite: false,
        depthTest: false
      })
    );
    sprite.position.set(world.x + xOffset, getCellTopY(cell) + yOffset, world.z + zOffset);
    sprite.scale.set(scale, scale, 1);
    return sprite;
  }

  function makeAiDebugHotRing(row, col) {
    var world = boardToWorld(row, col);
    var state = api.getState();
    var cell = state.board[row][col];
    var ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.34, 0.035, 16, 32),
      new THREE.MeshStandardMaterial({
        color: 0xe1a12f,
        emissive: 0xe1a12f,
        emissiveIntensity: 0.28,
        roughness: 0.32,
        depthWrite: false
      })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(world.x, getCellTopY(cell) + 0.18, world.z);
    return ring;
  }

  function getPieceDisplayName(piece) {
    return api.getPieceLabel(piece.kind);
  }

  function syncLabelToggleButton() {
    if (!toggle3DLabelsBtn) {
      return;
    }
    toggle3DLabelsBtn.textContent = "立体文字: " + (sceneData.labelsEnabled ? "ON" : "OFF");
    toggle3DLabelsBtn.classList.toggle("active-tool", sceneData.labelsEnabled);
  }

  function createPieceMesh(piece) {
    var group = new THREE.Group();
    var body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 0.2, 6),
      new THREE.MeshStandardMaterial({
        color: piece.owner === "P1" ? 0xcce2de : 0xe4c0ba,
        emissive: piece.owner === "P1" ? 0x182e2b : 0x362521,
        emissiveIntensity: 0.025,
        roughness: 0.66,
        metalness: 0.04
      })
    );
    body.castShadow = true;
    body.receiveShadow = true;
    body.rotation.y = Math.PI / 6;
    body.position.y = 0.11;

    var top = new THREE.Mesh(
      new THREE.CircleGeometry(0.35, 32),
      new THREE.MeshBasicMaterial({ transparent: true })
    );
    top.rotation.x = -Math.PI / 2;
    top.position.y = 0.215;

    var raisedLabel = new THREE.Sprite(
      new THREE.SpriteMaterial({
        transparent: true,
        opacity: 0.96,
        depthWrite: false
      })
    );
    raisedLabel.position.set(0, 0.86, 0);
    raisedLabel.scale.set(0.82, 1.24, 1.24);

    group.add(body);
    group.add(top);
    group.add(raisedLabel);
    return group;
  }

  function renderPieces(state) {
    var live = {};
    ["P1", "P2"].forEach(function (player) {
      Object.keys(state.players[player].pieces).forEach(function (pieceId) {
        var piece = state.players[player].pieces[pieceId];
        live[pieceId] = true;
        var group = sceneData.pieces.get(pieceId);
        if (!group) {
          group = createPieceMesh(piece);
          sceneData.pieces.set(pieceId, group);
          sceneData.scene.add(group);
        }
        var world = boardToWorld(piece.row, piece.col);
        var cell = state.board[piece.row][piece.col];
        if (sceneData.pieceAnimations.has(piece.id)) {
          applyPieceAnimation(group, sceneData.pieceAnimations.get(piece.id), state);
        } else {
          group.position.set(world.x, getCellTopY(cell), world.z);
          group.scale.set(1, 1, 1);
        }
        group.rotation.y = piece.owner === "P1" ? -Math.PI / 2 : Math.PI / 2;
        group.children[1].material.map = makeTopLabelTexture(api.getPieceShortLabel(piece.kind));
        group.children[1].material.needsUpdate = true;
        group.children[2].visible = sceneData.labelsEnabled;
        group.children[2].material.map = makeLabelTexture(getPieceDisplayName(piece), piece.owner);
        group.children[2].material.needsUpdate = true;
        group.children[2].material.rotation = 0;
      });
    });

    Array.from(sceneData.pieces.keys()).forEach(function (pieceId) {
      if (!live[pieceId]) {
        sceneData.scene.remove(sceneData.pieces.get(pieceId));
        sceneData.pieces.delete(pieceId);
      }
    });
  }

  function easeOutCubic(value) {
    var t = 1 - value;
    return 1 - t * t * t;
  }

  function easeOutBack(value) {
    var c1 = 1.70158;
    var c3 = c1 + 1;
    return 1 + c3 * Math.pow(value - 1, 3) + c1 * Math.pow(value - 1, 2);
  }

  function easeInOutCubic(value) {
      return value < 0.5
        ? 4 * value * value * value
        : 1 - Math.pow(-2 * value + 2, 3) / 2;
    }

    function easeInCubic(value) {
      return value * value * value;
    }

  function applyPieceAnimation(group, animation, state) {
    if (animation.kind === "move") {
      var x = animation.fromWorld.x + (animation.toWorld.x - animation.fromWorld.x) * animation.progress;
      var z = animation.fromWorld.z + (animation.toWorld.z - animation.fromWorld.z) * animation.progress;
      var arc = Math.sin(animation.progress * Math.PI) * 0.24;
      var y = animation.fromY + (animation.toY - animation.fromY) * animation.progress + arc;
      group.position.set(x, y, z);
      group.scale.set(1, 1, 1);
      return;
    }

    if (animation.kind === "place") {
      var piece = api.getPieceById(animation.pieceId);
      var cell = piece ? state.board[piece.row][piece.col] : state.board[animation.row][animation.col];
      var world = boardToWorld(animation.row, animation.col);
      var endY = getCellTopY(cell);
      var yPos = animation.startY + (endY - animation.startY) * animation.progress;
      var squash = animation.progress < 0.82
        ? 0.88 + animation.progress * 0.16
        : 1 + Math.sin((animation.progress - 0.82) * Math.PI * 5) * 0.05 * (1 - animation.progress);
      group.position.set(world.x, yPos, world.z);
      group.scale.set(squash, Math.max(0.9, 1.04 - (squash - 1) * 0.8), squash);
    }
  }

    function updateAnimations(now) {
      if (sceneData.animations.length) {
        sceneData.animations = sceneData.animations.filter(function (animation) {
          var elapsed = now - animation.startTime;
          var overall = Math.max(0, Math.min(1, elapsed / animation.duration));
          var dropProgress = Math.max(0, Math.min(1, elapsed / animation.dropDuration));
          var impactProgress = Math.max(0, Math.min(1, (elapsed - animation.dropDuration) / animation.impactDuration));
          var unfoldElapsed = elapsed - animation.unfoldDelay;
          var boxOpacity = 1;
          if (elapsed < animation.dropDuration) {
            animation.group.position.y = animation.startY + (animation.dropY - animation.startY) * easeInCubic(dropProgress);
            if (animation.boxGroup) {
              animation.boxGroup.visible = true;
              animation.boxGroup.scale.set(1, 1, 1);
              setObjectOpacity(animation.boxGroup, 1);
            }
            if (animation.netGroup) {
              animation.netGroup.visible = false;
            }
          } else {
            animation.group.position.y = animation.dropY + Math.sin(impactProgress * Math.PI) * 0.055 * (1 - impactProgress);
            if (animation.boxGroup) {
              boxOpacity = 1 - impactProgress;
              animation.boxGroup.visible = boxOpacity > 0.04;
              animation.boxGroup.scale.set(
                1 + Math.sin(impactProgress * Math.PI) * 0.08,
                Math.max(0.78, 1 - Math.sin(impactProgress * Math.PI) * 0.2),
                1 + Math.sin(impactProgress * Math.PI) * 0.08
              );
              setObjectOpacity(animation.boxGroup, Math.max(0, boxOpacity));
            }
            if (animation.netGroup) {
              animation.netGroup.visible = elapsed >= animation.unfoldDelay - 40;
            }
          }
          animation.faces.forEach(function (face) {
            var local = Math.max(0, Math.min(1, (unfoldElapsed - face.delay) / face.duration));
            var eased = local < 0.74
              ? easeInOutCubic(local / 0.74) * 0.64
              : 0.64 + easeOutCubic((local - 0.74) / 0.26) * 0.36;
            face.pivot.rotation[face.axis] = face.startAngle * (1 - eased);
          });
          if (overall >= 1) {
            sceneData.scene.remove(animation.group);
            delete sceneData.hiddenPlacementIds[animation.placementId];
          return false;
        }
        return true;
      });
    }

    if (sceneData.pieceAnimations.size) {
      Array.from(sceneData.pieceAnimations.entries()).forEach(function (entry) {
        var pieceId = entry[0];
        var animation = entry[1];
        var raw = Math.max(0, Math.min(1, (now - animation.startTime) / animation.duration));
        animation.progress = animation.kind === "move" ? easeInOutCubic(raw) : easeOutBack(raw);
        if (raw >= 1) {
          sceneData.pieceAnimations.delete(pieceId);
        }
      });
    }
  }

  function startPieceMoveAnimation(pieceId, fromRow, fromCol, toRow, toCol) {
    sceneData.pieceAnimations.set(pieceId, {
      kind: "move",
      pieceId: pieceId,
      fromWorld: boardToWorld(fromRow, fromCol),
      toWorld: boardToWorld(toRow, toCol),
      fromY: getCellTopY(api.getState().board[fromRow][fromCol]),
      toY: getCellTopY(api.getState().board[toRow][toCol]),
      startTime: performance.now(),
      duration: 760,
      progress: 0
    });
  }

  function startPiecePlacementAnimation(pieceId, row, col) {
    var cell = api.getState().board[row][col];
    sceneData.pieceAnimations.set(pieceId, {
      kind: "place",
      pieceId: pieceId,
      row: row,
      col: col,
      startTime: performance.now(),
      duration: 920,
      startY: getCellTopY(cell) + 1.05,
      progress: 0
    });
  }

  function setObjectOpacity(object, opacity) {
    object.traverse(function (child) {
      var materials;
      if (!child.material) {
        return;
      }
      materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach(function (material) {
        material.transparent = opacity < 1;
        material.opacity = opacity;
        material.needsUpdate = true;
      });
    });
  }

  function startFragmentUnfoldAnimation(owner, cells, fragmentType, placementId) {
    var animation = buildFragmentAnimation(owner, cells, fragmentType, placementId);
    sceneData.hiddenPlacementIds[placementId] = true;
    sceneData.animations.push(animation);
    sceneData.scene.add(animation.group);
    return animation.duration;
  }

  function buildFragmentAnimation(owner, cells, fragmentType, placementId) {
    var localCells = cells.map(function (cell) {
      return { row: cell.row, col: cell.col };
    });
    var rootIndex = pickFragmentRoot(localCells);
    var tree = buildFragmentTree(localCells, rootIndex);
    var rootCell = localCells[rootIndex];
    var rootWorld = boardToWorld(rootCell.row, rootCell.col);
    var rootTop = getCellTopY(api.getState().board[rootCell.row][rootCell.col]);
    var group = new THREE.Group();
    var netGroup = new THREE.Group();
    var boxGroup = createFallingFragmentBox(owner);
    group.position.set(rootWorld.x, rootTop + 1.82, rootWorld.z);
    group.add(netGroup);
    group.add(boxGroup);
    netGroup.visible = false;

    var rootFace = new THREE.Object3D();
    netGroup.add(rootFace);
    rootFace.add(createFragmentFace(owner, rootIndex === 0));

    var faces = [];
    buildAnimationChildren(tree, rootIndex, rootFace, faces, owner);
    var duration = faces.reduce(function (maxDuration, face) {
      return Math.max(maxDuration, face.delay + face.duration);
    }, 0) + 260;

      return {
        placementId: placementId,
        group: group,
        boxGroup: boxGroup,
        netGroup: netGroup,
        faces: faces,
        startTime: performance.now(),
        duration: 1020 + Math.max(2260, duration),
        startY: rootTop + 1.82,
        dropY: rootTop + STACK_HEIGHT / 2,
        endY: rootTop + STACK_HEIGHT / 2,
        dropDuration: 760,
        impactDuration: 260,
        unfoldDelay: 1020,
        rootRow: rootCell.row,
        rootCol: rootCell.col
      };
  }

  function createFallingFragmentBox(owner) {
    var topColor = owner === "P1" ? 0x86b8b1 : 0xc58d84;
    var sideColor = owner === "P1" ? 0x4f766f : 0x7b5552;
    var edgeColor = owner === "P1" ? 0xd9efea : 0xf0d9d1;
    var group = new THREE.Group();
    var bodyMaterials = [
      new THREE.MeshStandardMaterial({ color: sideColor, roughness: 0.76, metalness: 0.04 }),
      new THREE.MeshStandardMaterial({ color: sideColor, roughness: 0.76, metalness: 0.04 }),
      new THREE.MeshStandardMaterial({ color: topColor, roughness: 0.62, metalness: 0.05 }),
      new THREE.MeshStandardMaterial({ color: sideColor, roughness: 0.82, metalness: 0.02 }),
      new THREE.MeshStandardMaterial({ color: sideColor, roughness: 0.76, metalness: 0.04 }),
      new THREE.MeshStandardMaterial({ color: sideColor, roughness: 0.76, metalness: 0.04 })
    ];
    var body = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.68, 0.82), bodyMaterials);
    var lidLineA = new THREE.Mesh(
      new THREE.BoxGeometry(0.86, 0.022, 0.048),
      new THREE.MeshStandardMaterial({ color: edgeColor, roughness: 0.48, metalness: 0.12 })
    );
    var lidLineB = new THREE.Mesh(
      new THREE.BoxGeometry(0.048, 0.024, 0.86),
      new THREE.MeshStandardMaterial({ color: edgeColor, roughness: 0.48, metalness: 0.12 })
    );
    body.position.y = 0.34;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);
    lidLineA.position.y = 0.704;
    lidLineB.position.y = 0.708;
    group.add(lidLineA);
    group.add(lidLineB);
    return group;
  }

  function buildAnimationChildren(tree, nodeIndex, parentFrame, faces, owner) {
    tree[nodeIndex].children.forEach(function (childIndex) {
      var edge = tree[childIndex].edgeFromParent;
      var pivot = new THREE.Object3D();
      pivot.position.set(edge.dc * CELL_SIZE * 0.5, 0, edge.dr * CELL_SIZE * 0.5);
      parentFrame.add(pivot);

      var faceFrame = new THREE.Object3D();
      faceFrame.position.set(edge.dc * CELL_SIZE * 0.5, 0, edge.dr * CELL_SIZE * 0.5);
      pivot.add(faceFrame);
      faceFrame.add(createFragmentFace(owner, false));

      var rotationInfo = getFoldRotation(edge.dr, edge.dc);
      pivot.rotation[rotationInfo.axis] = rotationInfo.angle;
        faces.push({
          pivot: pivot,
          axis: rotationInfo.axis,
          startAngle: rotationInfo.angle,
          delay: tree[childIndex].depth * 240,
          duration: 1080
        });

      buildAnimationChildren(tree, childIndex, faceFrame, faces, owner);
    });
  }

  function createFragmentFace(owner, highlightRoot) {
    var topColor = owner === "P1" ? 0x86b8b1 : 0xc58d84;
    var sideColor = owner === "P1" ? 0x5f8f87 : 0x986b66;
    var group = new THREE.Group();
    var body = new THREE.Mesh(
      new THREE.BoxGeometry(0.92, STACK_HEIGHT, 0.92),
      [
        new THREE.MeshStandardMaterial({ color: sideColor, roughness: 0.88 }),
        new THREE.MeshStandardMaterial({ color: sideColor, roughness: 0.88 }),
        new THREE.MeshStandardMaterial({ color: topColor, roughness: 0.72 }),
        new THREE.MeshStandardMaterial({ color: sideColor, roughness: 0.88 }),
        new THREE.MeshStandardMaterial({ color: sideColor, roughness: 0.88 }),
        new THREE.MeshStandardMaterial({ color: sideColor, roughness: 0.88 })
      ]
    );
    body.position.y = STACK_HEIGHT * 0.5;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    if (highlightRoot) {
      var cap = new THREE.Mesh(
        new THREE.BoxGeometry(0.46, 0.03, 0.46),
        new THREE.MeshStandardMaterial({ color: 0xe8e3d5, emissive: 0x8f7337, emissiveIntensity: 0.12 })
      );
      cap.position.y = STACK_HEIGHT + 0.02;
      group.add(cap);
    }

    return group;
  }

  function pickFragmentRoot(cells) {
    var bestIndex = 0;
    var bestScore = -1;
    cells.forEach(function (cell, index) {
      var degree = 0;
      cells.forEach(function (other) {
        if (Math.abs(other.row - cell.row) + Math.abs(other.col - cell.col) === 1) {
          degree += 1;
        }
      });
      if (degree > bestScore) {
        bestScore = degree;
        bestIndex = index;
      }
    });
    return bestIndex;
  }

  function buildFragmentTree(cells, rootIndex) {
    var tree = cells.map(function () {
      return { children: [], parent: null, edgeFromParent: null, depth: 0 };
    });
    var queue = [rootIndex];
    var seen = {};
    seen[rootIndex] = true;
    while (queue.length) {
      var current = queue.shift();
      cells.forEach(function (cell, index) {
        var dr;
        var dc;
        if (seen[index]) {
          return;
        }
        dr = cell.row - cells[current].row;
        dc = cell.col - cells[current].col;
        if (Math.abs(dr) + Math.abs(dc) !== 1) {
          return;
        }
        seen[index] = true;
        tree[index].parent = current;
        tree[index].edgeFromParent = { dr: dr, dc: dc };
        tree[index].depth = tree[current].depth + 1;
        tree[current].children.push(index);
        queue.push(index);
      });
    }
    return tree;
  }

  function getFoldRotation(dr, dc) {
    if (dr === -1) {
      return { axis: "x", angle: Math.PI / 2 };
    }
    if (dr === 1) {
      return { axis: "x", angle: -Math.PI / 2 };
    }
    if (dc === -1) {
      return { axis: "z", angle: -Math.PI / 2 };
    }
    return { axis: "z", angle: Math.PI / 2 };
  }

  function clearMarkers() {
    while (sceneData.markers.children.length) {
      sceneData.markers.remove(sceneData.markers.children[0]);
    }
  }

  function makeDisc(row, col, color, radius, yOffset) {
    var world = boardToWorld(row, col);
    var state = api.getState();
    var cell = state.board[row][col];
    var mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, 0.04, 24),
      new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.22 })
    );
    mesh.position.set(world.x, getCellTopY(cell) + yOffset, world.z);
    return mesh;
  }

  function makePendingPieceMarker(row, col) {
    var world = boardToWorld(row, col);
    var state = api.getState();
    var cell = state.board[row][col];
    var group = new THREE.Group();
    var ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.24, 0.045, 16, 28),
      new THREE.MeshStandardMaterial({
        color: 0xd5a233,
        emissive: 0xd5a233,
        emissiveIntensity: 0.24,
        roughness: 0.34
      })
    );
    var dot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.045, 18),
      new THREE.MeshStandardMaterial({
        color: 0xf0d28d,
        emissive: 0xb58722,
        emissiveIntensity: 0.18,
        roughness: 0.3
      })
    );
    var y = getCellTopY(cell) + 0.08;
    ring.rotation.x = Math.PI / 2;
    ring.position.set(world.x, y, world.z);
    dot.position.set(world.x, y + 0.01, world.z);
    group.add(ring);
    group.add(dot);
    return group;
  }

  function isPendingConfirmCell(uiState, row, col) {
    return !!(
      uiState &&
      uiState.pendingPlacement &&
      (uiState.pendingPlacement.type === "fragmentPiece" || uiState.pendingPlacement.type === "move") &&
      uiState.pendingPlacement.row === row &&
      uiState.pendingPlacement.col === col
    );
  }

  function isSelectedPieceCell(uiState, row, col) {
    var piece;
    if (!(uiState && uiState.selection && (uiState.selection.type === "piece" || uiState.selection.type === "piecePreview"))) {
      return false;
    }
    piece = api.getPieceById(uiState.selection.pieceId);
    return !!piece && piece.row === row && piece.col === col;
  }

  function makeConfirmCellMarker(row, col) {
    var world = boardToWorld(row, col);
    var state = api.getState();
    var cell = state.board[row][col];
    var group = new THREE.Group();
    var ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.055, 18, 32),
      new THREE.MeshStandardMaterial({
        color: 0xf0d28d,
        emissive: 0xd7a93b,
        emissiveIntensity: 0.34,
        roughness: 0.28
      })
    );
    var plate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.04, 24),
      new THREE.MeshStandardMaterial({
        color: 0xf5e1b0,
        emissive: 0xbd8f28,
        emissiveIntensity: 0.2,
        roughness: 0.24
      })
    );
    var y = getCellTopY(cell) + 0.12;
    ring.rotation.x = Math.PI / 2;
    ring.position.set(world.x, y, world.z);
    plate.position.set(world.x, y + 0.01, world.z);
    group.add(ring);
    group.add(plate);
    return group;
  }

  function makeMoveTargetMarker(row, col) {
    var state = api.getState();
    var cell = state.board[row][col];
    var hasPiece = !!cell.pieceId;
    if (hasPiece) {
      var world = boardToWorld(row, col);
      var ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.28, 0.04, 16, 28),
        new THREE.MeshStandardMaterial({
          color: 0x3368c1,
          emissive: 0x3368c1,
          emissiveIntensity: 0.28,
          roughness: 0.36
        })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.set(world.x, getCellTopY(cell) + 0.34, world.z);
      return ring;
    }
    return makeDisc(row, col, 0x3368c1, 0.13, 0.05);
  }

  function makePreviewBlock(row, col, color) {
    var world = boardToWorld(row, col);
    var state = api.getState();
    var cell = state.board[row][col];
    var mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.92, 0.08, 0.92),
      new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.18,
        transparent: true,
        opacity: 0.62,
        roughness: 0.36
      })
    );
    mesh.position.set(world.x, getCellTopY(cell) + 0.06, world.z);
    return mesh;
  }

  function makeComparePieceMarker(row, col) {
    var world = boardToWorld(row, col);
    var state = api.getState();
    var cell = state.board[row][col];
    var mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.82, 0.05, 0.82),
      new THREE.MeshStandardMaterial({
        color: 0xd9a63d,
        emissive: 0x9f731f,
        emissiveIntensity: 0.24,
        transparent: true,
        opacity: 0.78
      })
    );
    mesh.position.set(world.x, getCellTopY(cell) + 0.12, world.z);
    return mesh;
  }

  function makeCompareControlMarker(row, col) {
    var world = boardToWorld(row, col);
    var state = api.getState();
    var cell = state.board[row][col];
    var ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.24, 0.03, 14, 28),
      new THREE.MeshStandardMaterial({
        color: 0x1a8b82,
        emissive: 0x1a8b82,
        emissiveIntensity: 0.2,
        roughness: 0.38
      })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(world.x, getCellTopY(cell) + 0.08, world.z);
    return ring;
  }

  function makeBlockedPreview(row, col) {
    var world = boardToWorld(row, col);
    var state = api.getState();
    var cell = state.board[row][col];
    var group = new THREE.Group();
    var material = new THREE.MeshStandardMaterial({
      color: 0xb64034,
      emissive: 0x6b1f18,
      emissiveIntensity: 0.2,
      roughness: 0.42
    });
    var barA = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.06, 0.12), material);
    var barB = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.06, 0.12), material.clone());
    var y = getCellTopY(cell) + 0.07;
    barA.position.set(world.x, y, world.z);
    barB.position.set(world.x, y, world.z);
    barA.rotation.y = Math.PI / 4;
    barB.rotation.y = -Math.PI / 4;
    group.add(barA);
    group.add(barB);
    return group;
  }

  function renderMarkers(state, uiState) {
    var overlay = api.getAiDebugOverlay ? api.getAiDebugOverlay() : null;
    var compareOverlay = api.getCompareOverlay ? api.getCompareOverlay() : null;
    clearMarkers();
    for (var row = 0; row < BOARD_ROWS; row += 1) {
      for (var col = 0; col < BOARD_COLS; col += 1) {
        var debugCell = overlay && overlay.cells[row] ? overlay.cells[row][col] : null;
        var compareCell = compareOverlay && compareOverlay.cells[row] ? compareOverlay.cells[row][col] : null;
        if (api.isMoveTarget(row, col) && !isPendingConfirmCell(uiState, row, col)) {
          sceneData.markers.add(makeMoveTargetMarker(row, col));
        }
        if (isSelectedPieceCell(uiState, row, col)) {
          sceneData.markers.add(makeDisc(row, col, 0x2e61b8, 0.14, 0.08));
        }
        if (api.isReserveTarget(row, col)) {
          sceneData.markers.add(makeDisc(row, col, 0x1180cc, 0.12, 0.05));
        }
        if (api.isRecoverPieceTarget(row, col)) {
          sceneData.markers.add(makePreviewBlock(row, col, 0xd28f1c));
        }
        if (api.isRecoverFragmentTarget(row, col)) {
          sceneData.markers.add(makePreviewBlock(row, col, 0x7652b8));
        }
        if (api.isPreviewCell(row, col)) {
          sceneData.markers.add(
            uiState.previewLegal
              ? makePreviewBlock(row, col, getPreviewColor(state.currentPlayer))
              : makeBlockedPreview(row, col)
          );
        }
        if (api.isPendingFragmentPieceCell(row, col)) {
          sceneData.markers.add(makePendingPieceMarker(row, col));
        }
        if (isPendingConfirmCell(uiState, row, col)) {
          sceneData.markers.add(makeConfirmCellMarker(row, col));
        }
        if (compareCell) {
          if (compareCell.controlChanged) {
            sceneData.markers.add(makeCompareControlMarker(row, col));
          }
          if (compareCell.pieceChanged) {
            sceneData.markers.add(makeComparePieceMarker(row, col));
          }
        }
        if (overlay && debugCell) {
          if (overlay.showDanger && debugCell.dangerCount > 0) {
            sceneData.markers.add(makeDisc(row, col, 0xc8533f, 0.08 + Math.min(debugCell.dangerCount, 5) * 0.012, 0.1));
            sceneData.markers.add(makeAiDebugBadge(row, col, "danger", String(debugCell.dangerCount), -0.24, -0.24, 0.26, 0.34));
          }
          if (overlay.showAttack && debugCell.attackCount > 0) {
            sceneData.markers.add(makeDisc(row, col, 0x2d7bd0, 0.06 + Math.min(debugCell.attackCount, 5) * 0.012, 0.15));
            sceneData.markers.add(makeAiDebugBadge(row, col, "attack", String(debugCell.attackCount), -0.24, 0.24, 0.31, 0.34));
          }
          if (overlay.showDanger && debugCell.hotCount > 0) {
            sceneData.markers.add(makeAiDebugHotRing(row, col));
            sceneData.markers.add(makeAiDebugBadge(row, col, "hot", debugCell.hotCount > 1 ? String(debugCell.hotCount) : "!", 0.24, -0.24, 0.36, 0.3));
          }
        }
      }
    }
  }

  function renderScene() {
    var state = api.getState();
    var uiState = api.getUiState();
    if (!state || !sceneData.scene) {
      return;
    }
    for (var row = 0; row < BOARD_ROWS; row += 1) {
      for (var col = 0; col < BOARD_COLS; col += 1) {
        updateCellVisual(row, col, state.board[row][col], uiState);
      }
    }
    renderPieces(state);
    renderMarkers(state, uiState);
    updateCoordinateLabels();
  }

  function resizeRenderer() {
    var rect = viewport.getBoundingClientRect();
    var aspect = rect.height ? rect.width / rect.height : 1;
    syncBoardViewMode();
    var viewHeight = sceneData.orbit.viewHeight || DEFAULT_CAMERA_ORBIT.viewHeight;
    var viewWidth = viewHeight * aspect;
    sceneData.renderer.setSize(rect.width, rect.height);
    sceneData.camera.left = -viewWidth / 2;
    sceneData.camera.right = viewWidth / 2;
    sceneData.camera.top = viewHeight / 2;
    sceneData.camera.bottom = -viewHeight / 2;
    sceneData.camera.updateProjectionMatrix();
    syncReviewOverlay();
    updateCoordinateLabels();
  }

  function updateCameraPosition() {
    var orbit = sceneData.orbit;
    var side = getViewerSide();
    var viewMode = sceneData.orbit.viewMode || getBoardViewMode();
    if (viewMode === "landscape") {
      sceneData.camera.up.set(0, 0, side === "P2" ? -1 : 1);
    } else {
      sceneData.camera.up.set(side === "P2" ? -1 : 1, 0, 0);
    }
    sceneData.camera.position.set(orbit.targetX, orbit.distance, orbit.targetZ);
    sceneData.camera.lookAt(orbit.targetX, 0, orbit.targetZ);
    syncReviewOverlay();
    updateCoordinateLabels();
  }

  function panCameraByScreenDelta(dx, dy) {
    var scale = (sceneData.orbit.viewHeight || DEFAULT_CAMERA_ORBIT.viewHeight) / Math.max(360, viewport.clientHeight || 360);
    var upX = sceneData.camera.up.x;
    var upZ = sceneData.camera.up.z;
    var rightX = -upZ;
    var rightZ = upX;
    var worldDx = (-dx * rightX + dy * upX) * scale;
    var worldDz = (-dx * rightZ + dy * upZ) * scale;
    sceneData.orbit.targetX = Math.max(-4.8, Math.min(4.8, sceneData.orbit.targetX + worldDx));
    sceneData.orbit.targetZ = Math.max(-3.2, Math.min(3.2, sceneData.orbit.targetZ + worldDz));
  }

  function handleViewportResize() {
    resizeRenderer();
    updateCameraPosition();
    renderScene();
  }

  function pickCell(event) {
    var rect = sceneData.renderer.domElement.getBoundingClientRect();
    sceneData.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    sceneData.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    sceneData.raycaster.setFromCamera(sceneData.pointer, sceneData.camera);
    var hits = sceneData.raycaster.intersectObjects(sceneData.pickables, false);
    return hits.length ? hits[0].object.userData : null;
  }

  function onPointerDown(event) {
    if (event.button !== 0) {
      return;
    }
    sceneData.orbit.dragging = true;
    sceneData.orbit.moved = false;
    sceneData.orbit.mode = "pan";
    sceneData.orbit.lastX = event.clientX;
    sceneData.orbit.lastY = event.clientY;
  }

  function onPointerUp() {
    sceneData.orbit.dragging = false;
  }

  function onPointerMove(event) {
    var orbit = sceneData.orbit;
    if (orbit.dragging) {
      var dx = event.clientX - orbit.lastX;
      var dy = event.clientY - orbit.lastY;
      if (Math.abs(dx) + Math.abs(dy) > 2) {
        orbit.moved = true;
      }
      orbit.lastX = event.clientX;
      orbit.lastY = event.clientY;
      panCameraByScreenDelta(dx, dy);
      updateCameraPosition();
      return;
    }

    var hit = pickCell(event);
    if (hit) {
      api.handleCellHover(hit.row, hit.col);
    }
  }

  function onWheel(event) {
    event.preventDefault();
    sceneData.orbit.userZoomed = true;
    sceneData.orbit.viewHeight = Math.max(10.6, Math.min(22, sceneData.orbit.viewHeight + event.deltaY * 0.01));
    resizeRenderer();
    updateCameraPosition();
  }

  function onSceneClick(event) {
    api.hideContextMenu();
    if (sceneData.orbit.moved) {
      sceneData.orbit.moved = false;
      return;
    }
    var hit = pickCell(event);
    if (hit) {
      api.handleCellClick(hit.row, hit.col, event);
    }
  }

  function onSceneContextMenu(event) {
    event.preventDefault();
    if (typeof api.hasPendingFragmentPiece === "function" && api.hasPendingFragmentPiece()) {
      return;
    }
    if (api.hasSelection()) {
      api.clearSelection();
      if (typeof api.render === "function") {
        api.render();
      } else {
        renderScene();
      }
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    updateAnimations(performance.now());
    renderScene();
    sceneData.renderer.render(sceneData.scene, sceneData.camera);
  }

  createScene();
  buildCells();
  resetCameraView();
  window.addEventListener("resize", handleViewportResize);
  if (toggle3DLabelsBtn) {
    toggle3DLabelsBtn.addEventListener("click", function () {
      sceneData.labelsEnabled = !sceneData.labelsEnabled;
      syncLabelToggleButton();
      renderScene();
    });
  }
  sceneData.renderer.domElement.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointermove", onPointerMove);
  sceneData.renderer.domElement.addEventListener("click", onSceneClick);
  sceneData.renderer.domElement.addEventListener("contextmenu", onSceneContextMenu);
  sceneData.renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

  window.UNFOLD_3D_RENDERER = {
    renderScene: renderScene,
    resetCameraView: resetCameraView,
    projectBoardCell: projectBoardCell,
    startPieceMoveAnimation: startPieceMoveAnimation,
    startPiecePlacementAnimation: startPiecePlacementAnimation,
    startFragmentUnfoldAnimation: startFragmentUnfoldAnimation
  };

  syncLabelToggleButton();
  renderScene();
  animate();
})();
