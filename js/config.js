/* ==========================================================================
   BRICK WALL · CONFIGURACIÓN DE LA PÁGINA DE DESCARGAS
   --------------------------------------------------------------------------
   Este es el ÚNICO archivo que necesitas tocar para actualizar la página:
   versión, enlaces de los instaladores, notas, redes sociales y sonido.
   ========================================================================== */

window.BRICKWALL_CONFIG = {
  /* Versión actual del launcher ("auto" = la de tu última GitHub Release) */
  version: "1v",

  /* Logo (ruta relativa a index.html) */
  logo: "assets/logo.png",

  brand: "Brick Wall",

  /* Enlace opcional a todas las versiones (déjalo "" para ocultarlo) */
  releasesUrl: "",

  /* ------------------------------------------------------------------------
     DATOS REALES (opcionales)
     github: repositorio donde publicas los instaladores en Releases.
       Con esto la página muestra el tamaño real de cada instalador, cuántas
       veces se ha descargado y la fecha de publicación. Si una plataforma no
       tiene "url", se usa automáticamente el archivo de la última Release.
       Pon version: "auto" para usar la etiqueta de la Release como versión.
     discord: ID de tu servidor para mostrar quién está conectado ahora.
       Actívalo en Discord → Ajustes del servidor → Widget → «Habilitar widget»
       y copia el «ID del servidor».
     Déjalos vacíos para ocultar esos datos.
     ------------------------------------------------------------------------ */
  github: { owner: "", repo: "" },
  discord: { serverId: "" },

  /* Intro: vídeo que se reproduce al pulsar «Iniciar sistema».
     Se muestra una vez por sesión del navegador. */
  intro: {
    enabled: true,
    video: "assets/intro.mp4"
  },

  /* Sonido por defecto (cada visitante puede cambiarlo y se recuerda) */
  audio: {
    enabled: true,   // sonido activado
    music: true,     // música de fondo
    volume: 0.4      // 0 a 1 · la música entra siempre en fundido suave
  },

  /* Texto de la esquina inferior (el año se pone solo) */
  footer: "Brick Wall · Página web oficial",

  /* Mensaje de las plataformas con comingSoon: true */
  comingSoon: {
    title: "Próximamente",
    text: "Disculpen las molestias."
  },

  /* ------------------------------------------------------------------------
     INSTALADORES
     Sube cada instalador a la carpeta downloads/ y pon aquí su nombre.
     Para una versión nueva: sustituye el .exe en downloads/ y cambia
     fileName, url y size.
     ------------------------------------------------------------------------ */
  platforms: {
    windows: {
      label: "Windows",
      format: "EXE",
      arch: "64 bits",
      fileName: "BrickLauncher_1.0.0_x64-setup.exe",
      // El instalador va dentro de la web, en la carpeta downloads/
      url: "downloads/BrickLauncher_1.0.0_x64-setup.exe",
      size: "6,0 MB",
      requirements: "Windows 10 u 11 · 64 bits",
      // Guía de instalación: cada paso con título y explicación
      steps: [
        { title: "Descarga el instalador", text: "Pulsa «Descargar para Windows». Se guardará el archivo `BrickLauncher_1.0.0_x64-setup.exe` (6 MB) en tu carpeta Descargas." },
        { title: "Si el navegador lo frena", text: "Algunos navegadores avisan de que el archivo «no se descarga habitualmente». En Chrome pulsa «Conservar»; en Edge pulsa «…» → «Conservar» → «Mostrar más» → «Conservar de todos modos»." },
        { title: "Abre el instalador", text: "Haz doble clic en el archivo desde la carpeta Descargas o desde la lista de descargas del navegador." },
        { title: "Aviso de Windows (SmartScreen)", text: "Como el launcher es nuevo y todavía no tiene firma digital, Windows puede mostrar «Windows protegió su PC». Pulsa «Más información» → «Ejecutar de todas formas». Es normal en programas recién publicados." },
        { title: "Sigue el asistente", text: "Pulsa «Siguiente», deja la carpeta de instalación que viene por defecto (o elige otra) y pulsa «Instalar». No hacen falta permisos de administrador." },
        { title: "¡Listo para jugar!", text: "Pulsa «Terminar». Abre el launcher desde el menú Inicio escribiendo «BrickLauncher»." }
      ],
      // Consejos extra (aparecen debajo de los pasos)
      tips: [
        "Descarga el launcher solo desde esta página oficial para tener siempre la versión correcta.",
        "Si tu antivirus lo bloquea o lo pone en cuarentena, escríbenos en Discord antes de hacer nada y te ayudamos.",
        "Para desinstalarlo: Configuración → Aplicaciones → Aplicaciones instaladas → BrickLauncher → Desinstalar."
      ]
    },
    macos: {
      label: "macOS",
      format: "DMG",
      arch: "Universal",
      comingSoon: true,      // quítalo cuando el instalador esté listo
      fileName: "BrickWall-Launcher.dmg",
      url: "",               // p. ej. "downloads/BrickLauncher_1.0.0_universal.dmg"
      requirements: "macOS 11 o superior · Apple Silicon e Intel",
      steps: [
        "Abre el .dmg y arrastra el launcher a Aplicaciones.",
        "La primera vez, haz clic derecho sobre la app → «Abrir».",
        "Confirma y listo."
      ]
    },
    linux: {
      label: "Linux",
      format: "AppImage",
      arch: "x64",
      comingSoon: true,      // quítalo cuando el instalador esté listo
      fileName: "BrickWall-Launcher.AppImage",
      url: "",               // p. ej. "downloads/BrickLauncher_1.0.0_amd64.AppImage"
      requirements: "Distribución de 64 bits",
      steps: [
        "Dale permisos de ejecución: `chmod +x BrickWall-Launcher.AppImage`",
        "Ejecútalo con doble clic o desde la terminal."
      ]
    }
  },

  /* Novedades (aparecen abajo, después de la instalación) */
  notes: [
    "Primera versión completa del launcher de Brick Wall.",
    "Ya puedes descargarlo e instalarlo en Windows desde esta página.",
    "Las versiones para macOS y Linux están en camino.",
    "Sigue nuestras redes y el Discord para enterarte de cada novedad."
  ],

  /* Ayuda bajo la instalación (el botón usa el enlace de Discord de «socials») */
  help: {
    title: "¿Algún problema?",
    text: "Cualquier duda o error con la instalación, escríbenos en nuestro Discord y te ayudamos."
  },

  /* ------------------------------------------------------------------------
     REDES SOCIALES
     icon disponibles: discord, youtube, tiktok, kick, twitch, instagram, x
     handle (opcional): texto pequeño bajo el nombre, p. ej. "@brickwall"
     Si configuras discord.serverId y el enlace de Discord está vacío o es "#",
     se usa automáticamente la invitación del widget.
     Para ocultar una red, bórrala de la lista.
     ------------------------------------------------------------------------ */
  socials: [
    { name: "Discord",   icon: "discord",   url: "#", handle: "" },
    { name: "YouTube",   icon: "youtube",   url: "#", handle: "" },
    { name: "TikTok",    icon: "tiktok",    url: "#", handle: "" },
    { name: "Kick",      icon: "kick",      url: "#", handle: "" },
    { name: "Instagram", icon: "instagram", url: "#", handle: "" },
    { name: "X",         icon: "x",         url: "#", handle: "" }
  ]
};
