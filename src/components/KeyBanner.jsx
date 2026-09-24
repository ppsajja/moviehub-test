// แถบเตือนเมื่อยังไม่ได้ตั้งค่า API key จะหายไปเองเมื่อ .env ถูกต้องและรัน npm start ใหม่
function KeyBanner() {
  const key = process.env.REACT_APP_TMDB_KEY;
  const looksValid = /^[a-f0-9]{32}$/i.test(key || '');   // API Key v3 ของ TMDB ยาว 32 ตัว เป็นเลขฐานสิบหก
  if (looksValid) return null;

  const message = !key
    ? <>ยังไม่พบ <code>REACT_APP_TMDB_KEY</code> เปิดไฟล์ <code>.env</code> (คัดลอกจาก .env.example) แล้วใส่ key</>
    : <>ค่าใน <code>REACT_APP_TMDB_KEY</code> ไม่เหมือน API Key v3 (ต้องยาว 32 ตัว ไม่ใช่ token ยาวที่ขึ้นต้นด้วย eyJ)</>;

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-800">
      🔑 {message} แล้วหยุดและรัน <code>npm start</code> ใหม่
    </div>
  );
}

export default KeyBanner;
