// Ciclo de renderizado principal.
(function () {
  let lastTime = performance.now();

  function frame(now) {
    const deltaSeconds = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    Nexus.controls.update(deltaSeconds);
    Nexus.renderer.render(Nexus.scene, Nexus.camera);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
