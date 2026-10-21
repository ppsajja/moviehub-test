// ชิ้นส่วนเล็ก ๆ ที่ทุกหน้าหลังบ้านใช้ซ้ำ: กล่อง error, ข้อความกำลังโหลด, ปุ่ม, กล่องยืนยัน

export function ErrorBox({ error, onRetry }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="font-medium text-red-700">โหลดข้อมูลไม่สำเร็จ</p>
      <p className="mt-1 text-sm text-red-500">{error?.message}</p>
      {onRetry && (
        <button onClick={onRetry}
                className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm text-red-700 hover:bg-red-100">
          ลองใหม่
        </button>
      )}
    </div>
  );
}

export function Loading({ text = 'กำลังโหลด...' }) {
  return <p className="py-12 text-center text-slate-400">{text}</p>;
}

export const btnPrimary =
  'rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:bg-slate-300';
export const btnGhost =
  'rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:text-slate-300';
export const btnDanger =
  'rounded-lg border border-red-300 bg-white px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:text-slate-300';
export const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100';

// กล่องยืนยันก่อนทำสิ่งที่ย้อนกลับไม่ได้ (ลบ, เปลี่ยนสิทธิ์) ใช้ <dialog> ของเบราว์เซอร์ ไม่ต้องลงไลบรารี
export function ConfirmBox({ open, title, children, confirmText = 'ยืนยัน', busy, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <div className="mt-2 text-sm text-slate-600">{children}</div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} disabled={busy} className={btnGhost}>ยกเลิก</button>
          <button onClick={onConfirm} disabled={busy} className={btnDanger}>
            {busy ? 'กำลังทำ...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}