export const archiveProjects = [
  {
    key: "websites", namespace: "Websites",
    video: "/videos/aether-hero-small.mp4", poster: "/images/archive/aether.jpg",
    href: "https://aetherparfums.com/", external: true,
    tags: ["website", "film"],
    gallery: [
      { src: "/images/archive/aether-detail-3.jpg", key: "bottle" },
      { src: "/images/archive/aether-detail-1.jpg", key: "coffee" },
      { src: "/images/archive/aether-detail-2.jpg", key: "rum" },
    ],
  },
  {
    key: "webApps", namespace: "WebApps",
    video: "/videos/jiam.mp4", poster: "/images/archive/jiam.jpg",
    href: "https://jiam.jeisys.com", external: true,
    tags: ["platform", "learning"],
    gallery: [
      { src: "/images/archive/jiam-detail-1.jpg", key: "first" },
      { src: "/images/archive/jiam-detail-2.jpg", key: "second" },
      { src: "/images/archive/jiam-detail-3.jpg", key: "third" },
    ],
  },
  {
    key: "aiFilm", namespace: "AiFilm",
    video: "/videos/tcl.mp4", poster: "/images/archive/tcl.jpg",
    href: "https://drive.google.com/drive/folders/1jMGQeDtEEHjjFct-hJTBl5PQHehL795N?usp=drive_link", external: true,
    tags: ["brand", "ai"],
    gallery: [
      { src: "/images/archive/tcl-detail-1.jpg", key: "first" },
      { src: "/images/archive/tcl-detail-2.jpg", key: "second" },
      { src: "/images/archive/tcl-detail-3.jpg", key: "third" },
    ],
  },
  {
    key: "admin", namespace: "AdminTools",
    video: "/videos/admin-tool.mov", poster: null,
    href: "https://admin.gridsagency.com/", external: true,
    tags: ["admin", "analytics"],
    gallery: [],
  },
] as const;

export type ArchiveProject = (typeof archiveProjects)[number];
