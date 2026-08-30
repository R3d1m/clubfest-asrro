import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  DepartmentCode, 
  PolyominoFragment, 
  PolyominoShape,
  BattleshipState,
  BattleshipDeptScore,
  Connect4State,
  StackerRecord,
  SpicyPollStats,
  OverallLeaderboardEntry,
  ActivityEvent,
  PlayerRecord,
  ServerStateSnapshot
} from '../src/types';
import { DEPARTMENTS, DEPARTMENT_LIST } from '../src/data/departments';
import { 
  isNeonConnected,
  initDatabaseSchema,
  dbSaveGameState,
  dbLoadGameState,
  dbSavePlayer,
  dbLoadAllPlayers,
  dbSaveStackerRecord,
  dbLoadStackerRecords,
  dbSaveActivity,
  dbLoadActivities,
  dbResetAll
} from './db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');

export class GameEngine {
  public battleship: BattleshipState;
  public connect4: Connect4State;
  public stackerTopRecords: StackerRecord[] = [];
  public pollStats: SpicyPollStats = {
    q1: {},
    q2: {},
    q3: {},
    totalVotes: 0
  };
  public players: Record<string, PlayerRecord> = {};
  public activities: ActivityEvent[] = [];
  public day: 1 | 2 = 1;
  public isReady: Promise<void>;

  constructor() {
    this.battleship = this.initBattleship();
    this.connect4 = this.initConnect4();
    this.isReady = this.bootstrapState();
  }

  private async bootstrapState(): Promise<void> {
    try {
      if (isNeonConnected()) {
        const ok = await initDatabaseSchema();
        if (ok) {
          await this.loadState();
          return;
        }
      }
    } catch (err) {
      console.error('Neon DB connection initialization warning:', err);
    }
    // Fallback load local state
    await this.loadState();
  }

  // --- Initializers ---
  private initBattleship(): BattleshipState {
    const gridSize = 35;
    const fragments: PolyominoFragment[] = [];
    const occupied = new Set<string>();

    DEPARTMENT_LIST.forEach((dept) => {
      for (let i = 0; i < dept.baseCount; i++) {
        const frag = this.generateRandomFragment(dept.code, i + 1, gridSize, occupied);
        fragments.push(frag);
        frag.tiles.forEach(([x, y]) => occupied.add(`${x},${y}`));
      }
    });

    const deptScores: Record<DepartmentCode, BattleshipDeptScore> = {} as any;
    DEPARTMENT_LIST.forEach((dept) => {
      deptScores[dept.code] = {
        fragmentsFoundCount: 0,
        attackScore: 0,
        friendlyFireCount: 0
      };
    });

    return {
      gridSize,
      fragments,
      revealedTiles: {},
      exploredWater: [],
      deptScores
    };
  }

  private generateRandomFragment(
    deptCode: DepartmentCode, 
    index: number, 
    gridSize: number, 
    occupied: Set<string>
  ): PolyominoFragment {
    const shapes: PolyominoShape[] = ['I_VER', 'I_HOR', 'O_SQUARE', 'T_DOWN', 'T_UP', 'L_SHAPE', 'J_SHAPE', 'S_SHAPE', 'Z_SHAPE'];
    let attempts = 0;

    while (attempts < 500) {
      attempts++;
      const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
      const startX = Math.floor(Math.random() * (gridSize - 4)) + 1;
      const startY = Math.floor(Math.random() * (gridSize - 4)) + 1;

      const offsets = this.getShapeOffsets(shapeType);
      const tiles: Array<[number, number]> = offsets.map(([dx, dy]) => [startX + dx, startY + dy]);

      const isValid = tiles.every(([x, y]) => 
        x >= 0 && x < gridSize && y >= 0 && y < gridSize && !occupied.has(`${x},${y}`)
      );

      if (isValid) {
        return {
          id: `${deptCode}_BASE_${index}`,
          deptCode,
          shapeType,
          tiles,
          hits: 0
        };
      }
    }

    const fallbackX = (index * 2) % 30;
    const fallbackY = (index * 2) % 30;
    return {
      id: `${deptCode}_BASE_${index}`,
      deptCode,
      shapeType: 'O_SQUARE',
      tiles: [[fallbackX, fallbackY], [fallbackX + 1, fallbackY], [fallbackX, fallbackY + 1], [fallbackX + 1, fallbackY + 1]],
      hits: 0
    };
  }

  private getShapeOffsets(shape: PolyominoShape): Array<[number, number]> {
    switch (shape) {
      case 'I_VER': return [[0, 0], [0, 1], [0, 2], [0, 3]];
      case 'I_HOR': return [[0, 0], [1, 0], [2, 0], [3, 0]];
      case 'O_SQUARE': return [[0, 0], [1, 0], [0, 1], [1, 1]];
      case 'T_DOWN': return [[0, 0], [1, 0], [2, 0], [1, 1]];
      case 'T_UP': return [[1, 0], [0, 1], [1, 1], [2, 1]];
      case 'L_SHAPE': return [[0, 0], [0, 1], [0, 2], [1, 2]];
      case 'J_SHAPE': return [[1, 0], [1, 1], [1, 2], [0, 2]];
      case 'S_SHAPE': return [[1, 0], [2, 0], [0, 1], [1, 1]];
      case 'Z_SHAPE': return [[0, 0], [1, 0], [1, 1], [2, 1]];
      default: return [[0, 0], [1, 0], [0, 1], [1, 1]];
    }
  }

  private initConnect4(): Connect4State {
    const cols = 14;
    const rows = 10;
    const grid = Array.from({ length: cols }, () => Array(rows).fill(null));

    const streakScores: Connect4State['streakScores'] = {} as any;
    DEPARTMENT_LIST.forEach((dept) => {
      streakScores[dept.code] = { count: 0, points: 0 };
    });

    return {
      cols,
      rows,
      grid,
      lockedStreaks: [],
      streakScores
    };
  }

  // --- Battleship Offensive Hunting Logic ---
  public handleBattleshipMove(
    studentId: string, 
    x: number, 
    y: number, 
    action: 'ATTACK' | 'HIDE'
  ): { success: boolean; result?: string; message: string; state?: ServerStateSnapshot } {
    const player = this.players[studentId];
    if (!player) return { success: false, message: 'শিক্ষার্থী রেজিস্টার্ড নয়!' };
    if (player.battleshipAP <= 0) return { success: false, message: 'সব চাল শেষ হয়েছে!' };

    const key = `${x},${y}`;

    if (action === 'HIDE') {
      const revealed = this.battleship.revealedTiles[key];
      if (!revealed) {
        return { success: false, message: 'শুধুমাত্র ইতিমধ্যে ফাঁস হওয়া বেস লুকানো যাবে!' };
      }
      if (revealed.deptCode !== player.deptCode) {
        return { success: false, message: 'নিজের ডিপার্টমেন্টের বেস ছাড়া লুকানো যাবে না!' };
      }

      delete this.battleship.revealedTiles[key];

      player.battleshipAP--;
      player.battleshipMoves.push({ x, y, action: 'HIDE', hitDept: player.deptCode, result: 'RE_CLOAKED' });

      this.addActivity(`${DEPARTMENTS[player.deptCode].abbr} তাদের [${x},${y}] বেস ধোঁয়া দিয়ে আবার লুকিয়ে ফেলেছে! 🌫️`, 'RE_CLOAK', player.deptCode);
      this.saveState();
      dbSavePlayer(player);
      return { success: true, result: 'RE_CLOAKED', message: 'বেস সফলভাবে ধোঁয়ার আড়ালে লুকানো হয়েছে!', state: this.getSnapshot() };
    }

    if (this.battleship.exploredWater.includes(key) || this.battleship.revealedTiles[key]) {
      return { success: false, message: 'এই অংশটি ইতিমধ্যে উন্মোচিত!' };
    }

    const hitFrag = this.battleship.fragments.find(f => f.tiles.some(([tx, ty]) => tx === x && ty === y));

    if (hitFrag) {
      const isFriendly = hitFrag.deptCode === player.deptCode;
      this.battleship.revealedTiles[key] = { 
        deptCode: hitFrag.deptCode, 
        fragmentId: hitFrag.id,
        revealedByDept: player.deptCode
      };
      hitFrag.hits = hitFrag.tiles.filter(([tx, ty]) => this.battleship.revealedTiles[`${tx},${ty}`]).length;

      player.battleshipAP--;

      if (isFriendly) {
        // Friendly fire accident
        this.battleship.deptScores[player.deptCode].friendlyFireCount += 1;
        player.battleshipMoves.push({ x, y, action: 'ATTACK', hitDept: hitFrag.deptCode, result: 'FRIENDLY_FIRE' });
        this.addActivity(`🚨 ফ্রেন্ডলি ফায়ার! ${player.studentId} ভুলবশত নিজের ${DEPARTMENTS[player.deptCode].abbr} বেস উন্মুক্ত করেছে!`, 'FRIENDLY_FIRE', player.deptCode);
        
        this.saveState();
        dbSavePlayer(player);
        return { 
          success: true, 
          result: 'FRIENDLY_FIRE', 
          message: '🚨 ওহ না! নিজের ডিপার্টমেন্টের বেসে ফ্রেন্ডলি ফায়ার!',
          state: this.getSnapshot()
        };
      } else {
        // Successful Enemy Fragment Hit
        const pts = Math.round(100 * DEPARTMENTS[player.deptCode].multiplier);
        player.totalPointsEarned += pts;
        
        // Award offensive points to player's department
        this.battleship.deptScores[player.deptCode].fragmentsFoundCount += 1;
        this.battleship.deptScores[player.deptCode].attackScore += pts;

        player.battleshipMoves.push({ x, y, action: 'ATTACK', hitDept: hitFrag.deptCode, result: 'HIT' });
        this.addActivity(`🎯 ${DEPARTMENTS[player.deptCode].abbr} শত্রুপক্ষ ${DEPARTMENTS[hitFrag.deptCode].abbr} এর ৪-টাইল ঘাঁটি উন্মোচন করেছে! (+${pts} pts)`, 'BATTLESHIP_HIT', player.deptCode);

        this.saveState();
        dbSavePlayer(player);
        return { 
          success: true, 
          result: 'HIT', 
          message: `🎯 সফল আক্রমণ! ${DEPARTMENTS[hitFrag.deptCode].name} এর বেস ফাঁস হয়েছে (+${pts} pts)!`,
          state: this.getSnapshot()
        };
      }
    } else {
      this.battleship.exploredWater.push(key);
      player.battleshipAP--;
      player.battleshipMoves.push({ x, y, action: 'ATTACK', result: 'MISS' });
      this.saveState();
      dbSavePlayer(player);
      return { success: true, result: 'MISS', message: 'খালি সাগরে আঘাত লেগেছে (কোনো বেস পাওয়া যায়নি)।', state: this.getSnapshot() };
    }
  }

  // --- Connect 4 Logic ---
  public handleConnect4Drop(
    studentId: string, 
    col: number
  ): { success: boolean; row?: number; streakEarned?: boolean; points?: number; message: string; state?: ServerStateSnapshot } {
    const player = this.players[studentId];
    if (!player) return { success: false, message: 'শিক্ষার্থী রেজিস্টার্ড নয়!' };
    if (player.connect4Col !== null) return { success: false, message: 'ইতিমধ্যে কানেক্ট-৪ এর চাল দেওয়া হয়েছে!' };
    if (col < 0 || col >= this.connect4.cols) return { success: false, message: 'অবৈধ কলাম!' };

    let targetRow = -1;
    for (let r = this.connect4.rows - 1; r >= 0; r--) {
      if (this.connect4.grid[col][r] === null) {
        targetRow = r;
        break;
      }
    }

    if (targetRow === -1) {
      return { success: false, message: 'এই কলামটি ইতিমধ্যে পূর্ণ! অন্য কলাম বেছে নাও।' };
    }

    const newCell = {
      col,
      row: targetRow,
      deptCode: player.deptCode,
      isGrayLocked: false
    };
    this.connect4.grid[col][targetRow] = newCell;
    player.connect4Col = col;

    const streak = this.checkConnect4Streak(col, targetRow, player.deptCode);
    let streakEarned = false;
    let points = 0;

    if (streak) {
      streakEarned = true;
      const streakId = `STREAK_${Date.now()}`;
      points = Math.round(100 * DEPARTMENTS[player.deptCode].multiplier);

      streak.forEach(([c, r]) => {
        const cell = this.connect4.grid[c][r];
        if (cell) {
          cell.isGrayLocked = true;
          cell.streakId = streakId;
        }
      });

      this.connect4.lockedStreaks.push({
        streakId,
        deptCode: player.deptCode,
        cells: streak,
        points
      });

      this.connect4.streakScores[player.deptCode].count++;
      this.connect4.streakScores[player.deptCode].points += points;
      player.totalPointsEarned += points;

      this.addActivity(`🔴 ৪-ইন-এ-রো! ${DEPARTMENTS[player.deptCode].abbr} ৪টি বল মিলিয়ে গ্রে লক করেছে! (+${points} pts)`, 'CONNECT4_STREAK', player.deptCode);
    } else {
      this.addActivity(`${DEPARTMENTS[player.deptCode].abbr} কলাম ${col + 1}-এ বল ড্রপ করেছে!`, 'CONNECT4_BLOCK', player.deptCode);
    }

    this.saveState();
    dbSavePlayer(player);
    return {
      success: true,
      row: targetRow,
      streakEarned,
      points,
      message: streakEarned ? `🎉 অভিনন্দন! ৪টি বল মিলিয়ে ${points} পয়েন্ট অর্জন করেছো!` : 'বল সফলভাবে ড্রপ করা হয়েছে!',
      state: this.getSnapshot()
    };
  }

  private checkConnect4Streak(col: number, row: number, deptCode: DepartmentCode): Array<[number, number]> | null {
    const directions: Array<[number, number]> = [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, -1]
    ];

    for (const [dx, dy] of directions) {
      const line: Array<[number, number]> = [[col, row]];

      for (let step = 1; step < 4; step++) {
        const nc = col + dx * step;
        const nr = row + dy * step;
        if (nc >= 0 && nc < this.connect4.cols && nr >= 0 && nr < this.connect4.rows) {
          const cell = this.connect4.grid[nc][nr];
          if (cell && cell.deptCode === deptCode && !cell.isGrayLocked) {
            line.push([nc, nr]);
          } else {
            break;
          }
        }
      }

      for (let step = 1; step < 4; step++) {
        const nc = col - dx * step;
        const nr = row - dy * step;
        if (nc >= 0 && nc < this.connect4.cols && nr >= 0 && nr < this.connect4.rows) {
          const cell = this.connect4.grid[nc][nr];
          if (cell && cell.deptCode === deptCode && !cell.isGrayLocked) {
            line.unshift([nc, nr]);
          } else {
            break;
          }
        }
      }

      if (line.length >= 4) {
        return line.slice(0, 4);
      }
    }

    return null;
  }

  // --- Stacker Logic ---
  public handleStackerComplete(
    studentId: string, 
    floors: number, 
    combos: number
  ): { success: boolean; message: string; state?: ServerStateSnapshot } {
    const player = this.players[studentId];
    if (!player) return { success: false, message: 'শিক্ষার্থী রেজিস্টার্ড নয়!' };

    player.stackFloors = floors;
    player.stackCombos = combos;

    const record: StackerRecord = {
      studentId: player.studentId,
      batch: player.batch,
      deptCode: player.deptCode,
      deptAbbr: DEPARTMENTS[player.deptCode].abbr,
      roll: player.roll,
      floors,
      combos,
      timestamp: Date.now()
    };

    this.stackerTopRecords.push(record);
    this.stackerTopRecords.sort((a, b) => b.floors - a.floors || b.combos - a.combos);
    this.stackerTopRecords = this.stackerTopRecords.slice(0, 50);

    if (floors >= 40) {
      this.addActivity(`🏗️ ${player.studentId} (${DEPARTMENTS[player.deptCode].abbr}) স্ট্যাকিংয়ে ${floors} তলা পার করেছে! 🚀`, 'STACK_HIGH', player.deptCode);
    }

    this.saveState();
    dbSavePlayer(player);
    dbSaveStackerRecord(record);
    return { success: true, message: 'স্ট্যাকিং স্কোর রেকর্ড করা হয়েছে!', state: this.getSnapshot() };
  }

  // --- Spicy Poll Logic ---
  public handlePollSubmit(
    studentId: string, 
    answers: { q1?: string; q2?: string; q3?: string }
  ): { success: boolean; message: string; state?: ServerStateSnapshot } {
    const player = this.players[studentId];
    if (!player) return { success: false, message: 'শিক্ষার্থী রেজিস্টার্ড নয়!' };

    player.pollAnswers = answers;
    player.currentStage = 'COMPLETED';
    player.status = 'COMPLETED';
    player.completedAt = Date.now();

    if (answers.q1) this.pollStats.q1[answers.q1] = (this.pollStats.q1[answers.q1] || 0) + 1;
    if (answers.q2) this.pollStats.q2[answers.q2] = (this.pollStats.q2[answers.q2] || 0) + 1;
    if (answers.q3) this.pollStats.q3[answers.q3] = (this.pollStats.q3[answers.q3] || 0) + 1;
    this.pollStats.totalVotes++;

    this.saveState();
    dbSavePlayer(player);
    return { success: true, message: 'পোল সফলভাবে জমা হয়েছে!', state: this.getSnapshot() };
  }

  // --- Student Auth & Checkpoints ---
  public authorizeStudent(studentId: string, rfid?: string): { success: boolean; player?: PlayerRecord; message: string } {
    const cleanId = studentId.trim();
    const cleanRfid = rfid ? rfid.trim().toUpperCase() : undefined;

    if (cleanId.length < 6) return { success: false, message: 'সঠিক আইডি প্রদান করুন (যেমন: 2204055)' };

    const batch = cleanId.substring(0, 2);
    const deptCode = cleanId.substring(2, 4) as DepartmentCode;
    const roll = cleanId.substring(4);

    if (!DEPARTMENTS[deptCode]) {
      return { success: false, message: `অপরিচিত ডিপার্টমেন্ট কোড: ${deptCode}` };
    }

    let player = this.players[cleanId];
    if (!player) {
      player = {
        studentId: cleanId,
        rfid: cleanRfid,
        batch,
        deptCode,
        roll,
        status: 'AUTHORIZED',
        currentStage: 'BRIEFING',
        battleshipAP: 3,
        battleshipMoves: [],
        connect4Col: null,
        stackFloors: 0,
        stackCombos: 0,
        pollAnswers: {},
        totalPointsEarned: 0,
        authorizedAt: Date.now()
      };
      this.players[cleanId] = player;
      this.addActivity(`${cleanId} (${DEPARTMENTS[deptCode].abbr}-${batch}) রেজিস্টার্ড হয়েছে! 🎟️`, 'AUTH', deptCode);
      this.saveState();
      dbSavePlayer(player);
    } else if (cleanRfid && player.rfid !== cleanRfid) {
      player.rfid = cleanRfid;
      this.saveState();
      dbSavePlayer(player);
    }

    return { success: true, player, message: 'শিক্ষার্থী সফলভাবে অনুমোদিত হয়েছে!' };
  }

  public resetPlayerForTest(studentId: string): { success: boolean; player?: PlayerRecord } {
    const cleanId = studentId.trim();
    const batch = cleanId.substring(0, 2);
    const deptCode = cleanId.substring(2, 4) as DepartmentCode;
    const roll = cleanId.substring(4);

    const player: PlayerRecord = {
      studentId: cleanId,
      batch,
      deptCode,
      roll,
      status: 'AUTHORIZED',
      currentStage: 'BRIEFING',
      battleshipAP: 3,
      battleshipMoves: [],
      connect4Col: null,
      stackFloors: 0,
      stackCombos: 0,
      pollAnswers: {},
      totalPointsEarned: 0,
      authorizedAt: Date.now()
    };
    this.players[cleanId] = player;
    this.saveState();
    dbSavePlayer(player);
    return { success: true, player };
  }

  public getPlayer(studentId: string): PlayerRecord | null {
    return this.players[studentId.trim()] || null;
  }

  public getPlayerByRfid(rfid: string): PlayerRecord | null {
    const cleanRfid = rfid.trim().toUpperCase();
    return Object.values(this.players).find(p => p.rfid && p.rfid.toUpperCase() === cleanRfid) || null;
  }

  public updatePlayerStage(studentId: string, stage: PlayerRecord['currentStage']): void {
    const player = this.players[studentId];
    if (player && player.status !== 'COMPLETED') {
      player.currentStage = stage;
      player.status = 'IN_PROGRESS';
      this.saveState();
      dbSavePlayer(player);
    }
  }

  // --- Decathlon Overall Leaderboard (Hunting Points + Connect4 + Stacker + Attendance) ---
  public getOverallLeaderboard(): OverallLeaderboardEntry[] {
    const list: OverallLeaderboardEntry[] = DEPARTMENT_LIST.map((dept) => {
      const bData = this.battleship.deptScores?.[dept.code] || { fragmentsFoundCount: 0, attackScore: 0, friendlyFireCount: 0 };
      const bScore = bData.attackScore;
      const bFragmentsFound = bData.fragmentsFoundCount;

      const cScore = this.connect4.streakScores[dept.code]?.points || 0;

      const deptStackers = Object.values(this.players).filter(p => p.deptCode === dept.code && p.stackFloors > 0);
      const avgStack = deptStackers.length > 0 
        ? Math.round(deptStackers.reduce((acc, p) => acc + p.stackFloors, 0) / deptStackers.length) 
        : 0;

      const playedCount = Object.values(this.players).filter(p => p.deptCode === dept.code).length;
      const participationRate = Math.min(1, playedCount / (dept.studentCount * 0.7));

      // Grand Composite Score: Offensive Battleship + Connect4 + Stacking + Attendance
      const grandScore = Math.round(
        (bScore * 1.5) + 
        (cScore * 1.5) + 
        (avgStack * 25) + 
        (participationRate * 500)
      );

      return {
        deptCode: dept.code,
        deptName: dept.name,
        deptAbbr: dept.abbr,
        themeColor: dept.themeColor,
        battleshipRank: 1,
        battleshipScore: bScore,
        battleshipFragmentsFound: bFragmentsFound,
        connect4Rank: 1,
        connect4Score: cScore,
        stackRank: 1,
        stackScore: avgStack,
        participationCount: playedCount,
        participationRate: Math.round(participationRate * 100),
        grandScore,
        overallRank: 1
      };
    });

    // Rank Battleship (Highest attack points & enemy bases found leads)
    const hasAnyBattleship = list.some(d => d.battleshipScore > 0 || d.battleshipFragmentsFound > 0);
    list.sort((a, b) => b.battleshipScore - a.battleshipScore || b.battleshipFragmentsFound - a.battleshipFragmentsFound);
    list.forEach((item, idx) => {
      item.battleshipRank = hasAnyBattleship && (item.battleshipScore > 0 || item.battleshipFragmentsFound > 0) ? idx + 1 : 0;
    });

    const hasAnyConnect4 = list.some(d => d.connect4Score > 0);
    list.sort((a, b) => b.connect4Score - a.connect4Score);
    list.forEach((item, idx) => {
      item.connect4Rank = hasAnyConnect4 && item.connect4Score > 0 ? idx + 1 : 0;
    });

    const hasAnyStack = list.some(d => d.stackScore > 0);
    list.sort((a, b) => b.stackScore - a.stackScore);
    list.forEach((item, idx) => {
      item.stackRank = hasAnyStack && item.stackScore > 0 ? idx + 1 : 0;
    });

    const hasAnyGrand = list.some(d => d.grandScore > 0);
    list.sort((a, b) => b.grandScore - a.grandScore);
    list.forEach((item, idx) => {
      item.overallRank = hasAnyGrand && item.grandScore > 0 ? idx + 1 : 0;
    });

    return list;
  }

  public getSnapshot(): ServerStateSnapshot {
    return {
      battleship: this.battleship,
      connect4: this.connect4,
      stackerTopRecords: this.stackerTopRecords.slice(0, 15),
      pollStats: this.pollStats,
      overallLeaderboard: this.getOverallLeaderboard(),
      recentActivities: this.activities.slice(-12),
      stats: {
        totalStudentsRegistered: Object.keys(this.players).length,
        totalPlayed: Object.values(this.players).filter(p => p.status === 'COMPLETED').length,
        day: this.day
      }
    };
  }

  private addActivity(text: string, type: ActivityEvent['type'], deptCode?: DepartmentCode) {
    const activity: ActivityEvent = {
      id: `ACT_${Date.now()}_${Math.random()}`,
      text,
      type,
      deptCode,
      timestamp: Date.now()
    };
    this.activities.push(activity);
    if (this.activities.length > 50) this.activities.shift();
    dbSaveActivity(activity);
  }

  // --- Persistence IO (Dual: Neon DB + local fallback) ---
  private saveState() {
    try {
      const data = {
        battleship: this.battleship,
        connect4: this.connect4,
        stackerTopRecords: this.stackerTopRecords,
        pollStats: this.pollStats,
        players: this.players,
        activities: this.activities,
        day: this.day
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

      if (isNeonConnected()) {
        dbSaveGameState({
          day: this.day,
          battleship: this.battleship,
          connect4: this.connect4,
          pollStats: this.pollStats
        });
      }
    } catch (err) {
      console.error('Failed to save DB state:', err);
    }
  }

  private async loadState() {
    if (isNeonConnected()) {
      try {
        const neonGameState = await dbLoadGameState();
        const neonPlayers = await dbLoadAllPlayers();
        const neonStackers = await dbLoadStackerRecords();
        const neonActivities = await dbLoadActivities();

        if (neonGameState) {
          this.day = neonGameState.day;
          this.battleship = neonGameState.battleship;
          if (!this.battleship.deptScores) {
            this.battleship.deptScores = {} as any;
            DEPARTMENT_LIST.forEach((d) => {
              this.battleship.deptScores[d.code] = { fragmentsFoundCount: 0, attackScore: 0, friendlyFireCount: 0 };
            });
          }
          this.connect4 = neonGameState.connect4;
          this.pollStats = neonGameState.pollStats;
          this.players = neonPlayers;
          this.stackerTopRecords = neonStackers;
          this.activities = neonActivities;
          console.log(`🌐 Successfully loaded state from Neon DB (${Object.keys(this.players).length} players).`);
          return;
        }
      } catch (err) {
        console.error('Failed to load from Neon DB, falling back to local storage:', err);
      }
    }

    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        const data = JSON.parse(raw);
        if (data.battleship) {
          this.battleship = data.battleship;
          if (!this.battleship.deptScores) {
            this.battleship.deptScores = {} as any;
            DEPARTMENT_LIST.forEach((d) => {
              this.battleship.deptScores[d.code] = { fragmentsFoundCount: 0, attackScore: 0, friendlyFireCount: 0 };
            });
          }
        }
        if (data.connect4) this.connect4 = data.connect4;
        if (data.stackerTopRecords) this.stackerTopRecords = data.stackerTopRecords;
        if (data.pollStats) this.pollStats = data.pollStats;
        if (data.players) this.players = data.players;
        if (data.activities) this.activities = data.activities;
        if (data.day) this.day = data.day;
        console.log('Successfully loaded persisted local database state.');
      }
    } catch (err) {
      console.error('Could not load local DB state, starting fresh:', err);
    }
  }

  public async resetAll() {
    this.battleship = this.initBattleship();
    this.connect4 = this.initConnect4();
    this.stackerTopRecords = [];
    this.pollStats = { q1: {}, q2: {}, q3: {}, totalVotes: 0 };
    this.players = {};
    this.activities = [];
    this.saveState();
    if (isNeonConnected()) {
      await dbResetAll();
    }
  }
}

export const gameEngine = new GameEngine();
