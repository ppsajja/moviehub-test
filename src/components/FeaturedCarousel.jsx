import { useState } from 'react';
import MovieCard from './MovieCard';

const PER_PAGE = 4;

// แถบหนังแนะนำแบบเลื่อนซ้ายขวา รับ movies ที่สลับลำดับมาแล้วจากแม่ ตัวเองจำแค่ว่าอยู่ชุดที่เท่าไร
function FeaturedCarousel({ movies }) {
  const [page, setPage] = useState(0);
  const total = Math.ceil(movies.length / PER_PAGE);   // จำนวนชุด เช่น 10 เรื่อง = 3 ชุด

  if (movies.length === 0) {
    return <p className="py-10 text-center text-slate-400">ยังไม่มีหนังแนะนำ</p>;
  }

  const shown = movies.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
  const prev = () => setPage(p => (p - 1 + total) % total);   // ถอยจากชุดแรกวนไปชุดสุดท้าย
  const next = () => setPage(p => (p + 1) % total);           // เดินจากชุดสุดท้ายวนกลับชุดแรก

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {shown.map(m => <MovieCard key={m.id} movie={m} />)}
      </div>
      <div className="mt-4 flex items-center justify-center gap-4 text-sm text-slate-500">
        <button onClick={prev} className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-emerald-700 hover:bg-emerald-50">
          ก่อนหน้า
        </button>
        <span>ชุดที่ {page + 1} จาก {total}</span>
        <button onClick={next} className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-emerald-700 hover:bg-emerald-50">
          ถัดไป
        </button>
      </div>
    </div>
  );
}

export default FeaturedCarousel;
