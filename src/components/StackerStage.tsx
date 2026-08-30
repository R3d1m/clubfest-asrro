import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Layers, ArrowRight, Trophy, Sparkles, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ParsedStudent } from '../types';
import { sound } from '../utils/sound';
import { vibrate, vibratePattern } from '../utils/haptics';
import { apiFetch } from '../config';

interface StackerStageProps {
  student: ParsedStudent;
  onStackerComplete: (floors: number, combos: number) => void;
  onAdvanceToNextStage: () => void;
}

interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface FallingDebris {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  vy: number;
  vx: number;
  rotation: number;
  vRot: number;
  opacity: number;
}

export const StackerStage: React.FC<StackerStageProps> = ({
  student,
  onStackerComplete,
  onAdvanceToNextStage
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [uiState, setUiState] = useState<'READY' | 'PLAYING' | 'GAME_OVER'>('READY');
  const [floors, setFloors] = useState(0);
  const [combos, setCombos] = useState(0);
  const [maxCombos, setMaxCombos] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pastel Color Palette for Floors
  const pastelColors = [
    '#FF6B6B', '#4ECDC4', '#FFE66D', '#FF8B94', 
    '#A8E6CF', '#DCD6F7', '#FFAAA6', '#FFD3B6', 
    '#6BCB77', '#4D96FF', '#FD79A8', '#F9CA24'
  ];

  // Engine state lives in Ref to avoid stale closures in requestAnimationFrame & touch events
  const gameRef = useRef<{
    status: 'READY' | 'PLAYING' | 'GAME_OVER';
    blocks: Block[];
    debris: FallingDebris[];
    currentBlock: {
      x: number;
      width: number;
      speed: number;
      direction: number;
    };
    cameraY: number;
    targetCameraY: number;
    floors: number;
    combo: number;
    maxCombo: number;
    blockHeight: number;
    canvasWidth: number;
    canvasHeight: number;
    animationId: number | null;
  }>({
    status: 'READY',
    blocks: [],
    debris: [],
    currentBlock: { x: 0, width: 160, speed: 4.2, direction: 1 },
    cameraY: 0,
    targetCameraY: 0,
    floors: 0,
    combo: 0,
    maxCombo: 0,
    blockHeight: 20,
    canvasWidth: 360,
    canvasHeight: 420,
    animationId: null
  });

  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;
    const baseWidth = Math.min(180, width * 0.55);
    const baseHeight = 22;
    const baseY = height - 40;
    const baseX = (width - baseWidth) / 2;

    gameRef.current = {
      status: 'READY',
      blocks: [
        {
          x: baseX,
          y: baseY,
          width: baseWidth,
          height: baseHeight,
          color: student.themeColor || '#4ECDC4'
        }
      ],
      debris: [],
      currentBlock: {
        x: 0,
        width: baseWidth,
        speed: 4.2,
        direction: 1
      },
      cameraY: 0,
      targetCameraY: 0,
      floors: 0,
      combo: 0,
      maxCombo: 0,
      blockHeight: baseHeight,
      canvasWidth: width,
      canvasHeight: height,
      animationId: null
    };

    setUiState('READY');
    setFloors(0);
    setCombos(0);
    setMaxCombos(0);
  }, [student.themeColor]);

  // Adjust canvas size to container
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (canvas && container) {
      const rect = container.getBoundingClientRect();
      const targetWidth = Math.floor(rect.width) || 360;
      const targetHeight = Math.floor(rect.height) || 420;

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      gameRef.current.canvasWidth = targetWidth;
      gameRef.current.canvasHeight = targetHeight;
    }

    initGame();
  }, [initGame]);

  // Game Engine Animation Loop
  useEffect(() => {
    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const state = gameRef.current;

      // Smooth Camera Follow
      state.cameraY += (state.targetCameraY - state.cameraY) * 0.12;

      // Clear
      ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);

      // Background Grid / Aesthetics
      ctx.fillStyle = '#FFF9D2';
      ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);

      // Subtle Grid Lines
      ctx.strokeStyle = 'rgba(30, 35, 42, 0.06)';
      ctx.lineWidth = 1;
      for (let y = 0; y < state.canvasHeight; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(state.canvasWidth, y);
        ctx.stroke();
      }

      ctx.save();
      ctx.translate(0, state.cameraY);

      // Draw Placed Blocks
      state.blocks.forEach((block, idx) => {
        ctx.fillStyle = block.color;
        ctx.strokeStyle = '#1E232A';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(block.x, block.y, block.width, block.height, 5);
        ctx.fill();
        ctx.stroke();

        // Floor number on block
        if (idx > 0 && block.width > 30) {
          ctx.fillStyle = '#1E232A';
          ctx.font = 'bold 11px "Fredoka", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`F${idx}`, block.x + block.width / 2, block.y + 15);
        }
      });

      // Update & Draw Falling Debris
      for (let i = state.debris.length - 1; i >= 0; i--) {
        const d = state.debris[i];
        d.x += d.vx;
        d.y += d.vy;
        d.vy += 0.45; // Gravity
        d.rotation += d.vRot;
        d.opacity -= 0.02;

        if (d.opacity <= 0 || d.y > state.canvasHeight + 100) {
          state.debris.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, d.opacity);
        ctx.translate(d.x + d.width / 2, d.y + d.height / 2);
        ctx.rotate(d.rotation);
        ctx.fillStyle = d.color;
        ctx.strokeStyle = '#1E232A';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-d.width / 2, -d.height / 2, d.width, d.height, 3);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Draw Active Sliding Block
      if (state.status === 'PLAYING' && state.blocks.length > 0) {
        const curr = state.currentBlock;
        curr.x += curr.speed * curr.direction;

        if (curr.x + curr.width >= state.canvasWidth) {
          curr.x = state.canvasWidth - curr.width;
          curr.direction = -1;
        } else if (curr.x <= 0) {
          curr.x = 0;
          curr.direction = 1;
        }

        const activeY = state.blocks[state.blocks.length - 1].y - state.blockHeight - 2;
        const color = pastelColors[state.floors % pastelColors.length];

        ctx.fillStyle = color;
        ctx.strokeStyle = '#1E232A';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(curr.x, activeY, curr.width, state.blockHeight, 5);
        ctx.fill();
        ctx.stroke();

        // Highlight stripe
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.roundRect(curr.x + 4, activeY + 3, curr.width - 8, 4, 2);
        ctx.fill();
      }

      ctx.restore();

      state.animationId = requestAnimationFrame(render);
    };

    gameRef.current.animationId = requestAnimationFrame(render);

    return () => {
      if (gameRef.current.animationId) {
        cancelAnimationFrame(gameRef.current.animationId);
      }
    };
  }, []);

  const handleScreenTouch = useCallback(() => {
    const state = gameRef.current;

    // START GAME ON FIRST TAP
    if (state.status === 'READY') {
      state.status = 'PLAYING';
      setUiState('PLAYING');
      sound.playPop(500);
      vibrate(20);
      return;
    }

    if (state.status !== 'PLAYING') return;

    const prevBlock = state.blocks[state.blocks.length - 1];
    const curr = state.currentBlock;
    const diff = curr.x - prevBlock.x;
    const tolerance = 5; // Perfect snap window
    const currentY = prevBlock.y - state.blockHeight - 2;

    if (Math.abs(diff) <= tolerance) {
      // 1. PERFECT SNAP -> COMBO BONUS
      state.combo++;
      if (state.combo > state.maxCombo) state.maxCombo = state.combo;

      // Expand block slightly as reward
      curr.width = Math.min(gameRef.current.canvasWidth * 0.6, curr.width + 4);

      const newBlock: Block = {
        x: prevBlock.x,
        y: currentY,
        width: curr.width,
        height: state.blockHeight,
        color: pastelColors[state.floors % pastelColors.length]
      };

      state.blocks.push(newBlock);
      state.floors++;
      state.currentBlock.speed = Math.min(8.5, 4.2 + state.floors * 0.14);

      sound.playStackSnap(state.combo);
      vibrate(20);

      setFloors(state.floors);
      setCombos(state.combo);
      setMaxCombos(state.maxCombo);

      // Adjust Camera
      if (newBlock.y + state.cameraY < 200) {
        state.targetCameraY += state.blockHeight + 2;
      }
    } else if (Math.abs(diff) < curr.width) {
      // 2. OVERHANG CUT -> SLICE OFF EXTRA PIECE
      state.combo = 0;
      setCombos(0);

      const overhangWidth = Math.abs(diff);
      const newWidth = curr.width - overhangWidth;
      const newX = diff > 0 ? curr.x : prevBlock.x;
      const debrisX = diff > 0 ? curr.x + newWidth : prevBlock.x - overhangWidth;

      // Spawn falling debris particle
      state.debris.push({
        x: debrisX,
        y: currentY,
        width: overhangWidth,
        height: state.blockHeight,
        color: pastelColors[state.floors % pastelColors.length],
        vy: 2,
        vx: diff > 0 ? 2 : -2,
        rotation: 0,
        vRot: (Math.random() - 0.5) * 0.2,
        opacity: 1
      });

      const newBlock: Block = {
        x: newX,
        y: currentY,
        width: newWidth,
        height: state.blockHeight,
        color: pastelColors[state.floors % pastelColors.length]
      };

      state.blocks.push(newBlock);
      state.floors++;
      curr.width = newWidth;
      state.currentBlock.speed = Math.min(8.5, 4.2 + state.floors * 0.14);

      sound.playPop(350);
      vibrate(25);

      setFloors(state.floors);
      setMaxCombos(state.maxCombo);

      // Adjust Camera
      if (newBlock.y + state.cameraY < 200) {
        state.targetCameraY += state.blockHeight + 2;
      }
    } else {
      // 3. COMPLETE MISS -> GAME OVER
      state.status = 'GAME_OVER';
      setUiState('GAME_OVER');

      // Drop entire block as debris
      state.debris.push({
        x: curr.x,
        y: currentY,
        width: curr.width,
        height: state.blockHeight,
        color: pastelColors[state.floors % pastelColors.length],
        vy: 3,
        vx: curr.direction * 3,
        rotation: 0,
        vRot: curr.direction * 0.15,
        opacity: 1
      });

      sound.playTopple();
      vibratePattern([100, 100, 250]);
      submitScore(state.floors, state.maxCombo);
    }
  }, [pastelColors, student.studentId]);

  // Global Full-Screen Touch/Pointer Listener (Tap literally anywhere on device)
  useEffect(() => {
    const handleGlobalPointer = (e: PointerEvent) => {
      // If clicking inside a button (e.g. Next Stage button in Game Over overlay), let the button handle it
      const target = e.target as HTMLElement | null;
      if (target && target.closest('button')) {
        return;
      }

      handleScreenTouch();
    };

    window.addEventListener('pointerdown', handleGlobalPointer);
    return () => {
      window.removeEventListener('pointerdown', handleGlobalPointer);
    };
  }, [handleScreenTouch]);

  const submitScore = async (finalFloors: number, finalCombos: number) => {
    setIsSubmitting(true);
    try {
      await apiFetch('/api/stacker/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.studentId,
          floors: finalFloors,
          combos: finalCombos
        })
      });

      if (finalFloors >= 15) {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      onStackerComplete(finalFloors, finalCombos);
    } catch (err) {
      console.error('Stacker submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col gap-2.5 touch-none select-none cursor-pointer animate-bounce-in">
      {/* Top Header Card */}
      <div className="w-full pop-box p-3 sm:p-4 bg-white flex items-center justify-between shadow-pop-sm">
        <div>
          <span className="text-xs font-bold text-gray-500 font-bangla block">স্টেপ ৩: টাওয়ার স্ট্যাক (ব্যক্তিগত স্কোর)</span>
          <h2 className="text-base sm:text-lg font-black font-bangla text-[#1E232A]">
            🏗️ সর্বোচ্চ তলায় পৌঁছাও!
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-[#FFF9D2] px-3 py-1 rounded-xl border-2 border-[#1E232A] text-center shadow-pop-sm">
            <span className="text-[10px] font-bold text-gray-600 block leading-none">উচ্চতা</span>
            <span className="text-base sm:text-lg font-black text-[#1E232A] leading-tight">{floors} তলা</span>
          </div>

          {combos > 1 && (
            <div className="bg-[#4ECDC4] px-2.5 py-1 rounded-xl border-2 border-[#1E232A] text-center shadow-pop-sm animate-bounce">
              <span className="text-[9px] font-bold text-[#1E232A] block leading-none">কম্বো</span>
              <span className="text-xs font-black text-[#1E232A] leading-tight">×{combos} 🔥</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Full-Screen Touch Canvas Container */}
      <div 
        ref={containerRef}
        className="w-full flex-1 min-h-[380px] sm:min-h-[440px] pop-box p-1.5 bg-[#FFFBEB] border-4 border-[#1E232A] relative flex flex-col items-center justify-center shadow-pop overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          className="rounded-2xl border-2 border-[#1E232A] w-full h-full block pointer-events-none"
        />

        {/* Overlay: Ready State */}
        {uiState === 'READY' && (
          <div className="absolute inset-0 bg-black/45 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-4 text-white text-center animate-bounce-in pointer-events-none">
            <div className="w-16 h-16 rounded-3xl bg-[#FFE66D] border-3 border-[#1E232A] shadow-pop flex items-center justify-center text-3xl mb-3 animate-bounce">
              🏗️
            </div>
            <h3 className="text-2xl font-black font-bangla text-[#FFE66D]">
              স্ক্রিনের যেকোনো জায়গায় ট্যাপ করো!
            </h3>
            <p className="text-xs sm:text-sm text-gray-200 mt-1 font-bangla max-w-xs leading-relaxed">
              স্লাইডিং ব্লকটি আগের ব্লকের ঠিক ওপরে পড়লে নিখুঁত কম্বো পাবে। যত উঁচু উঠবে, তত বেশি পয়েন্ট!
            </p>
            <div className="mt-4 px-6 py-3 bg-[#4ECDC4] text-[#1E232A] rounded-2xl border-3 border-[#1E232A] font-black text-base font-bangla shadow-pop animate-pulse">
              👆 যেকোনো জায়গায় ট্যাপ করে শুরু করো
            </div>
          </div>
        )}

        {/* Overlay: Game Over State */}
        {uiState === 'GAME_OVER' && (
          <div 
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute inset-0 bg-[#1E232A]/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-5 text-white text-center animate-bounce-in space-y-3 cursor-default"
          >
            <div className="w-14 h-14 rounded-3xl bg-[#FF6B6B] border-3 border-white flex items-center justify-center text-3xl shadow-pop">
              🏢
            </div>

            <h3 className="text-2xl font-black font-bangla text-[#FFE66D]">
              টাওয়ার পড়ে গেছে!
            </h3>

            <div className="bg-white/10 p-4 rounded-2xl border-2 border-white/20 w-full max-w-xs space-y-2">
              <div className="flex justify-between items-center text-sm font-bangla">
                <span className="text-gray-300">সর্বোচ্চ উচ্চতা:</span>
                <strong className="text-xl text-[#4ECDC4] font-black">{floors} তলা</strong>
              </div>
              <div className="flex justify-between items-center text-sm font-bangla">
                <span className="text-gray-300">ম্যাক্স কম্বো:</span>
                <strong className="text-xl text-amber-300 font-black">×{maxCombos} 🔥</strong>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playPop();
                onAdvanceToNextStage();
              }}
              className="pop-btn w-full py-4 bg-[#6BCB77] text-[#1E232A] font-black text-base font-bangla flex items-center justify-center space-x-2 shadow-pop animate-bounce cursor-pointer mt-2"
            >
              <span>শেষ ধাপ (স্পাইসি পোল) এ যাও</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Floating Instructions Footer */}
      <div className="text-center font-bangla text-xs sm:text-sm font-bold text-gray-700 py-1">
        {uiState === 'PLAYING' ? (
          <span className="text-emerald-800 font-black animate-pulse">👆 স্ক্রিনের যেকোনো জায়গায় (উপরে/নিচে/মাঝে) ট্যাপ করলেই ব্লক ড্রপ হবে!</span>
        ) : (
          <span>টপ ৫ এ থাকলে ASRRO থেকে উপহার নিশ্চিত!</span>
        )}
      </div>
    </div>
  );
};
