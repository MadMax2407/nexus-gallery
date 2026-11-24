// Trayectoria, perfil y colisiones de la galería. La galería es una sola estructura
// continua: una curva (trayectoria) cuyo ancho y alto varían a lo largo de ella,
// formando dos salas ovaladas y un pasillo sinuoso entre ellas.
(function () {
  const cfg = Nexus.config;
  const lay = cfg.layout;

  const curve = new THREE.CatmullRomCurve3(
    lay.controlPoints.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal');
  const length = curve.getLength();
  const N = lay.samples;
  const points = curve.getSpacedPoints(N);
  const tangents = points.map((_, i) => curve.getTangentAt(i / N));
  // Vector lateral (hacia la derecha de quien avanza por la trayectoria)
  const normals = tangents.map(t => new THREE.Vector3(-t.z, 0, t.x).normalize());

  const chamberCenters = [lay.chamberHalfLength, length - lay.chamberHalfLength];

  function smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }
  // Máximo suavizado: une dos formas sin dejar un pliegue marcado.
  function smoothMax(a, b, k) {
    const h = Math.max(k - Math.abs(a - b), 0) / k;
    return Math.max(a, b) + h * h * k * 0.25;
  }
  // Perfil elíptico de una sala (1 en el centro, 0 en sus extremos).
  function chamberProfile(s, center) {
    const u = (s - center) / lay.chamberHalfLength;
    return Math.abs(u) >= 1 ? 0 : Math.sqrt(1 - u * u);
  }
  // El pasillo se cierra en los dos extremos de la trayectoria.
  function endRamp(s) {
    return smoothstep(0, 4, s) * smoothstep(0, 4, length - s);
  }
  function profile(s, roomSize, corridorSize) {
    const rooms = smoothMax(chamberProfile(s, chamberCenters[0]) * roomSize,
                            chamberProfile(s, chamberCenters[1]) * roomSize, 1);
    return smoothMax(rooms, corridorSize * endRamp(s), lay.blend);
  }
  const halfWidth = s => profile(s, lay.chamberHalfWidth, lay.corridorHalfWidth);
  const height = s => profile(s, lay.chamberHeight, lay.corridorHeight);

  // Posición, vector lateral y tangente de la trayectoria a una distancia s.
  function frame(s) {
    const f = Math.max(0, Math.min(N - 1e-6, s / length * N));
    const i = Math.floor(f);
    const t = f - i;
    return {
      point: points[i].clone().lerp(points[i + 1], t),
      normal: normals[i].clone().lerp(normals[i + 1], t).normalize(),
      tangent: tangents[i].clone().lerp(tangents[i + 1], t).normalize()
    };
  }

  // Punto de la superficie (techo o muro) a una distancia s y un desplazamiento lateral.
  function surfacePoint(s, lateral) {
    const fr = frame(s);
    const w = halfWidth(s);
    const ratio = Math.min(Math.abs(lateral) / w, 1);
    const y = height(s) * Math.sqrt(1 - ratio * ratio);
    return new THREE.Vector3(fr.point.x + fr.normal.x * lateral, y, fr.point.z + fr.normal.z * lateral);
  }

  // Punto del piso a una distancia s y un desplazamiento lateral.
  function groundPoint(s, lateral) {
    const fr = frame(s);
    return new THREE.Vector3(fr.point.x + fr.normal.x * lateral, 0, fr.point.z + fr.normal.z * lateral);
  }

  // Colisiones: un punto es caminable si, respecto al punto más cercano de la
  // trayectoria, su distancia lateral cabe dentro del ancho de la galería allí.
  const sampleWidths = points.map((_, i) => halfWidth(i / N * length));
  function isWalkable(x, z, margin) {
    let best = Infinity;
    let bestIndex = 0;
    for (let i = 0; i <= N; i++) {
      const dx = x - points[i].x;
      const dz = z - points[i].z;
      const d2 = dx * dx + dz * dz;
      if (d2 < best) { best = d2; bestIndex = i; }
    }
    return Math.sqrt(best) < sampleWidths[bestIndex] - margin;
  }

  // Posiciones de los pedestales en cada sala.
  const pedestals = [];
  chamberCenters.forEach((center, room) => {
    lay.pedestals.forEach(([ds, lateral]) => {
      const s = center + ds;
      const ground = groundPoint(s, lateral);
      pedestals.push({ room, s, lateral, x: ground.x, z: ground.z });
    });
  });

  // Punto de inicio y orientación: mirando a lo largo del recorrido.
  const start = frame(lay.startS);
  Nexus.camera.position.set(start.point.x, cfg.eyeHeight, start.point.z);
  const startYaw = Math.atan2(-start.tangent.x, -start.tangent.z);

  Nexus.layout = {
    length, samples: N, points, normals, tangents, chamberCenters, pedestals,
    halfWidth, height, frame, surfacePoint, groundPoint, isWalkable, startYaw
  };
})();
