"use client"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import type React from "react"

export interface BlurRevealProps {
  children: string
  className?: string
  delay?: number
  speedReveal?: number
  speedSegment?: number
  trigger?: boolean
  active?: boolean
  onAnimationComplete?: () => void
  onAnimationStart?: () => void
  as?: keyof React.JSX.IntrinsicElements
  style?: React.CSSProperties
  inView?: boolean
  once?: boolean
  letterSpacing?: string | number
}

export function BlurReveal({
  children,
  className,
  delay = 0,
  speedReveal = 1.5,
  speedSegment = 0.5,
  trigger = true,
  active = true,
  onAnimationComplete,
  onAnimationStart,
  as = "p",
  style,
  inView = false,
  once = true,
  letterSpacing,
}: BlurRevealProps) {
  const reducedMotion = useReducedMotion()
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div

  const stagger = reducedMotion ? 0 : 0.03 / Math.max(speedReveal, 0.01)
  const baseDuration = reducedMotion ? 0 : 0.3 / Math.max(speedSegment, 0.01)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: reducedMotion ? 0 : delay,
      },
    },
    exit: {
      transition: {
        staggerChildren: stagger,
        staggerDirection: -1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, filter: "blur(12px)", y: 10 },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        duration: baseDuration,
      },
    },
    exit: { opacity: 0, filter: "blur(12px)", y: 10 },
  }

  return (
    <AnimatePresence mode="popLayout">
      {trigger && (
        <MotionTag
          initial="hidden"
          whileInView={active && inView ? "visible" : undefined}
          animate={!active ? "hidden" : inView ? undefined : "visible"}
          exit="exit"
          variants={containerVariants}
          viewport={{ once }}
          className={[className, "motion-reduce:opacity-100!"].filter(Boolean).join(" ")}
          onAnimationComplete={onAnimationComplete}
          onAnimationStart={onAnimationStart}
          style={active ? style : { ...style, visibility: "hidden" }}
          aria-hidden={!active || undefined}
        >
          <span className="sr-only">{children}</span>
          {children &&
            children.split(" ").map((word, wordIndex, wordsArray) => (
              <span key={`word-${wordIndex}`} className="inline-block whitespace-nowrap" aria-hidden="true">
                {word.split("").map((char, charIndex) => (
                  <motion.span
                    key={`char-${wordIndex}-${charIndex}`}
                    variants={itemVariants}
                    className="inline-block motion-reduce:opacity-100! motion-reduce:transform-none! motion-reduce:filter-none!"
                    style={letterSpacing ? { marginRight: letterSpacing } : undefined}
                  >
                    {char}
                  </motion.span>
                ))}
                {wordIndex < wordsArray.length - 1 && (
                  <motion.span
                    key={`space-${wordIndex}`}
                    variants={itemVariants}
                    className="inline-block motion-reduce:opacity-100! motion-reduce:transform-none! motion-reduce:filter-none!"
                  >
                    &nbsp;
                  </motion.span>
                )}
              </span>
            ))}
        </MotionTag>
      )}
    </AnimatePresence>
  )
}
