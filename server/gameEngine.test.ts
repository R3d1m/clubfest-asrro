import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from './gameEngine.js';

describe('GameEngine Unit Tests', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
    engine.resetAll();
  });

  describe('Student Authorization & ID Parsing', () => {
    it('authorizes a valid student ID correctly', () => {
      const res = engine.authorizeStudent('2204055');
      assert.equal(res.success, true);
      assert.ok(res.player);
      assert.equal(res.player.studentId, '2204055');
      assert.equal(res.player.batch, '22');
      assert.equal(res.player.deptCode, '04');
      assert.equal(res.player.roll, '055');
      assert.equal(res.player.status, 'AUTHORIZED');
      assert.equal(res.player.battleshipAP, 3);
    });

    it('rejects an invalid or short student ID', () => {
      const res = engine.authorizeStudent('123');
      assert.equal(res.success, false);
    });

    it('rejects an ID with unknown department code', () => {
      const res = engine.authorizeStudent('2299055');
      assert.equal(res.success, false);
      assert.match(res.message, /অপরিচিত ডিপার্টমেন্ট কোড/);
    });

    it('retrieves an existing player by ID', () => {
      engine.authorizeStudent('2204055');
      const player = engine.getPlayer('2204055');
      assert.ok(player);
      assert.equal(player.studentId, '2204055');
    });
  });

  describe('Battleship Mechanics', () => {
    it('processes attack move on empty water', () => {
      engine.authorizeStudent('2204055');
      
      // Find a coordinate not occupied by any fragment
      const occupiedCoords = new Set<string>();
      engine.battleship.fragments.forEach(f => {
        f.tiles.forEach(([x, y]) => occupiedCoords.add(`${x},${y}`));
      });

      let waterX = 0, waterY = 0;
      for (let x = 0; x < 35; x++) {
        for (let y = 0; y < 35; y++) {
          if (!occupiedCoords.has(`${x},${y}`)) {
            waterX = x;
            waterY = y;
            break;
          }
        }
      }

      const res = engine.handleBattleshipMove('2204055', waterX, waterY, 'ATTACK');
      assert.equal(res.success, true);
      assert.equal(res.result, 'MISS');
      assert.ok(engine.battleship.exploredWater.includes(`${waterX},${waterY}`));
    });

    it('processes attack move on enemy base tile (HIT)', () => {
      engine.authorizeStudent('2204055'); // Dept 04 (ME)
      
      // Find a fragment belonging to a different department
      const enemyFrag = engine.battleship.fragments.find(f => f.deptCode !== '04');
      assert.ok(enemyFrag);

      const [hitX, hitY] = enemyFrag.tiles[0];
      const res = engine.handleBattleshipMove('2204055', hitX, hitY, 'ATTACK');
      assert.equal(res.success, true);
      assert.equal(res.result, 'HIT');
      assert.ok(engine.battleship.revealedTiles[`${hitX},${hitY}`]);
    });

    it('decrements AP and enforces maximum 3 moves per player', () => {
      engine.authorizeStudent('2204055');

      engine.handleBattleshipMove('2204055', 0, 0, 'ATTACK');
      engine.handleBattleshipMove('2204055', 0, 1, 'ATTACK');
      engine.handleBattleshipMove('2204055', 0, 2, 'ATTACK');

      const player = engine.getPlayer('2204055');
      assert.equal(player?.battleshipAP, 0);

      // 4th move should fail
      const extraMove = engine.handleBattleshipMove('2204055', 0, 3, 'ATTACK');
      assert.equal(extraMove.success, false);
      assert.match(extraMove.message, /সব চাল শেষ/);
    });
  });

  describe('Connect-4 Mechanics', () => {
    it('drops token into the bottom-most empty row of column', () => {
      engine.authorizeStudent('2204055');
      const res = engine.handleConnect4Drop('2204055', 3);
      assert.equal(res.success, true);
      assert.equal(res.row, 9); // 10 rows (0-9), bottom row is 9
      assert.equal(engine.connect4.grid[3][9]?.deptCode, '04');
    });

    it('stacks subsequent tokens on top of each other', () => {
      engine.authorizeStudent('2204055');
      engine.handleConnect4Drop('2204055', 3);

      engine.authorizeStudent('2201011');
      const res2 = engine.handleConnect4Drop('2201011', 3);
      assert.equal(res2.success, true);
      assert.equal(res2.row, 8);
      assert.equal(engine.connect4.grid[3][8]?.deptCode, '01');
    });
  });

  describe('Stacker & Poll Logic', () => {
    it('records stacker scores and updates high score list', () => {
      engine.authorizeStudent('2204055');
      const res = engine.handleStackerComplete('2204055', 42, 5);
      assert.equal(res.success, true);
      assert.equal(engine.stackerTopRecords.length, 1);
      assert.equal(engine.stackerTopRecords[0].floors, 42);
      assert.equal(engine.stackerTopRecords[0].combos, 5);
    });

    it('records and tallies spicy poll submissions', () => {
      engine.authorizeStudent('2204055');
      const res = engine.handlePollSubmit('2204055', {
        q1: 'URP',
        q2: 'CSE',
        q3: 'EEE'
      });
      assert.equal(res.success, true);
      assert.equal(engine.pollStats.totalVotes, 1);
      assert.equal(engine.pollStats.q1['URP'], 1);
      assert.equal(engine.pollStats.q2['CSE'], 1);
    });
  });

  describe('Snapshot State & Leaderboard', () => {
    it('generates a full valid server snapshot', () => {
      engine.authorizeStudent('2204055');
      const snap = engine.getSnapshot();

      assert.ok(snap.battleship);
      assert.ok(snap.connect4);
      assert.ok(Array.isArray(snap.overallLeaderboard));
      assert.equal(snap.overallLeaderboard.length, 12);
      assert.ok(snap.stats);
      assert.equal(snap.stats.totalStudentsRegistered, 1);
    });
  });
});
