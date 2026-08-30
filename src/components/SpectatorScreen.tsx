import React, { useState } from 'react';
import { Trophy, Maximize, Minimize, Users } from 'lucide-react';
import { ServerStateSnapshot } from '../types';

interface SpectatorScreenProps {
  serverState?: ServerStateSnapshot | null;
  onBackToPlayer: () => void;
}

export const SpectatorScreen: React.FC<SpectatorScreenProps> = ({ serverState, onBackToPlayer }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const leaderboard = serverState?.overallLeaderboard || [];
  const battleshipRanks = [...leaderboard].sort((a, b) => b.battleshipScore - a.battleshipScore || b.battleshipFragmentsFound - a.battleshipFragmentsFound);
  const connect4Ranks = [...leaderboard].sort((a, b) => b.connect4Score - a.connect4Score);
  const topStackers = serverState?.stackerTopRecords || [];
  const poll = serverState?.pollStats;
  const recentActivities = serverState?.recentActivities || [];

  const hasAnyBattleship = battleshipRanks.some(d => d.battleshipScore > 0 || d.battleshipFragmentsFound > 0);
  const hasAnyConnect4 = connect4Ranks.some(d => d.connect4Score > 0);
  const hasAnyGrand = leaderboard.some(d => d.grandScore > 0);

  return (
    <div className="w-full min-h-screen bg-[#F9D342] text-[#1E232A] p-3 sm:p-5 flex flex-col justify-between font-bangla select-none">
      {/* Top Banner */}
      <div className="pop-box w-full p-3 sm:p-4 bg-[#1E232A] text-white flex items-center justify-between shadow-pop-lg border-4 border-[#1E232A]">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-[#F9D342] text-[#1E232A] flex items-center justify-center font-black text-2xl shadow-pop-sm border-2 border-white">
            ⚔️
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#F9D342] tracking-wide leading-tight">
              ডিপার্টমেন্ট ক্ল্যাশ ২০২৬ • লাইভ ফেস্ট এরিনা
            </h1>
            <p className="text-xs text-gray-300 font-bold">
              ১২টি ডিপার্টমেন্টের সরাসরি লড়াই • লাইভ প্রজেক্টর ভিউ
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-[#2C3E50] rounded-xl border-2 border-white/20 text-xs font-bold">
            <Users className="w-4 h-4 text-[#4ECDC4]" />
            <span>মোট খেলোয়াড়: {serverState?.stats.totalPlayed || 0} জন</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-[#6C7A89] border-2 border-white/40 text-white shadow-pop-sm hover:bg-[#586470]"
            title="ফুলস্ক্রিন"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 4 Main Arena Quadrants (Side-by-Side) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 my-3.5 flex-1">
        {/* Quadrant 1: Battleship Base Hunters */}
        <div className="pop-box p-4 bg-white border-3 border-[#1E232A] flex flex-col shadow-pop">
          <div className="flex items-center justify-between border-b-3 border-[#1E232A] pb-2 mb-2.5">
            <div className="flex items-center space-x-1.5">
              <span className="text-xl">🎯</span>
              <h2 className="font-black text-sm text-[#1E232A]">গুপ্ত বনাম প্রকাশ্য</h2>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 bg-[#FFE0E2] border border-[#1E232A] rounded-md text-[#D32F2F]">
              শত্রু ঘাঁটি উন্মোচন
            </span>
          </div>

          <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
            {battleshipRanks.slice(0, 7).map((dept, idx) => {
              const isLeader = hasAnyBattleship && idx === 0 && (dept.battleshipScore > 0 || dept.battleshipFragmentsFound > 0);
              return (
                <div
                  key={dept.deptCode}
                  className="p-2 rounded-xl border-2 border-[#1E232A] flex items-center justify-between text-xs font-black shadow-pop-sm"
                  style={{ backgroundColor: isLeader ? '#FFE66D' : '#F8F9FA' }}
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-5 text-center font-bold text-gray-500">
                      {isLeader ? '👑' : `#${idx + 1}`}
                    </span>
                    <span 
                      className="px-1.5 py-0.5 rounded-md text-[10px] text-white border border-[#1E232A]"
                      style={{ backgroundColor: dept.themeColor }}
                    >
                      {dept.deptAbbr}
                    </span>
                    <span className="truncate max-w-[85px]">{dept.deptName}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-display font-black text-red-600 block leading-tight">
                      +{dept.battleshipScore} pts
                    </span>
                    <span className="text-[9px] text-gray-500 font-bold block">
                      {dept.battleshipFragmentsFound}টি ঘাঁটি ফাঁদ
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quadrant 2: Mega Connect-4 */}
        <div className="pop-box p-4 bg-white border-3 border-[#1E232A] flex flex-col shadow-pop">
          <div className="flex items-center justify-between border-b-3 border-[#1E232A] pb-2 mb-2.5">
            <div className="flex items-center space-x-1.5">
              <span className="text-xl">🔴</span>
              <h2 className="font-black text-sm text-[#1E232A]">ডিপার্টমেন্টাল বন্ডিং</h2>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 bg-[#D4F8F0] border border-[#1E232A] rounded-md text-[#00897B]">
              গ্রে লক পয়েন্ট
            </span>
          </div>

          <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
            {connect4Ranks.slice(0, 7).map((dept, idx) => {
              const isLeader = hasAnyConnect4 && idx === 0 && dept.connect4Score > 0;
              return (
                <div
                  key={dept.deptCode}
                  className="p-2 rounded-xl border-2 border-[#1E232A] flex items-center justify-between text-xs font-black shadow-pop-sm"
                  style={{ backgroundColor: isLeader ? '#D4F8F0' : '#F8F9FA' }}
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-5 text-center font-bold text-gray-500">
                      {isLeader ? '👑' : `#${idx + 1}`}
                    </span>
                    <span 
                      className="px-1.5 py-0.5 rounded-md text-[10px] text-white border border-[#1E232A]"
                      style={{ backgroundColor: dept.themeColor }}
                    >
                      {dept.deptAbbr}
                    </span>
                    <span className="truncate max-w-[90px]">{dept.deptName}</span>
                  </div>
                  <span className="font-display font-black text-[#3585DA]">
                    +{dept.connect4Score} pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quadrant 3: Individual Stacker Hall of Fame */}
        <div className="pop-box p-4 bg-white border-3 border-[#1E232A] flex flex-col shadow-pop">
          <div className="flex items-center justify-between border-b-3 border-[#1E232A] pb-2 mb-2.5">
            <div className="flex items-center space-x-1.5">
              <span className="text-xl">🏗️</span>
              <h2 className="font-black text-sm text-[#1E232A]">নাম কামাও!</h2>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 bg-[#FFE0E2] border border-[#1E232A] rounded-md text-[#D32F2F]">
              সর্বোচ্চ তলা
            </span>
          </div>

          <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
            {topStackers.length > 0 ? (
              topStackers.slice(0, 7).map((record, idx) => (
                <div
                  key={record.studentId + idx}
                  className="p-2 rounded-xl border-2 border-[#1E232A] flex items-center justify-between text-xs font-black shadow-pop-sm"
                  style={{ backgroundColor: idx === 0 ? '#FFF2DC' : '#F8F9FA' }}
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-5 text-center font-bold text-gray-500">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </span>
                    <div>
                      <span className="block text-[11px] font-black leading-tight text-[#1E232A]">
                        {record.studentId} ({record.deptAbbr})
                      </span>
                    </div>
                  </div>
                  <span className="font-display font-black text-amber-600">
                    {record.floors} তলা
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center text-xs text-gray-400 py-8 font-bold">
                স্ট্যাকিং গেম খেললেই নাম উঠবে!
              </div>
            )}
          </div>
        </div>

        {/* Quadrant 4: Spicy Fest Poll Infographics */}
        <div className="pop-box p-4 bg-white border-3 border-[#1E232A] flex flex-col shadow-pop">
          <div className="flex items-center justify-between border-b-3 border-[#1E232A] pb-2 mb-2.5">
            <div className="flex items-center space-x-1.5">
              <span className="text-xl">🌶️</span>
              <h2 className="font-black text-sm text-[#1E232A]">স্পাইসি ফেস্ট পোল</h2>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 bg-[#EFE6FD] border border-[#1E232A] rounded-md text-[#845EC2]">
              {poll?.totalVotes || 0} ভোট
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {/* Top Chill */}
            <div className="p-2 bg-[#F8F9FA] rounded-xl border border-[#1E232A]">
              <span className="text-[10px] font-bold text-gray-500 block">😴 সবচেয়ে চিল ও ঘুমন্ত:</span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-xs font-black text-purple-700">
                  {Object.entries(poll?.q1 || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || 'ভোট চলছে...'}
                </span>
                <span className="text-[10px] font-bold text-gray-500">
                  {Object.entries(poll?.q1 || {}).sort((a, b) => b[1] - a[1])[0]?.[1] || 0} ভোট
                </span>
              </div>
            </div>

            {/* Top Hype */}
            <div className="p-2 bg-[#F8F9FA] rounded-xl border border-[#1E232A]">
              <span className="text-[10px] font-bold text-gray-500 block">⚡ সবচেয়ে বেশি হাইপ:</span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-xs font-black text-amber-600">
                  {Object.entries(poll?.q2 || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || 'ভোট চলছে...'}
                </span>
                <span className="text-[10px] font-bold text-gray-500">
                  {Object.entries(poll?.q2 || {}).sort((a, b) => b[1] - a[1])[0]?.[1] || 0} ভোট
                </span>
              </div>
            </div>

            {/* Canteen Kings */}
            <div className="p-2 bg-[#F8F9FA] rounded-xl border border-[#1E232A]">
              <span className="text-[10px] font-bold text-gray-500 block">☕ ক্যান্টিনের আড্ডায় সেরা:</span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-xs font-black text-emerald-600">
                  {Object.entries(poll?.q3 || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || 'ভোট চলছে...'}
                </span>
                <span className="text-[10px] font-bold text-gray-500">
                  {Object.entries(poll?.q3 || {}).sort((a, b) => b[1] - a[1])[0]?.[1] || 0} ভোট
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grand Standings & Live Activity Ticker */}
      <div className="space-y-2">
        {/* Overall Grand Podium Bar */}
        <div className="pop-box p-3 bg-[#FFFBEB] border-4 border-[#1E232A] shadow-pop flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Trophy className="w-7 h-7 text-amber-500 flex-shrink-0 animate-bounce" />
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">গ্র্যান্ড চ্যাম্পিয়নশিপ</span>
              <h3 className="text-sm font-black text-[#1E232A]">সামগ্রিক শীর্ষ ডিপার্টমেন্ট:</h3>
            </div>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
            {leaderboard.slice(0, 5).map((dept, idx) => {
              const isLeader = hasAnyGrand && idx === 0 && dept.grandScore > 0;
              return (
                <div
                  key={dept.deptCode}
                  className="px-3 py-1.5 rounded-xl border-2 border-[#1E232A] flex items-center space-x-2 text-xs font-black shadow-pop-sm flex-shrink-0"
                  style={{ backgroundColor: isLeader ? '#FFE66D' : '#FFFFFF' }}
                >
                  <span>{isLeader ? '👑 ১.' : `${idx + 1}.`}</span>
                  <span 
                    className="px-1.5 py-0.5 rounded text-[10px] text-white border border-[#1E232A]"
                    style={{ backgroundColor: dept.themeColor }}
                  >
                    {dept.deptAbbr}
                  </span>
                  <span className="font-display font-black">{dept.grandScore} Pts</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Activity Ticker */}
        <div className="pop-box p-2.5 bg-[#1E232A] text-white border-3 border-[#1E232A] flex items-center space-x-3 overflow-hidden shadow-pop-sm">
          <div className="px-2 py-0.5 rounded-md bg-[#FF5964] text-white text-[10px] font-black flex-shrink-0 animate-pulse">
            LIVE
          </div>
          <div className="text-xs font-medium truncate flex-1 text-gray-200">
            {recentActivities.length > 0 
              ? recentActivities[recentActivities.length - 1]?.text 
              : 'ফেস্টের সরাসরি কার্যক্রম ও লড়াই শুরু হওয়ার অপেক্ষায়...'}
          </div>
        </div>
      </div>
    </div>
  );
};
