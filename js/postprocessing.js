// Postprocesado: efecto bloom (resplandor) sobre las zonas muy brillantes, como el neón.
(function () {
  const cfg = Nexus.config;
  const renderer = Nexus.renderer;

  const composer = new THREE.EffectComposer(renderer);

  // Si el equipo lo permite, los buffers guardan valores de brillo mayores a 1 (HDR).
  // El suavizado de bordes (MSAA) es opcional porque consume memoria de video.
  const quality = cfg.quality;
  const supportsHdr = renderer.capabilities.isWebGL2 && renderer.extensions.has('EXT_color_buffer_float');
  [composer.renderTarget1, composer.renderTarget2].forEach(target => {
    if (quality.hdr && supportsHdr) target.texture.type = THREE.HalfFloatType;
    if (quality.msaaSamples > 0 && renderer.capabilities.isWebGL2) target.samples = quality.msaaSamples;
  });

  composer.addPass(new THREE.RenderPass(Nexus.scene, Nexus.camera));

  const bloom = new THREE.UnrealBloomPass(
    new THREE.Vector2(innerWidth * quality.bloomScale, innerHeight * quality.bloomScale),
    cfg.bloom.strength, cfg.bloom.radius, cfg.bloom.threshold
  );
  composer.addPass(bloom);

  // Exposición: comprime los valores muy brillantes con una curva suave para que las
  // superficies blancas no se saturen. exposure < 1 oscurece y exposure > 1 aclara.
  const exposureShader = {
    uniforms: { tDiffuse: { value: null }, exposure: { value: cfg.exposure } },
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform sampler2D tDiffuse; uniform float exposure; varying vec2 vUv; ' +
      'void main() { vec4 color = texture2D(tDiffuse, vUv); color.rgb = vec3(1.0) - exp(-color.rgb * exposure); gl_FragColor = color; }'
  };
  composer.addPass(new THREE.ShaderPass(exposureShader));

  // Al renderizar a texturas se pierde la conversión a sRGB; este paso la devuelve.
  composer.addPass(new THREE.ShaderPass(THREE.GammaCorrectionShader));

  addEventListener('resize', () => {
    composer.setSize(innerWidth, innerHeight);
    bloom.setSize(innerWidth * quality.bloomScale, innerHeight * quality.bloomScale);
  });

  Nexus.postprocessing = { composer, bloom, render: () => composer.render() };
})();
