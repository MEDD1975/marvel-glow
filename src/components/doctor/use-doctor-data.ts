import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { DoctorResourceRecord } from "@/lib/doctor-resource-db";

export type Practitioner = {
  id: string;
  name: string;
  profession: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  hidden?: boolean;
};

export type DoctorNetwork = {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  status: string;
  practitioners: Practitioner[];
};

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Chargement impossible (${response.status})`);
  return response.json() as Promise<T>;
}

export const doctorKeys = {
  resources: ["doctor", "resources"] as const,
  pathways: ["doctor", "pathways"] as const,
  network: ["doctor", "network"] as const,
};

export function useDoctorResources() {
  return useQuery({ queryKey: doctorKeys.resources, queryFn: () => getJson<DoctorResourceRecord[]>("/api/doctor-resources?scope=manage") });
}

export function usePathwaySettings() {
  return useQuery({ queryKey: doctorKeys.pathways, queryFn: () => getJson<Array<{ conditionId: string; hidden: boolean }>>("/api/doctor-pathways") });
}

export function useDoctorNetwork() {
  return useQuery({ queryKey: doctorKeys.network, queryFn: () => getJson<DoctorNetwork | null>("/api/doctor-network") });
}

/** Identifiant signé du cabinet, à utiliser dans tous les QR et liens patient. */
export function useCabinetRef() {
  return useQuery({
    queryKey: ["doctor", "cabinet-ref"],
    staleTime: Infinity,
    queryFn: () => getJson<{ ref: string; admin: boolean }>("/api/doctor-cabinet-ref"),
  });
}

export function useDoctorCache() {
  return useQueryClient();
}

export function splitAddress(value: string) {
  const match = value.trim().match(/^(.*?)(?:,\s*)?(\d{5})\s+(.+)$/);
  return match ? { street: match[1]?.trim() ?? "", postalCode: match[2] ?? "", city: match[3]?.trim() ?? "" } : { street: value.trim(), postalCode: "", city: "" };
}

export async function sendJson<T>(url: string, method: string, body: unknown): Promise<T> {
  const response = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? "L’enregistrement a échoué. Réessayez.");
  return data;
}
