# Brick Wall · Página de descargas del launcher

Página única para descargar **Brick Launcher**

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
música en ese momento
