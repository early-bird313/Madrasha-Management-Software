'use client';

import React, { useState, useEffect } from 'react';
import { 
  UtensilsCrossed, 
  Users, 
  Calendar, 
  Printer, 
  CheckCircle, 
  AlertCircle, 
  Home, 
  Coffee,
  CheckCircle2
} from 'lucide-react';
import { db } from '@/lib/db';
import { Student, MealStatus } from '@/lib/types';
import { checkPendingCount } from '@/lib/sync-engine';

export default function BoardingPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [todayStr, setTodayStr] = useState(new Date().toISOString().split('T')[0]);
  const [filterDepartment, setFilterDepartment] = useState<string>('সব');
  const [statusUpdated, setStatusUpdated] = useState(false);

  useEffect(() => {
    loadResidentialStudents();
  }, []);

  async function loadResidentialStudents() {
    const resStudents = await db.students
      .filter((s) => s.residential_status === 'আবাসিক' && s.is_active)
      .toArray();
    setStudents(resStudents);
  }

  const handleUpdateStatus = async (studentId: string, newStatus: MealStatus) => {
    await db.students.update(studentId, { meal_status: newStatus, synced: false });
    await checkPendingCount();
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, meal_status: newStatus } : s))
    );
    setStatusUpdated(true);
    setTimeout(() => setStatusUpdated(false), 2000);
  };

  const residentialTotal = students.length;
  const onLeaveStudents = students.filter((s) => s.meal_status === 'ছুটি');
  const sickStudents = students.filter((s) => s.meal_status === 'অসুস্থ');
  const activeMealsStudents = students.filter((s) => s.meal_status === 'সক্রিয়');

  const activeCount = activeMealsStudents.length;
  const leaveCount = onLeaveStudents.length;
  const sickCount = sickStudents.length;

  const filteredStudents = students.filter((s) => {
    if (filterDepartment === 'সব') return true;
    return s.department === filterDepartment;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-inner">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">বোর্ডিং ও মেস ডাইনিং কাউন্টার</h2>
            <p className="text-xs text-slate-500">হোস্টেল খানা ব্যবস্থাপনা ও বাবুর্চির জন্য দৈনিক সক্রিয় মিল হিসাব</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            বাবুর্চির স্লিপ প্রিন্ট
          </button>
        </div>
      </div>

      {/* BIG CHEF DISPLAY CARD (বাবুর্চির স্ক্রিন) */}
      <div className="bg-gradient-to-br from-amber-700 via-amber-600 to-orange-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center text-xs font-semibold px-3 py-1 bg-black/20 rounded-full text-amber-100 mb-2 border border-white/20">
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              আজকের তারিখ: {todayStr}
            </span>
            <p className="text-amber-100 text-sm font-medium">আজকের সক্রিয় খাবার মিল সংখ্যা:</p>
            <div className="flex items-baseline space-x-3 mt-1">
              <span className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight">
                {activeCount}
              </span>
              <span className="text-2xl font-bold text-amber-200">জন ছাত্র</span>
            </div>
            <p className="text-xs text-amber-100/90 mt-2 font-mono">
              [ মোট আবাসিক: {residentialTotal} − ছুটি: {leaveCount} − অসুস্থ: {sickCount} = {activeCount} ]
            </p>
          </div>

          {/* Quick Breakdown Badges */}
          <div className="bg-black/25 backdrop-blur-md rounded-2xl p-5 border border-white/20 space-y-2.5 min-w-[240px]">
            <div className="flex justify-between items-center text-xs font-medium">
              <span className="flex items-center text-emerald-200">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-2" />
                সক্রিয় খানা চালু:
              </span>
              <span className="font-bold text-sm text-white">{activeCount} জন</span>
            </div>
            <div className="flex justify-between items-center text-xs font-medium">
              <span className="flex items-center text-amber-200">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mr-2" />
                ছুটিতে বাড়িতে:
              </span>
              <span className="font-bold text-sm text-white">{leaveCount} জন</span>
            </div>
            <div className="flex justify-between items-center text-xs font-medium">
              <span className="flex items-center text-rose-200">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 mr-2" />
                অসুস্থ (মিল বন্ধ):
              </span>
              <span className="font-bold text-sm text-white">{sickCount} জন</span>
            </div>
          </div>
        </div>
      </div>

      {/* Residential Students List & Status Changer */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-800 flex items-center">
              <Users className="w-5 h-5 mr-2 text-amber-600" />
              আবাসিক ছাত্রদের দৈনিক মিল স্ট্যাটাস
            </h3>
            <p className="text-xs text-slate-500">
              ছাত্র বাড়ি গেলে বা অসুস্থ হলে এক ট্যাপে মিল স্ট্যাটাস পরিবর্তন করুন
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500">বিভাগ:</span>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium focus:outline-none"
            >
              <option value="সব">সকল আবাসিক বিভাগ</option>
              <option value="হিফজ">হিফজ শাখা</option>
              <option value="নাজেরা">নাজেরা শাখা</option>
              <option value="কিতাব">কিতাব জামাত</option>
            </select>
          </div>
        </div>

        {statusUpdated && (
          <div className="no-print bg-emerald-50 text-emerald-800 text-xs font-semibold px-4 py-2 rounded-xl border border-emerald-200 flex items-center animate-fade-in">
            <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
            মিল স্ট্যাটাস সাথে সাথে আপডেট হয়েছে!
          </div>
        )}

        {/* Student Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredStudents.map((st) => (
            <div
              key={st.id}
              className={`
                p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3
                ${st.meal_status === 'সক্রিয়' 
                  ? 'bg-white border-slate-200 shadow-sm' 
                  : st.meal_status === 'ছুটি'
                  ? 'bg-amber-50/60 border-amber-200'
                  : 'bg-rose-50/60 border-rose-200'}
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                      {st.roll}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">{st.name}</h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {st.sub_class || st.department} • মোবাইল: {st.phone}
                  </p>
                </div>

                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  st.meal_status === 'সক্রিয়'
                    ? 'bg-emerald-100 text-emerald-800'
                    : st.meal_status === 'ছুটি'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {st.meal_status}
                </span>
              </div>

              {/* 3 Status Switch Buttons */}
              <div className="no-print grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(st.id, 'সক্রিয়')}
                  className={`py-1.5 rounded-lg font-bold border transition-colors ${
                    st.meal_status === 'সক্রিয়'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50'
                  }`}
                >
                  খানা চালু
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus(st.id, 'ছুটি')}
                  className={`py-1.5 rounded-lg font-bold border transition-colors ${
                    st.meal_status === 'ছুটি'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-amber-50'
                  }`}
                >
                  ছুটি
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus(st.id, 'অসুস্থ')}
                  className={`py-1.5 rounded-lg font-bold border transition-colors ${
                    st.meal_status === 'অসুস্থ'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-rose-50'
                  }`}
                >
                  অসুস্থ
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Printable Slip for Chef (Shows only when printing) */}
      <div className="hidden print-only p-4 border border-dashed border-slate-400 font-mono text-sm">
        <h2 className="text-center font-bold text-lg">মেস বাবুর্চি ডেলিভারি স্লিপ</h2>
        <p className="text-center text-xs">তারিখ: {todayStr}</p>
        <div className="my-4 border-t border-b py-2 space-y-1">
          <p>মোট আবাসিক ছাত্র: {residentialTotal} জন</p>
          <p>ছুটিতে অনুপস্থিত: {leaveCount} জন</p>
          <p>অসুস্থ ছাত্র: {sickCount} জন</p>
          <p className="text-base font-bold">আজকের সক্রিয় খাবার মিল: {activeCount} জন</p>
        </div>
        <p className="text-xs text-right mt-6">হোস্টেল সুপার / নাজেমে দারুল ইক্বামা</p>
      </div>
    </div>
  );
}
