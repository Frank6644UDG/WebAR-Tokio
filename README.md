# Plataforma WebAR — Cocula, Cuna del Mariachi (`v0.12.0`)

Plataforma web de realidad aumentada (RA) y sitio informativo cultural con dos canales integrados:

- **Canal experiencia (`/?e=ID`):** visor WebAR en navegador móvil sin instalar apps. Motor: [MindAR](https://github.com/hiukim/mind-ar-js) sobre A-Frame.
- **Canal sitio (`/`, `/introduccion`, `/como-se-usa`, `/experiencias`, `/faq`, `/privacidad`, `/punto`):** hub y páginas informativas *mobile-first* con cabecera fija, menú de 5 páginas y soporte para 5 idiomas (`es`, `en`, `ja`, `zh`, `ko`).
- **Panel de administración (`/admin`):** editor visual de experiencias, mockup de teléfono interactivo, submenú de ajustes del sitio, generador de QR vectorial, medición anónima y respaldo `.zip`.

> **Documentación técnica completa (Full-Stack y Accesibilidad):** consulta [docs/ARQUITECTURA-Y-ESPECIFICACIONES.md](docs/ARQUITECTURA-Y-ESPECIFICACIONES.md).  
> **Historial de versiones:** consulta [CHANGELOG.md](CHANGELOG.md) y [docs/historial-versiones-plataforma.xlsx](docs/historial-versiones-plataforma.xlsx).

---

## Inicio rápido (local)

```bash
npm install
npm start
```

- Sitio público: `http://localhost:3000`
- Panel de administración: `http://localhost:3000/admin` (usuario cualquiera, contraseña por defecto `cambiame` o la definida en `ADMIN_PASSWORD`).
- Para probar la cámara en un celular real desde tu laptop (los navegadores móviles exigen **HTTPS**), abre un túnel hacia el puerto `3000` (por ejemplo con `npx cloudflared tunnel --url http://localhost:3000`).

---

## Direcciones del sistema

| Dirección | Qué es |
| :--- | :--- |
| `/` o `/hub` | **Hub principal** (el QR del tótem usa `/?s=totem`) |
| `/?e=ID&s=piso` | **Visor WebAR** de una experiencia (`s` indica origen del QR: `piso`, `placa`, `totem`) |
| `/introduccion` | Bienvenida y semblanza cultural |
| `/como-se-usa` | Guía paso a paso responsiva con imágenes y texto |
| `/experiencias` | Directorio de puntos publicados y mapa interactivo |
| `/faq` | Preguntas frecuentes con acordeón desplegable |
| `/privacidad` | Aviso de datos y privacidad |
| `/punto?e=ID` | Página informativa de un punto de experiencia |
| `/admin` | Editor de experiencias, ajustes del sitio, medición y respaldo |

---

## Principales capacidades (`v0.12.0`)

- **Visor WebAR:** video con transparencia (`.mov` en iPhone / `.webm` en Android), imágenes/animaciones WebP con audio independiente silenciable, capas de texto programadas por segundo, confirmación estricta y silenciosa de escaneo (`warmupTolerance: 20` + `1.2 s`) y botón de respaldo **«▶ Reproducir experiencia»** automático tras `15 s`.
- **Editor visual en `/admin`:**
  - Mockup de teléfono con promedios reales de viewport: **Promedio (`375×822`)**, **Android (`360×800`)** e **iPhone (`390×844`)**.
  - Arrastre libre con el mouse para cajas de texto e imágenes/PNG (posición guardada en porcentajes relativos) y estilo completo de caja (colores con HEX, opacidad, esquinas redondeadas, tamaño y alineación).
  - **Línea de tiempo visual** con orden de pasos, duraciones y capas de texto.
  - Submenú en **Ajustes del sitio** para editar cada página con enlace directo *«Ver página en vivo»*, selector de tipografía (8 fuentes Google Fonts) y colores CTA/secundarios separados para páginas y experiencias AR.
- **Códigos QR en SVG:** modo *stencil* (cuadrado con puentes para pintura en piso) y modo *redondo* (medallón para vinilo).
- **Medición anónima y respaldo:** registro sin cookies ni IP en disco, exportación CSV con zona horaria local y descarga completa en `.zip`.

---

## Variables de entorno (Render)

- `ADMIN_PASSWORD`: contraseña del panel `/admin` (**cambiar en producción**).
- `DATA_DIR` y `UPLOAD_DIR`: rutas del disco persistente (por ejemplo `/var/data/data` y `/var/data/uploads`) si se editan contenidos directamente en el servidor desplegado.

---

## Crear el archivo `.mind` (imagen objetivo)

Sube la imagen objetivo a la [herramienta oficial de compilación de MindAR](https://hiukim.github.io/mind-ar-js-doc/tools/compile), descarga el archivo `.mind` y súbelo desde `/admin` en el campo *Imagen objetivo compilada*.
