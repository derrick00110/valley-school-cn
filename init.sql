-- =====================================================
-- 山谷音乐学校 - Supabase 数据库建表脚本
-- 使用方式：Supabase 控制台 → SQL Editor → 粘贴 → 运行
-- =====================================================

-- 老师表
CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY,
  name TEXT,
  storeId TEXT,
  role TEXT,
  createdAt BIGINT
);

-- 学生表（东莞总店）
CREATE TABLE IF NOT EXISTS students_dongguan (
  id TEXT PRIMARY KEY,
  name TEXT,
  phone TEXT,
  storeId TEXT,
  teacherId TEXT,
  formalLessons INT DEFAULT 0,
  giftedLessons INT DEFAULT 0,
  totalFormal INT DEFAULT 0,
  note TEXT,
  createdAt BIGINT
);

-- 学生表（广州车陂店）
CREATE TABLE IF NOT EXISTS students_chebei (
  id TEXT PRIMARY KEY,
  name TEXT,
  phone TEXT,
  storeId TEXT,
  teacherId TEXT,
  formalLessons INT DEFAULT 0,
  giftedLessons INT DEFAULT 0,
  totalFormal INT DEFAULT 0,
  note TEXT,
  createdAt BIGINT
);

-- 报名表（东莞）
CREATE TABLE IF NOT EXISTS enrollments_dongguan (
  id TEXT PRIMARY KEY,
  studentId TEXT,
  studentName TEXT,
  course TEXT,
  courseType TEXT,
  price REAL DEFAULT 0,
  teacherId TEXT,
  storeId TEXT,
  enrollmentDate TEXT,
  commissionPeriod TEXT,
  commissionRate REAL DEFAULT 0,
  formalLessons INT DEFAULT 0,
  giftedLessons INT DEFAULT 0,
  lessonsPerSession REAL DEFAULT 0,
  isUnlimited BOOLEAN DEFAULT FALSE,
  unlimitedHalfApproved BOOLEAN DEFAULT FALSE,
  halfRequested BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active',
  createdAt BIGINT
);

-- 报名表（车陂）
CREATE TABLE IF NOT EXISTS enrollments_chebei (
  id TEXT PRIMARY KEY,
  studentId TEXT,
  studentName TEXT,
  course TEXT,
  courseType TEXT,
  price REAL DEFAULT 0,
  teacherId TEXT,
  storeId TEXT,
  enrollmentDate TEXT,
  commissionPeriod TEXT,
  commissionRate REAL DEFAULT 0,
  formalLessons INT DEFAULT 0,
  giftedLessons INT DEFAULT 0,
  lessonsPerSession REAL DEFAULT 0,
  isUnlimited BOOLEAN DEFAULT FALSE,
  unlimitedHalfApproved BOOLEAN DEFAULT FALSE,
  halfRequested BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active',
  createdAt BIGINT
);

-- 消课表（东莞）
CREATE TABLE IF NOT EXISTS lessons_dongguan (
  id TEXT PRIMARY KEY,
  studentId TEXT,
  studentName TEXT,
  enrollmentId TEXT,
  course TEXT,
  teacherId TEXT,
  storeId TEXT,
  date TEXT,
  type TEXT,
  commissionAmount REAL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  approvedBy TEXT,
  approvedAt BIGINT,
  upgradedFrom REAL,
  upgradedAt BIGINT,
  createdAt BIGINT
);

-- 消课表（车陂）
CREATE TABLE IF NOT EXISTS lessons_chebei (
  id TEXT PRIMARY KEY,
  studentId TEXT,
  studentName TEXT,
  enrollmentId TEXT,
  course TEXT,
  teacherId TEXT,
  storeId TEXT,
  date TEXT,
  type TEXT,
  commissionAmount REAL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  approvedBy TEXT,
  approvedAt BIGINT,
  upgradedFrom REAL,
  upgradedAt BIGINT,
  createdAt BIGINT
);

-- 排课表（东莞）
CREATE TABLE IF NOT EXISTS schedules_dongguan (
  id TEXT PRIMARY KEY,
  studentId TEXT,
  studentName TEXT,
  course TEXT,
  teacherId TEXT,
  teacherName TEXT,
  storeId TEXT,
  date TEXT,
  startTime TEXT,
  endTime TEXT,
  room TEXT,
  note TEXT,
  checkedIn BOOLEAN DEFAULT FALSE,
  lessonRecordId TEXT,
  createdAt BIGINT
);

-- 排课表（车陂）
CREATE TABLE IF NOT EXISTS schedules_chebei (
  id TEXT PRIMARY KEY,
  studentId TEXT,
  studentName TEXT,
  course TEXT,
  teacherId TEXT,
  teacherName TEXT,
  storeId TEXT,
  date TEXT,
  startTime TEXT,
  endTime TEXT,
  room TEXT,
  note TEXT,
  checkedIn BOOLEAN DEFAULT FALSE,
  lessonRecordId TEXT,
  createdAt BIGINT
);

-- 开启 RLS（行级安全），允许公开读写
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_dongguan ENABLE ROW LEVEL SECURITY;
ALTER TABLE students_chebei ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments_dongguan ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments_chebei ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons_dongguan ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons_chebei ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules_dongguan ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules_chebei ENABLE ROW LEVEL SECURITY;

-- 允许公开访问（anon key 可以读写）
CREATE POLICY "公开访问" ON teachers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "公开访问" ON students_dongguan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "公开访问" ON students_chebei FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "公开访问" ON enrollments_dongguan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "公开访问" ON enrollments_chebei FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "公开访问" ON lessons_dongguan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "公开访问" ON lessons_chebei FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "公开访问" ON schedules_dongguan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "公开访问" ON schedules_chebei FOR ALL USING (true) WITH CHECK (true);
