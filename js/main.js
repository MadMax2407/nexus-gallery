// Ciclo de renderizado principal.
(function () {
  let lastTime = performance.now();

  function frame(now) {
    const deltaSeconds = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    Nexus.controls.update(deltaSeconds);
    Nexus.animation.update(now / 1000, deltaSeconds);
    Nexus.interaction.update(deltaSeconds);
    Nexus.postprocessing.render();
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
