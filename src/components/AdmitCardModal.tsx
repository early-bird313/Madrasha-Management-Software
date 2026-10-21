'use client';

import React from 'react';
import { Printer, X, GraduationCap, Building2, QrCode } from 'lucide-react';
import { Student, Exam, AppSettings } from '@/lib/types';

interface AdmitCardModalProps {
  students: Student[];
  exam: Exam | null;
  settings: AppSettings | null;
  onClose: () => void;
}

export default function AdmitCardModal({
  students,
  exam,
  settings,
  onClose,
}: AdmitCardModalProps) {
  const madrasahName = settings?.madrasah_name || 'দারুল উলুম ইসলামিয়া মাদ্রাসা ও এতিমখানা';
  const madrasahAddress = settings?.address || 'মডেল টাউন, ঢাকা-১২৩০';
  const examTitle = exam?.title || '১ম সাময়িক পরীক্ষা ২০২৬';
  const academicYear = exam?.academic_year || '২০২৬';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full p-6 shadow-2xl relative my-8">
        {/* Controls (Hidden in Print) */}
        <div className="no-print flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
          <div>
            <span className="font-bold text-base text-slate-800 flex items-center">
              <GraduationCap className="w-5 h-5 mr-2 text-emerald-600" />
              প্রবেশপত্র (Admit Card) প্রিন্ট প্রিভিউ - ৪-ইন-১ পেপার সেভিং
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              একটি A4 পাতায় ৪ জন ছাত্রের প্রবেশপত্র প্রিন্ট হবে (কাগজ সাশ্রয়ী)
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              প্রিন্ট করুন (Print A4)
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= Printable 4-in-1 Admit Card Grid ================= */}
        <div className="printable-area">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="border-2 border-slate-800 rounded-xl p-3.5 bg-white text-slate-900 flex flex-col justify-between text-xs space-y-2 relative overflow-hidden"
                style={{ breakInside: 'avoid' }}
              >
                {/* Header */}
                <div className="text-center border-b border-slate-400 pb-2">
                  <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
                    বিসমিল্লাহির রাহমানির রাহীম
                  </p>
                  <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                    {madrasahName}
                  </h4>
                  <p className="text-[10px] text-slate-600">{madrasahAddress}</p>
                  <div className="inline-block mt-1 px-3 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold">
                    প্রবেশপত্র (ADMIT CARD) - {examTitle}
                  </div>
                </div>

                {/* Body Details */}
                <div className="flex items-center justify-between gap-3 py-1">
                  <div className="space-y-1 flex-1 text-[11px]">
                    <div className="flex">
                      <span className="w-20 text-slate-500 font-medium">ছাত্রের নাম:</span>
                      <span className="font-bold text-slate-900">{student.name}</span>
                    </div>
                    <div className="flex">
                      <span className="w-20 text-slate-500 font-medium">বিভাগ / জামাত:</span>
                      <span className="font-semibold text-slate-800">
                        {student.department} {student.sub_class ? `(${student.sub_class})` : ''}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-20 text-slate-500 font-medium">অভিভাবক:</span>
                      <span className="text-slate-700">{student.guardian_name}</span>
                    </div>
                    <div className="flex">
                      <span className="w-20 text-slate-500 font-medium">শিক্ষাবর্ষ:</span>
                      <span className="font-mono">{academicYear}</span>
                    </div>
                  </div>

                  {/* Roll Badge & Verification QR */}
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <div className="w-14 h-14 rounded-xl border-2 border-slate-900 bg-slate-50 flex flex-col items-center justify-center shadow-inner">
                      <span className="text-[9px] text-slate-500 font-bold uppercase">রোল</span>
                      <span className="text-xl font-extrabold text-slate-900 leading-none">
                        {student.roll}
                      </span>
                    </div>
                    <div className="w-10 h-10 border border-slate-300 rounded flex items-center justify-center bg-slate-50">
                      <QrCode className="w-8 h-8 text-slate-700" />
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="text-[9px] text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-200">
                  <p>• পরীক্ষার হলে অবশ্যই এই প্রবেশপত্র সাথে আনতে হবে।</p>
                  <p>• পরীক্ষা শুরুর ১৫ মিনিট পূর্বে নির্ধারিত আসনে উপস্থিত হতে হবে।</p>
                </div>

                {/* Signatures */}
                <div className="pt-4 flex items-end justify-between text-[9px] text-slate-600">
                  <div className="text-center">
                    <div className="w-20 border-t border-slate-500 mb-0.5" />
                    <span>নাজেমে তা'লীমাত</span>
                  </div>
                  <div className="text-center">
                    <div className="w-20 border-t border-slate-500 mb-0.5" />
                    <span>মুহতামিমের স্বাক্ষর</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
