// Navegación en primera persona: pointer lock, teclado WASD y colisiones.
(function () {
  const cfg = Nexus.config;
  const camera = Nexus.camera;
  const canvas = Nexus.renderer.domElement;

  let yaw = cfg.startYaw;   // empieza mirando hacia el pasillo
  let pitch = 0;
  const pressedKeys = {};

  document.addEventListener('keydown', e => { pressedKeys[e.code] = true; });
  document.addEventListener('keyup', e => { pressedKeys[e.code] = false; });
  document.addEventListener('mousemove', e => {
    if (document.pointerLockElement !== canvas) return;
    yaw -= e.movementX * cfg.mouseSensitivity;
    pitch -= e.movementY * cfg.mouseSensitivity;
    pitch = Math.max(-1.3, Math.min(1.3, pitch));
  });

  // Zonas caminables (cajas): sala A, pasillo y sala B.
  const half = cfg.roomSize / 2;
  const margin = cfg.collisionMargin;
  const roomBCenterZ = cfg.roomSize + cfg.hallwayLength;
  const hallwayHalfWidth = cfg.doorWidth / 2 - 0.3;
  const walkableZones = [
    { x: [-(half - margin), half - margin], z: [-(half - margin), half - margin] },
    { x: [-hallwayHalfWidth, hallwayHalfWidth], z: [half - margin, half + cfg.hallwayLength + margin] },
    { x: [-(half - margin), half - margin], z: [roomBCenterZ - half + margin, roomBCenterZ + half - margin] }
  ];

  function isWalkable(x, z) {
    return walkableZones.some(zone =>
      x >= zone.x[0] && x <= zone.x[1] && z >= zone.z[0] && z <= zone.z[1]);
  }

  // Obstáculos circulares: cada pedestal, con un margen que cubre también la figura que flota encima.
  const obstacleRadius = Nexus.pedestalSpec.radiusBottom + cfg.obstacleMargin;
  const obstacles = Nexus.pedestalSlots.map(slot => ({ x: slot.x, z: slot.z }));

  // Si la posición cae dentro de un obstáculo, la empuja hacia su borde (así se rodea sin atorarse).
  function pushOutOfObstacles(x, z) {
    obstacles.forEach(obstacle => {
      const dx = x - obstacle.x;
      const dz = z - obstacle.z;
      const distance = Math.hypot(dx, dz);
      if (distance < obstacleRadius && distance > 1e-6) {
        x = obstacle.x + dx / distance * obstacleRadius;
        z = obstacle.z + dz / distance * obstacleRadius;
      }
    });
    return [x, z];
  }

  function update(deltaSeconds) {
    camera.rotation.set(pitch, yaw, 0, 'YXZ');

    // La cámara mira hacia -Z cuando yaw = 0, por eso el avance usa signo negativo.
    const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
    const right = new THREE.Vector3(-forward.z, 0, forward.x);
    const move = new THREE.Vector3();
    if (pressedKeys['KeyW']) move.add(forward);
    if (pressedKeys['KeyS']) move.sub(forward);
    if (pressedKeys['KeyD']) move.add(right);
    if (pressedKeys['KeyA']) move.sub(right);
    if (move.lengthSq() > 0) move.normalize().multiplyScalar(cfg.walkSpeed * deltaSeconds);

    // Primero las paredes (eje por eje, para poder deslizarse a lo largo de ellas) y luego los pedestales.
    let x = camera.position.x;
    let z = camera.position.z;
    if (isWalkable(x + move.x, z)) x += move.x;
    if (isWalkable(x, z + move.z)) z += move.z;
    [x, z] = pushOutOfObstacles(x, z);
    if (isWalkable(x, z)) {
      camera.position.x = x;
      camera.position.z = z;
    }
  }

  Nexus.controls = { update };
})();
