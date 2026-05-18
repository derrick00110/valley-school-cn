// ===================== 山谷音乐学校 - 后端 API 服务 =====================
import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// PostgreSQL 连接（Zeabur 部署时启用）
let db = null;
if (process.env.DATABASE_URL) {
  import('pg').then(({ default: pg }) => {
    db = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    console.log('✅ PostgreSQL 已连接');
  });
} else {
  console.log('📁 使用 JSON 文件数据库（本地开发）');
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ===================== JSON 文件数据库 =====================
const DATA_DIR = path.join(__dirname, '..', '.data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function readTable(name) {
  const file = path.join(DATA_DIR, `${name}.json`);
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch { return []; }
}

function writeTable(name, data) {
  fs.writeFileSync(path.join(DATA_DIR, `${name}.json`), JSON.stringify(data, null, 2));
}

// ===================== 集合操作（兼容 Firebase 命名） =====================
// 数据集合：teachers（不分店）, students_{storeId}, enrollments_{storeId}, 
//          lessons_{storeId}, schedules_{storeId}

app.get('/api/collection/:name', (req, res) => {
  const data = readTable(req.params.name);
  res.json(data);
});

app.post('/api/collection/:name', (req, res) => {
  const data = readTable(req.params.name);
  const doc = { id: uuidv4(), ...req.body, createdAt: Date.now() };
  data.push(doc);
  writeTable(req.params.name, data);
  res.json(doc);
});

app.put('/api/collection/:name/:id', (req, res) => {
  const data = readTable(req.params.name);
  const idx = data.findIndex(d => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  data[idx] = { ...data[idx], ...req.body, id: req.params.id };
  writeTable(req.params.name, data);
  res.json(data[idx]);
});

app.patch('/api/collection/:name/:id', (req, res) => {
  const data = readTable(req.params.name);
  const idx = data.findIndex(d => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  data[idx] = { ...data[idx], ...req.body };
  writeTable(req.params.name, data);
  res.json(data[idx]);
});

app.delete('/api/collection/:name/:id', (req, res) => {
  const data = readTable(req.params.name);
  const filtered = data.filter(d => d.id !== req.params.id);
  writeTable(req.params.name, filtered);
  res.json({ deleted: data.length !== filtered.length });
});

// 批量删除（按条件）
app.delete('/api/collection/:name', (req, res) => {
  const { field, value } = req.query;
  if (!field || !value) return res.status(400).json({ error: 'need field and value' });
  const data = readTable(req.params.name);
  const before = data.length;
  const filtered = data.filter(d => String(d[field]) !== value);
  writeTable(req.params.name, filtered);
  res.json({ deleted: before - filtered.length });
});

// ===================== 种子数据 =====================
app.post('/api/seed', (req, res) => {
  const { teachers, students, enrollments, lessons, schedules } = req.body || {};
  if (teachers) writeTable('teachers', teachers);
  if (students) writeTable(`students_${students[0]?.storeId || 'dongguan'}`, students);
  if (enrollments) writeTable(`enrollments_${enrollments[0]?.storeId || 'dongguan'}`, enrollments);
  if (lessons) writeTable(`lessons_${lessons[0]?.storeId || 'dongguan'}`, lessons);
  if (schedules) writeTable(`schedules_${schedules[0]?.storeId || 'dongguan'}`, schedules);
  res.json({ ok: true });
});

// ===================== 提供前端静态文件（生产环境） =====================
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📌 ${process.env.DATABASE_URL ? 'PostgreSQL 模式' : 'JSON 文件模式（本地开发）'}`);
});
