import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export type FollowUpAnswer = {
  id: string;
  label: string;
  action: "continue" | "redirect";
  redirectMessage: string | null;
};

export type FollowUpStepRecord = {
  id: string;
  ownerId: string;
  conditionId: string;
  position: number;
  title: string;
  instruction: string;
  delayText: string | null;
  question: string | null;
  answers: FollowUpAnswer[];
  createdAt: string;
};

export type FollowUpStepInput = {
  title: string;
  instruction: string;
  delayText?: string | null;
  question?: string | null;
  answers: FollowUpAnswer[];
};

const SELECT_COLUMNS =
  '"id", "ownerId", "conditionId", "position", "title", "instruction", "delayText", "question", "answers", "createdAt"';

export async function listFollowUpSteps(ownerId?: string, conditionId?: string) {
  const values: string[] = [];
  const filters: string[] = [];
  if (ownerId) {
    values.push(ownerId);
    filters.push(`"ownerId" = $${values.length}`);
  }
  if (conditionId) {
    values.push(conditionId);
    filters.push(`"conditionId" = $${values.length}`);
  }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const result = await pool.query<FollowUpStepRecord>(
    `SELECT ${SELECT_COLUMNS} FROM "follow_up_step" ${where} ORDER BY "position" ASC, "createdAt" ASC`,
    values,
  );
  return result.rows;
}

export async function createFollowUpStep(ownerId: string, conditionId: string, input: FollowUpStepInput) {
  const positionResult = await pool.query<{ next: number }>(
    'SELECT COALESCE(MAX("position"), -1) + 1 AS "next" FROM "follow_up_step" WHERE "ownerId" = $1 AND "conditionId" = $2',
    [ownerId, conditionId],
  );
  const position = positionResult.rows[0]?.next ?? 0;
  const result = await pool.query<FollowUpStepRecord>(
    `INSERT INTO "follow_up_step" ("id", "ownerId", "conditionId", "position", "title", "instruction", "delayText", "question", "answers") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb) RETURNING ${SELECT_COLUMNS}`,
    [
      `step_${crypto.randomUUID()}`,
      ownerId,
      conditionId,
      position,
      input.title,
      input.instruction,
      input.delayText ?? null,
      input.question ?? null,
      JSON.stringify(input.answers),
    ],
  );
  return result.rows[0];
}

export async function updateFollowUpStep(ownerId: string, id: string, input: FollowUpStepInput) {
  const result = await pool.query<FollowUpStepRecord>(
    `UPDATE "follow_up_step" SET "title" = $1, "instruction" = $2, "delayText" = $3, "question" = $4, "answers" = $5::jsonb WHERE "id" = $6 AND "ownerId" = $7 RETURNING ${SELECT_COLUMNS}`,
    [input.title, input.instruction, input.delayText ?? null, input.question ?? null, JSON.stringify(input.answers), id, ownerId],
  );
  return result.rows[0] ?? null;
}

export async function deleteFollowUpStep(ownerId: string, id: string) {
  await pool.query('DELETE FROM "follow_up_step" WHERE "id" = $1 AND "ownerId" = $2', [id, ownerId]);
}

export async function reorderFollowUpSteps(ownerId: string, conditionId: string, orderedIds: string[]) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (let index = 0; index < orderedIds.length; index += 1) {
      await client.query(
        'UPDATE "follow_up_step" SET "position" = $1 WHERE "id" = $2 AND "ownerId" = $3 AND "conditionId" = $4',
        [index, orderedIds[index], ownerId, conditionId],
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
  return listFollowUpSteps(ownerId, conditionId);
}

export { pool as followUpStepPool };
