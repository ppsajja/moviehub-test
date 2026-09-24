function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <h1 className="text-2xl font-semibold text-slate-900">เกี่ยวกับ MovieHub</h1>
      <p className="mt-3 leading-relaxed text-slate-600">
        โปรเจกต์ฝึกหัดในรายวิชา 520 341 Client Side Web Programming
        ใช้เรียนรู้การเรียก API ด้วย React (fetch, useEffect, การจัดการสถานะ loading / error / success)
        และการเตรียมหน้าเว็บให้พร้อมเชื่อมกับ Backend ที่เขียนด้วย Go
      </p>

      <h2 className="mt-8 font-medium text-slate-900">ทีม</h2>
      <p className="text-sm text-slate-500">แก้รายชื่อด้านล่างเป็นของทีมตัวเอง</p>
      <ul className="mt-2 list-disc pl-5 text-slate-700">
        <li>ชื่อ นามสกุล (รหัสนักศึกษา)</li>
        <li>ชื่อ นามสกุล (รหัสนักศึกษา)</li>
      </ul>

      {/* เครดิต TMDB ตามเงื่อนไขการใช้งาน: ต้องมีทั้งโลโก้และข้อความนี้ (ดาวน์โหลดโลโก้จากหน้า Logos & Attribution ของ TMDB มาวางแทนข้อความ TMDB) */}
      <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 md:flex-row md:items-center">
        <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" className="font-semibold text-emerald-600">
          TMDB
        </a>
        <p className="text-sm text-slate-500">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
          ข้อมูลหนังและโปสเตอร์ทั้งหมดมาจาก The Movie Database
        </p>
      </div>
    </div>
  );
}

export default About;
