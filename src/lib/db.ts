import Dexie, { type Table } from 'dexie';
import { 
  Student, 
  HifzLog, 
  CashTransaction, 
  AttendanceRecord, 
  AppSettings, 
  UserProfile,
  Exam,
  ExamSubject,
  ExamMark,
  TarbiyatLog,
  Gatepass,
  VisitorMulaqat
} from './types';

export class MadrasahDatabase extends Dexie {
  students!: Table<Student, string>;
  hifz_logs!: Table<HifzLog, string>;
  cash_ledger!: Table<CashTransaction, string>;
  attendance!: Table<AttendanceRecord, string>;
  settings!: Table<AppSettings, string>;
  users!: Table<UserProfile, string>;
  exams!: Table<Exam, string>;
  exam_subjects!: Table<ExamSubject, string>;
  exam_marks!: Table<ExamMark, string>;
  tarbiyat_logs!: Table<TarbiyatLog, string>;
  gatepasses!: Table<Gatepass, string>;
  mulaqat_register!: Table<VisitorMulaqat, string>;

  constructor() {
    super('MadrasahManagementDB');
    this.version(2).stores({
      students: 'id, roll, name, department, phone, residential_status, meal_status, is_active, synced',
      hifz_logs: 'id, student_id, date, sabaq_para, sabaq_grade, synced, created_at',
      cash_ledger: 'id, voucher_no, date, type, fund_type, category, amount, student_id, payment_method, is_verified, synced, created_at',
      attendance: 'id, student_id, date, status, synced',
      settings: 'id',
      users: 'id, phone, role',
      exams: 'id, title, academic_year, is_active',
      exam_subjects: 'id, exam_id, department, sub_class',
      exam_marks: 'id, exam_id, student_id, subject_name, roll',
      tarbiyat_logs: 'id, student_id, month, roll',
      gatepasses: 'id, slip_no, student_id, status, departure_date',
      mulaqat_register: 'id, date, student_roll',
    });
  }
}

export const db = new MadrasahDatabase();

export async function seedInitialData() {
  const studentCount = await db.students.count();
  const examCount = await db.exams.count();

  const todayStr = new Date().toISOString().split('T')[0];

  if (studentCount === 0) {
    // 1. Settings
    await db.settings.put({
      id: 'main_settings',
      madrasah_name: 'দারুল উলুম ইসলামিয়া মাদ্রাসা ও এতিমখানা',
      tagline: 'হিফজুল কুরআন ও দ্বীনি শিক্ষার আদর্শ প্রতিষ্ঠান',
      address: 'মডেল টাউন, ঢাকা-১২৩০',
      phone: '01711-000000',
      muhtamim_name: 'মাওলানা শফিকুল ইসলাম সাহেব',
      receipt_prefix: 'DUM-',
      is_cloud_connected: false,
    });

    // 2. Users
    await db.users.bulkPut([
      { id: 'usr-1', name: 'মাওলানা শফিকুল ইসলাম (মুহতামিম)', phone: '01700000001', role: 'মুহতামিম', pin: '1234' },
      { id: 'usr-2', name: 'হাফেজ ক্বারী মুফিজুল ইসলাম (হিফজ শিক্ষক)', phone: '01700000002', role: 'উস্তাদ', pin: '1234' },
      { id: 'usr-3', name: 'মাওলানা মাহমুদুল হাসান (হিসাবরক্ষক)', phone: '01700000003', role: 'হিসাবরক্ষক', pin: '1234' },
    ]);

    // 3. Students (with completed_paras for progress bar)
    const initialStudents: Student[] = [
      {
        id: 'std-101',
        roll: 1,
        name: 'মুহাম্মদ আবদুল্লাহ',
        department: 'হিফজ',
        sub_class: 'হিফজ শাখা - ক',
        guardian_name: 'মো: রফিকুল ইসলাম',
        phone: '01712345678',
        whatsapp: '8801712345678',
        address: 'মিরপুর, ঢাকা',
        blood_group: 'B+',
        residential_status: 'আবাসিক',
        meal_status: 'সক্রিয়',
        is_active: true,
        admission_date: '2025-01-01',
        monthly_fee: 3000,
        completed_paras: 14,
        synced: true,
      },
      {
        id: 'std-102',
        roll: 2,
        name: 'উমর ফারুক',
        department: 'হিফজ',
        sub_class: 'হিফজ শাখা - ক',
        guardian_name: 'ফারুক আহমেদ',
        phone: '01812345678',
        whatsapp: '8801812345678',
        address: 'উত্তরা, ঢাকা',
        blood_group: 'A+',
        residential_status: 'আবাসিক',
        meal_status: 'সক্রিয়',
        is_active: true,
        admission_date: '2025-01-01',
        monthly_fee: 3000,
        completed_paras: 8,
        synced: true,
      },
      {
        id: 'std-103',
        roll: 3,
        name: 'আবদুর রহমান',
        department: 'হিফজ',
        sub_class: 'হিফজ শাখা - খ',
        guardian_name: 'মাওলানা হাবিবুর রহমান',
        phone: '01912345678',
        whatsapp: '8801912345678',
        address: 'টঙ্গী, গাজীপুর',
        blood_group: 'O+',
        residential_status: 'আবাসিক',
        meal_status: 'ছুটি',
        is_active: true,
        admission_date: '2025-01-05',
        monthly_fee: 2500,
        completed_paras: 21,
        synced: true,
      },
      {
        id: 'std-104',
        roll: 4,
        name: 'তালহা বিন ওবায়দুল্লাহ',
        department: 'হিফজ',
        sub_class: 'হিফজ শাখা - খ',
        guardian_name: 'ওবায়দুল্লাহ শেখ',
        phone: '01612345678',
        whatsapp: '8801612345678',
        address: 'বাড্ডা, ঢাকা',
        blood_group: 'AB+',
        residential_status: 'আবাসিক',
        meal_status: 'অসুস্থ',
        is_active: true,
        admission_date: '2025-01-10',
        monthly_fee: 3000,
        completed_paras: 4,
        synced: true,
      },
      {
        id: 'std-105',
        roll: 5,
        name: 'সালমান ফারসী',
        department: 'নাজেরা',
        sub_class: 'নাজেরা প্রথম বর্ষ',
        guardian_name: 'আবদুল কুদ্দুস',
        phone: '01512345678',
        whatsapp: '8801512345678',
        address: 'সাভার, ঢাকা',
        blood_group: 'B+',
        residential_status: 'আবাসিক',
        meal_status: 'সক্রিয়',
        is_active: true,
        admission_date: '2025-02-01',
        monthly_fee: 2500,
        completed_paras: 0,
        synced: true,
      },
      {
        id: 'std-106',
        roll: 6,
        name: 'আনাস বিন মালিক',
        department: 'নূরানী',
        sub_class: '৩য় জামাত',
        guardian_name: 'মালিক হোসেন',
        phone: '01798765432',
        whatsapp: '8801798765432',
        address: 'ধানমন্ডি, ঢাকা',
        blood_group: 'O+',
        residential_status: 'অনাবাসিক',
        meal_status: 'মিল বন্ধ',
        is_active: true,
        admission_date: '2025-01-15',
        monthly_fee: 1500,
        completed_paras: 0,
        synced: true,
      },
      {
        id: 'std-107',
        roll: 7,
        name: 'হাসান মাহমুদ',
        department: 'নূরানী',
        sub_class: '২য় জামাত',
        guardian_name: 'মাহমুদুল হক',
        phone: '01898765432',
        whatsapp: '8801898765432',
        address: 'মোহাম্মদপুর, ঢাকা',
        blood_group: 'A+',
        residential_status: 'অনাবাসিক',
        meal_status: 'মিল বন্ধ',
        is_active: true,
        admission_date: '2025-01-15',
        monthly_fee: 1500,
        completed_paras: 0,
        synced: true,
      },
      {
        id: 'std-108',
        roll: 8,
        name: 'সাদ বিন আবি ওয়াক্কাস',
        department: 'কিতাব',
        sub_class: 'মিজান জামাত',
        guardian_name: 'আবু বকর সিদ্দিক',
        phone: '01998765432',
        whatsapp: '8801998765432',
        address: 'নরসিংদী',
        blood_group: 'B+',
        residential_status: 'আবাসিক',
        meal_status: 'সক্রিয়',
        is_active: true,
        admission_date: '2025-01-01',
        monthly_fee: 2000,
        completed_paras: 0,
        synced: true,
      },
    ];
    await db.students.bulkPut(initialStudents);

    // 4. Initial Hifz Logs
    await db.hifz_logs.bulkPut([
      {
        id: 'hifz-1',
        student_id: 'std-101',
        student_name: 'মুহাম্মদ আবদুল্লাহ',
        date: todayStr,
        sabaq_para: 15,
        sabaq_surah: 'বনী ইসরাঈল',
        sabaq_ayah_range: '১-১৫ নং আয়াত',
        sabaq_grade: 'মুমতাজ',
        sabaqi_para: 14,
        sabaqi_grade: 'জাইয়িদ জিদ্দান',
        manzil_para: 4,
        manzil_grade: 'মুমতাজ',
        teacher_notes: 'মাশাআল্লাহ, উচ্চারণ ও মাখরাজ সুন্দর হয়েছে।',
        synced: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'hifz-2',
        student_id: 'std-102',
        student_name: 'উমর ফারুক',
        date: todayStr,
        sabaq_para: 9,
        sabaq_surah: 'আল-আরাফ',
        sabaq_ayah_range: 'পৃষ্ঠা ১৫৫',
        sabaq_grade: 'জাইয়িদ জিদ্দান',
        sabaqi_para: 8,
        sabaqi_grade: 'জাইয়িদ',
        manzil_para: 1,
        manzil_grade: 'মুমতাজ',
        teacher_notes: 'সবকীতে কিছুটা কাঁচা ছিল, পুনরায় দেখেছে।',
        synced: true,
        created_at: new Date().toISOString(),
      },
    ]);

    // 5. Initial Cash Ledger
    await db.cash_ledger.bulkPut([
      {
        id: 'tx-1',
        voucher_no: 'DUM-1001',
        date: todayStr,
        type: 'আয়',
        fund_type: 'লিল্লাহ ও যাকাত ফান্ড',
        category: 'লিল্লাহ অনুদান',
        amount: 25000,
        payment_method: 'ব্যাংক ট্রান্সফার',
        trx_id: 'BANK-998822',
        is_verified: true,
        note: 'প্রবাসী ভাই কর্তৃক লিল্লাহ এতিম তহবিলে অনুদান',
        received_by: 'হিসাবরক্ষক',
        synced: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'tx-2',
        voucher_no: 'DUM-1002',
        date: todayStr,
        type: 'আয়',
        fund_type: 'সাধারণ ও বেতন ফান্ড',
        category: 'মাসিক ফি',
        amount: 3000,
        student_id: 'std-101',
        student_name: 'মুহাম্মদ আবদুল্লাহ',
        payment_method: 'নগদ',
        is_verified: true,
        note: 'সেপ্টেম্বর মাসের বেতন ও আবাসিক চার্জ',
        received_by: 'হিসাবরক্ষক',
        synced: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'tx-3',
        voucher_no: 'DUM-1003',
        date: todayStr,
        type: 'ব্যয়',
        fund_type: 'লিল্লাহ ও যাকাত ফান্ড',
        category: 'গরীব ছাত্রের খানা খরচ',
        amount: 8500,
        payment_method: 'নগদ',
        is_verified: true,
        note: 'এতিম ও গরীব ছাত্রদের সাপ্তাহিক বাজারের চাল ও ডাল',
        received_by: 'বাবুর্চি কফিল',
        synced: true,
        created_at: new Date().toISOString(),
      },
    ]);
  }

  // 6. Seed Exam & Tarbiyat & Gatepass Data if not present
  if (examCount === 0) {
    await db.exams.bulkPut([
      {
        id: 'ex-1',
        title: '১ম সাময়িক পরীক্ষা ২০২৬',
        academic_year: '২০২৬',
        grading_system: 'বেফাক',
        is_active: true,
        start_date: todayStr,
      },
      {
        id: 'ex-2',
        title: 'বার্ষিক মূল্যায়ন পরীক্ষা ২০২৬',
        academic_year: '২০২৬',
        grading_system: 'বোর্ড_জিপিএ',
        is_active: false,
        start_date: '2026-11-15',
      },
    ]);

    await db.exam_subjects.bulkPut([
      { id: 'sub-1', exam_id: 'ex-1', department: 'কিতাব', sub_class: 'মিজান জামাত', name: 'মিজান ও মুনশাইব', full_marks: 100, pass_marks: 33 },
      { id: 'sub-2', exam_id: 'ex-1', department: 'কিতাব', sub_class: 'মিজান জামাত', name: 'কুরআন তিলাওয়াত ও তাজবীদ', full_marks: 100, pass_marks: 33 },
      { id: 'sub-3', exam_id: 'ex-1', department: 'হিফজ', sub_class: 'হিফজ শাখা - ক', name: 'হিফজুল কুরআন (মুখস্থ পাঠ)', full_marks: 100, pass_marks: 40 },
      { id: 'sub-4', exam_id: 'ex-1', department: 'হিফজ', sub_class: 'হিফজ শাখা - ক', name: 'তাজবীদ ও মাখরাজ', full_marks: 100, pass_marks: 40 },
      { id: 'sub-5', exam_id: 'ex-1', department: 'নূরানী', sub_class: '৩য় জামাত', name: 'কুরআন ও দ্বীনিয়াত', full_marks: 100, pass_marks: 33 },
    ]);

    await db.exam_marks.bulkPut([
      { id: 'em-1', exam_id: 'ex-1', subject_name: 'হিফজুল কুরআন (মুখস্থ পাঠ)', student_id: 'std-101', student_name: 'মুহাম্মদ আবদুল্লাহ', roll: 1, department: 'হিফজ', sub_class: 'হিফজ শাখা - ক', obtained_marks: 92, grade: 'মুমতাজ' },
      { id: 'em-2', exam_id: 'ex-1', subject_name: 'হিফজুল কুরআন (মুখস্থ পাঠ)', student_id: 'std-102', student_name: 'উমর ফারুক', roll: 2, department: 'হিফজ', sub_class: 'হিফজ শাখা - ক', obtained_marks: 82, grade: 'মুমতাজ' },
      { id: 'em-3', exam_id: 'ex-1', subject_name: 'মিজান ও মুনশাইব', student_id: 'std-108', student_name: 'সাদ বিন আবি ওয়াক্কাস', roll: 8, department: 'কিতাব', sub_class: 'মিজান জামাত', obtained_marks: 74, grade: 'জাইয়িদ জিদ্দান' },
    ]);

    await db.tarbiyat_logs.bulkPut([
      {
        id: 'tb-1',
        student_id: 'std-101',
        student_name: 'মুহাম্মদ আবদুল্লাহ',
        roll: 1,
        department: 'হিফজ',
        month: 'সেপ্টেম্বর ২০২৬',
        namaz_score: 5,
        tahajjud_score: 4,
        mutalaah_score: 5,
        akhlaq_score: 5,
        overall_grade: 'মুমতাজ',
        notes: 'মাশাআল্লাহ, তাকবীরে উলার সাথে নিয়মিত জামাতে নামাজ আদায় করেছে।',
      },
      {
        id: 'tb-2',
        student_id: 'std-102',
        student_name: 'উমর ফারুক',
        roll: 2,
        department: 'হিফজ',
        month: 'সেপ্টেম্বর ২০২৬',
        namaz_score: 4,
        tahajjud_score: 3,
        mutalaah_score: 4,
        akhlaq_score: 5,
        overall_grade: 'জাইয়িদ জিদ্দান',
        notes: 'আদব ও বিনম্র আচরণ প্রশংসনীয়। তাহাজ্জুদে আরেকটু মনোযোগী হওয়া উচিত।',
      },
    ]);

    await db.gatepasses.bulkPut([
      {
        id: 'gp-1',
        slip_no: 'GP-2026-001',
        student_id: 'std-103',
        student_name: 'আবদুর রহমান',
        roll: 3,
        department: 'হিফজ শাখা - খ',
        reason: 'পারিবারিক অনুষ্ঠান ও বড় বোনের বিবাহ উপলক্ষে ছুটি',
        departure_date: todayStr,
        return_date: '2026-09-25',
        guardian_phone: '01912345678',
        approved_by: 'মাওলানা শফিকুল ইসলাম (মুহতামিম)',
        status: 'প্রস্থানকৃত',
      },
    ]);

    await db.mulaqat_register.bulkPut([
      {
        id: 'mul-1',
        visitor_name: 'মো: রফিকুল ইসলাম (পিতা)',
        visitor_phone: '01712345678',
        student_name: 'মুহাম্মদ আবদুল্লাহ',
        student_roll: 1,
        relationship: 'পিতা',
        purpose: 'মাসিক খরচ ও নতুন কিতাব পৌঁছে দেওয়া',
        date: todayStr,
        time: 'বিকাল ৪:৩০',
      },
    ]);
  }
}
