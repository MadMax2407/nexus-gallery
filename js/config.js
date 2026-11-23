// Parámetros globales de la galería. Todas las medidas están en metros.
window.Nexus = window.Nexus || {};

Nexus.config = {
  backgroundColor: 0x15151a,

  // Arquitectura
  wallHeight: 6,
  wallThickness: 0.3,
  roomSize: 16,
  doorWidth: 4,
  hallwayLength: 10,

  // Texturas: metros de superficie que cubre una repetición de la imagen
  floorTileSize: 4,
  wallTileSize: 3,

  // Iluminación base (muy tenue: la escena la ilumina el neón)
  baseLight: { hemisphere: 0.3, sun: 0.2 },

  // Neón: paleta y parámetros de las luces
  neon: { cyan: 0x00e5ff, magenta: 0xff2bd6, violet: 0x8a5cff },
  neonEmissive: 2.2,
  stripThickness: 0.06,
  stripHeight: 0.08,
  neonLightIntensity: 1.8,
  neonLightDistance: 18,

  // Reflectores sobre las obras
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

  // Pedestales: posición [x, z] relativa al centro de cada sala
  pedestalOffsets: [[-5, -5], [5, -5], [-5, 5], [5, 5]]
};
