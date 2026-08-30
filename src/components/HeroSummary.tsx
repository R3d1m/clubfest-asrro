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
    <div className="w-full flex flex-col items-center justify-center min-h-[calc(100vh-65px)] space-y-4 py-4">
      {/* Hero Badge Card */}
      <div className="pop-box w-full p-6 bg-[#FFFBEB] border-4 border-[#1E232A] text-center space-y-5 animate-bounce-in shadow-pop-lg">
        {/* Top Dept Emblem */}
        <div 
          className="w-20 h-20 mx-auto rounded-3xl border-4 border-[#1E232A] shadow-pop flex flex-col items-center justify-center animate-bounce"
          style={{ backgroundColor: student.themeColor }}
        >
          <Award className="w-10 h-10 text-[#1E232A]" />
          <span className="font-black text-xs text-[#1E232A]">{student.deptAbbr}</span>
        </div>

        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#D4F8F0] border-2 border-[#1E232A] rounded-full text-xs font-black text-[#00897B] font-bangla mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>সফলভাবে সম্পন্ন হয়েছে!</span>
          </div>

          <h2 className="text-2xl font-black font-bangla text-[#1E232A]">
            ডিপার্টমেন্ট হিরো কার্ড
          </h2>
          <p className="text-sm font-bold text-gray-600 font-bangla">
            {student.studentId} • {student.deptAbbr} '{student.batchShort}
          </p>
        </div>

        {/* Personal Contribution Stats from Database */}
        <div className="p-3.5 bg-white rounded-2xl border-3 border-[#1E232A] shadow-pop-sm space-y-2.5 text-left font-bangla">
          <div className="flex items-center justify-between border-b-2 border-dashed border-gray-200 pb-2">
            <span className="text-xs font-bold text-gray-600">🚢 ব্যাটেলশিপ চাল:</span>
            <span className="text-xs font-black text-[#1E232A]">
              {player.battleshipMoves?.length || 3}টি সম্পন্ন
            </span>
          </div>

          <div className="flex items-center justify-between border-b-2 border-dashed border-gray-200 pb-2">
            <span className="text-xs font-bold text-gray-600">🔴 কানেক্ট-৪ বল:</span>
            <span className="text-xs font-black text-[#1E232A]">
              কলাম {player.connect4Col !== null ? player.connect4Col + 1 : '১'}
            </span>
          </div>

          <div className="flex items-center justify-between border-b-2 border-dashed border-gray-200 pb-2">
            <span className="text-xs font-bold text-gray-600">🏗️ ব্যক্তিগত স্ট্যাকিং:</span>
            <span className="text-sm font-black text-amber-600">
              {player.stackFloors} তলা {player.stackCombos > 1 ? `(×${player.stackCombos} কম্বো)` : ''}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-black text-[#1E232A]">মোট অর্জিত পয়েন্ট:</span>
            <span className="text-base font-black text-emerald-600">+{player.totalPointsEarned} Pts</span>
          </div>
        </div>

        {/* Department Current Standing */}
        {deptStats && (
          <div className="p-3 bg-[#FFF9D2] rounded-xl border-2 border-[#1E232A] text-center space-y-1 font-bangla">
            <span className="text-[11px] font-bold text-gray-600">তোমার ডিপার্টমেন্টের বর্তমান র‍্যাঙ্ক:</span>
            <div className="text-xl font-black text-[#1E232A] flex items-center justify-center space-x-1">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>{deptStats.overallRank === 1 ? '🥇 ১ম স্থান (শীর্ষে!)' : `${deptStats.overallRank}ম স্থান`}</span>
            </div>
            <p className="text-[10px] text-gray-500 font-medium">
              বড় পর্দায় লাইভ আপডেট দেখা যাচ্ছে
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => { sound.playPop(); onOpenLeaderboard(); }}
            className="pop-btn w-full py-3 bg-[#4ECDC4] text-[#1E232A] font-black text-sm font-bangla flex items-center justify-center space-x-2 shadow-pop"
          >
            <Trophy className="w-4 h-4" />
            <span>লাইভ লিডারবোর্ড দেখুন</span>
          </button>

          <button
            onClick={handleShare}
            className="pop-btn-sm w-full py-2 bg-white text-[#1E232A] font-bold text-xs font-bangla flex items-center justify-center space-x-2"
          >
            <Share2 className="w-3.5 h-3.5 text-gray-600" />
            <span>বন্ধুদের সাথে শেয়ার করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
