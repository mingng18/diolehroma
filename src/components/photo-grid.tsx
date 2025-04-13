import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { projects } from "@/data/projects";
import { AnimatePresence, motion } from "framer-motion";
import { Project } from "@/types/photo";
import { EASE_IN_OUT_SMOOTH, EASE_OUT } from "@/constants/curves";
import Image from "next/image";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import Lenis from "lenis";
import router from "next/router";

const textClass =
  "font-mono fixed left-0 right-0 py-6 px-3 flex-col items-center z-40 block overflow-hidden vertical-align-bottom";

// fade and blur out
const animations = {
  initial: {
    opacity: 0,
    filter: "blur(6px)",
  },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      ease: EASE_IN_OUT_SMOOTH,
      duration: 0.5,
    },
  },
  exit: {
    opacity: 0,
    filter: "blur(10px)",
    transition: {
      ease: EASE_OUT,
      duration: 0.5,
    },
  },
};

const basePhotos = projects.flatMap((project) => project.photos);
const allPhotos = Array.from(
  { length: basePhotos.length * 5000 },
  (_, index) => ({
    ...basePhotos[index % basePhotos.length],
  })
);

export default function PhotoGrid() {
  const [hoveredProjectId, setHoveredProjectId] = useState<number>(() => {
    // Get the last hovered project ID from sessionStorage if available
    if (typeof window !== "undefined") {
      const savedProjectId = sessionStorage.getItem("last-hovered-project-id");
      return savedProjectId ? parseInt(savedProjectId) : 1;
    }
    return 1;
  });
  const currentHoveredProject: Project | undefined = projects.find(
    (project) => project.id === hoveredProjectId
  );

  // Add a ref to track the Lenis instance
  const lenisRef = useRef<Lenis | null>(null);

  // Calculate number of columns based on view mode
  const getColumnsCount = useCallback(() => {
    // if (viewMode === "list") return 1;
    if (typeof window === "undefined") return 7; // Default for SSR

    const width = window.innerWidth;
    if (width < 768) return 3;
    if (width < 1024) return 4;
    if (width < 1280) return 5;
    return 7;
  }, []);

  const getPadding = useCallback(() => {
    if (typeof window === "undefined") return 96;
    const width = window.innerWidth;
    // if (width < 768) return 32;
    if (width < 1024) return 48;
    return 96;
  }, []);

  const getPhotoHeight = useCallback(() => {
    if (typeof window === "undefined") return 200;
    const width = window.innerWidth;
    const currentPadding = getPadding();
    const columnsCount = getColumnsCount();
    const photoWidth =
      (width - currentPadding * (columnsCount + 1)) / columnsCount;
    return photoWidth + currentPadding;
  }, [getColumnsCount, getPadding]);

  const [columnsCount, setColumnsCount] = useState(getColumnsCount());
  const [padding, setPadding] = useState(getPadding());
  const [photoHeight, setPhotoHeight] = useState(getPhotoHeight());

  // Update columns count on resize
  useEffect(() => {
    const handleResize = () => {
      setColumnsCount(getColumnsCount());
      setPadding(getPadding());
      setPhotoHeight(getPhotoHeight());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getColumnsCount, getPadding, getPhotoHeight]);

  useEffect(() => {
    // Only create a new instance if one doesn't already exist
    if (!lenisRef.current) {
      lenisRef.current = new Lenis({
        autoRaf: true,
      });

      // Check if animation has already been triggered in this session
      const hasAnimationTriggered = sessionStorage.getItem(
        "photo-grid-animation-triggered"
      );

      if (!hasAnimationTriggered) {
        // First time loading - trigger the animation
        const currentPhotoGridHeight =
          (basePhotos.length / columnsCount) * getPhotoHeight();

        // Scrolling to 2 times the height of where
        // the photo repeats after initial load
        lenisRef.current.scrollTo(currentPhotoGridHeight * 3, {
          // offset: currentPhotoGridHeight * 100,
          duration: 2.618,
        });

        // Mark as triggered
        sessionStorage.setItem("photo-grid-animation-triggered", "true");
      }
    }

    // Cleanup function that destroys the instance only once
    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    };
  }, [columnsCount, getPhotoHeight]);

  // Calculate how many rows we need based on photos count and columns
  const rowsCount = useMemo(
    () => Math.ceil(allPhotos.length / columnsCount),
    [columnsCount]
  );

  const rowVirtualizer = useWindowVirtualizer({
    count: rowsCount,
    estimateSize: () => photoHeight,
    overscan: 10,
    paddingStart: padding,
    paddingEnd: padding,
  });

  return (
    <>
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map(({ index, key, size, start }) => {
          // Calculate the range of photos for this row
          const startIndex = index * columnsCount;
          const endIndex = Math.min(
            startIndex + columnsCount,
            allPhotos.length
          );
          const photosInRow = allPhotos.slice(startIndex, endIndex);

          return (
            <div
              key={key}
              data-index={index}
              style={{
                display: "flex",
                flexDirection: "row",
                position: "absolute",
                width: "100%",
                height: `${size}px`,
                transform: `translateY(${start}px)`,
                paddingLeft: padding,
                paddingRight: padding,
                gap: padding,
              }}
            >
              {photosInRow.map((photo) => {
                return (
                  <div
                    key={photo.id}
                    className="flex-1 relative overflow-hidden"
                    onMouseEnter={() => {
                      setHoveredProjectId(photo.projectId);
                      router.prefetch(`/projects/${photo.projectId}`);
                    }}
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      quality={40}
                      sizes="(max-width: 1200px) 22vw, 20vw"
                      style={{ cursor: "pointer" }}
                      className={cn(
                        "object-contain transition-all duration-300 filter",
                        hoveredProjectId === photo.projectId
                          ? "grayscale-0"
                          : "grayscale opacity-20"
                      )}
                      onClick={() => {
                        router.push(`/projects/${photo.projectId}`);
                        setHoveredProjectId(photo.projectId);
                        // Save the selected project ID to sessionStorage
                        sessionStorage.setItem(
                          "last-hovered-project-id",
                          photo.projectId.toString()
                        );
                      }}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="sync">
        <motion.p
          key={`title-${currentHoveredProject?.id}`}
          className={cn("text-3xl font-bold text-center bottom-6", textClass)}
          variants={animations}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {currentHoveredProject?.title ?? ""}
        </motion.p>
        <motion.p
          key={`desc-${currentHoveredProject?.id}`}
          className={cn("text-sm text-center opacity-80 bottom-0", textClass)}
          variants={animations}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {currentHoveredProject?.size ?? ""}
        </motion.p>
      </AnimatePresence>
    </>
  );
}
