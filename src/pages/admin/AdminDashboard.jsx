import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getAdminStats } from '../../api/backend';
import { ErrorBox, Loading } from '../../components/admin/AdminStates';

// การ์ดตัวเลข 1 ใบ
function StatCard({ label, value, to }) {
  const body = (
    <>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-slate-900">{value}</p>
    </>
  );
  const cls = 'rounded-xl border border-emerald-100 bg-white p-4';
  return to ? <Link to={to} className={cls + ' block hover:border-emerald-300'}>{body}</Link> : <div className={cls}>{body}</div>;
}

const dateTH = (iso) => new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const data = await getAdminStats(token);           // ยิงครั้งเดียว ได้ทุกตัวเลขของหน้านี้
        if (!ignore) { setStats(data); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [token, reloadKey]);

  if (status === 'loading') return <Loading />;
  if (status === 'error') return <ErrorBox error={error} onRetry={() => setReloadKey(k => k + 1)} />;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard label="หนัง" value={stats.movies} to="/admin/movies" />
        <StatCard label="สมาชิก" value={stats.members} to="/admin/members" />
        <StatCard label="admin" value={stats.admins} />
        <StatCard label="โหวต" value={stats.votes} />
        <StatCard label="อยากดู" value={stats.wishlistItems} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-emerald-100 bg-white p-4">
          <h2 className="font-semibold text-slate-900">หนังที่สมาชิกให้คะแนนสูงสุด</h2>
          <p className="text-xs text-slate-400">คะแนนจากสมาชิกเว็บเรา ไม่ใช่ของ TMDB</p>
          {stats.topVoted.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">ยังไม่มีใครโหวต</p>
          ) : (
            <ol className="mt-3 divide-y divide-slate-100">
              {stats.topVoted.map((m, i) => (
                <li key={m.id} className="flex items-center gap-3 py-2">
                  <span className="w-5 text-sm text-slate-400">{i + 1}</span>
                  {m.poster
                    ? <img src={m.poster} alt="" className="h-12 w-8 rounded object-cover" />
                    : <div className="grid h-12 w-8 place-items-center rounded bg-slate-100 text-xs">🎬</div>}
                  <div className="min-w-0 flex-1">
                    <Link to={`/movies/${m.id}`} className="block truncate text-sm font-medium text-slate-900 hover:text-emerald-600">{m.title}</Link>
                    {m.titleTh && <p className="truncate text-xs text-slate-500">{m.titleTh}</p>}
                  </div>
                  <span className="text-sm text-slate-600">⭐ {m.voteAverage} <span className="text-xs text-slate-400">({m.voteCount})</span></span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="rounded-xl border border-emerald-100 bg-white p-4">
          <h2 className="font-semibold text-slate-900">สมาชิกใหม่ล่าสุด</h2>
          <ul className="mt-3 divide-y divide-slate-100">
            {stats.newestMembers.map(m => (
              <li key={m.id} className="flex items-center justify-between py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{m.displayName}</p>
                  <p className="truncate text-xs text-slate-500">{m.email}</p>
                </div>
                <div className="text-right text-xs text-slate-400">
                  {m.role === 'admin' && <span className="mr-2 rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">admin</span>}
                  {dateTH(m.createdAt)}
                </div>
              </li>
            ))}
          </ul>
          <Link to="/admin/members" className="mt-3 inline-block text-sm text-emerald-600 hover:underline">ดูสมาชิกทั้งหมด</Link>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;