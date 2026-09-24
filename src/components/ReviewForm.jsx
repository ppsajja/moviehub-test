import { useState } from 'react';

// ฟอร์มรีวิว state 3 ตัว (review, error, status) ตามสูตรออกแบบ state ที่เรียนไปแล้ว
function ReviewForm({ movieTitle }) {
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
      await submitReview(review);   // วันนี้ยังจำลอง server ไว้ สัปดาห์หน้าเปลี่ยนเป็น fetch ไป backend ของทีม
      setStatus('success');
    } catch (err) {
      setStatus('typing');
      setError(err);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="font-medium text-slate-900">เขียนรีวิว {movieTitle}</h3>
      <textarea value={review} onChange={(e) => setReview(e.target.value)}
                disabled={status === 'submitting'} rows={3}
                placeholder="ดูแล้วรู้สึกอย่างไร..."
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

// จำลอง server: รอ 1.5 วินาที ถ้าสั้นกว่า 10 ตัวอักษรให้ตอบกลับเป็น error
function submitReview(text) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (text.trim().length < 10) reject(new Error('รีวิวสั้นเกินไป ลองเขียนอีกนิด'));
      else resolve();
    }, 1500);
  });
}

export default ReviewForm;
