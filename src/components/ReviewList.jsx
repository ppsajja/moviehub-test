// รายการรีวิวของหนัง 1 เรื่อง รับ items รูปร่างตามสัญญา GET /api/movies/{id}/reviews
function ReviewList({ items }) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-400">ยังไม่มีรีวิว เป็นคนแรกเลย</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map(r => (
        <li key={r.id} className="rounded-lg border border-emerald-100 bg-white p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-900">{r.member.displayName}</span>
            <span className="text-slate-400">
              {r.score != null && `⭐ ${r.score}/10 | `}
              {new Date(r.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <p className="mt-2 text-slate-700">{r.text}</p>
        </li>
      ))}
    </ul>
  );
}

export default ReviewList;
