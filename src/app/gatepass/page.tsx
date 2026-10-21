'use client';

import React, { useState, useEffect } from 'react';
import { 
  DoorOpen, 
  PlusCircle, 
  Search, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Users, 
  FileText, 
  Phone, 
  X,
  UserCheck,
  Building2
} from 'lucide-react';
import { db } from '@/lib/db';
import { Student, Gatepass, VisitorMulaqat, AppSettings } from '@/lib/types';
import { checkPendingCount } from '@/lib/sync-engine';

export default function GatepassPage() {
  const [activeTab, setActiveTab] = useState<'gatepass' | 'mulaqat'>('gatepass');
  const [gatepasses, setGatepasses] = useState<Gatepass[]>([]);
  const [mulaqats, setMulaqats] = useState<VisitorMulaqat[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isNewGatepassOpen, setIsNewGatepassOpen] = useState(false);
  const [isNewMulaqatOpen, setIsNewMulaqatOpen] = useState(false);
  const [selectedGatepassForPrint, setSelectedGatepassForPrint] = useState<Gatepass | null>(null);

  // New Gatepass Form
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [reason, setReason] = useState('পারিবারিক কারণ ও বাড়ি গমন');
  const [departureDate, setDepartureDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnDate, setReturnDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // New Mulaqat Form
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [mulaqatStudentId, setMulaqatStudentId] = useState('');
  const [relationship, setRelationship] = useState('পিতা');
  const [purpose, setPurpose] = useState('মাসিক খরচ ও প্রয়োজনীয় জিনিস পৌঁছে দেওয়া');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const allGp = await db.gatepasses.orderBy('departure_date').reverse().toArray();
    setGatepasses(allGp);

    const allMul = await db.mulaqat_register.toArray();
    setMulaqats(allMul.reverse());

    const allStudents = await db.students.filter(s => s.is_active).toArray();
    setStudents(allStudents.sort((a, b) => a.roll - b.roll));

    const appSettings = await db.settings.get('main_settings');
    if (appSettings) setSettings(appSettings);
  }

  const handleCreateGatepass = async (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.id === selectedStudentId);
    if (!st) {
      alert('শিক্ষার্থী নির্বাচন করুন');
      return;
    }

    const slipNo = `GP-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newGp: Gatepass = {
      id: `gp-${Date.now()}`,
      slip_no: slipNo,
      student_id: st.id,
      student_name: st.name,
      roll: st.roll,
      department: st.sub_class || st.department,
      reason,
      departure_date: departureDate,
      return_date: returnDate,
      guardian_phone: st.phone,
      approved_by: settings?.muhtamim_name || 'মুহতামিম',
      status: 'অনুমোদিত',
      synced: false,
    };

    await db.gatepasses.put(newGp);
    await checkPendingCount();
    await loadData();

    setIsNewGatepassOpen(false);
    setSelectedGatepassForPrint(newGp);
  };

  const handleUpdateGpStatus = async (id: string, newStatus: 'অনুমোদিত' | 'প্রস্থানকৃত' | 'প্রত্যাবর্তন সম্পন্ন') => {
    await db.gatepasses.update(id, { status: newStatus, synced: false });
    await checkPendingCount();
    await loadData();
  };

  const handleCreateMulaqat = async (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.id === mulaqatStudentId);
    if (!st || !visitorName) {
      alert('সাক্ষাৎপ্রার্থীর নাম ও ছাত্র নির্বাচন করুন');
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

    const newMul: VisitorMulaqat = {
      id: `mul-${Date.now()}`,
      visitor_name: visitorName,
      visitor_phone: visitorPhone,
      student_name: st.name,
      student_roll: st.roll,
      relationship,
      purpose,
      date: now.toISOString().split('T')[0],
      time: timeStr,
      synced: false,
    };

    await db.mulaqat_register.put(newMul);
    await checkPendingCount();
    await loadData();

    setIsNewMulaqatOpen(false);
    setVisitorName('');
    setVisitorPhone('');
  };

  const filteredGatepasses = gatepasses.filter(gp =>
    gp.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gp.slip_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gp.roll.toString().includes(searchQuery)
  );

  const filteredMulaqats = mulaqats.filter(mul =>
    mul.visitor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mul.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mul.student_roll.toString().includes(searchQuery)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shadow-inner">
            <DoorOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">দারুল ইকামা গেটপাস ও মুলাকাত</h2>
            <p className="text-xs text-slate-500">হোস্টেল ছুটির ডিজিটাল গেটপাস স্লিপ প্রিন্ট এবং বহিরাগত মুলাকাত রেজিস্টার</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'gatepass' ? (
            <button
              onClick={() => setIsNewGatepassOpen(true)}
              className="inline-flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow transition-colors"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              নতুন ছুটির গেটপাস
            </button>
          ) : (
            <button
              onClick={() => setIsNewMulaqatOpen(true)}
              className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow transition-colors"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              মুলাকাত রেজিস্টার এন্ট্রি
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('gatepass')}
          className={`pb-3 px-4 font-bold text-xs sm:text-sm transition-all border-b-2 ${
            activeTab === 'gatepass'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          🚪 আবাসিক ছুটির গেটপাস ({gatepasses.length})
        </button>
        <button
          onClick={() => setActiveTab('mulaqat')}
          className={`pb-3 px-4 font-bold text-xs sm:text-sm transition-all border-b-2 ${
            activeTab === 'mulaqat'
              ? 'border-blue-600 text-blue-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          👥 অভিভাবক মুলাকাত রেজিস্টার ({mulaqats.length})
        </button>
      </div>

      {/* TAB 1: GATEPASSES LIST */}
      {activeTab === 'gatepass' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <span className="font-bold text-base text-slate-800">ছুটির গেটপাস তালিকা</span>
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="স্লিপ নং, রোল বা নাম..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="p-3">স্লিপ নং</th>
                  <th className="p-3">শিক্ষার্থী</th>
                  <th className="p-3">ছুটির কারণ</th>
                  <th className="p-3">প্রস্থান তারিখ</th>
                  <th className="p-3">প্রত্যাবর্তন তারিখ</th>
                  <th className="p-3 text-center">বর্তমান অবস্থা</th>
                  <th className="p-3 text-center">স্লিপ প্রিন্ট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGatepasses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      কোনো ছুটির গেটপাস রেকর্ড পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  filteredGatepasses.map((gp) => (
                    <tr key={gp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-800">{gp.slip_no}</td>
                      <td className="p-3">
                        <p className="font-bold text-slate-800 text-sm">{gp.student_name}</p>
                        <p className="text-[11px] text-slate-400">রোল {gp.roll} • {gp.department}</p>
                      </td>
                      <td className="p-3 text-slate-700 max-w-xs">{gp.reason}</td>
                      <td className="p-3 text-slate-600">{gp.departure_date}</td>
                      <td className="p-3 font-bold text-amber-800">{gp.return_date}</td>
                      <td className="p-3 text-center">
                        <select
                          value={gp.status}
                          onChange={(e) => handleUpdateGpStatus(gp.id, e.target.value as any)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg border focus:outline-none ${
                            gp.status === 'অনুমোদিত'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : gp.status === 'প্রস্থানকৃত'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          <option value="অনুমোদিত">অনুমোদিত</option>
                          <option value="প্রস্থানকৃত">প্রস্থান করেছে</option>
                          <option value="প্রত্যাবর্তন সম্পন্ন">ফিরে এসেছে</option>
                        </select>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedGatepassForPrint(gp)}
                          className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 inline-flex items-center"
                          title="দারোয়ানের কাগজের স্লিপ প্রিন্ট"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MULAQAT REGISTER */}
      {activeTab === 'mulaqat' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <span className="font-bold text-base text-slate-800">অভিভাবক মুলাকাত ডায়েরি</span>
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="দর্শনার্থী বা ছাত্রের নাম..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="p-3">তারিখ ও সময়</th>
                  <th className="p-3">সাক্ষাৎপ্রার্থীর নাম</th>
                  <th className="p-3">মোবাইল নম্বর</th>
                  <th className="p-3">সম্পর্ক</th>
                  <th className="p-3">শিক্ষার্থী</th>
                  <th className="p-3">সাক্ষাতের উদ্দেশ্য</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMulaqats.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      কোনো মুলাকাতের রেকর্ড পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  filteredMulaqats.map((mul) => (
                    <tr key={mul.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-slate-500">
                        <span className="font-bold text-slate-700">{mul.date}</span>
                        <p className="text-[10px] text-slate-400">{mul.time}</p>
                      </td>
                      <td className="p-3 font-bold text-slate-800 text-sm">{mul.visitor_name}</td>
                      <td className="p-3 font-mono text-slate-600">{mul.visitor_phone}</td>
                      <td className="p-3">
                        <span className="inline-block bg-slate-100 px-2 py-0.5 rounded-full text-[10px] font-medium">
                          {mul.relationship}
                        </span>
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-slate-800">{mul.student_name}</p>
                        <p className="text-[10px] text-slate-400">রোল {mul.student_roll}</p>
                      </td>
                      <td className="p-3 text-slate-600 max-w-xs">{mul.purpose}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= New Gatepass Modal ================= */}
      {isNewGatepassOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-base text-slate-800">ছুটির গেটপাস তৈরি করুন</h3>
              <button onClick={() => setIsNewGatepassOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleCreateGatepass} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">আবাসিক শিক্ষার্থী:</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium"
                  required
                >
                  <option value="">-- শিক্ষার্থী নির্বাচন করুন --</option>
                  {students.filter(s => s.residential_status === 'আবাসিক').map(st => (
                    <option key={st.id} value={st.id}>
                      {st.name} (রোল: {st.roll} • {st.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ছুটির কারণ:</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">প্রস্থানের তারিখ:</label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">প্রত্যাবর্তনের শেষ তারিখ:</label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsNewGatepassOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-semibold">বাতিল</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow">অনুমোদন ও প্রিন্ট</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= New Mulaqat Modal ================= */}
      {isNewMulaqatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-base text-slate-800">মুলাকাত রেজিস্টার এন্ট্রি</h3>
              <button onClick={() => setIsNewMulaqatOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleCreateMulaqat} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">সাক্ষাৎপ্রার্থীর নাম:</label>
                <input
                  type="text"
                  placeholder="অভিভাবক বা আত্মীয়ের নাম"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">মোবাইল নম্বর:</label>
                  <input
                    type="tel"
                    placeholder="017XXXXXXXX"
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">সম্পর্ক:</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-2"
                  >
                    <option value="পিতা">পিতা</option>
                    <option value="মাতা">মাতা</option>
                    <option value="ভাই">ভাই</option>
                    <option value="চাচা / মামা">চাচা / মামা</option>
                    <option value="অন্যান্য অভিভাবক">অন্যান্য অভিভাবক</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">শিক্ষার্থী:</label>
                <select
                  value={mulaqatStudentId}
                  onChange={(e) => setMulaqatStudentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium"
                  required
                >
                  <option value="">-- শিক্ষার্থী নির্বাচন করুন --</option>
                  {students.map(st => (
                    <option key={st.id} value={st.id}>
                      {st.name} (রোল: {st.roll} • {st.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">সাক্ষাতের উদ্দেশ্য:</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsNewMulaqatOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-semibold">বাতিল</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl shadow">লিপিবদ্ধ করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= Printable Gatepass Slip Modal ================= */}
      {selectedGatepassForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative my-8 space-y-4">
            <div className="no-print flex justify-between items-center pb-2 border-b">
              <span className="font-bold text-xs text-slate-600">দারোয়ানের গেটপাস স্লিপ প্রিভিউ</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg text-xs"
                >
                  প্রিন্ট করুন
                </button>
                <button onClick={() => setSelectedGatepassForPrint(null)} className="text-slate-400 hover:text-slate-700">✕</button>
              </div>
            </div>

            {/* Printable Paper Slip Area */}
            <div className="printable-area border-2 border-dashed border-slate-400 rounded-xl p-4 bg-white text-slate-900 space-y-3 font-sans text-xs">
              <div className="text-center border-b border-slate-300 pb-2">
                <p className="font-bold text-sm text-slate-900 leading-tight">
                  {settings?.madrasah_name || 'দারুল উলুম ইসলামিয়া মাদ্রাসা'}
                </p>
                <p className="text-[10px] text-slate-500">দারুল ইকামা (হোস্টেল) প্রস্থান গেটপাস</p>
                <div className="inline-block mt-1 font-mono font-bold bg-slate-100 px-2.5 py-0.5 rounded text-[11px]">
                  স্লিপ নং: {selectedGatepassForPrint.slip_no}
                </div>
              </div>

              <div className="space-y-1.5 py-1 text-[11px]">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">ছাত্রের নাম:</span>
                  <span className="font-bold text-slate-900">{selectedGatepassForPrint.student_name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">রোল ও জামাত:</span>
                  <span className="font-semibold text-slate-800">
                    রোল {selectedGatepassForPrint.roll} ({selectedGatepassForPrint.department})
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">ছুটির কারণ:</span>
                  <span className="text-slate-800">{selectedGatepassForPrint.reason}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">প্রস্থান তারিখ:</span>
                  <span className="font-semibold text-slate-800">{selectedGatepassForPrint.departure_date}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">প্রত্যাবর্তনের শেষ তারিখ:</span>
                  <span className="font-extrabold text-amber-800">{selectedGatepassForPrint.return_date}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-slate-500">জরুরি যোগাযোগ:</span>
                  <span className="font-mono">{selectedGatepassForPrint.guardian_phone}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-2 rounded border border-slate-200 text-[10px] text-slate-600">
                <p className="font-bold text-slate-800">গেটরক্ষীর দায়িত্ব:</p>
                <p>ছাত্রকে গেট পার করার সময় এই স্লিপে স্বাক্ষর রেখে ছাত্র ফেরত এলে অফিসে জমা দিন।</p>
              </div>

              <div className="pt-4 flex justify-between text-[9px] text-slate-600">
                <div className="text-center">
                  <div className="border-t border-slate-400 w-20 mx-auto mb-0.5" />
                  <span>হোস্টেল সুপারের স্বাক্ষর</span>
                </div>
                <div className="text-center">
                  <div className="border-t border-slate-400 w-20 mx-auto mb-0.5" />
                  <span>গেট দারোয়ানের স্বাক্ষর</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
