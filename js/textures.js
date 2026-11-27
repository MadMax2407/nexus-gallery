// Texturas procedurales generadas con canvas (no usan archivos de imagen externos), en tonos
// blancos y perla. Cada superficie tiene mapas de color, rugosidad, relieve y emisión (las
// juntas luminosas, que materials.js tiñe con el color de neón de cada zona):
//   - Muros: paneles hexagonales con juntas luminosas.
//   - Piso: franjas largas de paneles con juntas luminosas a lo largo del recorrido.
//   - Techo: barras de luz transversales.
(function () {
  const SQRT3 = Math.sqrt(3);
  const SQUARE = 512;
  const HEX_WIDTH = 512;
  const HEX_HEIGHT = Math.round(HEX_WIDTH / SQRT3);   // alto de la celda que se repite (2 hexágonos)

  // Generador pseudoaleatorio con semilla fija: la textura se ve igual en cada carga.
  let seed = 20260;
  function random() {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  function gray(value) {
    const v = Math.max(0, Math.min(255, Math.round(value)));
    return `rgb(${v},${v},${v})`;
  }

  function fill(ctx, color, width, height) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
  }

  // Puntos de ruido que dan aspecto de material real.
  function addSpeckle(ctx, width, height, count, minValue, maxValue, alpha) {
    for (let i = 0; i < count; i++) {
      ctx.fillStyle = gray(minValue + random() * (maxValue - minValue));
      ctx.globalAlpha = alpha;
      ctx.fillRect(random() * width, random() * height, 1 + random() * 2, 1 + random() * 2);
    }
    ctx.globalAlpha = 1;
  }

  function toTexture(canvas, isColor) {
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = Nexus.renderer.capabilities.getMaxAnisotropy();
    if (isColor) texture.encoding = THREE.sRGBEncoding;
    return texture;
  }

  // Dibuja con un halo suave (shadowBlur) del mismo color: así las líneas de luz se difuminan.
  function glowing(ctx, color, blur, draw) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    draw();
    ctx.restore();
  }

  // ======================  MUROS: hexágonos  ======================
  // Hexágonos de lado 1 con dos lados horizontales. La celda que se repite mide 3 de ancho
  // por raíz de 3 de alto y contiene dos hexágonos; el lienzo la cubre exactamente.
  const PIXELS_PER_UNIT = HEX_WIDTH / 3;

  function forEachHex(callback) {
    for (let column = -1; column <= 4; column++) {
      const odd = ((column % 2) + 2) % 2;
      for (let row = -1; row <= 2; row++) {
        callback(odd, 1.5 * column, row * SQRT3 + (odd ? SQRT3 / 2 : 0));
      }
    }
  }

  function hexPath(ctx, cx, cy) {
    ctx.beginPath();
    for (let k = 0; k < 6; k++) {
      const angle = Math.PI / 3 * k;
      const x = cx + Math.cos(angle);
      const y = cy + Math.sin(angle);
      if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  // Ejecuta "draw" con el sistema de coordenadas de los hexágonos (lado = 1).
  function inHexSpace(ctx, draw) {
    ctx.save();
    ctx.setTransform(HEX_WIDTH / 3, 0, 0, HEX_HEIGHT / SQRT3, 0, 0);
    draw();
    ctx.restore();
  }

  function strokeHexes(ctx, color, widthPixels, blur) {
    inHexSpace(ctx, () => {
      ctx.lineJoin = 'round';
      ctx.lineWidth = widthPixels / PIXELS_PER_UNIT;
      ctx.strokeStyle = color;
      if (blur) { ctx.shadowColor = color; ctx.shadowBlur = blur; }
      forEachHex((odd, cx, cy) => { hexPath(ctx, cx, cy); ctx.stroke(); });
    });
  }

  function buildHexColor() {
    const canvas = createCanvas(HEX_WIDTH, HEX_HEIGHT);
    const ctx = canvas.getContext('2d');
    fill(ctx, gray(238), HEX_WIDTH, HEX_HEIGHT);
    inHexSpace(ctx, () => {
      forEachHex((odd, cx, cy) => {
        ctx.fillStyle = gray(odd ? 244 : 240);
        hexPath(ctx, cx, cy);
        ctx.fill();
      });
    });
    addSpeckle(ctx, HEX_WIDTH, HEX_HEIGHT, 1500, 215, 245, 0.2);
    strokeHexes(ctx, '#aeb4c0', 8, 0);
    return canvas;
  }

  function buildHexRoughness() {
    const canvas = createCanvas(HEX_WIDTH, HEX_HEIGHT);
    const ctx = canvas.getContext('2d');
    fill(ctx, gray(80), HEX_WIDTH, HEX_HEIGHT);
    strokeHexes(ctx, gray(200), 10, 0);
    return canvas;
  }

  function buildHexBump() {
    const canvas = createCanvas(HEX_WIDTH, HEX_HEIGHT);
    const ctx = canvas.getContext('2d');
    fill(ctx, gray(170), HEX_WIDTH, HEX_HEIGHT);
    strokeHexes(ctx, gray(50), 11, 6);
    return canvas;
  }

  function buildHexEmissive() {
    const canvas = createCanvas(HEX_WIDTH, HEX_HEIGHT);
    const ctx = canvas.getContext('2d');
    fill(ctx, '#000000', HEX_WIDTH, HEX_HEIGHT);
    strokeHexes(ctx, '#ffffff', 10, 14);
    return canvas;
  }

  // ======================  PISO: franjas de paneles  ======================
  // Cinco franjas de distinto ancho a lo largo del eje v (la dirección del recorrido).
  // Las posiciones están en píxeles del lienzo de 512 (que cubre floorTileSize metros).
  const STRIP_EDGES = [0, 115, 173, 339, 397, 512];
  const STRIP_TONES = [205, 214, 208, 214, 205];
  const STRIP_CROSS = [[0, 256], [128, 384], [64], [128, 384], [0, 256]];   // juntas transversales
  const JOINT = 5;

  // Las juntas largas están en los bordes de las franjas; la del borde del lienzo se repite al otro lado.
  function eachLongJoint(callback) {
    STRIP_EDGES.slice(0, -1).forEach(edge => {
      callback(edge);
      if (edge === 0) callback(SQUARE);
    });
  }

  function eachCrossJoint(callback) {
    STRIP_CROSS.forEach((positions, k) => {
      positions.forEach(y => callback(STRIP_EDGES[k], STRIP_EDGES[k + 1] - STRIP_EDGES[k], y));
    });
  }

  function drawFloorJoints(ctx, color, includeCross) {
    ctx.fillStyle = color;
    eachLongJoint(edge => ctx.fillRect(edge - JOINT / 2, -24, JOINT, SQUARE + 48));   // se extiende más allá del lienzo para que el halo no se corte en los bordes
    if (includeCross) {
      eachCrossJoint((x, width, y) => {
        ctx.fillRect(x, y - 2, width, 4);
        if (y === 0) ctx.fillRect(x, SQUARE - 2, width, 4);      // la junta del borde se une con la repetición siguiente
      });
    }
  }

  function buildFloorColor() {
    const canvas = createCanvas(SQUARE, SQUARE);
    const ctx = canvas.getContext('2d');
    STRIP_TONES.forEach((tone, k) => {
      ctx.fillStyle = gray(tone);
      ctx.fillRect(STRIP_EDGES[k], 0, STRIP_EDGES[k + 1] - STRIP_EDGES[k], SQUARE);
    });
    addSpeckle(ctx, SQUARE, SQUARE, 2500, 175, 225, 0.3);
    drawFloorJoints(ctx, '#9aa0ab', true);
    return canvas;
  }

  function buildFloorRoughness() {
    const canvas = createCanvas(SQUARE, SQUARE);
    const ctx = canvas.getContext('2d');
    fill(ctx, gray(55), SQUARE, SQUARE);                      // pulido: rugosidad baja
    drawFloorJoints(ctx, gray(200), true);
    return canvas;
  }

  function buildFloorBump() {
    const canvas = createCanvas(SQUARE, SQUARE);
    const ctx = canvas.getContext('2d');
    fill(ctx, gray(170), SQUARE, SQUARE);
    drawFloorJoints(ctx, gray(60), true);
    return canvas;
  }

  // Solo las juntas largas emiten luz; las transversales quedan como ranuras oscuras.
  function buildFloorEmissive() {
    const canvas = createCanvas(SQUARE, SQUARE);
    const ctx = canvas.getContext('2d');
    fill(ctx, '#000000', SQUARE, SQUARE);
    glowing(ctx, '#ffffff', 6, () => drawFloorJoints(ctx, '#ffffff', false));
    return canvas;
  }

  // ======================  TECHO: barras de luz  ======================
  // Una barra transversal en el centro del lienzo, que se repite cada ceilingBarSpacing metros.
  const BAR_Y = 249;
  const BAR_HEIGHT = 14;

  function buildCeilingColor() {
    const canvas = createCanvas(SQUARE, SQUARE);
    const ctx = canvas.getContext('2d');
    fill(ctx, gray(206), SQUARE, SQUARE);
    addSpeckle(ctx, SQUARE, SQUARE, 1800, 185, 225, 0.25);
    ctx.fillStyle = gray(178);                               // juntas verticales cada 128 px
    for (let x = 0; x < SQUARE; x += 128) ctx.fillRect(x - 1, 0, 2, SQUARE);
    ctx.fillRect(SQUARE - 1, 0, 1, SQUARE);                  // mitad de la junta del borde, que se une con la siguiente repetición
    ctx.fillStyle = gray(244);
    ctx.fillRect(0, BAR_Y - 4, SQUARE, BAR_HEIGHT + 8);      // marco claro alrededor de la barra
    return canvas;
  }

  function buildCeilingRoughness() {
    const canvas = createCanvas(SQUARE, SQUARE);
    fill(canvas.getContext('2d'), gray(110), SQUARE, SQUARE);
    return canvas;
  }

  function buildCeilingBump() {
    const canvas = createCanvas(SQUARE, SQUARE);
    const ctx = canvas.getContext('2d');
    fill(ctx, gray(170), SQUARE, SQUARE);
    ctx.fillStyle = gray(80);
    ctx.fillRect(0, BAR_Y - 6, SQUARE, 3);
    ctx.fillRect(0, BAR_Y + BAR_HEIGHT + 3, SQUARE, 3);
    return canvas;
  }

  function buildCeilingEmissive() {
    const canvas = createCanvas(SQUARE, SQUARE);
    const ctx = canvas.getContext('2d');
    fill(ctx, '#000000', SQUARE, SQUARE);
    glowing(ctx, '#ffffff', 12, () => ctx.fillRect(-30, BAR_Y, SQUARE + 60, BAR_HEIGHT));   // se extiende más allá del lienzo para que el halo no se corte
    return canvas;
  }

  Nexus.textures = {
    hexColor: toTexture(buildHexColor(), true),
    hexRoughness: toTexture(buildHexRoughness(), false),
    hexBump: toTexture(buildHexBump(), false),
    hexEmissive: toTexture(buildHexEmissive(), true),
    floorColor: toTexture(buildFloorColor(), true),
    floorRoughness: toTexture(buildFloorRoughness(), false),
    floorBump: toTexture(buildFloorBump(), false),
    floorEmissive: toTexture(buildFloorEmissive(), true),
    ceilingColor: toTexture(buildCeilingColor(), true),
    ceilingRoughness: toTexture(buildCeilingRoughness(), false),
    ceilingBump: toTexture(buildCeilingBump(), false),
    ceilingEmissive: toTexture(buildCeilingEmissive(), true)
  };
})();
