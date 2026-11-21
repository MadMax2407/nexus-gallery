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

  // Jugador
  eyeHeight: 1.6,
  walkSpeed: 3.2,
  mouseSensitivity: 0.0022,
  collisionMargin: 0.5,
  startPosition: { x: 0, y: 1.6, z: -4 },

  // Pedestales: posición [x, z] relativa al centro de cada sala
  pedestalOffsets: [[-5, -5], [5, -5], [-5, 5], [5, 5]]
};
