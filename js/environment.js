// Construcción geométrica del entorno: salas, pasillo y pedestales.
(function () {
  const cfg = Nexus.config;
  const scene = Nexus.scene;
  const mat = Nexus.materials;
  const H = cfg.wallHeight;
  const T = cfg.wallThickness;

  // Ajusta las coordenadas UV de cada cara para que la textura se repita
  // según las medidas reales de la caja y no se estire.
  function scaleUVs(geometry, width, height, depth, tile) {
    const uv = geometry.attributes.uv;
    // Orden de caras de BoxGeometry: +x, -x, +y, -y, +z, -z
    const faces = [[depth, height], [depth, height], [width, depth], [width, depth], [width, height], [width, height]];
    faces.forEach(([faceU, faceV], face) => {
      for (let i = 0; i < 4; i++) {
        const k = face * 4 + i;
        uv.setXY(k, uv.getX(k) * faceU / tile, uv.getY(k) * faceV / tile);
      }
    });
    uv.needsUpdate = true;
  }

  function addBox(width, height, depth, x, y, z, material) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    scaleUVs(geometry, width, height, depth, material.userData.tile);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    scene.add(mesh);
  }

  // Sala cuadrada con un vano central en las paredes frontal y trasera.
  function buildRoom(centerZ) {
    const size = cfg.roomSize;
    const half = size / 2;
    const segment = (size - cfg.doorWidth) / 2;
    const segmentOffset = half - segment / 2;

    addBox(size, T, size, 0, 0, centerZ, mat.floor);
    addBox(size, T, size, 0, H, centerZ, mat.ceiling);
    addBox(T, H, size, -half, H / 2, centerZ, mat.wall);
    addBox(T, H, size, half, H / 2, centerZ, mat.wall);

    [-half, half].forEach(offsetZ => {
      addBox(segment, H, T, -segmentOffset, H / 2, centerZ + offsetZ, mat.wall);
      addBox(segment, H, T, segmentOffset, H / 2, centerZ + offsetZ, mat.wall);
    });
  }

  // Pasillo entre ambas salas: paredes laterales, piso y techo.
  function buildHallway(centerZ) {
    const length = cfg.hallwayLength;
    const sideX = cfg.doorWidth / 2;
    addBox(T, H, length, -sideX, H / 2, centerZ, mat.wall);
    addBox(T, H, length, sideX, H / 2, centerZ, mat.wall);
    addBox(cfg.doorWidth, T, length, 0, 0, centerZ, mat.floor);
    addBox(cfg.doorWidth, T, length, 0, H, centerZ, mat.ceiling);
  }

  // Pedestales cilíndricos. Las piezas que van encima las construye pieces.js.
  function buildPedestals(roomCenters) {
    const geometry = new THREE.CylinderGeometry(0.55, 0.65, 1, 32);
    const slots = [];
    roomCenters.forEach((centerZ, room) => {
      cfg.pedestalOffsets.forEach(([x, z]) => {
        const pedestal = new THREE.Mesh(geometry, mat.pedestal);
        pedestal.position.set(x, 0.5, centerZ + z);
        scene.add(pedestal);
        slots.push({ x, z: centerZ + z, room });
      });
    });
    return slots;
  }

  const roomBCenterZ = cfg.roomSize + cfg.hallwayLength;
  buildRoom(0);
  buildRoom(roomBCenterZ);
  buildHallway(cfg.roomSize / 2 + cfg.hallwayLength / 2);

  Nexus.pedestalSlots = buildPedestals([0, roomBCenterZ]);
})();
