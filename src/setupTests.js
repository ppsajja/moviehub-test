// รันก่อนทุกไฟล์เทสต์ (CRA หาไฟล์ชื่อนี้เอง)
// เพิ่ม matcher อ่านง่ายให้ expect เช่น toBeInTheDocument(), toBeDisabled(), toHaveTextContent()
import '@testing-library/jest-dom';

// react-router 6 พิมพ์คำเตือนเรื่องเวอร์ชัน 7 ทุกครั้งที่สร้าง Router ในเทสต์ ไม่ใช่ความผิดของโค้ดเรา ปิดเฉพาะข้อความนั้น
const realWarn = console.warn;
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation((msg, ...rest) => {
    if (String(msg).includes('React Router Future Flag Warning')) return;
    realWarn(msg, ...rest);
  });
});