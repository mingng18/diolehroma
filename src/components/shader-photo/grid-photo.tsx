import React, {
  useRef,
  useState,
  useEffect,
  RefObject,
  useCallback,
} from "react";
import styles from "./grid-photo.module.css";
import Image, { StaticImageData } from "next/image";
import { projects } from "@/data/projects";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ShaderMaterial, Mesh, Texture, MathUtils } from "three";
import { vertex, fragment } from "./r3f-shaders";

// Debug flag - set to true to enable debug mode
const DEBUG = false;
// Fallback flag - set to true to use basic material instead of shader
const USE_FALLBACK = false;

// Custom hook for scroll handling
const useScrollPosition = () => {
  const [scrollY, setScrollY] = useState({
    current: 0,
    last: 0,
    direction: "none",
  });

  const handleScroll = useCallback(() => {
    setScrollY((prev) => {
      const current = window.scrollY;
      const direction =
        current > prev.current
          ? "down"
          : current < prev.current
          ? "up"
          : "none";
      return {
        current,
        last: prev.current,
        direction,
      };
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return scrollY;
};

interface ShaderImageProps {
  photo: {
    src: StaticImageData;
    alt: string;
  };
  index: number;
  galleryRef: RefObject<HTMLDivElement | null>;
  scrollY: {
    current: number;
    last: number;
    direction: string;
  };
  debug?: boolean;
  useFallback?: boolean;
}

// ShaderMesh component that will replace the media.js class
const ShaderImage: React.FC<ShaderImageProps> = ({
  index,
  galleryRef,
  scrollY,
  debug = DEBUG,
  useFallback = USE_FALLBACK,
}) => {
  const meshRef = useRef<Mesh>(null);
  const { viewport, size } = useThree();
  const [texture] = useState<Texture | null>(null);
  const [bounds, setBounds] = useState({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
  });
  const [imageSizes] = useState([0, 0]);
  const [strength, setStrength] = useState(0);
  const [extra, setExtra] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [shaderError, setShaderError] = useState(false);

  // Load texture
  // useEffect(() => {
  //   const loader = new THREE.TextureLoader();
  //   loader.load(photo.src, (loadedTexture) => {
  //     loadedTexture.minFilter = THREE.LinearFilter;
  //     loadedTexture.magFilter = THREE.LinearFilter;
  //     loadedTexture.generateMipmaps = false;
  //     setTexture(loadedTexture);
  //     setImageSizes([loadedTexture.image.width, loadedTexture.image.height]);
  //   });
  // }, [photo.src]);

  // Get element bounds
  const updateBounds = useCallback(() => {
    if (galleryRef.current) {
      const figures = galleryRef.current.querySelectorAll("figure");
      if (figures[index]) {
        const rect = figures[index].getBoundingClientRect();
        setBounds({
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
        });

        // Check if element is in viewport
        const isInView =
          rect.bottom > 0 &&
          rect.top < window.innerHeight &&
          rect.right > 0 &&
          rect.left < window.innerWidth;

        setIsVisible(isInView);
      }
    }
  }, [galleryRef, index]);

  // Update bounds on scroll and resize
  useEffect(() => {
    updateBounds();

    const handleResize = () => {
      updateBounds();
      setExtra(0); // Reset extra offset on resize
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateBounds]);

  // Update position and scale based on scroll
  useFrame(() => {
    if (!meshRef.current || (!isVisible && !debug)) return;

    if (bounds.width && bounds.height) {
      // Scale
      meshRef.current.scale.x = (viewport.width * bounds.width) / size.width;
      meshRef.current.scale.y = (viewport.height * bounds.height) / size.height;

      // Position X
      meshRef.current.position.x =
        -(viewport.width / 2) +
        meshRef.current.scale.x / 2 +
        (bounds.left / size.width) * viewport.width;

      // Position Y - account for scrolling
      meshRef.current.position.y =
        viewport.height / 2 -
        meshRef.current.scale.y / 2 -
        ((bounds.top - scrollY.current) / size.height) * viewport.height -
        extra;

      // Update uniforms if using shader material
      if (
        !useFallback &&
        !debug &&
        !shaderError &&
        meshRef.current.material &&
        "uniforms" in meshRef.current.material
      ) {
        try {
          const shaderMaterial = meshRef.current.material as ShaderMaterial;

          shaderMaterial.uniforms.uPlaneSizes!.value = [
            meshRef.current.scale.x,
            meshRef.current.scale.y,
          ];

          // Calculate strength based on scroll velocity
          const scrollStrength =
            ((scrollY.current - scrollY.last) / size.width) * 10;

          // Smooth transition for strength
          setStrength((prev) => MathUtils.lerp(prev, scrollStrength, 0.1));

          shaderMaterial.uniforms.uStrength!.value = strength;
        } catch (error) {
          console.error("Shader error:", error);
          setShaderError(true);
        }
      }

      // Check if element is out of view and adjust extra offset
      // This creates an infinite scroll effect similar to the original implementation
      const planeOffset = meshRef.current.scale.y / 2;
      const viewportOffset = viewport.height / 2;

      const isBefore =
        meshRef.current.position.y + planeOffset < -viewportOffset;
      const isAfter = meshRef.current.position.y - planeOffset > viewportOffset;

      if (scrollY.direction === "down" && isBefore) {
        // Scrolling down and element is above viewport
        setExtra((prev) => prev - size.height);
      }

      if (scrollY.direction === "up" && isAfter) {
        // Scrolling up and element is below viewport
        setExtra((prev) => prev + size.height);
      }
    }
  });

  // Only render if we have a texture and the element is visible (or in debug mode)
  if (!texture || (!isVisible && !debug)) return null;

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1, 32, 32]} />

      {debug ? (
        // In debug mode, use a simple wireframe material
        <meshBasicMaterial
          color="red"
          wireframe={true}
          transparent={true}
          opacity={0.5}
        />
      ) : useFallback || shaderError ? (
        // Fallback material if shader fails
        <meshBasicMaterial map={texture} transparent={true} />
      ) : (
        // Normal shader material
        <shaderMaterial
          vertexShader={vertex}
          fragmentShader={fragment}
          transparent={true}
          uniforms={{
            tMap: { value: texture },
            uPlaneSizes: { value: [0, 0] },
            uImageSizes: { value: imageSizes },
            uViewportSizes: { value: [viewport.width, viewport.height] },
            uStrength: { value: strength },
          }}
          // onError={(e) => {
          //   console.error("Shader compilation error:", e);
          //   setShaderError(true);
          // }}
        />
      )}
    </mesh>
  );
};

export default function GridPhoto() {
  const photos = projects.flatMap((project) => project.photos).slice(0, 12);
  const galleryRef = useRef<HTMLDivElement>(null);
  const scrollY = useScrollPosition();
  const [useFallback, setUseFallback] = useState(USE_FALLBACK);

  // Error handling for shader compilation
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes("Shader") || event.message.includes("WebGL")) {
        console.error(
          "WebGL/Shader error detected, switching to fallback mode"
        );
        setUseFallback(true);
      }
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  return (
    <div className="h-screen w-screen fixed left-0 top-0 overflow-hidden z-1">
      <div ref={galleryRef} className={`relative ${styles.galleryContainer}`}>
        {photos.map((photo, index) => (
          <figure
            key={index}
            className={`${styles["demo-1__gallery__figure"]}`}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              width={200}
              height={200}
              className={`${styles["demo-1__gallery__image"]}`}
            />
          </figure>
        ))}
      </div>
      <Canvas
        className="w-full h-full"
        camera={{ position: [0, 0, 5], fov: 45 }}
        onCreated={({ gl }) => {
          // Check for WebGL capabilities
          if (!gl.capabilities.isWebGL2) {
            console.warn("WebGL 2 not supported, using fallback mode");
            setUseFallback(true);
          }
        }}
      >
        {photos.map((photo, index) => (
          <ShaderImage
            key={index}
            photo={photo}
            index={index}
            galleryRef={galleryRef}
            scrollY={scrollY}
            debug={DEBUG}
            useFallback={useFallback}
          />
        ))}
      </Canvas>
    </div>
  );
}
