// Iluminación de neón: tiras emisivas, luces puntuales de color y reflectores sobre las obras.
(function () {
  const cfg = Nexus.config;
  const scene = Nexus.scene;
  const H = cfg.wallHeight;
  const T = cfg.wallThickness;

  const neonMaterials = [];
  const neonLights = [];
  const spotLights = [];

  function neonMaterial(color) {
    const material = new THREE.MeshStandardMaterial({
      color: 0x050505, emissive: color, emissiveIntensity: cfg.neonEmissive, roughness: 0.4
    });
    neonMaterials.push(material);
    return material;
  }

  function addStrip(length, x, y, centerZ, material) {
    const geometry = new THREE.BoxGeometry(cfg.stripThickness, cfg.stripHeight, length);
    const strip = new THREE.Mesh(geometry, material);
    strip.position.set(x, y, centerZ);
    scene.add(strip);
  }

  // Dos tiras por pared lateral: una junto al piso y otra junto al techo.
  function buildStrips(sideX, length, centerZ, color) {
    const material = neonMaterial(color);
    [-sideX, sideX].forEach(x => {
      addStrip(length, x, 0.3, centerZ, material);
      addStrip(length, x, H - 0.3, centerZ, material);
    });
  }

  function addNeonLight(color, x, y, z) {
    const light = new THREE.PointLight(color, cfg.neonLightIntensity, cfg.neonLightDistance, 2);
    light.position.set(x, y, z);
    scene.add(light);
    neonLights.push(light);
  }

  // Reflector con su luminaria, dirigido hacia la pieza de un pedestal.
  const fixtureMaterial = new THREE.MeshStandardMaterial({
    color: 0x222222, emissive: 0xe8f4ff, emissiveIntensity: 1.5
  });
  function addSpotlight(x, z) {
    const fixture = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16), fixtureMaterial);
    fixture.position.set(x, H - 0.2, z);
    scene.add(fixture);

    const spot = new THREE.SpotLight(cfg.spotColor, cfg.spotIntensity, cfg.spotDistance, cfg.spotAngle, 0.5, 1.5);
    spot.position.set(x, H - 0.25, z);
    spot.target.position.set(x, 1.6, z);
    scene.add(spot);
    scene.add(spot.target);
    spotLights.push(spot);
  }

  const half = cfg.roomSize / 2;
  const roomBCenterZ = cfg.roomSize + cfg.hallwayLength;
  const hallwayCenterZ = half + cfg.hallwayLength / 2;
  const rooms = [
    { centerZ: 0, color: cfg.neon.cyan },
    { centerZ: roomBCenterZ, color: cfg.neon.magenta }
  ];
  const roomSideX = half - T / 2 - cfg.stripThickness / 2;
  const hallwaySideX = cfg.doorWidth / 2 - T / 2 - cfg.stripThickness / 2;

  rooms.forEach(room => {
    buildStrips(roomSideX, cfg.roomSize - T, room.centerZ, room.color);
    addNeonLight(room.color, 0, H - 0.8, room.centerZ);
    cfg.pedestalOffsets.forEach(([x, z]) => addSpotlight(x, room.centerZ + z));
  });

  buildStrips(hallwaySideX, cfg.hallwayLength, hallwayCenterZ, cfg.neon.violet);
  addNeonLight(cfg.neon.violet, 0, H - 0.8, hallwayCenterZ);

  // Se exponen para poder animarlos más adelante (pulsos de luz).
  Nexus.lighting = { neonMaterials, neonLights, spotLights };
})();
