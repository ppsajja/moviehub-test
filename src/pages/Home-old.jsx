import { useState } from 'react';
import { Link } from 'react-router-dom';
import FeaturedCarousel from '../components/FeaturedCarousel';
import { movies as localMovies } from '../data/data';
// TODO ขั้นที่ 5: import { useEffect } from 'react' และ import { getMovies } from '../api/tmdb'

const STEPS = [
  { n: 1, file: 'src/api/tmdb.js', what: 'เขียนส่วน fetch ใน getJSON' },
  { n: 2, file: 'src/api/tmdb.js', what: 'เขียน toMovie แปลง JSON ของ TMDB' },
  { n: 3, file: 'src/pages/Movies.jsx', what: 'useEffect โหลดหนังจาก API (วันละครั้ง) แล้วกรองในเครื่อง' },
  { n: 4, file: 'src/pages/MovieDetail.jsx', what: 'โหลดรายละเอียดตาม id' },
  { n: 5, file: 'src/pages/Home.jsx', what: 'หนังแนะนำสุ่มจากข้อมูล API ชุดเดียวกัน' },
  { n: 6, file: 'docs/api-wishlist.md', what: 'กรอกรายการ API ที่จะขอจากทีม Backend' },
];

// สลับลำดับแบบสุ่มบนสำเนา ไม่แตะ array เดิม
function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function Home() {
  // สุ่มครั้งเดียวตอน component เกิด แล้วจำไว้ใน state (กดเลื่อนแล้วลำดับไม่เปลี่ยน)
  // TODO ขั้นที่ 5: เปลี่ยนเป็น useState([]) แล้วใช้ useEffect เรียก getMovies() แล้ว setPicks(shuffle(list))
  const [picks, setPicks] = useState(() => shuffle(localMovies));

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-6">
      {/* Hero */}
      <section className="py-14 md:py-20">
        <p className="text-sm font-medium text-emerald-600">สัปดาห์นี้: Fetch / JSON / API</p>
        <h1 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">
          หนังน่าดู รวมไว้ที่เดียว
        </h1>
        <p className="mt-4 max-w-xl text-slate-600">
          ตอนนี้ MovieHub ยังมีหนังแค่ 10 เรื่องจากไฟล์ data.js
          วันนี้เราจะเชื่อมกับ TMDB ให้ได้หนังที่กำลังฉายจริง และเตรียมต่อกับ Backend ของทีม
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/movies" className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600">
            ดูหนังทั้งหมด
          </Link>
          <Link to="/lab" className="rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50">
            ทดลองยิง API
          </Link>
        </div>
      </section>

      {/* Featured */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">หนังแนะนำ</h2>
            <p className="text-sm text-slate-500">สุ่มลำดับใหม่ทุกครั้งที่เปิดหน้า แหล่งข้อมูล: data.js</p>
          </div>
          <button onClick={() => setPicks(shuffle(picks))} className="text-sm text-emerald-600 hover:underline">
            สุ่มใหม่
          </button>
        </div>
        <FeaturedCarousel movies={picks} />
      </section>

      {/* Roadmap */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold text-slate-900">แผนที่ของโปรเจกต์นี้</h2>
        <p className="text-sm text-slate-500">หน้าตาเสร็จแล้ว เหลือเติมส่วนที่คุยกับ API ทีละขั้น</p>
        <ol className="mt-4 divide-y divide-emerald-100 rounded-xl border border-emerald-100 bg-white">
          {STEPS.map(s => (
            <li key={s.n} className="flex items-center gap-4 px-4 py-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-50 text-sm font-medium text-emerald-700">{s.n}</span>
              <div className="min-w-0">
                <p className="text-sm text-slate-900">{s.what}</p>
                <code className="text-xs text-slate-400">{s.file}</code>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export default Home;
