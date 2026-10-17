/**
 * Compatibilité transitoire des anciens QR (identifiant médecin non signé).
 * Fin de la période : 16 novembre 2026 à minuit, heure de Paris.
 * Seuls les comptes créés avant la migration du 17 octobre 2026 sont concernés :
 * un nouveau compte n'est jamais joignable par un QR non signé.
 */
export const LEGACY_QR_DEADLINE = new Date("2026-11-16T23:00:00Z");
export const LEGACY_QR_ACCOUNTS_CREATED_BEFORE = new Date("2026-10-17T12:00:00Z");

/** Les QR signés ont la forme `<id>.<signature>` ; les anciens QR ne contiennent que l'identifiant. */
export function isLegacyQrRef(ref: string | null | undefined): ref is string {
  return typeof ref === "string" && ref.trim().length > 0 && !ref.includes(".");
}

export function isLegacyQrPeriodOver(now = new Date()) {
  return now.getTime() >= LEGACY_QR_DEADLINE.getTime();
}

export function isExpiredLegacyQr(ref: string | null | undefined, now = new Date()) {
  return isLegacyQrRef(ref) && isLegacyQrPeriodOver(now);
}
