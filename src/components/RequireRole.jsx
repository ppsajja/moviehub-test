import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function RequireRole({ role, children }) {
  const { isLoggedIn, member } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (member?.role !== role) {
    return (
      <div className="px-4 py-24 text-center">
        <p className="text-5xl font-semibold text-slate-300">403</p>
        <p className="mt-2 text-slate-500">หน้านี้สำหรับ {role} เท่านั้น บัญชีของคุณเป็น {member?.role ?? 'member'}</p>
        <p className="mt-1 text-sm text-slate-400">ถ้าเพิ่งได้รับสิทธิ์ ให้ออกจากระบบแล้วเข้าใหม่ เพราะตั๋วใบเดิมยังเป็นบทบาทเก่า</p>
        <Link to="/" className="mt-4 inline-block text-sm text-emerald-600 hover:underline">กลับหน้าแรก</Link>
      </div>
    );
  }
  return children;
}

export default RequireRole;