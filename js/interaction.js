// Interacción: al apuntar a una obra se resalta (crece, la rodea un aro y recibe más luz)
// y aparece un panel con su información. El punto de mira es el centro de la pantalla.
(function () {
  const cfg = Nexus.config.interaction;
  const scene = Nexus.scene;
  const camera = Nexus.camera;
  const canvas = Nexus.renderer.domElement;
  const roomColors = ['#00e5ff', '#ff2bd6'];   // cian en la sala A, magenta en la sala B

  const crosshair = document.getElementById('crosshair');
  const info = document.getElementById('info');
  const titleElement = document.getElementById('info-title');
  const techniqueElement = document.getElementById('info-technique');
  const descriptionElement = document.getElementById('info-description');

  // Zona de selección: una esfera invisible alrededor de cada obra, para que sea fácil
  // apuntar incluso a figuras delgadas como los anillos del giroscopio.
  const pickGeometry = new THREE.SphereGeometry(cfg.pickRadius, 12, 8);
  const pickMaterial = new THREE.MeshBasicMaterial({ visible: false });
  const haloGeometry = new THREE.TorusGeometry(1, 0.015, 8, 64).rotateX(Math.PI / 2);

  const items = Nexus.pieces.map((piece, index) => {
    const room = Nexus.pedestalSlots[index].room;

    const pick = new THREE.Mesh(pickGeometry, pickMaterial);
    pick.userData.pickIndex = index;
    piece.object.add(pick);

    const halo = new THREE.Mesh(haloGeometry, new THREE.MeshBasicMaterial({
      color: new THREE.Color(roomColors[room]).multiplyScalar(3), transparent: true, opacity: 0, depthWrite: false
    }));
    halo.scale.setScalar(cfg.haloRadius);
    halo.visible = false;
    scene.add(halo);

    return { piece, pick, halo, room, focus: 0 };
  });

  // Luz extra que acompaña a la obra resaltada.
  const highlightLight = new THREE.PointLight(0xdfeaff, 0, cfg.lightDistance, 2);
  scene.add(highlightLight);

  // Los muros bloquean la selección: no se puede apuntar a una obra a través de una pared.
  const walls = scene.children.filter(object =>
    object.isMesh && (object.material === Nexus.materials.wall || object.material === Nexus.materials.ceiling));
  const targets = items.map(item => item.pick).concat(walls);

  const raycaster = new THREE.Raycaster();
  raycaster.far = cfg.maxDistance;
  const screenCenter = new THREE.Vector2(0, 0);

  let current = -1;

  function showInfo(index) {
    if (index < 0) {
      info.classList.remove('visible');
      crosshair.classList.remove('active');
      return;
    }
    const artwork = items[index].piece.artwork;
    const accent = roomColors[items[index].room];
    titleElement.textContent = artwork.title;
    techniqueElement.textContent = artwork.technique;
    descriptionElement.textContent = artwork.description;
    info.style.setProperty('--info-accent', accent);
    crosshair.style.setProperty('--info-accent', accent);
    info.classList.add('visible');
    crosshair.classList.add('active');
  }

  // Obra a la que apunta el visitante (o -1). Solo funciona con el cursor capturado.
  function findTarget() {
    if (document.pointerLockElement !== canvas) return -1;
    raycaster.setFromCamera(screenCenter, camera);
    const hits = raycaster.intersectObjects(targets, false);
    if (hits.length === 0) return -1;
    const index = hits[0].object.userData.pickIndex;
    return index === undefined ? -1 : index;     // si lo primero que se ve es un muro, no hay obra
  }

  function update(deltaSeconds) {
    const target = findTarget();
    if (target !== current) {
      current = target;
      showInfo(current);
    }

    const blend = Math.min(1, cfg.fadeSpeed * deltaSeconds);
    let strongest = items[0];
    items.forEach((item, index) => {
      item.focus += ((index === current ? 1 : 0) - item.focus) * blend;
      item.piece.object.scale.setScalar(1 + cfg.scaleBoost * item.focus);
      item.halo.visible = item.focus > 0.01;
      item.halo.position.copy(item.piece.object.position);
      item.halo.material.opacity = 0.9 * item.focus;
      if (item.focus > strongest.focus) strongest = item;
    });

    highlightLight.intensity = cfg.lightIntensity * strongest.focus;
    highlightLight.position.copy(strongest.piece.object.position);
    highlightLight.position.y += 0.7;
  }

  // El punto de mira solo se muestra mientras el cursor está capturado.
  document.addEventListener('pointerlockchange', () => {
    document.body.classList.toggle('locked', document.pointerLockElement === canvas);
  });

  Nexus.interaction = { update, getTarget: () => current };
})();
