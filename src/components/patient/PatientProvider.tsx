import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  contextFromSearch,
  emptyPatientContext,
  type PatientContextValue,
} from "@/lib/patient-context";
import { getPathwayGuide, type PathwayGuide } from "@/lib/patient-guides";
import type { DoctorResourceRecord } from "@/lib/doctor-resource-db";
import type { FollowUpStepRecord } from "@/lib/follow-up-db";
import { cabinets, type Profession } from "@/lib/directory";
import { formatAddress, formatCity, formatProfession, formatProviderName, formatStreet, isPlaceholderPhone } from "@/lib/typography";
import { professionalDisplayName } from "@/lib/professions";

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
  ownerProfession?: string | null;
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
  /** Identifiant public du cabinet transmis par le QR. */
  ownerId: string | undefined;
  doctorLabel: string | undefined;
  cabinetName: string | undefined;
  cabinetPhone: string | undefined;
};

const PatientStateContext = createContext<PatientState | null>(null);

// In-memory only (reset on every full page load): keeps the QR context while the
// patient navigates between pages whose links do not carry the URL parameters.
let rememberedContext: PatientContextValue = emptyPatientContext;

function resolveContext(search: Record<string, unknown>): PatientContextValue {
  const fromSearch = contextFromSearch(search);
  if (fromSearch.pathwayId || fromSearch.doctorId) {
    rememberedContext = { ...emptyPatientContext, ...fromSearch };
  }
  return rememberedContext;
}

/** Paramètres d'URL à transmettre aux liens internes pour conserver le parcours. */
export function contextLinkSearch(context: PatientContextValue): Record<string, string> {
  return {
    ...(context.pathwayId ? { pathway: context.pathwayId } : {}),
    ...(context.doctorId ? { ref: context.doctorId } : {}),
  };
}

export function PatientProvider({
  search,
  children,
}: {
  search: Record<string, unknown>;
  requireFreshContext?: boolean | undefined;
  children: ReactNode;
}) {
  const context = useMemo<PatientContextValue>(() => resolveContext(search), [search]);
  const ready = true;
  const ownerId = context.doctorId;
  const network = usePublicNetwork(ownerId);
  const guide = useMemo(() => getPathwayGuide(context.pathwayId), [context.pathwayId]);
  const cabinetName = network.data?.name;
  const doctorLabel = professionalDisplayName(network.data?.ownerName, network.data?.ownerProfession);
  const senderLabel = cabinetName ? `Parcours transmis par ${cabinetName}` : "Parcours transmis par votre cabinet";
  const hasContext = Boolean(context.pathwayId || ownerId);

  const value = useMemo<PatientState>(
    () => ({
      ready,
      context,
      guide,
      hasContext,
      senderLabel,
      ownerId,
      doctorLabel,
      cabinetName,
      cabinetPhone: isPlaceholderPhone(network.data?.phone) ? undefined : network.data?.phone ?? undefined,
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
    name: formatProviderName(item.name),
    specialty: formatProfession(item.profession),
    category: formatProfession(categoryOf(item.profession.trim())),
    address: formatAddress([formatStreet(item.address, item.city), [item.postalCode, formatCity(item.city)].filter(Boolean).join(" ")]),
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
