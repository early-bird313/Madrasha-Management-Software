'use client';

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Search, 
  Printer, 
  Save, 
  CheckCircle2, 
  PlusCircle, 
  Award, 
  BookOpen, 
  Users, 
  Trophy,
  SlidersHorizontal
} from 'lucide-react';
import { db } from '@/lib/db';
import { 
  Exam, 
  ExamSubject, 
  ExamMark, 
  Student, 
  Department, 
  GradingSystem, 
  AppSettings 
} from '@/lib/types';
import AdmitCardModal from '@/components/AdmitCardModal';
import { checkPendingCount } from '@/lib/sync-engine';

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [subjects, setSubjects] = useState<ExamSubject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [marksMap, setMarksMap] = useState<Record<string, number>>({});
  const [settings, setSettings] = useState<AppSettings | null>(null);

  // Filter
  const [selectedDept, setSelectedDept] = useState<Department>('কিতাব');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modals
  const [isAdmitCardModalOpen, setIsAdmitCardModalOpen] = useState(false);
  const [isNewExamModalOpen, setIsNewExamModalOpen] = useState(false);
  const [isNewSubjectModalOpen, setIsNewSubjectModalOpen] = useState(false);

  // New Exam Form
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamYear, setNewExamYear] = useState('২০২৬');
  const [newExamGrading, setNewExamGrading] = useState<GradingSystem>('বেফাক');

  // New Subject Form
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectDept, setNewSubjectDept] = useState<Department>('কিতাব');
  const [newSubjectClass, setNewSubjectClass] = useState('মিজান জামাত');
  const [newSubjectFullMarks, setNewSubjectFullMarks] = useState(100);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const allExams = await db.exams.toArray();
    setExams(allExams);

    if (allExams.length > 0) {
      const active = allExams.find(e => e.is_active) || allExams[0];
      setSelectedExamId(active.id);
      await loadSubjectsAndStudents(active.id, 'কিতাব');
    }

    const appSettings = await db.settings.get('main_settings');
    if (appSettings) setSettings(appSettings);
  }

  const loadSubjectsAndStudents = async (examId: string, dept: Department) => {
    const allSubjects = await db.exam_subjects
      .filter(s => s.exam_id === examId && s.department === dept)
      .toArray();
    setSubjects(allSubjects);

    if (allSubjects.length > 0) {
      setSelectedSubjectId(allSubjects[0].id);
    } else {
      setSelectedSubjectId('');
    }

    const allStudents = await db.students
      .filter(st => st.department === dept && st.is_active)
      .toArray();
    setStudents(allStudents.sort((a, b) => a.roll - b.roll));

    // Load existing marks
    if (allSubjects.length > 0) {
      await loadMarksForSubject(examId, allSubjects[0].name);
    } else {
      setMarksMap({});
    }
  };

  const loadMarksForSubject = async (examId: string, subjectName: string) => {
    const marks = await db.exam_marks
      .filter(m => m.exam_id === examId && m.subject_name === subjectName)
      .toArray();
    const map: Record<string, number> = {};
    marks.forEach(m => {
      map[m.student_id] = m.obtained_marks;
    });
    setMarksMap(map);
  };

  const handleExamChange = async (examId: string) => {
    setSelectedExamId(examId);
    await loadSubjectsAndStudents(examId, selectedDept);
  };

  const handleDeptChange = async (dept: Department) => {
    setSelectedDept(dept);
    await loadSubjectsAndStudents(selectedExamId, dept);
  };

  const handleSubjectChange = async (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    const sub = subjects.find(s => s.id === subjectId);
    if (sub) {
      await loadMarksForSubject(selectedExamId, sub.name);
    }
  };

  const calculateGrade = (marks: number, gradingSystem: GradingSystem): string => {
    if (gradingSystem === 'বেফাক') {
      if (marks >= 80) return 'মুমতাজ (স্টার)';
      if (marks >= 65) return 'জাইয়িদ জিদ্দান (১ম)';
      if (marks >= 50) return 'জাইয়িদ (২য়)';
      if (marks >= 33) return 'মাকবুল (৩য়)';
      return 'রাসিব (ফেল)';
    } else {
      if (marks >= 80) return 'A+ (5.0)';
      if (marks >= 70) return 'A (4.0)';
      if (marks >= 60) return 'A- (3.5)';
      if (marks >= 50) return 'B (3.0)';
      if (marks >= 40) return 'C (2.0)';
      if (marks >= 33) return 'D (1.0)';
      return 'F (0.0)';
    }
  };

  const handleMarkChange = (studentId: string, val: string) => {
    const num = val === '' ? 0 : Math.min(100, Math.max(0, Number(val)));
    setMarksMap(prev => ({ ...prev, [studentId]: num }));
  };

  const handleSaveMarks = async () => {
    const activeExam = exams.find(e => e.id === selectedExamId);
    const activeSubject = subjects.find(s => s.id === selectedSubjectId);
    if (!activeExam || !activeSubject) {
      alert('পরীক্ষা ও কিতাব নির্বাচন করুন');
      return;
    }

    const marksToPut: ExamMark[] = students.map(st => {
      const obtained = marksMap[st.id] || 0;
      const grade = calculateGrade(obtained, activeExam.grading_system);
      return {
        id: `em-${selectedExamId}-${activeSubject.name}-${st.id}`,
        exam_id: selectedExamId,
        subject_name: activeSubject.name,
        student_id: st.id,
        student_name: st.name,
        roll: st.roll,
        department: st.department,
        sub_class: st.sub_class || '',
        obtained_marks: obtained,
        grade,
        synced: false,
      };
    });

    await db.exam_marks.bulkPut(marksToPut);
    await checkPendingCount();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamTitle) return;

    const newEx: Exam = {
      id: `ex-${Date.now()}`,
      title: newExamTitle,
      academic_year: newExamYear,
      grading_system: newExamGrading,
      is_active: true,
      start_date: new Date().toISOString().split('T')[0],
    };

    await db.exams.put(newEx);
    setIsNewExamModalOpen(false);
    setNewExamTitle('');
    await loadData();
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName || !selectedExamId) return;

    const newSub: ExamSubject = {
      id: `sub-${Date.now()}`,
      exam_id: selectedExamId,
      department: newSubjectDept,
      sub_class: newSubjectClass,
      name: newSubjectName,
      full_marks: Number(newSubjectFullMarks),
      pass_marks: 33,
    };

    await db.exam_subjects.put(newSub);
    setIsNewSubjectModalOpen(false);
    setNewSubjectName('');
    await loadSubjectsAndStudents(selectedExamId, selectedDept);
  };

  const activeExam = exams.find(e => e.id === selectedExamId);
  const activeSubject = subjects.find(s => s.id === selectedSubjectId);

  const filteredStudents = students.filter(st =>
    st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    st.roll.toString().includes(searchQuery)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shadow-inner">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">কিতাব ও পরীক্ষা ইঞ্জিন</h2>
            <p className="text-xs text-slate-500">বেফাক ও বোর্ড ডুয়েল গ্রেডিং, দ্রুত নম্বর ইনপুট ও ৪-ইন-১ প্রবেশপত্র প্রিন্ট</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAdmitCardModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs shadow transition-colors"
          >
            <Printer className="w-4 h-4 mr-1.5 text-emerald-400" />
            ৪-ইন-১ এডমিট কার্ড
          </button>
          <button
            onClick={() => setIsNewExamModalOpen(true)}
            className="inline-flex items-center px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold rounded-xl text-xs border border-blue-200 transition-colors"
          >
            <PlusCircle className="w-4 h-4 mr-1" />
            নতুন পরীক্ষা
          </button>
          <button
            onClick={() => setIsNewSubjectModalOpen(true)}
            className="inline-flex items-center px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs border border-emerald-200 transition-colors"
          >
            <PlusCircle className="w-4 h-4 mr-1" />
            নতুন কিতাব / বিষয়
          </button>
        </div>
      </div>

      {/* Exam & Department Controls Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Exam Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">পরীক্ষা নির্বাচন:</label>
            <select
              value={selectedExamId}
              onChange={(e) => handleExamChange(e.target.value)}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500"
            >
              {exams.map(ex => (
                <option key={ex.id} value={ex.id}>
                  {ex.title} ({ex.grading_system === 'বেফাক' ? 'বেফাক মানদণ্ড' : 'বোর্ড GPA'})
                </option>
              ))}
            </select>
          </div>

          {/* Department Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">বিভাগ নির্বাচন:</label>
            <select
              value={selectedDept}
              onChange={(e) => handleDeptChange(e.target.value as Department)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5"
            >
              <option value="কিতাব">কিতাব বিভাগ (মিজান, নাহবেমীর...)</option>
              <option value="হিফজ">হিফজুল কুরআন বিভাগ</option>
              <option value="নাজেরা">নাজেরা বিভাগ</option>
              <option value="নূরানী">নূরানী বিভাগ</option>
            </select>
          </div>

          {/* Subject / Kitab Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">কিতাব / বিষয় নির্বাচন:</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5"
            >
              {subjects.length === 0 ? (
                <option value="">-- এই বিভাগে কোনো কিতাব যোগ করা নেই --</option>
              ) : (
                subjects.map(sub => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} (পূর্ণমান: {sub.full_marks})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Dual Grading Badge Notification */}
        {activeExam && (
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-700">বর্তমান গ্রেডিং স্কেল:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px]">
                {activeExam.grading_system === 'বেফাক' ? 'বেফাকুল মাদারিসিল আরাবিয়া মানদণ্ড' : 'বোর্ড জিপিএ (GPA 5.0)'}
              </span>
            </div>
            <div className="hidden sm:flex items-center space-x-2 text-[11px] text-slate-500">
              {activeExam.grading_system === 'বেফাক' ? (
                <span>মুমতাজ (৮০+) • জাইয়িদ জিদ্দান (৬৫-৭৯) • জাইয়িদ (৫০-৬৪) • মাকবুল (৩৩-৪৯)</span>
              ) : (
                <span>A+ (৮০+) • A (৭০-৭৯) • A- (৬০-৬৯) • B (৫০-৫৯) • F (৩৩ এর নিচে)</span>
              )}
            </div>
          </div>
        )}
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold px-4 py-3 rounded-xl border border-emerald-200 flex items-center animate-fade-in">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
          সকল শিক্ষার্থীর নম্বর ও গ্রেড সফলভাবে সংরক্ষিত হয়েছে!
        </div>
      )}

      {/* FAST MARKS ENTRY SPREADSHEET GRID */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-800 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-emerald-600" />
              {activeSubject?.name || 'কিতাব'} - নম্বর এন্ট্রি তালিকা
            </h3>
            <p className="text-xs text-slate-500">
              কিবোর্ডের Tab চেপে দ্রুত এক ছাত্র থেকে অন্য ছাত্রের নম্বর ইনপুট দিন
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="রোল বা নাম..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <button
              onClick={handleSaveMarks}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow transition-colors"
            >
              <Save className="w-4 h-4 mr-1.5" />
              নম্বর সংরক্ষণ করুন
            </button>
          </div>
        </div>

        {/* Students Marks Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="p-3 w-16 text-center">রোল</th>
                <th className="p-3">শিক্ষার্থীর নাম</th>
                <th className="p-3">বিভাগ / জামাত</th>
                <th className="p-3 text-center">পূর্ণমান</th>
                <th className="p-3 w-36 text-center">প্রাপ্ত নম্বর (Marks)</th>
                <th className="p-3 text-center">ফলাফল গ্রেড</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    এই বিভাগে কোনো শিক্ষার্থী পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const marks = marksMap[st.id] ?? '';
                  const grade = activeExam ? calculateGrade(Number(marks) || 0, activeExam.grading_system) : '';
                  const isPass = Number(marks) >= 33;
                  return (
                    <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-center">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold inline-flex items-center justify-center">
                          {st.roll}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-800 text-sm">
                        {st.name}
                      </td>
                      <td className="p-3 text-slate-500">
                        {st.sub_class || st.department}
                      </td>
                      <td className="p-3 text-center font-semibold text-slate-500">
                        {activeSubject?.full_marks || 100}
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          min="0"
                          max={activeSubject?.full_marks || 100}
                          placeholder="0"
                          value={marksMap[st.id] !== undefined ? marksMap[st.id] : ''}
                          onChange={(e) => handleMarkChange(st.id, e.target.value)}
                          className="w-24 text-center font-bold text-sm bg-slate-50 border border-slate-300 rounded-xl px-2 py-1.5 focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-block text-[11px] px-3 py-1 rounded-full font-bold ${
                          isPass
                            ? grade.includes('মুমতাজ') || grade.includes('A+')
                              ? 'bg-emerald-100 text-emerald-800'
                              : grade.includes('জাইয়িদ জিদ্দান') || grade.includes('A')
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {grade}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= New Exam Modal ================= */}
      {isNewExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-base text-slate-800">নতুন পরীক্ষা তৈরি করুন</h3>
              <button onClick={() => setIsNewExamModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleCreateExam} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">পরীক্ষার নাম:</label>
                <input
                  type="text"
                  placeholder="যেমন: ২য় সাময়িক পরীক্ষা ২০২৬"
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">শিক্ষাবর্ষ:</label>
                  <input
                    type="text"
                    value={newExamYear}
                    onChange={(e) => setNewExamYear(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">গ্রেডিং মানদণ্ড:</label>
                  <select
                    value={newExamGrading}
                    onChange={(e) => setNewExamGrading(e.target.value as GradingSystem)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 font-medium"
                  >
                    <option value="বেফাক">বেফাক কওমি মানদণ্ড</option>
                    <option value="বোর্ড_জিপিএ">বোর্ড জিপিএ (GPA 5.0)</option>
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsNewExamModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-semibold">বাতিল</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow">তৈরি করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= New Subject Modal ================= */}
      {isNewSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-base text-slate-800">নতুন কিতাব / বিষয় যোগ</h3>
              <button onClick={() => setIsNewSubjectModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleCreateSubject} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">কিতাব / বিষয়ের নাম:</label>
                <input
                  type="text"
                  placeholder="যেমন: শরহে বেকায়া"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">বিভাগ:</label>
                  <select
                    value={newSubjectDept}
                    onChange={(e) => setNewSubjectDept(e.target.value as Department)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 font-medium"
                  >
                    <option value="কিতাব">কিতাব বিভাগ</option>
                    <option value="হিফজ">হিফজ বিভাগ</option>
                    <option value="নাজেরা">নাজেরা বিভাগ</option>
                    <option value="নূরানী">নূরানী বিভাগ</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">জামাত / শ্রেণি:</label>
                  <input
                    type="text"
                    value={newSubjectClass}
                    onChange={(e) => setNewSubjectClass(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">পূর্ণমান (Full Marks):</label>
                <input
                  type="number"
                  value={newSubjectFullMarks}
                  onChange={(e) => setNewSubjectFullMarks(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold"
                />
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsNewSubjectModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-semibold">বাতিল</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow">যুক্ত করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= Admit Card 4-in-1 Modal ================= */}
      {isAdmitCardModalOpen && (
        <AdmitCardModal
          students={students}
          exam={activeExam || null}
          settings={settings}
          onClose={() => setIsAdmitCardModalOpen(false)}
        />
      )}
    </div>
  );
}
