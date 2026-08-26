import dotenv from 'dotenv';
import { Pool } from 'pg';
import { 
  BattleshipState, 
  Connect4State, 
  PlayerRecord, 
  SpicyPollStats, 
  StackerRecord, 
  ActivityEvent 
} from '../src/types';

dotenv.config();

const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

let pool: Pool | null = null;

if (connectionString) {
  pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });
  console.log('🔗 Neon DB connection pool configured.');
} else {
  console.log('⚠️ No DATABASE_URL found in environment. Using local persistence fallback (server/db.json).');
}

export function isNeonConnected(): boolean {
  return pool !== null;
}

export async function initDatabaseSchema(): Promise<boolean> {
  if (!pool) return false;

  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS fest_game_state (
          id VARCHAR(32) PRIMARY KEY,
          day INT NOT NULL DEFAULT 1,
          battleship JSONB NOT NULL,
          connect4 JSONB NOT NULL,
          poll_stats JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS fest_players (
          student_id VARCHAR(32) PRIMARY KEY,
          rfid VARCHAR(64),
          batch VARCHAR(16) NOT NULL,
          dept_code VARCHAR(16) NOT NULL,
          roll VARCHAR(16) NOT NULL,
          status VARCHAR(32) NOT NULL,
          current_stage VARCHAR(32) NOT NULL,
          battleship_ap INT NOT NULL DEFAULT 3,
          battleship_moves JSONB NOT NULL DEFAULT '[]'::jsonb,
          connect4_col INT,
          stack_floors INT NOT NULL DEFAULT 0,
          stack_combos INT NOT NULL DEFAULT 0,
          poll_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
          total_points_earned INT NOT NULL DEFAULT 0,
          authorized_at BIGINT NOT NULL,
          completed_at BIGINT,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Safe column addition in case table already existed
        ALTER TABLE fest_players ADD COLUMN IF NOT EXISTS rfid VARCHAR(64);

        CREATE TABLE IF NOT EXISTS fest_stacker_records (
          id SERIAL PRIMARY KEY,
          student_id VARCHAR(32) NOT NULL,
          batch VARCHAR(16) NOT NULL,
          dept_code VARCHAR(16) NOT NULL,
          dept_abbr VARCHAR(16) NOT NULL,
          roll VARCHAR(16) NOT NULL,
          floors INT NOT NULL,
          combos INT NOT NULL,
          timestamp BIGINT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS fest_activities (
          id VARCHAR(64) PRIMARY KEY,
          text TEXT NOT NULL,
          type VARCHAR(32) NOT NULL,
          dept_code VARCHAR(16),
          timestamp BIGINT NOT NULL
        );
      `);
      console.log('✅ Neon DB database schema verified / initialized successfully.');
      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ Failed to initialize Neon DB schema:', err);
    return false;
  }
}

// --- Game State IO ---
export async function dbSaveGameState(state: {
  day: number;
  battleship: BattleshipState;
  connect4: Connect4State;
  pollStats: SpicyPollStats;
}): Promise<void> {
  if (!pool) return;
  try {
    await pool.query(
      `INSERT INTO fest_game_state (id, day, battleship, connect4, poll_stats, updated_at)
       VALUES ('main_state', $1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE 
       SET day = $1, battleship = $2, connect4 = $3, poll_stats = $4, updated_at = CURRENT_TIMESTAMP`,
      [
        state.day,
        JSON.stringify(state.battleship),
        JSON.stringify(state.connect4),
        JSON.stringify(state.pollStats)
      ]
    );
  } catch (err) {
    console.error('Neon DB Error saving game state:', err);
  }
}

export async function dbLoadGameState(): Promise<{
  day: 1 | 2;
  battleship: BattleshipState;
  connect4: Connect4State;
  pollStats: SpicyPollStats;
} | null> {
  if (!pool) return null;
  try {
    const res = await pool.query('SELECT * FROM fest_game_state WHERE id = $1', ['main_state']);
    if (res.rows.length > 0) {
      const row = res.rows[0];
      return {
        day: (row.day === 2 ? 2 : 1) as 1 | 2,
        battleship: typeof row.battleship === 'string' ? JSON.parse(row.battleship) : row.battleship,
        connect4: typeof row.connect4 === 'string' ? JSON.parse(row.connect4) : row.connect4,
        pollStats: typeof row.poll_stats === 'string' ? JSON.parse(row.poll_stats) : row.poll_stats
      };
    }
  } catch (err) {
    console.error('Neon DB Error loading game state:', err);
  }
  return null;
}

// --- Player IO ---
export async function dbSavePlayer(p: PlayerRecord): Promise<void> {
  if (!pool) return;
  try {
    await pool.query(
      `INSERT INTO fest_players (
        student_id, rfid, batch, dept_code, roll, status, current_stage,
        battleship_ap, battleship_moves, connect4_col, stack_floors,
        stack_combos, poll_answers, total_points_earned, authorized_at, completed_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP)
      ON CONFLICT (student_id) DO UPDATE SET
        rfid = COALESCE($2, fest_players.rfid),
        batch = $3,
        dept_code = $4,
        roll = $5,
        status = $6,
        current_stage = $7,
        battleship_ap = $8,
        battleship_moves = $9,
        connect4_col = $10,
        stack_floors = $11,
        stack_combos = $12,
        poll_answers = $13,
        total_points_earned = $14,
        authorized_at = $15,
        completed_at = $16,
        updated_at = CURRENT_TIMESTAMP`,
      [
        p.studentId,
        p.rfid || null,
        p.batch,
        p.deptCode,
        p.roll,
        p.status,
        p.currentStage,
        p.battleshipAP,
        JSON.stringify(p.battleshipMoves),
        p.connect4Col,
        p.stackFloors,
        p.stackCombos,
        JSON.stringify(p.pollAnswers),
        p.totalPointsEarned,
        p.authorizedAt,
        p.completedAt || null
      ]
    );
  } catch (err) {
    console.error(`Neon DB Error saving player ${p.studentId}:`, err);
  }
}

export async function dbLoadAllPlayers(): Promise<Record<string, PlayerRecord>> {
  const players: Record<string, PlayerRecord> = {};
  if (!pool) return players;

  try {
    const res = await pool.query('SELECT * FROM fest_players');
    for (const r of res.rows) {
      players[r.student_id] = {
        studentId: r.student_id,
        rfid: r.rfid || undefined,
        batch: r.batch,
        deptCode: r.dept_code,
        roll: r.roll,
        status: r.status,
        currentStage: r.current_stage,
        battleshipAP: Number(r.battleship_ap),
        battleshipMoves: typeof r.battleship_moves === 'string' ? JSON.parse(r.battleship_moves) : r.battleship_moves,
        connect4Col: r.connect4_col !== null ? Number(r.connect4_col) : null,
        stackFloors: Number(r.stack_floors),
        stackCombos: Number(r.stack_combos),
        pollAnswers: typeof r.poll_answers === 'string' ? JSON.parse(r.poll_answers) : r.poll_answers,
        totalPointsEarned: Number(r.total_points_earned),
        authorizedAt: Number(r.authorized_at),
        completedAt: r.completed_at ? Number(r.completed_at) : undefined
      };
    }
  } catch (err) {
    console.error('Neon DB Error loading players:', err);
  }
  return players;
}

// --- Stacker Records IO ---
export async function dbSaveStackerRecord(r: StackerRecord): Promise<void> {
  if (!pool) return;
  try {
    await pool.query(
      `INSERT INTO fest_stacker_records (student_id, batch, dept_code, dept_abbr, roll, floors, combos, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [r.studentId, r.batch, r.deptCode, r.deptAbbr, r.roll, r.floors, r.combos, r.timestamp]
    );
  } catch (err) {
    console.error('Neon DB Error saving stacker record:', err);
  }
}

export async function dbLoadStackerRecords(): Promise<StackerRecord[]> {
  if (!pool) return [];
  try {
    const res = await pool.query(
      `SELECT student_id, batch, dept_code, dept_abbr, roll, floors, combos, timestamp 
       FROM fest_stacker_records 
       ORDER BY floors DESC, combos DESC 
       LIMIT 50`
    );
    return res.rows.map(r => ({
      studentId: r.student_id,
      batch: r.batch,
      deptCode: r.dept_code,
      deptAbbr: r.dept_abbr,
      roll: r.roll,
      floors: Number(r.floors),
      combos: Number(r.combos),
      timestamp: Number(r.timestamp)
    }));
  } catch (err) {
    console.error('Neon DB Error loading stacker records:', err);
    return [];
  }
}

// --- Activities IO ---
export async function dbSaveActivity(a: ActivityEvent): Promise<void> {
  if (!pool) return;
  try {
    await pool.query(
      `INSERT INTO fest_activities (id, text, type, dept_code, timestamp)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING`,
      [a.id, a.text, a.type, a.deptCode || null, a.timestamp]
    );
  } catch (err) {
    console.error('Neon DB Error saving activity:', err);
  }
}

export async function dbLoadActivities(): Promise<ActivityEvent[]> {
  if (!pool) return [];
  try {
    const res = await pool.query('SELECT * FROM fest_activities ORDER BY timestamp DESC LIMIT 50');
    return res.rows.map(r => ({
      id: r.id,
      text: r.text,
      type: r.type,
      deptCode: r.dept_code,
      timestamp: Number(r.timestamp)
    })).reverse();
  } catch (err) {
    console.error('Neon DB Error loading activities:', err);
    return [];
  }
}

// --- Full Reset ---
export async function dbResetAll(): Promise<void> {
  if (!pool) return;
  try {
    await pool.query(`
      TRUNCATE TABLE fest_game_state, fest_players, fest_stacker_records, fest_activities;
    `);
    console.log('🧹 Neon DB tables truncated.');
  } catch (err) {
    console.error('Neon DB Error resetting database:', err);
  }
}
