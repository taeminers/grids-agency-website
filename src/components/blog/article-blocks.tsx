import "server-only";

import Image from "next/image";
import type { ComponentProps, ReactNode } from "react";
import Container from "@/components/container";
import type { BlogImage as BlogImageData } from "@/content/blog/posts";
import { cn } from "@/lib/utils";
import styles from "./blog.module.css";

type ContentProps = { children: ReactNode; className?: string };

/** Owns its gutters. Use as a sibling of BlogVisual, never inside a Container. */
export function BlogReading({ children, className }: ContentProps) {
  return <Container size="reading" innerClassName={cn(styles.prose, className)}>{children}</Container>;
}

/** A wider area for custom diagrams, screenshots, interactive demos or grids. */
export function BlogVisual({ children, className, size = "standard" }: ContentProps & { size?: "standard" | "headline" | "showcase" }) {
  return <Container size={size} innerClassName={className}>{children}</Container>;
}

/** Place inside BlogReading or BlogVisual; it does not add another container. */
export function BlogCallout({ title, children }: ContentProps & { title: string }) {
  return <aside className={styles.callout}><h3>{title}</h3>{children}</aside>;
}

/** Intrinsic dimensions reserve space before the image loads. */
export function BlogImage({ image, caption, sizes = "(max-width: 767px) calc(100vw - 48px), 960px", ...props }: {
  image: BlogImageData;
  caption?: string;
} & Pick<ComponentProps<typeof Image>, "sizes" | "priority">) {
  return <figure className={styles.image}>
    <Image {...image} {...props} alt={image.alt} sizes={sizes} />
    {caption && <figcaption>{caption}</figcaption>}
  </figure>;
}
