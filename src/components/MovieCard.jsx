import { Link } from 'react-router-dom';

// การ์ดหนัง 1 ใบ รับ object รูปร่างเดียวกับ data.js: { id, title, titleTh, year, genre, rating, poster }
function MovieCard({ movie }) {
  return (
    <Link to={`/movies/${movie.id}`}
          className="group block overflow-hidden rounded-xl border border-emerald-100 bg-white transition hover:border-emerald-300 hover:shadow-md">
      {movie.poster ? (
        <img src={movie.poster} alt={`โปสเตอร์ ${movie.title}`} loading="lazy"
             className="aspect-[2/3] w-full object-cover" />
      ) : (
        <div className="grid aspect-[2/3] w-full place-items-center bg-slate-100 text-4xl">🎬</div>
      )}
      <div className="p-3">
        <h3 className="truncate font-medium text-slate-900" title={movie.title}>{movie.title}</h3>
        {movie.titleTh && <p className="truncate text-sm text-slate-500">{movie.titleTh}</p>}
        <p className="mt-1 text-xs text-slate-400">
          {movie.year ?? 'ไม่ระบุปี'}{movie.rating != null && ` | ⭐ ${movie.rating}`}
        </p>
      </div>
    </Link>
  );
}

export default MovieCard;
