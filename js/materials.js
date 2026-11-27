// Materiales PBR y mapa de entorno para los reflejos. Paleta: blanco perla pulido
// con acentos de neón.
(function () {
  const cfg = Nexus.config;
  const tex = Nexus.textures;
  const pattern = cfg.pattern;
  const SQRT3 = Math.sqrt(3);

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

  // Intensidad con la que debe brillar una junta del color dado para alcanzar una luminancia
  // objetivo. Así todas las zonas resplandecen parecido aunque unos colores sean más oscuros.
  function glowIntensity(hex, targetLuminance) {
    const c = new THREE.Color(hex);
    return targetLuminance / (0.299 * c.r + 0.587 * c.g + 0.114 * c.b);
  }

  // userData.tile indica cuántos metros cubre una repetición de la textura: [en u, en v].
  // MeshPhysicalMaterial permite agregar una capa de barniz (clearcoat) al piso.
  function physical(options, tile) {
    const material = new THREE.MeshPhysicalMaterial(options);
    material.userData.tile = tile;
    return material;
  }

  // Muros, piso y techo de una zona: el mismo patrón, con las juntas luminosas del color de la zona.
  function zoneMaterials(hex) {
    const color = new THREE.Color(hex);
    return {
      // Muros: paneles hexagonales con juntas luminosas
      wall: physical({
        map: tex.hexColor, roughnessMap: tex.hexRoughness, bumpMap: tex.hexBump, bumpScale: 1.2,
        emissiveMap: tex.hexEmissive, emissive: color, emissiveIntensity: glowIntensity(hex, pattern.wallLuminance),
        color: 0xe8edf6, metalness: 0, roughness: 1, envMapIntensity: 0.7
      }, [3 * pattern.hexSide, SQRT3 * pattern.hexSide]),

      // Piso: franjas de paneles pulidos, con barniz tipo cristal y juntas largas luminosas
      floor: physical({
        map: tex.floorColor, roughnessMap: tex.floorRoughness, bumpMap: tex.floorBump, bumpScale: 1,
        emissiveMap: tex.floorEmissive, emissive: color, emissiveIntensity: glowIntensity(hex, pattern.floorLuminance),
        metalness: 0.05, roughness: 1, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 0.9
      }, [cfg.floorTileSize, cfg.floorTileSize]),

      // Techo: barras de luz transversales
      ceiling: physical({
        map: tex.ceilingColor, roughnessMap: tex.ceilingRoughness, bumpMap: tex.ceilingBump, bumpScale: 1,
        emissiveMap: tex.ceilingEmissive, emissive: color, emissiveIntensity: glowIntensity(hex, pattern.ceilingLuminance),
        color: 0xd2d9e6, metalness: 0, roughness: 1, envMapIntensity: 0.7
      }, [cfg.floorTileSize, pattern.ceilingBarSpacing])
    };
  }

  // Un conjunto por zona, en el orden del recorrido: sala A (cian), pasillo (violeta) y sala B (magenta).
  const zones = [zoneMaterials(cfg.neon.cyan), zoneMaterials(cfg.neon.violet), zoneMaterials(cfg.neon.magenta)];
  const all = zones.flatMap(zone => [zone.wall, zone.floor, zone.ceiling]);

  Nexus.materials = {
    zones,
    // Materiales con juntas luminosas: lighting.js los suma al pulso del neón.
    glow: all,
    // Muros y techos: bloquean la selección de obras en interaction.js.
    occluders: zones.flatMap(zone => [zone.wall, zone.ceiling]),

    pedestal: new THREE.MeshPhysicalMaterial({
      color: 0xf2f6ff, metalness: 0, roughness: 0.15,
      clearcoat: 0.8, clearcoatRoughness: 0.08
    })
  };
})();
