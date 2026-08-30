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
              desc: '৩৫×৩৫ ম্যাপের কুয়াশায় ১২টি ডিপার্টমেন্টের ঘাঁটি লুকানো আছে।'
            },
            {
              emoji: '⚡',
              title: '৩টি চাল (AP):',
              desc: 'তোমাকে দেওয়া হচ্ছে মোট ৩টি সুযোগ। প্রতিটি চাল ভেবেচিন্তে ব্যবহার করো!'
            },
            {
              emoji: '🎯',
              title: 'আক্রমণ মোড:',
              desc: 'কুয়াশায় ট্যাপ করে ঘাঁটি উন্মোচন করো! ঘাঁটি ফাঁস করলে ১০০ পয়েন্ট।'
            },
            {
              emoji: '🌫️',
              title: 'লুকানো মোড:',
              desc: 'নিজের ডিপার্টমেন্টের বেস ফাঁস হয়ে থাকলে ধোঁয়া ছড়িয়ে পুনরায় লুকাও।'
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
              desc: 'বোর্ডের যেকোনো একটি কলামে তোমার ডিপার্টমেন্টের ১টি বল ফেলবে।'
            },
            {
              emoji: '⭐',
              title: 'পরপর ৪-এ বাজিমাত (+১০০ Pts):',
              desc: 'তোমার ডিপার্টমেন্টের ৪টি বল মিললেই পার্মানেন্ট গ্রে লক ও ১০০ পয়েন্ট!'
            },
            {
              emoji: '🤝',
              title: 'টিম কোঅর্ডিনেশন:',
              desc: 'বন্ধুদের বলো তোমার বলের পাশেই বল ড্রপ করে লাইন বাড়াতে!'
            },
            {
              emoji: '🛡️',
              title: 'শত্রুকে ব্লক করো:',
              desc: 'অন্যরা ৪টি মেলানোর আগেই ওদের লাইনের মাঝে বল ফেলে আটকে দাও!'
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
              desc: 'স্লাইডিং ব্লক ঠিক ওপর ট্যাপ করে যত বেশি তলা উঠবে, তত বেশি পয়েন্ট।'
            },
            {
              emoji: '⚡',
              title: 'পারফেক্ট টাইমিং ও কম্বো:',
              desc: 'নিখুঁত বসালে কম্বো বোনাস পাবে। মিস হলে ব্লক কেটে ছোট হবে!'
            },
            {
              emoji: '🎁',
              title: 'ASRRO বিশেষ উপহার:',
              desc: 'ফেস্ট শেষে যারা টপ ৫ এ থাকবে, তারা পাবে আকর্ষণীয় উপহার!'
            }
          ],
          buttonText: 'কামানো শুরু করো',
          accentColor: '#FFA931'
        };
    }
  };

  const data = getGameData();

  return (
    <div className="w-full h-full flex flex-col justify-between animate-bounce-in overflow-hidden">
      <div className="pop-box w-full flex-1 p-3.5 sm:p-4 bg-[#FFFBEB] flex flex-col justify-between gap-2.5 shadow-pop-lg overflow-hidden">
        {/* Top Header Row */}
        <div className="flex items-center justify-between border-b-2 border-dashed border-[#1E232A]/20 pb-2 flex-shrink-0">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-[#FFF9D2] border-2 border-[#1E232A] rounded-full text-[11px] font-black text-[#1E232A]">
            <span>{data.stepNum}</span>
            <span>•</span>
            <span style={{ color: data.badgeColor }}>{data.badgeText}</span>
          </div>

          <div 
            className="w-10 h-10 rounded-2xl border-2.5 border-[#1E232A] shadow-pop-sm flex items-center justify-center text-xl animate-bounce"
            style={{ backgroundColor: data.accentColor }}
          >
            {data.icon}
          </div>
        </div>

        {/* Title */}
        <div className="text-left flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-black font-bangla text-[#1E232A] leading-tight">
            {data.title}
          </h2>
          <p className="text-[11px] font-bold text-gray-500 font-bangla">
            খেলার নিয়ম ও কৌশল পড়ে নাও:
          </p>
        </div>

        {/* Bullet Points Container */}
        <div className="p-2.5 bg-white rounded-2xl border-2.5 border-[#1E232A] shadow-pop-sm text-left font-bangla space-y-2 flex-1 min-h-0 overflow-y-auto">
          {data.bullets.map((b, idx) => (
            <div key={idx} className="flex items-start space-x-2 pb-1.5 border-b border-gray-100 last:border-b-0 last:pb-0">
              <span className="text-lg flex-shrink-0">{b.emoji}</span>
              <div className="text-xs leading-snug">
                <strong className="text-[#1E232A] font-black text-xs mr-1 block sm:inline">
                  {b.title}
                </strong>
                <span className="text-gray-700 font-medium text-[11px]">
                  {b.desc}
                </span>
              </div>
            </div>
          ))}

          {gameIndex === 3 && (
            <div className="p-2 bg-[#FFF9D2] rounded-xl border-2 border-[#FFA931] flex items-center space-x-2 shadow-xs">
              <Gift className="w-5 h-5 text-amber-600 flex-shrink-0 animate-bounce" />
              <span className="text-[11px] font-black text-[#D67229] leading-tight">
                🎁 টপ ৫ বিজয়ীদের জন্য ASRRO স্পেশাল উপহার নিশ্চিত!
              </span>
            </div>
          )}
        </div>

        {/* Big Start Button */}
        <button
          onClick={handleProceed}
          className="pop-btn w-full py-3.5 bg-[#4ECDC4] text-[#1E232A] font-black text-base font-bangla flex items-center justify-center space-x-2 hover:bg-[#3dbdb5] shadow-pop transition-all active:translate-y-0.5 cursor-pointer flex-shrink-0"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>{data.buttonText}</span>
          <Sparkles className="w-4 h-4 text-[#F9D342]" />
        </button>
      </div>
    </div>
  );
};
