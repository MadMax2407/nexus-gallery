// Ciclo de renderizado principal.
(function () {
  const canvas = Nexus.renderer.domElement;
  const canLockPointer = 'requestPointerLock' in canvas;
  const MENU_REDRAW_EVERY = 12;   // con el menú abierto la escena se redibuja a ~5 cuadros por segundo

  let lastTime = performance.now();
  let wasActive = false;
  let menuFrames = 0;

  // El recorrido está activo cuando el cursor está capturado (o si el navegador no permite capturarlo).
  function isActive() {
    return !canLockPointer || document.pointerLockElement === canvas;
  }

  function frame(now) {
    const deltaSeconds = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    if (isActive()) {
      if (!wasActive) Nexus.performance.reset();
      Nexus.controls.update(deltaSeconds);
      Nexus.animation.update(now / 1000, deltaSeconds);
      Nexus.interaction.update(deltaSeconds);
      Nexus.performance.update(deltaSeconds);
      Nexus.postprocessing.render();
      wasActive = true;
      menuFrames = 0;
    } else {
      // Menú abierto: no se actualiza nada y se dibuja pocas veces, para ahorrar trabajo de la GPU.
      if (menuFrames++ % MENU_REDRAW_EVERY === 0) Nexus.postprocessing.render();
      wasActive = false;
    }
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
