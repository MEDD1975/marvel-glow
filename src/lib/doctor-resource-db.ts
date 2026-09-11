import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

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
};

export async function listDoctorResources(ownerId?: string, conditionId?: string) {
  const values: string[] = [];
  const filters = ['"status" = \'active\''];
  if (ownerId) {
    values.push(ownerId);
    filters.push(`"ownerId" = $${values.length}`);
  }
  if (conditionId) {
    values.push(conditionId);
    filters.push(`"conditionId" = $${values.length}`);
  }
  const result = await pool.query<DoctorResourceRecord>(
    `SELECT "id", "ownerId", "title", "conditionId", "url", "filename", "contentType", "source", "status", "createdAt" FROM "doctor_resource" WHERE ${filters.join(" AND ")} ORDER BY "createdAt" DESC`,
    values,
  );
  return result.rows;
}

export async function createDoctorResource(ownerId: string, input: Omit<DoctorResourceRecord, "id" | "ownerId" | "status" | "createdAt">) {
  const result = await pool.query<DoctorResourceRecord>(
    'INSERT INTO "doctor_resource" ("id", "ownerId", "title", "conditionId", "url", "filename", "contentType", "source", "status") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING "id", "ownerId", "title", "conditionId", "url", "filename", "contentType", "source", "status", "createdAt"',
    [`resource_${crypto.randomUUID()}`, ownerId, input.title, input.conditionId, input.url, input.filename ?? null, input.contentType ?? null, input.source ?? null, "active"],
  );
  return result.rows[0];
}

export async function deleteDoctorResource(ownerId: string, id: string) {
  await pool.query('DELETE FROM "doctor_resource" WHERE "id" = $1 AND "ownerId" = $2', [id, ownerId]);
}

export async function listAllActiveDoctorResources(conditionId?: string) {
  return listDoctorResources(undefined, conditionId);
}

export async function getDoctorResource(id: string) {
  const result = await pool.query<DoctorResourceRecord>('SELECT "id", "ownerId", "title", "conditionId", "url", "filename", "contentType", "source", "status", "createdAt" FROM "doctor_resource" WHERE "id" = $1 AND "status" = \'active\'', [id]);
  return result.rows[0] ?? null;
}

export { pool as doctorResourcePool };
