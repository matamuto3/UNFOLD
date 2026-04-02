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
  var CELL_SIZE = 1;
  var BASE_HEIGHT = 0.18;
  var ZONE_HEIGHT = 0.12;
  var CENTER_HEIGHT = 0.07;
  var STACK_HEIGHT = 0.12;
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
    labelsEnabled: true,
    orbit: { yaw: -0.65, pitch: 0.92, distance: 15.5, dragging: false, moved: false, lastX: 0, lastY: 0 }
  };

  function boardToWorld(row, col) {
    return {
      x: (col - (BOARD_COLS - 1) / 2) * CELL_SIZE,
      z: (row - (BOARD_ROWS - 1) / 2) * CELL_SIZE
    };
  }

  function getCellTopY(cell) {
    return getCellHeight(cell);
  }

  function getCellHeight(cell) {
    return BASE_HEIGHT +
      (cell.baseOwner ? ZONE_HEIGHT : 0) +
      (cell.isBaseCenter ? CENTER_HEIGHT : 0) +
      ((cell.stack ? cell.stack.length : 0) * STACK_HEIGHT);
  }

  function getOwnerColor(owner) {
    if (owner === "P1") {
      return 0x6a9b90;
    }
    if (owner === "P2") {
      return 0xaf6e57;
    }
    return 0xa88d64;
  }

  function getSideColor(owner) {
    if (owner === "P1") {
      return 0x44655e;
    }
    if (owner === "P2") {
      return 0x7a4838;
    }
    return 0x70593a;
  }

  function getPreviewColor(player) {
    return player === "P1" ? 0x6a9b90 : 0xaf6e57;
  }

  function createScene() {
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x5c452d);

    var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.shadowMap.enabled = true;
    if ("outputColorSpace" in renderer) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    } else if ("outputEncoding" in renderer) {
      renderer.outputEncoding = THREE.sRGBEncoding;
    }

    viewport.appendChild(renderer.domElement);
    document.body.classList.add("has-3d-board");

    scene.add(new THREE.AmbientLight(0xd8bc8f, 0.26));
    var hemi = new THREE.HemisphereLight(0xcdae7a, 0x3a2a1a, 0.34);
    scene.add(hemi);

    var dir = new THREE.DirectionalLight(0xf2ddb5, 0.62);
    dir.position.set(8, 12, 6);
    dir.castShadow = true;
    dir.shadow.mapSize.width = 1024;
    dir.shadow.mapSize.height = 1024;
    scene.add(dir);

    var table = new THREE.Mesh(
      new THREE.CylinderGeometry(13, 14.4, 1.1, 48),
      new THREE.MeshStandardMaterial({ color: 0x4f3922, roughness: 0.98 })
    );
    table.position.y = -0.78;
    table.receiveShadow = true;
    scene.add(table);

    var boardBase = new THREE.Mesh(
      new THREE.BoxGeometry(BOARD_COLS * 1.05, 0.38, BOARD_ROWS * 1.05),
      new THREE.MeshStandardMaterial({ color: 0x654728, roughness: 0.9 })
    );
    boardBase.position.y = -0.2;
    boardBase.receiveShadow = true;
    scene.add(boardBase);

    sceneData.scene = scene;
    sceneData.camera = camera;
    sceneData.renderer = renderer;
    sceneData.markers = new THREE.Group();
    scene.add(sceneData.markers);
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
          new THREE.BoxGeometry(0.96, BASE_HEIGHT, 0.96),
          new THREE.MeshStandardMaterial({ color: 0xa88d64, roughness: 0.9 })
        );
        base.castShadow = true;
        base.receiveShadow = true;
        base.userData = { row: row, col: col };
        group.add(base);

        var ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.18, 0.025, 12, 24),
          new THREE.MeshStandardMaterial({ color: 0x6d5130, roughness: 0.4, metalness: 0.15 })
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
    var stackCount = visiblePlacementIds.length;
    var baseHeight = BASE_HEIGHT + (cell.baseOwner ? ZONE_HEIGHT : 0) + (cell.isBaseCenter ? CENTER_HEIGHT : 0);
    visual.base.scale.y = baseHeight / BASE_HEIGHT;
    visual.base.position.y = baseHeight / 2;
    visual.base.material.color.setHex(getOwnerColor(cell.controller || cell.baseOwner || null));
    visual.base.material.emissive.setHex(0x000000);
    visual.base.material.emissiveIntensity = 0;

    if (api.isMoveTarget(row, col) || api.isPendingFragmentPieceCell(row, col)) {
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
      var nextPlacementId = visiblePlacementIds[visual.layers.length];
      var nextPlacement = nextPlacementId ? api.getPlacementById(nextPlacementId) : null;
      var nextOwner = nextPlacement ? nextPlacement.owner : null;
      var layer = createCellLayerMesh(nextOwner || cell.controller || cell.baseOwner || null);
      visual.layers.push(layer);
      visual.group.add(layer);
    }

    for (var index = 0; index < visual.layers.length; index += 1) {
      var placement = api.getPlacementById(visiblePlacementIds[index]);
      var owner = placement ? placement.owner : null;
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
      visual.ring.material.color.setHex(0x1f6658);
    } else if (cell.baseOwner === "P2") {
      visual.ring.material.color.setHex(0x8c3f26);
    } else {
      visual.ring.material.color.setHex(0x6d5130);
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
    canvas.width = 192;
    canvas.height = 320;
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "bold 96px 'Yu Gothic UI', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 12;
    ctx.strokeStyle = owner === "P1" ? "rgba(12, 42, 37, 0.9)" : "rgba(66, 26, 16, 0.9)";
    ctx.fillStyle = owner === "P1" ? "#f3fffb" : "#fff7f1";
    chars.forEach(function (char, index) {
      var y = 64 + index * 98;
      ctx.strokeText(char, canvas.width / 2, y);
      ctx.fillText(char, canvas.width / 2, y);
    });
    var texture = new THREE.CanvasTexture(canvas);
    sceneData.pieceLabels.set(key, texture);
    return texture;
  }

  function makeTopLabelTexture(text) {
    var key = "top:" + text;
    if (sceneData.pieceLabels.has(key)) {
      return sceneData.pieceLabels.get(key);
    }
    var canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "bold 82px 'Yu Gothic UI', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#111111";
    ctx.fillText(text, canvas.width / 2, 70);
    var texture = new THREE.CanvasTexture(canvas);
    sceneData.pieceLabels.set(key, texture);
    return texture;
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
        color: piece.owner === "P1" ? 0xa4ddd1 : 0xefb59d,
        emissive: piece.owner === "P1" ? 0x183b34 : 0x4f2316,
        emissiveIntensity: 0.05,
        roughness: 0.72
      })
    );
    body.castShadow = true;
    body.receiveShadow = true;
    body.rotation.y = Math.PI / 6;
    body.position.y = 0.11;

    var top = new THREE.Mesh(
      new THREE.CircleGeometry(0.29, 28),
      new THREE.MeshBasicMaterial({ transparent: true })
    );
    top.rotation.x = -Math.PI / 2;
    top.position.y = 0.215;

    var raisedLabel = new THREE.Sprite(
      new THREE.SpriteMaterial({ transparent: true, opacity: 0.96, depthWrite: false })
    );
    raisedLabel.position.set(0, 0.74, 0);
    raisedLabel.scale.set(0.7, 1.05, 1.05);

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
})();
