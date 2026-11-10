// TUFFUI (https://tuffui.com) · MIT License · Copyright (c) 2026 TUFFUI contributors
import { CircleNotch, type Icon } from "@phosphor-icons/react";
import { Tooltip } from "@/components/ui/tooltip-hint";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";
export type ButtonSize = "sm" | "md";

const variants: Record<ButtonVariant, string> = {
  // The silver primary is the one place a hairline edge and a drop shadow are allowed.
  primary:
    "border border-black/10 bg-[linear-gradient(0deg,#fff,#e6e6e6)] bg-origin-border text-[#111] hover:bg-[linear-gradient(0deg,#fff,#eee)]",
  secondary:
    "bg-[linear-gradient(180deg,#e2e2e2,#ececec)] text-foreground hover:bg-[linear-gradient(180deg,#dadada,#e4e4e4)]",
  quiet: "text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground",
  danger: "bg-red-600/15 text-[var(--tuff-negative,#c93440)] hover:bg-red-600/25",
};

const sizes: Record<ButtonSize, { base: string; icon: string; glyph: string }> = {
  sm: { base: "h-8 gap-1.5 px-3.5 text-[0.8125rem]", icon: "size-8", glyph: "size-3.5" },
  md: { base: "h-9 gap-2 px-4 text-sm", icon: "size-9", glyph: "size-4" },
};

const base =
  "inline-flex shrink-0 items-center justify-center rounded-full font-medium whitespace-nowrap transition-[background-color,color,scale,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] select-none active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40";

export type ButtonProps = React.ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Leading Phosphor icon. Line glyphs (check, x, arrows) render bold, others filled. */
  icon?: Icon;
  iconWeight?: "fill" | "bold";
  /** Shows a spinner in place of the icon and disables the button. */
  loading?: boolean;
};

export function Button({
  variant = "secondary",
  size = "sm",
  icon: IconComponent,
  iconWeight = "fill",
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const glyph = sizes[size].glyph;
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(base, sizes[size].base, variants[variant], className)}
      {...props}
    >
      {loading ? (
        <Spinner className={glyph} />
      ) : (
        IconComponent && (
          <IconComponent weight={iconWeight} className={glyph} aria-hidden="true" />
        )
      )}
      {children}
    </button>
  );
}

export type IconButtonProps = Omit<ButtonProps, "children" | "icon"> & {
  icon: Icon;
  /** Accessible name; icon buttons have no visible text. */
  label: string;
  /**
   * Show our Tooltip instead of the native `title`. `true` uses `label`; pass a
   * node for richer content (e.g. the label plus a key hint).
   */
  tooltip?: React.ReactNode;
  tooltipSide?: "top" | "bottom";
  tooltipAlign?: "start" | "center" | "end";
};

/**
 * Round, icon-only button. `label` becomes its aria-label, and its native title
 * unless a `tooltip` is given (never both, so hints don't double up).
 */
export function IconButton({
  variant = "quiet",
  size = "sm",
  icon: IconComponent,
  iconWeight = "fill",
  label,
  tooltip,
  tooltipSide = "top",
  tooltipAlign = "center",
  loading = false,
  disabled,
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  const glyph = sizes[size].glyph;
  const button = (
    <button
      type={type}
      aria-label={label}
      title={tooltip ? undefined : label}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(base, sizes[size].icon, variants[variant], className)}
      {...props}
    >
      {loading ? (
        <Spinner className={glyph} />
      ) : (
        <IconComponent weight={iconWeight} className={glyph} aria-hidden="true" />
      )}
    </button>
  );
  if (!tooltip) return button;
  return (
    <Tooltip
      content={tooltip === true ? label : tooltip}
      side={tooltipSide}
      align={tooltipAlign}
    >
      {button}
    </Tooltip>
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <CircleNotch
      weight="bold"
      aria-hidden="true"
      className={cn("animate-spin motion-reduce:animate-none", className)}
    />
  );
}
