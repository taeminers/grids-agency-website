"use client";

import { useEffect, useId, useState } from "react";
import { motion, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import { parse as parseFont } from "opentype.js";

type SignatureGlyph = {
  advanceWidth?: number;
  getPath: (
    x: number,
    y: number,
    fontSize: number,
  ) => {
    toPathData: (decimalPlaces?: number) => string;
    getBoundingBox: () => { x1: number; y1: number; x2: number; y2: number };
  };
};

type SignatureFont = {
  unitsPerEm: number;
  charToGlyph: (char: string) => SignatureGlyph;
};

const SVG_HEIGHT = 100;
const PATH_DELAY_STEP = 0.2;
const OPACITY_DELAY_OFFSET = 0.01;
const fontCache = new Map<string, SignatureFont>();

function getFontCacheKey(path: string): string {
  try {
    return new URL(path, window.location.origin).href;
  } catch {
    return path;
  }
}

function getPathTransition(index: number, duration: number, delay: number) {
  const pathDelay = duration === 0 ? 0 : delay + index * PATH_DELAY_STEP;

  return {
    pathLength: {
      delay: pathDelay,
      duration,
      ease: "easeInOut" as const,
    },
    opacity: {
      delay: pathDelay + OPACITY_DELAY_OFFSET,
      duration: 0.01,
    },
  };
}

async function loadFontFromPaths(fontPaths: string[]): Promise<SignatureFont> {
  for (const path of fontPaths) {
    try {
      const cacheKey = getFontCacheKey(path);
      const cachedFont = fontCache.get(cacheKey);

      if (cachedFont) {
        return cachedFont;
      }

      const response = await fetch(path);

      if (!response.ok) {
        continue;
      }

      const fontBuffer = await response.arrayBuffer();
      const font = parseFont(fontBuffer) as SignatureFont;
      fontCache.set(cacheKey, font);

      return font;
    } catch {
      // Try next path
    }
  }

  throw new Error(
    `Font could not be loaded from the provided path${fontPaths.length === 1 ? "" : "s"}: ${fontPaths.join(", ")}`,
  );
}

async function buildSignaturePaths({
  text,
  fontSize,
  baseline,
  horizontalPadding,
}: {
  text: string;
  fontSize: number;
  baseline: number;
  horizontalPadding: number;
}): Promise<{ paths: string[]; width: number; viewBox: string }> {
  const font = await loadFontFromPaths(["/fonts/LastoriaBoldRegular.otf"]);

  let x = horizontalPadding;
  const nextPaths: string[] = [];
  let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;

  for (const char of text) {
    const glyph = font.charToGlyph(char);
    const path = glyph.getPath(x, baseline, fontSize);
    nextPaths.push(path.toPathData(3));
    const bounds = path.getBoundingBox();
    left = Math.min(left, bounds.x1);
    top = Math.min(top, bounds.y1);
    right = Math.max(right, bounds.x2);
    bottom = Math.max(bottom, bounds.y2);

    const advanceWidth = glyph.advanceWidth ?? font.unitsPerEm;
    x += advanceWidth * (fontSize / font.unitsPerEm);
  }

  const padding = Math.max(4, horizontalPadding);
  if (!nextPaths.length) return { paths: [], width: 300, viewBox: "0 0 300 100" };
  const actualWidth = right - left + padding * 2;
  const actualHeight = bottom - top + padding * 2;
  return {
    paths: nextPaths,
    width: actualWidth / actualHeight * SVG_HEIGHT,
    viewBox: `${left - padding} ${top - padding} ${actualWidth} ${actualHeight}`,
  };
}

function ScrollSignaturePath({ d, index, count, progress, ...appearance }: {
  d: string;
  index: number;
  count: number;
  progress: MotionValue<number>;
  stroke: string;
  strokeWidth: number;
  strokeLinecap: "round" | "butt";
  strokeLinejoin: "round";
}) {
  const pathLength = useTransform(progress, [index / (count + 2), (index + 3) / (count + 2)], [0, 1]);
  const opacity = useTransform(pathLength, [0, 0.001], [0, 1]);

  return <motion.path d={d} {...appearance} fill="none" vectorEffect="non-scaling-stroke"
    style={{ pathLength, opacity }} />;
}

function renderMotionPaths({
  paths,
  stroke,
  strokeWidth,
  strokeLinecap,
  strokeLinejoin,
  duration,
  delay,
  progress,
}: {
  paths: string[];
  stroke: string;
  strokeWidth: number;
  strokeLinecap: "round" | "butt";
  strokeLinejoin: "round";
  duration: number;
  delay: number;
  progress?: MotionValue<number>;
}) {
  if (progress) {
    return paths.map((d, index) => (
      <ScrollSignaturePath key={index} d={d} index={index} count={paths.length}
        progress={progress} stroke={stroke} strokeWidth={strokeWidth}
        strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin} />
    ));
  }
  return paths.map((d, index) => (
    <motion.path
      key={index}
      d={d}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill="none"
      variants={PATH_VARIANTS}
      transition={getPathTransition(index, duration, delay)}
      vectorEffect="non-scaling-stroke"
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
    />
  ));
}

const PATH_VARIANTS = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1 },
};

interface SignatureProps {
  text?: string;
  color?: string;
  fontSize?: number;
  duration?: number;
  delay?: number;
  className?: string;
  inView?: boolean;
  once?: boolean;
  /** Drive the complete handwriting sequence directly with a 0–1 scroll value. */
  progress?: MotionValue<number>;
}

export function Signature({
  text = "Signature",
  color = "#000",
  fontSize = 14,
  duration = 1.5,
  delay = 0,
  className,
  inView = false,
  once = true,
  progress,
}: SignatureProps) {
  const reducedMotion = useReducedMotion();
  const [paths, setPaths] = useState<string[]>([]);
  const [width, setWidth] = useState<number>(300);
  const [viewBox, setViewBox] = useState("0 0 300 100");
  const horizontalPadding = fontSize * 0.1;
  const topMargin = Math.max(5, (SVG_HEIGHT - fontSize) / 2);
  const baseline = Math.min(SVG_HEIGHT - 5, topMargin + fontSize);
  const maskId = `signature-reveal-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    let isCancelled = false;

    async function loadSignaturePaths() {
      try {
        const { paths: nextPaths, width: nextWidth, viewBox: nextViewBox } = await buildSignaturePaths({
          text,
          fontSize,
          baseline,
          horizontalPadding,
        });

        if (isCancelled) {
          return;
        }

        setPaths(nextPaths);
        setWidth(nextWidth);
        setViewBox(nextViewBox);
      } catch {
        if (isCancelled) {
          return;
        }

        setPaths([]);
        setWidth(text.length * fontSize * 0.6);
        setViewBox(`0 0 ${Math.max(1, text.length * fontSize * 0.6)} ${SVG_HEIGHT}`);
      }
    }

    void loadSignaturePaths();

    return () => {
      isCancelled = true;
    };
  }, [text, fontSize, baseline, horizontalPadding]);

  return (
    <motion.svg
      key={paths.length}
      width={width}
      height={SVG_HEIGHT}
      viewBox={viewBox}
      fill="none"
      className={className}
      role="img"
      aria-label={text}
      initial={progress ? false : "hidden"}
      whileInView={!progress && inView ? "visible" : undefined}
      animate={progress || inView ? undefined : "visible"}
      viewport={{ once }}
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse">
          {renderMotionPaths({
            paths,
            stroke: "white",
            strokeWidth: fontSize * 0.22,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            duration: reducedMotion ? 0 : duration,
            delay,
            progress,
          })}
        </mask>
      </defs>

      {renderMotionPaths({
        paths,
        stroke: color,
        strokeWidth: 2,
        strokeLinecap: "butt",
        strokeLinejoin: "round",
        duration: reducedMotion ? 0 : duration,
        delay,
        progress,
      })}

      <g mask={`url(#${maskId})`}>
        {paths.map((d, index) => (
          <path key={index} d={d} fill={color} />
        ))}
      </g>
      {paths.length === 0 && (
        <text x={horizontalPadding} y={baseline} fill={color} fontSize={fontSize} fontFamily="cursive">
          {text}
        </text>
      )}
    </motion.svg>
  );
}
