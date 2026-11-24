# Historial de cambios

Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/). Numeración semántica. Las fechas se toman del historial de GitHub.

## [0.12.0] - 2026-11-22
### Añadido
- Controles separados en «Ajustes del sitio → General y Menú» para personalizar el **color de fondo y texto de los botones Call to Action (CTA)** de forma independiente para las **páginas del sitio** (`ctaBg` / `ctaColor`) y para las **experiencias AR** (`arCtaBg` / `arCtaColor` + vista previa del teléfono).
- Selector de **tipografía global** (8 fuentes de Google Fonts: Noto Sans, Montserrat, Poppins, Roboto, Lato, Playfair Display, Merriweather y Oswald) con carga dinámica y respaldo CJK en todo el sitio, visor AR y mockup del editor.

## [0.11.0] - 2026-11-22
### Añadido
- Movimiento libre en 2D (X e Y) y ajuste de tamaño (15%–130%) para capas de imagen/PNG/WebP directamente arrastrando con el mouse en el mockup del teléfono y reflejado en el visor AR.
- Línea de tiempo visual no interactiva en el editor de experiencias que muestra el orden de pasos, duración de cada elemento y cuándo aparece/termina cada capa de texto.
- Botón de respaldo «▶ Reproducir experiencia» (en los 5 idiomas) que aparece automáticamente tras 15 segundos si el escaneo AR no se completa.

### Cambiado
- Filtro de reconocimiento MindAR reforzado (`warmupTolerance: 20` + confirmación interna silenciosa continua de 1.2 s sin barra visible) para evitar falsos positivos al abrir la cámara sin generar estrés visual al usuario.

## [0.10.0] - 2026-11-21
### Añadido
- Controles de estilo para las cajas de texto sobre la cámara (en elementos de texto y capas de texto programadas): color de tipografía, color de caja, opacidad de caja (0–100%), esquinas redondeadas, tamaño de texto, ancho de caja y alineación.
- Posicionamiento libre de la caja de texto arrastrándola directamente con el mouse dentro del mockup del teléfono en el editor, guardado en porcentajes relativos para adaptarse sin desbordarse a cualquier pantalla.
- Selector de tamaño de vista previa en el editor con los promedios reales de viewport móvil: Promedio combinado (`375×822`), Android promedio (`360×800`) e iPhone promedio (`390×844`).

### Cambiado
- La vista previa del teléfono en el editor se actualizó del formato antiguo (`360×720`) a proporciones modernas de iPhone y Android y usa tipografía Noto Sans.
- La animación de aparición de `#textPanel` en el visor AR anima opacidad en lugar de `transform` para respetar la posición personalizada de cada caja.

## [0.9.0] - 2026-11-16
### Añadido
- Menú de navegación fijo en cabecera y pie con 5 páginas: Introducción (`/introduccion`), Cómo se usa (`/como-se-usa`), Experiencias (`/experiencias`), FAQ (`/faq`) y Aviso de privacidad (`/privacidad`), con soporte multiidioma (es, en, ja, zh, ko).
- Submenú en el panel de administración bajo «Ajustes del sitio» con pestañas dedicadas para cada página y botón «Ver página en vivo».
- Editor interactivo de Preguntas Frecuentes (FAQ) con acordeón colapsable y botones para añadir/eliminar preguntas por idioma.
- Guía de uso responsiva del sistema en 3 pasos con soporte para imagen, título y texto editable.
- Sección de mapa interactivo con soporte para iframe de Google Maps y frase de cierre.
- Personalización de colores de la cabecera fija, textos/íconos y pie de página en los ajustes.
- Campo de configuración de Slug / Título de pestaña del navegador independiente del logo gráfico.
- Tipografía Noto Sans de Google Fonts integrada globalmente en todas las páginas y visores.

### Cambiado
- La cabecera se mantiene fija en la parte superior en todo momento durante el desplazamiento (scroll) con sombra suave.
- El texto del slug no invade la barra de cabecera si ya existe un logo en imagen subido.

## [0.8.1] - fecha por completar
### Cambiado
- La dirección principal del sitio abre el hub y no una experiencia. Los enlaces con `?e=ID` siguen abriendo el visor, así que los QR de experiencia no cambian.
- El QR del tótem codifica la dirección principal con la etiqueta de origen (`/?s=totem`), que es más corta.

## [0.8.0] - fecha por completar
### Añadido
- Página de punto con composición fija: cabecera con logo centrado y menú hamburguesa, banner con pendiente, tres bloques de imagen y texto, video y cierre.
- Bloques vacíos que se ocultan y cajas de texto del mismo tamaño.
- Fondo detrás de toda la página con tres modos: ninguno, estático y parallax (en teléfono solo estático); respeta «reducir movimiento».
- Campos del editor por hueco de imagen, con avisos de peso, proporción y formato, y texto alternativo por idioma.
- Ajustes del sitio: imágenes de fondo (teléfono y escritorio), color de fondo y efecto por dispositivo.
- Enlace «Ver la página del punto» en el editor y archivo `docs/historial-versiones-plataforma.xlsx`.
### Cambiado
- Hub y página de privacidad usan la misma cabecera y el mismo fondo.
- La foto de la tarjeta del hub usa el banner si no se sube otra.

## [0.7.0] - fecha por completar
### Añadido
- Medición anónima propia, con resumen en el editor y descarga en CSV (hora universal y hora local).
- Hub, plantilla de página de punto y página de privacidad, provisionales, con CSS propio móvil primero.
- Campos propios de la página de cada punto (título, descripción, texto largo, pista, foto, audio, coordenadas).
- Ajustes del sitio: imagen de encabezado, logo, color de acento, título e introducción del hub, texto de privacidad y zona horaria.
- Enlace «Datos y privacidad» en la pantalla del permiso de cámara.
- Pantalla final con tres opciones: ir al hub, ver de nuevo y cerrar.
- Marca local de «visitado» en el hub.
- QR del hub y etiqueta de origen (piso, placa, tótem) en los QR.
- Respaldo en un .zip.

## [0.6.1]
### Añadido
- QR redondo para vinilo.

## [0.6.0]
### Añadido
- Escenas con capas de texto programadas por segundo.

## [0.5.0]
### Añadido
- Vista previa en teléfono dentro del editor y QR para plantilla (stencil).

## [0.4.0]
### Añadido
- Animaciones WebP y audio separado con botón para silenciar.

## [0.3.0]
### Añadido
- Video con transparencia (.mov y .webm).

## [0.2.0]
### Cambiado
- Elementos numerados a pantalla completa; el objetivo pasa a ser solo el disparador.

## [0.1.0]
### Añadido
- Primera versión del PMV: visor, editor y servidor.
