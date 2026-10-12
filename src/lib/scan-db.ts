import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL ?? process.env.POSTGRES_URL });

export type ScanStats = {
  total: number;
  byPathology: Array<{ parcoursId: string; count: number }>;
  byDoctor?: Array<{ medecinId: string; count: number }>;
};

export async function recordAnonymousScan(medecinId: string, parcoursId: string) {
  await pool.query(
    "INSERT INTO scans (medecin_id, parcours_id) VALUES ($1, $2)",
    [medecinId, parcoursId],
  );
}

export async function getScanStats(medecinId?: string): Promise<ScanStats> {
  const filter = medecinId ? "WHERE medecin_id = $1" : "";
  const values = medecinId ? [medecinId] : [];
  const [totalResult, pathologyResult, doctorResult] = await Promise.all([
    pool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM scans ${filter}`, values),
    pool.query<{ parcours_id: string; count: string }>(`SELECT parcours_id, COUNT(*)::text AS count FROM scans ${filter} GROUP BY parcours_id ORDER BY COUNT(*) DESC`, values),
    medecinId ? Promise.resolve({ rows: [] as { medecin_id: string; count: string }[] }) : pool.query<{ medecin_id: string; count: string }>("SELECT medecin_id, COUNT(*)::text AS count FROM scans GROUP BY medecin_id ORDER BY COUNT(*) DESC"),
  ]);

  return {
    total: Number(totalResult.rows[0]?.count ?? 0),
    byPathology: pathologyResult.rows.map((row) => ({ parcoursId: row.parcours_id, count: Number(row.count) })),
    ...(medecinId ? {} : { byDoctor: doctorResult.rows.map((row) => ({ medecinId: row.medecin_id, count: Number(row.count) })) }),
  };
}

export { pool as scanPool };
