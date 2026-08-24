import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Layers, Trophy, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ParsedStudent } from '../types';
import { sound } from '../utils/sound';
import { vibrate, vibratePattern } from '../utils/haptics';

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'READY' | 'PLAYING' | 'GAME_OVER'>('READY');
  const [floors, setFloors] = useState(0);
  const [combos, setCombos] = useState(0);
  const [maxCombos, setMaxCombos] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pastelColors = [
    '#FFA931', '#FF5964', '#3585DA', '#00C9A7', 
    '#8AC926', '#845EC2', '#FF6F91', '#00AFB9'
  ];

  // Game internal state ref to avoid React render delay
  const stateRef = useRef({
    blocks: [] as Block[],
    currentBlock: {
      x: 0,
      width: 150,
      speed: 3.8,
      direction: 1
    },
    blockHeight: 20,
    canvasWidth: 320,
    canvasHeight: 340,
    floors: 0,
    combo: 0,
    maxCombo: 0,
    cameraY: 0,
    targetCameraY: 0
  });

  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    const width = canvas ? canvas.width : 320;
    const height = canvas ? canvas.height : 340;
    const blockWidth = 150;
    const blockHeight = 20;

    // Base foundation block
    const baseBlock: Block = {
      x: (width - blockWidth) / 2,
      y: height - blockHeight - 10,
      width: blockWidth,
      height: blockHeight,
      color: student.themeColor || '#4ECDC4'
    };

    stateRef.current = {
      blocks: [baseBlock],
      currentBlock: {
        x: 0,
        width: blockWidth,
        speed: 3.8,
        direction: 1
      },
      blockHeight,
      canvasWidth: width,
      canvasHeight: height,
      floors: 0,
      combo: 0,
      maxCombo: 0,
      cameraY: 0,
      targetCameraY: 0
    };

    setFloors(0);
    setCombos(0);
    setMaxCombos(0);
  }, [student.themeColor]);

  // Initial game setup on mount
  useEffect(() => {
    initGame();
  }, [initGame]);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const state = stateRef.current;

      // Smooth camera pan
      state.cameraY += (state.targetCameraY - state.cameraY) * 0.1;

      // Clear Canvas
      ctx.fillStyle = '#FFF9D2';
      ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);

      // Grid Pattern
      ctx.strokeStyle = 'rgba(30, 35, 42, 0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < state.canvasWidth; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, state.canvasHeight);
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

        const prevBlock = state.blocks[state.blocks.length - 1];
        const currentY = prevBlock.y - state.blockHeight - 2;
        const color = pastelColors[state.floors % pastelColors.length];

        ctx.fillStyle = color;
        ctx.strokeStyle = '#1E232A';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(curr.x, currentY, curr.width, state.blockHeight, 4);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  const handleTap = () => {
    if (gameState === 'READY') {
      initGame();
      sound.playPop(500);
      setGameState('PLAYING');
      return;
    }

    if (gameState !== 'PLAYING') return;

    const state = stateRef.current;
    if (!state.blocks || state.blocks.length === 0) {
      initGame();
      return;
    }

    const prevBlock = state.blocks[state.blocks.length - 1];
    const curr = state.currentBlock;
    const currentY = prevBlock.y - state.blockHeight - 2;

    const diff = curr.x - prevBlock.x;
    const tolerance = 5; // Pixel tolerance for perfect hit

    if (Math.abs(diff) <= tolerance) {
      // PERFECT HIT!
      state.combo++;
      if (state.combo > state.maxCombo) state.maxCombo = state.combo;

      // Expand block if 3+ combo
      if (state.combo >= 3 && curr.width < 140) {
        curr.width = Math.min(140, curr.width + 15);
      }

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
      curr.width = newWidth;
      state.floors++;
      state.currentBlock.speed = Math.min(7.5, 3.8 + state.floors * 0.12);

      sound.playStackSnap(0);
      vibrate(20);

      setFloors(state.floors);

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
      await fetch('/api/stacker/finish', {
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
    <div className="w-full max-w-lg mx-auto p-3 flex flex-col items-center space-y-3 min-h-[calc(100vh-70px)] justify-between">
      {/* Header Info */}
      <div className="w-full pop-box p-3 bg-white flex items-center justify-between shadow-pop-sm">
        <div>
          <span className="text-xs font-bold text-gray-500 font-bangla block">স্টেপ ৩: টাওয়ার স্ট্যাক (ব্যক্তিগত স্কোর)</span>
          <h2 className="text-base font-black font-bangla text-[#1E232A]">
            🏗️ সর্বোচ্চ তলায় পৌঁছাও!
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-[#FFF9D2] px-3 py-1 rounded-xl border-2 border-[#1E232A] text-center shadow-pop-sm">
            <span className="text-[10px] font-bold text-gray-600 block">উচ্চতা</span>
            <span className="text-base font-black text-[#1E232A]">{floors} তলা</span>
          </div>

          {combos > 1 && (
            <div className="bg-[#4ECDC4] px-2 py-1 rounded-xl border-2 border-[#1E232A] text-center shadow-pop-sm animate-bounce">
              <span className="text-[9px] font-bold text-[#1E232A] block">কম্বো</span>
              <span className="text-xs font-black text-[#1E232A]">×{combos} 🔥</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Area - Entire Box is Clickable */}
      <div 
        onClick={handleTap}
        className="w-full pop-box p-2 bg-[#FFFBEB] border-4 border-[#1E232A] relative flex flex-col items-center justify-center shadow-pop cursor-pointer select-none"
      >
        <canvas
          ref={canvasRef}
          width={320}
          height={340}
          className="rounded-xl border-2 border-[#1E232A] bg-[#FFF9D2] w-full max-w-[320px] h-[340px] pointer-events-none"
        />

        {/* Overlay for Ready State */}
        {gameState === 'READY' && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center p-4 text-white text-center animate-bounce-in pointer-events-none">
            <Layers className="w-12 h-12 text-[#FFE66D] mb-2" />
            <h3 className="text-xl font-black font-bangla">স্ক্রিনে ট্যাপ করে শুরু করো!</h3>
            <p className="text-xs text-gray-200 mt-1 font-bangla">
              স্লাইডিং ব্লকগুলো ঠিক ওপর ফেলে টাওয়ার উঁচু করো। নিখুঁত বসলে কম্বো বোনাস পাবে!
            </p>
            <div className="mt-3 px-5 py-2.5 bg-[#4ECDC4] text-[#1E232A] rounded-xl border-2 border-[#1E232A] font-black font-bangla shadow-pop">
              ▶️ স্টার্ট
            </div>
          </div>
        )}

        {/* Overlay for Game Over State */}
        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 bg-[#1E232A]/85 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center p-4 text-white text-center space-y-3 animate-bounce-in z-20">
            <Trophy className="w-12 h-12 text-[#F9D342] animate-bounce" />
            <div>
              <h3 className="text-2xl font-black font-bangla text-[#F9D342]">টাওয়ার সম্পূর্ণ!</h3>
              <p className="text-sm font-bold font-bangla text-gray-200 mt-1">
                তোমার অর্জন: <span className="text-xl text-white font-black">{floors} তলা</span>
              </p>
              {maxCombos > 1 && (
                <p className="text-xs text-[#4ECDC4] font-bangla mt-0.5">
                  সর্বোচ্চ কম্বো: ×{maxCombos}
                </p>
              )}
            </div>

            <div className="w-full max-w-xs space-y-2 pt-2">
              <button
                onClick={(e) => { e.stopPropagation(); sound.playPop(); onAdvanceToNextStage(); }}
                className="pop-btn w-full py-3 bg-[#6BCB77] text-[#1E232A] font-black text-sm font-bangla flex items-center justify-center space-x-2 shadow-pop"
              >
                <span>পরের স্টেপ: স্পাইসি পোল (৪/৪)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Hint */}
      <div className="text-center font-bangla text-xs font-bold text-gray-600">
        {gameState === 'PLAYING' ? (
          <span className="text-[#D67229] font-black">⚡ যেকোনো জায়গায় ট্যাপ করো যখন ব্লকটি আগের ব্লকের ঠিক ওপরে থাকে!</span>
        ) : gameState === 'READY' ? (
          <span>স্ক্রিনের যেকোনো জায়গায় ট্যাপ করে খেলা শুরু করো।</span>
        ) : (
          <span>তোমার ব্যক্তিগত রেকর্ড সংরক্ষিত হয়েছে!</span>
        )}
      </div>
    </div>
  );
};
