'use client';

import React, { useState } from 'react';
import { Printer, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { CashTransaction, AppSettings } from '@/lib/types';

interface MoneyReceiptModalProps {
  transaction: CashTransaction;
  settings: AppSettings | null;
  onClose: () => void;
}

export default function MoneyReceiptModal({
  transaction,
  settings,
  onClose,
}: MoneyReceiptModalProps) {
  const [printFormat, setPrintFormat] = useState<'dual' | 'thermal'>('dual');

  const handlePrint = () => {
    window.print();
  };

  const madrasahName = settings?.madrasah_name || 'দারুল উলুম ইসলামিয়া মাদ্রাসা ও এতিমখানা';
  const madrasahAddress = settings?.address || 'মডেল টাউন, ঢাকা-১২৩০';
  const madrasahPhone = settings?.phone || '01711-000000';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      {/* Modal Card */}
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative my-8">
        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-base text-slate-800 flex items-center">
              <Printer className="w-5 h-5 mr-2 text-emerald-600" />
              ক্যাশ মেমো / মানি রিসিট প্রিভিউ
            </span>
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPrintFormat('dual')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  printFormat === 'dual'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                দ্বৈত কপি (A4/A5)
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat('thermal')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  printFormat === 'thermal'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ৮০মিমি থার্মাল স্লিপ
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              প্রিন্ট করুন (Print)
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= Printable Voucher Area ================= */}
        <div className="printable-area">
          {printFormat === 'dual' ? (
            /* Dual Copy Format (Student Copy & Office Copy) */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
              {/* Left / Top: Student Copy */}
              <SingleSlip
                copyType="গ্রাহক / ছাত্রের কপি"
                transaction={transaction}
                madrasahName={madrasahName}
                address={madrasahAddress}
                phone={madrasahPhone}
              />

              {/* Right / Bottom: Office Copy */}
              <SingleSlip
                copyType="মাদ্রাসা অফিস কপি"
                transaction={transaction}
                madrasahName={madrasahName}
                address={madrasahAddress}
                phone={madrasahPhone}
              />
            </div>
          ) : (
            /* Thermal 80mm Receipt Format */
            <div className="max-w-[320px] mx-auto p-4 border border-dashed border-slate-300 font-mono text-xs bg-slate-50 text-slate-900">
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <p className="font-bold text-sm">{madrasahName}</p>
                <p className="text-[10px] text-slate-600">{madrasahAddress}</p>
                <p className="text-[10px] text-slate-600">ফোন: {madrasahPhone}</p>
                <p className="font-bold mt-1 uppercase text-emerald-800">মানি রিসিট (নগদ আদায়)</p>
              </div>

              <div className="py-2 space-y-1 text-[11px] border-b border-dashed border-slate-300">
                <div className="flex justify-between">
                  <span>ভাউচার: {transaction.voucher_no}</span>
                  <span>{transaction.date}</span>
                </div>
                {transaction.student_name && (
                  <div>
                    <span className="font-bold">ছাত্র: {transaction.student_name}</span>
                  </div>
                )}
                <div>খাত: {transaction.category}</div>
                <div>ফান্ড: {transaction.fund_type}</div>
                <div>মাধ্যম: {transaction.payment_method}</div>
                {transaction.trx_id && <div>TrxID: {transaction.trx_id}</div>}
              </div>

              <div className="py-2 text-right font-bold text-sm border-b border-dashed border-slate-300">
                মোট গ্রহণ: ৳ {transaction.amount.toLocaleString('bn-BD')}
              </div>

              <div className="text-center pt-3 text-[10px] text-slate-500">
                <p>জাযাকাল্লাহু খাইরান</p>
                <p>কুরআনের খেদমতে আপনার সহযোগিতা কবুল হোক।</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SingleSlip({
  copyType,
  transaction,
  madrasahName,
  address,
  phone,
}: {
  copyType: string;
  transaction: CashTransaction;
  madrasahName: string;
  address: string;
  phone: string;
}) {
  return (
    <div className="border border-slate-300 rounded-xl p-4 bg-white shadow-sm flex flex-col justify-between text-xs space-y-3">
      {/* Header */}
      <div className="text-center border-b border-slate-200 pb-2.5">
        <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full inline-block mb-1">
          {copyType}
        </span>
        <h4 className="font-bold text-sm text-slate-900 leading-tight">{madrasahName}</h4>
        <p className="text-[10px] text-slate-500">{address} • ফোন: {phone}</p>
      </div>

      {/* Meta Row */}
      <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg text-[11px]">
        <div>
          <span className="text-slate-500">রসিদ নং: </span>
          <span className="font-bold text-emerald-800">{transaction.voucher_no}</span>
        </div>
        <div>
          <span className="text-slate-500">তারিখ: </span>
          <span className="font-bold text-slate-700">{transaction.date}</span>
        </div>
      </div>

      {/* Details Table */}
      <div className="space-y-1.5 py-1">
        {transaction.student_name && (
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">শিক্ষার্থীর নাম:</span>
            <span className="font-bold text-slate-800">{transaction.student_name}</span>
          </div>
        )}
        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500">আদায়ের খাত:</span>
          <span className="font-medium text-slate-800">{transaction.category}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500">ফান্ড ক্যাটাগরি:</span>
          <span className="font-semibold text-emerald-800">{transaction.fund_type}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500">পেমেন্ট মাধ্যম:</span>
          <span className="text-slate-800">
            {transaction.payment_method} {transaction.trx_id ? `(TrxID: ${transaction.trx_id})` : ''}
          </span>
        </div>
        {transaction.note && (
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">বিবরণ / মাস:</span>
            <span className="text-slate-600 italic">{transaction.note}</span>
          </div>
        )}
      </div>

      {/* Total Amount Box */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center justify-between">
        <span className="font-bold text-xs text-emerald-950">মোট আদায়কৃত অর্থ:</span>
        <span className="font-extrabold text-base text-emerald-800">
          ৳ {transaction.amount.toLocaleString('bn-BD')}
        </span>
      </div>

      {/* Signature Section */}
      <div className="pt-6 flex items-end justify-between text-[10px] text-slate-500">
        <div className="text-center">
          <div className="w-24 border-t border-slate-300 mb-1" />
          <span>আদায়কারীর স্বাক্ষর</span>
        </div>
        <div className="text-center">
          <div className="w-24 border-t border-slate-300 mb-1" />
          <span>মুহতামিম / হিসাবরক্ষক</span>
        </div>
      </div>
    </div>
  );
}
