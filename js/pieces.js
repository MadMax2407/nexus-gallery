// Piezas expuestas: ocho figuras surrealistas construidas por código (superficies
// paramétricas y primitivas combinadas). Flotan sobre los pedestales.
(function () {
  const cfg = Nexus.config;
  const scene = Nexus.scene;
  const neon = cfg.neon;

  // ---- Materiales ----
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xbfe6ff, emissive: 0x06202c, metalness: 0.05, roughness: 0.05,
    clearcoat: 1, clearcoatRoughness: 0, envMapIntensity: 1.5,
    transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false
  });
  const pearl = new THREE.MeshPhysicalMaterial({
    color: 0xf6f8ff, metalness: 0, roughness: 0.12,
    clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.2, side: THREE.DoubleSide
  });
  // Luz pura (valores > 1 para que el bloom la haga resplandecer)
  function glow(hex) {
    return new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(2.5) });
  }
  function wire(hex) {
    return new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(1.5), wireframe: true });
  }

  // ---- Superficie paramétrica: fn(u, v, punto) con u y v entre 0 y 1 ----
  function parametric(fn, uSegments, vSegments) {
    const positions = [];
    const uvs = [];
    const index = [];
    const point = new THREE.Vector3();
    for (let i = 0; i <= uSegments; i++) {
      for (let j = 0; j <= vSegments; j++) {
        fn(i / uSegments, j / vSegments, point);
        positions.push(point.x, point.y, point.z);
        uvs.push(i / uSegments, j / vSegments);
      }
    }
    for (let i = 0; i < uSegments; i++) {
      for (let j = 0; j < vSegments; j++) {
        const a = i * (vSegments + 1) + j;
        const b = a + vSegments + 1;
        index.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(new THREE.Uint16BufferAttribute(index, 1));
    geometry.computeVertexNormals();
    return geometry;
  }

  function mesh(geometry, material, x = 0, y = 0, z = 0) {
    const m = new THREE.Mesh(geometry, material);
    m.position.set(x, y, z);
    return m;
  }

  // ---- Las ocho figuras (cada una cabe aproximadamente en una esfera de 0.9 m de radio) ----

  // 1. Cinta de Möbius: una superficie con una sola cara, inclinada como en pleno giro.
  function mobius() {
    const group = new THREE.Group();
    const geometry = parametric((u, v, p) => {
      const a = u * Math.PI * 2;
      const b = (v - 0.5) * 0.8;
      const r = 0.55 + b * Math.cos(a / 2);
      p.set(r * Math.cos(a), b * Math.sin(a / 2), r * Math.sin(a));
    }, 96, 12);
    group.add(mesh(geometry, glass));
    group.add(mesh(new THREE.TorusGeometry(0.55, 0.012, 8, 96).rotateX(Math.PI / 2), glow(neon.cyan)));
    group.rotation.set(0.5, 0, 0.35);
    return group;
  }

  // 2. Torre retorcida: discos que giran y se afinan, atravesados por una varilla de luz.
  function twistedTower() {
    const group = new THREE.Group();
    for (let i = 0; i < 14; i++) {
      const size = 0.95 - 0.055 * i;
      const slab = mesh(new THREE.BoxGeometry(size, 0.09, size), i % 2 ? glass : pearl, 0, -0.8 + i * 0.12, 0);
      slab.rotation.y = i * 0.33;
      group.add(slab);
    }
    group.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.9, 8), glow(neon.magenta), 0, 0.05, 0));
    return group;
  }

  // 3. Esferas anidadas: un núcleo de luz dentro de una malla dentro de una esfera de cristal.
  function nestedSpheres() {
    const group = new THREE.Group();
    group.add(mesh(new THREE.SphereGeometry(0.62, 32, 24), glass));
    group.add(mesh(new THREE.IcosahedronGeometry(0.42, 1), wire(neon.violet)));
    group.add(mesh(new THREE.SphereGeometry(0.17, 20, 16), glow(neon.magenta)));
    return group;
  }

  // 4. Masa orgánica: una esfera deformada con ondas, como una gota detenida en el aire.
  function blob() {
    const geometry = new THREE.IcosahedronGeometry(1, 3);
    const p = geometry.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i).normalize();
      const radius = 0.6 + 0.14 * Math.sin(5 * v.x + 2 * v.y) + 0.12 * Math.cos(4 * v.y + 3 * v.z) + 0.1 * Math.sin(6 * v.z);
      p.setXYZ(i, v.x * radius, v.y * radius, v.z * radius);
    }
    geometry.computeVertexNormals();
    return mesh(geometry, pearl);
  }

  // 5. Átomo imposible: un nudo de cristal con esferas de luz que orbitan sin tocarlo.
  function atom() {
    const group = new THREE.Group();
    group.add(mesh(new THREE.TorusKnotGeometry(0.35, 0.1, 128, 16), glass));
    const orbits = [[0.8, 0.2, 0, neon.cyan], [-0.5, -0.25, 0.6, neon.magenta], [0.05, 0.75, -0.6, neon.violet]];
    orbits.forEach(([x, y, z, color]) => group.add(mesh(new THREE.SphereGeometry(0.09, 16, 12), glow(color), x, y, z)));
    return group;
  }

  // 6. Botella de Klein: una superficie cerrada sin interior ni exterior que se cruza a sí misma.
  function klein() {
    const geometry = parametric((u, v, p) => {
      const a = u * Math.PI * 2;
      const b = v * Math.PI * 2;
      const c = Math.cos(a / 2);
      const s = Math.sin(a / 2);
      const r = 2 + c * Math.sin(b) - s * Math.sin(2 * b);
      p.set(0.24 * r * Math.cos(a), 0.24 * (s * Math.sin(b) + c * Math.sin(2 * b)), 0.24 * r * Math.sin(a));
    }, 96, 32);
    const group = new THREE.Group();
    group.add(mesh(geometry, glass));
    group.add(mesh(geometry, wire(neon.cyan)));
    return group;
  }

  // 7. Pirámide invertida: se sostiene sobre su vértice, rodeada de fragmentos flotantes.
  function invertedPyramid() {
    const group = new THREE.Group();
    const cone = mesh(new THREE.ConeGeometry(0.55, 1, 4, 1), glass);
    cone.rotation.set(Math.PI, Math.PI / 4, 0);
    group.add(cone);
    const shards = [[0.8, 0.55, 0.1, 0.1], [-0.7, 0.35, 0.4, 0.13], [0.2, 0.85, -0.7, 0.09],
                    [-0.3, -0.3, -0.8, 0.11], [0.75, -0.2, 0.5, 0.08], [-0.85, 0.8, -0.2, 0.07], [0.05, 0.55, 0.85, 0.1]];
    shards.forEach(([x, y, z, size], i) => {
      const shard = mesh(new THREE.OctahedronGeometry(size, 0), i % 2 ? pearl : glow(i % 3 ? neon.violet : neon.cyan), x, y, z);
      shard.rotation.set(i, i * 0.7, 0);
      group.add(shard);
    });
    return group;
  }

  // 8. Giroscopio: tres anillos perpendiculares de luz alrededor de un núcleo.
  function gyroscope() {
    const group = new THREE.Group();
    const ring = color => mesh(new THREE.TorusGeometry(0.62, 0.03, 12, 72), glow(color));
    const a = ring(neon.cyan);
    const b = ring(neon.magenta);
    b.rotation.x = Math.PI / 2;
    const c = ring(neon.violet);
    c.rotation.y = Math.PI / 2;
    group.add(a, b, c);
    group.add(mesh(new THREE.SphereGeometry(0.17, 20, 16), pearl));
    return group;
  }

  // Sala A: figuras 1 a 4. Sala B: figuras 5 a 8.
  const builders = [mobius, twistedTower, nestedSpheres, blob, atom, klein, invertedPyramid, gyroscope];
  const PEDESTAL_TOP = 1;
  const FLOAT_HEIGHT = 1;    // centro de cada figura sobre el pedestal

  // Se exponen para poder animarlas más adelante (giro y flotación).
  Nexus.pieces = Nexus.pedestalSlots.map((slot, index) => {
    const object = builders[index % builders.length]();
    const baseY = PEDESTAL_TOP + FLOAT_HEIGHT;
    object.position.set(slot.x, baseY, slot.z);
    scene.add(object);
    return { object, baseY };
  });
})();
