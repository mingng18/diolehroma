import React, { useEffect, useRef, useState } from "react";
import { projects } from "@/data/projects";
import NextImage, { StaticImageData } from "next/image";
import ImageTrail from "./fancy-components/image-trail";

import dynoSet1 from "@/images/dyno-set/IMG_0841.jpg";
import advanceGarage1 from "@/images/advance-garage/IMG_0148.jpg";
import hangar1 from "@/images/hangar/IMG_4018.jpg";
import japaneseWorkshop1 from "@/images/japanese-workshop/IMG_1019.jpg";
import malaysiaGarage1 from "@/images/malaysia-garage-scene/IMG_1966.jpg";
import modernGarage1 from "@/images/modern-garage/IMG_2933.jpg";
import { TextShimmerWave } from "./fancy-components/text-shimmer";

const exampleImages = [
  { url: dynoSet1, alt: "Dyno Set" },
  { url: advanceGarage1, alt: "Advance Garage" },
  { url: hangar1, alt: "Hangar" },
  { url: japaneseWorkshop1, alt: "Japanese Workshop" },
  { url: malaysiaGarage1, alt: "Malaysia Garage" },
  { url: modernGarage1, alt: "Modern Garage" },
];

interface LoaderProps {
  children: React.ReactNode;
}

const Loader: React.FC<LoaderProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const loadedImagesRef = useRef(0);

  useEffect(() => {
    // Get all images from all projects
    const allImages: { src: StaticImageData; alt: string; id: number }[] = [];
    projects.forEach((project) => {
      allImages.push(...project.photos);
    });

    // Preload all images
    const preloadImages = async () => {
      const promises = allImages.map(
        (image) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.src = image.src.src;
            img.onload = () => {
              loadedImagesRef.current++;
              const newProgress = Math.floor(
                (loadedImagesRef.current / allImages.length) * 100
              );

              setProgress(newProgress);
              resolve();
            };
            img.onerror = () => {
              loadedImagesRef.current++;
              const newProgress = Math.floor(
                (loadedImagesRef.current / allImages.length) * 100
              );
              setProgress(newProgress);
              resolve();
            };
          })
      );

      await Promise.all(promises);
      // Wait 0.5 more seconds for animation
      await new Promise((resolve) => setTimeout(resolve, 500));
      setLoading(false);
    };

    preloadImages();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-zinc-50 flex flex-col items-center justify-center ">
        <TextShimmerWave className="font-mono text-sm" duration={1}>
          {`Loading... \n${progress.toFixed(2)}%`}
        </TextShimmerWave>
        <div className="absolute top-0 left-0 z-0" ref={ref}>
          {ref.current && (
            <ImageTrail containerRef={ref as React.RefObject<HTMLElement>}>
              {exampleImages.map((image, index) => (
                <div
                  key={index}
                  className="flex relative overflow-hidden w-24 h-24 z-50"
                >
                  <NextImage
                    src={image.url}
                    alt={image.alt}
                    className="object-cover absolute inset-0"
                    priority
                    quality={50}
                  />
                </div>
              ))}
            </ImageTrail>
          )}
        </div>
      </div>
    );
  }

  return children;
};

export default Loader;
