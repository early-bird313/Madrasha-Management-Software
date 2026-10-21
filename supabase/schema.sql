-- ========================================================
-- মাদ্রাসা ম্যানেজমেন্ট সফটওয়্যার: Supabase PostgreSQL Schema & RLS
-- ========================================================

-- ১. মাদ্রাসা টেবিল (Multi-tenant isolation)
CREATE TABLE IF NOT EXISTS madrasahs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tagline TEXT,
    address TEXT,
    phone TEXT,
    muhtamim_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ২. ইউজার প্রোফাইল ও ভূমিকা
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    madrasah_id UUID REFERENCES madrasahs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    role TEXT CHECK (role IN ('মুহতামিম', 'নাজেমে তা''লীমাত', 'উস্তাদ', 'হিসাবরক্ষক')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ৩. শিক্ষার্থী টেবিল
CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    madrasah_id UUID REFERENCES madrasahs(id) ON DELETE CASCADE,
    roll INTEGER NOT NULL,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    sub_class TEXT,
    guardian_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    address TEXT,
    blood_group TEXT,
    residential_status TEXT NOT NULL,
    meal_status TEXT NOT NULL DEFAULT 'সক্রিয়',
    monthly_fee NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    admission_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ৪. হিফজ ও নাজেরা ট্র্যাকার লগ
CREATE TABLE IF NOT EXISTS hifz_logs (
    id TEXT PRIMARY KEY,
    madrasah_id UUID REFERENCES madrasahs(id) ON DELETE CASCADE,
    student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    sabaq_para INTEGER,
    sabaq_surah TEXT,
    sabaq_ayah_range TEXT,
    sabaq_grade TEXT,
    sabaqi_para INTEGER,
    sabaqi_grade TEXT,
    manzil_para INTEGER,
    manzil_grade TEXT,
    teacher_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ৫. শরীয়াহ ক্যাশবুক ও আর্থিক লেজার
CREATE TABLE IF NOT EXISTS cash_ledger (
    id TEXT PRIMARY KEY,
    madrasah_id UUID REFERENCES madrasahs(id) ON DELETE CASCADE,
    voucher_no TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    type TEXT CHECK (type IN ('আয়', 'ব্যয়')),
    fund_type TEXT NOT NULL,
    category TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    student_id TEXT REFERENCES students(id) ON DELETE SET NULL,
    payment_method TEXT NOT NULL,
    trx_id TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    note TEXT,
    received_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ৬. উপস্থিতি রেকর্ড
CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY,
    madrasah_id UUID REFERENCES madrasahs(id) ON DELETE CASCADE,
    student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- Row Level Security (RLS) Policies
-- প্রতিটি মাদ্রাসার ডেটা সম্পূর্ণ আলাদা এবং সুরক্ষিত
-- ========================================================

ALTER TABLE madrasahs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE hifz_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Helper Function: বর্তমান ইউজারের madrasah_id পাওয়া
CREATE OR REPLACE FUNCTION get_user_madrasah_id()
RETURNS UUID AS $$
  SELECT madrasah_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Students RLS
CREATE POLICY "মাদ্রাসার ইউজাররা শুধু নিজ ছাত্রদের ডেটা দেখতে পারবেন"
ON students FOR ALL
USING (madrasah_id = get_user_madrasah_id());

-- Hifz Logs RLS
CREATE POLICY "মাদ্রাসার শিক্ষকরা নিজ হিফজ লগ নিয়ন্ত্রণ করবেন"
ON hifz_logs FOR ALL
USING (madrasah_id = get_user_madrasah_id());

-- Cash Ledger RLS
CREATE POLICY "হিসাবরক্ষক ও মুহতামিম নিজ মাদ্রাসার লেজার পরিচালনা করবেন"
ON cash_ledger FOR ALL
USING (madrasah_id = get_user_madrasah_id());
