function Footer() {
  return (
    <footer className="mt-16 border-t border-emerald-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between md:px-6">
        <p>MovieHub โปรเจกต์ประกอบวิชา 520 341 คณะวิทยาศาสตร์ มหาวิทยาลัยศิลปากร</p>
        <p className="text-xs">
          ข้อมูลจาก <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" className="text-emerald-600 underline">TMDB</a>
          {' '}This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
