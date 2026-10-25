import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env["DATABASE_URL"] });

export type DoctorResourceRecord = {
  id: string;
  ownerId: string;
  title: string;
  conditionId: string;
  url: string;
  filename: string | null;
  contentType: string | null;
  source: string | null;
  status: string;
  createdAt: string;
  description?: string | null;
  validatedAt?: string | null;
  kind?: string | null;
};

const columns = '"id", "ownerId", "title", "conditionId", "url", "filename", "contentType", "source", "status", "createdAt", "description", "kind", to_char("validatedAt", \'YYYY-MM-DD\') AS "validatedAt"';

const resourceKinds = new Set(["document", "sheet", "video", "exercise", "link", "orientation"]);
function normalizeKind(kind: string | null | undefined) {
  return kind && resourceKinds.has(kind) ? kind : null;
}

export async function listDoctorResources(ownerId?: string, conditionId?: string, includeHidden = false) {
  const values: string[] = [];
  const filters = [includeHidden ? '"status" IN (\'active\', \'hidden\')' : '"status" = \'active\''];
  if (ownerId) {
    values.push(ownerId);
    filters.push(`"ownerId" = $${values.length}`);
  }
  if (conditionId) {
    values.push(conditionId);
    filters.push(`"conditionId" = $${values.length}`);
  }
  const result = await pool.query<DoctorResourceRecord>(
    `SELECT ${columns} FROM "doctor_resource" WHERE ${filters.join(" AND ")} ORDER BY "createdAt" DESC`,
    values,
  );
  return result.rows;
}

export async function createDoctorResource(
  ownerId: string,
  input: Omit<DoctorResourceRecord, "id" | "ownerId" | "status" | "createdAt"> & { status?: string | undefined },
) {
  const result = await pool.query<DoctorResourceRecord>(
    `INSERT INTO "doctor_resource" ("id", "ownerId", "title", "conditionId", "url", "filename", "contentType", "source", "status", "description", "validatedAt", "kind") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING ${columns}`,
    [
      `resource_${crypto.randomUUID()}`,
      ownerId,
      input.title,
      input.conditionId,
      input.url,
      input.filename ?? null,
      input.contentType ?? null,
      input.source ?? null,
      input.status === "hidden" ? "hidden" : "active",
      input.description ?? null,
      input.validatedAt || null,
      normalizeKind(input.kind),
    ],
  );
  return result.rows[0];
}

export async function updateDoctorResource(
  ownerId: string,
  id: string,
  input: { title: string; conditionId: string; source: string | null; description: string | null; validatedAt: string | null; status: "active" | "hidden"; kind?: string | null },
) {
  const result = await pool.query<DoctorResourceRecord>(
    `UPDATE "doctor_resource" SET "title" = $1, "conditionId" = $2, "source" = $3, "description" = $4, "validatedAt" = $5, "status" = $6, "kind" = COALESCE($9, "kind"), "updatedAt" = now() WHERE "id" = $7 AND "ownerId" = $8 AND "status" IN ('active', 'hidden') RETURNING ${columns}`,
    [input.title, input.conditionId, input.source, input.description, input.validatedAt || null, input.status, id, ownerId, normalizeKind(input.kind)],
  );
  return result.rows[0] ?? null;
}

export async function deleteDoctorResource(ownerId: string, id: string) {
  await pool.query('DELETE FROM "doctor_resource" WHERE "id" = $1 AND "ownerId" = $2', [id, ownerId]);
}

export async function listAllActiveDoctorResources(conditionId?: string, ownerId?: string) {
  return listDoctorResources(ownerId, conditionId);
}

export async function getDoctorResource(id: string) {
  const result = await pool.query<DoctorResourceRecord>(`SELECT ${columns} FROM "doctor_resource" WHERE "id" = $1 AND "status" = 'active'`, [id]);
  return result.rows[0] ?? null;
}

export async function listPathwaySettings(ownerId: string) {
  const result = await pool.query<{ conditionId: string; hidden: boolean }>(
    'SELECT "conditionId", "hidden" FROM "doctor_pathway_setting" WHERE "ownerId" = $1',
    [ownerId],
  );
  return result.rows;
}

export async function setPathwayHidden(ownerId: string, conditionId: string, hidden: boolean) {
  await pool.query(
    'INSERT INTO "doctor_pathway_setting" ("ownerId", "conditionId", "hidden", "updatedAt") VALUES ($1, $2, $3, now()) ON CONFLICT ("ownerId", "conditionId") DO UPDATE SET "hidden" = EXCLUDED."hidden", "updatedAt" = now()',
    [ownerId, conditionId, hidden],
  );
  return listPathwaySettings(ownerId);
}

export { pool as doctorResourcePool };
