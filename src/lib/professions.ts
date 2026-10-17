/**
 * Professions des comptes professionnels Kivoir.
 * La profession décrit l'utilisateur ; elle ne donne aucun droit (les droits viennent du rôle technique).
 * Pour ajouter une profession, ajouter une entrée ici : aucune migration n'est nécessaire.
 */
export const PROFESSIONS = [
  { id: "medecin_generaliste", label: "Médecin généraliste", physician: true },
  { id: "medecin_sport", label: "Médecin du sport", physician: true },
  { id: "medecin_autre", label: "Autre médecin", physician: true },
  { id: "kinesitherapeute", label: "Kinésithérapeute", physician: false },
  { id: "autre_professionnel_sante", label: "Autre professionnel de santé", physician: false },
] as const;

export type ProfessionId = (typeof PROFESSIONS)[number]["id"];

export function isProfessionId(value: unknown): value is ProfessionId {
  return typeof value === "string" && PROFESSIONS.some((profession) => profession.id === value);
}

/** Libellé affichable. Les comptes créés avant l'ajout de la profession étaient tous des médecins. */
export function professionLabel(profession: string | null | undefined) {
  return PROFESSIONS.find((item) => item.id === profession)?.label ?? (profession ? "Professionnel de santé" : "Médecin");
}

/** Le titre « Dr » n'est utilisé que pour un médecin (y compris les comptes antérieurs, sans profession renseignée). */
export function usesDoctorTitle(profession: string | null | undefined) {
  if (!profession) return true;
  return PROFESSIONS.find((item) => item.id === profession)?.physician ?? false;
}

function stripTitle(name: string) {
  return name.trim().replace(/^(dr\.?|docteur)\s+/i, "");
}

/** Nom affiché : « Dr Nom » pour un médecin, nom seul pour les autres professions. */
export function professionalDisplayName(name: string | null | undefined, profession: string | null | undefined) {
  const trimmed = name?.trim();
  if (!trimmed) return undefined;
  return usesDoctorTitle(profession) ? `Dr ${stripTitle(trimmed)}` : stripTitle(trimmed);
}

/** « du Dr Martin » ou « de Paul Martin », pour les formulations « cabinet du/de … ». */
export function professionalOfPhrase(name: string | null | undefined, profession: string | null | undefined) {
  const display = professionalDisplayName(name, profession);
  if (!display) return undefined;
  return usesDoctorTitle(profession) ? `du ${display}` : `de ${display}`;
}

/** Nom de cabinet par défaut à l'activation, quand l'administration n'en a pas saisi. */
export function defaultCabinetName(firstName: string, lastName: string, profession: string | null | undefined) {
  return usesDoctorTitle(profession) ? `Cabinet du Dr ${lastName}` : `Cabinet de ${firstName} ${lastName}`;
}
