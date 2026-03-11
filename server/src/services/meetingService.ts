 import { query, transaction, getClient } from "../db";
import { PoolClient } from "pg";
import {
  Meeting,
  MeetingWithDetails,
  ActionItem,
  TranscriptEntry,
  Decision,
  CreateMeetingBody,
  UpdateMeetingBody,
} from "../types";
import { upsertMeetingVectors, deleteMeetingVectors } from "./pineconeService";
import { AppError } from "../middleware/errorHandler";
import { logger } from "../middleware/logger";

 
export async function getAllMeetings(
  status?: string,
  search?: string
): Promise<Meeting[]> {
  let sql = `
    SELECT id, title, date, duration, participants, status, tags,
           summary, audio_file_path, created_at, updated_at
    FROM meetings
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (status) {
    params.push(status);
    sql += ` AND status = $${params.length}`;
  }

  if (search) {
    params.push(`%${search.toLowerCase()}%`);
    sql += ` AND (LOWER(title) LIKE $${params.length} OR $${params.length} = ANY(SELECT LOWER(t) FROM unnest(tags) AS t))`;
  }

  sql += " ORDER BY date DESC";

  const result = await query<Meeting>(sql, params);
  return result.rows;
}

export async function getMeetingById(id: string): Promise<MeetingWithDetails> {
  const meetingResult = await query<Meeting>(
    `SELECT id, title, date, duration, participants, status, tags,
            summary, audio_file_path, created_at, updated_at
     FROM meetings WHERE id = $1`,
    [id]
  );

  if (meetingResult.rows.length === 0) {
    throw new AppError(404, `Meeting not found: ${id}`);
  }

  const meeting = meetingResult.rows[0];

  const [actionItemsResult, transcriptResult, decisionsResult] =
    await Promise.all([
      query<ActionItem>(
        "SELECT * FROM action_items WHERE meeting_id = $1 ORDER BY created_at",
        [id]
      ),
      query<TranscriptEntry>(
        "SELECT * FROM transcript_entries WHERE meeting_id = $1 ORDER BY sequence_order",
        [id]
      ),
      query<Decision>(
        "SELECT * FROM decisions WHERE meeting_id = $1 ORDER BY created_at",
        [id]
      ),
    ]);

  return {
    ...meeting,
    action_items: actionItemsResult.rows,
    transcript: transcriptResult.rows,
    decisions: decisionsResult.rows,
  };
}

export async function createMeeting(body: CreateMeetingBody): Promise<Meeting> {
  const result = await query<Meeting>(
    `INSERT INTO meetings (title, date, participants, tags, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      body.title,
      body.date,
      body.participants,
      body.tags ?? [],
      body.status ?? "scheduled",
    ]
  );
  return result.rows[0];
}

export async function updateMeeting(
  id: string,
  body: UpdateMeetingBody
): Promise<Meeting> {
  const existing = await query<Meeting>(
    "SELECT id FROM meetings WHERE id = $1",
    [id]
  );
  if (existing.rows.length === 0) {
    throw new AppError(404, `Meeting not found: ${id}`);
  }

  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  const allowed: (keyof UpdateMeetingBody)[] = [
    "title",
    "date",
    "participants",
    "tags",
    "status",
    "summary",
  ];

  for (const key of allowed) {
    if (body[key] !== undefined) {
      fields.push(`${key} = $${idx++}`);
      values.push(body[key]);
    }
  }

  if (fields.length === 0) {
    throw new AppError(400, "No valid fields to update");
  }

  values.push(id);
  const result = await query<Meeting>(
    `UPDATE meetings SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
}

export async function deleteMeeting(id: string): Promise<void> {
  const existing = await query<Meeting>(
    "SELECT id FROM meetings WHERE id = $1",
    [id]
  );
  if (existing.rows.length === 0) {
    throw new AppError(404, `Meeting not found: ${id}`);
  }

  await query("DELETE FROM meetings WHERE id = $1", [id]);

   deleteMeetingVectors(id).catch((err) =>
    logger.warn(`Failed to delete Pinecone vectors for meeting ${id}`, err)
  );
}

 
export async function getActionItems(
  meetingId: string
): Promise<ActionItem[]> {
  const result = await query<ActionItem>(
    "SELECT * FROM action_items WHERE meeting_id = $1 ORDER BY created_at",
    [meetingId]
  );
  return result.rows;
}

export async function createActionItem(
  meetingId: string,
  body: { text: string; assignee: string; due_date?: string }
): Promise<ActionItem> {
  const result = await query<ActionItem>(
    `INSERT INTO action_items (meeting_id, text, assignee, due_date)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [meetingId, body.text, body.assignee, body.due_date ?? null]
  );
  return result.rows[0];
}

export async function toggleActionItem(
  meetingId: string,
  itemId: string
): Promise<ActionItem> {
  const result = await query<ActionItem>(
    `UPDATE action_items
     SET completed = NOT completed
     WHERE id = $1 AND meeting_id = $2
     RETURNING *`,
    [itemId, meetingId]
  );
  if (result.rows.length === 0) {
    throw new AppError(404, "Action item not found");
  }
  return result.rows[0];
}

export async function deleteActionItem(
  meetingId: string,
  itemId: string
): Promise<void> {
  const result = await query(
    "DELETE FROM action_items WHERE id = $1 AND meeting_id = $2",
    [itemId, meetingId]
  );
  if (result.rowCount === 0) {
    throw new AppError(404, "Action item not found");
  }
}

 
export async function saveMeetingAnalysis(
  meetingId: string,
  analysis: {
    summary: string;
    action_items: Array<{ text: string; assignee: string; due_date?: string }>;
    decisions: string[];
  }
): Promise<void> {
  await transaction(async (client: PoolClient) => {
    await client.query("UPDATE meetings SET summary = $1, status = 'completed' WHERE id = $2", [
      analysis.summary,
      meetingId,
    ]);

    for (const item of analysis.action_items) {
      await client.query(
        "INSERT INTO action_items (meeting_id, text, assignee, due_date) VALUES ($1, $2, $3, $4)",
        [meetingId, item.text, item.assignee, item.due_date ?? null]
      );
    }

    for (const decision of analysis.decisions) {
      await client.query(
        "INSERT INTO decisions (meeting_id, text) VALUES ($1, $2)",
        [meetingId, decision]
      );
    }
  });
}

export async function saveTranscript(
  meetingId: string,
  entries: Array<{ speaker: string; text: string; timestamp: string }>
): Promise<void> {
  await query("DELETE FROM transcript_entries WHERE meeting_id = $1", [meetingId]);

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    await query(
      "INSERT INTO transcript_entries (meeting_id, speaker, text, timestamp, sequence_order) VALUES ($1, $2, $3, $4, $5)",
      [meetingId, e.speaker, e.text, e.timestamp, i + 1]
    );
  }
}

export async function getStats(): Promise<{
  totalMeetings: number;
  totalHours: number;
  actionItemsCompleted: number;
  actionItemsPending: number;
}> {
  const [meetingStats, actionStats] = await Promise.all([
    query<{ total: string; hours: string }>(`
      SELECT
        COUNT(*) as total,
        COALESCE(
          SUM(
            CASE
              WHEN duration LIKE '%h%' THEN
                CAST(SPLIT_PART(duration, 'h', 1) AS FLOAT) +
                COALESCE(CAST(NULLIF(TRIM(SPLIT_PART(SPLIT_PART(duration, 'h', 2), 'min', 1)), '') AS FLOAT), 0) / 60
              WHEN duration LIKE '%min%' THEN
                CAST(SPLIT_PART(duration, ' ', 1) AS FLOAT) / 60
              ELSE 0
            END
          ), 0
        ) as hours
      FROM meetings
      WHERE created_at >= date_trunc('month', NOW())
    `),
    query<{ completed: string; pending: string }>(`
      SELECT
        COUNT(*) FILTER (WHERE completed = true) as completed,
        COUNT(*) FILTER (WHERE completed = false) as pending
      FROM action_items
      WHERE created_at >= date_trunc('week', NOW())
    `),
  ]);

  return {
    totalMeetings: parseInt(meetingStats.rows[0]?.total ?? "0"),
    totalHours: parseFloat(
      (meetingStats.rows[0]?.hours ?? "0").toString()
    ),
    actionItemsCompleted: parseInt(actionStats.rows[0]?.completed ?? "0"),
    actionItemsPending: parseInt(actionStats.rows[0]?.pending ?? "0"),
  };
}