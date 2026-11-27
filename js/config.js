// Parámetros globales de la galería. Todas las medidas están en metros.
window.Nexus = window.Nexus || {};

Nexus.config = {
  // Ambiente: fondo y niebla de tono perla
  backgroundColor: 0xcfd8e6,
  fogDensity: 0.016,

  // Arquitectura
  wallHeight: 7,
  wallThickness: 0.3,
  roomSize: 16,
  doorWidth: 4,
  hallwayLength: 10,

  // Texturas: metros de superficie que cubre una repetición de la imagen
  floorTileSize: 4,

  // Rendimiento. Si la imagen va lenta o el equipo se satura, bajar estos valores.
  quality: {
    maxPixelRatio: 1.5,   // 1 = más ligero; 2 = más nítido en pantallas de alta densidad
    hdr: true,            // buffers de brillo extendido para el bloom (false = más ligero)
    msaaSamples: 0,       // suavizado de bordes en el postprocesado (0, 2 o 4)
    bloomScale: 0.5,      // resolución del bloom respecto a la pantalla (0.25 a 1)
    bloomEnabled: true,   // false = sin resplandor (más ligero)
    spotlights: false,    // reflectores reales sobre las obras (8 luces extra)
    adaptive: true,       // baja la resolución automáticamente si los cuadros por segundo son pocos
    minPixelRatio: 0.6    // resolución mínima a la que puede bajar
  },

  // Patrón de las superficies: hexágonos en los muros, franjas en el piso y barras de luz en el techo.
  // Las juntas luminosas toman el color de neón de cada zona; el brillo se da como luminancia
  // (más de 1 hace que el bloom las haga resplandecer; el piso queda por debajo para no deslumbrar).
  pattern: {
    hexSide: 0.9,             // lado de cada hexágono (m)
    wallLuminance: 1.3,
    floorLuminance: 0.55,
    ceilingLuminance: 1.5,
    ceilingBarSpacing: 2.5    // distancia entre barras de luz del techo (m)
  },

  // Iluminación base (tenue: el ambiente lo definen el neón, el mapa de entorno y los tragaluces)
  baseLight: { hemisphere: 0.35, sun: 0.1 },

  // Neón: paleta y parámetros de las luces
  neon: { cyan: 0x00e5ff, magenta: 0xff2bd6, violet: 0x8a5cff },
  neonEmissive: 5,
  stripThickness: 0.06,
  stripHeight: 0.08,
  neonLightIntensity: 1.2,
  neonLightDistance: 18,

  // Animación: giro y flotación de las obras, y pulso suave de las luces de neón
  animation: {
    pieceSpin: [0.35, -0.25, 0.4, 0.3, -0.45, 0.2, -0.3, 0.5],   // rad/s de cada obra (el signo es el sentido)
    floatAmplitude: 0.08,   // metros de subida y bajada
    floatFrequency: 0.25,   // ciclos por segundo
    pulseAmount: 0.25,      // variación de brillo del neón (0.25 = ±25 %)
    pulseFrequency: 0.25    // ciclos por segundo
  },

  // Interacción: al apuntar a una obra se resalta y aparece su información
  interaction: {
    maxDistance: 6,       // distancia máxima (m) a la que se puede apuntar a una obra
    pickRadius: 0.9,      // radio (m) de la zona de selección alrededor de cada obra
    scaleBoost: 0.1,      // cuánto crece la obra resaltada (0.1 = 10 %)
    haloRadius: 1.05,     // radio (m) del aro luminoso que rodea a la obra resaltada
    lightIntensity: 1.2,  // luz extra sobre la obra resaltada
    lightDistance: 4,
    fadeSpeed: 8          // rapidez con la que aparece y se desvanece el resaltado
  },

  // Tragaluces ovalados en el techo de las salas
  skylight: { halfLength: 3.2, halfWidth: 2.4, brightness: 1.1 },

  // Efecto bloom (resplandor de las zonas muy brillantes)
  bloom: { strength: 0.45, radius: 0.5, threshold: 1.0 },

  // Exposición final de la imagen: 1 = normal; menos = más oscuro; más = más claro
  exposure: 1.15,

  // Reflectores sobre las obras (solo si quality.spotlights = true)
  spotColor: 0xcfe8ff,
  spotIntensity: 3,
  spotDistance: 9,
  spotAngle: Math.PI / 6,

  // Jugador
  eyeHeight: 1.6,
  walkSpeed: 3.2,
  mouseSensitivity: 0.0022,
  collisionMargin: 0.5,     // distancia mínima a las paredes
  obstacleMargin: 0.55,     // distancia mínima a los pedestales, medida desde su borde (cubre las figuras que flotan encima)
  startPosition: { x: 0, y: 1.6, z: -4 },
  startYaw: Math.PI,   // empieza mirando hacia el pasillo

  // Pedestales: posición [x, z] relativa al centro de cada sala
  pedestalOffsets: [[-5, -5], [5, -5], [-5, 5], [5, 5]]
};

// Calidad gráfica elegida en el menú inicial (se guarda en el navegador). Si no se ha
// elegido ninguna, se usan los valores de arriba, que equivalen al nivel "alta".
(function () {
  const presets = {
    alta:  { maxPixelRatio: 1.5,  hdr: true,  bloomScale: 0.5,  bloomEnabled: true },
    media: { maxPixelRatio: 1,    hdr: false, bloomScale: 0.35, bloomEnabled: true },
    baja:  { maxPixelRatio: 0.75, hdr: false, bloomScale: 0.25, bloomEnabled: false }
  };
  let name = 'alta';
  try {
    const saved = localStorage.getItem('nexusQuality');
    if (saved && presets[saved]) {
      name = saved;
      Object.assign(Nexus.config.quality, presets[saved]);
    }
  } catch (error) { /* el navegador no permite guardar preferencias */ }
  Nexus.config.qualityPreset = name;
})();
