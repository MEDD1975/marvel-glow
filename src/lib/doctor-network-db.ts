import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export type DoctorNetworkRecord = {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  status: string;
  practitioners: Array<{
    id: string;
    name: string;
    profession: string;
    phone: string | null;
    email: string | null;
  }>;
};

export async function getDoctorNetwork(userId: string) {
  const networkResult = await pool.query<{
    id: string;
    name: string;
    address: string;
    phone: string | null;
    status: string;
  }>(
    'SELECT "id", "name", "address", "phone", "status" FROM "doctor_network" WHERE "ownerId" = $1 ORDER BY "createdAt" DESC LIMIT 1',
    [userId],
  );
  const network = networkResult.rows[0];
  if (!network) return null;

  const practitioners = await pool.query<DoctorNetworkRecord["practitioners"][number]>(
    'SELECT "id", "name", "profession", "phone", "email" FROM "doctor_practitioner" WHERE "networkId" = $1 ORDER BY "createdAt" ASC',
    [network.id],
  );
  return { ...network, practitioners: practitioners.rows } satisfies DoctorNetworkRecord;
}

export async function getPublicDoctorNetworks() {
  const networkResult = await pool.query<{
    id: string;
    name: string;
    address: string;
    phone: string | null;
    ownerName: string | null;
  }>('SELECT n."id", n."name", n."address", n."phone", u."name" AS "ownerName" FROM "doctor_network" n LEFT JOIN "user" u ON u."id" = n."ownerId" WHERE n."status" IN ($1, $2) ORDER BY n."createdAt" DESC', ["active", "pending"]);

  const networks = [];
  for (const network of networkResult.rows) {
    const practitioners = await pool.query<DoctorNetworkRecord["practitioners"][number]>(
      'SELECT "id", "name", "profession", "phone", "email" FROM "doctor_practitioner" WHERE "networkId" = $1 ORDER BY "createdAt" ASC',
      [network.id],
    );
    networks.push({ ...network, practitioners: practitioners.rows });
  }
  return networks;
}

export async function saveDoctorNetwork(
  userId: string,
  input: { name: string; address: string; phone?: string; practitioners: Array<{ name: string; profession: string; phone?: string; email?: string }> },
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const existing = await client.query<{ id: string }>(
      'SELECT "id" FROM "doctor_network" WHERE "ownerId" = $1 ORDER BY "createdAt" DESC LIMIT 1',
      [userId],
    );
    const networkId = existing.rows[0]?.id ?? `network_${crypto.randomUUID()}`;
    if (existing.rows[0]) {
      await client.query(
        'UPDATE "doctor_network" SET "name" = $1, "address" = $2, "phone" = $3, "status" = $4 WHERE "id" = $5 AND "ownerId" = $6',
        [input.name, input.address, input.phone || null, "active", networkId, userId],
      );
      await client.query('DELETE FROM "doctor_practitioner" WHERE "networkId" = $1', [networkId]);
    } else {
      await client.query(
        'INSERT INTO "doctor_network" ("id", "ownerId", "name", "address", "phone", "status") VALUES ($1, $2, $3, $4, $5, $6)',
        [networkId, userId, input.name, input.address, input.phone || null, "active"],
      );
    }
    for (const practitioner of input.practitioners) {
      await client.query(
        'INSERT INTO "doctor_practitioner" ("id", "networkId", "name", "profession", "phone", "email") VALUES ($1, $2, $3, $4, $5, $6)',
        [`practitioner_${crypto.randomUUID()}`, networkId, practitioner.name, practitioner.profession, practitioner.phone || null, practitioner.email || null],
      );
    }
    await client.query("COMMIT");
    return getDoctorNetwork(userId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
