// ชั้นกลางสำหรับคุยกับ Backend ของทีมเรา (วันนี้คือ mock ที่พอร์ต 4000 สัปดาห์หน้าคือ Go)
// ต่างจาก tmdb.js ตรงที่มี POST / PUT / DELETE และต้องแนบ token สำหรับ endpoint ที่ต้อง login

// '' = origin เดียวกับหน้าเว็บ CRA จะ proxy /api ไปที่ http://localhost:4000 ให้ (ตั้งใน package.json)
// ตอนต่อ Go จริง ตั้ง REACT_APP_API_URL=https://api.ทีมเรา.xyz ใน .env และบน Vercel
const BASE = process.env.REACT_APP_API_URL || '';

export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };   // 1) บอก server ว่า body เป็น JSON
  if (token) headers.Authorization = `Bearer ${token}`;      //    และแนบบัตรผ่านถ้ามี

  const res = await fetch(BASE + path, {                     // 2) ยิงจริง
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,           //    object ต้องแปลงเป็นข้อความก่อนส่ง
  });

  if (res.status === 204) return null;                       // 3) ลบสำเร็จ ไม่มี body ให้อ่าน

  const data = await res.json()                              //    อ่านคำตอบเป็น JSON
    .catch(() => ({ error: 'server ไม่ได้ตอบเป็น JSON' }));
  if (!res.ok) {                                             // 4) 400 / 401 / 404 / 409 มาลงตรงนี้
    const err = new Error(data.error || `server ตอบกลับ ${res.status}`);
    err.status = res.status;                                 //    แนบเลขไว้ให้หน้าเว็บใช้ต่อ
    throw err;
  }
  return data;
}

// ---------- สมาชิก ----------
export function register(email, password, displayName) {
  return apiFetch('/api/auth/register', { method: 'POST', body: { email, password, displayName } });
}
export function login(email, password) {
  return apiFetch('/api/auth/login', { method: 'POST', body: { email, password } });   // ได้ { token, member }
}
export function getMe(token) {
  return apiFetch('/api/me', { token });
}

// ---------- รีวิว ----------
export function getReviews(movieId) {
  return apiFetch(`/api/movies/${movieId}/reviews`);                                   // ได้ { items }
}
export function postReview(movieId, text, token) {
  return apiFetch(`/api/movies/${movieId}/reviews`, { method: 'POST', body: { text }, token });
}

// ---------- คะแนน ----------
export function putVote(movieId, score, token) {
  return apiFetch(`/api/movies/${movieId}/vote`, { method: 'PUT', body: { score }, token });
}

// ---------- Wishlist ----------
export function getWishlist(token) {
  return apiFetch('/api/me/wishlist', { token });                                       // ได้ { items }
}
export function addToWishlist(movieId, token) {
  return apiFetch(`/api/me/wishlist/${movieId}`, { method: 'PUT', token });
}
export function removeFromWishlist(movieId, token) {
  return apiFetch(`/api/me/wishlist/${movieId}`, { method: 'DELETE', token });
}

// ---------- หนัง (สัปดาห์หน้า: เปลี่ยนหน้า Movies จาก tmdb.js มาใช้ตัวนี้) ----------
export async function getMovies() {
  const data = await apiFetch('/api/movies');
  return data.items;
}

export async function getMovie(movieId) {
  return apiFetch(`/api/movies/${movieId}`);   // ได้ { movie, reviews, vote, inWishlist }
}
