import React from "react";
import { motion } from "framer-motion";

const nbOfRows = 12;
export default function WindowBlind({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page window-blind bg-zinc-50">
      {/* <motion.div
        variants={opacity}
        initial="initial"
        animate="enter"
        exit="exit"
        className="fixed w-full h-screen bg-gray-600 z-1 pointer-events-none top-0 left-0"
      /> */}
      <div className="fixed w-screen h-screen left-0 top-0 pointer-events-none z-2 flex flex-col">
        {[...Array(nbOfRows)].map((_, i) => {
          return (
            <motion.div
              className="relative w-full bg-gray-600"
              style={{ height: `${100 / nbOfRows}%` }}
              key={i}
              variants={blindSlat}
              initial="initial"
              animate="enter"
              exit="exit"
              custom={i}
            />
          );
        })}
      </div>
      {children}
    </div>
  );
}

const blindSlat = {
  initial: {
    scaleY: 1,
    transformOrigin: "top",
  },
  enter: (i: number) => ({
    scaleY: 0,
    transformOrigin: "top",
    transition: {
      duration: 0.5,
      delay: 0.02 * i,
      ease: [0.215, 0.61, 0.355, 1],
    },
  }),
  exit: (i: number) => ({
    scaleY: 1,
    transformOrigin: "top",
    transition: {
      duration: 0.2,
      delay: 0.02 * (i),
      ease: [0.215, 0.61, 0.355, 1],
    },
  }),
};

