// Materiales PBR y mapa de entorno para los reflejos. Paleta: blanco perla pulido
// con acentos de neón.
(function () {
  const cfg = Nexus.config;
  const tex = Nexus.textures;

  // Mapa de entorno: una escena mínima con un fondo claro y paneles de luz de color.
  // Se convierte en un mapa de reflejos (PMREM) que usan todos los materiales estándar.
  function buildEnvironmentMap() {
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x6b7a90);

    function lightPanel(hex, x, y, z, width, height) {
      const color = new THREE.Color(hex).multiplyScalar(3);   // valores > 1: luz intensa
      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(width, height),
        new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
      );
      panel.position.set(x, y, z);
      panel.lookAt(0, 0, 0);
      envScene.add(panel);
    }
    lightPanel(0x00e5ff, -8, 3, 0, 6, 3);
    lightPanel(0xff2bd6, 8, 3, 2, 6, 3);
    lightPanel(0x8a5cff, 0, 4, -8, 8, 3);
    lightPanel(0xffffff, 0, 9, 0, 6, 6);

    const generator = new THREE.PMREMGenerator(Nexus.renderer);
    const target = generator.fromScene(envScene, 0.02);
    generator.dispose();
    return target.texture;
  }

  Nexus.scene.environment = buildEnvironmentMap();

  // userData.tile indica cuántos metros cubre una repetición de la textura.
  function physical(options, tile) {
    const material = new THREE.MeshPhysicalMaterial(options);
    material.userData.tile = tile;
    return material;
  }

  Nexus.materials = {
    // Piso: blanco pulido con una capa de barniz (clearcoat) tipo cristal
    floor: physical({
      map: tex.floorColor, roughnessMap: tex.floorRoughness, bumpMap: tex.floorBump,
      bumpScale: 1, metalness: 0.05, roughness: 1,
      clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 0.9
    }, cfg.floorTileSize),

    // Muros: blanco liso y brillante con costuras finas
    wall: physical({
      map: tex.wallColor, roughnessMap: tex.wallRoughness, bumpMap: tex.wallBump,
      bumpScale: 1.2, color: 0xe8edf6, metalness: 0, roughness: 1, envMapIntensity: 0.7
    }, cfg.wallTileSize),

    ceiling: physical({
      map: tex.wallColor, roughnessMap: tex.wallRoughness, bumpMap: tex.wallBump,
      bumpScale: 1.2, color: 0xd2d9e6, metalness: 0, roughness: 1, envMapIntensity: 0.7
    }, cfg.wallTileSize),

    pedestal: new THREE.MeshPhysicalMaterial({
      color: 0xf2f6ff, metalness: 0, roughness: 0.15,
      clearcoat: 0.8, clearcoatRoughness: 0.08
    })
  };
})();
