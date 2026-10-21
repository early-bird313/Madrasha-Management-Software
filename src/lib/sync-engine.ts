import { db } from './db';
import { createClient } from '@supabase/supabase-js';

export interface SyncStatus {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncedAt?: Date;
  cloudConnected: boolean;
}

type SyncCallback = (status: SyncStatus) => void;
const subscribers: Set<SyncCallback> = new Set();

let currentStatus: SyncStatus = {
  isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
  pendingCount: 0,
  isSyncing: false,
  cloudConnected: false,
};

export function subscribeSyncStatus(callback: SyncCallback) {
  subscribers.add(callback);
  callback(currentStatus);
  return () => {
    subscribers.delete(callback);
  };
}

function notifySubscribers() {
  subscribers.forEach((cb) => cb({ ...currentStatus }));
}

export async function checkPendingCount(): Promise<number> {
  try {
    const unsyncedHifz = await db.hifz_logs.filter((item) => item.synced === false).count();
    const unsyncedCash = await db.cash_ledger.filter((item) => item.synced === false).count();
    const unsyncedStudents = await db.students.filter((item) => item.synced === false).count();
    const unsyncedAtt = await db.attendance.filter((item) => item.synced === false).count();
    const total = unsyncedHifz + unsyncedCash + unsyncedStudents + unsyncedAtt;
    currentStatus.pendingCount = total;
    notifySubscribers();
    return total;
  } catch {
    return 0;
  }
}

export async function triggerSync(): Promise<{ success: boolean; message: string }> {
  if (typeof window === 'undefined') return { success: false, message: 'Server context' };

  currentStatus.isOnline = navigator.onLine;
  if (!currentStatus.isOnline) {
    notifySubscribers();
    return { success: false, message: 'ইন্টারনেট সংযোগ বিচ্ছিন্ন। ডাটা লোকাল মেমরিতে সংরক্ষিত আছে।' };
  }

  currentStatus.isSyncing = true;
  notifySubscribers();

  try {
    const settings = await db.settings.get('main_settings');
    if (!settings?.supabase_url || !settings?.supabase_anon_key) {
      // Offline-first mode: No Supabase configured yet
      currentStatus.isSyncing = false;
      currentStatus.cloudConnected = false;
      currentStatus.lastSyncedAt = new Date();
      await checkPendingCount();
      notifySubscribers();
      return { 
        success: true, 
        message: 'লোকাল ডেটাবেজ প্রস্তুত আছে (ক্লাউড কানেকশন এখনও কনফিগার করা হয়নি)।' 
      };
    }

    const supabase = createClient(settings.supabase_url, settings.supabase_anon_key);
    currentStatus.cloudConnected = true;

    // Sync Hifz Logs
    const unsyncedHifz = await db.hifz_logs.filter((i) => i.synced === false).toArray();
    for (const log of unsyncedHifz) {
      const { error } = await supabase.from('hifz_logs').upsert({
        id: log.id,
        student_id: log.student_id,
        date: log.date,
        sabaq_para: log.sabaq_para,
        sabaq_surah: log.sabaq_surah,
        sabaq_ayah_range: log.sabaq_ayah_range,
        sabaq_grade: log.sabaq_grade,
        sabaqi_para: log.sabaqi_para,
        sabaqi_grade: log.sabaqi_grade,
        manzil_para: log.manzil_para,
        manzil_grade: log.manzil_grade,
        teacher_notes: log.teacher_notes,
      });
      if (!error) {
        await db.hifz_logs.update(log.id, { synced: true });
      }
    }

    // Sync Cash Ledger
    const unsyncedCash = await db.cash_ledger.filter((i) => i.synced === false).toArray();
    for (const tx of unsyncedCash) {
      const { error } = await supabase.from('cash_ledger').upsert({
        id: tx.id,
        voucher_no: tx.voucher_no,
        date: tx.date,
        type: tx.type,
        fund_type: tx.fund_type,
        category: tx.category,
        amount: tx.amount,
        student_id: tx.student_id,
        payment_method: tx.payment_method,
        trx_id: tx.trx_id,
        is_verified: tx.is_verified,
        note: tx.note,
      });
      if (!error) {
        await db.cash_ledger.update(tx.id, { synced: true });
      }
    }

    currentStatus.lastSyncedAt = new Date();
    await checkPendingCount();
    return { success: true, message: 'ক্লাউডে সফলভাবে সিঙ্ক সম্পন্ন হয়েছে!' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'সিঙ্ক ব্যর্থ হয়েছে';
    return { success: false, message: errorMsg };
  } finally {
    currentStatus.isSyncing = false;
    notifySubscribers();
  }
}

export function initSyncEngine() {
  if (typeof window === 'undefined') return;

  window.addEventListener('online', () => {
    currentStatus.isOnline = true;
    notifySubscribers();
    triggerSync();
  });

  window.addEventListener('offline', () => {
    currentStatus.isOnline = false;
    notifySubscribers();
  });

  checkPendingCount();
}
