export type DepartmentCode = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10' | '11' | '12';

export interface DepartmentConfig {
  code: DepartmentCode;
  name: string;
  abbr: string;
  studentCount: number;
  multiplier: number;
  themeColor: string;
  lightColor: string;
  textColor: string;
  baseCount: number; // e.g. 3, 6, 13, 18
}

export type PlayerStage = 
  | 'LOGIN' 
  | 'BRIEFING' 
  | 'STAGE_1_INSTRUCTION'
  | 'STAGE_1_BATTLESHIP' 
  | 'STAGE_2_INSTRUCTION'
  | 'STAGE_2_CONNECT4' 
  | 'STAGE_3_INSTRUCTION'
  | 'STAGE_3_STACK' 
  | 'STAGE_4_POLL' 
  | 'COMPLETED';

export interface ParsedStudent {
  studentId: string;
  batch: string;
  batchShort: string;
  deptCode: DepartmentCode;
  deptName: string;
  deptAbbr: string;
  roll: string;
  themeColor: string;
  lightColor: string;
  multiplier: number;
}

export interface PlayerRecord {
  studentId: string;
  rfid?: string;
  batch: string;
  deptCode: DepartmentCode;
  roll: string;
  status: 'PENDING_AUTH' | 'AUTHORIZED' | 'IN_PROGRESS' | 'COMPLETED';
  currentStage: PlayerStage;
  battleshipAP: number; // Max 3
  battleshipMoves: Array<{
    x: number;
    y: number;
    action: 'ATTACK' | 'HIDE';
    hitDept?: DepartmentCode;
    result: 'HIT' | 'FRIENDLY_FIRE' | 'MISS' | 'RE_CLOAKED';
  }>;
  connect4Col: number | null;
  stackFloors: number;
  stackCombos: number;
  pollAnswers: {
    q1?: string;
    q2?: string;
    q3?: string;
  };
  totalPointsEarned: number;
  authorizedAt: number;
  completedAt?: number;
}

// Polyomino Fragment Shape types
export type PolyominoShape = 'I_VER' | 'I_HOR' | 'O_SQUARE' | 'T_DOWN' | 'T_UP' | 'L_SHAPE' | 'J_SHAPE' | 'S_SHAPE' | 'Z_SHAPE';

export interface PolyominoFragment {
  id: string;
  deptCode: DepartmentCode;
  shapeType: PolyominoShape;
  tiles: Array<[number, number]>; // 4 pairs of [x, y]
  hits: number; // 0 to 4
}

export interface BattleshipCell {
  x: number;
  y: number;
  explored: boolean;
  isBase: boolean;
  deptCode?: DepartmentCode;
  fragmentId?: string;
  revealed: boolean; // True if public to everyone
  reCloaked?: boolean;
}

export interface BattleshipDeptScore {
  fragmentsFoundCount: number; // Enemy base tiles found by this dept
  attackScore: number; // Total offensive attack points
  friendlyFireCount: number;
}

export interface BattleshipState {
  gridSize: number; // 35
  fragments: PolyominoFragment[];
  revealedTiles: Record<string, { deptCode: DepartmentCode; fragmentId: string; revealedByDept?: DepartmentCode }>; // Key: `${x},${y}`
  exploredWater: string[]; // Keys: `${x},${y}`
  deptScores: Record<DepartmentCode, BattleshipDeptScore>;
  stealthScores?: Record<DepartmentCode, {
    totalBases: number;
    unrevealedBases: number;
    stealthPercent: number;
    stealthScore: number;
  }>;
}

export interface Connect4Cell {
  col: number;
  row: number;
  deptCode: DepartmentCode | null;
  isGrayLocked: boolean;
  streakId?: string;
}

export interface Connect4State {
  cols: number; // 14
  rows: number; // 10
  grid: (Connect4Cell | null)[][]; // [col][row]
  lockedStreaks: Array<{
    streakId: string;
    deptCode: DepartmentCode;
    cells: Array<[number, number]>;
    points: number;
  }>;
  streakScores: Record<DepartmentCode, {
    count: number;
    points: number;
  }>;
}

export interface StackerRecord {
  studentId: string;
  batch: string;
  deptCode: DepartmentCode;
  deptAbbr: string;
  roll: string;
  floors: number;
  combos: number;
  timestamp: number;
}

export interface SpicyPollStats {
  q1: Record<string, number>; // Most chill/sleeping dept
  q2: Record<string, number>; // Highest fest hype dept
  q3: Record<string, number>; // Canteen hangout kings
  totalVotes: number;
}

export interface ActivityEvent {
  id: string;
  text: string;
  type: 'BATTLESHIP_HIT' | 'FRIENDLY_FIRE' | 'RE_CLOAK' | 'CONNECT4_STREAK' | 'CONNECT4_BLOCK' | 'STACK_HIGH' | 'AUTH';
  deptCode?: DepartmentCode;
  timestamp: number;
}

export interface OverallLeaderboardEntry {
  deptCode: DepartmentCode;
  deptName: string;
  deptAbbr: string;
  themeColor: string;
  battleshipRank: number;
  battleshipScore: number;
  battleshipFragmentsFound: number;
  connect4Rank: number;
  connect4Score: number;
  stackRank: number;
  stackScore: number;
  participationCount: number;
  participationRate: number;
  grandScore: number;
  overallRank: number;
}

export interface ServerStateSnapshot {
  battleship: BattleshipState;
  connect4: Connect4State;
  stackerTopRecords: StackerRecord[];
  pollStats: SpicyPollStats;
  overallLeaderboard: OverallLeaderboardEntry[];
  recentActivities: ActivityEvent[];
  stats: {
    totalStudentsRegistered: number;
    totalPlayed: number;
    day: 1 | 2;
  };
}
