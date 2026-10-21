'use client';

import React, { useEffect, useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Calendar, 
  Building2, 
  UserCircle 
} from 'lucide-react';
import { subscribeSyncStatus, triggerSync, type SyncStatus } from '@/lib/sync-engine';
import { db } from '@/lib/db';
import { AppSettings } from '@/lib/types';

export default function Header({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    pendingCount: 0,
    isSyncing: false,
    cloudConnected: false,
  });
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [todayDate, setTodayDate] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeSyncStatus((status) => {
      setSyncStatus(status);
    });

    db.settings.get('main_settings').then((data) => {
      if (data) setSettings(data);
    });

    // Format current date in Bengali
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setTodayDate(now.toLocaleDateString('bn-BD', options));

    return () => unsubscribe();
  }, []);

  const handleManualSync = async () => {
    const res = await triggerSync();
    if (!res.success && res.message) {
      alert(res.message);
    }
  };

  return (
    <header className="no-print bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-sm">
      {/* Left: Mobile Toggle & Madrasa Title */}
      <div className="flex items-center space-x-3">
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        )}
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-base md:text-lg leading-tight">
              {settings?.madrasah_name || 'দারুল উলুম মাদ্রাসা'}
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              {settings?.tagline || 'ম্যানেজমেন্ট সিস্টেম (অফলাইন-ফার্স্ট)'}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Date, Sync Badge, Manual Sync Button */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Date Display */}
        <div className="hidden lg:flex items-center text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
          <span>{todayDate}</span>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center">
          {syncStatus.isSyncing ? (
            <div className="flex items-center text-xs font-medium text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2.5 py-1 rounded-full animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin text-emerald-600" />
              <span>সিঙ্ক হচ্ছে...</span>
            </div>
          ) : !syncStatus.isOnline ? (
            <div className="flex items-center text-xs font-medium text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full shadow-sm">
              <WifiOff className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
              <span>অফলাইন ({syncStatus.pendingCount}টি লোকাল)</span>
            </div>
          ) : syncStatus.pendingCount > 0 ? (
            <div className="flex items-center text-xs font-medium text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-1 rounded-full">
              <Wifi className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              <span>{syncStatus.pendingCount}টি অপেক্ষমাণ</span>
            </div>
          ) : (
            <div className="flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              <span className="hidden sm:inline">অনলাইন ও </span>সুরক্ষিত
            </div>
          )}
        </div>

        {/* Manual Sync Button */}
        <button
          onClick={handleManualSync}
          disabled={syncStatus.isSyncing}
          title="এখনই সিঙ্ক যাচাই করুন"
          className="flex items-center text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
          <span className="ml-1 hidden md:inline">সিঙ্ক</span>
        </button>

        {/* Role Icon */}
        <div className="flex items-center space-x-1.5 pl-1 border-l border-slate-200 text-slate-700">
          <UserCircle className="w-7 h-7 text-emerald-800" />
          <span className="text-xs font-medium hidden sm:inline text-slate-600">মুহতামিম</span>
        </div>
      </div>
    </header>
  );
}
