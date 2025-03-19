import { StaticImageData } from "next/image";

interface Photo {
  id: number;
  src: StaticImageData;
  alt: string;
  projectId: number;
}

interface Project {
  id: number;
  title: string;
  description: string;
  size: string;
  scale: string;
  buildTime: string;
  materials: string[];
  category: string;
  techniques: string[];
  photos: Photo[];
  featured: boolean;
  completionDate: string;
}

export type { Photo, Project };
