import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="px-4 py-24 text-center">
      <p className="text-5xl font-semibold text-slate-300">404</p>
      <p className="mt-2 text-slate-500">ไม่พบหน้าที่คุณกำลังหา</p>
      <Link to="/" className="mt-4 inline-block text-sm text-emerald-600 hover:underline">กลับหน้าแรก</Link>
    </div>
  );
}

export default NotFound;
