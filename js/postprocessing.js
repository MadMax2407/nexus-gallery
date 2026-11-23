// Postprocesado: efecto bloom (resplandor) sobre las zonas muy brillantes, como el neón.
(function () {
  const cfg = Nexus.config;
  const renderer = Nexus.renderer;

  const composer = new THREE.EffectComposer(renderer);

  // Si el equipo lo permite, los buffers guardan valores de brillo mayores a 1 (HDR)
  // y usan suavizado de bordes (MSAA). Si no, se mantiene el formato por defecto.
  const supportsHdr = renderer.capabilities.isWebGL2 && renderer.extensions.has('EXT_color_buffer_float');
  if (supportsHdr) {
    [composer.renderTarget1, composer.renderTarget2].forEach(target => {
      target.texture.type = THREE.HalfFloatType;
      target.samples = 4;
    });
  }

  composer.addPass(new THREE.RenderPass(Nexus.scene, Nexus.camera));

  const bloom = new THREE.UnrealBloomPass(
    new THREE.Vector2(innerWidth, innerHeight),
    cfg.bloom.strength, cfg.bloom.radius, cfg.bloom.threshold
  );
  composer.addPass(bloom);

  // Al renderizar a texturas se pierde la conversión a sRGB; este paso la devuelve.
  composer.addPass(new THREE.ShaderPass(THREE.GammaCorrectionShader));

  addEventListener('resize', () => composer.setSize(innerWidth, innerHeight));

  Nexus.postprocessing = { composer, bloom, render: () => composer.render() };
})();
