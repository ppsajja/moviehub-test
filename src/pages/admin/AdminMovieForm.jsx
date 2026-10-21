import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getAdminMovie, getGenres, createMovie, updateMovie, deleteMovie } from '../../api/backend';
import { ErrorBox, Loading, ConfirmBox, btnPrimary, btnDanger, inputClass } from '../../components/admin/AdminStates';

// ฟอร์มเดียวใช้ 2 โหมด: ไม่มี :id = เพิ่มหนังใหม่, มี :id = แก้ไข (โหลดค่าเดิมมาใส่ก่อน)
// ฟอร์มเช็กข้อมูลชั้นแรกให้ผู้ใช้เห็นเร็ว แต่ Go เช็กซ้ำทุกครั้ง เพราะฟอร์มนี้ข้ามได้ด้วย curl

const EMPTY = {
  id: '',                 // เว้นว่าง = ให้ระบบออกเลขเอง (เริ่มที่ 9000000) หรือใส่เลข TMDB ของเรื่องนั้น
  title: '', titleTh: '', originalTitle: '', originalLanguage: 'en',
  overview: '', overviewTh: '', posterPath: '', releaseDate: '', genreId: '',
};

// ตรวจชั้นแรกในเบราว์เซอร์ (กติกาเดียวกับ validateMovie ใน Go)
function validate(f) {
  const errs = {};
  if (!f.title.trim()) errs.title = 'ต้องมีชื่อเรื่อง';
  if (f.originalLanguage && f.originalLanguage.trim().length !== 2) errs.originalLanguage = 'รหัสภาษาต้อง 2 ตัวอักษร เช่น en, th, ja';
  if (f.posterPath && !/^(\/|https?:\/\/)/.test(f.posterPath.trim())) errs.posterPath = 'ต้องขึ้นต้นด้วย / (path ของ TMDB) หรือ https://';
  if (f.releaseDate && !/^\d{4}-\d{2}-\d{2}$/.test(f.releaseDate)) errs.releaseDate = 'รูปแบบ YYYY-MM-DD';
  if (f.id && !/^\d+$/.test(f.id)) errs.id = 'ต้องเป็นตัวเลข';
  return errs;
}

// แปลงค่าจากฟอร์ม (string ทั้งหมด) เป็น JSON ที่ Go ต้องการ (ว่าง = null, genreId = ตัวเลข)
function toPayload(f) {
  const nz = (s) => (s && s.trim() ? s.trim() : null);
  return {
    title: f.title.trim(),
    titleTh: nz(f.titleTh),
    originalTitle: f.originalTitle.trim(),
    originalLanguage: f.originalLanguage.trim() || 'en',
    overview: nz(f.overview),
    overviewTh: nz(f.overviewTh),
    posterPath: nz(f.posterPath),
    releaseDate: nz(f.releaseDate),
    genreId: f.genreId ? Number(f.genreId) : null,
  };
}

function AdminMovieForm() {
  const { id } = useParams();                       // undefined = โหมดเพิ่ม
  const isEdit = Boolean(id);
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [genres, setGenres] = useState([]);
  const [impact, setImpact] = useState(null);       // จำนวนรีวิว/โหวต/wishlist ที่จะหายถ้าลบ
  const [status, setStatus] = useState('loading');  // 'loading' | 'ready' | 'error'
  const [loadError, setLoadError] = useState(null);
  const [errors, setErrors] = useState({});         // error รายช่องจากการเช็กในเบราว์เซอร์
  const [serverError, setServerError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // โหลด dropdown แนวหนัง และ (โหมดแก้ไข) ค่าเดิมของหนัง พร้อมกัน
  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const [gs, movie] = await Promise.all([getGenres(), isEdit ? getAdminMovie(id, token) : null]);
        if (ignore) return;
        setGenres(gs);
        if (movie) {
          setForm({
            id: String(movie.id),
            title: movie.title ?? '', titleTh: movie.titleTh ?? '',
            originalTitle: movie.originalTitle ?? '', originalLanguage: movie.originalLanguage ?? 'en',
            overview: movie.overview ?? '', overviewTh: movie.overviewTh ?? '',
            posterPath: movie.posterPath ?? '', releaseDate: movie.releaseDate ?? '',
            genreId: movie.genreId != null ? String(movie.genreId) : '',
          });
          setImpact(movie.impact);
        }
        setStatus('ready');
      } catch (err) {
        if (!ignore) { setLoadError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [id, isEdit, token]);

  // ช่องเดียวเปลี่ยน ก็สร้าง object ใหม่ที่ก็อปของเดิมแล้วทับช่องนั้น (ไม่แก้ state ตรง ๆ)
  function set(field) {
    return (e) => {
      setForm({ ...form, [field]: e.target.value });
      setSaved(false);
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;      // ยังไม่ยิง server ถ้าชั้นแรกไม่ผ่าน

    setSaving(true);
    setServerError(null);
    try {
      if (isEdit) {
        const m = await updateMovie(id, toPayload(form), token);
        setImpact(m.impact);
        setSaved(true);
      } else {
        const payload = { ...toPayload(form), id: form.id ? Number(form.id) : 0 };
        const m = await createMovie(payload, token);
        navigate(`/admin/movies/${m.id}`, { replace: true });   // เพิ่มเสร็จ ไปต่อที่หน้าแก้ไขของเรื่องนั้น
      }
    } catch (err) {
      setServerError(err.message);                 // 400 ช่องไหนผิด / 409 เลขซ้ำ ข้อความมาจาก Go
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteMovie(id, token);
      navigate('/admin/movies', { replace: true });
    } catch (err) {
      setServerError(err.message);
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  }

  if (status === 'loading') return <Loading />;
  if (status === 'error') return <ErrorBox error={loadError} />;

  const posterPreview = form.posterPath.trim()
    ? (form.posterPath.startsWith('http') ? form.posterPath : 'https://image.tmdb.org/t/p/w300' + form.posterPath)
    : null;
  const label = 'block text-sm font-medium text-slate-700';
  const fieldErr = (k) => errors[k] && <p className="mt-1 text-xs text-red-600">{errors[k]}</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{isEdit ? `แก้ไขหนัง #${id}` : 'เพิ่มหนังใหม่'}</h2>
        <Link to="/admin/movies" className="text-sm text-emerald-600 hover:underline">กลับรายการ</Link>
      </div>

      <form onSubmit={handleSubmit} noValidate className="grid gap-6 md:grid-cols-[1fr_200px]">
        <div className="space-y-4 rounded-xl border border-emerald-100 bg-white p-5">
          {!isEdit && (
            <div>
              <label className={label}>เลขหนัง (ไม่บังคับ)</label>
              <input value={form.id} onChange={set('id')} placeholder="เว้นว่างให้ระบบออกเลข หรือใส่เลข TMDB" className={inputClass} />
              {fieldErr('id')}
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={label}>ชื่อเรื่อง *</label>
              <input value={form.title} onChange={set('title')} className={inputClass} />
              {fieldErr('title')}
            </div>
            <div>
              <label className={label}>ชื่อไทย</label>
              <input value={form.titleTh} onChange={set('titleTh')} className={inputClass} />
            </div>
            <div>
              <label className={label}>ชื่อภาษาต้นฉบับ</label>
              <input value={form.originalTitle} onChange={set('originalTitle')} placeholder="เว้นว่าง = ใช้ชื่อเรื่อง" className={inputClass} />
            </div>
            <div>
              <label className={label}>ภาษาต้นฉบับ (2 ตัวอักษร)</label>
              <input value={form.originalLanguage} onChange={set('originalLanguage')} maxLength={2} className={inputClass} />
              {fieldErr('originalLanguage')}
            </div>
            <div>
              <label className={label}>แนวหลัก</label>
              <select value={form.genreId} onChange={set('genreId')} className={inputClass}>
                <option value="">ไม่ระบุ</option>
                {genres.map(g => <option key={g.id} value={g.id}>{g.nameTh ?? g.nameEn} ({g.nameEn})</option>)}
              </select>
            </div>
            <div>
              <label className={label}>วันฉาย</label>
              <input type="date" value={form.releaseDate} onChange={set('releaseDate')} className={inputClass} />
              {fieldErr('releaseDate')}
            </div>
          </div>
          <div>
            <label className={label}>โปสเตอร์ (path ของ TMDB เช่น /abc.jpg หรือ URL เต็ม)</label>
            <input value={form.posterPath} onChange={set('posterPath')} className={inputClass} />
            {fieldErr('posterPath')}
          </div>
          <div>
            <label className={label}>เรื่องย่อภาษาไทย</label>
            <textarea value={form.overviewTh} onChange={set('overviewTh')} rows={4} className={inputClass} />
          </div>
          <div>
            <label className={label}>เรื่องย่อภาษาอังกฤษ</label>
            <textarea value={form.overview} onChange={set('overview')} rows={3} className={inputClass} />
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
            <button type="submit" disabled={saving} className={btnPrimary}>
              {saving ? 'กำลังบันทึก...' : isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มหนัง'}
            </button>
            {isEdit && (
              <button type="button" onClick={() => setConfirmDelete(true)} className={btnDanger}>ลบหนังเรื่องนี้</button>
            )}
            {saved && <span className="text-sm text-emerald-600">บันทึกแล้ว</span>}
            {serverError && <span className="text-sm text-red-600">{serverError}</span>}
          </div>
        </div>

        <aside className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-emerald-100 bg-white">
            {posterPreview
              ? <img src={posterPreview} alt="ตัวอย่างโปสเตอร์" className="aspect-[2/3] w-full object-cover" />
              : <div className="grid aspect-[2/3] place-items-center bg-slate-100 text-4xl">🎬</div>}
            <p className="p-2 text-center text-xs text-slate-400">ตัวอย่างโปสเตอร์</p>
          </div>
          {impact && (
            <div className="rounded-xl border border-emerald-100 bg-white p-3 text-sm text-slate-600">
              <p className="font-medium text-slate-900">ข้อมูลที่ผูกกับเรื่องนี้</p>
              <ul className="mt-1 space-y-0.5">
                <li>รีวิว {impact.reviews}</li>
                <li>โหวต {impact.votes}</li>
                <li>อยากดู {impact.wishlist}</li>
              </ul>
            </div>
          )}
        </aside>
      </form>

      <ConfirmBox open={confirmDelete} title={`ลบ "${form.title}" ?`} confirmText="ลบถาวร"
                  busy={deleting} onConfirm={handleDelete} onCancel={() => setConfirmDelete(false)}>
        {impact && (impact.reviews + impact.votes + impact.wishlist > 0) ? (
          <p>รีวิว {impact.reviews} รายการ โหวต {impact.votes} รายการ และรายการอยากดู {impact.wishlist} รายการของสมาชิกจะถูกลบตามไปด้วย ย้อนกลับไม่ได้</p>
        ) : (
          <p>ยังไม่มีสมาชิกคนไหนรีวิว โหวต หรือเพิ่มเรื่องนี้ในรายการอยากดู ลบได้โดยไม่กระทบใคร</p>
        )}
      </ConfirmBox>
    </div>
  );
}

export default AdminMovieForm;