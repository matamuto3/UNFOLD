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
    orbit: {
      yaw: -0.65,
      pitch: 0.98,
      distance: 14.2,
      dragging: false,
      moved: false,
      lastX: 0,
      lastY: 0,
      mode: "rotate",
      targetX: 0,
      targetZ: 0
    }
  };

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

    var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
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
      new THREE.SpriteMaterial({
        transparent: true,
        opacity: 0.96,
        depthWrite: false
      })
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
          var easedDrop = overall < 0.72
            ? easeInCubic(overall / 0.72) * 0.56
            : 0.56 + easeOutCubic((overall - 0.72) / 0.28) * 0.44;
          animation.group.position.y = animation.startY + (animation.endY - animation.startY) * easedDrop;
          animation.faces.forEach(function (face) {
            var local = Math.max(0, Math.min(1, (elapsed - face.delay) / face.duration));
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

  function startFragmentUnfoldAnimation(owner, cells, fragmentType, placementId) {
    var animation = buildFragmentAnimation(owner, cells, fragmentType, placementId);
    sceneData.hiddenPlacementIds[placementId] = true;
    sceneData.animations.push(animation);
    sceneData.scene.add(animation.group);
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
    group.position.set(rootWorld.x, rootTop + 1.15, rootWorld.z);

    var rootFace = new THREE.Object3D();
    group.add(rootFace);
    rootFace.add(createFragmentFace(owner, rootIndex === 0));

    var faces = [];
    buildAnimationChildren(tree, rootIndex, rootFace, faces, owner);

      return {
        placementId: placementId,
        group: group,
        faces: faces,
        startTime: performance.now(),
        duration: 2260,
        startY: rootTop + 1.15,
        endY: rootTop + STACK_HEIGHT / 2,
        rootRow: rootCell.row,
        rootCol: rootCell.col
      };
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
    var topColor = owner === "P1" ? 0x6a9b90 : 0xaf6e57;
    var sideColor = owner === "P1" ? 0x44655e : 0x7a4838;
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
        new THREE.MeshStandardMaterial({ color: 0xe5d2ad, emissive: 0x6f5325, emissiveIntensity: 0.14 })
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
      uiState.pendingPlacement.type === "fragmentPiece" &&
      uiState.pendingPlacement.row === row &&
      uiState.pendingPlacement.col === col
    );
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
      new THREE.MeshStandardMaterial({ color: color, transparent: true, opacity: 0.38 })
    );
    mesh.position.set(world.x, getCellTopY(cell) + 0.06, world.z);
    return mesh;
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
    clearMarkers();
    for (var row = 0; row < BOARD_ROWS; row += 1) {
      for (var col = 0; col < BOARD_COLS; col += 1) {
        if (api.isMoveTarget(row, col)) {
          sceneData.markers.add(makeMoveTargetMarker(row, col));
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
  }

  function resizeRenderer() {
    var rect = viewport.getBoundingClientRect();
    sceneData.renderer.setSize(rect.width, rect.height);
    sceneData.camera.aspect = rect.width / rect.height;
    sceneData.camera.updateProjectionMatrix();
  }

  function updateCameraPosition() {
    var orbit = sceneData.orbit;
    var x = Math.cos(orbit.yaw) * Math.sin(orbit.pitch) * orbit.distance;
    var y = Math.cos(orbit.pitch) * orbit.distance;
    var z = Math.sin(orbit.yaw) * Math.sin(orbit.pitch) * orbit.distance;
    sceneData.camera.position.set(x + orbit.targetX, y, z + orbit.targetZ);
    sceneData.camera.lookAt(orbit.targetX, 0, orbit.targetZ);
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
    sceneData.orbit.mode = event.shiftKey ? "pan" : "rotate";
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
      if (orbit.mode === "pan") {
        orbit.targetX -= dx * 0.018;
        orbit.targetZ -= dy * 0.018;
        orbit.targetX = Math.max(-4.5, Math.min(4.5, orbit.targetX));
        orbit.targetZ = Math.max(-3.5, Math.min(3.5, orbit.targetZ));
      } else {
        orbit.yaw -= dx * 0.008;
        orbit.pitch = Math.max(0.52, Math.min(1.28, orbit.pitch + dy * 0.008));
      }
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
    sceneData.orbit.distance = Math.max(10, Math.min(23, sceneData.orbit.distance + event.deltaY * 0.01));
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
    if (api.hasSelection()) {
      api.openContextMenu(event.clientX, event.clientY);
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
  applyCameraPreset();
  resizeRenderer();
  updateCameraPosition();
  window.addEventListener("resize", resizeRenderer);
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
    startPieceMoveAnimation: startPieceMoveAnimation,
    startPiecePlacementAnimation: startPiecePlacementAnimation,
    startFragmentUnfoldAnimation: startFragmentUnfoldAnimation
  };

  syncLabelToggleButton();
  renderScene();
  animate();
})();
