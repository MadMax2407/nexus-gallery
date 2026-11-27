// Construcción geométrica del entorno: salas, pasillo y pedestales.
(function () {
  const cfg = Nexus.config;
  const scene = Nexus.scene;
  const mat = Nexus.materials;
  const H = cfg.wallHeight;
  const T = cfg.wallThickness;

  // Ajusta las coordenadas UV de cada cara para que la textura se repita
  // según las medidas reales de la caja y no se estire. "tile" son los metros que cubre
  // una repetición de la textura: [en u, en v].
  function scaleUVs(geometry, width, height, depth, tile) {
    const uv = geometry.attributes.uv;
    const [tileU, tileV] = tile;
    // Orden de caras de BoxGeometry: +x, -x, +y, -y, +z, -z
    const faces = [[depth, height], [depth, height], [width, depth], [width, depth], [width, height], [width, height]];
    faces.forEach(([faceU, faceV], face) => {
      for (let i = 0; i < 4; i++) {
        const k = face * 4 + i;
        uv.setXY(k, uv.getX(k) * faceU / tileU, uv.getY(k) * faceV / tileV);
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
  // "zone" son los materiales (muros, piso y techo) del color de esa zona.
  function buildRoom(centerZ, zone) {
    const size = cfg.roomSize;
    const half = size / 2;
    const segment = (size - cfg.doorWidth) / 2;
    const segmentOffset = half - segment / 2;

    addBox(size, T, size, 0, 0, centerZ, zone.floor);
    addBox(size, T, size, 0, H, centerZ, zone.ceiling);
    addBox(T, H, size, -half, H / 2, centerZ, zone.wall);
    addBox(T, H, size, half, H / 2, centerZ, zone.wall);

    [-half, half].forEach(offsetZ => {
      addBox(segment, H, T, -segmentOffset, H / 2, centerZ + offsetZ, zone.wall);
      addBox(segment, H, T, segmentOffset, H / 2, centerZ + offsetZ, zone.wall);
    });
  }

  // Pasillo entre ambas salas: paredes laterales, piso y techo.
  function buildHallway(centerZ, zone) {
    const length = cfg.hallwayLength;
    const sideX = cfg.doorWidth / 2;
    addBox(T, H, length, -sideX, H / 2, centerZ, zone.wall);
    addBox(T, H, length, sideX, H / 2, centerZ, zone.wall);
    addBox(cfg.doorWidth, T, length, 0, 0, centerZ, zone.floor);
    addBox(cfg.doorWidth, T, length, 0, H, centerZ, zone.ceiling);
  }

  // Pedestales cilíndricos. Las piezas que van encima las construye pieces.js.
  // Sus medidas se exponen para que otros módulos (las placas) calculen su posición.
  const PEDESTAL = { radiusTop: 0.55, radiusBottom: 0.65, height: 1 };
  Nexus.pedestalSpec = PEDESTAL;

  function buildPedestals(roomCenters) {
    const geometry = new THREE.CylinderGeometry(PEDESTAL.radiusTop, PEDESTAL.radiusBottom, PEDESTAL.height, 32);
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
  const [zoneA, zoneHallway, zoneB] = mat.zones;
  buildRoom(0, zoneA);
  buildRoom(roomBCenterZ, zoneB);
  buildHallway(cfg.roomSize / 2 + cfg.hallwayLength / 2, zoneHallway);

  Nexus.pedestalSlots = buildPedestals([0, roomBCenterZ]);
})();
