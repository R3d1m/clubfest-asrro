import React from 'react';
import { Play, Sparkles, AlertTriangle, ShieldCheck, Trophy, Target, Award, Users, Flame } from 'lucide-react';
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
    <div className="w-full max-w-lg mx-auto p-3 sm:p-4 flex flex-col items-center justify-center min-h-[calc(100vh-65px)]">
      <div className="pop-box w-full p-5 sm:p-6 bg-[#FFFBEB] border-4 border-[#1E232A] text-center space-y-4 animate-bounce-in shadow-pop-lg">
        {/* Top Department Badge */}
        <div 
          className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl border-4 border-[#1E232A] shadow-pop flex flex-col items-center justify-center animate-bounce"
          style={{ backgroundColor: student.themeColor }}
        >
          <span className="text-2xl sm:text-3xl">⚔️</span>
          <span className="font-black text-xs sm:text-sm text-[#1E232A] mt-0.5">{student.deptAbbr}</span>
        </div>

        {/* Welcome Headline */}
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#D4F8F0] border-2 border-[#1E232A] rounded-full text-xs font-black text-[#00897B] font-bangla mb-1.5 shadow-xs">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>ASRRO ফেস্ট অ্যারেনা ২০২৬</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-bangla text-[#1E232A] leading-snug">
            <span style={{ color: student.themeColor }}>{student.deptName}</span>, ASRRO আয়োজিত এই গৌরবের লড়াইয়ে তোমাকে স্বাগতম!
          </h2>
          <p className="text-xs font-bold text-gray-500 font-bangla mt-1">
            আইডি: <strong className="text-[#1E232A] font-mono">{student.studentId}</strong> • ব্যাচ: <strong className="text-[#1E232A]">{student.batchShort}</strong> • ডিপার্টমেন্ট: <strong className="text-[#1E232A]">{student.deptName}</strong>
          </p>
        </div>

        {/* Informative Briefing Cards */}
        <div className="space-y-2.5 text-left font-bangla">
          {/* Dept Clash (Games 1 & 2) */}
          <div className="p-3 bg-white rounded-2xl border-2 border-[#1E232A] shadow-pop-sm flex items-start space-x-2.5">
            <span className="text-xl flex-shrink-0 mt-0.5">🛡️</span>
            <div className="text-xs leading-relaxed">
              <strong className="text-[#1E232A] font-black block text-sm mb-0.5">১. ডিপার্টমেন্টের প্রতিনিধিত্ব (গেম ১ ও ২):</strong>
              <p className="text-gray-700 font-medium">
                ৩ ম্যাচের এই গেম এর প্রথম দুটোতে (<span className="font-bold text-red-600">ব্যাটেলশিপ</span> ও <span className="font-bold text-teal-600">কানেক্ট-৪</span>) তুমি সরাসরি তোমার ডিপার্টমেন্টের হয়ে লড়াই করবে। তোমার প্রতিটি সঠিক চাল ডিপার্টমেন্টের স্কোর বাড়িয়ে লিডারবোর্ডের শীর্ষে নিয়ে যাবে।
              </p>
            </div>
          </div>

          {/* Individual Stacker & Reward (Game 3) */}
          <div className="p-3 bg-white rounded-2xl border-2 border-[#1E232A] shadow-pop-sm flex items-start space-x-2.5">
            <span className="text-xl flex-shrink-0 mt-0.5">🎁</span>
            <div className="text-xs leading-relaxed">
              <strong className="text-[#1E232A] font-black block text-sm mb-0.5">২. ব্যক্তিগত শ্রেষ্ঠত্ব ও ASRRO উপহার (গেম ৩):</strong>
              <p className="text-gray-700 font-medium">
                ৩য় গেমটিতে (<span className="font-bold text-amber-600">টাওয়ার স্ট্যাক</span>) হবে তোমার ব্যক্তিগত দক্ষতার লড়াই। ফেস্ট শেষে যারা টপ ৫ এ থাকবে, তারা <strong className="text-[#D67229]">ASRRO থেকে পাবে বিশেষ আকর্ষণীয় উপহার!</strong>
              </p>
            </div>
          </div>

          {/* Live Arena & Fair Play Rule */}
          <div className="p-3 bg-white rounded-2xl border-2 border-[#1E232A] shadow-pop-sm flex items-start space-x-2.5">
            <span className="text-xl flex-shrink-0 mt-0.5">📊</span>
            <div className="text-xs leading-relaxed">
              <strong className="text-[#1E232A] font-black block text-sm mb-0.5">৩. লাইভ স্ক্রিন ও ফেস্ট নিয়ম:</strong>
              <p className="text-gray-700 font-medium">
                তোমার স্কোর ও অ্যাক্টিভিটি লাইভ প্রজেক্টরে প্রদর্শিত হচ্ছে। মনে রাখবে—পুরো ফেস্টে তুমি <strong className="text-red-600">একবারই খেলার সুযোগ পাবে</strong>, তাই সর্বোচ্চ মনোযোগ দিয়ে খেলো!
              </p>
            </div>
          </div>
        </div>

        {/* Warning Badge */}
        <div className="p-2.5 bg-[#FFE0E2] rounded-xl border-2 border-[#FF5964] text-left flex items-center space-x-2.5">
          <AlertTriangle className="w-5 h-5 text-[#D32F2F] flex-shrink-0 animate-pulse" />
          <p className="text-xs font-black font-bangla text-[#D32F2F] leading-tight">
            সতর্কতা: গেম শুরু হলে মাঝপথে ব্যাক করা যাবে না। প্রতিটি গেমের আগে নিয়মাবলী ভালোভাবে পড়ে নাও!
          </p>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="pop-btn w-full py-3.5 bg-[#4ECDC4] text-[#1E232A] font-black text-lg font-bangla flex items-center justify-center space-x-2 hover:bg-[#3dbdb5] shadow-pop transition-all active:translate-y-0.5"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>লড়াই শুরু করো!</span>
          <Sparkles className="w-4 h-4 text-[#F9D342]" />
        </button>
      </div>
    </div>
  );
};
