// Materiales PBR (metalicidad y rugosidad) y mapa de entorno para los reflejos.
(function () {
  const cfg = Nexus.config;
  const tex = Nexus.textures;

  // Mapa de entorno: una escena mínima con paneles de luz de color. Se convierte
  // en un mapa de reflejos (PMREM) que usan todos los materiales estándar.
  function buildEnvironmentMap() {
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x0a0b10);

    function lightPanel(hex, x, y, z, width, height) {
      const color = new THREE.Color(hex).multiplyScalar(4);   // valores > 1: luz intensa
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
    lightPanel(0xffffff, 0, 9, 0, 5, 5);

    const generator = new THREE.PMREMGenerator(Nexus.renderer);
    const target = generator.fromScene(envScene, 0.02);
    generator.dispose();
    return target.texture;
  }

  Nexus.scene.environment = buildEnvironmentMap();

  // userData.tile indica cuántos metros cubre una repetición de la textura.
  function standard(options, tile) {
    const material = new THREE.MeshStandardMaterial(options);
    material.userData.tile = tile;
    return material;
  }

  Nexus.materials = {
    floor: standard({
      map: tex.floorColor, roughnessMap: tex.floorRoughness, bumpMap: tex.floorBump,
      bumpScale: 2, metalness: 0.55, roughness: 1
    }, cfg.floorTileSize),

    wall: standard({
      map: tex.wallColor, roughnessMap: tex.wallRoughness, bumpMap: tex.wallBump,
      bumpScale: 2, metalness: 0.4, roughness: 1
    }, cfg.wallTileSize),

    ceiling: standard({
      map: tex.wallColor, roughnessMap: tex.wallRoughness, bumpMap: tex.wallBump,
      bumpScale: 2, metalness: 0.4, roughness: 1, color: 0x777777
    }, cfg.wallTileSize),

    pedestal: standard({
      map: tex.wallColor, roughnessMap: tex.wallRoughness, bumpMap: tex.wallBump,
      bumpScale: 1, metalness: 0.6, roughness: 1, color: 0xbbbbbb
    }, cfg.wallTileSize),

    piece: standard({
      color: 0x9fb8d9, metalness: 0.9, roughness: 0.2, envMapIntensity: 1.4
    }, 1)
  };
})();
