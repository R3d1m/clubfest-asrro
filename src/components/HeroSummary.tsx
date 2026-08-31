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

// Canvas Text-Wrapping Helper
function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number = 3
) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  let linesDrawn = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + (line ? ' ' : '') + words[n];
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, currentY);
      line = words[n];
      currentY += lineHeight;
      linesDrawn++;
      if (linesDrawn >= maxLines - 1) {
        const remaining = words.slice(n).join(' ');
        ctx.fillText(remaining, x, currentY);
        return;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}

export const HeroSummary: React.FC<HeroSummaryProps> = ({
  student,
  player
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const cardData = useMemo(() => {
    return generateHeroCardData(student, player);
  }, [student, player]);

  // Number of unveiled enemy bases
  const hitCount = useMemo(() => {
    return (player.battleshipMoves || []).filter(
      m => m.result === 'HIT' && m.hitDept && m.hitDept !== player.deptCode
    ).length;
  }, [player.battleshipMoves, player.deptCode]);

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
      for (let i = 0; i < 120; i++) {
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
      const headerY = 55;
      const headerH = 150;
      ctx.fillStyle = '#1E232A';
      ctx.fillRect(60, headerY, width - 120, headerH);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.strokeRect(60, headerY, width - 120, headerH);

      // Fest Title & Subtitle
      ctx.fillStyle = '#F9D342';
      ctx.font = '900 30px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('⚔️ DEPARTMENT CLASH 2026', 85, headerY + 60);

      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('ASRRO FEST ARENA • HERO ID CARD', 85, headerY + 105);

      // Rarity Pill (Top Right)
      const pillW = 300;
      const pillH = 46;
      const pillX = width - 85 - pillW;
      const pillY = headerY + 45;

      ctx.fillStyle = cardData.rarityColor;
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 23);
      ctx.fill();
      ctx.strokeStyle = '#1E232A';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#1E232A';
      ctx.font = '900 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(cardData.rarityLabel, pillX + pillW / 2, pillY + pillH / 2);
      ctx.textBaseline = 'alphabetic';

      // 3. Center Constellation Hologram Box
      const constBoxY = 225;
      const constBoxH = 610;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.fillRect(60, constBoxY, width - 120, constBoxH);
      ctx.strokeStyle = student.themeColor || '#4ECDC4';
      ctx.lineWidth = 5;
      ctx.strokeRect(60, constBoxY, width - 120, constBoxH);

      // Constellation Box Label
      ctx.fillStyle = student.themeColor || '#4ECDC4';
      ctx.font = '900 26px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`✨ ${cardData.constellationName} • ${student.deptAbbr}`, 90, constBoxY + 48);

      ctx.fillStyle = '#E2E8F0';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(cardData.constellationMythBangla, 90, constBoxY + 82);

      // Draw Constellation Edges
      const cLeft = 120;
      const cTop = constBoxY + 110;
      const cW = width - 240;
      const cH = constBoxH - 160;

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
        ctx.textBaseline = 'alphabetic';
      });

      // 4. Student Identity & Constellation Reason Banner (Auto-Wrapping)
      const idBoxY = 855;
      const idBoxH = 210;
      ctx.fillStyle = '#FFFBEB';
      ctx.fillRect(60, idBoxY, width - 120, idBoxH);
      ctx.strokeStyle = '#1E232A';
      ctx.lineWidth = 5;
      ctx.strokeRect(60, idBoxY, width - 120, idBoxH);

      // Student ID & Dept Abbr
      ctx.fillStyle = '#1E232A';
      ctx.font = '900 38px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${student.studentId} • ${student.deptAbbr} '${student.batchShort}`, 90, idBoxY + 48);

      // Full Dept Name
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(student.deptName, 90, idBoxY + 82);

      // Multi-Line Auto-Wrapped Constellation Assignment Reason
      ctx.fillStyle = '#065F46';
      ctx.font = 'bold 19px sans-serif';
      wrapCanvasText(
        ctx,
        `💡 Why you got this: ${cardData.constellationReason}`,
        90,
        idBoxY + 120,
        width - 180,
        28,
        2
      );

      // Persona Archetype
      ctx.fillStyle = '#C2410C';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`Achieved Rank: ${cardData.archetypeTitle}`, 90, idBoxY + 185);

      // 5. In-Game Tactical Achievements Grid
      const statsY = 1085;
      const statsH = 220;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(60, statsY, width - 120, statsH);
      ctx.strokeStyle = '#1E232A';
      ctx.lineWidth = 5;
      ctx.strokeRect(60, statsY, width - 120, statsH);

      // Battleship line with count of uncovered enemy bases

      ctx.fillStyle = '#1E232A';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`🚢 গুপ্ত শনাক্ত: ${hitCount}টি ঘাঁটি`, 90, statsY + 60);
      ctx.fillText(`🔴 ডিপার্টমেন্টাল বন্ডিং: কলাম ${player.connect4Col !== null ? player.connect4Col + 1 : 1} ড্রপ (+10 pts)`, 90, statsY + 115);
      ctx.fillText(`🏗️ নাম কামাও: ${player.stackFloors} তলা (×${player.stackCombos} কম্বো)`, 90, statsY + 170);

      // Total Score Highlight
      ctx.fillStyle = '#059669';
      ctx.font = '900 40px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`+${player.totalPointsEarned} PTS`, width - 90, statsY + 105);

      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('Total Points Earned', width - 90, statsY + 145);

      // 6. Footer Verification Stamp
      ctx.fillStyle = '#F9D342';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ASRRO • CUET CLUB FEST 2026', width / 2, height - 75);

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
    const hitMention = hitCount > 0 ? ` and ${hitCount} enemy bases uncovered!` : '';
    const shareText = `I fought for ${student.deptName} and earned ${player.totalPointsEarned} points${hitMention} in the ${cardData.constellationName} constellation! My rank: ${cardData.archetypeTitle} 🚀`;

    if (navigator.share) {
      navigator.share({
        title: 'ডিপার্টমেন্ট ক্ল্যাশ ২০২৬ • ASRRO ARENA',
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
              className="w-10 h-10 rounded-xl border-2 border-white flex flex-col items-center justify-center text-lg shadow-sm flex-shrink-0"
              style={{ backgroundColor: student.themeColor }}
            >
              <span>{cardData.constellationSymbol}</span>
            </div>

            <div className="text-left overflow-hidden">
              <div className="flex items-center space-x-1.5">
                <span className="font-mono font-black text-base tracking-wider text-[#F9D342]">
                  {student.studentId}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 font-bold">
                  {student.deptAbbr} '{student.batchShort}
                </span>
              </div>
              <p className="text-[10px] text-teal-300 font-bold font-bangla truncate">
                {student.deptName}
              </p>
            </div>
          </div>

          <div 
            className="px-2 py-0.5 rounded-full text-[10px] font-black border border-white/40 shadow-xs flex-shrink-0 ml-2"
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

        {/* Reason for Assignment Section (Properly Wrapping) */}
        <div className="p-2 bg-[#064E3B]/80 text-[#D1FAE5] rounded-xl border border-emerald-500/40 text-[10px] sm:text-[11px] font-bangla font-medium flex items-start space-x-1.5 flex-shrink-0">
          <Info className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 leading-snug">
            <strong className="text-emerald-300 font-black">নক্ষত্রমণ্ডল পাওয়ার কারণ: </strong>
            <span>{cardData.constellationReason}</span>
          </div>
        </div>

        {/* Personal Game Contribution Metrics (Clean Count Only) */}
        <div className="p-2 bg-white text-[#1E232A] rounded-xl border-2 border-[#1E232A] shadow-xs space-y-0.5 text-left font-bangla flex-shrink-0">
          <div className="flex items-center justify-between text-xs border-b border-gray-100 pb-0.5">
            <span className="text-gray-600 font-bold truncate pr-1">
              🚢 গুপ্ত বনাম প্রকাশ্য: {player.battleshipMoves?.length || 3} চাল
              {hitCount > 0 && (
                <span className="text-red-600 font-black"> • 🎯 {hitCount}টি ঘাঁটি উন্মোচিত</span>
              )}
            </span>
            <span className="font-bold text-gray-600 flex-shrink-0">🔴 ডিপার্টমেন্টাল বন্ডিং: C{player.connect4Col !== null ? player.connect4Col + 1 : 1} (+10)</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-0.5">
            <span className="font-bold text-amber-600">🏗️ নাম কামাও: {player.stackFloors} তলা (×{player.stackCombos} কম্বো)</span>
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
