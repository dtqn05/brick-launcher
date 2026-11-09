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
      /* «Texto» = botón resaltado · “Texto” = mensaje entre comillas */
      steps: [
        { title: "Descarga el launcher", text: "Pulsa el botón naranja «Descargar para Windows». El archivo se guarda en tu carpeta Descargas." },
        { title: "Permite la descarga", text: "Si el navegador avisa de que el archivo “no se descarga habitualmente”, pulsa «Conservar». Es un aviso automático porque el launcher es nuevo." },
        { title: "Abre el instalador", text: "Ve a tu carpeta Descargas y haz doble clic en el archivo BrickLauncher_1.0.0_x64-setup.exe." },
        { title: "Si sale una ventana azul", text: "Windows puede mostrar el aviso “Windows protegió su PC”. Pulsa «Más información» y después «Ejecutar de todas formas». Sale porque el launcher aún no tiene firma digital." },
        { title: "Instala", text: "En el instalador pulsa «Siguiente» y luego «Instalar». No hace falta cambiar nada ni ser administrador." },
        { title: "¡A jugar!", text: "Pulsa «Terminar». Para abrirlo más adelante, búscalo en el menú Inicio como BrickLauncher." }
      ],
      tips: [
        "Descárgalo siempre desde esta página oficial.",
        "¿Tu antivirus lo bloquea? Escríbenos en Discord antes de nada y te ayudamos.",
        "Para desinstalarlo: «Configuración» → «Aplicaciones» → BrickLauncher → «Desinstalar».",
        "En Edge, si no ves «Conservar», pulsa «…» junto a la descarga y elige «Conservar» → «Conservar de todos modos»."
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
    { name: "Discord",   icon: "discord",   url: "#", handle: "" },
    { name: "YouTube",   icon: "youtube",   url: "#", handle: "" },
    { name: "TikTok",    icon: "tiktok",    url: "#", handle: "" },
    { name: "Kick",      icon: "kick",      url: "#", handle: "" },
    { name: "Instagram", icon: "instagram", url: "#", handle: "" },
    { name: "X",         icon: "x",         url: "#", handle: "" }
  ]
};
