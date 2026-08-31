import React, { useState, useRef, useEffect } from 'react';
import { Target, CloudRain, AlertCircle, ArrowRight, ShieldCheck, Flame, Waves, Move } from 'lucide-react';
import { BattleshipState, ParsedStudent, DepartmentCode } from '../types';
import { DEPARTMENTS } from '../data/departments';
import { sound } from '../utils/sound';
import { vibrate, vibratePattern } from '../utils/haptics';
import { apiFetch } from '../config';

interface BattleshipStageProps {
  student: ParsedStudent;
  initialState: BattleshipState;
  remainingAP: number;
  onMoveComplete: (result: {
    x: number;
    y: number;
    action: 'ATTACK' | 'HIDE';
    resultType: string;
    hitDept?: DepartmentCode;
    points?: number;
    message: string;
    newState: BattleshipState;
  }) => void;
  onAdvanceToNextStage: () => void;
}

export const BattleshipStage: React.FC<BattleshipStageProps> = ({
  student,
  initialState,
  remainingAP,
  onMoveComplete,
  onAdvanceToNextStage
}) => {
  const [mode, setMode] = useState<'ATTACK' | 'HIDE'>('ATTACK');
  const [ap, setAp] = useState(remainingAP);
  const [state, setState] = useState<BattleshipState>(initialState);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'danger' | 'info' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  const gridSize = state.gridSize || 35;

  useEffect(() => {
    setState(initialState);
  }, [initialState]);

  // Center the scroll view on initial load
  useEffect(() => {
    if (gridContainerRef.current) {
      gridContainerRef.current.scrollLeft = (gridContainerRef.current.scrollWidth - gridContainerRef.current.clientWidth) / 2;
      gridContainerRef.current.scrollTop = (gridContainerRef.current.scrollHeight - gridContainerRef.current.clientHeight) / 2;
    }
  }, []);

  const handleCellClick = async (x: number, y: number) => {
    if (ap <= 0 || isSubmitting) return;
    const key = `${x},${y}`;

    if (mode === 'HIDE') {
      const revealed = state.revealedTiles[key];
      if (!revealed) {
        setFeedback({ text: 'শুধুমাত্র ইতিমধ্যে উন্মোচিত হওয়া বেস লুকানো যাবে!', type: 'info' });
        sound.playPop(250);
        return;
      }
      if (revealed.deptCode !== student.deptCode) {
        setFeedback({ text: 'অন্য ডিপার্টমেন্টের বেস তুমি লুকাতে পারবে না!', type: 'danger' });
        sound.playBuzzer();
        vibratePattern([50, 50, 50]);
        return;
      }
    } else {
      // ATTACK MODE
      if (state.exploredWater.includes(key) || state.revealedTiles[key]) {
        setFeedback({ text: 'এই অংশটি ইতিমধ্যে সার্চ করা হয়েছে (নীল পানি / বেস)!', type: 'info' });
        sound.playPop(300);
        return;
      }
    }

    setIsSubmitting(true);
    sound.playPop(500);
    vibrate(20);

    try {
      const res = await apiFetch('/api/battleship/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.studentId,
          x,
          y,
          action: mode
        })
      });

      const data = await res.json();
      if (data.success) {
        setAp(prev => prev - 1);
        if (data.state?.battleship) {
          setState(data.state.battleship);
        }

        if (mode === 'HIDE') {
          sound.playSmokePuff();
          setFeedback({ text: '🌫️ বেস সফলভাবে ধোঁয়ার আড়ালে লুকানো হয়েছে!', type: 'success' });
        } else {
          if (data.result === 'HIT') {
            sound.playExplosion();
            vibratePattern([100, 50, 100]);
            setFeedback({ text: data.message, type: 'success' });
          } else if (data.result === 'FRIENDLY_FIRE') {
            sound.playBuzzer();
            vibratePattern([200, 100, 200]);
            setFeedback({ text: data.message, type: 'danger' });
          } else {
            sound.playExplosion();
            setFeedback({ text: 'খালি সাগরে আঘাত লেগেছে (নীল পানি উন্মোচিত)!', type: 'info' });
          }
        }

        onMoveComplete({
          x,
          y,
          action: mode,
          resultType: data.result,
          hitDept: data.hitDept,
          points: data.points,
          message: data.message,
          newState: data.state?.battleship || state
        });
      } else {
        setFeedback({ text: data.message || 'চাল সম্পন্ন করা যায়নি', type: 'danger' });
      }
    } catch {
      setFeedback({ text: 'সার্ভারের সাথে সংযোগ বিচ্ছিন্ন হয়েছে', type: 'danger' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCellStatus = (x: number, y: number) => {
    const key = `${x},${y}`;
    const revealed = state.revealedTiles[key];
    const isWater = state.exploredWater.includes(key);

    if (revealed) {
      const isOwn = revealed.deptCode === student.deptCode;
      const dept = DEPARTMENTS[revealed.deptCode];
      return {
        type: isOwn ? 'EXPOSED_OWN' : 'EXPOSED_ENEMY',
        deptCode: revealed.deptCode,
        deptAbbr: dept?.abbr || revealed.deptCode,
        themeColor: dept?.themeColor || '#FF5964',
        textColor: dept?.textColor || '#FFFFFF'
      };
    }

    if (isWater) {
      return { type: 'EXPLORED_WATER' };
    }

    return { type: 'FOG' };
  };

  const ownExposedCount = Object.values(state.revealedTiles).filter(
    r => r.deptCode === student.deptCode
  ).length;

  return (
    <div className="w-full h-full flex flex-col justify-between gap-1.5 animate-bounce-in overflow-hidden">
      {/* 1. Top Banner: AP Tracker */}
      <div className="w-full pop-box p-2.5 bg-white flex items-center justify-between shadow-pop-sm flex-shrink-0">
        <div>
          <span className="text-[11px] font-bold text-gray-500 font-bangla block leading-none">স্টেপ ১: গুপ্ত বনাম প্রকাশ্য</span>
          <h2 className="text-sm sm:text-base font-black font-bangla text-[#1E232A] mt-0.5">
            {mode === 'ATTACK' ? 'গুপ্ত ঘাঁটি খুঁজো' : 'নিজের ঘাঁটি লুকাও'}
          </h2>
        </div>

        {/* AP Counter Badges */}
        <div className="flex items-center space-x-1.5 bg-[#FFF9D2] px-2.5 py-1 rounded-xl border-2 border-[#1E232A]">
          <span className="text-xs font-black font-bangla text-[#1E232A]">চাল:</span>
          <div className="flex space-x-1">
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                className={`w-3.5 h-3.5 rounded-full border-2 border-[#1E232A] transition-all ${
                  i <= ap ? 'bg-[#FF6B6B] scale-110 shadow-xs' : 'bg-gray-300 opacity-40'
                }`} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* 2. Mode Selector Toggle */}
      <div className="w-full grid grid-cols-2 gap-1.5 flex-shrink-0">
        <button
          onClick={() => { sound.playPop(); setMode('ATTACK'); }}
          className={`py-2 px-2 rounded-xl font-black text-xs sm:text-sm font-bangla flex items-center justify-center space-x-1.5 border-3 border-[#1E232A] shadow-pop-sm transition-all cursor-pointer ${
            mode === 'ATTACK' 
              ? 'bg-[#FF6B6B] text-white -translate-y-0.5' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>🎯 আক্রমণ (ATTACK)</span>
        </button>

        <button
          onClick={() => { sound.playPop(); setMode('HIDE'); }}
          className={`py-2 px-2 rounded-xl font-black text-xs sm:text-sm font-bangla flex items-center justify-center space-x-1.5 border-3 border-[#1E232A] shadow-pop-sm transition-all cursor-pointer ${
            mode === 'HIDE' 
              ? 'bg-[#4ECDC4] text-[#1E232A] -translate-y-0.5' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <CloudRain className="w-3.5 h-3.5" />
          <span>🌫️ লুকাও ({ownExposedCount})</span>
        </button>
      </div>

      {/* 3. Visual Color Legend */}
      <div className="w-full grid grid-cols-3 gap-1 text-[9px] font-bangla font-bold flex-shrink-0">
        <div className="bg-[#1A252F] text-gray-300 py-1 px-1.5 rounded-xl border-2 border-[#1E232A] flex items-center space-x-1 justify-center">
          <span className="w-2 h-2 rounded-full bg-[#2C3A47] border border-gray-500 inline-block"></span>
          <span>কুয়াশা</span>
        </div>

        <div className="bg-[#E0F7FA] text-[#006064] py-1 px-1.5 rounded-xl border-2 border-[#00BCD4] flex items-center space-x-1 justify-center">
          <span className="w-2 h-2 rounded-full bg-[#4DD0E1] border border-[#00838F] inline-block"></span>
          <span>ব্যর্থ অভিযান</span>
        </div>

        <div className="bg-[#FFF2DC] text-[#D67229] py-1 px-1.5 rounded-xl border-2 border-[#FFA931] flex items-center space-x-1 justify-center">
          <span className="w-2 h-2 rounded-full bg-[#FF5964] border border-[#1E232A] inline-block"></span>
          <span>Exposed!</span>
        </div>
      </div>

      {/* 4. Interactive 35x35 Grid Viewport (Fills remaining middle space) */}
      <div className="w-full flex-1 min-h-0 pop-box p-2 bg-[#2C3E50] border-3.5 border-[#1E232A] relative flex flex-col shadow-pop overflow-hidden">
        <div className="flex items-center justify-between px-1 pb-1 text-[9px] text-gray-300 font-bangla font-bold flex-shrink-0">
          <span className="flex items-center space-x-1">
            <Move className="w-3 h-3 text-cyan-300 animate-pulse" />
            <span>আঙুল দিয়ে টেনে ম্যাপে ঘুরতে পারবে</span>
          </span>
          <span className="text-gray-400">৩৫×৩৫ গ্রিড</span>
        </div>

        <div 
          ref={gridContainerRef}
          style={{
            width: '100%',
            maxWidth: '100%',
            overflowX: 'auto',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}
          className="flex-1 min-h-0 w-full rounded-xl bg-[#1A252F] border-2 border-[#1E232A] relative scroll-smooth cursor-crosshair touch-pan-x touch-pan-y"
        >
          <div 
            className="grid gap-[2px] p-2"
            style={{
              display: 'inline-grid',
              width: 'max-content',
              minWidth: 'max-content',
              gridTemplateColumns: `repeat(${gridSize}, 26px)`,
              gridTemplateRows: `repeat(${gridSize}, 26px)`
            }}
          >
            {Array.from({ length: gridSize }).map((_, y) => 
              Array.from({ length: gridSize }).map((_, x) => {
                const status = getCellStatus(x, y);

                // 1. EXPOSED ENEMY BASE
                if (status.type === 'EXPOSED_ENEMY') {
                  return (
                    <div
                      key={`${x},${y}`}
                      className="w-[26px] h-[26px] rounded-md border-2 border-[#1E232A] flex items-center justify-center font-black text-[8px] shadow-sm select-none animate-bounce-in"
                      style={{ backgroundColor: status.themeColor, color: status.textColor }}
                      title={`Exposed ${status.deptAbbr} Base`}
                    >
                      {status.deptAbbr}
                    </div>
                  );
                }

                // 2. EXPOSED OWN BASE (Alert to Re-Hide)
                if (status.type === 'EXPOSED_OWN') {
                  return (
                    <button
                      key={`${x},${y}`}
                      onClick={() => handleCellClick(x, y)}
                      disabled={isSubmitting || ap <= 0}
                      className="w-[26px] h-[26px] rounded-md border-2 border-red-500 bg-[#FF5964] text-white flex items-center justify-center font-black text-[8px] animate-pulse-glow cursor-pointer"
                      title="নিজের উন্মোচিত বেস! ট্যাপ করে লুকান"
                    >
                      {status.deptAbbr}
                    </button>
                  );
                }

                // 3. EXPLORED BLANK WATER
                if (status.type === 'EXPLORED_WATER') {
                  return (
                    <div
                      key={`${x},${y}`}
                      className="w-[26px] h-[26px] rounded-md bg-[#4DD0E1] border border-[#00ACC1] flex items-center justify-center text-[9px] font-black text-[#006064] select-none shadow-inner"
                      title="Explored Empty Water"
                    >
                      〰️
                    </div>
                  );
                }

                // 4. UNEXPLORED FOG
                return (
                  <button
                    key={`${x},${y}`}
                    onClick={() => handleCellClick(x, y)}
                    disabled={isSubmitting || ap <= 0}
                    className="w-[26px] h-[26px] rounded-md bg-[#2C3A47] hover:bg-[#3D4D5C] active:bg-[#4E6173] border border-[#1E232A]/60 transition-colors flex items-center justify-center text-[8px] text-gray-400 font-bold active:scale-95 cursor-pointer"
                  >
                    ☁️
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 5. Live Feedback Alert (if active) */}
      {feedback && (
        <div className={`w-full p-2 rounded-xl border-2 border-[#1E232A] shadow-pop-sm flex items-center space-x-2 text-xs font-bold font-bangla animate-bounce-in flex-shrink-0 ${
          feedback.type === 'success' ? 'bg-[#D4F8F0] text-[#00897B]' :
          feedback.type === 'danger' ? 'bg-[#FFE0E2] text-[#D32F2F]' :
          'bg-[#FFF9D2] text-[#8D6E63]'
        }`}>
          {feedback.type === 'success' ? <Flame className="w-4 h-4 text-emerald-600 flex-shrink-0" /> :
           feedback.type === 'danger' ? <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" /> :
           <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />}
          <span className="flex-1 leading-tight">{feedback.text}</span>
        </div>
      )}

      {/* 6. Bottom Advancement Button */}
      <div className="w-full flex-shrink-0">
        {ap === 0 ? (
          <button
            onClick={() => { sound.playPop(); onAdvanceToNextStage(); }}
            className="pop-btn w-full py-3.5 bg-[#6BCB77] text-[#1E232A] font-black text-sm sm:text-base font-bangla flex items-center justify-center space-x-2 animate-bounce shadow-pop cursor-pointer"
          >
            <span>৩টি চাল শেষ! পরের গেম এ যাও</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="text-center font-bangla text-xs font-bold text-gray-800 py-1 bg-white/60 rounded-xl border border-[#1E232A]/20">
            বাকি চাল: <strong className="text-red-600 font-black text-sm">{ap} টি</strong> (চাল শেষ হলে পরবর্তী গেমে যেতে পারবে)
          </div>
        )}
      </div>
    </div>
  );
};
