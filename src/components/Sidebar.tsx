'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  Receipt, 
  UtensilsCrossed, 
  Users, 
  Settings, 
  ShieldCheck, 
  GraduationCap,
  Sparkles,
  DoorOpen
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  {
    name: 'ড্যাশবোর্ড',
    href: '/',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: 'হিফজ ও নাজেরা ট্র্যাকার',
    href: '/hifz',
    icon: BookOpen,
    badge: 'কোর',
  },
  {
    name: 'কিতাব ও পরীক্ষা ইঞ্জিন',
    href: '/exams',
    icon: GraduationCap,
    badge: 'নতুন',
  },
  {
    name: 'মুহাসাবা ও তারবিয়াত',
    href: '/tarbiyat',
    icon: Sparkles,
    badge: 'আমল',
  },
  {
    name: 'শরীয়াহ ক্যাশবুক ও ফি',
    href: '/accounts',
    icon: Receipt,
    badge: null,
  },
  {
    name: 'বোর্ডিং ও মেস ডাইনিং',
    href: '/boarding',
    icon: UtensilsCrossed,
    badge: null,
  },
  {
    name: 'গেটপাস ও মুলাকাত',
    href: '/gatepass',
    icon: DoorOpen,
    badge: null,
  },
  {
    name: 'শিক্ষার্থী তালিকা ও ভর্তি',
    href: '/students',
    icon: Users,
    badge: null,
  },
  {
    name: 'সেটিংস ও ব্যাকআপ',
    href: '/settings',
    icon: Settings,
    badge: null,
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="no-print fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        no-print fixed md:static inset-y-0 left-0 z-50
        w-64 bg-slate-900 text-slate-100 flex flex-col justify-between
        transform transition-transform duration-200 ease-in-out shadow-xl md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Top Header & Navigation */}
        <div className="flex-1 py-4 flex flex-col overflow-y-auto">
          <div className="px-5 pb-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🕌</span>
              <span className="font-bold text-white tracking-wide">মাদ্রাসা অটোমেশন</span>
            </div>
            <button 
              onClick={onClose}
              className="md:hidden text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>

          <nav className="mt-3 px-3 space-y-1 flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onClose()}
                  className={`
                    flex items-center justify-between px-3 py-2 rounded-xl font-medium text-xs transition-all
                    ${isActive 
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isActive ? 'bg-white/20 text-white' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Shariah Safety Tag & Bottom Note */}
        <div className="p-3 border-t border-slate-800 text-xs">
          <div className="bg-emerald-950/60 border border-emerald-800/60 rounded-xl p-2.5 text-emerald-200 flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[11px] text-emerald-300">শরীয়াহ ফান্ড লক সক্রিয়</p>
              <p className="text-[10px] text-emerald-300/80 leading-tight mt-0.5">
                যাকাত ও লিল্লাহ ফান্ড সাধারণ খরচ থেকে সম্পূর্ণ আলাদা।
              </p>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 text-center mt-2">
            অফলাইন-ফার্স্ট • পিডব্লিউএ ইঞ্জিন
          </p>
        </div>
      </aside>
    </>
  );
}
