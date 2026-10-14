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
