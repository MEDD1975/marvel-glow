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

export async function saveDoctorNetwork(
  userId: string,
  input: { name: string; address: string; phone?: string; practitioners: Array<{ name: string; profession: string; phone?: string; email?: string }> },
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const networkId = `network_${crypto.randomUUID()}`;
    await client.query(
      'INSERT INTO "doctor_network" ("id", "ownerId", "name", "address", "phone", "status") VALUES ($1, $2, $3, $4, $5, $6)',
      [networkId, userId, input.name, input.address, input.phone || null, "pending"],
    );
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
