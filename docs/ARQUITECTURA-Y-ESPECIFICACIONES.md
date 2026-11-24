# Arquitectura y Especificaciones Técnicas (Full-Stack) — Plataforma WebAR Cocula

**Versión documentada:** `0.12.0`  
**Fecha de actualización:** 2026-11-22  
**Proyecto:** Plataforma WebAR de turismo cultural (*Cocula, Cuna del Mariachi*)

---

## 1. Visión general del sistema

Plataforma web de **dos canales integrados** sobre un servidor Node.js sin base de datos externa (persistencia basada en archivos JSON/JSONL + archivos estáticos), diseñada para máxima flexibilidad editorial en pocas experiencias culturales de alta elaboración y acceso directo desde navegador móvil sin instalación de aplicaciones:

1. **Canal Experiencia (Visor WebAR):** Reconocimiento de marcadores físicos (`.mind`) vía cámara web con MindAR + A-Frame, reproducción secuencial a pantalla completa de video con transparencia (`.mov` / `.webm`), imágenes/animaciones WebP con audio independiente y capas de texto programadas por segundo en 5 idiomas.
2. **Canal Sitio / Páginas Informativas:** Hub principal, 5 páginas de navegación fija (`Introducción`, `Cómo se usa`, `Experiencias`, `FAQ` y `Aviso de privacidad`) y páginas dedicadas de cada punto de interés (`/punto?e=ID`), con enfoque *mobile-first* y accesibilidad integrada.
3. **Panel de Administración (`/admin`):** CMS propio protegido por contraseña con vista previa interactiva en mockup de teléfono (iPhone / Android / Promedio), edición visual por arrastre (drag & drop) de cajas de texto e imágenes, línea de tiempo, generador de códigos QR en SVG (stencil y vinilo redondo), analítica anónima y respaldo completo en `.zip`.

---

## 2. Stack tecnológico completo

### Backend
| Componente | Tecnología / Versión | Rol |
| :--- | :--- | :--- |
| Runtime | **Node.js** `>= 18` | Servidor HTTP y procesamiento de archivos |
| Framework HTTP | **Express** `^4.19.2` | Rutas públicas, API REST, archivos estáticos y autenticación |
| Carga de archivos | **Multer** `^1.4.5-lts.1` | Subida multipart hasta 100 MB con lista blanca de extensiones |
| Generación QR | **qrcode-generator** `1.4.4` + `stencil.js` / `roundqr.js` | Generación vectorial SVG (plantilla con puentes y medallón redondo) |
| Compresión ZIP | `lib/zip.js` (implementación propia en Node) | Respaldo descargable sin dependencias externas |
| Persistencia | Archivos planos en `DATA_DIR` (`JSON` / `JSONL`) y `UPLOAD_DIR` | Portabilidad total y despliegue simple en Render / local |

### Frontend — Canal Sitio y Panel Admin
| Componente | Tecnología | Rol |
| :--- | :--- | :--- |
| Lenguajes | **HTML5 semántico**, **CSS3** (variables CSS, Grid, Flexbox), **JavaScript Vanilla (ES6+)** | Cero frameworks pesados; carga rápida en datos móviles |
| Tipografía | **Google Fonts** dinámicas (`Noto Sans` por defecto + 7 opciones) | Legibilidad multiidioma con respaldo CJK (`Noto Sans JP/SC/KR`) |
| Navegación y estado | URLs limpias (`/introduccion`, `/como-se-usa`, `/experiencias`, `/faq`, `/privacidad`, `/punto`) + `localStorage` | Marca local de puntos visitados sin rastreo de usuarios |

### Frontend — Canal Experiencia (WebAR)
| Componente | Tecnología | Rol |
| :--- | :--- | :--- |
| Motor 3D / Escena | **A-Frame** `1.5.0` | Contenedor WebGL y cámara |
| Motor de visión AR | **MindAR Image Tracking** `1.2.5` (`mindar-image-aframe.prod.js`) | Reconocimiento de marcadores `.mind` completamente en el dispositivo |
| Multimedia | HTML5 `<video>` (HEVC `.mov` en iOS/Safari, VP9 `.webm` en Android/Chrome), `<audio>`, WebP animado | Transparencia real sobre la cámara y audio desacoplado |

---

## 3. Estructura del repositorio

```text
ar-tokyo/
├── server.js                    # Servidor Express, API REST, auth, subida, QR y rutas limpias
├── stencil.js                   # Generador SVG de QR cuadrado con puentes para pintura en piso
├── roundqr.js                   # Generador SVG de QR circular para vinilo impreso
├── package.json                 # Metadatos y dependencias del proyecto
├── CHANGELOG.md                 # Historial de versiones (Keep a Changelog)
├── README.md                    # Portada y guía rápida del repositorio
├── docs/
│   ├── ARQUITECTURA-Y-ESPECIFICACIONES.md   # Este documento técnico full-stack
│   └── historial-versiones-plataforma.xlsx  # Registro tabular de versiones para tesis
├── lib/
│   ├── site.js                  # Sanitización y esquemas de páginas y ajustes del sitio
│   ├── events.js                # Registro, agregación y exportación CSV de telemetría anónima
│   └── zip.js                   # Generador de respaldos .zip
├── admin/
│   ├── index.html               # Panel CMS de experiencias, mockup interactivo, línea de tiempo y QR
│   └── extra.js                 # Submenú de Ajustes del sitio, páginas del punto y Medición
├── public/
│   ├── index.html               # Visor WebAR (permiso cámara, modo, escaneo, capas y cierre)
│   ├── app.js                   # Lógica del visor AR, reloj de escenas, estilos y telemetría
│   ├── style.css                # Estilos del visor AR
│   ├── hub.html                 # Página principal (Hub)
│   ├── introduccion.html        # Página de semblanza e introducción
│   ├── como-se-usa.html         # Guía paso a paso responsiva
│   ├── experiencias.html        # Directorio de experiencias y mapa interactivo
│   ├── faq.html                 # Preguntas frecuentes (acordeón <details>)
│   ├── privacidad.html          # Aviso de datos y privacidad
│   ├── punto.html               # Plantilla de página informativa de cada punto
│   ├── site.js                  # Renderizado dinámico multiidioma, menú fijo y pie de página
│   ├── hub.css                  # Sistema de diseño responsivo del canal sitio
│   ├── fx.js                    # Efectos de fondo (estático / parallax respetando reduced-motion)
│   └── track.js                 # Cliente de medición anónima con reintento offline
├── data/                        # Datos persistentes (experiences.json, settings.json, events.jsonl)
└── uploads/                     # Archivos multimedia y marcadores .mind subidos desde /admin
```

---

## 4. Rutas y API REST

### Rutas públicas (HTML)
| Ruta | Archivo servido | Descripción |
| :--- | :--- | :--- |
| `GET /` | `public/hub.html` o `public/index.html` | Abre el Hub; si recibe `?e=ID` abre directamente el visor AR |
| `GET /hub` | `public/hub.html` | Hub principal |
| `GET /introduccion` | `public/introduccion.html` | Bienvenida y semblanza cultural |
| `GET /como-se-usa` | `public/como-se-usa.html` | Guía responsiva en 3 pasos |
| `GET /experiencias` | `public/experiencias.html` | Tarjetas de puntos activos + mapa Google Maps |
| `GET /faq` | `public/faq.html` | Preguntas frecuentes en acordeón |
| `GET /privacidad` | `public/privacidad.html` | Aviso de datos y privacidad |
| `GET /punto?e=ID` | `public/punto.html` | Página informativa del punto específico |
| `GET /admin` | `admin/index.html` | Panel de administración (requiere HTTP Basic Auth) |

### Endpoints de API
| Método y Ruta | Auth | Función |
| :--- | :---: | :--- |
| `GET /api/experiences` | Pública | Lista todas las experiencias configuradas |
| `POST /api/experiences` | Admin | Crea una nueva experiencia |
| `PUT /api/experiences/:id` | Admin | Actualiza una experiencia existente |
| `DELETE /api/experiences/:id` | Admin | Elimina una experiencia |
| `POST /api/upload` | Admin | Sube un archivo (`.mind`, `.mp4`, `.mov`, `.webm`, `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.mp3`, `.m4a`, `.ogg`; máx. 100 MB) |
| `GET /api/site` | Pública | Devuelve `settings` del sitio y los `points` con `page.show === true` |
| `PUT /api/settings` | Admin | Guarda y sanitiza ajustes globales del sitio |
| `GET /api/qr.svg` | Admin | Genera QR vectorial (`mode=stencil` o `mode=round`) con metadatos en cabeceras `X-QR-*` |
| `POST /api/event` | Pública | Registra evento anónimo de telemetría (con límite de tasa por IP en memoria) |
| `GET /api/events/summary` | Admin | Resumen agregado por experiencia, origen de QR y páginas |
| `GET /api/events.csv` | Admin | Exportación CSV con hora UTC y hora local configurada |
| `DELETE /api/events?confirm=BORRAR` | Admin | Reinicia el registro de mediciones |
| `GET /api/backup.zip` | Admin | Descarga respaldo completo (`datos/` + `archivos/`) |

---

## 5. Modelo de datos

### 5.1 Experiencia (`data/experiences.json`)
* `id`, `name`, `targetSrc` (`.mind`), `silhouetteSrc` (PNG guía).
* `elements[]`: secuencia ordenada de elementos (`video`, `image`, `text`):
  * `src`, `srcAlt` (video alternativo `.webm`), `audioSrc`, `duration` (segundos).
  * `texts`: objeto por idioma `{ es, en, ja, zh, ko } → { title, body }`.
  * `style` (`boxStyle`): `{ textColor, bgColor, bgOpacity, borderRadius, fontSize, textAlign, width, x, y }`.
  * `mediaStyle`: `{ width (15–130%), x (0–100%), y (0–100%) }` para posicionamiento libre en 2D de imágenes/WebP.
  * `layers[]`: capas de texto programadas sobre video o imagen con `start`, `duration`, `texts` y `style` propio.
* `page`: configuración de la página del punto (`show`, `title`, `short`, `closing`, `hint`, `photo`, `banner`, `bannerAlt`, `blocks[3]`, `video`, `videoPoster`, `audio`, `lat`, `lng`).

### 5.2 Ajustes del sitio (`data/settings.json`)
* **Identidad y navegación:** `siteSlug` (título de pestaña del navegador), `headerImage`, `logo`, `footerLogo`, `headerBg`, `headerColor`.
* **Sistema de color separado:**
  * Páginas: `accent`, `ctaBg`, `ctaColor`, `secBg`, `secColor`.
  * Experiencias AR: `arCtaBg`, `arCtaColor`, `arSecBg`, `arSecColor`.
* **Tipografía y fondo:** `fontFamily` (8 fuentes Google Fonts), `bgColor`, `bgMobile`, `bgDesktop`, `fxMobile`, `fxDesktop`, `timezone`.
* **Contenidos multiidioma (`es`, `en`, `ja`, `zh`, `ko`):** `hubTitle`, `hubIntro`, `guideTitle`, `guideSteps[3]`, `mapTitle`, `mapIframe`, `hubClosing`, `faqTitle`, `faqList[]`, `privacy`.

---

## 6. Comportamiento del visor WebAR y editor visual

* **Detección estricta sin estrés visual:**
  * `warmupTolerance: 20` cuadros consecutivos en MindAR + confirmación silenciosa continua de `1.2 s` antes de disparar (evita falsos positivos al abrir la cámara sin mostrar barras ni relojes que estresen al usuario).
  * Si pasan **15 segundos** desde `arReady` sin lograr el escaneo, aparece automáticamente el botón **`▶ Reproducir experiencia`** (en los 5 idiomas) como respaldo accesible.
* **Modos de visualización:** *Fija* (permanece en pantalla tras el disparo aunque se mueva el teléfono) o *Sigue al objeto* (se reinicia al perder el marcador).
* **Mockup interactivo en `/admin`:**
  * Selector de viewport real: **Promedio (`375×822`)**, **Android (`360×800`)** e **iPhone (`390×844`)**.
  * Arrastre libre con el mouse (Pointer Events) para cajas de texto e imágenes PNG/WebP guardado en porcentajes relativos.
  * **Línea de tiempo visual** no interactiva con orden de pasos, duración y barras de capas de texto.
  * Selectores de color sincronizados con **código HEX** editable en todo el panel.

---

## 7. Accesibilidad (implementado y puntos a revisar)

### Ya implementado en la plataforma
* **Movimiento reducido (`prefers-reduced-motion`):** `public/fx.js` desactiva efectos de parallax cuando el dispositivo tiene activada la preferencia de reducir movimiento.
* **Diseño responsivo y escalado de texto:** Guía de uso construida con texto real + imágenes adaptables (evitando infografías de solo imagen ilegibles en móvil); uso de unidades relativas (`rem`, `clamp()`) y áreas táctiles mínimas de `44×44 px` en botones y enlaces del menú.
* **Contraste configurable:** Controles separados de fondo y texto para cabecera, páginas, botones CTA, botones secundarios y cajas de texto sobre la cámara (con opacidad ajustable).
* **Imágenes con texto alternativo (`alt`) multiidioma** en banners y bloques de puntos.
* **Respaldo de escaneo AR a los 15 s:** Permite acceder a la experiencia si el usuario tiene dificultades motrices para mantener la cámara fija o si las condiciones de luz impiden el reconocimiento.
* **Control de pausa y lectura:** El botón «Leer más» pausa automáticamente el video/reloj de la escena y abre el texto completo en un modal desplazable; avisos en el editor cuando un texto supera la velocidad de lectura recomendada por idioma.
* **Audio silenciable:** Botón visible para silenciar/activar audio independiente.
* **Internacionalización:** Soporte completo para 5 idiomas (`es`, `en`, `ja`, `zh`, `ko`) con detección automática del idioma del navegador y atributo `lang` dinámico en `<html>`.
* **Semántica base:** `<header>`, `<nav>`, `<main>`, `<footer>`, `<details>/<summary>` nativo en FAQ, `:focus-visible` visible en `hub.css` y etiquetas `aria-label` / `aria-expanded` en el menú hamburguesa.

### Puntos de accesibilidad recomendados para revisar / auditar
1. **Contraste automático (WCAG AA 4.5:1):** Actualmente el editor permite elegir cualquier color HEX libremente; conviene validar el contraste real entre `ctaBg`/`ctaColor`, `secBg`/`secColor` y cajas sobre video (se podría añadir un indicador automático de ratio WCAG en el editor).
2. **Enlace «Saltar al contenido» (*Skip link*) y foco en modales:** En las páginas del hub aún no hay *skip-to-content* para navegación por teclado, y el modal de «Leer más» en el visor AR no atrapa el foco (*focus trap*) ni cierra con la tecla `Escape`.
3. **Subtítulos / transcripción en videos y audios:** Los videos de las páginas de punto (`punto.html`) y audios independientes no cuentan aún con soporte de pistas `<track kind="captions">` (WebVTT) para personas con discapacidad auditiva.
4. **Cierre del menú con teclado y anuncio de estado (`aria-live`):** Anunciar cambios de pantalla en el visor AR (permiso de cámara, texto de error, aparición del botón de respaldo a los 15 s) mediante regiones `aria-live="polite"` para lectores de pantalla.
5. **Contraste de foco en el visor AR (`public/style.css`):** Añadir reglas explícitas de `:focus-visible` en `style.css` (actualmente solo está definido en `hub.css`).

---

## 8. Seguridad, privacidad y despliegue

* **Privacidad por diseño:** La cámara se procesa 100% en el navegador del visitante (MindAR); ninguna imagen ni video se envía al servidor. La medición usa un ID aleatorio por pestaña sin cookies ni almacenamiento de IP en disco.
* **Autenticación:** HTTP Basic Auth con comparación en tiempo constante (`crypto.timingSafeEqual`) mediante `ADMIN_PASSWORD`.
* **Despliegue:** Compatible con **Render** (`node server.js`, variables `ADMIN_PASSWORD`, `DATA_DIR`, `UPLOAD_DIR` en disco persistente) y pruebas locales con HTTPS mediante túnel Cloudflare (`cloudflared`) para acceso a cámara en dispositivos móviles.
