'use client';

import React, { useEffect, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { seedInitialData } from '@/lib/db';
import { initSyncEngine } from '@/lib/sync-engine';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function setup() {
      try {
        await seedInitialData();
        initSyncEngine();
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsReady(true);
      }
    }
    setup();
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mb-4" />
        <p className="font-medium text-lg">মাদ্রাসা ম্যানেজমেন্ট লোড হচ্ছে...</p>
        <p className="text-xs text-slate-400 mt-1">অফলাইন ডেটাবেজ প্রস্তুত করা হচ্ছে</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
