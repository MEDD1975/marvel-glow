import { readStoredPathway, writeStoredPathway } from "@/lib/patient-pathway";

const CONTEXT_KEY = "kivoir:patient-context";

export type PatientContextValue = {
  /** Identifiant du parcours (ex. « entorse-cheville »). */
  pathwayId: string | undefined;
  /** Identifiant technique du professionnel ayant généré le QR code (jamais affiché). */
  doctorId: string | undefined;
  /** Nom du professionnel tel que transmis par le QR code. */
  doctorName: string | undefined;
  /** Consigne courte ajoutée par le professionnel. */
  note: string | undefined;
};

export const emptyPatientContext: PatientContextValue = {
  pathwayId: undefined,
  doctorId: undefined,
  doctorName: undefined,
  note: undefined,
};

function clean(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 200) : undefined;
}

export function readPatientContext(): PatientContextValue {
  if (typeof window === "undefined") return emptyPatientContext;
  try {
    const raw = window.localStorage.getItem(CONTEXT_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    return {
      pathwayId: clean(parsed["pathwayId"]) ?? readStoredPathway(),
      doctorId: clean(parsed["doctorId"]),
      doctorName: clean(parsed["doctorName"]),
      note: clean(parsed["note"]),
    };
  } catch {
    return { ...emptyPatientContext, pathwayId: readStoredPathway() };
  }
}

export function writePatientContext(value: PatientContextValue): void {
  if (typeof window === "undefined") return;
  writeStoredPathway(value.pathwayId);
  try {
    window.localStorage.setItem(CONTEXT_KEY, JSON.stringify(value));
  } catch {
    // Stockage indisponible (navigation privée) : le contexte reste porté par l'URL.
  }
}

/** Fusionne un contexte reçu par URL (QR code) avec le contexte mémorisé. */
export function contextFromSearch(search: Record<string, unknown>): Partial<PatientContextValue> {
  const result: Partial<PatientContextValue> = {};
  const pathwayId = clean(search["pathway"]) ?? clean(search["c"]);
  const doctorId = clean(search["ref"]) ?? clean(search["medecin_id"]) ?? clean(search["doctor"]);
  const doctorName = clean(search["doctorName"]);
  const note = clean(search["note"]);
  if (pathwayId) result.pathwayId = pathwayId;
  if (doctorId) result.doctorId = doctorId;
  if (doctorName) result.doctorName = doctorName;
  if (note) result.note = note;
  return result;
}

export function formatDoctorName(name: string | undefined): string | undefined {
  if (!name) return undefined;
  return /^(dr\.?|docteur)\s/i.test(name) ? name.replace(/^(dr\.?|docteur)\s+/i, "Dr ") : `Dr ${name}`;
}
