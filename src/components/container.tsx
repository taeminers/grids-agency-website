import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type ContainerProps = ComponentProps<"div"> & {
  size?: "standard" | "headline" | "reading" | "showcase";
  innerClassName?: string;
};

/** One gutter owner per section. The inner width excludes viewport padding. */
export default function Container({ size = "standard", className, innerClassName, children, ...props }: ContainerProps) {
  return <div {...props} className={cn("site-gutter", className)}>
    <div className={cn("site-container", innerClassName)} data-size={size}>{children}</div>
  </div>;
}
