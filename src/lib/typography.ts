/**
 * Présentation typographique uniquement : les données sources ne sont jamais modifiées.
 */

/** Uniformise un titre saisi tout en majuscules ou tout en minuscules (phrase avec majuscule initiale). */
export function formatTitle(raw: string): string {
  const value = raw.replace(/\s+/g, " ").trim();
  if (!value) return value;
  const letters = value.replace(/[^\p{L}]/gu, "");
  const isAllUpper = letters.length > 3 && letters === letters.toUpperCase();
  const isAllLower = letters === letters.toLowerCase();
  const base = isAllUpper ? value.toLocaleLowerCase("fr-FR") : value;
  if (!isAllUpper && !isAllLower) return base;
  return base.charAt(0).toLocaleUpperCase("fr-FR") + base.slice(1);
}

function normalizeKey(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
}

function capitalize(word: string): string {
  return word.charAt(0).toLocaleUpperCase("fr-FR") + word.slice(1);
}

/** Libellés d'affichage des ressources connues ; le titre source reste inchangé en base. */
const RESOURCE_TITLE_LABELS: Record<string, string> = {
  "que faire si entorse cheville": "Que faire après une entorse de cheville ?",
  "remise en forme apres entorse de cheville": "Reprise progressive après une entorse de cheville",
  "recos entorses cheville": "Recommandations après une entorse de cheville",
};

const ACCENTED_WORDS: Record<string, string> = {
  apres: "après",
  medecin: "médecin",
  reeducation: "rééducation",
  reprise: "reprise",
  genou: "genou",
};

export function resourceDisplayTitle(raw: string): string {
  const known = RESOURCE_TITLE_LABELS[normalizeKey(raw)];
  if (known) return known;
  const accented = formatTitle(raw).replace(/\p{L}+/gu, (word) => {
    const fixed = ACCENTED_WORDS[word.toLowerCase()];
    if (!fixed) return word;
    return word.charAt(0) === word.charAt(0).toUpperCase() ? capitalize(fixed) : fixed;
  });
  return accented;
}

const PLACE_PARTICLES = new Set(["de", "des", "du", "la", "le", "les", "sur", "sous", "en", "lès", "aux", "et"]);

/** Commune française : « Saint Maur des fossés » → « Saint-Maur-des-Fossés ». */
export function formatCity(raw: string | null | undefined): string {
  const value = raw?.replace(/\s+/g, " ").trim() ?? "";
  if (!value) return value;
  const words = value.split(/[\s-]+/).map((word, index) => {
    const lower = word.toLocaleLowerCase("fr-FR");
    if (index > 0 && PLACE_PARTICLES.has(lower)) return lower;
    const elision = lower.match(/^([dl])'(.+)$/);
    if (elision) return `${elision[1]}'${capitalize(elision[2]!)}`;
    return capitalize(lower);
  });
  if (words.length > 1 && /^(le|la|les)$/i.test(words[0]!)) return `${words[0]} ${words.slice(1).join("-")}`;
  return words.join("-");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Voie : majuscule au nom propre de la voie, « saint X » → « Saint-X », commune normalisée. */
export function formatStreet(raw: string | null | undefined, city?: string | null): string {
  let value = raw?.replace(/\s+/g, " ").trim() ?? "";
  if (!value) return value;
  const cleanCity = city?.replace(/\s+/g, " ").trim();
  if (cleanCity) value = value.replace(new RegExp(escapeRegExp(cleanCity), "gi"), formatCity(cleanCity));
  value = value.replace(
    /\b(rue|avenue|boulevard|place|allée|impasse|quai|chemin|square|cours|passage|route)\s+(de\s+la\s+|de\s+l'|du\s+|des\s+|de\s+|d')?(\p{L})/giu,
    (_match, type: string, particle: string | undefined, letter: string) => `${type} ${particle ?? ""}${letter.toLocaleUpperCase("fr-FR")}`,
  );
  value = value.replace(/\bsaint(e?)\s+(\p{L}+)/giu, (_match, e: string, word: string) => `Saint${e.toLowerCase()}-${capitalize(word)}`);
  value = value.replace(/(\p{Lu}\p{Ll}+)-(\p{Ll}+)/gu, (match, first: string, second: string) =>
    PLACE_PARTICLES.has(second) ? match : `${first}-${capitalize(second)}`,
  );
  return value;
}

/** Libellés d'affichage des noms d'établissements connus ; la donnée source reste inchangée. */
const PROVIDER_NAME_LABELS: Record<string, string> = {
  "centre de radiologie rue de bac": "Centre de radiologie de la rue du Bac",
};

export function formatProviderName(raw: string): string {
  const value = raw.replace(/\s+/g, " ").trim();
  const known = PROVIDER_NAME_LABELS[normalizeKey(value)];
  if (known) return known;
  const spaced = value.replace(/^(M|Mme|Dr|Pr)\.(?=\p{L})/u, "$1. ");
  return capitalize(spaced);
}

export function formatProfession(raw: string): string {
  return capitalize(resourceDisplayTitle(raw.replace(/\s+/g, " ").trim()));
}

/** Numéros manifestement fictifs (ex. 01 00 00 00 00) : ne jamais les présenter comme réels. */
export function isPlaceholderPhone(raw: string | null | undefined): boolean {
  if (!raw) return true;
  const digits = raw.replace(/\D/g, "");
  return /^0\d(\d)\1{7}$/.test(digits);
}

export function contactCabinetLabel(name: string | undefined): string {
  if (!name) return "Contacter mon cabinet";
  return `Contacter ${/^(cabinet|centre)\b/i.test(name) ? "le " : ""}${name}`;
}

/** Affiche un numéro français par groupes de deux chiffres. */
export function formatPhone(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("33") && digits.length === 11) digits = `0${digits.slice(2)}`;
  if (digits.length !== 10) return raw.trim() || undefined;
  return digits.replace(/(\d{2})(?=\d)/g, "$1 ");
}

export function phoneHref(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  const digits = raw.replace(/[^\d+]/g, "");
  return digits.length >= 4 ? `tel:${digits}` : undefined;
}

export function formatAddress(parts: Array<string | null | undefined>): string | undefined {
  const value = parts
    .map((part) => part?.replace(/\s+/g, " ").trim())
    .filter((part): part is string => Boolean(part))
    .join(", ")
    .replace(/,\s*,/g, ",");
  return value || undefined;
}

export function mapsHref(address: string | undefined): string | undefined {
  return address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : undefined;
}

export function formatDate(iso: string | null | undefined): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}
