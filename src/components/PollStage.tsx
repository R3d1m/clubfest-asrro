import React, { useState } from 'react';
import { Flame, CheckCircle, ArrowRight, Sparkles, Moon, Zap, Coffee } from 'lucide-react';
import { ParsedStudent } from '../types';
import { DEPARTMENT_LIST } from '../data/departments';
import { sound } from '../utils/sound';
import { vibrate } from '../utils/haptics';
import { apiFetch } from '../config';

interface PollStageProps {
  student: ParsedStudent;
  onPollSubmit: (answers: { q1?: string; q2?: string; q3?: string }) => void;
}

export const PollStage: React.FC<PollStageProps> = ({ student, onPollSubmit }) => {
  const [q1, setQ1] = useState<string>('');
  const [q2, setQ2] = useState<string>('');
  const [q3, setQ3] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isComplete = q1 && q2 && q3;

  const handleSubmit = async () => {
    if (!isComplete || isSubmitting) return;

    setIsSubmitting(true);
    sound.playStreakChime();
    vibrate(30);

    const answers = { q1, q2, q3 };

    try {
      await apiFetch('/api/poll/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.studentId,
          answers
        })
      });

      onPollSubmit(answers);
    } catch (err) {
      console.error('Poll submit error:', err);
      onPollSubmit(answers);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between gap-1.5 animate-bounce-in overflow-hidden">
      {/* 1. Top Banner */}
      <div className="w-full pop-box p-2.5 bg-white flex items-center justify-between shadow-pop-sm flex-shrink-0">
        <div>
          <span className="text-[11px] font-bold text-gray-500 font-bangla block leading-none">স্টেপ ৪: স্পাইসি ফেস্ট সার্ভে</span>
          <h2 className="text-sm sm:text-base font-black font-bangla text-[#1E232A] mt-0.5">
            🌶️ গোপন ভোট ও পরিসংখ্যান
          </h2>
        </div>

        <div className="bg-[#FFE0E2] p-1.5 rounded-xl border-2 border-[#1E232A]">
          <Flame className="w-4 h-4 text-[#FF5964]" />
        </div>
      </div>

      {/* 2. 3 Questions Container (Fills remaining middle space) */}
      <div className="w-full flex-1 min-h-0 flex flex-col justify-between gap-1.5 overflow-hidden">
        {/* Question 1 */}
        <div className="pop-box p-2 bg-[#FFFBEB] border-2.5 border-[#1E232A] flex flex-col justify-between shadow-pop-sm flex-1 min-h-0">
          <div className="flex items-center space-x-1.5 mb-1">
            <Moon className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
            <h3 className="text-[11px] sm:text-xs font-black font-bangla text-[#1E232A] leading-tight">
              ১. সবচেয়ে চিল ডিপার্টমেন্ট কোনটি?
            </h3>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1">
            {DEPARTMENT_LIST.map((dept) => (
              <button
                key={dept.code}
                onClick={() => { sound.playPop(); setQ1(dept.abbr); }}
                className={`py-1 px-0.5 rounded-lg text-[10px] sm:text-xs font-black border-2 border-[#1E232A] transition-all truncate select-none active:scale-95 cursor-pointer ${
                  q1 === dept.abbr 
                    ? 'bg-[#845EC2] text-white shadow-pop-sm scale-105' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {dept.abbr}
              </button>
            ))}
          </div>
        </div>

        {/* Question 2 */}
        <div className="pop-box p-2 bg-[#FFFBEB] border-2.5 border-[#1E232A] flex flex-col justify-between shadow-pop-sm flex-1 min-h-0">
          <div className="flex items-center space-x-1.5 mb-1">
            <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <h3 className="text-[11px] sm:text-xs font-black font-bangla text-[#1E232A] leading-tight">
              ২. কোন ডিপার্টমেন্ট সবকিছুতে গ্যাঞ্জাম পাকায়?
            </h3>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1">
            {DEPARTMENT_LIST.map((dept) => (
              <button
                key={dept.code}
                onClick={() => { sound.playPop(); setQ2(dept.abbr); }}
                className={`py-1 px-0.5 rounded-lg text-[10px] sm:text-xs font-black border-2 border-[#1E232A] transition-all truncate select-none active:scale-95 cursor-pointer ${
                  q2 === dept.abbr 
                    ? 'bg-[#FFA931] text-[#1E232A] shadow-pop-sm scale-105' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {dept.abbr}
              </button>
            ))}
          </div>
        </div>

        {/* Question 3 */}
        <div className="pop-box p-2 bg-[#FFFBEB] border-2.5 border-[#1E232A] flex flex-col justify-between shadow-pop-sm flex-1 min-h-0">
          <div className="flex items-center space-x-1.5 mb-1">
            <Coffee className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <h3 className="text-[11px] sm:text-xs font-black font-bangla text-[#1E232A] leading-tight">
              ৩. 2nd best ডিপার্টমেন্ট কোনটি?(নিজের ডিপার্টমেন্ট বাদ দিয়ে)
            </h3>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1">
            {DEPARTMENT_LIST.map((dept) => (
              <button
                key={dept.code}
                onClick={() => { sound.playPop(); setQ3(dept.abbr); }}
                className={`py-1 px-0.5 rounded-lg text-[10px] sm:text-xs font-black border-2 border-[#1E232A] transition-all truncate select-none active:scale-95 cursor-pointer ${
                  q3 === dept.abbr 
                    ? 'bg-[#00C9A7] text-[#1E232A] shadow-pop-sm scale-105' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {dept.abbr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Submit Button */}
      <div className="w-full flex-shrink-0">
        <button
          onClick={handleSubmit}
          disabled={!isComplete || isSubmitting}
          className={`pop-btn w-full py-3.5 font-black text-sm sm:text-base font-bangla flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            isComplete && !isSubmitting
              ? 'bg-[#4ECDC4] text-[#1E232A] shadow-pop hover:bg-[#3dbdb5] active:translate-y-0.5'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>{isSubmitting ? 'জমা হচ্ছে...' : 'ভোট জমা দাও ও ফাইনাল ব্যাজ দেখো'}</span>
          <Sparkles className="w-4 h-4 text-[#F9D342]" />
        </button>
      </div>
    </div>
  );
};
