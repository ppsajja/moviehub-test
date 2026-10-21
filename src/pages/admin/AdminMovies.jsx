import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMovies } from '../../api/backend';
import { ErrorBox, Loading, btnPrimary, inputClass } from '../../components/admin/AdminStates';

// ตารางหนังทั้งหมด: ใช้ GET /api/movies ตัวเดิม (สาธารณะ) แล้วกรองในเครื่องเหมือนหน้า Movies
// ส่วนที่ต้องเป็น admin คือปุ่มแก้ไข/เพิ่ม ซึ่งพาไปหน้าฟอร์ม
function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const list = await getMovies();
        if (!ignore) { setMovies(list); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [reloadKey]);

  const q = query.trim().toLowerCase();
  const shown = movies.filter(m =>
    q === '' || m.title.toLowerCase().includes(q) || (m.titleTh ?? '').toLowerCase().includes(q) || String(m.id) === q
  );

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">หนังทั้งหมด</h2>
          {status === 'success' && <p className="text-sm text-slate-500">แสดง {shown.length} จาก {movies.length} เรื่อง</p>}
        </div>
        <div className="flex gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)}
                 placeholder="ค้นชื่อหนัง หรือพิมพ์เลข id" className={inputClass + ' md:w-64'} />
          <Link to="/admin/movies/new" className={btnPrimary + ' whitespace-nowrap'}>+ เพิ่มหนัง</Link>
        </div>
      </div>

      {status === 'loading' && <Loading />}
      {status === 'error' && <ErrorBox error={error} onRetry={() => setReloadKey(k => k + 1)} />}
      {status === 'success' && (
        <div className="overflow-x-auto rounded-xl border border-emerald-100 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-emerald-50/60 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">หนัง</th>
                <th className="px-4 py-3">แนว</th>
                <th className="px-4 py-3">ปี</th>
                <th className="px-4 py-3">คะแนน</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shown.map(m => (
                <tr key={m.id} className="hover:bg-emerald-50/40">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      {m.poster
                        ? <img src={m.poster} alt="" className="h-12 w-8 rounded object-cover" />
                        : <div className="grid h-12 w-8 place-items-center rounded bg-slate-100 text-xs">🎬</div>}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">{m.title}</p>
                        <p className="truncate text-xs text-slate-500">{m.titleTh ?? '(ยังไม่มีชื่อไทย)'} <span className="text-slate-300">#{m.id}</span></p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-slate-600">{m.genre ?? '-'}</td>
                  <td className="px-4 py-2 text-slate-600">{m.year ?? '-'}</td>
                  <td className="px-4 py-2 text-slate-600">{m.rating ? `⭐ ${m.rating}` : '-'}</td>
                  <td className="px-4 py-2 text-right">
                    <Link to={`/admin/movies/${m.id}`} className="text-emerald-600 hover:underline">แก้ไข</Link>
                  </td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">ไม่พบหนังที่ค้นหา</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminMovies;