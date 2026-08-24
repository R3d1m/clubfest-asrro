import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Shield, Sparkles, Trophy, LogIn, AlertCircle, RefreshCw } from 'lucide-react';
import { 
  ParsedStudent, 
  PlayerRecord, 
  PlayerStage, 
  ServerStateSnapshot 
} from './types';
import { parseStudentID } from './data/departments';
import { sound } from './utils/sound';
import { vibrate } from './utils/haptics';

import { Header } from './components/Header';
import { BanglaBriefing } from './components/BanglaBriefing';
import { BattleshipStage } from './components/BattleshipStage';
import { Connect4Stage } from './components/Connect4Stage';
import { StackerStage } from './components/StackerStage';
import { PollStage } from './components/PollStage';
import { HeroSummary } from './components/HeroSummary';
import { AdminDesk } from './components/AdminDesk';
import { SpectatorScreen } from './components/SpectatorScreen';

export const App: React.FC = () => {
  const [view, setView] = useState<'PLAYER' | 'ADMIN' | 'SCREEN'>('PLAYER');
  const [studentIdInput, setStudentIdInput] = useState('');
  const [parsedStudent, setParsedStudent] = useState<ParsedStudent | null>(null);
  const [playerRecord, setPlayerRecord] = useState<PlayerRecord | null>(null);
  const [currentStage, setCurrentStage] = useState<PlayerStage>('LOGIN');
  const [serverState, setServerState] = useState<ServerStateSnapshot | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);

  // Socket Connection
  useEffect(() => {
    const socket: Socket = io();

    socket.on('state:update', (data: ServerStateSnapshot) => {
      setServerState(data);
    });

    // Check URL parameters for view routing (e.g. ?view=admin or ?view=screen)
    const params = new URLSearchParams(window.location.search);
    const urlView = params.get('view');
    if (urlView === 'admin') setView('ADMIN');
    if (urlView === 'screen') setView('SCREEN');

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleIdInputChange = (val: string) => {
    setStudentIdInput(val);
    setLoginError(null);
    if (val.trim().length >= 6) {
      try {
        const parsed = parseStudentID(val.trim());
        setParsedStudent(parsed);
      } catch {
        setParsedStudent(null);
      }
    } else {
      setParsedStudent(null);
    }
  };

  const handleStudentLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!studentIdInput.trim() || isLoading) return;

    setIsLoading(true);
    sound.playPop();
    setLoginError(null);

    try {
      const res = await fetch(`/api/player/${studentIdInput.trim()}`);
      const data = await res.json();

      if (data.success && data.player) {
        const p: PlayerRecord = data.player;
        setPlayerRecord(p);
        const parsed = parseStudentID(p.studentId);
        setParsedStudent(parsed);

        // Resume at their exact stage checkpoint
        if (p.status === 'COMPLETED') {
          setCurrentStage('COMPLETED');
        } else {
          setCurrentStage(p.currentStage || 'BRIEFING');
        }

        sound.playStreakChime();
        vibrate(25);
      } else {
        sound.playBuzzer();
        setLoginError(data.message || 'শিক্ষার্থীকে বুথে এখনো রেজিস্টার করা হয়নি! অনুগ্রহ করে বুথের প্রতিনিধির সাথে যোগাযোগ করুন।');
      }
    } catch {
      setLoginError('সার্ভারের সাথে সংযোগ স্থাপন করা যাচ্ছে না। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStage = async (nextStage: PlayerStage) => {
    if (!playerRecord) return;
    setCurrentStage(nextStage);
    try {
      await fetch('/api/player/stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: playerRecord.studentId,
          stage: nextStage
        })
      });
    } catch (err) {
      console.error('Failed to update stage checkpoint:', err);
    }
  };

  // Render View Router
  if (view === 'ADMIN') {
    return <AdminDesk serverState={serverState} onBackToPlayer={() => setView('PLAYER')} />;
  }

  if (view === 'SCREEN') {
    return <SpectatorScreen serverState={serverState} onBackToPlayer={() => setView('PLAYER')} />;
  }

  return (
    <div className="min-h-screen bg-[#F9D342] flex flex-col font-bangla select-none">
      <Header
        student={parsedStudent}
        currentStage={currentStage}
        onOpenLeaderboard={() => setShowLeaderboardModal(true)}
      />

      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
        {/* STAGE 0: LOGIN & ID ENTRY */}
        {currentStage === 'LOGIN' && (
          <div className="w-full max-w-md p-4 space-y-4 animate-bounce-in">
            <div className="pop-box p-6 bg-[#FFFBEB] border-4 border-[#1E232A] shadow-pop-lg text-center space-y-5">
              {/* Logo / Badge */}
              <div className="w-20 h-20 mx-auto rounded-3xl bg-[#FFE66D] border-4 border-[#1E232A] shadow-pop flex flex-col items-center justify-center animate-bounce">
                <span className="text-3xl">🎮</span>
                <span className="text-[10px] font-black text-[#1E232A] mt-0.5">FEST ARENA</span>
              </div>

              <div>
                <h2 className="text-2xl font-black text-[#1E232A] leading-tight">
                  ডিপার্টমেন্ট ক্ল্যাশ ২০২৬
                </h2>
                <p className="text-xs font-bold text-gray-600 mt-1">
                  বুথে অনুমোদিত স্টুডেন্ট আইডি প্রবেশ করান:
                </p>
              </div>

              <form onSubmit={handleStudentLogin} className="space-y-3">
                <div>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 2204055"
                    value={studentIdInput}
                    onChange={(e) => handleIdInputChange(e.target.value)}
                    className="w-full text-center text-2xl font-black font-display tracking-widest px-4 py-3.5 bg-white border-3 border-[#1E232A] rounded-2xl shadow-pop-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                    autoFocus
                  />
                </div>

                {/* Auto-Decoded Preview */}
                {parsedStudent && (
                  <div 
                    className="p-3 rounded-xl border-2 border-[#1E232A] text-left text-xs font-black flex items-center justify-between animate-bounce-in shadow-pop-sm"
                    style={{ backgroundColor: parsedStudent.lightColor, color: '#1E232A' }}
                  >
                    <div>
                      <span className="block text-[10px] text-gray-500">শনাক্তকৃত ডিপার্টমেন্ট:</span>
                      <span className="text-sm font-black">{parsedStudent.deptName} ({parsedStudent.deptAbbr})</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] text-gray-500">ব্যাচ:</span>
                      <span className="text-sm font-black">{parsedStudent.batchShort} ব্যাচ</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!parsedStudent || isLoading}
                  className={`pop-btn w-full py-3.5 font-black text-base flex items-center justify-center space-x-2 transition-all ${
                    parsedStudent && !isLoading
                      ? 'bg-[#4ECDC4] text-[#1E232A] shadow-pop hover:bg-[#3dbdb5]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                  }`}
                >
                  <LogIn className="w-5 h-5" />
                  <span>{isLoading ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন ও খেলুন'}</span>
                  <Sparkles className="w-4 h-4 text-[#F9D342]" />
                </button>
              </form>

              {loginError && (
                <div className="p-3 bg-[#FFE0E2] border-2 border-[#FF5964] rounded-xl text-xs font-bold text-[#D32F2F] flex items-start space-x-2 text-left animate-bounce-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}
            </div>

            {/* Quick Portal Switchers */}
            <div className="flex justify-center space-x-3 pt-2">
              <button
                onClick={() => setView('ADMIN')}
                className="pop-btn-sm px-3 py-1.5 bg-white text-xs font-black text-[#1E232A] flex items-center space-x-1"
              >
                <Shield className="w-3.5 h-3.5 text-purple-600" />
                <span>বুথ অ্যাডমিন ডেস্ক</span>
              </button>

              <button
                onClick={() => setView('SCREEN')}
                className="pop-btn-sm px-3 py-1.5 bg-white text-xs font-black text-[#1E232A] flex items-center space-x-1"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>প্রজেক্টর স্ক্রিন</span>
              </button>
            </div>
          </div>
        )}

        {/* STAGE: BRIEFING */}
        {currentStage === 'BRIEFING' && parsedStudent && (
          <BanglaBriefing
            student={parsedStudent}
            onStart={() => updateStage('STAGE_1_BATTLESHIP')}
          />
        )}

        {/* STAGE 1: BATTLESHIP */}
        {currentStage === 'STAGE_1_BATTLESHIP' && parsedStudent && serverState && (
          <BattleshipStage
            student={parsedStudent}
            initialState={serverState.battleship}
            remainingAP={playerRecord?.battleshipAP ?? 3}
            onMoveComplete={(res) => {
              if (playerRecord) {
                playerRecord.battleshipAP--;
                playerRecord.battleshipMoves.push({
                  x: res.x,
                  y: res.y,
                  action: res.action,
                  result: res.resultType as any
                });
              }
            }}
            onAdvanceToNextStage={() => updateStage('STAGE_2_CONNECT4')}
          />
        )}

        {/* STAGE 2: CONNECT 4 */}
        {currentStage === 'STAGE_2_CONNECT4' && parsedStudent && serverState && (
          <Connect4Stage
            student={parsedStudent}
            initialState={serverState.connect4}
            alreadyPlayedCol={playerRecord?.connect4Col ?? null}
            onDropComplete={(res) => {
              if (playerRecord) {
                playerRecord.connect4Col = res.col;
                if (res.streakEarned) {
                  playerRecord.totalPointsEarned += res.points;
                }
              }
            }}
            onAdvanceToNextStage={() => updateStage('STAGE_3_STACK')}
          />
        )}

        {/* STAGE 3: STACKER */}
        {currentStage === 'STAGE_3_STACK' && parsedStudent && (
          <StackerStage
            student={parsedStudent}
            onStackerComplete={(floors, combos) => {
              if (playerRecord) {
                playerRecord.stackFloors = floors;
                playerRecord.stackCombos = combos;
              }
            }}
            onAdvanceToNextStage={() => updateStage('STAGE_4_POLL')}
          />
        )}

        {/* STAGE 4: SPICY POLL */}
        {currentStage === 'STAGE_4_POLL' && parsedStudent && (
          <PollStage
            student={parsedStudent}
            onPollSubmit={(answers) => {
              if (playerRecord) {
                playerRecord.pollAnswers = answers;
                playerRecord.currentStage = 'COMPLETED';
                playerRecord.status = 'COMPLETED';
              }
              setCurrentStage('COMPLETED');
            }}
          />
        )}

        {/* STAGE: COMPLETED HERO CARD */}
        {currentStage === 'COMPLETED' && parsedStudent && playerRecord && (
          <HeroSummary
            student={parsedStudent}
            player={playerRecord}
            serverState={serverState}
            onOpenLeaderboard={() => setShowLeaderboardModal(true)}
            onReplay={() => {
              playerRecord.battleshipAP = 3;
              playerRecord.battleshipMoves = [];
              playerRecord.connect4Col = null;
              playerRecord.stackFloors = 0;
              playerRecord.stackCombos = 0;
              playerRecord.pollAnswers = {};
              playerRecord.totalPointsEarned = 0;
              playerRecord.status = 'IN_PROGRESS';
              playerRecord.currentStage = 'BRIEFING';
              setCurrentStage('BRIEFING');
            }}
          />
        )}
      </main>

      {/* Global Leaderboard Modal */}
      {showLeaderboardModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-bounce-in">
          <div className="pop-box w-full max-w-lg max-h-[85vh] bg-white p-5 border-4 border-[#1E232A] flex flex-col space-y-3 shadow-pop-lg">
            <div className="flex items-center justify-between border-b-3 border-[#1E232A] pb-2">
              <div className="flex items-center space-x-2">
                <Trophy className="w-6 h-6 text-amber-500" />
                <h3 className="text-lg font-black text-[#1E232A]">লাইভ লিডারবোর্ড</h3>
              </div>

              <button
                onClick={() => { sound.playPop(); setShowLeaderboardModal(false); }}
                className="w-8 h-8 rounded-xl bg-[#FF5964] text-white font-black border-2 border-[#1E232A] shadow-pop-sm flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {serverState?.overallLeaderboard.map((dept, idx) => (
                <div
                  key={dept.deptCode}
                  className="p-3 rounded-2xl border-2 border-[#1E232A] flex items-center justify-between shadow-pop-sm"
                  style={{ backgroundColor: idx === 0 ? '#FFE66D' : '#F8F9FA' }}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-display font-black text-sm w-6 text-center">
                      {idx === 0 ? '👑' : `#${idx + 1}`}
                    </span>
                    <div 
                      className="w-8 h-8 rounded-xl border-2 border-[#1E232A] flex items-center justify-center font-black text-xs text-white shadow-sm"
                      style={{ backgroundColor: dept.themeColor }}
                    >
                      {dept.deptAbbr}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#1E232A]">{dept.deptName}</h4>
                      <p className="text-[10px] text-gray-500 font-bold">
                        স্টিলথ: {dept.battleshipScore / 10}% • কানেক্ট-৪: +{dept.connect4Score}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-emerald-700 font-display block">
                      {dept.grandScore} Pts
                    </span>
                    <span className="text-[9px] text-gray-500 font-bold">
                      {dept.participationCount} জন খেলেছে
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
