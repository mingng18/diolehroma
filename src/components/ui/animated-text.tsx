import { useRef, useEffect } from "react";
import { motion, useAnimation, useInView, Variant } from "framer-motion";
import {
  EASE_IN_OUT_SMOOTH,
  EASE_OUT,
  STAGGER_DEFAULT,
} from "@/constants/curves";

type AnimatedTextProps = {
  text: string | string[] | undefined; // Allow undefined
  el?: React.ElementType;
  keyId?: string;
  className?: string;
  style?: React.CSSProperties;
  once?: boolean;
  renderInView?: boolean;
  repeatDelay?: number;
  splitType?: "word" | "letter";
  staggerChildren?: number;
  delay?: number;
  animation?: {
    hidden: Variant;
    visible: Variant;
    exit: Variant;
  };
};

const defaultAnimations = {
  hidden: {
    opacity: 1,
    y: "100%",
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ease: EASE_IN_OUT_SMOOTH,
      duration: 1,
    },
  },
  exit: {
    opacity: 0,
    y: "-100%",
    transition: {
      ease: EASE_OUT,
      duration: 1,
    },
  },
};

const AnimatedText = ({
  text = "",
  // el: Wrapper = "p",
  keyId,
  className,
  once = true,
  renderInView = true,
  repeatDelay,
  splitType = "word",
  delay = 0,
  staggerChildren = STAGGER_DEFAULT,
  animation = defaultAnimations,
}: AnimatedTextProps) => {
  const controls = useAnimation();
  const textArray = Array.isArray(text) ? text : [text]; // Ensure it's an array
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.5, once });

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const show = () => {
      controls.start("visible");
      if (repeatDelay) {
        timeout = setTimeout(async () => {
          await controls.start("hidden");
          controls.start("visible");
        }, repeatDelay);
      }
    };

    if (isInView || !renderInView) {
      show();
    } else {
      controls.start("hidden");
    }

    return () => clearTimeout(timeout);
  }, [controls, isInView, renderInView, repeatDelay]);

  return (
    <motion.div key={keyId} className={className}>
      <span className="sr-only">{textArray.join(" ")}</span>
      <motion.span
        ref={ref}
        initial="hidden"
        animate={controls}
        exit="exit"
        variants={{
          visible: {
            transition: { delayChildren: delay, staggerChildren },
          },
          exit: {
            transition: { delayChildren: delay, staggerChildren },
          },
          hidden: {},
        }}
        aria-hidden
      >
        {textArray.map((line, lineIndex) => (
          <motion.span
            style={{
              display: "block",
              overflow: "hidden",
              verticalAlign: "bottom",
            }}
            key={`${line}-${lineIndex}`}
          >
            {splitType === "word" &&
              (line || "").split(" ").map((word, wordIndex) => (
                <motion.span
                  key={`${word}-${wordIndex}`}
                  style={{ display: "inline-block" }}
                  variants={animation}
                >
                  {word}
                  {wordIndex < (line || "").split(" ").length - 1 && (
                    <span>&nbsp;</span>
                  )}
                </motion.span>
              ))}
            {splitType === "letter" &&
              (line || "").split(" ").map((word, wordIndex) => (
                <motion.span
                  key={`${word}-${wordIndex}`}
                  style={{ display: "inline-block" }}
                >
                  {word.split("").map((char, charIndex) => (
                    <motion.span
                      key={`${char}-${charIndex}`}
                      style={{ display: "inline-block" }}
                      variants={animation}
                    >
                      {char}
                    </motion.span>
                  ))}
                  {wordIndex < (line || "").split(" ").length - 1 && (
                    <span>&nbsp;</span>
                  )}
                </motion.span>
              ))}
          </motion.span>
        ))}
      </motion.span>
    </motion.div>
  );
};

export default AnimatedText;
