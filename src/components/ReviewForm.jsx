import { useState } from 'react';

// ฟอร์มรีวิว state 3 ตัว (review, error, status) เหมือนเดิม
// ที่เปลี่ยน: ไม่จำลอง server เองแล้ว รับฟังก์ชัน onSubmit(text) จากแม่ ซึ่งจะไปยิง POST จริง
function ReviewForm({ movieTitle, onSubmit }) {
  const [review, setReview] = useState('');
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('typing');   // 'typing' | 'submitting' | 'success'

  if (status === 'success') {
    return <p className="rounded-lg bg-emerald-50 p-4 text-emerald-700">ขอบคุณสำหรับรีวิว {movieTitle} 🎉</p>;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setError(null);
    try {
      await onSubmit(review);                      // แม่เป็นคนรู้ว่าจะส่งไปที่ไหน ฟอร์มไม่ต้องรู้
      setStatus('success');
    } catch (err) {
      setStatus('typing');
      setError(err);                               // ข้อความ 400 / 401 / 409 จาก server
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="font-medium text-slate-900">เขียนรีวิว {movieTitle}</h3>
      <textarea value={review} onChange={(e) => setReview(e.target.value)}
                disabled={status === 'submitting'} rows={3}
                placeholder="ดูแล้วรู้สึกอย่างไร (อย่างน้อย 10 ตัวอักษร)"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50" />
      <div className="flex items-center gap-3">
        <button type="submit"
                disabled={review.trim().length === 0 || status === 'submitting'}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:bg-slate-300">
          {status === 'submitting' ? 'กำลังส่ง...' : 'ส่งรีวิว'}
        </button>
        {error && <p className="text-sm text-red-600">{error.message}</p>}
      </div>
    </form>
  );
}

export default ReviewForm;
