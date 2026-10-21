export type Department = 'হিফজ' | 'নাজেরা' | 'নূরানী' | 'কিতাব';

export type ResidentialStatus = 'আবাসিক' | 'অনাবাসিক' | 'ডে-কেয়ার';

export type MealStatus = 'সক্রিয়' | 'ছুটি' | 'অসুস্থ' | 'মিল বন্ধ';

export type HifzGrade = 'মুমতাজ' | 'জাইয়িদ জিদ্দান' | 'জাইয়িদ' | 'মাকবুল' | 'আদায় হয়নি';

export type FundType = 'লিল্লাহ ও যাকাত ফান্ড' | 'সাধারণ ও বেতন ফান্ড' | 'উন্নয়ন ও নির্মাণ ফান্ড';

export type TransactionType = 'আয়' | 'ব্যয়';

export type PaymentMethod = 'নগদ' | 'বিকাশ' | 'নগদ (Nagad)' | 'ব্যাংক ট্রান্সফার';

export type AttendanceStatus = 'উপস্থিত' | 'অনুপস্থিত' | 'ছুটি' | 'অসুস্থ';

export type GradingSystem = 'বেফাক' | 'বোর্ড_জিপিএ';

export interface Student {
  id: string; // uuid or client id
  roll: number;
  name: string;
  department: Department;
  sub_class?: string; // e.g. জামাত / পারা
  guardian_name: string;
  phone: string;
  whatsapp?: string;
  address?: string;
  blood_group?: string;
  residential_status: ResidentialStatus;
  meal_status: MealStatus;
  is_active: boolean;
  admission_date: string;
  monthly_fee: number;
  completed_paras?: number; // 0 to 30 paras for progress bar
  synced?: boolean;
}

export interface HifzLog {
  id: string;
  student_id: string;
  student_name: string;
  date: string; // YYYY-MM-DD
  sabaq_para: number;
  sabaq_surah: string;
  sabaq_ayah_range: string;
  sabaq_grade: HifzGrade;
  sabaqi_para: number;
  sabaqi_grade: HifzGrade;
  manzil_para: number;
  manzil_grade: HifzGrade;
  teacher_notes?: string;
  synced?: boolean;
  created_at: string;
}

export interface CashTransaction {
  id: string;
  voucher_no: string;
  date: string;
  type: TransactionType;
  fund_type: FundType;
  category: string; // e.g. 'মাসিক ফি', 'লিল্লাহ দান', 'উস্তাদদের বেতন', 'গরীব ছাত্রের খানা', 'বিদ্যুৎ বিল'
  amount: number;
  student_id?: string;
  student_name?: string;
  payment_method: PaymentMethod;
  trx_id?: string;
  is_verified: boolean;
  note?: string;
  received_by?: string;
  synced?: boolean;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
  synced?: boolean;
}

export interface AppSettings {
  id: string;
  madrasah_name: string;
  tagline: string;
  address: string;
  phone: string;
  muhtamim_name: string;
  receipt_prefix: string;
  supabase_url?: string;
  supabase_anon_key?: string;
  is_cloud_connected?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  role: 'মুহতামিম' | 'নাজেমে তা\'লীমাত' | 'উস্তাদ' | 'হিসাবরক্ষক';
  pin: string;
}

// ==========================================
// নতুন মডিউলের জন্য টাইপস (Blueprint Phase 2)
// ==========================================

export interface Exam {
  id: string;
  title: string; // e.g. '১ম সাময়িক পরীক্ষা ২০২৬'
  academic_year: string;
  grading_system: GradingSystem;
  is_active: boolean;
  start_date: string;
}

export interface ExamSubject {
  id: string;
  exam_id: string;
  department: Department;
  sub_class: string;
  name: string;
  full_marks: number;
  pass_marks: number;
}

export interface ExamMark {
  id: string;
  exam_id: string;
  subject_name: string;
  student_id: string;
  student_name: string;
  roll: number;
  department: Department;
  sub_class: string;
  obtained_marks: number;
  grade: string;
  synced?: boolean;
}

export interface TarbiyatLog {
  id: string;
  student_id: string;
  student_name: string;
  roll: number;
  department: string;
  month: string; // e.g. 'সেপ্টেম্বর ২০২৬'
  namaz_score: number; // 1 to 5
  tahajjud_score: number; // 1 to 5
  mutalaah_score: number; // 1 to 5
  akhlaq_score: number; // 1 to 5
  overall_grade: 'মুমতাজ' | 'জাইয়িদ জিদ্দান' | 'জাইয়িদ' | 'উন্নতি প্রয়োজন';
  notes?: string;
  synced?: boolean;
}

export interface Gatepass {
  id: string;
  slip_no: string;
  student_id: string;
  student_name: string;
  roll: number;
  department: string;
  reason: string;
  departure_date: string;
  return_date: string;
  guardian_phone: string;
  approved_by: string;
  status: 'অনুমোদিত' | 'প্রস্থানকৃত' | 'প্রত্যাবর্তন সম্পন্ন';
  synced?: boolean;
}

export interface VisitorMulaqat {
  id: string;
  visitor_name: string;
  visitor_phone: string;
  student_name: string;
  student_roll: number;
  relationship: string;
  purpose: string;
  date: string;
  time: string;
  synced?: boolean;
}
