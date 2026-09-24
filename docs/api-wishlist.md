# API ที่หน้าเว็บของทีมต้องใช้ (ส่งให้ทีม Go)

ทีม: ______________________  หน้าเว็บ: ______________________

กติกา: ทุก endpoint ตอบเป็น JSON, ใส่ prefix `/api`, ใช้ชื่อ field แบบ camelCase เหมือน data.js ของหน้าเว็บ

| # | Method | Path | ใช้ทำอะไร (หน้าไหน) | ตัวอย่าง response |
|---|--------|------|----------------------|-------------------|
| 1 | GET | /api/movies | รายการหนังหน้า Movies | ดูด้านล่าง |
| 2 | GET | /api/movies/{id} | รายละเอียดหน้า MovieDetail | |
| 3 | GET | /api/movies?q=คำค้น | ค้นหา | |
| 4 | POST | /api/movies/{id}/reviews | ส่งรีวิวจาก ReviewForm | |
| 5 | | | | |

## ตัวอย่าง JSON ต่อ endpoint

### GET /api/movies

```json
{
  "results": [
    {
      "id": 969681,
      "title": "Spider-Man: Brand New Day",
      "titleTh": "สไปเดอร์-แมน: แบรนด์ นิว เดย์",
      "genre": "Science Fiction",
      "year": 2026,
      "rating": 7.9,
      "poster": "https://image.tmdb.org/t/p/w342/xxxx.jpg"
    }
  ]
}
```

### POST /api/movies/{id}/reviews (body ที่หน้าเว็บส่ง)

```json
{ "text": "สนุกมาก ฉากแอ็กชันดีกว่าภาคก่อน" }
```

ตอบกลับ 201 พร้อม `{ "id": 1, "text": "...", "createdAt": "2026-09-24T10:00:00Z" }`
ถ้า text สั้นกว่า 10 ตัวอักษร ตอบ 400 พร้อม `{ "error": "รีวิวสั้นเกินไป" }`

## เรื่องที่ต้องตกลงกัน

- CORS: ตอนพัฒนา หน้าเว็บอยู่ที่ http://localhost:3000 และโดเมน Vercel ของทีม ขอให้ backend อนุญาต 2 origin นี้
- Error: ทุก error ตอบ JSON รูปแบบเดียวกัน `{ "error": "ข้อความ" }`
- id ใช้เลขของ TMDB หรือเลขของเราเอง? (เลือก 1 อย่างแล้วใช้ให้เหมือนกันทุก endpoint)
