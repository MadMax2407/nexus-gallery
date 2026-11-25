// Placas informativas en los pedestales: título y técnica de cada obra.
(function () {
  const cfg = Nexus.config;
  const scene = Nexus.scene;
  const pedestal = Nexus.pedestalSpec;
  const roomCenters = [0, cfg.roomSize + cfg.hallwayLength];
  const accentColors = ['#00e5ff', '#ff2bd6'];   // cian en la sala A, magenta en la sala B

  const WIDTH = 0.42;      // largo del arco de la placa (m)
  const HEIGHT = 0.16;
  const CENTER_Y = 0.55;   // altura del centro de la placa
  const GAP = 0.004;       // separación entre la placa y la superficie del pedestal (m)
  const CANVAS_WIDTH = 512;
  const CANVAS_HEIGHT = Math.round(CANVAS_WIDTH * HEIGHT / WIDTH);

  // El pedestal es un cono truncado: su radio disminuye con la altura.
  function pedestalRadius(y) {
    return pedestal.radiusBottom + (pedestal.radiusTop - pedestal.radiusBottom) * (y / pedestal.height);
  }

  // La placa es un tramo curvo del mismo cono, un poco más grande: sigue la forma del pedestal,
  // queda a la misma distancia en todos sus puntos y no se hunde en él.
  const radiusTop = pedestalRadius(CENTER_Y + HEIGHT / 2) + GAP;
  const radiusBottom = pedestalRadius(CENTER_Y - HEIGHT / 2) + GAP;
  const arcAngle = WIDTH / ((radiusTop + radiusBottom) / 2);

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
    ctx.fillStyle = '#9fb8d9';
    ctx.font = '28px Segoe UI, Arial, sans-serif';
    ctx.fillText(artwork.technique, CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.74);

    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = Nexus.renderer.capabilities.getMaxAnisotropy();
    return texture;
  }

  Nexus.plaques = Nexus.pedestalSlots.map((slot, index) => {
    const artwork = Nexus.artworks[index % Nexus.artworks.length];
    const material = new THREE.MeshBasicMaterial({ map: plaqueTexture(artwork, accentColors[slot.room]) });

    // Se centra en el costado del pedestal que mira hacia el centro de la sala.
    // En CylinderGeometry el punto de ángulo t está en (sen t, cos t).
    const towardCenter = Math.atan2(-slot.x, roomCenters[slot.room] - slot.z);
    const geometry = new THREE.CylinderGeometry(
      radiusTop, radiusBottom, HEIGHT, 16, 1, true, towardCenter - arcAngle / 2, arcAngle);

    const plaque = new THREE.Mesh(geometry, material);
    plaque.position.set(slot.x, CENTER_Y, slot.z);
    scene.add(plaque);
    return plaque;
  });
})();
