// Placas informativas en los pedestales: título y técnica de cada obra.
(function () {
  const cfg = Nexus.config;
  const scene = Nexus.scene;
  const roomCenters = [0, cfg.roomSize + cfg.hallwayLength];
  const accentColors = ['#00e5ff', '#ff2bd6'];   // cian en la sala A, magenta en la sala B

  const WIDTH = 0.42;
  const HEIGHT = 0.16;
  const CANVAS_WIDTH = 512;
  const CANVAS_HEIGHT = Math.round(CANVAS_WIDTH * HEIGHT / WIDTH);

  function plaqueTexture(artwork, accent) {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#14161c';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, CANVAS_WIDTH, 8);            // línea de neón superior

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 46px Segoe UI, Arial, sans-serif';
    ctx.fillText(artwork.title, CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.42);
    ctx.fillStyle = '#9fb0c8';
    ctx.font = '28px Segoe UI, Arial, sans-serif';
    ctx.fillText(artwork.technique, CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.74);

    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = Nexus.renderer.capabilities.getMaxAnisotropy();
    return texture;
  }

  const geometry = new THREE.PlaneGeometry(WIDTH, HEIGHT);

  Nexus.plaques = Nexus.pedestalSlots.map((slot, index) => {
    const artwork = Nexus.artworks[index % Nexus.artworks.length];
    const material = new THREE.MeshBasicMaterial({ map: plaqueTexture(artwork, accentColors[slot.room]) });
    const plaque = new THREE.Mesh(geometry, material);

    // Se coloca en el costado del pedestal que mira hacia el centro de la sala.
    const centerZ = roomCenters[slot.room];
    const direction = new THREE.Vector3(-slot.x, 0, centerZ - slot.z).normalize();
    plaque.position.set(slot.x + direction.x * 0.58, 0.55, slot.z + direction.z * 0.58);
    plaque.lookAt(plaque.position.x + direction.x, 0.55, plaque.position.z + direction.z);
    plaque.rotateX(-0.3);                              // inclinada hacia arriba para leerla desde arriba
    scene.add(plaque);
    return plaque;
  });
})();
