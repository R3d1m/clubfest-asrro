import React, { useEffect, useRef, useState } from 'react';
import { Layers, RotateCcw, ArrowRight, Trophy, Flame, Zap, Award } from 'lucide-react';
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

export const StackerStage: React.FC<StackerStageProps> = ({
  student,
  onStackerComplete,
  onAdvanceToNextStage
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'READY' | 'PLAYING' | 'GAME_OVER'>('READY');
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

  // Game Engine State Ref
  const gameRef = useRef<{
    blocks: Block[];
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
    blocks: [],
    currentBlock: { x: 0, width: 140, speed: 3.8, direction: 1 },
    cameraY: 0,
    targetCameraY: 0,
    floors: 0,
    combo: 0,
    maxCombo: 0,
    blockHeight: 18,
    canvasWidth: 320,
    canvasHeight: 350,
    animationId: null
  });

  const initGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const baseWidth = 140;
    const baseHeight = 18;
    const baseY = canvas.height - 35;
    const baseX = (canvas.width - baseWidth) / 2;

    gameRef.current = {
      blocks: [
        {
          x: baseX,
          y: baseY,
          width: baseWidth,
          height: baseHeight,
          color: student.themeColor || '#4ECDC4'
        }
      ],
      currentBlock: {
        x: 0,
        width: baseWidth,
        speed: 3.8,
        direction: 1
      },
      cameraY: 0,
      targetCameraY: 0,
      floors: 0,
      combo: 0,
      maxCombo: 0,
      blockHeight: baseHeight,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      animationId: null
    };

    setFloors(0);
    setCombos(0);
    setMaxCombos(0);
  };

  useEffect(() => {
    initGame();
    renderLoop();

    return () => {
      if (gameRef.current.animationId) {
        cancelAnimationFrame(gameRef.current.animationId);
      }
    };
  }, []);

  const renderLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameRef.current;

    // Smooth Camera Follow
    state.cameraY += (state.targetCameraY - state.cameraY) * 0.12;

    // Clear
    ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);

    ctx.save();
    ctx.translate(0, state.cameraY);

    // Draw Placed Blocks
    state.blocks.forEach((block, idx) => {
      ctx.fillStyle = block.color;
      ctx.strokeStyle = '#1E232A';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(block.x, block.y, block.width, block.height, 4);
      ctx.fill();
      ctx.stroke();

      // Floor number on block
      if (idx > 0 && block.width > 28) {
        ctx.fillStyle = '#1E232A';
        ctx.font = 'bold 9px "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`F${idx}`, block.x + block.width / 2, block.y + 13);
      }
    });

    // Draw Active Sliding Block
    if (gameState === 'PLAYING' && state.blocks.length > 0) {
      const curr = state.currentBlock;
      curr.x += curr.speed * curr.direction;

      if (curr.x + curr.width >= state.canvasWidth) {
        curr.x = state.canvasWidth - curr.width;
        curr.direction = -1;
      } else if (curr.x <= 0) {
        curr.x = 0;
        curr.direction = 1;
      }

      const activeY = state.blocks[state.blocks.length - 1].y - state.blockHeight - 1;
      const color = pastelColors[state.floors % pastelColors.length];

      ctx.fillStyle = color;
      ctx.strokeStyle = '#1E232A';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(curr.x, activeY, curr.width, state.blockHeight, 4);
      ctx.fill();
      ctx.stroke();

      // Glow on block
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.roundRect(curr.x + 3, activeY + 2, curr.width - 6, 3, 2);
      ctx.fill();
    }

    ctx.restore();

    state.animationId = requestAnimationFrame(renderLoop);
  };

  const handleTap = () => {
    if (gameState === 'READY') {
      sound.playPop();
      vibrate(20);
      setGameState('PLAYING');
      return;
    }

    if (gameState !== 'PLAYING') return;

    const state = gameRef.current;
    const prevBlock = state.blocks[state.blocks.length - 1];
    const curr = state.currentBlock;
    const diff = curr.x - prevBlock.x;
    const tolerance = 4; // Perfect snap window
    const currentY = prevBlock.y - state.blockHeight - 1;

    if (Math.abs(diff) <= tolerance) {
      // PERFECT SNAP -> COMBO
      state.combo++;
      if (state.combo > state.maxCombo) state.maxCombo = state.combo;

      // Expand block slightly as reward
      curr.width = Math.min(140, curr.width + 4);

      const newBlock: Block = {
        x: prevBlock.x,
        y: currentY,
        width: curr.width,
        height: state.blockHeight,
        color: pastelColors[state.floors % pastelColors.length]
      };

      state.blocks.push(newBlock);
      state.floors++;
      state.currentBlock.speed = Math.min(7.5, 3.8 + state.floors * 0.12);

      sound.playStackSnap(state.combo);
      vibrate(15);

      setFloors(state.floors);
      setCombos(state.combo);
      setMaxCombos(state.maxCombo);

      // Adjust Camera
      if (newBlock.y + state.cameraY < 180) {
        state.targetCameraY += state.blockHeight + 2;
      }
    } else if (Math.abs(diff) < curr.width) {
      // OVERHANG CUT
      state.combo = 0;
      setCombos(0);

      const newWidth = curr.width - Math.abs(diff);
      const newX = diff > 0 ? curr.x : prevBlock.x;

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
      state.currentBlock.speed = Math.min(7.5, 3.8 + state.floors * 0.12);

      sound.playPop(350);
      vibrate(25);

      setFloors(state.floors);
      setMaxCombos(state.maxCombo);

      // Adjust Camera
      if (newBlock.y + state.cameraY < 180) {
        state.targetCameraY += state.blockHeight + 2;
      }
    } else {
      // COMPLETE MISS -> GAME OVER
      sound.playTopple();
      vibratePattern([100, 100, 200]);
      setGameState('GAME_OVER');
      submitScore(state.floors, state.maxCombo);
    }
  };

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

      if (finalFloors >= 20) {
        confetti({
          particleCount: 70,
          spread: 60,
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
    <div className="w-full max-w-md mx-auto p-2 sm:p-3 flex flex-col items-center space-y-2.5 min-h-[calc(100vh-65px)] justify-between">
      {/* Header Info */}
      <div className="w-full pop-box p-3 bg-white flex items-center justify-between shadow-pop-sm">
        <div>
          <span className="text-[11px] font-bold text-gray-500 font-bangla block">স্টেপ ৩: টাওয়ার স্ট্যাক (ব্যক্তিগত স্কোর)</span>
          <h2 className="text-sm sm:text-base font-black font-bangla text-[#1E232A]">
            🏗️ সর্বোচ্চ তলায় পৌঁছাও!
          </h2>
        </div>

        <div className="flex items-center space-x-1.5">
          <div className="bg-[#FFF9D2] px-2.5 py-1 rounded-xl border-2 border-[#1E232A] text-center shadow-pop-sm">
            <span className="text-[9px] font-bold text-gray-600 block leading-none">উচ্চতা</span>
            <span className="text-sm sm:text-base font-black text-[#1E232A] leading-tight">{floors} তলা</span>
          </div>

          {combos > 1 && (
            <div className="bg-[#4ECDC4] px-2 py-1 rounded-xl border-2 border-[#1E232A] text-center shadow-pop-sm animate-bounce">
              <span className="text-[9px] font-bold text-[#1E232A] block leading-none">কম্বো</span>
              <span className="text-xs font-black text-[#1E232A] leading-tight">×{combos} 🔥</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Area - Entire Box is 0-latency Touch/Clickable */}
      <div 
        onClick={handleTap}
        onTouchStart={(e) => {
          e.preventDefault();
          handleTap();
        }}
        className="w-full pop-box p-2 bg-[#FFFBEB] border-4 border-[#1E232A] relative flex flex-col items-center justify-center shadow-pop cursor-pointer select-none touch-manipulation active:scale-[0.99] transition-transform"
      >
        <canvas
          ref={canvasRef}
          width={320}
          height={340}
          className="rounded-xl border-2 border-[#1E232A] bg-[#FFF9D2] w-full max-w-[320px] h-[330px] sm:h-[350px] pointer-events-none"
        />

        {/* Overlay for Ready State */}
        {gameState === 'READY' && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center p-4 text-white text-center animate-bounce-in pointer-events-none">
            <Layers className="w-10 h-10 text-[#FFE66D] mb-2 animate-bounce" />
            <h3 className="text-lg sm:text-xl font-black font-bangla">স্ক্রিনে ট্যাপ করে শুরু করো!</h3>
            <p className="text-xs text-gray-200 mt-1 font-bangla">
              স্লাইডিং ব্লকগুলো ঠিক ওপর ফেলে টাওয়ার উঁচু করো। নিখুঁত বসলে কম্বো বোনাস পাবে!
            </p>
            <div className="mt-3 px-5 py-2 bg-[#4ECDC4] text-[#1E232A] rounded-xl border-2 border-[#1E232A] font-black font-bangla shadow-pop">
              ▶️ ট্যাপ করে স্টার্ট
            </div>
          </div>
        )}

        {/* Overlay for Game Over State */}
        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 bg-[#1E232A]/85 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center p-4 text-white text-center animate-bounce-in space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B6B] border-2 border-white flex items-center justify-center text-2xl shadow-pop-sm">
              🏢
            </div>

            <h3 className="text-xl font-black font-bangla text-[#FFE66D]">
              টাওয়ার পড়ে গেছে!
            </h3>

            <div className="bg-white/10 p-3 rounded-xl border border-white/20 w-full max-w-xs space-y-1">
              <div className="flex justify-between text-xs font-bangla">
                <span>সর্বোচ্চ তলা:</span>
                <strong className="text-base text-[#4ECDC4] font-black">{floors} তলা</strong>
              </div>
              <div className="flex justify-between text-xs font-bangla">
                <span>ম্যাক্স কম্বো:</span>
                <strong className="text-base text-amber-300 font-black">×{maxCombos}</strong>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                sound.playPop();
                onAdvanceToNextStage();
              }}
              className="pop-btn w-full py-3 bg-[#6BCB77] text-[#1E232A] font-black text-sm font-bangla flex items-center justify-center space-x-1.5 shadow-pop animate-bounce"
            >
              <span>শেষ ধাপ (স্পাইসি পোল) এ যাও</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Floating Instructions Footer */}
      <div className="text-center font-bangla text-xs font-bold text-gray-600">
        {gameState === 'PLAYING' ? (
          <span className="text-emerald-700 font-black animate-pulse">👆 স্ক্রিনের যেকোনো জায়গায় ট্যাপ করে ব্লক ফেলুন!</span>
        ) : (
          <span>টপ ৫ এ থাকলে ASRRO থেকে উপহার নিশ্চিত!</span>
        )}
      </div>
    </div>
  );
};
