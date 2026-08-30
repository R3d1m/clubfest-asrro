import React from 'react';
import { Volume2, VolumeX, Shield } from 'lucide-react';
import { sound } from '../utils/sound';
import { ParsedStudent, PlayerStage } from '../types';

interface HeaderProps {
  student?: ParsedStudent | null;
  currentStage?: PlayerStage;
}

export const Header: React.FC<HeaderProps> = ({
  student,
  currentStage
}) => {
  const [muted, setMuted] = React.useState(!sound.enabled);

  const toggleSound = () => {
    sound.enabled = !sound.enabled;
    setMuted(!sound.enabled);
    if (sound.enabled) {
      sound.playPop();
    }
  };

  const getStageTitle = () => {
    switch (currentStage) {
      case 'BRIEFING':
      case 'STAGE_1_INSTRUCTION':
      case 'STAGE_1_BATTLESHIP':
        return '১. গুপ্ত বনাম প্রকাশ্য';
      case 'STAGE_2_INSTRUCTION':
      case 'STAGE_2_CONNECT4':
        return '২. ডিপার্টমেন্টাল বন্ডিং';
      case 'STAGE_3_INSTRUCTION':
      case 'STAGE_3_STACK':
        return '৩. নাম কামাও!';
      case 'STAGE_4_POLL':
        return '৪. স্পাইসি পোল';
      case 'COMPLETED':
        return 'ফলাফল ও ব্যাজ';
      default:
        return 'ডিপার্টমেন্ট ক্ল্যাশ';
    }
  };

  return (
    <header className="w-full bg-[#1E232A] text-white px-3 py-2 border-b-3 border-[#1E232A] shadow-md flex items-center justify-between flex-shrink-0 z-50">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-xl bg-[#F9D342] text-[#1E232A] flex items-center justify-center font-black text-base shadow-pop-sm border-2 border-[#1E232A] flex-shrink-0">
          ⚔️
        </div>
        <div>
          <h1 className="font-extrabold text-sm leading-tight tracking-wide font-bangla text-[#F9D342]">
            ডিপার্টমেন্ট ক্ল্যাশ ২০২৬
          </h1>
          <p className="text-[10px] text-gray-300 font-medium font-bangla leading-none mt-0.5">
            {getStageTitle()}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {student && (
          <div 
            className="px-2.5 py-1 rounded-lg text-xs font-black border-2 border-[#1E232A] flex items-center space-x-1 shadow-pop-sm"
            style={{ backgroundColor: student.themeColor, color: '#1E232A' }}
          >
            <Shield className="w-3 h-3" />
            <span>{student.deptAbbr} '{student.batchShort}</span>
          </div>
        )}

        <button
          onClick={toggleSound}
          className="p-1.5 rounded-xl bg-[#6C7A89] border-2 border-[#1E232A] text-white shadow-pop-sm active:translate-y-0.5 cursor-pointer"
          title="সাউন্ড চালু/বন্ধ"
        >
          {muted ? <VolumeX className="w-4 h-4 text-red-300" /> : <Volume2 className="w-4 h-4 text-green-300" />}
        </button>
      </div>
    </header>
  );
};
