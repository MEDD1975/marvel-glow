import type { Zone } from "@/lib/conditions";

/** Une famille graphique par zone anatomique : les atteintes d'une même zone partagent l'illustration. */
export const zoneVisuals: Record<Zone, { src: string; alt: string }> = {
  Hanche: { src: "/images/zones/hanche.webp", alt: "Schéma anatomique de la hanche" },
  Genou: { src: "/images/zones/genou.webp", alt: "Schéma anatomique du genou" },
  Cheville: { src: "/images/zones/cheville.webp", alt: "Schéma anatomique de la cheville" },
  Pied: { src: "/images/zones/pied.webp", alt: "Schéma anatomique du pied" },
};

export const zoneOrder: Zone[] = ["Hanche", "Genou", "Cheville", "Pied"];
