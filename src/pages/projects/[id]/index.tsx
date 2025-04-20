import React, { useEffect, useMemo, useRef, useState } from "react";
import Scene from "./rgb-photo/rgb-photo";
import Image from "next/image";
import Lenis from "lenis";
import Head from "next/head";
import WindowBlind from "@/components/custom/window-blind";
import Link from "next/link";
import { projects } from "@/data/projects";
import { motion } from "motion/react";

export default function PageDetails() {
  const project = useMemo(() => {
    const url = window.location.href;
    const pathParts = url.split("/");
    const lastPart = pathParts[pathParts.length - 1];
    const id = sessionStorage.getItem("last-hovered-project-id") ?? lastPart;

    return id
      ? projects.find((project) => project.id.toString() === id)
      : undefined;
  }, []);

  const scrollContainerRef = useRef<HTMLUListElement>(null);
  const lenis = useRef<Lenis>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);

  // Check if we're on mobile screen size
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();

    window.addEventListener("resize", checkIfMobile);
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    lenis.current = new Lenis({
      autoRaf: true,
      orientation: isMobile ? "horizontal" : "vertical",
    });

    const handleScroll = () => {
      let minDistance = Infinity;
      let closestIndex = 0;

      const center = isMobile
        ? window.innerWidth / 2 // horizontal center
        : window.innerHeight / 2; // vertical center

      container.childNodes.forEach((child, index) => {
        if (child instanceof HTMLElement) {
          const rect = child.getBoundingClientRect();
          const elementCenter = isMobile
            ? rect.left + rect.width / 2
            : rect.top + rect.height / 2;

          const distance = Math.abs(elementCenter - center);

          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
          }
        }
      });

      setCurrentPhotoIndex(closestIndex);
    };

    const scrollTarget = isMobile ? container : window;
    scrollTarget.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => {
      lenis.current?.destroy();
      scrollTarget.removeEventListener("scroll", handleScroll);
    };
  }, [isMobile]);

  // Show error state if project not found
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-xl font-bold mb-4">Project not found</h1>
        <Link href="/">
          <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors">
            Back to Projects
          </button>
        </Link>
      </div>
    );
  }

  // Mobile layout
  if (isMobile) {
    return (
      <>
        <Head>
          <title>{project?.title}</title>
          <meta name="Description" content={project?.description} />
        </Head>
        <WindowBlind>
          {/* Header with title and project info */}
          <motion.div
            className="fixed top-0 left-0 w-full z-10 p-6 flex flex-col items-center justify-between"
            variants={{
              visible: {
                transition: {
                  delayChildren: 0.2,
                  staggerChildren: 0.1,
                  ease: [0.215, 0.61, 0.355, 1],
                },
              },
            }}
          >
            <h1 className="text-lg font-mono font-bold text-gray-600 text-center">
              {project?.title}
            </h1>
            <p className="text-xs font-mono tracking-wide font-light text-gray-600 text-center mt-1">
              {project?.size} | {project?.scale}x | {project?.buildTime}
            </p>
            <Link href="/">
              <button className="z-20 mt-2 bg-white/10 backdrop-blur-sm p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </Link>
          </motion.div>

          {/* Main image display in the center */}
          <Scene currentPhotoIndex={currentPhotoIndex} project={project} />

          {/* Image list at the bottom */}
          <div className="h-screen relative pb-4">
            <motion.ul
              ref={scrollContainerRef}
              className="flex flex-row gap-4 items-end px-[50%] pb-4 overflow-x-auto snap-x h-full"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    delayChildren: 0.2,
                    staggerChildren: 0.05,
                  },
                },
              }}
            >
              {project.photos.map((photo, index) => (
                <motion.li
                  key={photo.id}
                  data-index={index}
                  className="relative snap-center cursor-pointer flex-shrink-0"
                  style={{
                    width: "60px",
                    aspectRatio: "4/5",
                  }}
                  onClick={() => {
                    setCurrentPhotoIndex(index);
                    // Scroll the thumbnail into view
                    const element = scrollContainerRef.current?.children[
                      index
                    ] as HTMLElement;
                    if (element) {
                      element.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                        inline: "center",
                      });
                    }
                  }}
                  variants={{
                    hidden: { opacity: 0, filter: "blur(4px)", y: 20 },
                    visible: { opacity: 1, filter: "blur(0px)", y: 0 },
                  }}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="60px"
                    style={{
                      objectFit: "cover",
                      transition: "all 0.2s ease-out",
                    }}
                    className={`rounded ${
                      currentPhotoIndex === index
                        ? "ring-2 ring-white ring-offset-2 ring-offset-transparent"
                        : "opacity-60"
                    }`}
                  />
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </WindowBlind>
      </>
    );
  }

  // Desktop layout (original)
  return (
    <>
      <Head>
        <title>{project?.title}</title>
        <meta name="Description" content={project?.description} />
      </Head>
      <WindowBlind>
        <Scene currentPhotoIndex={currentPhotoIndex} project={project} />
        {/* Transparent Rectangle with black border */}
        <div
          className="px-23 fixed top-0 left-0 w-full h-full"
          style={{
            transform: "translateY(calc(50vh - 52px))",
          }}
        >
          <div className="w-22 h-14 bg-transparent border-1 border-gray-700 z-50" />
        </div>

        <div className="w-screen flex flex-row justify-between z-[50]">
          <motion.ul
            ref={scrollContainerRef}
            className="px-24 flex flex-col gap-4"
            style={{
              paddingTop: "calc(50vh - 48px)",
              paddingBottom: "50vh",
            }}
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  delayChildren: 0.2,
                  staggerChildren: 0.05,
                },
              },
            }}
          >
            {project.photos.map((photo, index) => (
              <motion.li
                key={photo.id}
                data-index={index}
                className="relative w-20 h-12 cursor-pointer"
                onClick={() => {
                  lenis.current?.scrollTo(index * (48 + 16), {
                    duration: 0.5,
                  });
                }}
                variants={{
                  hidden: { opacity: 0, filter: "blur(4px)", y: 20 },
                  visible: { opacity: 1, filter: "blur(0px)", y: 0 },
                }}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={200}
                  height={200}
                  style={{
                    objectFit: "cover",
                    height: "100%",
                    width: "100%",
                    transition: "all 0.2s ease-out",
                  }}
                  className={`${
                    currentPhotoIndex === index ? "saturate-50 opacity-50" : ""
                  }`}
                />
              </motion.li>
            ))}
          </motion.ul>

          <motion.div
            className="fixed right-0 h-screen px-24 flex flex-col justify-center"
            style={{
              mixBlendMode: "difference",
            }}
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  delayChildren: 0.2,
                  staggerChildren: 0.1,
                  ease: [0.215, 0.61, 0.355, 1],
                },
              },
            }}
          >
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="text-lg font-mono font-bold text-gray-300 pb-4"
            >
              {project?.title}
            </motion.h1>
            <SmallWords word={project?.size} />
            <SmallWords word={`${project?.scale}x`} />
            <SmallWords word={`${project?.buildTime}`} />
          </motion.div>
          {/* Close Icon to go back */}
          <header className="fixed top-0 w-full p-6 z-100 flex justify-between items-center bg-transparent mix-blend-difference">
            <div className="font-mono text-lg font-light tracking-widest text-gray-50">
              ludens-garage
            </div>
            <Link href="/">
              <button className="text-sm font-mono font-light text-gray-50 cursor-pointer">
                Close
              </button>
            </Link>
          </header>
        </div>
      </WindowBlind>
    </>
  );
}

function SmallWords({ word }: { word: string }) {
  return (
    <motion.p
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      className="text-xs font-mono tracking-wide font-light text-gray-400 text-right pt-[0.5]"
      style={{
        height: "1.2em",
        lineHeight: "1.2em",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {word}
    </motion.p>
  );
}
