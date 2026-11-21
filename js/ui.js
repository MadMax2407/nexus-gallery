// Interfaz: pantalla de inicio y bloqueo del puntero.
(function () {
  const canvas = Nexus.renderer.domElement;
  const startScreen = document.getElementById('start');

  document.getElementById('go').addEventListener('click', () => {
    canvas.requestPointerLock();
  });

  document.addEventListener('pointerlockchange', () => {
    startScreen.style.display = document.pointerLockElement ? 'none' : 'flex';
  });
})();
