import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const linkClass = ({ isActive }) =>
  'text-sm transition ' + (isActive ? 'font-medium text-emerald-600' : 'text-slate-500 hover:text-emerald-600');

function Navbar() {
  const { isLoggedIn, member, logout } = useAuth();   // Navbar รู้สถานะ login ได้โดยไม่ต้องรับ props จากใคร
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="border-b border-emerald-100 bg-white">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4 md:px-6">
        <Link to="/" className="text-lg font-semibold tracking-tight text-emerald-600">
          🎬 MovieHub
        </Link>
        <div className="flex items-center gap-5">
          <NavLink to="/" end className={linkClass}>หน้าแรก</NavLink>
          <NavLink to="/movies" className={linkClass}>หนัง</NavLink>
          {isLoggedIn && <NavLink to="/me/wishlist" className={linkClass}>อยากดู</NavLink>}
          <NavLink to="/lab" className={linkClass}>API Lab</NavLink>
          <NavLink to="/about" className={linkClass}>เกี่ยวกับ</NavLink>
        </div>
        <div className="ml-auto flex items-center gap-3 text-sm">
          {isLoggedIn ? (
            <>
              <span className="text-slate-600">สวัสดี {member?.displayName}</span>
              <button onClick={handleLogout} className="text-slate-500 hover:text-emerald-600">ออกจากระบบ</button>
            </>
          ) : (
            <Link to="/login" className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-emerald-700 hover:bg-emerald-50">
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
