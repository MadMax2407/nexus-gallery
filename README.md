# Nexus Gallery

Recorrido virtual interactivo en 3D por una galería de arte con una estética futurista, explorable en primera persona desde el navegador. Proyecto final de la asignatura **Graficación por Computadora** para el periodo Agosto-Diciembre 2026.

## Descripción general

Nexus Gallery es una Galería virtual de arte con una estética futurista, la cual el usuario puede recorrer de forma libre haciendo uso de 
los controles del teclado. El proyecto aplica modelado 3D, cámaras y proyecciones, iluminación, texturizado, animación, interacción con el 
usuario, detección de colisiones, navegación en entornos virtuales y renderizado en tiempo real. 

## Tecnologías utilizadas

- Three.js (r128) sobre WebGL, con sus complementos de postprocesado (EffectComposer, UnrealBloomPass)
- JavaScript, HTML5 y CSS3
- Git y GitHub para el control de versiones

## Integrantes

- Maximiliano Rojas Peralta

## Instrucciones de instalación

No requiere instalación. Solo necesita un navegador con soporte para WebGL y conexión a internet.

```bash
git clone https://github.com/MadMax2407/nexus-gallery.git
cd nexus-gallery
```

## Instrucciones de ejecución

Abre `index.html` en el navegador haciendo doble clic, o también se puede levantar un servidor local con:

```bash
python -m http.server 8000
```

y posteriormente acceder a `http://localhost:8000`.

**Controles:** clic para entrar · `W A S D` moverse · mouse para mirar · `Esc` liberar el cursor.

## Estructura del proyecto

```
index.html          Página principal
css/styles.css      Estilos de la interfaz
js/config.js        Parámetros globales como medidas, velocidad, rendimiento, etc.
js/scene.js         Escena, cámara, renderer e iluminación
js/textures.js      Texturas procedurales (color, rugosidad y relieve) en color blanco
js/materials.js     Materiales PBR y mapa de entorno para reflejos
js/environment.js   Salas, pasillo y pedestales
js/lighting.js      Iluminación: tiras, tragaluces ovalados, luces de color y aros de piso
js/pieces.js        Ocho piezas de arte con una ambientación surrealista o futurista
js/postprocessing.js Efecto bloom y corrección de color
js/controls.js      Navegación en primera persona y colisiones
js/ui.js            Pantalla de inicio y pointer lock
js/main.js          Ciclo de renderizado
```

## Estado del desarrollo

## Rendimiento

Si el equipo va lento, en `js/config.js` dentro de la sección `quality` se puede bajar `maxPixelRatio`, desactivar `hdr` o reducir `bloomScale`.

## Evidencias visuales


## Uso de herramientas de IA
