// Rendimiento: ajusta la resolución de dibujo según los cuadros por segundo y muestra
// un contador (tecla F). Si el equipo va lento baja la resolución; si le sobra, la recupera.
(function () {
  const quality = Nexus.config.quality;
  const STEP = 0.25;               // cuánto cambia la resolución en cada ajuste
  const WINDOW_SECONDS = 2;        // tiempo que se promedia antes de decidir
  const LOW_FPS = 30;              // por debajo de esto se baja la resolución
  const HIGH_FPS = 57;             // por encima de esto (y con margen) se recupera
  const COOLDOWN_SECONDS = 6;      // espera mínima entre dos ajustes

  const maxRatio = Nexus.renderer.getPixelRatio();   // nunca se supera la resolución inicial
  let ratio = maxRatio;
  let elapsed = 0;
  let frames = 0;
  let sinceChange = COOLDOWN_SECONDS;
  let fps = 0;

  const label = document.getElementById('fps');
  let showCounter = false;

  document.addEventListener('keydown', event => {
    if (event.code !== 'KeyF') return;
    showCounter = !showCounter;
    label.hidden = !showCounter;
  });

  function applyRatio(next) {
    ratio = next;
    Nexus.postprocessing.setPixelRatio(ratio);
    sinceChange = 0;
  }

  // Se llama una vez por cuadro mientras el recorrido está activo.
  function update(deltaSeconds) {
    elapsed += deltaSeconds;
    sinceChange += deltaSeconds;
    frames++;
    if (elapsed < WINDOW_SECONDS) return;

    fps = frames / elapsed;
    elapsed = 0;
    frames = 0;

    if (quality.adaptive && sinceChange >= COOLDOWN_SECONDS) {
      if (fps < LOW_FPS && ratio > quality.minPixelRatio) {
        applyRatio(Math.max(quality.minPixelRatio, ratio - STEP));
      } else if (fps > HIGH_FPS && ratio < maxRatio) {
        applyRatio(Math.min(maxRatio, ratio + STEP));
      }
    }
    if (showCounter) label.textContent = Math.round(fps) + ' FPS · resolución ×' + ratio.toFixed(2);
  }

  // Al pausar (menú abierto) se reinicia la medición para no contar ese tiempo.
  function reset() {
    elapsed = 0;
    frames = 0;
  }

  Nexus.performance = { update, reset, getRatio: () => ratio, getFps: () => fps };
})();
