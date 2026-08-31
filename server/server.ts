import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { gameEngine } from './gameEngine';
import { isNeonConnected } from './db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Middleware to ensure GameEngine state is ready before API processing
app.use(async (req, res, next) => {
  await gameEngine.isReady;
  next();
});

// Health Check for Render & uptime monitoring
app.get('/health', (req, res) => {
  return res.json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() });
});

app.get('/api/health', (req, res) => {
  return res.json({
    status: 'online',
    uptime: process.uptime(),
    database: isNeonConnected() ? 'Neon PostgreSQL (Cloud)' : 'Local JSON Fallback',
    playersCount: Object.keys(gameEngine.players).length,
    timestamp: Date.now()
  });
});

// 1. Stall Coordinator Authorizes Student ID (via Web Desk or RFID Terminal)
app.post('/api/auth/register', (req, res) => {
  const { studentId, rfid } = req.body;
  if (!studentId) {
    return res.status(400).json({ success: false, message: 'Student ID আবশ্যক!' });
  }

  const result = gameEngine.authorizeStudent(studentId, rfid);
  if (result.success) {
    io.emit('state:update', gameEngine.getSnapshot());
  }
  return res.json(result);
});

// 2. Fetch Player Status / Checkpoint by Student ID
app.get('/api/player/:studentId', (req, res) => {
  const { studentId } = req.params;
  const player = gameEngine.getPlayer(studentId);
  if (!player) {
    return res.status(404).json({ 
      success: false, 
      message: 'শিক্ষার্থীকে বুথে এখনো রেজিস্টার করা হয়নি! অনুগ্রহ করে বুথের প্রতিনিধির সাথে যোগাযোগ করুন।' 
    });
  }
  return res.json({ success: true, player });
});

// 2b. Fetch Player Status / Checkpoint by RFID Card Tag
app.get('/api/player/rfid/:rfid', (req, res) => {
  const { rfid } = req.params;
  const player = gameEngine.getPlayerByRfid(rfid);
  if (!player) {
    return res.status(404).json({ 
      success: false, 
      message: 'এই RFID কার্ডটি এখনো কোনো শিক্ষার্থীর আইডির সাথে যুক্ত করা হয়নি।' 
    });
  }
  return res.json({ success: true, player });
});

// Reset Single Player (for testing/replay)
app.post('/api/player/:studentId/reset', (req, res) => {
  const { studentId } = req.params;
  const result = gameEngine.resetPlayerForTest(studentId);
  if (result.success) {
    io.emit('state:update', gameEngine.getSnapshot());
  }
  return res.json(result);
});

// 3. Update Player Stage Checkpoint
app.post('/api/player/stage', (req, res) => {
  const { studentId, stage } = req.body;
  if (!studentId || !stage) {
    return res.status(400).json({ success: false, message: 'Invalid payload' });
  }

  gameEngine.updatePlayerStage(studentId, stage);
  return res.json({ success: true });
});

// 4. Battleship 35x35 Action (Attack or Hide)
app.post('/api/battleship/move', (req, res) => {
  const { studentId, x, y, action } = req.body;
  if (!studentId || x === undefined || y === undefined || !action) {
    return res.status(400).json({ success: false, message: 'Invalid move parameters' });
  }

  const result = gameEngine.handleBattleshipMove(studentId, x, y, action);
  if (result.success) {
    io.emit('state:update', gameEngine.getSnapshot());
  }
  return res.json(result);
});

// 5. Connect 4 Token Drop
app.post('/api/connect4/drop', (req, res) => {
  const { studentId, col } = req.body;
  if (!studentId || col === undefined) {
    return res.status(400).json({ success: false, message: 'Invalid column' });
  }

  const result = gameEngine.handleConnect4Drop(studentId, col);
  if (result.success) {
    io.emit('state:update', gameEngine.getSnapshot());
  }
  return res.json(result);
});

// 6. Stacker Survival Score
app.post('/api/stacker/finish', (req, res) => {
  const { studentId, floors, combos } = req.body;
  if (!studentId || floors === undefined) {
    return res.status(400).json({ success: false, message: 'Invalid stacker score' });
  }

  const result = gameEngine.handleStackerComplete(studentId, floors, combos || 0);
  if (result.success) {
    io.emit('state:update', gameEngine.getSnapshot());
  }
  return res.json(result);
});

// 7. Spicy Fest Poll Submit
app.post('/api/poll/submit', (req, res) => {
  const { studentId, answers } = req.body;
  if (!studentId || !answers) {
    return res.status(400).json({ success: false, message: 'Invalid poll answers' });
  }

  const result = gameEngine.handlePollSubmit(studentId, answers);
  if (result.success) {
    io.emit('state:update', gameEngine.getSnapshot());
  }
  return res.json(result);
});

// 8. Full Snapshot for Screens / Projectors
app.get('/api/state', (req, res) => {
  return res.json(gameEngine.getSnapshot());
});

// 9. Admin Controls (List Registered Students, Reset, Toggle Day)
app.get('/api/admin/players', (req, res) => {
  const players = Object.values(gameEngine.players).sort((a, b) => {
    const timeA = a.registeredAt ? new Date(a.registeredAt).getTime() : 0;
    const timeB = b.registeredAt ? new Date(b.registeredAt).getTime() : 0;
    return timeB - timeA;
  });
  return res.json({ success: true, count: players.length, players });
});

app.post('/api/admin/reset', async (req, res) => {
  await gameEngine.resetAll();
  io.emit('state:update', gameEngine.getSnapshot());
  return res.json({ success: true, message: 'বোর্ড রিসেট সফল হয়েছে!' });
});

app.post('/api/admin/day', (req, res) => {
  const { day } = req.body;
  if (day === 1 || day === 2) {
    gameEngine.day = day;
    io.emit('state:update', gameEngine.getSnapshot());
    return res.json({ success: true, day });
  }
  return res.status(400).json({ success: false, message: 'Invalid day' });
});

// Serve static frontend files if built
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// SPA Fallback handler
app.use((req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.send('API server is running.');
    }
  });
});

// --- Socket.IO Real-time Connection ---
io.on('connection', (socket) => {
  socket.emit('state:update', gameEngine.getSnapshot());
});

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, async () => {
  await gameEngine.isReady;
  console.log(`🎮 Department Clash Server running on http://${HOST}:${PORT}`);
  console.log(`📦 Database mode: ${isNeonConnected() ? '🌐 Neon PostgreSQL (Online Cloud)' : '💾 Local Fallback (server/db.json)'}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
