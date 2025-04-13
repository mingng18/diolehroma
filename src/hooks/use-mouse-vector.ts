"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface MousePosition {
  x: number;
  y: number;
}

interface MouseVector {
  x: number;
  y: number;
  magnitude: number;
}

interface UseMouseVectorReturn {
  position: MousePosition;
  vector: MouseVector;
}

export function useMouseVector(
  containerRef?: React.RefObject<HTMLElement>
): UseMouseVectorReturn {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [vector, setVector] = useState<MouseVector>({
    x: 0,
    y: 0,
    magnitude: 0,
  });
  const previousPositionRef = useRef<MousePosition>({ x: 0, y: 0 });
  const frameRef = useRef<number>(0);

  const updateMousePosition = useCallback(
    (event: MouseEvent) => {
      const { clientX, clientY } = event;

      // If containerRef is provided, calculate position relative to the container
      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Update position regardless of whether mouse is within container
        // This allows for smoother tracking even when cursor is moving fast
        setPosition({ x, y });
      } else {
        // Global mouse position
        setPosition({ x: clientX, y: clientY });
      }
    },
    [containerRef] // Remove position from deps
  );

  const calculateVector = useCallback(() => {
    const dx = position.x - previousPositionRef.current.x;
    const dy = position.y - previousPositionRef.current.y;
    const magnitude = Math.sqrt(dx * dx + dy * dy);

    setVector({
      x: dx,
      y: dy,
      magnitude,
    });

    previousPositionRef.current = position;
    frameRef.current = requestAnimationFrame(calculateVector);
  }, [position]);

  useEffect(() => {
    // Add mousemove listener to window (works for all cases)
    window.addEventListener("mousemove", updateMousePosition);
    
    // Start animation frame
    frameRef.current = requestAnimationFrame(calculateVector);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      cancelAnimationFrame(frameRef.current);
    };
  }, [updateMousePosition, calculateVector]);

  return { position, vector };
}
