'use client';

import React from 'react';
import { Printer, X, ShieldCheck, Building2, Calendar } from 'lucide-react';
import { CashTransaction, AppSettings } from '@/lib/types';

interface ShuraAuditModalProps {
  transactions: CashTransaction[];
  settings: AppSettings | null;
  onClose: () => void;
}

export default function ShuraAuditModal({
  transactions,
  settings,
  onClose,
}: ShuraAuditModalProps) {
  const madrasahName = settings?.madrasah_name || 'দারুল উলুম ইসলামিয়া মাদ্রাসা ও এতিমখানা';
  const madrasahAddress = settings?.address || 'মডেল টাউন, ঢাকা-১২৩০';
  const madrasahPhone = settings?.phone || '01711-000000';
  const muhtamimName = settings?.muhtamim_name || 'মাওলানা শফিকুল ইসলাম সাহেব';

  // Calculations
  let totalIncome = 0;
  let totalExpense = 0;

  let zakatIncome = 0;
  let zakatExpense = 0;

  let generalIncome = 0;
  let generalExpense = 0;

  let devIncome = 0;
  let devExpense = 0;

  transactions.forEach((tx) => {
    if (tx.type === 'আয়') {
      totalIncome += tx.amount;
      if (tx.fund_type === 'লিল্লাহ ও যাকাত ফান্ড') zakatIncome += tx.amount;
      else if (tx.fund_type === 'সাধারণ ও বেতন ফান্ড') generalIncome += tx.amount;
      else if (tx.fund_type === 'উন্নয়ন ও নির্মাণ ফান্ড') devIncome += tx.amount;
    } else {
      totalExpense += tx.amount;
      if (tx.fund_type === 'লিল্লাহ ও যাকাত ফান্ড') zakatExpense += tx.amount;
      else if (tx.fund_type === 'সাধারণ ও বেতন ফান্ড') generalExpense += tx.amount;
      else if (tx.fund_type === 'উন্নয়ন ও নির্মাণ ফান্ড') devExpense += tx.amount;
    }
  });

  const netSurplus = totalIncome - totalExpense;
  const zakatNet = zakatIncome - zakatExpense;
  const generalNet = generalIncome - generalExpense;
  const devNet = devIncome - devExpense;

  const todayStr = new Date().toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative my-8">
        {/* Controls (Hidden in Print) */}
        <div className="no-print flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-base text-slate-800 flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-emerald-600" />
              মজলিসে শুরা অডিট সামারি (১-পেজ প্রিভিউ)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              প্রিন্ট করুন (Print Report)
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= 1-Page Printable Shura Audit Document ================= */}
        <div className="printable-area p-4 sm:p-6 border border-slate-300 rounded-xl bg-white text-slate-900 space-y-5 font-sans">
          {/* Header */}
          <div className="text-center pb-4 border-b-2 border-slate-800 space-y-1">
            <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">
              বিসমিল্লাহির রাহমানির রাহীম
            </p>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {madrasahName}
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              {madrasahAddress} • ফোন: {madrasahPhone}
            </p>
            <div className="inline-block mt-2 px-4 py-1 rounded-full bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800">
              মজলিসে শুরার সাধারণ অধিবেশন: সংক্ষিপ্ত আর্থিক অডিট বিবরণী
            </div>
            <p className="text-[11px] text-slate-500 mt-1">পেশ করার তারিখ: {todayStr}</p>
          </div>

          {/* Grand Overview 3 Cards */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl border border-slate-200 bg-emerald-50">
              <span className="text-[11px] font-bold text-emerald-900 uppercase">মোট আদায় / আয়</span>
              <p className="text-lg font-extrabold text-emerald-800 mt-0.5">
                ৳ {totalIncome.toLocaleString('bn-BD')}
              </p>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 bg-rose-50">
              <span className="text-[11px] font-bold text-rose-900 uppercase">মোট খরচ / ব্যয়</span>
              <p className="text-lg font-extrabold text-rose-800 mt-0.5">
                ৳ {totalExpense.toLocaleString('bn-BD')}
              </p>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 bg-blue-50">
              <span className="text-[11px] font-bold text-blue-900 uppercase">মোট নগদ তহবিল জের</span>
              <p className="text-lg font-extrabold text-blue-800 mt-0.5">
                ৳ {netSurplus.toLocaleString('bn-BD')}
              </p>
            </div>
          </div>

          {/* Fund Segregation Shariah Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              শরীয়াহসম্মত ফান্ডভিত্তিক খতিয়ান ও উদ্বৃত্ত (Fund Segregation)
            </h4>

            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300">ফান্ড ক্যাটাগরি</th>
                  <th className="p-2 border-r border-slate-300 text-right">মোট প্রাপ্তি (আয়)</th>
                  <th className="p-2 border-r border-slate-300 text-right">মোট ব্যয় (খরচ)</th>
                  <th className="p-2 text-right">বর্তমান সমাপনী জের</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                <tr className="bg-emerald-50/40">
                  <td className="p-2 border-r border-slate-300 font-bold">
                    ১. লিল্লাহ ও যাকাত ফান্ড <span className="text-[10px] text-emerald-700 font-normal">(গরীব ছাত্রের হক)</span>
                  </td>
                  <td className="p-2 border-r border-slate-300 text-right font-medium">৳ {zakatIncome.toLocaleString('bn-BD')}</td>
                  <td className="p-2 border-r border-slate-300 text-right font-medium">৳ {zakatExpense.toLocaleString('bn-BD')}</td>
                  <td className="p-2 text-right font-bold text-emerald-800">৳ {zakatNet.toLocaleString('bn-BD')}</td>
                </tr>

                <tr>
                  <td className="p-2 border-r border-slate-300 font-bold">
                    ২. সাধারণ ও বেতন ফান্ড <span className="text-[10px] text-slate-500 font-normal">(মাসিক ফি ও বেতন)</span>
                  </td>
                  <td className="p-2 border-r border-slate-300 text-right font-medium">৳ {generalIncome.toLocaleString('bn-BD')}</td>
                  <td className="p-2 border-r border-slate-300 text-right font-medium">৳ {generalExpense.toLocaleString('bn-BD')}</td>
                  <td className="p-2 text-right font-bold text-slate-800">৳ {generalNet.toLocaleString('bn-BD')}</td>
                </tr>

                <tr className="bg-amber-50/40">
                  <td className="p-2 border-r border-slate-300 font-bold">
                    ৩. উন্নয়ন ও ওয়াকফ ফান্ড <span className="text-[10px] text-amber-700 font-normal">(ভবন নির্মাণ ও সংস্কার)</span>
                  </td>
                  <td className="p-2 border-r border-slate-300 text-right font-medium">৳ {devIncome.toLocaleString('bn-BD')}</td>
                  <td className="p-2 border-r border-slate-300 text-right font-medium">৳ {devExpense.toLocaleString('bn-BD')}</td>
                  <td className="p-2 text-right font-bold text-amber-900">৳ {devNet.toLocaleString('bn-BD')}</td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-100 font-extrabold border-t border-slate-300">
                <tr>
                  <td className="p-2 border-r border-slate-300">সর্বমোট তহবিল</td>
                  <td className="p-2 border-r border-slate-300 text-right text-emerald-800">৳ {totalIncome.toLocaleString('bn-BD')}</td>
                  <td className="p-2 border-r border-slate-300 text-right text-rose-800">৳ {totalExpense.toLocaleString('bn-BD')}</td>
                  <td className="p-2 text-right text-blue-900">৳ {netSurplus.toLocaleString('bn-BD')}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Shariah Certificate & Declaration */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
            <p className="font-bold text-slate-800 mb-0.5">শরীয়াহ নিরীক্ষা ও সনদপত্র:</p>
            <p>
              প্রত্যয়ন করা যাচ্ছে যে, উপরিউক্ত হিসাবকালে লিল্লাহ ও যাকাত ফান্ডের অর্থ সম্পূর্ণরূপে মাসারিফে যাকাতভুক্ত এতিম ও দুস্থ ছাত্রদের খাবার, বস্ত্র ও চিকিৎসার জন্য ব্যয় করা হয়েছে। এই ফান্ডের কোনো অংশ সাধারণ পরিচালন ব্যয় বা বেতন খাতে অপব্যবহার করা হয়নি।
            </p>
          </div>

          {/* Signatures Section for Shura Meeting */}
          <div className="pt-8 grid grid-cols-4 gap-4 text-center text-[10px] text-slate-600">
            <div>
              <div className="border-t border-slate-400 w-28 mx-auto mb-1" />
              <p className="font-semibold text-slate-800">হিসাবরক্ষক</p>
              <p className="text-[9px] text-slate-400">নাজেমে মালিয়াত</p>
            </div>
            <div>
              <div className="border-t border-slate-400 w-28 mx-auto mb-1" />
              <p className="font-semibold text-slate-800">মুহতামিম</p>
              <p className="text-[9px] text-slate-400">{muhtamimName}</p>
            </div>
            <div>
              <div className="border-t border-slate-400 w-28 mx-auto mb-1" />
              <p className="font-semibold text-slate-800">অভ্যন্তরীণ অডিটর</p>
              <p className="text-[9px] text-slate-400">হিসাব নিরীক্ষক</p>
            </div>
            <div>
              <div className="border-t border-slate-400 w-28 mx-auto mb-1" />
              <p className="font-semibold text-slate-800">শুরা সভাপতি</p>
              <p className="text-[9px] text-slate-400">মজলিসে শুরা</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
