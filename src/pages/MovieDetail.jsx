import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import MovieActions from '../components/MovieActions';
//import { getMovie } from '../api/tmdb';
import { getMovie } from '../api/backend';
import { useAuth } from '../auth/AuthContext';
// TODO ขั้นที่ 3: import { getReviews, postReview } from '../api/backend';
import { getReviews, postReview } from '../api/backend';

function MovieDetail() {
  const { id } = useParams();                       // ได้เป็น string เสมอ (ตอนนี้คือรหัสของ TMDB)
  const [movie, setMovie] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);       // รีวิวจาก backend ของเรา (ไม่ใช่ TMDB)
  const { isLoggedIn } = useAuth();                 // TODO ขั้นที่ 3: ดึง token และ member มาด้วย
  const { token, member } = useAuth();              // ดึง token และ member มาด้วย
  
  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const m = await getMovie(id);
        if (!ignore) { setMovie(m); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [id]);                                          // id เปลี่ยน = โหลดเรื่องใหม่

  // TODO ขั้นที่ 3 (ก): เปลี่ยน effect นี้ให้โหลดรีวิวจริงจาก backend
  //   getReviews(id) ได้ { items } แล้ว setReviews(items)  dependency คือ [id] เหมือนตัวบน
  //   (แยกจาก effect ของ TMDB เพราะคนละ server พังคนละแบบ ไม่ควรให้รีวิวล่มแล้วหน้าทั้งหน้าพัง)
    // โหลดรีวิวของเรื่องนี้จาก backend ของเรา แยก effect จาก TMDB เพราะคนละ server
  useEffect(() => {
    let ignore = false;
    getReviews(id)
      .then(data => { if (!ignore) setReviews(data.items); })
      .catch(() => { if (!ignore) setReviews([]); });   // backend ล่มก็แค่ไม่มีรีวิว หน้าหนังยังดูได้
    return () => { ignore = true; };
  }, [id]);

  // ส่งรีวิวจริง: ReviewForm เรียกฟังก์ชันนี้ตอนกดส่ง ถ้า throw ฟอร์มจะโชว์ข้อความ error เอง
  async function handleReviewSubmit(text) {
    const saved = await postReview(id, text, token);          // 201 ได้ { id, text, createdAt }
    setReviews([
      { ...saved, member: { id: member.id, displayName: member.displayName }, score: null },
      ...reviews,                                              // ต่อหน้ารายการเดิม
    ]);
  }

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-4xl animate-pulse px-4 py-10 md:px-6">
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="aspect-[2/3] w-48 shrink-0 rounded-xl bg-slate-100" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-2/3 rounded bg-slate-100" />
            <div className="h-4 w-1/3 rounded bg-slate-100" />
            <div className="h-24 w-full rounded bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-lg text-slate-700">ไม่พบหนังเรื่องนี้ 😢</p>
        <p className="text-sm text-slate-400">{error.message}</p>
        <Link to="/movies" className="mt-6 inline-block text-sm text-emerald-600 hover:underline">กลับไปหน้าหนังทั้งหมด</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <Link to="/movies" className="text-sm text-slate-500 hover:text-emerald-600">กลับไปหน้าหนังทั้งหมด</Link>

      <div className="mt-4 flex flex-col gap-8 md:flex-row">
        {movie.poster ? (
          <img src={movie.poster} alt={`โปสเตอร์ ${movie.title}`}
               className="w-48 shrink-0 self-start rounded-xl border border-slate-200" />
        ) : (
          <div className="grid aspect-[2/3] w-48 shrink-0 place-items-center rounded-xl bg-slate-100 text-5xl">🎬</div>
        )}

        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">{movie.title}</h1>
          {movie.titleTh && <p className="mt-1 text-slate-500">{movie.titleTh}</p>}
          <p className="mt-2 text-sm text-slate-500">
            {movie.year}{movie.genre && ` | ${movie.genre}`}{movie.rating != null && ` | ⭐ ${movie.rating}`}
          </p>
          <p className="mt-4 leading-relaxed text-slate-700">{movie.detail}</p>

          <MovieActions movieId={movie.id} />

          <div className="mt-8">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">รีวิวจากสมาชิก ({reviews.length})</h2>
            <ReviewList items={reviews} />
          </div>

          <div className="mt-6 rounded-xl border border-emerald-100 bg-white p-5">
            {isLoggedIn ? (
              <ReviewForm key={movie.id} movieTitle={movie.title} onSubmit={handleReviewSubmit} />
            ) : (
              <p className="text-sm text-slate-500">
                <Link to="/login" className="text-emerald-600 hover:underline">เข้าสู่ระบบ</Link> เพื่อเขียนรีวิว
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;
