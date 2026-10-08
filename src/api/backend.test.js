import { apiFetch, login, postReview } from './backend';

// ตัวช่วยสร้าง "คำตอบปลอม" ของ fetch: ใส่แค่ status กับ body ที่อยากให้ server ตอบ
function fakeResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,          // fetch ของจริงคำนวณ ok แบบนี้
    status,
    json: () => Promise.resolve(body),         // res.json() คืน Promise เสมอ
  };
}

beforeEach(() => {
  // แทน fetch ของเบราว์เซอร์ด้วยฟังก์ชันปลอมที่เราควบคุมคำตอบได้ และจดทุกครั้งที่ถูกเรียก
  global.fetch = jest.fn();
});

test('GET ธรรมดา: ไม่มี body ไม่มี Authorization และคืน object ที่แปลงแล้ว', async () => {
  fetch.mockResolvedValue(fakeResponse(200, { items: [{ id: 1 }] }));

  const data = await apiFetch('/api/movies');

  expect(data).toEqual({ items: [{ id: 1 }] });
  const [url, options] = fetch.mock.calls[0];            // อาร์กิวเมนต์ที่ apiFetch ส่งให้ fetch
  expect(url).toBe('/api/movies');
  expect(options.method).toBe('GET');
  expect(options.body).toBeUndefined();
  expect(options.headers.Authorization).toBeUndefined();
});

test('มี token ต้องแนบ Authorization แบบ Bearer และ body ต้องเป็นข้อความ JSON', async () => {
  fetch.mockResolvedValue(fakeResponse(201, { id: 7 }));

  await postReview(969681, 'สนุกมาก ฉากแอ็กชันดี', 'abc123');

  const [url, options] = fetch.mock.calls[0];
  expect(url).toBe('/api/movies/969681/reviews');
  expect(options.method).toBe('POST');
  expect(options.headers.Authorization).toBe('Bearer abc123');
  expect(options.headers['Content-Type']).toBe('application/json');
  expect(options.body).toBe(JSON.stringify({ text: 'สนุกมาก ฉากแอ็กชันดี' }));
});


test('204 คืน null โดยไม่เรียก res.json()', async () => {
  const res = fakeResponse(204, null);
  res.json = jest.fn();                                   // ถ้าถูกเรียกแปลว่าโค้ดผิด
  fetch.mockResolvedValue(res);

  const data = await apiFetch('/api/me/wishlist/1', { method: 'DELETE', token: 'abc' });

  expect(data).toBeNull();
  expect(res.json).not.toHaveBeenCalled();
});

test('ไม่ใช่ 2xx ต้องโยน Error ที่มีข้อความจาก server และเลข status', async () => {
  fetch.mockResolvedValue(fakeResponse(401, { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }));

  // ฟังก์ชัน async ที่ throw ต้องเช็กด้วย rejects
  await expect(login('a@b.c', 'wrong')).rejects.toThrow('อีเมลหรือรหัสผ่านไม่ถูกต้อง');

  // เช็กเลข status ที่แปะไว้บน Error ด้วย
  const err = await login('a@b.c', 'wrong').catch(e => e);
  expect(err.status).toBe(401);
});

test('server ตอบมาไม่ใช่ JSON (เช่น ลืมรัน mock) ต้องได้ข้อความที่เข้าใจได้ ไม่ใช่ SyntaxError', async () => {
  fetch.mockResolvedValue({ ok: false, status: 404, json: () => Promise.reject(new SyntaxError('Unexpected token <')) });

  await expect(apiFetch('/api/movies')).rejects.toThrow('server ไม่ได้ตอบเป็น JSON');
});