import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserCheck, 
  Shield, 
  Users, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Radio, 
  Search, 
  Filter, 
  RotateCcw,
  Clock,
  Layers,
  Award
} from 'lucide-react';
import { parseStudentID, DEPARTMENT_LIST, DEPARTMENTS } from '../data/departments';
import { ServerStateSnapshot, PlayerRecord } from '../types';
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

  // Registered Students Viewer State
  const [playersList, setPlayersList] = useState<PlayerRecord[]>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'COMPLETED' | 'IN_PROGRESS'>('ALL');
  const [resettingId, setResettingId] = useState<string | null>(null);

  const fetchRegisteredPlayers = async () => {
    setIsLoadingPlayers(true);
    try {
      const res = await apiFetch('/api/admin/players');
      const data = await res.json();
      if (data.success && Array.query !== null) {
        setPlayersList(data.players || []);
      }
    } catch (err) {
      console.error('Failed to fetch players list:', err);
    } finally {
      setIsLoadingPlayers(false);
    }
  };

  useEffect(() => {
    fetchRegisteredPlayers();
  }, [serverState?.stats.totalStudentsRegistered]);

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
    const cleanId = studentIdInput.trim();
    if (!cleanId || isSubmitting) return;

    setIsSubmitting(true);
    sound.playPop();

    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentId: cleanId,
          rfid: rfidInput.trim() || undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        sound.playStreakChime();
        setFeedback({ 
          text: `✅ ${cleanId} (${parsedPreview?.deptAbbr || ''})${rfidInput ? ` [RFID: ${rfidInput.trim()}]` : ''} সফলভাবে অনুমোদিত হয়েছে!`, 
          type: 'success' 
        });
        setStudentIdInput('');
        setRfidInput('');
        setParsedPreview(null);
        fetchRegisteredPlayers();
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

  const handleResetSinglePlayer = async (id: string) => {
    if (!confirm(`শিক্ষার্থী ${id} এর সমস্ত গেম অগ্রগতি রিসেট করতে চান? (পুনরায় খেলতে পারবে)`)) return;
    setResettingId(id);
    try {
      const res = await apiFetch(`/api/player/${id}/reset`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        sound.playPop();
        fetchRegisteredPlayers();
      } else {
        alert(data.message || 'রিসেট ব্যর্থ হয়েছে');
      }
    } catch {
      alert('সার্ভার সংযোগ সমস্যা!');
    } finally {
      setResettingId(null);
    }
  };

  const handleResetBoard = async () => {
    if (!confirm('আপনি কি নিশ্চিত যে পুরো গেমের সমস্ত ডেটা ও স্কোর রিসেট করতে চান?')) return;
    try {
      await apiFetch('/api/admin/reset', { method: 'POST' });
      sound.playExplosion();
      alert('বোর্ড সম্পূর্ণ রিসেট হয়েছে!');
      fetchRegisteredPlayers();
    } catch {
      alert('রিসেট ব্যর্থ হয়েছে');
    }
  };

  // Filter & Search computation
  const filteredPlayers = useMemo(() => {
    return playersList.filter(player => {
      // 1. Search Query (ID, RFID, or Dept Name)
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || 
        player.studentId.toLowerCase().includes(q) ||
        (player.rfid && player.rfid.toLowerCase().includes(q)) ||
        player.deptCode.toLowerCase().includes(q) ||
        (DEPARTMENTS[player.deptCode]?.name || '').toLowerCase().includes(q) ||
        (DEPARTMENTS[player.deptCode]?.abbr || '').toLowerCase().includes(q);

      // 2. Department Filter
      const matchesDept = selectedDeptFilter === 'ALL' || player.deptCode === selectedDeptFilter;

      // 3. Status Filter
      const matchesStatus = 
        selectedStatusFilter === 'ALL' ||
        (selectedStatusFilter === 'COMPLETED' && player.status === 'COMPLETED') ||
        (selectedStatusFilter === 'IN_PROGRESS' && player.status !== 'COMPLETED');

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [playersList, searchQuery, selectedDeptFilter, selectedStatusFilter]);

  const completedCount = useMemo(() => {
    return playersList.filter(p => p.status === 'COMPLETED').length;
  }, [playersList]);

  return (
    <div className="w-full max-w-3xl mx-auto p-3 sm:p-5 space-y-4 font-bangla">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToPlayer}
          className="pop-btn-sm px-3 py-1.5 bg-white text-[#1E232A] font-bold text-xs flex items-center space-x-1 cursor-pointer"
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
      <div className="pop-box p-4 sm:p-5 bg-[#FFFBEB] border-3.5 border-[#1E232A] shadow-pop space-y-3.5">
        <div className="text-center space-y-0.5">
          <h2 className="text-lg sm:text-xl font-black text-[#1E232A]">
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
              className="w-full text-center text-xl sm:text-2xl font-black font-display tracking-widest px-3 py-2.5 bg-white border-3 border-[#1E232A] rounded-2xl shadow-pop-sm focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
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
              className="w-full text-center text-xs sm:text-sm font-mono font-bold px-3 py-2 bg-white border-2 border-[#1E232A] rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Live ID Parser Preview */}
          {parsedPreview && (
            <div 
              className="p-2.5 rounded-xl border-2 border-[#1E232A] text-left text-xs font-black flex items-center justify-between animate-bounce-in shadow-pop-sm"
              style={{ backgroundColor: parsedPreview.lightColor, color: '#1E232A' }}
            >
              <div>
                <span className="block text-[10px] text-gray-500">স্বয়ংক্রিয় শনাক্তকরণ:</span>
                <span className="text-xs sm:text-sm font-black">{parsedPreview.deptName} ({parsedPreview.deptAbbr})</span>
              </div>
              <div className="text-right">
                <span className="block text-[10px] text-gray-500">ব্যাচ • রোল:</span>
                <span className="text-xs sm:text-sm font-black">{parsedPreview.batchShort} • {parsedPreview.roll}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!parsedPreview || isSubmitting}
            className={`pop-btn w-full py-3 font-black text-sm sm:text-base flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              parsedPreview && !isSubmitting
                ? 'bg-[#4ECDC4] text-[#1E232A] shadow-pop hover:bg-[#3dbdb5]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
            }`}
          >
            <UserCheck className="w-5 h-5" />
            <span>{isSubmitting ? 'অনুমোদন হচ্ছে...' : 'অনুমোদন করুন (Authorize)'}</span>
          </button>
        </form>

        {feedback && (
          <div className={`p-2.5 rounded-xl border-2 border-[#1E232A] text-xs font-bold flex items-center space-x-2 animate-bounce-in ${
            feedback.type === 'success' ? 'bg-[#D4F8F0] text-[#00897B]' : 'bg-[#FFE0E2] text-[#D32F2F]'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{feedback.text}</span>
          </div>
        )}
      </div>

      {/* Live Booth Quick Stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="pop-box p-3 bg-white border-2.5 border-[#1E232A] text-center shadow-pop-sm">
          <div className="flex items-center justify-center space-x-1 text-gray-500 mb-0.5">
            <Users className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">মোট নিবন্ধিত:</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-[#1E232A]">
            {playersList.length} জন
          </span>
        </div>

        <div className="pop-box p-3 bg-white border-2.5 border-[#1E232A] text-center shadow-pop-sm">
          <div className="flex items-center justify-center space-x-1 text-gray-500 mb-0.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-bold">খেলা সম্পন্ন:</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-emerald-600">
            {completedCount} জন
          </span>
        </div>
      </div>

      {/* --- REGISTERED STUDENTS VIEWER SECTION --- */}
      <div className="pop-box p-4 bg-white border-3.5 border-[#1E232A] shadow-pop space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-dashed border-[#1E232A]/20 pb-2.5">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFE66D] border-2 border-[#1E232A] flex items-center justify-center text-base font-black">
              📋
            </div>
            <div>
              <h3 className="text-base font-black text-[#1E232A]">
                নিবন্ধিত শিক্ষার্থীদের তালিকা (Registered Students)
              </h3>
              <span className="text-[11px] text-gray-500 font-bold">
                মোট {filteredPlayers.length} জন দেখানো হচ্ছে
              </span>
            </div>
          </div>

          <button
            onClick={() => { sound.playPop(); fetchRegisteredPlayers(); }}
            disabled={isLoadingPlayers}
            className="self-start sm:self-auto px-2.5 py-1.5 bg-[#F8F9FA] hover:bg-gray-100 border-2 border-[#1E232A] rounded-xl text-xs font-bold flex items-center space-x-1 shadow-xs cursor-pointer active:scale-95"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPlayers ? 'animate-spin text-blue-600' : 'text-gray-600'}`} />
            <span>{isLoadingPlayers ? 'আপডেট হচ্ছে...' : 'রিফ্রেশ'}</span>
          </button>
        </div>

        {/* Search & Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Search Bar */}
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="আইডি / RFID / ডিপার্টমেন্ট..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs font-bold bg-[#F8F9FA] border-2 border-[#1E232A] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#4ECDC4]"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-bold bg-[#F8F9FA] border-2 border-[#1E232A] rounded-xl focus:outline-none cursor-pointer"
            >
              <option value="ALL">সকল ডিপার্টমেন্ট (All Depts)</option>
              {DEPARTMENT_LIST.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.abbr} - {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 text-xs font-bold bg-[#F8F9FA] border-2 border-[#1E232A] rounded-xl focus:outline-none cursor-pointer"
            >
              <option value="ALL">সকল স্ট্যাটাস (All Status)</option>
              <option value="COMPLETED">✅ খেলা সম্পন্ন (Completed)</option>
              <option value="IN_PROGRESS">⏳ চলমান / ইন-প্রগ্রেস</option>
            </select>
          </div>
        </div>

        {/* Students Table / Cards List */}
        <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1 divide-y divide-gray-100">
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map((p) => {
              const dept = DEPARTMENTS[p.deptCode];
              const isCompleted = p.status === 'COMPLETED';

              return (
                <div
                  key={p.studentId}
                  className="p-2.5 bg-[#FBFBFC] hover:bg-[#F3F4F6] rounded-xl border-2 border-[#1E232A]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all shadow-xs"
                >
                  {/* Left: ID & Dept Info */}
                  <div className="flex items-center space-x-2.5">
                    <div 
                      className="w-9 h-9 rounded-xl border-2 border-[#1E232A] flex flex-col items-center justify-center font-black text-[10px] text-white shadow-xs flex-shrink-0"
                      style={{ backgroundColor: dept?.themeColor || '#6B7280' }}
                    >
                      <span>{dept?.abbr || p.deptCode}</span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-black text-sm text-[#1E232A] tracking-wider">
                          {p.studentId}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-gray-200 text-gray-700 font-bold">
                          {p.batch} ব্যাচ
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-[10px] text-gray-500 mt-0.5">
                        {p.rfid ? (
                          <span className="font-mono text-blue-600 font-bold truncate max-w-[120px]" title={p.rfid}>
                            🏷️ {p.rfid}
                          </span>
                        ) : (
                          <span className="text-gray-400">RFID নেই</span>
                        )}
                        <span>•</span>
                        <span>{dept?.name || ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Game Stats Summary */}
                  <div className="flex items-center space-x-2 text-[11px] font-bold text-gray-700 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                    <span title="ব্যাটেলশিপ চাল" className="flex items-center space-x-0.5">
                      <span>🚢</span>
                      <span>{p.battleshipMoves?.length || 0}/3</span>
                    </span>
                    <span>•</span>
                    <span title="কানেক্ট-৪" className="flex items-center space-x-0.5">
                      <span>🔴</span>
                      <span>{p.connect4Col !== null ? `C${p.connect4Col + 1}` : '-'}</span>
                    </span>
                    <span>•</span>
                    <span title="টাওয়ার স্ট্যাক" className="flex items-center space-x-0.5">
                      <span>🏗️</span>
                      <span>{p.stackFloors || 0}F</span>
                    </span>
                    <span>•</span>
                    <span className="text-emerald-700 font-black" title="অর্জিত মোট পয়েন্ট">
                      +{p.totalPointsEarned || 0} Pts
                    </span>
                  </div>

                  {/* Right: Status & Actions */}
                  <div className="flex items-center justify-between sm:justify-end space-x-2">
                    <span 
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                        isCompleted 
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {isCompleted ? 'COMPLETED' : p.currentStage || 'REGISTERED'}
                    </span>

                    {/* Reset Player Button */}
                    <button
                      onClick={() => handleResetSinglePlayer(p.studentId)}
                      disabled={resettingId === p.studentId}
                      className="px-2 py-1 bg-white hover:bg-red-50 text-red-600 border border-red-300 rounded-lg text-[10px] font-bold flex items-center space-x-0.5 shadow-xs active:scale-95 cursor-pointer"
                      title="এই শিক্ষার্থীর চাল ও গেম রিসেট করুন (পুনরায় খেলার জন্য)"
                    >
                      <RotateCcw className={`w-3 h-3 ${resettingId === p.studentId ? 'animate-spin' : ''}`} />
                      <span>রিসেট</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-xs text-gray-400 py-8 font-bold">
              {isLoadingPlayers ? 'লোড হচ্ছে...' : 'কোনো নিবন্ধিত শিক্ষার্থী পাওয়া যায়নি।'}
            </div>
          )}
        </div>
      </div>

      {/* Emergency Control / Danger Zone */}
      <div className="pop-box p-3.5 bg-white border-3 border-[#1E232A] flex items-center justify-between shadow-pop-sm">
        <div>
          <h4 className="text-xs font-black text-red-600">জরুরি কন্ট্রোল (Emergency Reset)</h4>
          <p className="text-[10px] text-gray-500">সমস্ত ডিপার্টমেন্ট পয়েন্ট ও বোর্ড রিসেট</p>
        </div>

        <button
          onClick={handleResetBoard}
          className="pop-btn-sm px-3 py-1.5 bg-[#FF5964] text-white text-xs font-black flex items-center space-x-1 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>রিসেট অল</span>
        </button>
      </div>
    </div>
  );
};
