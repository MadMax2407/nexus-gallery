// Construcción geométrica del entorno: salas, pasillo y pedestales con piezas.
(function () {
  const cfg = Nexus.config;
  const scene = Nexus.scene;
  const H = cfg.wallHeight;
  const T = cfg.wallThickness;

  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x8a8d93, roughness: 0.9 });
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x55575c, roughness: 0.8 });
  const pedestalMaterial = new THREE.MeshStandardMaterial({ color: 0x6f7278, roughness: 0.6 });
  const pieceMaterial = new THREE.MeshStandardMaterial({ color: 0x9fb8d9, roughness: 0.3, metalness: 0.2 });

  function addBox(width, height, depth, x, y, z, material) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(x, y, z);
    scene.add(mesh);
  }

  // Sala cuadrada con un vano central en las paredes frontal y trasera.
  function buildRoom(centerZ) {
    const size = cfg.roomSize;
    const half = size / 2;
    const segment = (size - cfg.doorWidth) / 2;
    const segmentOffset = half - segment / 2;

    addBox(size, T, size, 0, 0, centerZ, floorMaterial);
    addBox(size, T, size, 0, H, centerZ, wallMaterial);
    addBox(T, H, size, -half, H / 2, centerZ, wallMaterial);
    addBox(T, H, size, half, H / 2, centerZ, wallMaterial);

    [-half, half].forEach(offsetZ => {
      addBox(segment, H, T, -segmentOffset, H / 2, centerZ + offsetZ, wallMaterial);
      addBox(segment, H, T, segmentOffset, H / 2, centerZ + offsetZ, wallMaterial);
    });
  }

  // Pasillo entre ambas salas: paredes laterales, piso y techo.
  function buildHallway(centerZ) {
    const length = cfg.hallwayLength;
    const sideX = cfg.doorWidth / 2;
    addBox(T, H, length, -sideX, H / 2, centerZ, wallMaterial);
    addBox(T, H, length, sideX, H / 2, centerZ, wallMaterial);
    addBox(cfg.doorWidth, T, length, 0, 0, centerZ, floorMaterial);
    addBox(cfg.doorWidth, T, length, 0, H, centerZ, wallMaterial);
  }

  // Pedestales con piezas provisionales (geometrías primitivas).
  function buildPedestals(roomCenters) {
    const pieceShapes = [
      () => new THREE.IcosahedronGeometry(0.6, 0),
      () => new THREE.TorusKnotGeometry(0.4, 0.15, 80, 12),
      () => new THREE.OctahedronGeometry(0.65, 0)
    ];
    let index = 0;
    roomCenters.forEach(centerZ => {
      cfg.pedestalOffsets.forEach(([x, z]) => {
        addBox(1, 1, 1, x, 0.5, centerZ + z, pedestalMaterial);
        const piece = new THREE.Mesh(pieceShapes[index % pieceShapes.length](), pieceMaterial);
        piece.position.set(x, 1.5, centerZ + z);
        scene.add(piece);
        index++;
      });
    });
  }

  const roomBCenterZ = cfg.roomSize + cfg.hallwayLength;
  buildRoom(0);
  buildRoom(roomBCenterZ);
  buildHallway(cfg.roomSize / 2 + cfg.hallwayLength / 2);
  buildPedestals([0, roomBCenterZ]);
})();
