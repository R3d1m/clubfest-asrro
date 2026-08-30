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
          setStreakResult({ earned: false, points: 0 });
        }

        onDropComplete({
          col,
          row: data.row,
          streakEarned: data.streakEarned,
          points: data.points || 0,
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
    <div className="w-full max-w-full min-w-0 flex flex-col gap-3 animate-bounce-in" style={{ minHeight: 'calc(100vh - 80px)' }}>
      {/* Top Banner */}
      <div className="w-full pop-box p-3 sm:p-4 bg-white flex items-center justify-between shadow-pop-sm">
        <div>
          <span className="text-xs font-bold text-gray-500 font-bangla block">স্টেপ ২: মেগা কানেক্ট-৪</span>
          <h2 className="text-base sm:text-lg font-black font-bangla text-[#1E232A]">
            {hasPlayed ? '✅ বল ড্রপ সম্পন্ন!' : '🎯 ১টি কলাম বেছে বল ফেলুন'}
          </h2>
        </div>

        <div 
          className="px-3 py-1.5 rounded-xl border-2 border-[#1E232A] font-black text-xs sm:text-sm font-bangla shadow-pop-sm flex items-center space-x-1"
          style={{ backgroundColor: student.themeColor, color: '#1E232A' }}
        >
          <span>{student.deptAbbr} বল</span>
        </div>
      </div>

      {/* Grid Container with Touch Scroll */}
      <div className="w-full max-w-full min-w-0 pop-box p-3 bg-[#F9D342] border-4 border-[#1E232A] relative flex flex-col shadow-pop overflow-hidden">
        <div className="text-xs text-[#1E232A] font-bangla text-center mb-1 font-bold">
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
          className="pb-2 scroll-smooth touch-pan-x flex items-center justify-start sm:justify-center"
        >
          <div 
            style={{ width: 'max-content', minWidth: 'max-content' }}
            className="inline-block bg-[#1E232A] p-3 rounded-2xl border-3 border-[#1E232A] shadow-inner"
          >
            {/* Top Drop Arrows */}
            <div className="grid grid-cols-14 gap-1 mb-2">
              {Array.from({ length: cols }).map((_, c) => {
                const isFull = state.grid[c] && state.grid[c][0] !== null;
                return (
                  <button
                    key={c}
                    onClick={() => handleDrop(c)}
                    disabled={hasPlayed || isDropping || isFull}
                    className={`h-8 rounded-lg border-2 border-[#1E232A] flex flex-col items-center justify-center transition-all ${
                      hasPlayed || isFull
                        ? 'bg-gray-700 opacity-20 cursor-not-allowed'
                        : 'bg-[#FFE66D] hover:bg-[#FFF9D2] active:translate-y-0.5 shadow-pop-sm cursor-pointer active:scale-95'
                    }`}
                    title={`Column ${c + 1}`}
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-[#1E232A]" />
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
                          className="w-[24px] h-[24px] rounded-full bg-[#11161D] border border-white/10 shadow-inner flex items-center justify-center"
                        />
                      );
                    }

                    // Gray Locked
                    if (cell.isGrayLocked) {
                      return (
                        <div 
                          key={`${c}-${r}`} 
                          className="w-[24px] h-[24px] rounded-full bg-[#7F8C8D] border-2 border-white/50 flex items-center justify-center font-black text-[7px] text-white shadow-sm"
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
                        className="w-[24px] h-[24px] rounded-full border-2 border-[#1E232A] flex items-center justify-center font-black text-[7px] text-[#1E232A] shadow-sm animate-bounce-in"
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

      {/* Streak / Drop Result Card */}
      {streakResult && (
        <div className={`w-full p-3 rounded-2xl border-3 border-[#1E232A] shadow-pop-sm flex items-center space-x-2.5 text-xs sm:text-sm font-bangla animate-bounce-in ${
          streakResult.earned ? 'bg-[#D4F8F0] text-[#00897B]' : 'bg-[#FFFBEB] text-[#1E232A]'
        }`}>
          {streakResult.earned ? (
            <>
              <Award className="w-6 h-6 text-amber-500 flex-shrink-0 animate-bounce" />
              <div>
                <strong className="font-black block text-sm sm:text-base">🎉 ৪-ইন-এ-রো কমপ্লিট!</strong>
                <span>অভিনন্দন! তোমার ডিপার্টমেন্ট +{streakResult.points} পয়েন্ট অর্জন করেছে!</span>
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <strong className="font-black block">বল সফলভাবে ড্রপ হয়েছে!</strong>
                <span className="text-gray-600 text-xs">তোমার বন্ধুদের বলো তোমার বলের পাশেই বল ড্রপ করতে!</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Advance to Next Stage Button */}
      {hasPlayed ? (
        <button
          onClick={() => { sound.playPop(); onAdvanceToNextStage(); }}
          className="pop-btn w-full py-4 bg-[#6BCB77] text-[#1E232A] font-black text-base sm:text-lg font-bangla flex items-center justify-center space-x-2 animate-bounce shadow-pop cursor-pointer"
        >
          <span>পরের গেম (টাওয়ার স্ট্যাক) এ যাও</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      ) : (
        <div className="text-center font-bangla text-xs sm:text-sm font-bold text-gray-700 py-1">
          একটি কলামে ট্যাপ করলেই তোমার চাল রেকর্ড হয়ে যাবে।
        </div>
      )}
    </div>
  );
};
