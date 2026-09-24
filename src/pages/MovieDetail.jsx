import { useParams, Link } from 'react-router-dom';
import ReviewForm from '../components/ReviewForm';
import { movies } from '../data/data';
// TODO ขั้นที่ 4: import { useEffect, useState } from 'react';
// TODO ขั้นที่ 4: import { getMovie } from '../api/tmdb';

function MovieDetail() {
  const { id } = useParams();                       // ได้เป็น string เสมอ

  // TODO ขั้นที่ 4: เปลี่ยนเป็น state 3 ตัว (movie, status, error) แล้วโหลดด้วย getMovie(id) ใน useEffect
  const movie = movies.find(m => m.id === Number(id));
  const status = movie ? 'success' : 'error';
  const error = movie ? null : new Error('ไม่มีเรื่องนี้ใน data.js');

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-4xl animate-pulse px-4 py-10 md:px-6">
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="aspect-[2/3] w-48 shrink-0 rounded-xl bg-slate-100" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-2/3 rounded bg-slate-100" />
            <div className="h-4 w-1/3 rounded bg-slate-100" />
            <div className="h-24 w-full rounded bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-lg text-slate-700">ไม่พบหนังเรื่องนี้ 😢</p>
        <p className="text-sm text-slate-400">{error.message}</p>
        <Link to="/movies" className="mt-6 inline-block text-sm text-emerald-600 hover:underline">กลับไปหน้าหนังทั้งหมด</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <Link to="/movies" className="text-sm text-slate-500 hover:text-emerald-600">กลับไปหน้าหนังทั้งหมด</Link>

      <div className="mt-4 flex flex-col gap-8 md:flex-row">
        {movie.poster ? (
          <img src={movie.poster} alt={`โปสเตอร์ ${movie.title}`}
               className="w-48 shrink-0 self-start rounded-xl border border-slate-200" />
        ) : (
          <div className="grid aspect-[2/3] w-48 shrink-0 place-items-center rounded-xl bg-slate-100 text-5xl">🎬</div>
        )}

        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">{movie.title}</h1>
          {movie.titleTh && <p className="mt-1 text-slate-500">{movie.titleTh}</p>}
          <p className="mt-2 text-sm text-slate-500">
            {movie.year}{movie.genre && ` | ${movie.genre}`}{movie.rating != null && ` | ⭐ ${movie.rating}`}
          </p>
          <p className="mt-4 leading-relaxed text-slate-700">{movie.detail}</p>

          <div className="mt-8 rounded-xl border border-emerald-100 bg-white p-5">
            <ReviewForm key={movie.id} movieTitle={movie.title} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;
