import { useState } from 'react';
import { getJSON, searchMovies, getMovies, CACHE_KEY } from '../api/tmdb';
import { forget } from '../api/cache';

// สนามทดลอง: ยิง request ทีละครั้งจากปุ่ม (ยังไม่ใช้ useEffect) แล้วดูของที่ได้กลับมาแบบดิบ ๆ
function ApiLab() {
  const [query, setQuery] = useState('Spider-Man');
  const [status, setStatus] = useState('idle');     // idle | loading | success | error
  const [output, setOutput] = useState('');
  const [ms, setMs] = useState(null);

  const hasKey = Boolean(process.env.REACT_APP_TMDB_KEY);
  const shownUrl = `https://api.themoviedb.org/3/search/movie?api_key=****&language=th-TH&query=${encodeURIComponent(query)}`;

  async function run(fn) {
    setStatus('loading');
    const t0 = performance.now();
    try {
      const data = await fn();
      setOutput(JSON.stringify(data, null, 2));
      setStatus('success');
    } catch (err) {
      setOutput(err.message);
      setStatus('error');
    } finally {
      setMs(Math.round(performance.now() - t0));
    }
  }

  const statusColor = {
    idle: 'text-slate-400', loading: 'text-amber-600', success: 'text-emerald-600', error: 'text-red-600',
  }[status];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold text-slate-900">API Lab</h1>
      <p className="mt-1 text-slate-500">กดปุ่มแล้วดูว่า TMDB ตอบอะไรกลับมา ก่อนจะเอาไปใช้ในหน้าจริง</p>

      <div className="mt-6 flex flex-col gap-2 md:flex-row">
        <input value={query} onChange={(e) => setQuery(e.target.value)}
               className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100" />
        <button onClick={() => run(() => getJSON('/search/movie', { query }))} disabled={status === 'loading'}
                className="whitespace-nowrap rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:bg-slate-300">
          ดู JSON ดิบ
        </button>
        <button onClick={() => run(() => searchMovies(query))} disabled={status === 'loading'}
                className="whitespace-nowrap rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50 disabled:text-slate-300">
          ผ่าน toMovie แล้ว
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        <button onClick={() => run(getMovies)} disabled={status === 'loading'}
                className="rounded-lg border border-emerald-200 bg-white px-4 py-2 text-emerald-700 hover:bg-emerald-50 disabled:text-slate-300">
          getMovies() หนังกำลังฉาย ผ่าน cache รายวัน
        </button>
        <button onClick={() => { forget(CACHE_KEY); setOutput('ล้าง cache แล้ว กดปุ่มด้านซ้ายอีกครั้งจะเห็นว่าใช้เวลานานขึ้น'); setStatus('idle'); setMs(null); }}
                className="text-slate-500 underline hover:text-emerald-600">
          ล้าง cache
        </button>
        <span className="text-slate-400">กดครั้งแรกจะช้า (ยิงจริง) กดซ้ำจะเร็วมาก (อ่านจาก localStorage)</span>
      </div>
      <p className="mt-2 break-all font-mono text-xs text-slate-400">GET {shownUrl}</p>
      {!hasKey && <p className="mt-1 text-xs text-amber-700">ยังไม่มี key ใน .env ปุ่มจะได้ 401 กลับมา</p>}

      <div className="mt-6 overflow-hidden rounded-xl border border-emerald-100 bg-white">
        <div className="flex items-center gap-3 border-b border-emerald-100 bg-emerald-50/60 px-4 py-2 text-sm">
          <span className="text-slate-500">สถานะ</span>
          <span className={'font-medium ' + statusColor}>{status}</span>
          {ms !== null && <span className="text-slate-400">{ms} ms</span>}
        </div>
        <pre className="max-h-[28rem] overflow-auto p-4 text-xs leading-relaxed text-slate-700">
          {output || 'ยังไม่ได้ส่ง request'}
        </pre>
      </div>
    </div>
  );
}

export default ApiLab;
