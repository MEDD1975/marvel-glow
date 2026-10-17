import { Pool } from "pg";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const pool = new Pool({ connectionString: process.env["DATABASE_URL"] });

export const ADMIN_ROLE = "admin_kivoir";
export const DOCTOR_ROLE = "doctor";
const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type InvitationInput = {
  email: string;
  firstName: string;
  lastName: string;
  cabinetName: string | null;
  phone: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
};

export type InvitationRecord = InvitationInput & {
  id: string;
  status: "pending" | "used" | "cancelled";
  createdAt: string;
  sentAt: string | null;
  expiresAt: string;
  usedAt: string | null;
  cancelledAt: string | null;
  userId: string | null;
};

export type DoctorSummary = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  disabledAt: string | null;
  cabinetName: string | null;
};

const invitationColumns =
  '"id", "email", "firstName", "lastName", "cabinetName", "phone", "address", "postalCode", "city", "status", "createdAt", "sentAt", "expiresAt", "usedAt", "cancelledAt", "userId"';

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function newToken() {
  return randomBytes(32).toString("base64url");
}

function refSecret() {
  const secret = process.env["BETTER_AUTH_SECRET"];
  if (!secret) throw new Error("BETTER_AUTH_SECRET is not configured");
  return secret;
}

function refSignature(userId: string) {
  return createHmac("sha256", refSecret()).update(`kivoir-cabinet-ref:${userId}`).digest("base64url").slice(0, 24);
}

/** Identifiant public du cabinet imprimé dans les QR : non devinable sans la clé serveur. */
export function signCabinetRef(userId: string) {
  return `${userId}.${refSignature(userId)}`;
}

export function verifyCabinetRef(ref: string | null | undefined): string | null {
  if (!ref || ref.length > 200) return null;
  const separator = ref.lastIndexOf(".");
  if (separator <= 0) return null;
  const userId = ref.slice(0, separator);
  const provided = Buffer.from(ref.slice(separator + 1));
  const expected = Buffer.from(refSignature(userId));
  return provided.length === expected.length && timingSafeEqual(provided, expected) ? userId : null;
}

/** Retourne l'identifiant du médecin si le QR est authentique et que son compte est actif. */
export async function resolveActiveCabinetOwner(ref: string | null | undefined): Promise<string | null> {
  const userId = verifyCabinetRef(ref);
  if (!userId) return null;
  const result = await pool.query('SELECT 1 FROM "user" WHERE "id" = $1 AND "disabledAt" IS NULL', [userId]);
  return result.rowCount ? userId : null;
}

export async function getAccountStatus(userId: string): Promise<{ role: string; disabled: boolean } | null> {
  const result = await pool.query<{ role: string; disabledAt: string | null }>('SELECT "role", "disabledAt" FROM "user" WHERE "id" = $1', [userId]);
  const row = result.rows[0];
  return row ? { role: row.role, disabled: row.disabledAt !== null } : null;
}

export async function isActiveAdmin(userId: string) {
  const status = await getAccountStatus(userId);
  return Boolean(status && status.role === ADMIN_ROLE && !status.disabled);
}

export async function isEmailDisabled(email: string) {
  const result = await pool.query('SELECT 1 FROM "user" WHERE lower("email") = lower($1) AND "disabledAt" IS NOT NULL', [email]);
  return Boolean(result.rowCount);
}

export async function emailHasAccount(email: string) {
  const result = await pool.query('SELECT 1 FROM "user" WHERE lower("email") = lower($1)', [email]);
  return Boolean(result.rowCount);
}

export async function listDoctors(): Promise<DoctorSummary[]> {
  const result = await pool.query<DoctorSummary>(
    `SELECT u."id", u."name", u."email", u."createdAt", u."disabledAt",
       (SELECT n."name" FROM "doctor_network" n WHERE n."ownerId" = u."id" ORDER BY n."createdAt" DESC LIMIT 1) AS "cabinetName"
     FROM "user" u WHERE u."role" = $1 ORDER BY u."createdAt" DESC`,
    [DOCTOR_ROLE],
  );
  return result.rows;
}

export async function listInvitations(): Promise<InvitationRecord[]> {
  const result = await pool.query<InvitationRecord>(`SELECT ${invitationColumns} FROM "doctor_invitation" ORDER BY "createdAt" DESC LIMIT 200`);
  return result.rows;
}

/** Crée une invitation (en annulant une éventuelle invitation en attente pour le même e-mail). */
export async function createInvitation(input: InvitationInput, createdBy: string) {
  const token = newToken();
  const id = `invitation_${crypto.randomUUID()}`;
  const expiresAt = new Date(Date.now() + INVITATION_TTL_MS);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `UPDATE "doctor_invitation" SET "status" = 'cancelled', "cancelledAt" = now() WHERE lower("email") = lower($1) AND "status" = 'pending'`,
      [input.email],
    );
    await client.query(
      `INSERT INTO "doctor_invitation" ("id", "email", "firstName", "lastName", "cabinetName", "phone", "address", "postalCode", "city", "tokenHash", "createdBy", "expiresAt")
       VALUES ($1, lower($2), $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [id, input.email, input.firstName, input.lastName, input.cabinetName, input.phone, input.address, input.postalCode, input.city, hashToken(token), createdBy, expiresAt],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
  return { id, token, expiresAt };
}

/** Génère un nouveau lien pour une invitation encore en attente (l'ancien lien devient invalide). */
export async function renewInvitationToken(id: string) {
  const token = newToken();
  const expiresAt = new Date(Date.now() + INVITATION_TTL_MS);
  const result = await pool.query<InvitationRecord>(
    `UPDATE "doctor_invitation" SET "tokenHash" = $1, "expiresAt" = $2 WHERE "id" = $3 AND "status" = 'pending' RETURNING ${invitationColumns}`,
    [hashToken(token), expiresAt, id],
  );
  const invitation = result.rows[0];
  return invitation ? { invitation, token, expiresAt } : null;
}

export async function markInvitationSent(id: string, resendEmailId: string) {
  await pool.query('UPDATE "doctor_invitation" SET "sentAt" = now(), "resendEmailId" = $1 WHERE "id" = $2', [resendEmailId, id]);
}

export async function cancelInvitation(id: string) {
  const result = await pool.query(`UPDATE "doctor_invitation" SET "status" = 'cancelled', "cancelledAt" = now() WHERE "id" = $1 AND "status" = 'pending'`, [id]);
  return Boolean(result.rowCount);
}

export async function findValidInvitation(token: string): Promise<InvitationRecord | null> {
  const result = await pool.query<InvitationRecord>(
    `SELECT ${invitationColumns} FROM "doctor_invitation" WHERE "tokenHash" = $1 AND "status" = 'pending' AND "expiresAt" > now()`,
    [hashToken(token)],
  );
  return result.rows[0] ?? null;
}

/** Réserve l'invitation de façon atomique : un même lien ne peut être utilisé qu'une fois. */
export async function claimInvitation(token: string): Promise<InvitationRecord | null> {
  const result = await pool.query<InvitationRecord>(
    `UPDATE "doctor_invitation" SET "status" = 'used', "usedAt" = now()
     WHERE "tokenHash" = $1 AND "status" = 'pending' AND "expiresAt" > now() RETURNING ${invitationColumns}`,
    [hashToken(token)],
  );
  return result.rows[0] ?? null;
}

export async function releaseInvitation(id: string) {
  await pool.query(`UPDATE "doctor_invitation" SET "status" = 'pending', "usedAt" = NULL WHERE "id" = $1 AND "status" = 'used' AND "userId" IS NULL`, [id]);
}

export async function attachInvitationUser(id: string, userId: string) {
  await pool.query('UPDATE "doctor_invitation" SET "userId" = $1 WHERE "id" = $2', [userId, id]);
}

/** Désactive ou réactive un médecin. La désactivation ferme immédiatement toutes ses sessions. */
export async function setDoctorDisabled(userId: string, disabled: boolean) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `UPDATE "user" SET "disabledAt" = ${disabled ? "now()" : "NULL"}, "updatedAt" = now() WHERE "id" = $1 AND "role" = $2`,
      [userId, DOCTOR_ROLE],
    );
    if (disabled && result.rowCount) await client.query('DELETE FROM "session" WHERE "userId" = $1', [userId]);
    await client.query("COMMIT");
    return Boolean(result.rowCount);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
