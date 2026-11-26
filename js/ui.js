// Interfaz: menú inicial (controles y calidad gráfica) y bloqueo del puntero.
(function () {
  const canvas = Nexus.renderer.domElement;
  const startScreen = document.getElementById('start');

  document.getElementById('go').addEventListener('click', () => {
    canvas.requestPointerLock();
  });

  document.addEventListener('pointerlockchange', () => {
    startScreen.style.display = document.pointerLockElement ? 'none' : 'flex';
  });

  // Calidad gráfica: se guarda la elección y se recarga la página para aplicarla.
  document.querySelectorAll('#quality button').forEach(button => {
    if (button.dataset.quality === Nexus.config.qualityPreset) button.classList.add('selected');
    button.addEventListener('click', () => {
      try { localStorage.setItem('nexusQuality', button.dataset.quality); } catch (error) { /* sin almacenamiento */ }
      location.reload();
    });
  });
})();
