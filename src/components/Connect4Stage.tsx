import React, { useState, useEffect } from 'react';
import { ChevronDown, ArrowRight, ShieldAlert, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { Connect4State, ParsedStudent } from '../types';
import { DEPARTMENTS } from '../data/departments';
import { sound } from '../utils/sound';
import { vibrate, vibratePattern } from '../utils/haptics';
import { apiFetch } from '../config';

interface Connect4StageProps {
  student: ParsedStudent;
  initialState: Connect4State;
  alreadyPlayedCol: number | null;
  onDropComplete: (result: {
    col: number;
    row: number;
    streakEarned: boolean;
    points: number;
    newState: Connect4State;
  }) => void;
  onAdvanceToNextStage: () => void;
}

export const Connect4Stage: React.FC<Connect4StageProps> = ({
  student,
  initialState,
  alreadyPlayedCol,
  onDropComplete,
  onAdvanceToNextStage
}) => {
  const [state, setState] = useState<Connect4State>(initialState);
  const [selectedCol, setSelectedCol] = useState<number | null>(alreadyPlayedCol);
  const [isDropping, setIsDropping] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(alreadyPlayedCol !== null);
  const [streakResult, setStreakResult] = useState<{ earned: boolean; points: number } | null>(null);

  useEffect(() => {
    setState(initialState);
  }, [initialState]);

  const handleDrop = async (col: number) => {
    if (hasPlayed || isDropping) return;

    // Check if column is full
    if (state.grid[col] && state.grid[col][0] !== null) {
      sound.playPop(200);
      return;
    }

    setIsDropping(true);
    setSelectedCol(col);
    sound.playDrop();
    vibrate(25);

    try {
      const res = await apiFetch('/api/connect4/drop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.studentId,
          col
        })
      });

      const data = await res.json();
      if (data.success) {
        setHasPlayed(true);
        if (data.state?.connect4) {
          setState(data.state.connect4);
        }

        if (data.streakEarned) {
          sound.playStreakChime();
          vibratePattern([100, 50, 100, 50, 200]);
          setStreakResult({ earned: true, points: data.points });
        } else {
          sound.playDrop();
          setStreakResult({ earned: false, points: data.points || 10 });
        }

        onDropComplete({
          col,
          row: data.row,
          streakEarned: data.streakEarned,
          points: data.points || 10,
          newState: data.state?.connect4 || state
        });
      }
    } catch (err) {
      console.error('Drop error:', err);
    } finally {
      setIsDropping(false);
    }
  };

  const cols = state.cols || 14;
  const rows = state.rows || 10;

  return (
    <div className="w-full h-full flex flex-col justify-between gap-1.5 animate-bounce-in overflow-hidden">
      {/* 1. Top Banner */}
      <div className="w-full pop-box p-2.5 bg-white flex items-center justify-between shadow-pop-sm flex-shrink-0">
        <div>
          <span className="text-[11px] font-bold text-gray-500 font-bangla block leading-none">স্টেপ ২: ডিপার্টমেন্টাল বন্ডিং</span>
          <h2 className="text-sm sm:text-base font-black font-bangla text-[#1E232A] mt-0.5">
            {hasPlayed ? '✅ বল ড্রপ সম্পন্ন!' : '🎯 ১টি কলাম বেছে বল ফেলুন'}
          </h2>
        </div>

        <div 
          className="px-2.5 py-1 rounded-xl border-2 border-[#1E232A] font-black text-xs font-bangla shadow-pop-sm flex items-center space-x-1"
          style={{ backgroundColor: student.themeColor, color: '#1E232A' }}
        >
          <span>{student.deptAbbr} বল</span>
        </div>
      </div>

      {/* 2. Grid Container with Touch Scroll (Fills remaining middle space) */}
      <div className="w-full flex-1 min-h-0 pop-box p-2 bg-[#F9D342] border-3.5 border-[#1E232A] relative flex flex-col justify-center shadow-pop overflow-hidden">
        <div className="text-[11px] text-[#1E232A] font-bangla text-center mb-1 font-bold flex-shrink-0">
          {hasPlayed 
            ? '৪টি মিললে বলগুলো ধূসর (Gray) হয়ে স্থায়ী পয়েন্ট লক হয়!' 
            : '👇 যেকোনো কলামের বাটনে ট্যাপ করে তোমার বলটি ড্রপ করো:'}
        </div>

        <div 
          style={{
            width: '100%',
            maxWidth: '100%',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}
          className="flex-1 min-h-0 w-full scroll-smooth touch-pan-x flex items-center justify-start sm:justify-center"
        >
          <div 
            style={{ width: 'max-content', minWidth: 'max-content' }}
            className="inline-block bg-[#1E232A] p-2.5 rounded-2xl border-3 border-[#1E232A] shadow-inner"
          >
            {/* Top Drop Arrows */}
            <div className="grid grid-cols-14 gap-1 mb-1.5">
              {Array.from({ length: cols }).map((_, c) => {
                const isFull = state.grid[c] && state.grid[c][0] !== null;
                return (
                  <button
                    key={c}
                    onClick={() => handleDrop(c)}
                    disabled={hasPlayed || isDropping || isFull}
                    className={`h-7 rounded-lg border-2 border-[#1E232A] flex flex-col items-center justify-center transition-all ${
                      hasPlayed || isFull
                        ? 'bg-gray-700 opacity-20 cursor-not-allowed'
                        : 'bg-[#FFE66D] hover:bg-[#FFF9D2] active:translate-y-0.5 shadow-pop-sm cursor-pointer active:scale-95'
                    }`}
                    title={`Column ${c + 1}`}
                  >
                    <ChevronDown className="w-3 h-3 text-[#1E232A]" />
                    <span className="text-[7px] font-black text-[#1E232A] leading-none">{c + 1}</span>
                  </button>
                );
              })}
            </div>

            {/* The 14x10 Matrix */}
            <div className="grid grid-cols-14 gap-1">
              {Array.from({ length: cols }).map((_, c) => (
                <div key={c} className="flex flex-col gap-1">
                  {Array.from({ length: rows }).map((_, r) => {
                    const cell = state.grid[c]?.[r];

                    // Empty Hole
                    if (!cell) {
                      return (
                        <div 
                          key={`${c}-${r}`} 
                          className="w-[22px] h-[22px] rounded-full bg-[#11161D] border border-white/10 shadow-inner flex items-center justify-center"
                        />
                      );
                    }

                    // Gray Locked
                    if (cell.isGrayLocked) {
                      return (
                        <div 
                          key={`${c}-${r}`} 
                          className="w-[22px] h-[22px] rounded-full bg-[#7F8C8D] border-2 border-white/50 flex items-center justify-center font-black text-[7px] text-white shadow-sm"
                          title="Gray Locked Streak (+100 Pts)"
                        >
                          🔒
                        </div>
                      );
                    }

                    // Active Department Ball
                    const dept = DEPARTMENTS[cell.deptCode || '01'];
                    return (
                      <div 
                        key={`${c}-${r}`} 
                        className="w-[22px] h-[22px] rounded-full border-2 border-[#1E232A] flex items-center justify-center font-black text-[7px] text-[#1E232A] shadow-sm animate-bounce-in"
                        style={{ backgroundColor: dept?.themeColor || '#4ECDC4' }}
                        title={`${dept?.name || 'Dept'} Token`}
                      >
                        {dept?.abbr || cell.deptCode}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Streak / Drop Result Card (if played) */}
      {streakResult && (
        <div className={`w-full p-2 rounded-xl border-2 border-[#1E232A] shadow-pop-sm flex items-center space-x-2 text-xs font-bangla animate-bounce-in flex-shrink-0 ${
          streakResult.earned ? 'bg-[#D4F8F0] text-[#00897B]' : 'bg-[#FFFBEB] text-[#1E232A]'
        }`}>
          {streakResult.earned ? (
            <>
              <Award className="w-5 h-5 text-amber-500 flex-shrink-0 animate-bounce" />
              <div>
                <strong className="font-black block text-xs">🎉 পরপর ৪ কমপ্লিট!</strong>
                <span className="text-[11px]">অভিনন্দন! তোমার ডিপার্টমেন্ট +{streakResult.points} পয়েন্ট অর্জন করেছে!</span>
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div>
                <strong className="font-black block text-xs">বল সফলভাবে ড্রপ হয়েছে (+{streakResult.points || 10} pts)!</strong>
                <span className="text-gray-600 text-[10px]">তোমার ডিপার্টমেন্ট পয়েন্ট পেয়েছে। বন্ধুদের বলো পাশেই ড্রপ করতে!</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* 4. Advance to Next Stage Button */}
      <div className="w-full flex-shrink-0">
        {hasPlayed ? (
          <button
            onClick={() => { sound.playPop(); onAdvanceToNextStage(); }}
            className="pop-btn w-full py-3.5 bg-[#6BCB77] text-[#1E232A] font-black text-sm sm:text-base font-bangla flex items-center justify-center space-x-2 animate-bounce shadow-pop cursor-pointer"
          >
            <span>পরের গেম (টাওয়ার স্ট্যাক) এ যাও</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="text-center font-bangla text-xs font-bold text-gray-800 py-1 bg-white/60 rounded-xl border border-[#1E232A]/20">
            একটি কলামে ট্যাপ করলেই তোমার চাল রেকর্ড হয়ে যাবে।
          </div>
        )}
      </div>
    </div>
  );
};
