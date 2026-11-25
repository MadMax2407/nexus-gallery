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
  wallTileSize: 4,

  // Rendimiento. Si la imagen va lenta o el equipo se satura, bajar estos valores.
  quality: {
    maxPixelRatio: 1.5,   // 1 = más ligero; 2 = más nítido en pantallas de alta densidad
    hdr: true,            // buffers de brillo extendido para el bloom (false = más ligero)
    msaaSamples: 0,       // suavizado de bordes en el postprocesado (0, 2 o 4)
    bloomScale: 0.5,      // resolución del bloom respecto a la pantalla (0.25 a 1)
    spotlights: false     // reflectores reales sobre las obras (8 luces extra)
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
  collisionMargin: 0.5,
  startPosition: { x: 0, y: 1.6, z: -4 },
  startYaw: Math.PI,   // empieza mirando hacia el pasillo

  // Pedestales: posición [x, z] relativa al centro de cada sala
  pedestalOffsets: [[-5, -5], [5, -5], [-5, 5], [5, 5]]
};
