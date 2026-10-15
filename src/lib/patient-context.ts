export type PatientContextValue = {
  /** Identifiant du parcours (ex. « entorse-cheville »). */
  pathwayId: string | undefined;
  /** Identifiant technique du professionnel ayant généré le QR code (jamais affiché). */
  doctorId: string | undefined;
};

export const emptyPatientContext: PatientContextValue = {
  pathwayId: undefined,
  doctorId: undefined,
};

function clean(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 200) : undefined;
}

/** Lit uniquement le contexte public transmis par l’URL du parcours. */
export function contextFromSearch(search: Record<string, unknown>): Partial<PatientContextValue> {
  const result: Partial<PatientContextValue> = {};
  const pathwayId = clean(search["pathway"]) ?? clean(search["c"]);
  const doctorId = clean(search["ref"]) ?? clean(search["medecin_id"]) ?? clean(search["doctor"]);
  if (pathwayId) result.pathwayId = pathwayId;
  if (doctorId) result.doctorId = doctorId;
  return result;
}

export function formatDoctorName(name: string | undefined): string | undefined {
  if (!name) return undefined;
  return /^(dr\.?|docteur)\s/i.test(name) ? name.replace(/^(dr\.?|docteur)\s+/i, "Dr ") : `Dr ${name}`;
}
