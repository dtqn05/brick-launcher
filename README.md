# Brick Wall · Página de descargas del launcher

Página única para descargar **Brick Launcher**, con estética retro futurista Y2K.
Es HTML, CSS y JavaScript puro: **no necesita npm ni ninguna instalación**.
Se sube tal cual a GitHub y se publica con GitHub Pages.

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub (por ejemplo `brickwall-launcher`).
2. Sube **todo el contenido de esta carpeta** a la raíz del repositorio
   (en la web de GitHub: *Add file → Upload files* y arrastra los archivos y carpetas).
   Comprueba que `index.html` queda en la raíz, no dentro de otra carpeta.
3. Ve a **Settings → Pages → Build and deployment**:
   - *Source*: **Deploy from a branch**
   - *Branch*: **main** y carpeta **/ (root)** → **Save**
4. En 1–2 minutos estará en `https://TU-USUARIO.github.io/brickwall-launcher/`.

Todas las rutas son relativas, así que funciona dentro de cualquier repositorio.
El archivo `.nojekyll` debe subirse también (evita que GitHub procese la web).

> Para verla en tu ordenador antes de subirla, abre `index.html` con doble clic.
> Los datos de Discord y GitHub (si los activas) solo cargan cuando está publicada.

## Estructura

```
index.html                 la página
.nojekyll                  necesario para GitHub Pages
css/styles.css             estilos
js/config.js               ← lo único que necesitas editar
js/main.js                 navegación, pantallas, intro y controles
js/audio.js                música y efectos de sonido
js/background.js           red de líneas y motas de luz del fondo
js/icons.js                iconos
assets/                    logo, favicons y vídeo de la intro (intro.mp4)
downloads/                 instaladores que se descargan desde la página
  BrickLauncher_1.0.0_x64-setup.exe
```

## Configurar (`js/config.js`)

- **Instalador de Windows**: está en `downloads/BrickLauncher_1.0.0_x64-setup.exe` y se
  descarga con ese mismo nombre. Para una versión nueva, sube el nuevo `.exe` a `downloads/`
  y cambia `fileName`, `url` y `size` en `platforms.windows`.
- **Guía de instalación**: `steps` (pasos con título y texto) y `tips` («Bueno saberlo»).
- **macOS y Linux**: tienen `comingSoon: true` → muestran «Próximamente». Cuando tengas
  el instalador, súbelo a `downloads/`, pon su `url` y quita `comingSoon`.
- **Mensaje de «Próximamente»**: `comingSoon.title` y `comingSoon.text`.
- **Novedades**: lista `notes` (aparece debajo de la instalación).
- **Ayuda**: `help` (texto bajo la instalación). El botón «Ir al Discord» usa el enlace de
  Discord de `socials`.
- **Redes sociales**: `socials` → cambia `"#"` por tus enlaces. Borra una línea para ocultarla.
- **Esquina inferior**: `footer` (el año del © se pone solo).
- **Intro**: `intro.video` para cambiar el vídeo; `intro.enabled: false` para quitarla.
- **Sonido**: `audio` → volumen inicial y si suena la música.
- **Datos reales (opcional)**:
  - `discord.serverId`: muestra quién está conectado en tu servidor. Actívalo en Discord →
    *Ajustes del servidor → Widget → Habilitar widget* y copia el *ID del servidor*.
  - `github`: solo si algún día publicas los instaladores en GitHub Releases
    (tamaño, descargas y fecha automáticos). Si no, déjalo vacío.

## Cómo funciona

- **Intro**: «Iniciar sistema» reproduce `assets/intro.mp4` con su sonido; se puede
  omitir y solo aparece una vez por sesión. Tiene control de volumen y silencio.
- **Menú**: Windows abre el instalador; macOS y Linux muestran el aviso de «Próximamente».
- **Logo de la esquina**: al pasar el ratón los ladrillos se montan; al pulsarlo vuelves al inicio.
- **Comunidad** (arriba a la derecha): desplegable con las redes sociales.
- **Controles**: ratón/táctil · teclado (`↑ ↓`, `Enter`, `Esc`) · mando (`A`, `B`, `Y`).
- **Enlaces directos**: `…/#windows`, `…/#comunidad`.

## Música y sonido

La música y los efectos son **originales**: se generan en el navegador (Web Audio API),
sin archivos de audio de terceros. Los clics usan notas del acorde que suena en la
música en ese momento, así siempre encajan. Nada suena hasta que el visitante
interactúa (requisito de los navegadores). El único audio externo es el de tu vídeo de intro.
