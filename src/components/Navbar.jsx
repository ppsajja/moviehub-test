import { NavLink, Link } from 'react-router-dom';

const linkClass = ({ isActive }) =>
  'text-sm transition ' + (isActive ? 'font-medium text-emerald-600' : 'text-slate-500 hover:text-emerald-600');

function Navbar() {
  return (
    <header className="border-b border-emerald-100 bg-white">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4 md:px-6">
        <Link to="/" className="text-lg font-semibold tracking-tight text-emerald-600">
          🎬 MovieHub
        </Link>
        <div className="flex items-center gap-5">
          <NavLink to="/" end className={linkClass}>หน้าแรก</NavLink>
          <NavLink to="/movies" className={linkClass}>หนัง</NavLink>
          <NavLink to="/lab" className={linkClass}>API Lab</NavLink>
          <NavLink to="/about" className={linkClass}>เกี่ยวกับ</NavLink>
        </div>
        <span className="ml-auto hidden text-xs text-slate-400 md:block">520 341 Client Side Web Programming</span>
      </nav>
    </header>
  );
}

export default Navbar;
