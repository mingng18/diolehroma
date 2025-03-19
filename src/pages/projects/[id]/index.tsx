import React, { useEffect, useRef, useState } from "react";
// import DistortedPhoto from "./distorted-photo/distorted-photo";
import Scene from "./rgb-photo/rgb-photo";
import { useRouter } from "next/router";
import { projects } from "@/data/projects";
import Image from "next/image";
import Lenis from "lenis";
import Head from "next/head";
import WindowBlind from "@/components/custom/window-blind";
// import Snap from "lenis/snap";

export default function PageDetails() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [isLoading, setIsLoading] = useState(true);

  // Only find the project when id is available (after hydration)
  const project = id
    ? projects.find((project) => project.id.toString() === id)
    : undefined;

  // const refs = useRef(Array(project?.photos.length).fill(null));
  const scrollContainerRef = useRef<HTMLUListElement>(null);

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
  const currentPhoto = project?.photos[currentPhotoIndex];

  const lenis = useRef<Lenis>(null);

  // Set loading to false once we have the id from router
  useEffect(() => {
    if (router.isReady) {
      setIsLoading(false);
    }
  }, [router.isReady]);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current || !project?.photos) return;

      const container = scrollContainerRef.current;
      const centerY = window.innerHeight / 2; // Center of viewport

      let minDistance = Infinity;
      let closestIndex: number | null = null;

      container.childNodes.forEach((child, index) => {
        if (child instanceof HTMLElement) {
          const rect = child.getBoundingClientRect();
          const elementCenter = rect.top + rect.height / 2;
          const distance = Math.abs(elementCenter - centerY);

          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
          }
        }
      });

      if (closestIndex !== null) {
        setCurrentPhotoIndex(closestIndex);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, [project?.photos]);

  useEffect(() => {
    lenis.current = new Lenis({
      autoRaf: true,
    });

    // const snap = new Snap(lenis.current, {
    //   lerp: 0.2,
    //   easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    // });

    // refs.current.forEach((item) => {
    //   if (!item || !scrollContainerRef.current) return;
    //   const itemCenter = item.offsetLeft + item.offsetWidth / 2;
    //   snap.add(itemCenter - scrollContainerRef.current.clientWidth / 2);
    // });

    return () => {
      // snap.destroy();
      lenis.current?.destroy();
    };
  }, [lenis]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading project...
      </div>
    );
  }

  // Show error state if project not found
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-xl font-bold mb-4">Project not found</h1>
        <button
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          onClick={() => router.push("/projects")}
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{project?.title}</title>
        <meta name="Description" content={project?.description} />
      </Head>
      <WindowBlind>
        {/* Transaprent Rectangle with black border */}
        <div
          className="px-23 fixed top-0 left-0 w-full h-full"
          style={{
            transform: "translateY(calc(50vh - 52px))",
          }}
        >
          <div className="w-22 h-14 bg-transparent border-1 border-gray-700 z-50" />
        </div>
        <div className="w-screen flex flex-row justify-between">
          <ul
            ref={scrollContainerRef}
            className="px-24 flex flex-col gap-4"
            style={{
              paddingTop: "calc(50vh - 48px)",
              paddingBottom: "50vh",
            }}
          >
            {project.photos.map((photo, index) => (
              <li
                key={photo.id}
                data-index={index}
                className="relative w-20 h-12 cursor-pointer"
                onClick={() => {
                  lenis.current?.scrollTo(index * (48 + 16), {
                    duration: 0.5,
                  });
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
                    currentPhoto === photo ? "saturate-50 opacity-50" : ""
                  }`}
                />
              </li>
            ))}
          </ul>

          <Scene currentPhotoIndex={currentPhotoIndex} project={project} />

          <div className="fixed right-0 h-screen px-24 flex flex-col justify-center">
            <h1 className="text-lg font-mono font-bold text-gray-600">
              {project?.title}
            </h1>
            {/* <p
              className="text-xs font-mono tracking-wider text-gray-500"
              style={{ maxWidth: "80ch" }}
            >
              {project?.description}
            </p> */}
            <p className="text-xs font-mono tracking-wide pt-12 font-light text-gray-600">
              {project?.size}
              <br />
              {project?.scale}x
              <br />
              {project?.buildTime}
            </p>
          </div>
          {/* Close Icon to go back */}
          <button className="fixed top-4 right-4" onClick={() => router.back()}>
            Close
          </button>
        </div>
      </WindowBlind>
    </>
  );
}
