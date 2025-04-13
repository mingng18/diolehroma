"use client";

import { useState, useEffect } from "react";

type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

type ScreenSize = {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  lessThan: (breakpoint: Breakpoint) => boolean;
};

export function useScreenSize(): ScreenSize {
  const [screenSize, setScreenSize] = useState<Omit<ScreenSize, "lessThan">>({
    width: 0,
    height: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  // Add lessThan method to check if current width is less than breakpoint
  const enhancedScreenSize: ScreenSize = {
    ...screenSize,
    lessThan: (breakpoint: Breakpoint) => screenSize.width < breakpoints[breakpoint],
  };

  useEffect(() => {
    // Handle SSR case
    if (typeof window === "undefined") return;

    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setScreenSize({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      });
    };

    // Set initial values
    updateScreenSize();

    // Add event listener
    window.addEventListener("resize", updateScreenSize);

    // Cleanup event listener
    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  return enhancedScreenSize;
}

export default useScreenSize;
