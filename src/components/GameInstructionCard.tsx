import React from 'react';
import { Play, Sparkles, Target, Layers, CircleDot, Gift, CheckCircle2, ShieldAlert } from 'lucide-react';
import { ParsedStudent } from '../types';
import { sound } from '../utils/sound';
import { vibrate } from '../utils/haptics';

interface GameInstructionCardProps {
  gameIndex: 1 | 2 | 3;
  student: ParsedStudent;
  onProceed: () => void;
}

export const GameInstructionCard: React.FC<GameInstructionCardProps> = ({
  gameIndex,
  student,
  onProceed
}) => {
  const handleProceed = () => {
    sound.playPop(500);
    vibrate(30);
    onProceed();
  };

  const getGameData = () => {
    switch (gameIndex) {
      case 1:
        return {
          stepNum: 'গেম ১/৩',
          title: 'গুপ্ত বনাম প্রকাশ্য',
          icon: '🚢',
          badgeText: 'ডিপার্টমেন্ট হান্টিং',
          badgeBg: '#FFE0E2',
          badgeColor: '#D32F2F',
          bullets: [
            {
              emoji: '🗺️',
              title: 'লুকানো ঘাঁটি:',
              desc: '৩৫×৩৫ ম্যাপের কুয়াশায় ১২টি ডিপার্টমেন্টের ৪-টাইলের বেশ কিছু ঘাঁটি লুকানো আছে।'
            },
            {
              emoji: '⚡',
              title: '৩টি চাল (Action Points):',
              desc: 'তোমাকে দেওয়া হচ্ছে মোট ৩টি সুযোগ। প্রতিটি চাল ভেবেচিন্তে ব্যবহার করো!'
            },
            {
              emoji: '🎯',
              title: 'আক্রমণ মোড:',
              desc: 'কুয়াশায় ট্যাপ করে ঘাঁটি উন্মোচন করো! ঘাঁটি ফাঁস করতে পারলে ১০০ পয়েন্ট পাবে।'
            },
            {
              emoji: '🌫️',
              title: 'লুকানো মোড:',
              desc: 'নিজের ডিপার্টমেন্টের বেস ফাঁস হয়ে থাকলে ধোঁয়া ছড়িয়ে পুনরায় লুকিয়ে ফেলো।'
            },
            {
              emoji: '🏆',
              title: 'বিজয়ের শর্ত:',
              desc: 'বিজয়ী হবে তারাই যারা নিজেদের গুপ্ত রেখে অন্যদের সবচেয়ে বেশি Expose করবে!'
            }
          ],
          buttonText: 'অভিযান শুরু করো',
          accentColor: '#FF6B6B'
        };
      case 2:
        return {
          stepNum: 'গেম ২/৩',
          title: 'ডিপার্টমেন্টাল বন্ডিং',
          icon: '🔴',
          badgeText: '১২-ডিপার্টমেন্ট লাইভ বোর্ড',
          badgeBg: '#D4F8F0',
          badgeColor: '#00897B',
          bullets: [
            {
              emoji: '🎯',
              title: '১টি বল ড্রপ:',
              desc: 'বোর্ডের যেকোনো একটি কলামে তুমি তোমার ডিপার্টমেন্টের ১টি বল ফেলতে পারবে।'
            },
            {
              emoji: '⭐',
              title: 'পরপর ৪-এ বাজিমাত (+১০০ Pts):',
              desc: 'তোমার ডিপার্টমেন্টের ৪টি বল পাশাপাশি/উপরে/কোণাকুণি মিললেই পার্মানেন্ট গ্রে লক ও ১০০ পয়েন্ট পাবে!'
            },
            {
              emoji: '🤝',
              title: 'টিম কোঅর্ডিনেশন:',
              desc: 'তোমার ডিপার্টমেন্টের বন্ধুদের বলো তোমার বলের পাশেই বল ড্রপ করতে!'
            },
            {
              emoji: '🛡️',
              title: 'শত্রুকে ব্লক করো:',
              desc: 'অন্য ডিপার্টমেন্ট পরপর ৪টি মেলানোর আগেই ওদের লাইনের মাঝখানে বল ফেলে আটকে দাও!'
            }
          ],
          buttonText: 'বন্ডিং শুরু করো',
          accentColor: '#4ECDC4'
        };
      case 3:
        return {
          stepNum: 'গেম ৩/৩',
          title: 'নাম কামাও!',
          icon: '🏗️',
          badgeText: 'ASRRO বিশেষ উপহার',
          badgeBg: '#FFF2DC',
          badgeColor: '#D67229',
          bullets: [
            {
              emoji: '🏢',
              title: 'উঁচু টাওয়ার গড়ো:',
              desc: 'স্লাইডিং ব্লকগুলো ঠিক ওপর ট্যাপ করে যত বেশি তলা উঠতে পারবে, তত বেশি ব্যক্তিগত পয়েন্ট পাবে।'
            },
            {
              emoji: '⚡',
              title: 'পারফেক্ট টাইমিং ও কম্বো:',
              desc: 'নিখুঁত বসালে কম্বো বোনাস পাবে এবং ব্লক বড় হবে। মিস হলে ব্লক কেটে ছোট হতে থাকবে!'
            },
            {
              emoji: '🎁',
              title: 'ASRRO বিশেষ উপহার:',
              desc: 'ফেস্ট শেষে যারা টপ ৫ এ থাকবে, তারা ASRRO থেকে পাবে বিশেষ আকর্ষণীয় উপহার!'
            }
          ],
          buttonText: 'কামানো শুরু করো',
          accentColor: '#FFA931'
        };
    }
  };

  const data = getGameData();

  return (
    <div className="w-full flex-1 flex flex-col justify-between py-2 px-1 sm:px-3 animate-bounce-in">
      <div className="pop-box w-full p-4 sm:p-6 bg-[#FFFBEB] flex flex-col justify-between space-y-4 shadow-pop-lg">
        {/* Top Header Row */}
        <div className="flex items-center justify-between border-b-2 border-dashed border-[#1E232A]/20 pb-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#FFF9D2] border-2 border-[#1E232A] rounded-full text-xs font-black text-[#1E232A]">
            <span>{data.stepNum}</span>
            <span>•</span>
            <span style={{ color: data.badgeColor }}>{data.badgeText}</span>
          </div>

          <div 
            className="w-12 h-12 rounded-2xl border-3 border-[#1E232A] shadow-pop-sm flex items-center justify-center text-2xl animate-bounce"
            style={{ backgroundColor: data.accentColor }}
          >
            {data.icon}
          </div>
        </div>

        {/* Title */}
        <div className="text-left">
          <h2 className="text-2xl sm:text-3xl font-black font-bangla text-[#1E232A] leading-tight">
            {data.title}
          </h2>
          <p className="text-xs sm:text-sm font-bold text-gray-500 font-bangla mt-0.5">
            খেলার নিয়ম ও কৌশল পড়ে নাও:
          </p>
        </div>

        {/* Bullet Points Container */}
        <div className="p-3 sm:p-4 bg-white rounded-2xl border-3 border-[#1E232A] shadow-pop-sm text-left font-bangla space-y-3">
          {data.bullets.map((b, idx) => (
            <div key={idx} className="flex items-start space-x-3 pb-2 border-b border-gray-100 last:border-b-0 last:pb-0">
              <span className="text-xl flex-shrink-0 mt-0.5">{b.emoji}</span>
              <div className="text-xs sm:text-sm leading-snug">
                <strong className="text-[#1E232A] font-black text-sm sm:text-base mr-1 block sm:inline">
                  {b.title}
                </strong>
                <span className="text-gray-700 font-medium">
                  {b.desc}
                </span>
              </div>
            </div>
          ))}

          {gameIndex === 3 && (
            <div className="p-3 bg-[#FFF9D2] rounded-xl border-2 border-[#FFA931] flex items-center space-x-2.5 mt-2 shadow-xs">
              <Gift className="w-6 h-6 text-amber-600 flex-shrink-0 animate-bounce" />
              <span className="text-xs sm:text-sm font-black text-[#D67229] leading-tight">
                🎁 টপ ৫ বিজয়ীদের জন্য ASRRO স্পেশাল পুরস্কার নিশ্চিত!
              </span>
            </div>
          )}
        </div>

        {/* Big Start Button */}
        <button
          onClick={handleProceed}
          className="pop-btn w-full py-4 bg-[#4ECDC4] text-[#1E232A] font-black text-lg font-bangla flex items-center justify-center space-x-2 hover:bg-[#3dbdb5] shadow-pop transition-all active:translate-y-0.5 mt-2 cursor-pointer"
        >
          <Play className="w-6 h-6 fill-current" />
          <span>{data.buttonText}</span>
          <Sparkles className="w-5 h-5 text-[#F9D342]" />
        </button>
      </div>
    </div>
  );
};
