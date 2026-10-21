'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Search, 
  Star, 
  Save, 
  CheckCircle2, 
  Printer, 
  Award, 
  HeartHandshake, 
  UserCheck, 
  BookOpen,
  Calendar
} from 'lucide-react';
import { db } from '@/lib/db';
import { Student, TarbiyatLog, AppSettings } from '@/lib/types';
import { checkPendingCount } from '@/lib/sync-engine';

export default function TarbiyatPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [tarbiyatMap, setTarbiyatMap] = useState<Record<string, TarbiyatLog>>({});
  const [selectedMonth, setSelectedMonth] = useState('সেপ্টেম্বর ২০২৬');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentForPrint, setSelectedStudentForPrint] = useState<{ student: Student; log: TarbiyatLog } | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  async function loadData() {
    const allStudents = await db.students.filter(s => s.is_active).toArray();
    setStudents(allStudents.sort((a, b) => a.roll - b.roll));

    const logs = await db.tarbiyat_logs.where('month').equals(selectedMonth).toArray();
    const map: Record<string, TarbiyatLog> = {};
    logs.forEach(l => {
      map[l.student_id] = l;
    });
    setTarbiyatMap(map);

    const appSettings = await db.settings.get('main_settings');
    if (appSettings) setSettings(appSettings);
  }

  const handleRatingChange = (
    studentId: string, 
    field: 'namaz_score' | 'tahajjud_score' | 'mutalaah_score' | 'akhlaq_score', 
    rating: number
  ) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const existing: TarbiyatLog = tarbiyatMap[studentId] || {
      id: `tb-${studentId}-${Date.now()}`,
      student_id: studentId,
      student_name: student.name,
      roll: student.roll,
      department: student.department,
      month: selectedMonth,
      namaz_score: 5,
      tahajjud_score: 3,
      mutalaah_score: 4,
      akhlaq_score: 5,
      overall_grade: 'মুমতাজ',
      notes: '',
    };

    const updated: TarbiyatLog = {
      ...existing,
      [field]: rating,
    };

    // Calculate overall grade
    const avg = (updated.namaz_score + updated.tahajjud_score + updated.mutalaah_score + updated.akhlaq_score) / 4;
    if (avg >= 4.5) updated.overall_grade = 'মুমতাজ';
    else if (avg >= 3.5) updated.overall_grade = 'জাইয়িদ জিদ্দান';
    else if (avg >= 2.5) updated.overall_grade = 'জাইয়িদ';
    else updated.overall_grade = 'উন্নতি প্রয়োজন';

    setTarbiyatMap(prev => ({ ...prev, [studentId]: updated }));
  };

  const handleNotesChange = (studentId: string, note: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const existing: TarbiyatLog = tarbiyatMap[studentId] || {
      id: `tb-${studentId}-${Date.now()}`,
      student_id: studentId,
      student_name: student.name,
      roll: student.roll,
      department: student.department,
      month: selectedMonth,
      namaz_score: 5,
      tahajjud_score: 3,
      mutalaah_score: 4,
      akhlaq_score: 5,
      overall_grade: 'মুমতাজ',
      notes: '',
    };

    setTarbiyatMap(prev => ({ ...prev, [studentId]: { ...existing, notes: note } }));
  };

  const handleSaveAll = async () => {
    const logsToSave = Object.values(tarbiyatMap);
    if (logsToSave.length === 0) return;

    await db.tarbiyat_logs.bulkPut(logsToSave);
    await checkPendingCount();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const filteredStudents = students.filter(st =>
    st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    st.roll.toString().includes(searchQuery)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">মুহাসাবা ও তারবিয়াত ট্র্যাকার</h2>
            <p className="text-xs text-slate-500">৫ ওয়াক্ত নামাজ, তাহাজ্জুদ, কিতাব মুতালাআ ও আখলাকের মাসিক মূল্যায়ন</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-purple-600" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent focus:outline-none"
            >
              <option value="সেপ্টেম্বর ২০২৬">সেপ্টেম্বর ২০২৬</option>
              <option value="অক্টোবর ২০২৬">অক্টোবর ২০২৬</option>
              <option value="নভেম্বর ২০২৬">নভেম্বর ২০২৬</option>
              <option value="ডিসেম্বর ২০২৬">ডিসেম্বর ২০২৬</option>
            </select>
          </div>

          <button
            onClick={handleSaveAll}
            className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow transition-colors"
          >
            <Save className="w-4 h-4 mr-1.5" />
            সংরক্ষণ করুন
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-purple-50 text-purple-800 text-xs font-semibold px-4 py-3 rounded-xl border border-purple-200 flex items-center animate-fade-in">
          <CheckCircle2 className="w-4 h-4 mr-2 text-purple-600" />
          সকল শিক্ষার্থীর আমল ও তারবিয়াত সফলভাবে সংরক্ষিত হয়েছে!
        </div>
      )}

      {/* Main Table / Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="font-bold text-base text-slate-800 flex items-center">
            <HeartHandshake className="w-5 h-5 mr-2 text-purple-600" />
            শিক্ষার্থীদের মাসিক আমল মূল্যায়ন ({selectedMonth})
          </span>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="রোল বা নাম..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>
        </div>

        {/* Tarbiyat Cards / Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="p-3 w-16 text-center">রোল</th>
                <th className="p-3">শিক্ষার্থীর নাম</th>
                <th className="p-3 text-center">৫ ওয়াক্ত নামাজ</th>
                <th className="p-3 text-center">তাহাজ্জুদ ও নফল</th>
                <th className="p-3 text-center">মুতালাআ (অধ্যয়ন)</th>
                <th className="p-3 text-center">আখলাক ও আদব</th>
                <th className="p-3 text-center">সার্বিক মান</th>
                <th className="p-3 text-center">সনদ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((st) => {
                const log = tarbiyatMap[st.id] || {
                  id: '',
                  student_id: st.id,
                  student_name: st.name,
                  roll: st.roll,
                  department: st.department,
                  month: selectedMonth,
                  namaz_score: 5,
                  tahajjud_score: 3,
                  mutalaah_score: 4,
                  akhlaq_score: 5,
                  overall_grade: 'মুমতাজ',
                };
                return (
                  <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-center">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold inline-flex items-center justify-center">
                        {st.roll}
                      </span>
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-800 text-sm">{st.name}</p>
                      <p className="text-[11px] text-slate-400">{st.department} • {st.residential_status}</p>
                    </td>

                    {/* 5-Waqt Namaz Stars */}
                    <td className="p-3 text-center">
                      <StarRating
                        score={log.namaz_score}
                        onChange={(r) => handleRatingChange(st.id, 'namaz_score', r)}
                      />
                    </td>

                    {/* Tahajjud Stars */}
                    <td className="p-3 text-center">
                      <StarRating
                        score={log.tahajjud_score}
                        onChange={(r) => handleRatingChange(st.id, 'tahajjud_score', r)}
                      />
                    </td>

                    {/* Mutalaah Stars */}
                    <td className="p-3 text-center">
                      <StarRating
                        score={log.mutalaah_score}
                        onChange={(r) => handleRatingChange(st.id, 'mutalaah_score', r)}
                      />
                    </td>

                    {/* Akhlaq Stars */}
                    <td className="p-3 text-center">
                      <StarRating
                        score={log.akhlaq_score}
                        onChange={(r) => handleRatingChange(st.id, 'akhlaq_score', r)}
                      />
                    </td>

                    {/* Overall Grade */}
                    <td className="p-3 text-center">
                      <span className={`inline-block text-[10px] px-2.5 py-1 rounded-full font-bold ${
                        log.overall_grade === 'মুমতাজ'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.overall_grade === 'জাইয়িদ জিদ্দান'
                          ? 'bg-blue-100 text-blue-800'
                          : log.overall_grade === 'জাইয়িদ'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {log.overall_grade}
                      </span>
                    </td>

                    {/* Certificate / Print */}
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedStudentForPrint({ student: st, log })}
                        className="p-1.5 text-purple-700 hover:bg-purple-50 rounded-lg border border-purple-200 transition-colors inline-flex items-center"
                        title="মাসিক আমলনামা সনদ প্রিন্ট"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= Printable Tarbiyat Certificate Modal ================= */}
      {selectedStudentForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative my-8 space-y-4">
            <div className="no-print flex justify-between items-center pb-2 border-b">
              <span className="font-bold text-xs text-slate-600">মাসিক আমলনামা ও তারবিয়াত সনদ</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-purple-600 text-white font-bold rounded-lg text-xs"
                >
                  প্রিন্ট করুন
                </button>
                <button onClick={() => setSelectedStudentForPrint(null)} className="text-slate-400 hover:text-slate-700">✕</button>
              </div>
            </div>

            {/* Printable Certificate Area */}
            <div className="printable-area border-4 border-double border-purple-900 rounded-2xl p-6 bg-white text-slate-900 text-center space-y-4 font-sans">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">বিসমিল্লাহির রাহমানির রাহীম</p>
              <h3 className="font-extrabold text-xl text-purple-950">
                {settings?.madrasah_name || 'দারুল উলুম ইসলামিয়া মাদ্রাসা'}
              </h3>
              <div className="inline-block bg-purple-50 border border-purple-300 text-purple-900 px-4 py-1 rounded-full text-xs font-bold">
                মাসিক মুহাসাবা ও তারবিয়াত মূল্যায়ন পত্র
              </div>
              <p className="text-xs text-slate-500">মূল্যায়ন মাস: {selectedMonth}</p>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">ছাত্রের নাম:</span>
                  <span className="font-bold text-slate-900">{selectedStudentForPrint.student.name}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">রোল ও বিভাগ:</span>
                  <span className="font-semibold text-slate-800">
                    রোল {selectedStudentForPrint.student.roll} ({selectedStudentForPrint.student.department})
                  </span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">৫ ওয়াক্ত নামাজের জামাত:</span>
                  <span className="font-bold text-purple-800">{selectedStudentForPrint.log.namaz_score} / ৫ স্টার</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">তাহাজ্জুদ ও নফল আমল:</span>
                  <span className="font-bold text-purple-800">{selectedStudentForPrint.log.tahajjud_score} / ৫ স্টার</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">মুতালাআ ও স্বশিক্ষা:</span>
                  <span className="font-bold text-purple-800">{selectedStudentForPrint.log.mutalaah_score} / ৫ স্টার</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">আদব, আখলাক ও পরিচ্ছন্নতা:</span>
                  <span className="font-bold text-purple-800">{selectedStudentForPrint.log.akhlaq_score} / ৫ স্টার</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="font-bold text-slate-900">সার্বিক মূল্যায়ন গ্রেড:</span>
                  <span className="font-extrabold text-sm text-emerald-800">
                    {selectedStudentForPrint.log.overall_grade}
                  </span>
                </div>
              </div>

              <div className="pt-6 flex justify-between text-[10px] text-slate-600">
                <div>
                  <div className="border-t border-slate-400 w-24 mx-auto mb-1" />
                  <span>নিগরান উস্তাদের স্বাক্ষর</span>
                </div>
                <div>
                  <div className="border-t border-slate-400 w-24 mx-auto mb-1" />
                  <span>মুহতামিমের স্বাক্ষর</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StarRating({ score, onChange }: { score: number; onChange: (r: number) => void }) {
  return (
    <div className="inline-flex items-center space-x-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="p-0.5 hover:scale-125 transition-transform"
        >
          <Star
            className={`w-3.5 h-3.5 ${
              star <= score
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
