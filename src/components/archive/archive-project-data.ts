import { demoProjects } from "./demo-project-data";

export interface ArchiveProject {
  key: string;
  slug: string;
  namespace: string;
  category: "websites" | "webApps" | "aiFilm" | "admin";
  title?: string;
  video?: string;
  preview?: string;
  poster: string | null;
  href: string;
  external: boolean;
  tags: readonly string[];
  gallery: readonly { src: string; key: string }[];
}

export const featuredProjects: readonly ArchiveProject[] = [
  {
    key: "websites", namespace: "Websites",
    slug: "aether", category: "websites",
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
    slug: "jiam", category: "webApps",
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
    slug: "the-clear-labs", category: "aiFilm",
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
    slug: "grids-admin", category: "admin",
    video: "/videos/admin-tool.mov", poster: "/images/archive/admin-overview.svg",
    href: "https://admin.gridsagency.com/", external: true,
    tags: ["admin", "analytics"],
    gallery: [
      { src: "/images/archive/admin-overview.svg", key: "overview" },
      { src: "/images/archive/admin-records.svg", key: "records" },
      { src: "/images/archive/admin-workflow.svg", key: "workflow" },
    ],
  },
] as const;

export const archiveProjects: readonly ArchiveProject[] = [
  ...featuredProjects.filter((project) => project.key !== "admin"),
  ...demoProjects,
  ...featuredProjects.filter((project) => project.key === "admin"),
];
