import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  contextFromSearch,
  emptyPatientContext,
  formatDoctorName,
  readPatientContext,
  writePatientContext,
  type PatientContextValue,
} from "@/lib/patient-context";
import { claimPathway, readPathwayOwner } from "@/lib/patient-pathway";
import { getPathwayGuide, type PathwayGuide } from "@/lib/patient-guides";
import type { DoctorResourceRecord } from "@/lib/doctor-resource-db";
import type { FollowUpStepRecord } from "@/lib/follow-up-db";
import { cabinets, type Profession } from "@/lib/directory";
import { formatAddress } from "@/lib/typography";

export type PatientProfessional = {
  id: string;
  name: string;
  specialty: string;
  category: string;
  address: string | undefined;
  phone: string | undefined;
  email: string | undefined;
};

export type PublicNetwork = {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  ownerName?: string | null;
  practitioners: Array<{
    id: string;
    name: string;
    profession: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    postalCode: string | null;
    city: string | null;
  }>;
};

type PatientState = {
  ready: boolean;
  context: PatientContextValue;
  guide: PathwayGuide | null;
  /** Vrai lorsqu'un parcours ou un cabinet a été transmis (QR code ou lien). */
  hasContext: boolean;
  /** Libellé « Espace transmis par … ». */
  senderLabel: string;
  /** Nom du médecin (« Dr X ») lorsqu'il est réellement connu. */
  doctorLabel: string | undefined;
  /** Identifiant du médecin : QR code, ou à défaut médecin mémorisé pour ce parcours. */
  ownerId: string | undefined;
  cabinetName: string | undefined;
  cabinetPhone: string | undefined;
};

const PatientStateContext = createContext<PatientState | null>(null);

export function PatientProvider({ search, children }: { search: Record<string, unknown>; children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [context, setContext] = useState<PatientContextValue>(emptyPatientContext);
  const [storedOwner, setStoredOwner] = useState<string | undefined>(undefined);
  const searchKey = JSON.stringify(contextFromSearch(search));

  useEffect(() => {
    const fromUrl = JSON.parse(searchKey) as Partial<PatientContextValue>;
    const stored = readPatientContext();
    const switchedPathway = fromUrl.pathwayId && fromUrl.pathwayId !== stored.pathwayId;
    const next: PatientContextValue = switchedPathway
      ? { ...emptyPatientContext, ...fromUrl }
      : { ...stored, ...fromUrl };
    if (Object.keys(fromUrl).length) writePatientContext(next);
    if (next.pathwayId && fromUrl.doctorId) claimPathway(next.pathwayId, fromUrl.doctorId);
    setStoredOwner(readPathwayOwner(next.pathwayId));
    setContext(next);
    setReady(true);
  }, [searchKey]);

  const ownerId = context.doctorId ?? storedOwner;
  const network = usePublicNetwork(ownerId);
  const guide = useMemo(() => getPathwayGuide(context.pathwayId), [context.pathwayId]);
  const doctorLabel = formatDoctorName(context.doctorName ?? network.data?.ownerName ?? undefined);
  const cabinetName = network.data?.name;
  const senderLabel = doctorLabel
    ? `Espace transmis par le cabinet du ${doctorLabel}`
    : cabinetName
      ? `Espace transmis par ${cabinetName}`
      : "Espace transmis par votre cabinet";
  const hasContext = Boolean(context.pathwayId || ownerId);

  const value = useMemo<PatientState>(
    () => ({
      ready,
      context,
      guide,
      hasContext,
      senderLabel,
      doctorLabel,
      ownerId,
      cabinetName,
      cabinetPhone: network.data?.phone ?? undefined,
    }),
    [ready, context, guide, hasContext, senderLabel, doctorLabel, ownerId, cabinetName, network.data?.phone],
  );
  return <PatientStateContext.Provider value={value}>{children}</PatientStateContext.Provider>;
}

export function usePatient(): PatientState {
  const value = useContext(PatientStateContext);
  if (!value) throw new Error("usePatient doit être utilisé dans PatientProvider");
  return value;
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Erreur ${response.status}`);
  return (await response.json()) as T;
}

export function usePublicNetwork(doctorId: string | undefined) {
  return useQuery({
    queryKey: ["patient-network", doctorId],
    enabled: Boolean(doctorId),
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const networks = await getJson<PublicNetwork[]>(`/api/public-networks?owner=${encodeURIComponent(doctorId ?? "")}`);
      return networks[0] ?? null;
    },
  });
}

export function useDoctorResources() {
  const { context, ready, ownerId } = usePatient();
  return useQuery({
    queryKey: ["patient-resources", context.pathwayId, ownerId],
    enabled: ready && Boolean(context.pathwayId),
    staleTime: 60_000,
    queryFn: () =>
      getJson<DoctorResourceRecord[]>(
        `/api/doctor-resources?conditionId=${encodeURIComponent(context.pathwayId ?? "")}${
          ownerId ? `&ownerId=${encodeURIComponent(ownerId)}` : ""
        }`,
      ),
  });
}

/** Étapes de suivi configurées par le médecin dans son espace professionnel. */
export function useFollowUpSteps() {
  const { context, ready, ownerId } = usePatient();
  return useQuery({
    queryKey: ["patient-follow-up", context.pathwayId, ownerId],
    enabled: ready && Boolean(context.pathwayId && ownerId),
    staleTime: 60_000,
    queryFn: () =>
      getJson<FollowUpStepRecord[]>(
        `/api/follow-up-steps?conditionId=${encodeURIComponent(context.pathwayId ?? "")}&ownerId=${encodeURIComponent(ownerId ?? "")}`,
      ),
  });
}

const categoryBySpecialty: Record<string, string> = {
  Radiologue: "Imagerie médicale",
  "Imagerie médicale": "Imagerie médicale",
  "Chirurgien orthopédiste": "Chirurgie orthopédique",
  "Chirurgie orthopédique": "Chirurgie orthopédique",
  "Médecin généraliste": "Médecin",
  Médecin: "Médecin",
};

export function categoryOf(specialty: string): string {
  return categoryBySpecialty[specialty] ?? specialty;
}

/** Professionnels communiqués par le cabinet, ou à défaut l'annuaire local de démonstration. */
export function useProfessionals(): { isLoading: boolean; isError: boolean; retry: () => void; fromCabinet: boolean; professionals: PatientProfessional[] } {
  const { ready, ownerId } = usePatient();
  const network = usePublicNetwork(ownerId);
  const retry = () => void network.refetch();
  const cabinetPros: PatientProfessional[] = (network.data?.practitioners ?? []).map((item) => ({
    id: item.id,
    name: item.name.trim(),
    specialty: item.profession.trim(),
    category: categoryOf(item.profession.trim()),
    address: formatAddress([item.address, [item.postalCode, item.city].filter(Boolean).join(" ")]),
    phone: item.phone ?? undefined,
    email: item.email ?? undefined,
  }));
  if (cabinetPros.length) {
    return { isLoading: false, isError: false, retry, fromCabinet: true, professionals: cabinetPros };
  }
  const local: PatientProfessional[] = cabinets.flatMap((cabinet) =>
    cabinet.providers.map((provider) => ({
      id: provider.id,
      name: provider.name,
      specialty: provider.profession as Profession,
      category: categoryOf(provider.profession),
      address: formatAddress([provider.address, [provider.postalCode, provider.city].filter(Boolean).join(" ")]),
      phone: provider.phone,
      email: undefined,
    })),
  );
  return {
    isLoading: !ready || network.isLoading,
    isError: network.isError,
    retry,
    fromCabinet: false,
    professionals: local,
  };
}
