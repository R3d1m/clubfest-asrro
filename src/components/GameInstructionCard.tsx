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
          title: 'স্টিলথ ব্যাটেলশিপ',
          icon: '🚢',
          badgeText: '৩৫×৩৫ ডিপার্টমেন্ট হান্টিং',
          badgeBg: '#FFE0E2',
          badgeColor: '#D32F2F',
          bullets: [
            {
              emoji: '🗺️',
              title: 'লুকানো ঘাঁটি:',
              desc: '৩৫×৩৫ ম্যাপের কুয়াশায় চুয়েটের ১২টি ডিপার্টমেন্টের ৪-টাইল বিশিষ্ট ঘাঁটি লুকানো আছে।'
            },
            {
              emoji: '⚡',
              title: '৩টি চাল (Action Points):',
              desc: 'তোমাকে দেওয়া হচ্ছে মোট ৩টি চাল। চালগুলো সতর্কভাবে ব্যবহার করো!'
            },
            {
              emoji: '🎯',
              title: 'আক্রমণ মোড (ATTACK):',
              desc: 'কুয়াশায় ট্যাপ করে শত্রুর ঘাঁটি খুঁজুন। শত্রুর ঘাঁটি উন্মোচিত হলে পাবে ১০০ পয়েন্ট (+ডিপার্টমেন্ট মাল্টিপ্লায়ার)!'
            },
            {
              emoji: '🌫️',
              title: 'লুকানো মোড (HIDE):',
              desc: 'নিজের ডিপার্টমেন্টের বেস ফাঁস হয়ে থাকলে ধোঁয়া ছড়িয়ে পুনরায় লুকিয়ে ফেলো।'
            },
            {
              emoji: '🏆',
              title: 'বিজয়ের শর্ত:',
              desc: 'বিজয়ী হবে তারাই যারা নিজেদের গোপন রেখে অন্যদের সবচেয়ে বেশি এক্সপোজ (উন্মোচন) করবে!'
            }
          ],
          buttonText: 'ব্যাটেলশিপ শুরু করো',
          accentColor: '#FF6B6B'
        };
      case 2:
        return {
          stepNum: 'গেম ২/৩',
          title: 'মেগা কানেক্ট-৪',
          icon: '🔴',
          badgeText: '১২-ডিপার্টমেন্ট লাইভ বোর্ড',
          badgeBg: '#D4F8F0',
          badgeColor: '#00897B',
          bullets: [
            {
              emoji: '🎯',
              title: '১টি বল ড্রপ:',
              desc: 'বোর্ডের ১৪টি কলামের যেকোনো একটিতে তোমার ডিপার্টমেন্টের ১টি বল ড্রপ করতে পারবে।'
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
          buttonText: 'কানেক্ট-৪ এ বল ফেলুন',
          accentColor: '#4ECDC4'
        };
      case 3:
        return {
          stepNum: 'গেম ৩/৩',
          title: 'ব্যক্তিগত টাওয়ার স্ট্যাক',
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
          buttonText: 'স্ট্যাকিং শুরু করো',
          accentColor: '#FFA931'
        };
    }
  };

  const data = getGameData();

  return (
    <div className="w-full max-w-lg mx-auto p-3 sm:p-4 flex flex-col items-center justify-center min-h-[calc(100vh-65px)]">
      <div className="pop-box w-full p-5 sm:p-6 bg-[#FFFBEB] border-4 border-[#1E232A] text-center space-y-4 animate-bounce-in shadow-pop-lg">
        {/* Step Badge */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#FFF9D2] border-2 border-[#1E232A] rounded-full text-xs font-black text-[#1E232A] font-bangla shadow-xs">
          <span>{data.stepNum}</span>
          <span>•</span>
          <span style={{ color: data.badgeColor }}>{data.badgeText}</span>
        </div>

        {/* Big Game Icon */}
        <div 
          className="w-16 h-16 mx-auto rounded-3xl border-3 border-[#1E232A] shadow-pop flex flex-col items-center justify-center animate-bounce"
          style={{ backgroundColor: data.accentColor }}
        >
          <span className="text-3xl">{data.icon}</span>
        </div>

        <div>
          <h2 className="text-2xl font-black font-bangla text-[#1E232A] leading-tight">
            {data.title}
          </h2>
          <p className="text-xs font-bold text-gray-500 font-bangla mt-0.5">
            খেলার নিয়ম ও কৌশল পড়ে নিন:
          </p>
        </div>

        {/* Bullet Points Container */}
        <div className="p-3.5 bg-white rounded-2xl border-3 border-[#1E232A] shadow-pop-sm text-left font-bangla space-y-2.5">
          {data.bullets.map((b, idx) => (
            <div key={idx} className="flex items-start space-x-2.5 pb-1 border-b border-gray-100 last:border-b-0 last:pb-0">
              <span className="text-base flex-shrink-0 mt-0.5">{b.emoji}</span>
              <div className="text-xs leading-relaxed">
                <strong className="text-[#1E232A] font-black mr-1">{b.title}</strong>
                <span className="text-gray-700 font-medium">{b.desc}</span>
              </div>
            </div>
          ))}

          {gameIndex === 3 && (
            <div className="p-2.5 bg-[#FFF9D2] rounded-xl border-2 border-[#FFA931] flex items-center space-x-2 mt-2 shadow-xs">
              <Gift className="w-5 h-5 text-amber-600 flex-shrink-0 animate-bounce" />
              <span className="text-xs font-black text-[#D67229]">
                🎁 টপ ৫ বিজয়ীদের জন্য ASRRO স্পেশাল রিওয়ার্ড নিশ্চিত!
              </span>
            </div>
          )}
        </div>

        {/* Start Game Action Button */}
        <button
          onClick={handleProceed}
          className="pop-btn w-full py-3.5 bg-[#4ECDC4] text-[#1E232A] font-black text-base font-bangla flex items-center justify-center space-x-2 hover:bg-[#3dbdb5] shadow-pop transition-all active:translate-y-0.5"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>{data.buttonText}</span>
          <Sparkles className="w-4 h-4 text-[#F9D342]" />
        </button>
      </div>
    </div>
  );
};
