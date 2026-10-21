'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  BookOpen, 
  UtensilsCrossed, 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  PlusCircle, 
  Award 
} from 'lucide-react';
import { db } from '@/lib/db';
import { Student, HifzLog, CashTransaction } from '@/lib/types';

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [recentHifz, setRecentHifz] = useState<HifzLog[]>([]);
  const [recentCash, setRecentCash] = useState<CashTransaction[]>([]);
  const [fundBalances, setFundBalances] = useState({
    zakatLillah: 0,
    general: 0,
    development: 0,
    total: 0,
  });

  useEffect(() => {
    async function loadData() {
      const allStudents = await db.students.toArray();
      setStudents(allStudents);

      const logs = await db.hifz_logs.orderBy('created_at').reverse().limit(5).toArray();
      setRecentHifz(logs);

      const cash = await db.cash_ledger.orderBy('created_at').reverse().limit(5).toArray();
      setRecentCash(cash);

      // Calculate fund balances
      const allTx = await db.cash_ledger.toArray();
      let zl = 0;
      let gen = 0;
      let dev = 0;

      allTx.forEach((tx) => {
        const amt = tx.type === 'আয়' ? tx.amount : -tx.amount;
        if (tx.fund_type === 'লিল্লাহ ও যাকাত ফান্ড') {
          zl += amt;
        } else if (tx.fund_type === 'সাধারণ ও বেতন ফান্ড') {
          gen += amt;
        } else if (tx.fund_type === 'উন্নয়ন ও নির্মাণ ফান্ড') {
          dev += amt;
        }
      });

      setFundBalances({
        zakatLillah: zl,
        general: gen,
        development: dev,
        total: zl + gen + dev,
      });
    }

    loadData();
  }, []);

  // Boarding stats
  const residentialStudents = students.filter((s) => s.residential_status === 'আবাসিক');
  const activeMealsCount = residentialStudents.filter((s) => s.meal_status === 'সক্রিয়').length;
  const onLeaveCount = residentialStudents.filter((s) => s.meal_status === 'ছুটি').length;
  const sickCount = residentialStudents.filter((s) => s.meal_status === 'অসুস্থ').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 bg-emerald-900/60 rounded-full text-emerald-200 border border-emerald-500/30 mb-2">
              🕌 বিসমিল্লাহির রাহমানির রাহীম
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              মাদ্রাসা ড্যাশবোর্ড ও তা’লীমী ওভারভিউ
            </h2>
            <p className="text-emerald-100 text-sm mt-1 max-w-xl">
              হিফজুল কুরআন ট্র্যাকিং, শরীয়াহসম্মত ফান্ড হিসাব এবং অফলাইন ক্যাশবুক ব্যবস্থাপনা।
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/hifz"
              className="inline-flex items-center px-4 py-2.5 bg-white text-emerald-800 font-semibold rounded-xl text-sm shadow hover:bg-emerald-50 transition-colors"
            >
              <BookOpen className="w-4 h-4 mr-2 text-emerald-600" />
              হিফজ সবক এন্ট্রি
            </Link>
            <Link
              href="/accounts"
              className="inline-flex items-center px-4 py-2.5 bg-emerald-900/80 hover:bg-emerald-900 text-white font-semibold rounded-xl text-sm border border-emerald-600/50 transition-colors"
            >
              <Receipt className="w-4 h-4 mr-2" />
              ফি ও রসিদ
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Students */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">মোট শিক্ষার্থী</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-800 mt-3">{students.length} জন</p>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
            <span className="text-blue-700 font-medium">হিফজ: {students.filter(s => s.department === 'হিফজ').length}</span>
            <span>•</span>
            <span>নাজেরা: {students.filter(s => s.department === 'নাজেরা').length}</span>
            <span>•</span>
            <span>নূরানী: {students.filter(s => s.department === 'নূরানী').length}</span>
          </div>
        </div>

        {/* Card 2: Hifz Progress */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">আজকের সবক রেকর্ড</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-700 mt-3">{recentHifz.length} টি</p>
          <p className="mt-2 text-xs text-emerald-800 font-medium flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
            হালকার নিয়মিত পাঠ চলমান
          </p>
        </div>

        {/* Card 3: Boarding Active Meals */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">আজকের খাবার মিল</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-700 mt-3">{activeMealsCount} জন</p>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span>আবাসিক {residentialStudents.length}</span>
            <span>(ছুটি: {onLeaveCount}, অসুস্থ: {sickCount})</span>
          </div>
        </div>

        {/* Card 4: Total Cash Balance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">মোট ক্যাশ তহবিল</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-800 mt-3">৳ {fundBalances.total.toLocaleString('bn-BD')}</p>
          <div className="mt-2 text-xs text-purple-700 font-medium flex items-center">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            ৩টি আলাদা ফান্ড সুরক্ষিত
          </div>
        </div>
      </div>

      {/* Shariah Fund Balances Overview */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mr-2" />
              শরীয়াহ ফান্ড বিবরণী (ফান্ড সেগ্রিগেশন)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              যাকাত ও লিল্লাহ ফান্ড সাধারণ এবং বেতন ফান্ড থেকে স্বয়ংক্রিয়ভাবে আলাদা রাখা হয়েছে
            </p>
          </div>
          <Link
            href="/accounts"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center"
          >
            পূর্ণাঙ্গ ক্যাশবুক <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {/* Fund 1: Zakat & Lillah */}
          <div className="rounded-xl p-4 bg-emerald-50/70 border border-emerald-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 uppercase">লিল্লাহ ও যাকাত ফান্ড</span>
              <span className="text-[10px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-bold">লকড ফান্ড</span>
            </div>
            <p className="text-2xl font-bold text-emerald-800 mt-2">৳ {fundBalances.zakatLillah.toLocaleString('bn-BD')}</p>
            <p className="text-[11px] text-emerald-700 mt-1">
              • শুধুমাত্র এতিম/গরীব ছাত্রের খাবার, বস্ত্র ও কিতাব বাবদ খরচযোগ্য।
            </p>
          </div>

          {/* Fund 2: General & Salary */}
          <div className="rounded-xl p-4 bg-blue-50/70 border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 uppercase">সাধারণ ও বেতন ফান্ড</span>
              <span className="text-[10px] bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full font-bold">মাসিক ফি</span>
            </div>
            <p className="text-2xl font-bold text-blue-800 mt-2">৳ {fundBalances.general.toLocaleString('bn-BD')}</p>
            <p className="text-[11px] text-blue-700 mt-1">
              • উস্তাদদের বেতন, অফিস খরচ, বিদ্যুৎ বিল ইত্যাদি পরিচালন ব্যয়।
            </p>
          </div>

          {/* Fund 3: Development */}
          <div className="rounded-xl p-4 bg-amber-50/70 border border-amber-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase">উন্নয়ন ও নির্মাণ ফান্ড</span>
              <span className="text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-bold">এককালীন দান</span>
            </div>
            <p className="text-2xl font-bold text-amber-800 mt-2">৳ {fundBalances.development.toLocaleString('bn-BD')}</p>
            <p className="text-[11px] text-amber-700 mt-1">
              • মাদ্রাসার স্থায়ী অবকাঠামো, ভবন নির্মাণ ও সংস্কার কাজ।
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Hifz Activity & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Hifz Logs */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-base flex items-center">
              <BookOpen className="w-5 h-5 text-emerald-600 mr-2" />
              সর্বশেষ হিফজ ও নাজেরা পাঠ
            </h3>
            <Link href="/hifz" className="text-xs font-medium text-emerald-700 hover:underline">
              সব দেখুন
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {recentHifz.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">এখনও কোনো পাঠ রেকর্ড হয়নি।</p>
            ) : (
              recentHifz.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                      {log.sabaq_para}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{log.student_name}</p>
                      <p className="text-xs text-slate-500">
                        পারা {log.sabaq_para} • {log.sabaq_surah} ({log.sabaq_ayah_range})
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-bold ${
                      log.sabaq_grade === 'মুমতাজ'
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.sabaq_grade === 'জাইয়িদ জিদ্দান'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {log.sabaq_grade}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">{log.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Recent Cashbook Transactions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-base flex items-center">
              <Receipt className="w-5 h-5 text-emerald-600 mr-2" />
              সাম্প্রতিক ক্যাশ লেনদেন
            </h3>
            <Link href="/accounts" className="text-xs font-medium text-emerald-700 hover:underline">
              ক্যাশবুক
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {recentCash.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">কোনো লেনদেন পাওয়া যায়নি।</p>
            ) : (
              recentCash.map((tx) => (
                <div 
                  key={tx.id} 
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                      tx.type === 'আয়' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {tx.type === 'আয়' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">
                        {tx.category} {tx.student_name ? `(${tx.student_name})` : ''}
                      </p>
                      <p className="text-xs text-slate-500">
                        {tx.voucher_no} • {tx.fund_type} • {tx.payment_method}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${
                      tx.type === 'আয়' ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {tx.type === 'আয়' ? '+' : '-'} ৳ {tx.amount.toLocaleString('bn-BD')}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">{tx.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
