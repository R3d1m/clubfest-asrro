import React, { useState } from 'react';
import { UserCheck, Shield, Users, RefreshCw, CheckCircle2, AlertCircle, ArrowLeft, Radio } from 'lucide-react';
import { parseStudentID } from '../data/departments';
import { ServerStateSnapshot } from '../types';
import { sound } from '../utils/sound';
import { apiFetch } from '../config';

interface AdminDeskProps {
  serverState?: ServerStateSnapshot | null;
  onBackToPlayer: () => void;
}

export const AdminDesk: React.FC<AdminDeskProps> = ({ serverState, onBackToPlayer }) => {
  const [studentIdInput, setStudentIdInput] = useState('');
  const [rfidInput, setRfidInput] = useState('');
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<any>(null);

  const handleInputChange = (val: string) => {
    setStudentIdInput(val);
    if (val.trim().length >= 6) {
      try {
        const parsed = parseStudentID(val.trim());
        setParsedPreview(parsed);
      } catch {
        setParsedPreview(null);
      }
    } else {
      setParsedPreview(null);
    }
  };

  const handleAuthorize = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!studentIdInput.trim() || isSubmitting) return;

    setIsSubmitting(true);
    sound.playPop();

    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentId: studentIdInput.trim(),
          rfid: rfidInput.trim() || undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        sound.playStreakChime();
        setFeedback({ 
          text: `✅ ${studentIdInput.trim()} (${parsedPreview?.deptAbbr || ''})${rfidInput ? ` [RFID: ${rfidInput.trim()}]` : ''} সফলভাবে অনুমোদিত হয়েছে!`, 
          type: 'success' 
        });
        setStudentIdInput('');
        setRfidInput('');
        setParsedPreview(null);
      } else {
        sound.playBuzzer();
        setFeedback({ text: data.message || 'অনুমোদন ব্যর্থ হয়েছে', type: 'danger' });
      }
    } catch {
      setFeedback({ text: 'সার্ভার সংযোগ সমস্যা!', type: 'danger' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetBoard = async () => {
    if (!confirm('আপনি কি নিশ্চিত যে পুরো গেমের সমস্ত ডেটা ও স্কোর রিসেট করতে চান?')) return;
    try {
      await apiFetch('/api/admin/reset', { method: 'POST' });
      sound.playExplosion();
      alert('বোর্ড সম্পূর্ণ রিসেট হয়েছে!');
    } catch {
      alert('রিসেট ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 space-y-4 min-h-[calc(100vh-65px)] font-bangla">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToPlayer}
          className="pop-btn-sm px-3 py-1.5 bg-white text-[#1E232A] font-bold text-xs flex items-center space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>প্লেয়ার স্ক্রিন</span>
        </button>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#FFF9D2] border-2 border-[#1E232A] rounded-xl text-xs font-black text-[#1E232A]">
          <Shield className="w-4 h-4 text-purple-600" />
          <span>বুথ অ্যাডমিন ও RFID প্যানেল</span>
        </div>
      </div>

      {/* ID Authorization Box */}
      <div className="pop-box p-6 bg-[#FFFBEB] border-4 border-[#1E232A] shadow-pop-lg space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-[#1E232A]">
            🎟️ নতুন শিক্ষার্থী অনুমোদন
          </h2>
          <p className="text-xs text-gray-600 font-medium">
            শিক্ষার্থীর আইডি লিখুন এবং প্রয়োজনে RFID কার্ড স্ক্যান করুন।
          </p>
        </div>

        <form onSubmit={handleAuthorize} className="space-y-3">
          <div>
            <label className="block text-xs font-black text-gray-700 mb-1">
              স্টুডেন্ট আইডি:
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="e.g. 2204055"
              value={studentIdInput}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full text-center text-2xl font-black font-display tracking-widest px-4 py-3 bg-white border-3 border-[#1E232A] rounded-2xl shadow-pop-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
              autoFocus
            />
          </div>

          <div>
            <label className="flex items-center justify-between text-xs font-black text-gray-700 mb-1">
              <span className="flex items-center space-x-1">
                <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                <span>RFID কার্ড ট্যাগ (ঐচ্ছিক / অটো-স্ক্যান):</span>
              </span>
              <span className="text-[10px] text-gray-400 font-medium">কার্ড ট্যাপ করুন</span>
            </label>
            <input
              type="text"
              placeholder="ট্যাপ করলে UID বসবে (যেমন: E2801170...)"
              value={rfidInput}
              onChange={(e) => setRfidInput(e.target.value)}
              className="w-full text-center text-sm font-mono font-bold px-3 py-2 bg-white border-2 border-[#1E232A] rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Live ID Parser Preview */}
          {parsedPreview && (
            <div 
              className="p-3 rounded-xl border-2 border-[#1E232A] text-left text-xs font-black flex items-center justify-between animate-bounce-in shadow-pop-sm"
              style={{ backgroundColor: parsedPreview.lightColor, color: '#1E232A' }}
            >
              <div>
                <span className="block text-[10px] text-gray-500">স্বয়ংক্রিয় শনাক্তকরণ:</span>
                <span className="text-sm font-black">{parsedPreview.deptName} ({parsedPreview.deptAbbr})</span>
              </div>
              <div className="text-right">
                <span className="block text-[10px] text-gray-500">ব্যাচ • রোল:</span>
                <span className="text-sm font-black">{parsedPreview.batchShort} • {parsedPreview.roll}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!parsedPreview || isSubmitting}
            className={`pop-btn w-full py-3.5 font-black text-base flex items-center justify-center space-x-2 transition-all ${
              parsedPreview && !isSubmitting
                ? 'bg-[#4ECDC4] text-[#1E232A] shadow-pop hover:bg-[#3dbdb5]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
            }`}
          >
            <UserCheck className="w-5 h-5" />
            <span>অনুমোদন করুন (Authorize)</span>
          </button>
        </form>

        {feedback && (
          <div className={`p-3 rounded-xl border-2 border-[#1E232A] text-xs font-bold flex items-center space-x-2 animate-bounce-in ${
            feedback.type === 'success' ? 'bg-[#D4F8F0] text-[#00897B]' : 'bg-[#FFE0E2] text-[#D32F2F]'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{feedback.text}</span>
          </div>
        )}
      </div>

      {/* Live Booth Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="pop-box p-3.5 bg-white border-3 border-[#1E232A] text-center shadow-pop-sm">
          <div className="flex items-center justify-center space-x-1 text-gray-500 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs font-bold">মোট নিবন্ধিত:</span>
          </div>
          <span className="text-2xl font-black text-[#1E232A]">
            {serverState?.stats.totalStudentsRegistered || 0} জন
          </span>
        </div>

        <div className="pop-box p-3.5 bg-white border-3 border-[#1E232A] text-center shadow-pop-sm">
          <div className="flex items-center justify-center space-x-1 text-gray-500 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold">সম্পন্ন করেছে:</span>
          </div>
          <span className="text-2xl font-black text-emerald-600">
            {serverState?.stats.totalPlayed || 0} জন
          </span>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="pop-box p-4 bg-white border-3 border-[#1E232A] flex items-center justify-between shadow-pop-sm">
        <div>
          <h4 className="text-xs font-black text-red-600">জরুরি কন্ট্রোল</h4>
          <p className="text-[10px] text-gray-500">ম্যাপ ও সমস্ত পয়েন্ট রিসেট</p>
        </div>

        <button
          onClick={handleResetBoard}
          className="pop-btn-sm px-3 py-1.5 bg-[#FF5964] text-white text-xs font-black flex items-center space-x-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>রিসেট অল</span>
        </button>
      </div>
    </div>
  );
};
