import React, { useEffect } from 'react';
import { Trophy, Share2, CheckCircle2, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ParsedStudent, PlayerRecord, ServerStateSnapshot } from '../types';
import { sound } from '../utils/sound';

interface HeroSummaryProps {
  student: ParsedStudent;
  player: PlayerRecord;
  serverState?: ServerStateSnapshot | null;
  onOpenLeaderboard: () => void;
}

export const HeroSummary: React.FC<HeroSummaryProps> = ({
  student,
  player,
  serverState,
  onOpenLeaderboard
}) => {
  useEffect(() => {
    sound.playStreakChime();
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 }
    });
  }, []);

  const deptStats = serverState?.overallLeaderboard.find(d => d.deptCode === student.deptCode);

  const handleShare = () => {
    sound.playPop();
    if (navigator.share) {
      navigator.share({
        title: 'ডিপার্টমেন্ট ক্ল্যাশ ২০২৬',
        text: `আমি ${student.deptName} এর জন্য লড়াই করে ${player.totalPointsEarned} পয়েন্ট অর্জন করেছি এবং স্ট্যাকিংয়ে ${player.stackFloors} তলায় উঠেছি! 🚀`,
        url: window.location.origin
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(
        `আমি ${student.deptName} এর জন্য লড়াই করে ${player.totalPointsEarned} পয়েন্ট অর্জন করেছি! ⚔️`
      );
      alert('টেক্সট ক্লিপবোর্ডে কপি হয়েছে!');
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between animate-bounce-in overflow-hidden">
      {/* Hero Badge Card */}
      <div className="pop-box w-full flex-1 p-3.5 bg-[#FFFBEB] border-3.5 border-[#1E232A] text-center flex flex-col justify-between gap-2 shadow-pop-lg overflow-hidden">
        {/* Top Dept Emblem */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div 
            className="w-14 h-14 rounded-2xl border-3 border-[#1E232A] shadow-pop flex flex-col items-center justify-center animate-bounce mb-1"
            style={{ backgroundColor: student.themeColor }}
          >
            <Award className="w-7 h-7 text-[#1E232A]" />
            <span className="font-black text-[10px] text-[#1E232A] leading-none">{student.deptAbbr}</span>
          </div>

          <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-[#D4F8F0] border border-[#1E232A] rounded-full text-[10px] font-black text-[#00897B] font-bangla mb-0.5">
            <CheckCircle2 className="w-3 h-3" />
            <span>সফলভাবে সম্পন্ন হয়েছে!</span>
          </div>

          <h2 className="text-lg font-black font-bangla text-[#1E232A]">
            ডিপার্টমেন্ট হিরো কার্ড
          </h2>
          <p className="text-xs font-bold text-gray-600 font-bangla">
            {student.studentId} • {student.deptAbbr} '{student.batchShort}
          </p>
        </div>

        {/* Personal Contribution Stats */}
        <div className="p-2.5 bg-white rounded-2xl border-2 border-[#1E232A] shadow-pop-sm space-y-1.5 text-left font-bangla flex-shrink-0">
          <div className="flex items-center justify-between border-b border-dashed border-gray-200 pb-1 text-xs">
            <span className="font-bold text-gray-600">🚢 ব্যাটেলশিপ চাল:</span>
            <span className="font-black text-[#1E232A]">
              {player.battleshipMoves?.length || 3}টি সম্পন্ন
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-dashed border-gray-200 pb-1 text-xs">
            <span className="font-bold text-gray-600">🔴 কানেক্ট-৪ বল:</span>
            <span className="font-black text-[#1E232A]">
              কলাম {player.connect4Col !== null ? player.connect4Col + 1 : '১'}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-dashed border-gray-200 pb-1 text-xs">
            <span className="font-bold text-gray-600">🏗️ ব্যক্তিগত স্ট্যাকিং:</span>
            <span className="font-black text-amber-600">
              {player.stackFloors} তলা {player.stackCombos > 1 ? `(×${player.stackCombos} কম্বো)` : ''}
            </span>
          </div>

          <div className="flex items-center justify-between pt-0.5 text-xs">
            <span className="font-black text-[#1E232A]">মোট অর্জিত পয়েন্ট:</span>
            <span className="text-sm font-black text-emerald-600">+{player.totalPointsEarned} Pts</span>
          </div>
        </div>

        {/* Department Current Standing */}
        {deptStats && (
          <div className="p-2 bg-[#FFF9D2] rounded-xl border border-[#1E232A] text-center space-y-0.5 font-bangla flex-shrink-0">
            <span className="text-[10px] font-bold text-gray-600">তোমার ডিপার্টমেন্টের বর্তমান র‍্যাঙ্ক:</span>
            <div className="text-base font-black text-[#1E232A] flex items-center justify-center space-x-1">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>{deptStats.overallRank === 1 ? '🥇 ১ম স্থান (শীর্ষে!)' : `${deptStats.overallRank}ম স্থান`}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-1.5 flex-shrink-0">
          <button
            onClick={() => { sound.playPop(); onOpenLeaderboard(); }}
            className="pop-btn w-full py-2.5 bg-[#4ECDC4] text-[#1E232A] font-black text-sm font-bangla flex items-center justify-center space-x-2 shadow-pop"
          >
            <Trophy className="w-4 h-4" />
            <span>লাইভ লিডারবোর্ড দেখুন</span>
          </button>

          <button
            onClick={handleShare}
            className="pop-btn-sm w-full py-1.5 bg-white text-[#1E232A] font-bold text-xs font-bangla flex items-center justify-center space-x-1.5"
          >
            <Share2 className="w-3.5 h-3.5 text-gray-600" />
            <span>বন্ধুদের সাথে শেয়ার করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
