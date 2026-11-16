# Plataforma de experiencias de RA, versión 0.8.0

Dos canales en un mismo sistema:
- **Canal experiencia** (`/`): visor de realidad aumentada. Motor: [MindAR](https://github.com/hiukim/mind-ar-js) (código abierto) sobre A-Frame.
- **Canal página** (`/hub`, `/punto`, `/privacidad`): páginas informativas, móviles primero.

Editor en `/admin` (usuario cualquiera, contraseña = `ADMIN_PASSWORD`). El historial de cambios está en `CHANGELOG.md` y en `docs/historial-versiones-plataforma.xlsx`.

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
- `DATA_DIR` y `UPLOAD_DIR`: apúntalas al **disco persistente** cuando lo contrates (por ejemplo `/var/data/data` y `/var/data/uploads`). Sin él se pierden los datos y los archivos en cada despliegue.

## La página de punto (composición fija)
Cabecera (idioma, logo al centro y menú hamburguesa) → banner con pendiente → tres bloques de imagen y texto → video → cierre (texto, pista, audio y «Cómo llegar») → pie. Solo cambian las imágenes y los textos, nunca la composición.
- **Bloques vacíos** (sin imagen, título ni texto): no se muestran, y los demás se acomodan.
- **Cajas del mismo tamaño**: los tres bloques miden lo que mide el más grande, aunque alguno se vea vacío.
- **Teléfonos de menos de 480 px**: imagen arriba y texto abajo. **480 a 899 px**: imagen al lado del texto, alternando de lado. **900 px o más**: tres columnas, imagen arriba y texto abajo. (Se cambian en las reglas `@media` de `public/hub.css`.)
- **Texto alternativo**: cada imagen tiene el suyo por idioma; si falta, se usa el título del bloque.

## Fondo y efecto (Ajustes del sitio)
La imagen de fondo va detrás de todo el contenido. Efecto en teléfono: ninguno o estático. En escritorio: ninguno, estático o parallax. Si no hay imagen, no hay efecto. Quien tenga activada la opción «reducir movimiento» de su teléfono o computadora no ve ningún efecto. El parallax mueve el fondo un tramo corto durante todo el scroll y la imagen del banner un poco más despacio que la página.

## Medidas recomendadas de las imágenes (WebP)
| Hueco | Medida | Peso |
|---|---|---|
| Banner y encabezado del hub | 1600×700 | menos de 300 KB |
| Imagen de cada bloque | 1000×750 | menos de 200 KB |
| Foto de la tarjeta del hub | 1200×675 | menos de 200 KB |
| Portada del video | 1280×720 | menos de 200 KB |
| Fondo, teléfono (vertical) | 1080×1920 | menos de 400 KB |
| Fondo, escritorio (horizontal) | 1920×1080 | menos de 500 KB |
| Logo | PNG o WebP transparente, 80 px de alto | menos de 100 KB |

El editor avisa cuando una imagen pesa de más, tiene una proporción muy distinta (se recorta) o no es WebP. Los avisos no bloquean la subida; se cambian en `SPECS`, al inicio de `admin/extra.js`.

## Medición (solo para las pruebas de usabilidad)
Cuenta **visitas, no personas**. Cada visita tiene un identificador al azar que vive solo en esa pestaña. No se guarda la IP (solo se usa en memoria para limitar abusos), ni cookies, ni nombres. Se guarda: hora del servidor (UTC) y del teléfono, canal, evento, experiencia, origen del QR, idioma, detalle, número y sistema y navegador resumidos.

Eventos: `abre`, `camara_ok`, `camara_no`, `modo`, `silueta`, `objetivo` (milisegundos hasta reconocer), `objetivo_perdido`, `sin_reconocer` (15 s), `escena`, `completa`, `cierra`, `leer_mas`, `al_hub`, `repetir`, `idioma`, `privacidad`, `error`, `pagina`.

Editor → **Medición**: resumen y **Descargar CSV** (con `fecha_hora_local` según la zona horaria de *Ajustes del sitio*). Si el teléfono no tiene señal, los avisos se envían al reconectar (usa entonces `fecha_hora_telefono_utc`). **Descarga el CSV al terminar cada jornada y antes de apagar o borrar el servicio.**

## Mapa de contenido: qué campo aparece dónde
| Se edita en | Campo | Aparece en |
|---|---|---|
| Experiencia, *Página del punto* | Mostrar en el hub | Tarjeta en el hub |
| | Título | Banner de la página y tarjeta del hub |
| | Subtítulo | Banner de la página y descripción de la tarjeta |
| | Foto de la tarjeta | Tarjeta del hub (si falta, se usa el banner) |
| | Imagen y texto alternativo del banner | Banner de la página |
| | Bloques 1 a 3 (imagen, texto alternativo, título, texto) | Los tres bloques |
| | Video y portada | Sección de video |
| | Texto de cierre, pista y audio | Cierre de la página |
| | Coordenadas | Botón «Cómo llegar» (hub y página) |
| *Ajustes del sitio* | Imagen del encabezado | Banner del hub |
| | Logo | Cabecera de las tres páginas |
| | Color de acento | Botones, enlaces y recuadros |
| | Fondo (imágenes, color y efecto) | Detrás de las tres páginas |
| | Título e introducción del hub | Encabezado del hub |
| | Datos y privacidad | Página `/privacidad` |
| | Zona horaria | Columna `fecha_hora_local` del CSV |

Todo es opcional: lo que está vacío no se muestra, o aparece un texto provisional marcado como «Contenido de prueba». El texto de privacidad provisional está marcado como **borrador pendiente de aprobación**.

## Cambiar imágenes y diseño sin depender de nadie
1. **Desde el editor**: sube la imagen y guarda; no hace falta GitHub.
2. **Variables de diseño**: al inicio de `public/hub.css` están los colores, la tipografía, los espaciados y la forma de la pendiente del banner, con comentarios.
3. **Estructura**: si reemplazas `hub.html`, `punto.html` o `privacidad.html`, conserva lo siguiente o se rompe la conexión con los datos.

### Qué no hay que borrar
- Los elementos con estos `id`: `fondoEfecto`, `siteHeader`, `logoLink`, `logo`, `logoText`, `menuBtn`, `menuBtnLabel`, `mainNav`, `navHub`, `navPriv`, `langSel`, `content`, `privLink`.
- Los tres scripts del final: `/track.js`, `/fx.js` y `/site.js`.
- `<body data-page="...">` con el valor `hub`, `punto` o `privacidad`.
- El banner, los bloques, el video y el cierre los crea `site.js` con las clases `banner`, `bloques`, `bloque`, `caja`, `tarjetas`, `boton`, `pista`, etc.: se rediseñan en el CSS.

## Respaldo
Editor → *Ajustes del sitio* → **Descargar respaldo (.zip)**: datos (experiencias, ajustes, mediciones) y archivos subidos. Todavía no hay un botón para restaurarlo.

## Lista de comprobación de la 0.8.0 (en dos teléfonos reales, uno iPhone y otro Android)
1. Subir una imagen de banner y de cada bloque en una experiencia, marcar «Mostrar en el hub», guardar y abrir **Ver la página del punto**.
2. En teléfono: cabecera con logo al centro, menú hamburguesa (abre, cierra con «Escape» o al tocar de nuevo) y selector de idioma visible.
3. Dejar un bloque vacío y comprobar que desaparece; poner textos de distinta longitud y comprobar que las cajas miden lo mismo.
4. Girar el teléfono y probar un ancho de 480 a 899 px: imagen al lado del texto, alternando.
5. En escritorio: tres columnas con imagen arriba y texto abajo.
6. *Ajustes del sitio*: subir fondos (teléfono y escritorio), probar «Estático» y «Parallax» (solo escritorio) y comprobar que el texto se lee bien sobre las cajas blancas.
7. Activar «reducir movimiento» en el teléfono o en el navegador: no debe haber ningún efecto.
8. Subir una imagen demasiado pesada o con otra proporción y ver el aviso.
9. Reproducir el video de la página en iPhone y en Android.
10. Repetir los pasos 1 a 9 de la lista de la 0.7.0 que aún no hayas confirmado.

## Crear el archivo .mind (imagen objetivo)
Sube la imagen a la [herramienta de MindAR](https://hiukim.github.io/mind-ar-js-doc/tools/compile) y descarga el `.mind`.
