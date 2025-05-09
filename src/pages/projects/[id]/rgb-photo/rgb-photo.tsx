import { Canvas, useFrame } from "@react-three/fiber";
import Image from "next/image";
import {
  useMemo,
  useRef,
  useCallback,
  useEffect,
  RefObject,
  useState,
} from "react";

import { Project } from "@/types/photo";
import {
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  Texture,
  TextureLoader,
  Vector2,
} from "three";

const vertexShader = `
    varying vec2 vUv;

    void main() {
        vUv = uv;

        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectedPosition = projectionMatrix * viewPosition;

        gl_Position = projectedPosition;
    }
  `;

const fragmentShader = `
    varying vec2 vUv;
    uniform sampler2D u_texture;
    uniform vec2 u_mouse;
    uniform vec2 u_prevMouse;
    uniform float u_aberrationIntensity;

    void main() {
        vec2 gridUV = floor(vUv * vec2(20.0, 20.0)) / vec2(20.0, 20.0);
        vec2 centerOfPixel = gridUV + vec2(1.0 / 20.0, 1.0 / 20.0);

        vec2 mouseDirection = u_mouse - u_prevMouse;

        vec2 pixelToMouseDirection = centerOfPixel - u_mouse;
        float pixelDistanceToMouse = length(pixelToMouseDirection);
        float strength = smoothstep(0.3, 0.0, pixelDistanceToMouse);

        vec2 uvOffset = strength * -mouseDirection * 0.2;
        vec2 uv = vUv - uvOffset;

        vec4 colorR = texture2D(u_texture, uv + vec2(strength * u_aberrationIntensity * 0.01, 0.0));
        vec4 colorG = texture2D(u_texture, uv);
        vec4 colorB = texture2D(u_texture, uv - vec2(strength * u_aberrationIntensity * 0.01, 0.0));

        gl_FragColor = vec4(colorR.r, colorG.g, colorB.b, 1.0);
}
`;

const MovingPlane = ({
  imageUrl,
  mousePosition,
  prevPosition,
  targetMousePosition,
  easeFactor,
  aberrationIntensity,
}: {
  imageUrl: string;
  mousePosition: RefObject<{ x: number; y: number }>;
  prevPosition: RefObject<{ x: number; y: number }>;
  targetMousePosition: RefObject<{ x: number; y: number }>;
  easeFactor: RefObject<number>;
  aberrationIntensity: RefObject<number>;
}) => {
  const mesh = useRef<Mesh<PlaneGeometry, ShaderMaterial>>(null);
  const [texture, setTexture] = useState<Texture | null>(null);
  const [scale, setScale] = useState<[number, number, number]>([1, 1, 1]);

  useEffect(() => {
    const loader = new TextureLoader();
    loader.load(imageUrl, (loadedTexture) => {
      loadedTexture.needsUpdate = true;
      setTexture(loadedTexture);

      // Calculate aspect ratio based on image dimensions
      const imageAspectRatio =
        loadedTexture.image.width / loadedTexture.image.height;

      // Use a fixed base scale regardless of screen size
      const baseScale = window.innerWidth > 768 ? 1.2 : 1.5;

      // Set scale maintaining aspect ratio
      setScale([baseScale * imageAspectRatio, baseScale, 1]);
    });
  }, [imageUrl]);

  const uniforms = useMemo(
    () => ({
      u_mouse: { value: new Vector2(0, 0) },
      u_prevMouse: { value: new Vector2(0, 0) },
      u_texture: { value: texture },
      u_aberrationIntensity: { value: 0.0 },
    }),
    [texture]
  );

  useEffect(() => {
    if (texture && mesh.current) {
      mesh.current.material.uniforms.u_texture!.value = texture;
    }
  }, [texture]);

  useFrame(() => {
    if (!mesh.current) return;

    mousePosition.current.x +=
      (targetMousePosition.current.x - mousePosition.current.x) *
      easeFactor.current;
    mousePosition.current.y +=
      (targetMousePosition.current.y - mousePosition.current.y) *
      easeFactor.current;

    const currentMaterialUniform = mesh.current.material.uniforms;

    currentMaterialUniform.u_mouse!.value.set(
      mousePosition.current.x,
      1.0 - mousePosition.current.y
    );

    currentMaterialUniform.u_prevMouse!.value.set(
      prevPosition.current.x,
      1.0 - prevPosition.current.y
    );

    aberrationIntensity.current = Math.max(
      0.0,
      aberrationIntensity.current - 0.05
    );

    currentMaterialUniform.u_aberrationIntensity!.value =
      aberrationIntensity.current;
  });

  if (!texture) return null;

  return (
    <mesh ref={mesh} position={[0, 0, 0]} scale={scale}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
        transparent={true}
      />
    </mesh>
  );
};

const Scene = ({
  currentPhotoIndex,
  project,
}: {
  currentPhotoIndex: number;
  project: Project | undefined;
}) => {
  // Define all hooks at the top level
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const prevPosition = useRef({ x: 0, y: 0 });
  const targetMousePosition = useRef({ x: 0, y: 0 });
  const aberrationIntensity = useRef(0.2);
  const easeFactor = useRef(0.02);

  const updateMousePosition = useCallback(
    (e: MouseEvent) => {
      console.log("updateMousePosition");
      easeFactor.current = 1;
      const rect = canvasRef.current?.getBoundingClientRect();

      prevPosition.current = {
        x: targetMousePosition.current.x,
        y: targetMousePosition.current.y,
      };

      targetMousePosition.current.x =
        (e.clientX - (rect?.left ?? 0)) / (rect?.width ?? 1);
      targetMousePosition.current.y =
        (e.clientY - (rect?.top ?? 0)) / (rect?.height ?? 1);

      aberrationIntensity.current = 1;
    },
    [canvasRef]
  );

  const handleMouseEnter = useCallback(
    (e: MouseEvent) => {
      console.log("handleMouseEnter");
      easeFactor.current = 0.9;
      const rect = canvasRef.current?.getBoundingClientRect();

      mousePosition.current.x = targetMousePosition.current.x =
        (e.clientX - (rect?.left ?? 0)) / (rect?.width ?? 1);
      mousePosition.current.y = targetMousePosition.current.y =
        (e.clientY - (rect?.top ?? 0)) / (rect?.height ?? 1);
    },
    [canvasRef]
  );

  const handleMouseLeave = useCallback(() => {
    easeFactor.current = 0.2;
    targetMousePosition.current = {
      x: prevPosition.current.x,
      y: prevPosition.current.y,
    };
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", updateMousePosition, false);
    window.addEventListener("mouseenter", handleMouseEnter, false);
    window.addEventListener("mouseleave", handleMouseLeave, false);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition, false);
      window.removeEventListener("mouseenter", handleMouseEnter, false);
      window.removeEventListener("mouseleave", handleMouseLeave, false);
    };
  }, [handleMouseEnter, handleMouseLeave, updateMousePosition]);

  // Return early if project is undefined
  if (!project || !project.photos || project.photos.length === 0) {
    return <div>Loading project data...</div>;
  }

  // Ensure currentPhotoIndex is within bounds
  const safePhotoIndex = Math.min(
    Math.max(0, currentPhotoIndex),
    project.photos.length - 1
  );

  const currentPhoto = project.photos[safePhotoIndex];

  if (!currentPhoto) {
    return <div>Loading photo...</div>;
  }

  return (
    <div
      className="fixed left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 z-0"
      style={{
        width: "80vmin",
        height: "80vmin",
        aspectRatio: currentPhoto.src.width / currentPhoto.src.height,
      }}
    >
      <Canvas
        ref={canvasRef}
        camera={{
          position: [0, 0, 1],
          fov: 75,
          // aspect: project.photos[safePhotoIndex].src.width / project.photos[safePhotoIndex].src.height,
        }}
      >
        {project.photos.map((photo, index) => (
          <group key={photo.id} visible={index === safePhotoIndex}>
            <MovingPlane
              imageUrl={photo.src.src}
              mousePosition={mousePosition}
              prevPosition={prevPosition}
              targetMousePosition={targetMousePosition}
              easeFactor={easeFactor}
              aberrationIntensity={aberrationIntensity}
            />
          </group>
        ))}
      </Canvas>
      <div
        id="imageContainer"
        className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
      >
        <Image
          src={currentPhoto.src}
          alt="Preview Picture"
          fill
          style={{ objectFit: "contain" }}
          priority
        />
      </div>
    </div>
  );
};

export default Scene;
