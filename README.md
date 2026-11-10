# Plataforma de experiencias de RA, versión 0.7.0

Dos canales en un mismo sistema:
- **Canal experiencia** (`/`): visor de realidad aumentada. Motor: [MindAR](https://github.com/hiukim/mind-ar-js) (código abierto) sobre A-Frame.
- **Canal página** (`/hub`, `/punto`, `/privacidad`): páginas informativas, móviles primero, sin animaciones.

Editor en `/admin` (usuario cualquiera, contraseña = `ADMIN_PASSWORD`).

## Direcciones
| Dirección | Qué es |
|---|---|
| `/?e=ID&s=piso` | Experiencia. `s` es el origen del QR: `piso`, `placa` o `totem` |
| `/hub?s=totem` | Hub (QR del tótem) |
| `/punto?e=ID` | Página de un punto (se abre desde el hub) |
| `/privacidad` | Datos y privacidad (enlace en la pantalla del permiso de cámara) |
| `/admin` | Editor, ajustes del sitio, medición y respaldo |

## Variables de entorno (Render)
- `ADMIN_PASSWORD`: contraseña del editor. **Cámbiala.**
- `DATA_DIR` y `UPLOAD_DIR`: apúntalas al **disco persistente** (por ejemplo `/var/data/data` y `/var/data/uploads`). Sin disco persistente se pierden los datos y los archivos en cada despliegue.

## Medición (solo para las pruebas de usabilidad)
Cuenta **visitas, no personas**. Cada visita tiene un identificador al azar que vive solo en esa pestaña. No se guarda la IP (solo se usa en memoria para limitar abusos), ni cookies, ni nombres. Se guarda: hora del servidor (UTC) y hora del teléfono, canal, evento, experiencia, origen del QR, idioma, detalle, número (por ejemplo milisegundos), sistema y navegador resumidos.

Eventos: `abre`, `camara_ok`, `camara_no`, `modo` (fija o sigue), `silueta`, `objetivo` (milisegundos hasta reconocer), `objetivo_perdido`, `sin_reconocer` (15 s sin reconocer), `escena`, `completa`, `cierra`, `leer_mas`, `al_hub`, `repetir`, `idioma`, `privacidad`, `error`, `pagina` (visita a hub, punto o privacidad).

- Editor → **Medición**: resumen por experiencia, por origen y por página.
- **Descargar CSV**: se abre en Excel o Google Sheets. Incluye la columna `fecha_hora_local`, según la zona horaria elegida en *Ajustes del sitio*.
- Si el teléfono no tiene señal, los avisos se guardan en él y se envían al reconectar (usa entonces la columna `fecha_hora_telefono_utc`).
- **Descarga el CSV al terminar cada jornada y antes de apagar o borrar el servicio.**

## Mapa de contenido: qué campo aparece dónde
| Se edita en | Campo | Aparece en |
|---|---|---|
| Experiencia, *Página del punto* | Mostrar en el hub | Tarjeta en el hub |
| | Título | Tarjeta del hub y título de la página del punto |
| | Descripción corta | Tarjeta del hub y subtítulo de la página |
| | Texto largo | Página del punto |
| | Pista de la señal | Recuadro en la página del punto |
| | Foto | Tarjeta del hub y página del punto |
| | Audio | Reproductor en la página del punto |
| | Coordenadas | Botón «Cómo llegar» (hub y página) |
| *Ajustes del sitio* | Imagen del encabezado | Portada del hub |
| | Logo | Barra superior de las tres páginas |
| | Color de acento | Botones, enlaces y recuadros |
| | Título e introducción del hub | Encabezado del hub |
| | Datos y privacidad | Página `/privacidad` |
| | Zona horaria | Columna `fecha_hora_local` del CSV |

Todo es opcional. Si un espacio está vacío se muestra un texto provisional marcado como «Contenido de prueba». El texto de privacidad provisional está marcado como **borrador pendiente de aprobación**.

## Cambiar imágenes y diseño sin depender de nadie
1. **Desde el editor** (*Ajustes del sitio* y *Página del punto*): sube la imagen y guarda; no hace falta GitHub.
2. **Variables de diseño**: al inicio de `public/hub.css` están los colores, la tipografía y los espaciados, con comentarios.
3. **Estructura**: si reemplazas `hub.html`, `punto.html` o `privacidad.html`, conserva lo siguiente o se rompe la conexión con los datos.

### Qué no hay que borrar
- Los elementos con estos `id`: `siteHeader`, `logo`, `langSel`, `headerImg`, `testBadge`, `siteTitle`, `siteIntro`, `thanks`, `content`, `privLink`.
- Los dos scripts del final: `/track.js` y `/site.js`.
- `<body data-page="...">` con el valor `hub`, `punto` o `privacidad`.
- Las tarjetas, los botones y los textos los crea `site.js` con las clases `tarjetas`, `tarjeta`, `foto`, `cuerpo`, `acciones`, `boton`, `secundario`, `visitado`, `volver`, `texto`, `pista`, `etiqueta` y `vacio`: puedes rediseñarlas en el CSS.

## Respaldo
Editor → *Ajustes del sitio* → **Descargar respaldo (.zip)**: datos (experiencias, ajustes, mediciones) y todos los archivos subidos.

## Lista de comprobación de la 0.7.0 (en dos teléfonos reales, uno iPhone y otro Android)
1. Abrir `/?e=ID&s=piso`: permiso de cámara; tocar «Datos y privacidad» (se abre la página y «atrás» regresa).
2. Permitir cámara, elegir fija o sigue, reconocer el objetivo, ver las escenas y llegar al final.
3. En la pantalla final: **Descubre otros puntos** abre el hub con el mensaje de gracias y el punto marcado como visitado; **Volver a ver** y **Cerrar** funcionan.
4. Hub: tarjetas, **Ver más**, **Cómo llegar** y cambio de idioma.
5. Negar el permiso de cámara en otra prueba: mensaje de ayuda y evento `camara_no`.
6. Activar modo avión a la mitad de una experiencia y reconectar: los avisos llegan después.
7. Editor → *Medición*: aparecen las visitas; descargar el CSV y abrirlo en Excel (acentos y hora local correctos).
8. *Ajustes del sitio*: subir una imagen de encabezado, cambiar el color, guardar y recargar el hub.
9. Hacer un despliegue nuevo y confirmar que los datos y los archivos siguen ahí (disco persistente activo).

## Crear el archivo .mind (imagen objetivo)
Sube la imagen a la [herramienta de MindAR](https://hiukim.github.io/mind-ar-js-doc/tools/compile) y descarga el `.mind`.
