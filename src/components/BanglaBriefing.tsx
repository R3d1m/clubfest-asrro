import React from 'react';
import { Play, Sparkles, AlertTriangle } from 'lucide-react';
import { ParsedStudent } from '../types';
import { sound } from '../utils/sound';
import { vibrate } from '../utils/haptics';

interface BanglaBriefingProps {
  student: ParsedStudent;
  onStart: () => void;
}

export const BanglaBriefing: React.FC<BanglaBriefingProps> = ({ student, onStart }) => {
  const handleStart = () => {
    sound.playPop();
    vibrate(30);
    onStart();
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 flex flex-col items-center justify-center min-h-[calc(100vh-65px)]">
      <div className="pop-box w-full p-6 bg-[#FFFBEB] border-4 border-[#1E232A] text-center space-y-5 animate-bounce-in">
        {/* Welcome Avatar / Icon */}
        <div 
          className="w-20 h-20 mx-auto rounded-3xl border-4 border-[#1E232A] shadow-pop flex flex-col items-center justify-center"
          style={{ backgroundColor: student.themeColor }}
        >
          <span className="text-3xl">⚔️</span>
          <span className="font-black text-xs text-[#1E232A] mt-0.5">{student.deptAbbr}</span>
        </div>

        <div>
          <h2 className="text-2xl font-black font-bangla text-[#1E232A] leading-tight">
            স্বাগতম, <span style={{ color: student.themeColor }}>{student.deptName}</span>!
          </h2>
          <p className="text-sm font-bold text-gray-600 font-bangla mt-1">
            ব্যাচ: {student.batchShort} • রোল: {student.roll}
          </p>
        </div>

        {/* 4 Mission Cards */}
        <div className="space-y-3 text-left font-bangla text-xs sm:text-sm">
          <div className="p-3 bg-white rounded-xl border-2 border-[#1E232A] shadow-pop-sm flex items-start space-x-2.5">
            <span className="text-xl">🎯</span>
            <div>
              <strong className="text-[#1E232A] block font-bold">১. স্টিলথ ব্যাটেলশিপ (৩৫×৩৫):</strong>
              <p className="text-gray-600 leading-snug">
                তোমার ৩টি চাল আছে। কুয়াশায় শত্রুর ঘাঁটি আক্রমণ করে পয়েন্ট আনো! যে ডিপার্টমেন্ট যত বেশি শত্রুর ঘাঁটি উন্মোচন করবে তারা শীর্ষে থাকবে।
              </p>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border-2 border-[#1E232A] shadow-pop-sm flex items-start space-x-2.5">
            <span className="text-xl">🔴</span>
            <div>
              <strong className="text-[#1E232A] block font-bold">২. মেগা কানেক্ট-৪:</strong>
              <p className="text-gray-600 leading-snug">
                ১২টি ডিপার্টমেন্টের সাথে একই বোর্ডে ১টি বল ফেলবে। ৪টি মেলালে পার্মানেন্ট গ্রে লক (+পয়েন্ট) হবে!
              </p>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border-2 border-[#1E232A] shadow-pop-sm flex items-start space-x-2.5">
            <span className="text-xl">🏗️</span>
            <div>
              <strong className="text-[#1E232A] block font-bold">৩. ব্যক্তিগত টাওয়ার স্ট্যাক:</strong>
              <p className="text-gray-600 leading-snug">
                যতক্ষণ পারবে স্ট্যাক করে যাও! সর্বোচ্চ স্কোর গড়ে ব্যক্তিগত লিডারবোর্ডের শীর্ষে ওঠো!
              </p>
            </div>
          </div>
        </div>

        {/* Important Warning */}
        <div className="p-2.5 bg-[#FFF2DC] rounded-xl border-2 border-[#FFA931] text-left flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-[#D67229] flex-shrink-0" />
          <p className="text-xs font-bold font-bangla text-[#D67229] leading-tight">
            মনে রাখবে: পুরো ফেস্টে তুমি একবারই খেলতে পারবে!
          </p>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="pop-btn w-full py-3.5 bg-[#4ECDC4] text-[#1E232A] font-black text-lg font-bangla flex items-center justify-center space-x-2 hover:bg-[#3dbdb5]"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>লড়াই শুরু করো!</span>
          <Sparkles className="w-4 h-4 text-[#F9D342]" />
        </button>
      </div>
    </div>
  );
};
