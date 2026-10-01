# Week 9 add-on: ต่อ Backend (จำลอง) สมาชิก รีวิว คะแนน wishlist

วางทับลงใน repo MovieHub ของตัวเอง (ที่ทำ Week 8 เสร็จแล้ว) จากโฟลเดอร์รากของโปรเจกต์

```bash
# 1. ใน terminal ของ Codespaces (ที่โฟลเดอร์รากของโปรเจกต์) ดึงโค้ดชุดนี้เข้ามา
curl -L -o week9-addon.zip https://plearnjai.com/fe2026/week9-addon.zip
unzip -o week9-addon.zip
cp -r week9-addon/. .
rm -rf week9-addon week9-addon.zip
#    (ไฟล์เดิมที่ชื่อซ้ำจะถูกแทนที่: App.jsx, Navbar.jsx, ReviewForm.jsx, MovieDetail.jsx, package.json, .env.example)
# 2. ติดตั้ง express ที่เพิ่มเข้ามา
npm install
# 3. เปิด terminal ที่ 2 แล้วรัน backend จำลอง (พอร์ต 4000)
npm run mock
# 4. terminal ที่ 1 รันหน้าเว็บตามปกติ
npm start
```

บัญชีทดลองของ backend จำลอง: `demo@moviehub.test` / `1234` (ข้อมูลทั้งหมดอยู่ในหน่วยความจำ ปิด mock แล้วหาย)

## ไฟล์ที่เพิ่ม / แทนที่

| ไฟล์ | สถานะ | มีอะไร |
|---|---|---|
| `docs/db-schema.md` | ใหม่ | สัญญาที่ตกลงกับทีม Go: ตารางฐานข้อมูล, endpoint, status code |
| `mock/server.js`, `mock/movies.json` | ใหม่ | backend จำลองตามสัญญาใน docs/db-schema.md ครบทุก endpoint + หนัง 100 เรื่องชุดเดียวกับ seed.sql |
| `src/api/backend.js` | ใหม่ มี TODO ขั้นที่ 1 | ชั้นกลางคุยกับ backend ของทีม: `apiFetch` + ฟังก์ชันทุก endpoint |
| `src/auth/AuthContext.jsx` | ใหม่ (อ่าน) | สถานะ login ของทั้งแอป (Context) + `useAuth()` |
| `src/components/ProtectedRoute.jsx` | ใหม่ (อ่าน) | ครอบหน้าที่ต้อง login |
| `src/pages/Login.jsx` | ใหม่ มี TODO ขั้นที่ 2 | ฟอร์มเข้าสู่ระบบ |
| `src/pages/Register.jsx` | ใหม่ (อ่าน) | ฟอร์มสมัคร โครงเดียวกับ Login |
| `src/pages/MovieDetail.jsx` | แทนที่ มี TODO ขั้นที่ 3 | โหลดรีวิวจาก backend + ส่งรีวิวจริง |
| `src/components/ReviewForm.jsx` | แทนที่ | เลิกจำลอง server รับ `onSubmit` จากแม่ |
| `src/components/ReviewList.jsx`, `MovieActions.jsx` | ใหม่ (MovieActions มี TODO ขั้นที่ 5) | รายการรีวิว / ปุ่มให้คะแนนและ wishlist |
| `src/pages/Wishlist.jsx` | ใหม่ มี TODO ขั้นที่ 4 | หน้า /me/wishlist |
| `src/components/Navbar.jsx`, `src/App.jsx` | แทนที่ | เมนู login/logout, เส้นทางใหม่, AuthProvider ครอบแอป |
| `package.json` | แทนที่ | เพิ่ม `proxy`, สคริปต์ `mock`, devDependencies express + cors |
| `.env.example` | แทนที่ | เพิ่ม `REACT_APP_API_URL` (ว่าง = ใช้ mock) |

ถ้าเคยแก้ `package.json` เองไว้ ไม่ต้องวางทับ ให้เพิ่ม 3 จุดนี้แทน

```json
"proxy": "http://localhost:4000",
"scripts": { "mock": "node mock/server.js" },
"devDependencies": { "express": "^4.21.2", "cors": "^2.8.5" }
```

## 5 ขั้นของวันนี้ (ค้นคำว่า TODO ขั้นที่)

| ขั้น | ไฟล์ | ทำอะไร |
|---|---|---|
| 1 | `src/api/backend.js` | เขียน `apiFetch`: headers JSON + Authorization, body JSON.stringify, อ่าน error จาก server |
| 2 | `src/pages/Login.jsx` | เรียก `login()` จาก useAuth แล้ว navigate |
| 3 | `src/pages/MovieDetail.jsx` | โหลดรีวิวด้วย `getReviews` และส่งด้วย `postReview` |
| 4 (Lab) | `src/pages/Wishlist.jsx` | โหลด `getWishlist(token)` แสดงด้วย MovieGrid เดิม |
| 5 (Lab) | `src/components/MovieActions.jsx` | `putVote`, `addToWishlist`, `removeFromWishlist` |

## บน Vercel

เว็บบน Vercel ยังไม่มี backend ให้ยิง (mock รันในเครื่องเท่านั้น) หน้า Login จึงขึ้นข้อความ "server ไม่ได้ตอบเป็น JSON (backend ยังไม่พร้อม?)" เป็นเรื่องปกติของสัปดาห์นี้
เมื่อทีม Go deploy แล้ว ตั้ง Environment Variable `REACT_APP_API_URL` เป็น URL ของ Go แล้ว Redeploy ทุกอย่างจะทำงานโดยไม่ต้องแก้โค้ด
