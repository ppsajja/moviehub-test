// จำผลลัพธ์ไว้ในเครื่อง (localStorage) วันละครั้ง จะได้ไม่ยิง API ทุกครั้งที่เปิดหน้า
// localStorage เก็บได้แค่ข้อความ จึงต้องแปลง object เป็น JSON ตอนเก็บ และแปลงกลับตอนอ่าน

function today() {
  return new Date().toISOString().slice(0, 10);   // เช่น '2026-09-24'
}

// onceADay('ชื่อกล่อง', ฟังก์ชันโหลดจริง)
// ถ้าในกล่องมีของที่เก็บไว้ "วันนี้" ให้คืนของนั้นทันที ไม่งั้นค่อยโหลดจริงแล้วเก็บไว้ให้ครั้งหน้า
export async function onceADay(key, fetcher) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved && saved.date === today()) {
      return saved.items;                          // ของวันนี้ยังอยู่ ใช้เลย (0 request)
    }
  } catch (err) {
    // อ่านไม่ได้หรือข้อมูลเสีย ไม่เป็นไร ไปโหลดใหม่ด้านล่าง
  }

  const items = await fetcher();                   // โหลดจริง 1 ครั้ง
  localStorage.setItem(key, JSON.stringify({ date: today(), items }));
  return items;
}

// ลบของในกล่องทิ้ง ครั้งหน้าจะโหลดใหม่ (ใช้กับปุ่ม "ลองใหม่")
export function forget(key) {
  localStorage.removeItem(key);
}
