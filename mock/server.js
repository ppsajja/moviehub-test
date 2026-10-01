// Backend จำลองของ MovieHub: ทำตัวเหมือน API ของทีม Go ทุกประการ (path, JSON, status code)
// แต่เก็บข้อมูลในหน่วยความจำ ปิดแล้วหาย  รัน:  npm run mock   (พอร์ต 4000)
// สัญญาทั้งหมดอยู่ใน docs/db-schema.md หัวข้อ 6 และ 7

const express = require('express');
const cors = require('cors');
const movies = require('./movies.json');          // 100 เรื่องชุดเดียวกับ seed.sql ของทีม Go

const app = express();
app.use(cors());                                   // Go จริงต้องเปิด CORS แบบนี้เหมือนกัน
app.use(express.json());                           // แปลง body ที่เป็น JSON ให้เป็น object (req.body)

// log ทุก request จะได้เห็นหน้าห้องว่าหน้าเว็บยิงอะไรมา
app.use((req, res, next) => {
  res.on('finish', () => console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode}`));
  next();
});

// ---------- "ฐานข้อมูล" ในหน่วยความจำ ----------
const db = {
  members: [{ id: 1, email: 'demo@moviehub.test', password: '1234', displayName: 'Demo', role: 'member' }],
  tokens: new Map(),                               // token -> memberId
  reviews: [],                                     // { id, memberId, movieId, text, createdAt, updatedAt }
  votes: [],                                       // { memberId, movieId, score }
  wishlist: [],                                    // { memberId, movieId, note, addedAt }
};
let nextMemberId = 2;
let nextReviewId = 1;

const publicMember = (m) => ({ id: m.id, email: m.email, displayName: m.displayName, role: m.role });
const findMovie = (id) => movies.find(m => m.id === Number(id));

// ---------- middleware: ต้อง login (endpoint ที่มี 🔒 ในสัญญา) ----------
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';            // "Bearer mock.1.xxxx"
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const memberId = db.tokens.get(token);
  if (!memberId) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อน' });
  req.member = db.members.find(m => m.id === memberId);     // รู้ว่าใครจาก token ไม่รับจาก body
  next();
}

// ---------- หนัง ----------
app.get('/api/movies', (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  const items = q
    ? movies.filter(m => m.title.toLowerCase().includes(q) || (m.titleTh || '').toLowerCase().includes(q))
    : movies;
  res.json({ items });
});

app.get('/api/movies/:id', (req, res) => {
  const movie = findMovie(req.params.id);
  if (!movie) return res.status(404).json({ error: 'ไม่พบหนังเรื่องนี้' });
  const stats = db.votes.filter(v => v.movieId === movie.id);
  res.json({
    ...movie,
    memberVoteCount: stats.length,
    memberRating: stats.length ? Math.round(stats.reduce((s, v) => s + v.score, 0) / stats.length * 10) / 10 : null,
  });
});

// ---------- สมาชิก ----------
app.post('/api/auth/register', (req, res) => {
  const { email = '', password = '', displayName = '' } = req.body || {};
  if (!email.includes('@') || password.length < 4 || !displayName.trim()) {
    return res.status(400).json({ error: 'กรอกอีเมล รหัสผ่าน (4 ตัวขึ้นไป) และชื่อที่แสดงให้ครบ' });
  }
  if (db.members.some(m => m.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: 'อีเมลนี้ถูกใช้แล้ว' });          // Go: unique index ชน (23505)
  }
  const member = { id: nextMemberId++, email: email.toLowerCase(), password, displayName: displayName.trim(), role: 'member' };
  db.members.push(member);                         // Go จริงเก็บ bcrypt hash ไม่เก็บรหัสผ่านตรง ๆ แบบนี้
  res.status(201).json(publicMember(member));
});

app.post('/api/auth/login', (req, res) => {
  const { email = '', password = '' } = req.body || {};
  const member = db.members.find(m => m.email === email.toLowerCase());
  if (!member || member.password !== password) {
    return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });   // ข้อความเดียวกันทั้ง 2 กรณี
  }
  const token = `mock.${member.id}.${Math.random().toString(36).slice(2)}`;
  db.tokens.set(token, member.id);
  res.json({ token, member: publicMember(member) });
});

app.get('/api/me', requireAuth, (req, res) => res.json(publicMember(req.member)));

// ---------- รีวิว ----------
app.get('/api/movies/:id/reviews', (req, res) => {
  const movieId = Number(req.params.id);
  const items = db.reviews
    .filter(r => r.movieId === movieId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(r => {
      const m = db.members.find(x => x.id === r.memberId);
      const v = db.votes.find(x => x.memberId === r.memberId && x.movieId === movieId);
      return { id: r.id, text: r.text, createdAt: r.createdAt, updatedAt: r.updatedAt,
               member: { id: m.id, displayName: m.displayName }, score: v ? v.score : null };
    });
  res.json({ items });
});

app.post('/api/movies/:id/reviews', requireAuth, (req, res) => {
  const movieId = Number(req.params.id);
  const text = (req.body?.text || '').trim();
  if (text.length < 10) return res.status(400).json({ error: 'รีวิวสั้นเกินไป' });
  if (db.reviews.some(r => r.memberId === req.member.id && r.movieId === movieId)) {
    return res.status(409).json({ error: 'คุณรีวิวเรื่องนี้ไปแล้ว' });
  }
  const now = new Date().toISOString();
  const review = { id: nextReviewId++, memberId: req.member.id, movieId, text,
                   createdAt: now, updatedAt: now };
  db.reviews.push(review);
  res.status(201).json({ id: review.id, text, createdAt: now });
});

app.delete('/api/reviews/:reviewId', requireAuth, (req, res) => {
  const i = db.reviews.findIndex(r => r.id === Number(req.params.reviewId) && r.memberId === req.member.id);
  if (i < 0) return res.status(404).json({ error: 'ไม่พบรีวิว' });
  db.reviews.splice(i, 1);
  res.status(204).end();
});

// ---------- คะแนน ----------
app.put('/api/movies/:id/vote', requireAuth, (req, res) => {
  const movieId = Number(req.params.id);
  const score = req.body?.score;
  if (!Number.isInteger(score) || score < 1 || score > 10) {
    return res.status(400).json({ error: 'score ต้องเป็นจำนวนเต็ม 1 ถึง 10' });
  }
  const existing = db.votes.find(v => v.memberId === req.member.id && v.movieId === movieId);
  if (existing) existing.score = score; else db.votes.push({ memberId: req.member.id, movieId, score });
  res.json({ movieId, score });
});

app.delete('/api/movies/:id/vote', requireAuth, (req, res) => {
  const movieId = Number(req.params.id);
  db.votes = db.votes.filter(v => !(v.memberId === req.member.id && v.movieId === movieId));
  res.status(204).end();
});

// ---------- Wishlist ----------
app.get('/api/me/wishlist', requireAuth, (req, res) => {
  const items = db.wishlist
    .filter(w => w.memberId === req.member.id)
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
    .map(w => ({ ...(findMovie(w.movieId) || { id: w.movieId, title: `หนัง #${w.movieId}` }), note: w.note, addedAt: w.addedAt }));
  res.json({ items });
});

app.put('/api/me/wishlist/:movieId', requireAuth, (req, res) => {
  const movieId = Number(req.params.movieId);
  const existing = db.wishlist.find(w => w.memberId === req.member.id && w.movieId === movieId);
  const note = req.body?.note ?? null;
  if (existing) existing.note = note;
  else db.wishlist.push({ memberId: req.member.id, movieId, note, addedAt: new Date().toISOString() });
  res.json({ movieId, note });                       // กดซ้ำกี่ครั้งผลเหมือนเดิม (PUT)
});

app.delete('/api/me/wishlist/:movieId', requireAuth, (req, res) => {
  const movieId = Number(req.params.movieId);
  db.wishlist = db.wishlist.filter(w => !(w.memberId === req.member.id && w.movieId === movieId));
  res.status(204).end();
});

app.use('/api', (req, res) => res.status(404).json({ error: `ไม่มี endpoint ${req.method} ${req.originalUrl}` }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`MovieHub mock backend พร้อมที่ http://localhost:${PORT}`);
  console.log('บัญชีทดลอง: demo@moviehub.test / 1234   (ข้อมูลทั้งหมดหายเมื่อปิด)');
});
