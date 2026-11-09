/* BRICK WALL · Configuración de la página de descargas */

window.BRICKWALL_CONFIG = {
  version: "1.0.0",
  logo: "assets/logo.png",
  brand: "Brick Wall",

  /* ID del servidor de Discord para mostrar quién está conectado (vacío = oculto).
     Discord → Ajustes del servidor → Widget → «Habilitar widget» */
  discord: { serverId: "" },

  intro: {
    enabled: true,
    video: "assets/intro.mp4"
  },

  /* Volumen de 0 a 1 */
  audio: {
    enabled: true,
    music: true,
    volume: 0.4
  },

  footer: "Brick Wall · Página web oficial",

  comingSoon: {
    title: "Próximamente",
    text: "Disculpen las molestias."
  },

  /* Los instaladores van en la carpeta downloads/ */
  platforms: {
    windows: {
      label: "Windows",
      format: "EXE",
      arch: "64 bits",
      fileName: "BrickLauncher_1.0.0_x64-setup.exe",
      url: "downloads/BrickLauncher_1.0.0_x64-setup.exe",
      size: "6,0 MB",
      requirements: "Windows 10 u 11 · 64 bits",
      steps: [
        { title: "Descarga el instalador", text: "Pulsa «Descargar para Windows». Se guardará el archivo `BrickLauncher_1.0.0_x64-setup.exe` (6 MB) en tu carpeta Descargas." },
        { title: "Si el navegador lo frena", text: "Algunos navegadores avisan de que el archivo «no se descarga habitualmente». En Chrome pulsa «Conservar»; en Edge pulsa «…» → «Conservar» → «Mostrar más» → «Conservar de todos modos»." },
        { title: "Abre el instalador", text: "Haz doble clic en el archivo desde la carpeta Descargas o desde la lista de descargas del navegador." },
        { title: "Aviso de Windows (SmartScreen)", text: "Como el launcher es nuevo y todavía no tiene firma digital, Windows puede mostrar «Windows protegió su PC». Pulsa «Más información» → «Ejecutar de todas formas». Es normal en programas recién publicados." },
        { title: "Sigue el asistente", text: "Pulsa «Siguiente», deja la carpeta de instalación que viene por defecto (o elige otra) y pulsa «Instalar». No hacen falta permisos de administrador." },
        { title: "¡Listo para jugar!", text: "Pulsa «Terminar». Abre el launcher desde el menú Inicio escribiendo «BrickLauncher»." }
      ],
      tips: [
        "Descarga el launcher solo desde esta página oficial para tener siempre la versión correcta.",
        "Si tu antivirus lo bloquea o lo pone en cuarentena, escríbenos en Discord antes de hacer nada y te ayudamos.",
        "Para desinstalarlo: Configuración → Aplicaciones → Aplicaciones instaladas → BrickLauncher → Desinstalar."
      ]
    },

    /* Quita comingSoon y pon la url cuando el instalador esté listo */
    macos: {
      label: "macOS",
      format: "DMG",
      arch: "Universal",
      comingSoon: true,
      fileName: "",
      url: "",
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
      comingSoon: true,
      fileName: "",
      url: "",
      requirements: "Distribución de 64 bits",
      steps: [
        "Dale permisos de ejecución con `chmod +x` al archivo descargado.",
        "Ejecútalo con doble clic o desde la terminal."
      ]
    }
  },

  notes: [
    "Primera versión completa del launcher de Brick Wall.",
    "Ya puedes descargarlo e instalarlo en Windows desde esta página.",
    "Las versiones para macOS y Linux están en camino.",
    "Sigue nuestras redes y el Discord para enterarte de cada novedad."
  ],

  help: {
    title: "¿Algún problema?",
    text: "Cualquier duda o error con la instalación, escríbenos en nuestro Discord y te ayudamos."
  },

  /* Iconos: discord, youtube, tiktok, kick, twitch, instagram, x
     handle es opcional (p. ej. "@brickwall"). Borra una línea para ocultar esa red. */
  socials: [
    { name: "Discord",   icon: "discord",   url: "https://discord.gg/u4sYM8QTkw", handle: "" },
    { name: "YouTube",   icon: "youtube",   url: "#", handle: "" },
    { name: "TikTok",    icon: "tiktok",    url: "#", handle: "" },
    { name: "Kick",      icon: "kick",      url: "#", handle: "" },
    { name: "Instagram", icon: "instagram", url: "#", handle: "" },
    { name: "X",         icon: "x",         url: "#", handle: "" }
  ]
};
