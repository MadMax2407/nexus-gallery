// Texturas procedurales generadas con canvas (no usan archivos de imagen externos).
// Cada superficie tiene un mapa de color, uno de rugosidad y uno de relieve (bump).
(function () {
  const SIZE = 512;

  // Generador pseudoaleatorio con semilla fija: la textura se ve igual en cada carga.
  let seed = 20260;
  function random() {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = SIZE;
    return canvas;
  }

  function gray(value) {
    const v = Math.max(0, Math.min(255, Math.round(value)));
    return `rgb(${v},${v},${v})`;
  }

  // Puntos de ruido que dan aspecto de material real.
  function addSpeckle(ctx, count, minValue, maxValue, alpha) {
    for (let i = 0; i < count; i++) {
      const v = minValue + random() * (maxValue - minValue);
      ctx.fillStyle = gray(v);
      ctx.globalAlpha = alpha;
      ctx.fillRect(random() * SIZE, random() * SIZE, 1 + random() * 2, 1 + random() * 2);
    }
    ctx.globalAlpha = 1;
  }

  // Líneas finas horizontales que imitan metal cepillado.
  function addBrushing(ctx, count, minValue, maxValue, alpha) {
    for (let i = 0; i < count; i++) {
      const y = random() * SIZE;
      const x = random() * SIZE;
      const length = 40 + random() * 160;
      ctx.fillStyle = gray(minValue + random() * (maxValue - minValue));
      ctx.globalAlpha = alpha;
      ctx.fillRect(x, y, length, 1);
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

  // ---- Piso: 2 x 2 losetas con juntas oscuras ----
  const half = SIZE / 2;
  const GROUT = 8;

  function floorTiles(ctx, drawTile, drawGrout) {
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) drawTile(col * half, row * half);
    }
    drawGrout();
  }

  function buildFloorColor() {
    const canvas = createCanvas();
    const ctx = canvas.getContext('2d');
    floorTiles(ctx,
      (x, y) => {
        ctx.fillStyle = gray(205 + random() * 8);
        ctx.fillRect(x, y, half, half);
      },
      () => {
        ctx.fillStyle = '#9aa0ab';
        ctx.fillRect(0, 0, SIZE, GROUT / 2);
        ctx.fillRect(0, half - GROUT / 2, SIZE, GROUT);
        ctx.fillRect(0, SIZE - GROUT / 2, SIZE, GROUT / 2);
        ctx.fillRect(0, 0, GROUT / 2, SIZE);
        ctx.fillRect(half - GROUT / 2, 0, GROUT, SIZE);
        ctx.fillRect(SIZE - GROUT / 2, 0, GROUT / 2, SIZE);
      });
    addSpeckle(ctx, 2500, 175, 225, 0.35);
    return canvas;
  }

  function buildFloorRoughness() {
    const canvas = createCanvas();
    const ctx = canvas.getContext('2d');
    floorTiles(ctx,
      (x, y) => {
        ctx.fillStyle = gray(48 + random() * 20);   // pulido: rugosidad baja
        ctx.fillRect(x, y, half, half);
      },
      () => {
        ctx.fillStyle = gray(225);                  // juntas: rugosidad alta
        ctx.fillRect(0, 0, SIZE, GROUT / 2);
        ctx.fillRect(0, half - GROUT / 2, SIZE, GROUT);
        ctx.fillRect(0, SIZE - GROUT / 2, SIZE, GROUT / 2);
        ctx.fillRect(0, 0, GROUT / 2, SIZE);
        ctx.fillRect(half - GROUT / 2, 0, GROUT, SIZE);
        ctx.fillRect(SIZE - GROUT / 2, 0, GROUT / 2, SIZE);
      });
    addBrushing(ctx, 350, 110, 200, 0.35);          // rayones finos
    return canvas;
  }

  function buildFloorBump() {
    const canvas = createCanvas();
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = gray(170);
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = gray(20);                       // juntas hundidas
    ctx.fillRect(0, 0, SIZE, GROUT / 2);
    ctx.fillRect(0, half - GROUT / 2, SIZE, GROUT);
    ctx.fillRect(0, SIZE - GROUT / 2, SIZE, GROUT / 2);
    ctx.fillRect(0, 0, GROUT / 2, SIZE);
    ctx.fillRect(half - GROUT / 2, 0, GROUT, SIZE);
    ctx.fillRect(SIZE - GROUT / 2, 0, GROUT / 2, SIZE);
    addSpeckle(ctx, 1500, 140, 200, 0.4);
    return canvas;
  }

  // ---- Muros: 2 x 2 paneles lisos con costuras finas ----
  const SEAM = 6;
  const RIVET_OFFSET = 26;

  function eachPanel(callback) {
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) callback(col * half, row * half);
    }
  }

  function drawSeams(ctx, color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, SIZE, SEAM / 2);
    ctx.fillRect(0, half - SEAM / 2, SIZE, SEAM);
    ctx.fillRect(0, SIZE - SEAM / 2, SIZE, SEAM / 2);
    ctx.fillRect(0, 0, SEAM / 2, SIZE);
    ctx.fillRect(half - SEAM / 2, 0, SEAM, SIZE);
    ctx.fillRect(SIZE - SEAM / 2, 0, SEAM / 2, SIZE);
  }

  function drawRivets(ctx, color, radius) {
    ctx.fillStyle = color;
    eachPanel((x, y) => {
      [[RIVET_OFFSET, RIVET_OFFSET], [half - RIVET_OFFSET, RIVET_OFFSET],
       [RIVET_OFFSET, half - RIVET_OFFSET], [half - RIVET_OFFSET, half - RIVET_OFFSET]].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(x + dx, y + dy, radius, 0, Math.PI * 2);
        ctx.fill();
      });
    });
  }

  function buildWallColor() {
    const canvas = createCanvas();
    const ctx = canvas.getContext('2d');
    eachPanel((x, y) => {
      ctx.fillStyle = gray(236 + random() * 6);
      ctx.fillRect(x, y, half, half);
    });
    addBrushing(ctx, 900, 215, 245, 0.12);
    drawSeams(ctx, '#b9bfca');
    return canvas;
  }

  function buildWallRoughness() {
    const canvas = createCanvas();
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = gray(85);
    ctx.fillRect(0, 0, SIZE, SIZE);
    addBrushing(ctx, 1200, 90, 190, 0.35);
    drawSeams(ctx, gray(225));
    return canvas;
  }

  function buildWallBump() {
    const canvas = createCanvas();
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = gray(170);
    ctx.fillRect(0, 0, SIZE, SIZE);
    addBrushing(ctx, 600, 150, 190, 0.3);
    drawSeams(ctx, gray(20));
    return canvas;
  }

  Nexus.textures = {
    floorColor: toTexture(buildFloorColor(), true),
    floorRoughness: toTexture(buildFloorRoughness(), false),
    floorBump: toTexture(buildFloorBump(), false),
    wallColor: toTexture(buildWallColor(), true),
    wallRoughness: toTexture(buildWallRoughness(), false),
    wallBump: toTexture(buildWallBump(), false)
  };
})();
