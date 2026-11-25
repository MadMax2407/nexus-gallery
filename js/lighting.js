// Iluminación de neón: tiras emisivas, tragaluces ovalados, luces de color y aros
// luminosos bajo cada pedestal. Los reflectores sobre las obras son opcionales.
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

  // Tragaluz ovalado en el techo: un panel luminoso con un aro de neón.
  const skyMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xcfe6ff).multiplyScalar(cfg.skylight.brightness), fog: false, side: THREE.DoubleSide
  });
  function addSkylight(x, z, halfLength, halfWidth, ringColor) {
    const y = H - T / 2 - 0.02;

    const panelGeometry = new THREE.CircleGeometry(1, 48);
    panelGeometry.rotateX(Math.PI / 2);                // el panel mira hacia abajo
    const panel = new THREE.Mesh(panelGeometry, skyMaterial);
    panel.scale.set(halfWidth, 1, halfLength);
    panel.position.set(x, y, z);
    scene.add(panel);

    const ringGeometry = new THREE.TorusGeometry(1, 0.03, 8, 64);
    ringGeometry.rotateX(Math.PI / 2);
    const ring = new THREE.Mesh(ringGeometry, neonMaterial(ringColor));
    ring.scale.set(halfWidth, 1, halfLength);
    ring.position.set(x, y - 0.02, z);
    scene.add(ring);
  }

  // Aro luminoso en el piso, alrededor de cada pedestal.
  const roomColors = [cfg.neon.cyan, cfg.neon.magenta];
  const ringMaterials = roomColors.map(color =>
    new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(3), side: THREE.DoubleSide }));
  function addFloorRing(slot) {
    const geometry = new THREE.RingGeometry(0.85, 0.95, 48);
    geometry.rotateX(-Math.PI / 2);                    // el aro mira hacia arriba
    const ring = new THREE.Mesh(geometry, ringMaterials[slot.room]);
    ring.position.set(slot.x, 0.16, slot.z);
    scene.add(ring);
  }

  // Reflector con su luminaria, dirigido hacia la pieza de un pedestal (opcional).
  const fixtureMaterial = new THREE.MeshStandardMaterial({
    color: 0x222222, emissive: 0xe8f4ff, emissiveIntensity: 1.5
  });
  function addSpotlight(slot) {
    const fixture = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16), fixtureMaterial);
    fixture.position.set(slot.x, H - 0.2, slot.z);
    scene.add(fixture);

    const spot = new THREE.SpotLight(cfg.spotColor, cfg.spotIntensity, cfg.spotDistance, cfg.spotAngle, 0.5, 1.5);
    spot.position.set(slot.x, H - 0.25, slot.z);
    spot.target.position.set(slot.x, 1.9, slot.z);
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
    addSkylight(0, room.centerZ, cfg.skylight.halfLength, cfg.skylight.halfWidth, room.color);
  });

  buildStrips(hallwaySideX, cfg.hallwayLength, hallwayCenterZ, cfg.neon.violet);
  addNeonLight(cfg.neon.violet, 0, H - 0.8, hallwayCenterZ);
  [-2.5, 2.5].forEach(dz => addSkylight(0, hallwayCenterZ + dz, 1, 1, cfg.neon.violet));

  Nexus.pedestalSlots.forEach(addFloorRing);
  if (cfg.quality.spotlights) Nexus.pedestalSlots.forEach(addSpotlight);

  // Se exponen para poder animarlos más adelante (pulsos de luz).
  Nexus.lighting = { neonMaterials, neonLights, spotLights, floorRingMaterials: ringMaterials };
})();
