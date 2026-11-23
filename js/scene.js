// Escena, cámara, renderer e iluminación base.
(function () {
  const cfg = Nexus.config;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(cfg.backgroundColor);
  scene.fog = new THREE.Fog(cfg.backgroundColor, 10, 40);

  const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(cfg.startPosition.x, cfg.startPosition.y, cfg.startPosition.z);

  const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: true });
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  // Iluminación base tenue; el ambiente lo define lighting.js
  scene.add(new THREE.HemisphereLight(0x8899aa, 0x101014, cfg.baseLight.hemisphere));
  const sunlight = new THREE.DirectionalLight(0xffffff, cfg.baseLight.sun);
  sunlight.position.set(5, 8, -3);
  scene.add(sunlight);

  Nexus.scene = scene;
  Nexus.camera = camera;
  Nexus.renderer = renderer;
})();
