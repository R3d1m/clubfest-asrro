import React, { useEffect, useState, useMemo } from 'react';
import { Share2, Download, Sparkles, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ParsedStudent, PlayerRecord } from '../types';
import { sound } from '../utils/sound';
import { generateHeroCardData } from '../utils/constellation';

interface HeroSummaryProps {
  student: ParsedStudent;
  player: PlayerRecord;
}

export const HeroSummary: React.FC<HeroSummaryProps> = ({
  student,
  player
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const cardData = useMemo(() => {
    return generateHeroCardData(student, player);
  }, [student, player]);

  useEffect(() => {
    sound.playStreakChime();
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.5 }
    });
  }, []);

  // HD Canvas Export directly to PNG Download
  const handleDownloadImage = async () => {
    setIsExporting(true);
    sound.playPop();

    try {
      const canvas = document.createElement('canvas');
      const width = 1080;
      const height = 1520;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Deep Cosmic Cyber Gradient Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#0F172A');
      bgGrad.addColorStop(0.5, '#1E232A');
      bgGrad.addColorStop(1, '#0B0F19');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Starry Dust Particles
      for (let i = 0; i < 110; i++) {
        const sx = Math.random() * width;
        const sy = Math.random() * height;
        const sr = Math.random() * 2.2 + 0.4;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Outer Gold/Neon Cyber Frame
      ctx.strokeStyle = '#F9D342';
      ctx.lineWidth = 14;
      ctx.strokeRect(30, 30, width - 60, height - 60);

      // 2. Header Banner
      ctx.fillStyle = '#1E232A';
      ctx.fillRect(60, 60, width - 120, 160);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.strokeRect(60, 60, width - 120, 160);

      // Fest Title & Subtitle
      ctx.fillStyle = '#F9D342';
      ctx.font = '900 38px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('⚔️ DEPARTMENT CLASH 2026', 100, 125);

      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('ASRRO FEST ARENA • OFFICIAL CELESTIAL HERO CARD', 100, 175);

      // Rarity Pill (Top Right)
      ctx.fillStyle = cardData.rarityColor;
      ctx.beginPath();
      ctx.roundRect(width - 430, 95, 350, 50, 25);
      ctx.fill();
      ctx.fillStyle = '#1E232A';
      ctx.font = '900 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(cardData.rarityLabel, width - 255, 128);

      // 3. Center Constellation Hologram Box
      const constBoxY = 250;
      const constBoxH = 590;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.fillRect(60, constBoxY, width - 120, constBoxH);
      ctx.strokeStyle = student.themeColor || '#4ECDC4';
      ctx.lineWidth = 5;
      ctx.strokeRect(60, constBoxY, width - 120, constBoxH);

      // Constellation Box Label
      ctx.fillStyle = student.themeColor || '#4ECDC4';
      ctx.font = '900 28px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`✨ ${cardData.constellationName} • ${student.deptAbbr}`, 90, constBoxY + 50);

      ctx.fillStyle = '#E2E8F0';
      ctx.font = '22px sans-serif';
      ctx.fillText(cardData.constellationMythBangla, 90, constBoxY + 85);

      // Draw Constellation Edges
      const cLeft = 120;
      const cTop = constBoxY + 120;
      const cW = width - 240;
      const cH = constBoxH - 180;

      ctx.strokeStyle = 'rgba(78, 205, 196, 0.75)';
      ctx.lineWidth = 4;
      cardData.edges.forEach(({ from, to }) => {
        const n1 = cardData.nodes[from];
        const n2 = cardData.nodes[to];
        if (n1 && n2) {
          ctx.beginPath();
          ctx.moveTo(cLeft + (n1.x / 100) * cW, cTop + (n1.y / 100) * cH);
          ctx.lineTo(cLeft + (n2.x / 100) * cW, cTop + (n2.y / 100) * cH);
          ctx.stroke();
        }
      });

      // Draw Constellation Nodes with ID Digit Badges
      cardData.nodes.forEach((n, idx) => {
        const nx = cLeft + (n.x / 100) * cW;
        const ny = cTop + (n.y / 100) * cH;

        // Glow Aura
        const glow = ctx.createRadialGradient(nx, ny, 2, nx, ny, 28);
        glow.addColorStop(0, 'rgba(255, 230, 109, 0.95)');
        glow.addColorStop(1, 'rgba(255, 230, 109, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(nx, ny, 28, 0, Math.PI * 2);
        ctx.fill();

        // Star Circle
        ctx.fillStyle = n.isApex ? '#FFE66D' : '#FFFFFF';
        ctx.beginPath();
        ctx.arc(nx, ny, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1E232A';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Digit inside the Star
        ctx.fillStyle = '#1E232A';
        ctx.font = '900 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.digitLabel || `${idx + 1}`, nx, ny + 1);
      });

      // 4. Student Identity & Constellation Reason Banner
      const idBoxY = 870;
      ctx.fillStyle = '#FFFBEB';
      ctx.fillRect(60, idBoxY, width - 120, 170);
      ctx.strokeStyle = '#1E232A';
      ctx.lineWidth = 5;
      ctx.strokeRect(60, idBoxY, width - 120, 170);

      ctx.fillStyle = '#1E232A';
      ctx.font = '900 44px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(`${student.studentId} • ${student.deptName} (${student.deptAbbr})`, 90, idBoxY + 55);

      ctx.fillStyle = '#0F766E';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(`💡 বরাদ্দ পাওয়ার কারণ: ${cardData.constellationReason}`, 90, idBoxY + 105);

      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(`পদবী: ${cardData.archetypeTitle}`, 90, idBoxY + 148);

      // 5. In-Game Tactical Achievements Grid
      const statsY = 1070;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(60, statsY, width - 120, 230);
      ctx.strokeStyle = '#1E232A';
      ctx.lineWidth = 5;
      ctx.strokeRect(60, statsY, width - 120, 230);

      ctx.fillStyle = '#1E232A';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(`🚢 ব্যাটেলশিপ: ${player.battleshipMoves?.length || 3}টি চাল সম্পন্ন`, 90, statsY + 60);
      ctx.fillText(`🔴 কানেক্ট-৪: কলাম ${player.connect4Col !== null ? player.connect4Col + 1 : 1} ড্রপ (+10 pts)`, 90, statsY + 115);
      ctx.fillText(`🏗️ টাওয়ার স্ট্যাকিং: ${player.stackFloors} তলা (×${player.stackCombos} কম্বো)`, 90, statsY + 170);

      // Total Score Highlight
      ctx.fillStyle = '#059669';
      ctx.font = '900 36px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`+${player.totalPointsEarned} PTS`, width - 90, statsY + 120);

      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('মোট অর্জিত পয়েন্ট', width - 90, statsY + 160);

      // 6. Footer Verification Stamp
      ctx.fillStyle = '#F9D342';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ASRRO • CUET Club FEST 2026', width / 2, height - 85);

      // Download file
      const link = document.createElement('a');
      link.download = `ConstellationHero-${student.studentId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Image download error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = () => {
    sound.playPop();
    const shareText = `আমি ${student.deptName} এর জন্য লড়াই করে ${player.totalPointsEarned} পয়েন্ট অর্জন করেছি! ${cardData.constellationName} নক্ষত্রমণ্ডলে আমার পদবী: ${cardData.archetypeTitle} 🚀`;

    if (navigator.share) {
      navigator.share({
        title: 'ডিপার্টমেন্ট ক্ল্যাশ ২০২৬ • নক্ষত্রমণ্ডল হিরো কার্ড',
        text: shareText,
        url: window.location.origin
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(shareText);
      alert('কার্ডের বিবরণ ও টেক্সট ক্লিপবোর্ডে কপি হয়েছে!');
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between animate-bounce-in overflow-hidden">
      {/* Main Cosmic Hero Trading Card */}
      <div className="pop-box w-full flex-1 p-3.5 bg-[#111827] text-white border-3.5 border-[#1E232A] flex flex-col justify-between gap-2 shadow-pop-lg overflow-hidden relative">
        {/* Top Header & Rarity Bar */}
        <div className="flex items-center justify-between border-b-2 border-white/20 pb-2 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div 
              className="w-10 h-10 rounded-xl border-2 border-white flex flex-col items-center justify-center text-lg shadow-sm"
              style={{ backgroundColor: student.themeColor }}
            >
              <span>{cardData.constellationSymbol}</span>
            </div>

            <div className="text-left">
              <div className="flex items-center space-x-1.5">
                <span className="font-mono font-black text-base tracking-wider text-[#F9D342]">
                  {student.studentId}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 font-bold">
                  {student.deptAbbr} '{student.batchShort}
                </span>
              </div>
              <p className="text-[10px] text-teal-300 font-bold font-bangla">
                {student.deptName}
              </p>
            </div>
          </div>

          <div 
            className="px-2 py-0.5 rounded-full text-[10px] font-black border border-white/40 shadow-xs"
            style={{ backgroundColor: cardData.rarityColor, color: '#1E232A' }}
          >
            {cardData.rarityLabel}
          </div>
        </div>

        {/* Center: ID-Generated Constellation Star Map */}
        <div className="flex-1 min-h-0 w-full rounded-2xl bg-[#0F172A] border-2 border-white/20 p-2 relative flex flex-col justify-between overflow-hidden shadow-inner">
          <div className="flex items-center justify-between text-[10px] text-gray-300 font-bold z-10">
            <span className="text-teal-300 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>{cardData.constellationName}</span>
            </span>
            <span className="text-gray-400 font-bangla">{cardData.constellationMythBangla}</span>
          </div>

          {/* SVG Constellation with 7 ID Digits in the Stars */}
          <div className="flex-1 min-h-0 relative flex items-center justify-center py-1">
            <svg viewBox="0 0 100 100" className="w-full h-full max-h-[145px]">
              {/* Connector Beams */}
              {cardData.edges.map(({ from, to }, idx) => {
                const n1 = cardData.nodes[from];
                const n2 = cardData.nodes[to];
                if (!n1 || !n2) return null;
                return (
                  <line
                    key={idx}
                    x1={n1.x}
                    y1={n1.y}
                    x2={n2.x}
                    y2={n2.y}
                    stroke={student.themeColor || '#4ECDC4'}
                    strokeWidth="1.5"
                    strokeOpacity="0.8"
                    strokeDasharray={idx % 2 === 1 ? "2,2" : undefined}
                  />
                );
              })}

              {/* Glowing Star Nodes with ID Digits */}
              {cardData.nodes.map((n, idx) => (
                <g key={idx}>
                  {/* Glow Aura */}
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={n.size * 1.8}
                    fill="#FFE66D"
                    fillOpacity={0.3}
                    className="animate-pulse"
                  />
                  {/* Star Circle */}
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={n.size}
                    fill={n.isApex ? '#FFE66D' : '#FFFFFF'}
                    stroke="#1E232A"
                    strokeWidth="0.8"
                  />
                  {/* ID Digit printed right on the star */}
                  <text
                    x={n.x}
                    y={n.y}
                    fill="#1E232A"
                    fontSize={n.size * 1.1}
                    fontWeight="900"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {n.digitLabel}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Persona Label */}
          <div className="text-center bg-black/50 py-0.5 px-2 rounded-xl border border-white/10 text-[11px] font-black text-amber-300 z-10 flex items-center justify-between">
            <span>🎖️ {cardData.archetypeTitle}</span>
            <span className="text-[10px] text-gray-300 font-mono">আইডি নক্ষত্র: {student.studentId}</span>
          </div>
        </div>

        {/* Reason for Assignment Section */}
        <div className="p-2 bg-[#064E3B]/80 text-[#D1FAE5] rounded-xl border border-emerald-500/40 text-[10px] sm:text-[11px] font-bangla font-medium flex items-start space-x-1.5 flex-shrink-0">
          <Info className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-emerald-300 font-black">নক্ষত্রমণ্ডল পাওয়ার কারণ: </strong>
            <span>{cardData.constellationReason}</span>
          </div>
        </div>

        {/* Personal Game Contribution Metrics */}
        <div className="p-2 bg-white text-[#1E232A] rounded-xl border-2 border-[#1E232A] shadow-xs space-y-0.5 text-left font-bangla flex-shrink-0">
          <div className="flex items-center justify-between text-xs border-b border-gray-100 pb-0.5">
            <span className="text-gray-600 font-bold">🚢 ব্যাটেলশিপ: {player.battleshipMoves?.length || 3} চাল সম্পন্ন</span>
            <span className="font-bold text-gray-600">🔴 কানেক্ট-৪: C{player.connect4Col !== null ? player.connect4Col + 1 : 1} (+10)</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-0.5">
            <span className="font-bold text-amber-600">🏗️ স্ট্যাকিং: {player.stackFloors} তলা (×{player.stackCombos} কম্বো)</span>
            <span className="text-sm font-black text-emerald-600">+{player.totalPointsEarned} Pts</span>
          </div>
        </div>

        {/* Action Buttons: 1-Click PNG Download & Social Share */}
        <div className="grid grid-cols-2 gap-2 flex-shrink-0">
          <button
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="pop-btn py-2.5 bg-[#4ECDC4] text-[#1E232A] font-black text-xs sm:text-sm font-bangla flex items-center justify-center space-x-1.5 shadow-pop cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'তৈরি হচ্ছে...' : '📥 সেভ কার্ড (PNG)'}</span>
          </button>

          <button
            onClick={handleShare}
            className="pop-btn py-2.5 bg-[#FFE66D] text-[#1E232A] font-black text-xs sm:text-sm font-bangla flex items-center justify-center space-x-1.5 shadow-pop cursor-pointer active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>📸 স্টোরি শেয়ার</span>
          </button>
        </div>
      </div>
    </div>
  );
};
