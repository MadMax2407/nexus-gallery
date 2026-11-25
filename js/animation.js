// Animaciones: giro y flotación de las obras, y pulso suave de las luces de neón.
(function () {
  const cfg = Nexus.config.animation;
  const TWO_PI = Math.PI * 2;

  // Obras: cada una gira a su ritmo y flota con una fase distinta para que no se muevan al unísono.
  const pieces = Nexus.pieces.map((piece, index) => ({
    object: piece.object,
    baseY: piece.baseY,
    spin: cfg.pieceSpin[index % cfg.pieceSpin.length],
    phase: index * 0.8
  }));

  // Partes de las obras con giro propio (userData.spinY, definido en pieces.js).
  const spinners = [];
  Nexus.pieces.forEach(piece => piece.object.traverse(part => {
    if (part.userData.spinY) spinners.push(part);
  }));

  // Neón: materiales emisivos, luces de color y aros del piso, cada uno con su propia fase.
  const lighting = Nexus.lighting;
  const pulsingMaterials = lighting.neonMaterials.map((material, i) =>
    ({ material, base: material.emissiveIntensity, phase: i * 0.9 }));
  const pulsingLights = lighting.neonLights.map((light, i) =>
    ({ light, base: light.intensity, phase: i * 1.3 }));
  const pulsingRings = lighting.floorRingMaterials.map((material, i) =>
    ({ material, base: material.color.clone(), phase: i * 1.7 }));

  // Factor de brillo entre (1 - pulseAmount) y (1 + pulseAmount).
  function pulse(time, phase) {
    return 1 + cfg.pulseAmount * Math.sin(TWO_PI * cfg.pulseFrequency * time + phase);
  }

  function update(time, deltaSeconds) {
    pieces.forEach(piece => {
      piece.object.rotation.y += piece.spin * deltaSeconds;
      piece.object.position.y = piece.baseY +
        cfg.floatAmplitude * Math.sin(TWO_PI * cfg.floatFrequency * time + piece.phase);
    });
    spinners.forEach(part => { part.rotation.y += part.userData.spinY * deltaSeconds; });

    pulsingMaterials.forEach(item => { item.material.emissiveIntensity = item.base * pulse(time, item.phase); });
    pulsingLights.forEach(item => { item.light.intensity = item.base * pulse(time, item.phase); });
    pulsingRings.forEach(item => { item.material.color.copy(item.base).multiplyScalar(pulse(time, item.phase)); });
  }

  Nexus.animation = { update };
})();
