import React from 'react';
import { Play, Sparkles, AlertTriangle, Trophy, Shield } from 'lucide-react';
import { ParsedStudent } from '../types';
import { sound } from '../utils/sound';
import { vibrate } from '../utils/haptics';

interface BanglaBriefingProps {
  student: ParsedStudent;
  onStart: () => void;
}

export const BanglaBriefing: React.FC<BanglaBriefingProps> = ({ student, onStart }) => {
  const handleStart = () => {
    sound.playPop(500);
    vibrate(30);
    onStart();
  };

  return (
    <div className="w-full h-full flex flex-col justify-between animate-bounce-in overflow-hidden">
      <div className="pop-box w-full flex-1 p-3.5 sm:p-4 bg-[#FFFBEB] flex flex-col justify-between gap-2.5 shadow-pop-lg overflow-hidden">
        {/* Top Department Badge & Welcome */}
        <div className="flex items-center space-x-3 border-b-2 border-dashed border-[#1E232A]/20 pb-2 flex-shrink-0">
          <div 
            className="w-13 h-13 rounded-2xl border-3 border-[#1E232A] shadow-pop-sm flex flex-col items-center justify-center animate-bounce flex-shrink-0"
            style={{ backgroundColor: student.themeColor }}
          >
            <span className="text-xl">⚔️</span>
            <span className="font-black text-[11px] text-[#1E232A]">{student.deptAbbr}</span>
          </div>

          <div className="text-left">
            <div className="inline-flex items-center space-x-1 px-2 py-0.5 bg-[#D4F8F0] border border-[#1E232A] rounded-full text-[10px] font-black text-[#00897B] mb-0.5">
              <Trophy className="w-3 h-3 text-amber-500" />
              <span>ASRRO ফেস্ট অ্যারেনা</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black font-bangla text-[#1E232A] leading-snug">
              স্বাগতম, <span style={{ color: student.themeColor }}>{student.deptName}</span>!
            </h2>
            <p className="text-[11px] font-bold text-gray-500 font-bangla">
              আইডি: <strong className="text-[#1E232A]">{student.studentId}</strong> • ব্যাচ: <strong className="text-[#1E232A]">{student.batchShort}</strong>
            </p>
          </div>
        </div>

        {/* Narrative & Rules List */}
        <div className="space-y-2 text-left font-bangla flex-1 min-h-0 flex flex-col justify-center">
          <div className="p-2.5 bg-white rounded-2xl border-2 border-[#1E232A] shadow-pop-sm flex items-start space-x-2.5">
            <span className="text-xl flex-shrink-0">🛡️</span>
            <div className="text-xs leading-snug">
              <strong className="text-[#1E232A] font-black block text-xs sm:text-sm mb-0.5">
                ১. ডিপার্টমেন্টের প্রতিনিধিত্ব (গেম ১ ও ২):
              </strong>
              <p className="text-gray-700 font-medium text-[11px] sm:text-xs">
                ৩ ম্যাচের এই গেম এর প্রথম দুটোতে (<span className="font-bold text-red-600">ব্যাটেলশিপ</span> ও <span className="font-bold text-teal-600">কানেক্ট-৪</span>) তুমি সরাসরি তোমার ডিপার্টমেন্টকে পয়েন্ট এনে দেবে।
              </p>
            </div>
          </div>

          <div className="p-2.5 bg-white rounded-2xl border-2 border-[#1E232A] shadow-pop-sm flex items-start space-x-2.5">
            <span className="text-xl flex-shrink-0">🎁</span>
            <div className="text-xs leading-snug">
              <strong className="text-[#1E232A] font-black block text-xs sm:text-sm mb-0.5">
                ২. ব্যক্তিগত শ্রেষ্ঠত্ব ও ASRRO পুরস্কার (গেম ৩):
              </strong>
              <p className="text-gray-700 font-medium text-[11px] sm:text-xs">
                ৩য় গেমটিতে (<span className="font-bold text-amber-600">টাওয়ার স্ট্যাক</span>) হবে তোমার ব্যক্তিগত লড়াই। টপ ৫ এ থাকলে <strong className="text-[#D67229]">ASRRO থেকে বিশেষ পুরস্কার নিশ্চিত!</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="p-2 bg-[#FFE0E2] rounded-xl border-2 border-[#FF5964] text-left flex items-center space-x-2 flex-shrink-0">
          <AlertTriangle className="w-4 h-4 text-[#D32F2F] flex-shrink-0 animate-pulse" />
          <p className="text-[11px] sm:text-xs font-black font-bangla text-[#D32F2F] leading-tight">
            মনে রাখবে: পুরো ফেস্টে তুমি একবারই খেলতে পারবে!
          </p>
        </div>

        {/* Big Start Button */}
        <button
          onClick={handleStart}
          className="pop-btn w-full py-3.5 bg-[#4ECDC4] text-[#1E232A] font-black text-base font-bangla flex items-center justify-center space-x-2 hover:bg-[#3dbdb5] shadow-pop transition-all active:translate-y-0.5 cursor-pointer flex-shrink-0"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>লড়াই শুরু করো!</span>
          <Sparkles className="w-4 h-4 text-[#F9D342]" />
        </button>
      </div>
    </div>
  );
};
