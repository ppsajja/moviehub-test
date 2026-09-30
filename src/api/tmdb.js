// ชั้นกลางสำหรับคุยกับ TMDB ทุกหน้าเรียกผ่านไฟล์นี้เท่านั้น (หน้าอื่นไม่ต้องรู้จัก URL หรือ key)
import { onceADay } from './cache';

const BASE = 'https://api.themoviedb.org/3';
const KEY = process.env.REACT_APP_TMDB_KEY;          // มาจากไฟล์ .env
export const IMG = 'https://image.tmdb.org/t/p/w342'; // ต้นทางรูปโปสเตอร์
export const CACHE_KEY = 'moviehub.movies.v2';       // ชื่อกล่องใน localStorage (v2: กำลังฉาย + ยอดนิยม 100 เรื่อง)
export const MOVIE_LIMIT = 100;                      // จำนวนหนังทั้งหมดที่ getMovies() คืน

// ตัวช่วยกลาง: ประกอบ URL, แนบ key, ส่ง request, เช็กผล, แปลงเป็น object
export async function getJSON(path, params = {}) {
  const url = new URL(BASE + path);
  url.searchParams.set('api_key', KEY);
  url.searchParams.set('language', 'th-TH');
  for (const [name, value] of Object.entries(params)) {
    url.searchParams.set(name, value);               // เข้ารหัสภาษาไทยและช่องว่างให้เอง
  }

  // TODO ขั้นที่ 1: ส่ง request ด้วย fetch(url) แล้วรอคำตอบ
  //   ถ้า res.ok ไม่จริง ให้ throw new Error พร้อมเลข status
  //   ถ้าจริง ให้คืน res.json() (อย่าลืมว่าเป็น Promise ต้อง await หรือ return ตรง ๆ)
  //throw new Error('ยังไม่ได้เขียนส่วน fetch ใน getJSON (ขั้นที่ 1)');
  const res = await fetch(url);                      // รอครั้งที่ 1: รอ server ตอบ
  if (!res.ok) {
    throw new Error(`TMDB ตอบกลับ ${res.status}`);   // 401 key ผิด, 404 ไม่มีของ ฯลฯ
  }
  return res.json();                                 // รอครั้งที่ 2: แปลงข้อความเป็น object
}

// แปลง JSON ของ TMDB ให้เป็นรูปร่างเดียวกับ data.js เพื่อให้ MovieCard ใช้ได้ทันที
// genreMap คือตาราง { 28: 'แอ็คชั่น', 16: 'แอนิเมชัน', ... } เพราะรายการหนังให้มาแค่รหัสแนว (genre_ids)
export function toMovie(m, genreMap = {}) {
  // TODO ขั้นที่ 2: คืน object ที่มี field เหล่านี้
  //   id, tmdbId        มาจาก m.id
  //   title             มาจาก m.title
  //   titleTh           ใส่ null ไปก่อน (TMDB ให้ชื่อมาภาษาเดียวต่อ 1 request)
  //   genre             ถ้ามี m.genres (ตอนขอรายละเอียด) ใช้ m.genres[0].name
  //                     ถ้ามีแค่ m.genre_ids (ตอนขอรายการ) ใช้ genreMap[m.genre_ids[0]]  ทั้งคู่ต้องกัน undefined
  //   year              ตัด 4 ตัวแรกของ m.release_date แล้วแปลงเป็นตัวเลข
  //   rating            m.vote_average ปัดเป็นทศนิยม 1 ตำแหน่ง
  //   detail            m.overview ถ้าว่างให้ใส่ข้อความแทน
  //   poster            IMG + m.poster_path ถ้าไม่มีให้เป็น null
  //return m;   // ชั่วคราว: ส่งกลับตามเดิม การ์ดจะขึ้นไม่ครบเพราะชื่อ field ไม่ตรง
return {
    id: m.id,
    tmdbId: m.id,
    title: m.title,
    titleTh: null,                                   // TMDB ให้ชื่อมาภาษาเดียวต่อ 1 request
    genre: m.genres?.[0]?.name ?? genreMap[m.genre_ids?.[0]] ?? null,   // รายละเอียดให้ชื่อ รายการให้รหัส
    year: m.release_date ? Number(m.release_date.slice(0, 4)) : null,
    rating: m.vote_average ? Math.round(m.vote_average * 10) / 10 : null,
    detail: m.overview || 'ยังไม่มีเรื่องย่อภาษาไทย',
    poster: m.poster_path ? IMG + m.poster_path : null,
  };
}

// ตารางแปลงรหัสแนวหนังเป็นชื่อ (โหลดครั้งเดียวต่อการเรียก getNowPlaying)
async function getGenreMap() {
  const data = await getJSON('/genre/movie/list');
  const map = {};
  for (const g of data.genres) map[g.id] = g.name;   // [{id: 28, name: 'แอ็คชั่น'}, ...] เป็น {28: 'แอ็คชั่น'}
  return map;
}

// หนังที่กำลังฉายในไทย ดึงมาหลายหน้า (TMDB ให้หน้าละ 20 เรื่อง) แล้วต่อเป็น array เดียว
export async function getNowPlaying(pages = 3, genreMap) {
  genreMap ??= await getGenreMap();                  // ส่งมาจากข้างนอกได้ จะได้ไม่โหลดซ้ำ
  const all = [];
  for (let page = 1; page <= pages; page++) {
    const data = await getJSON('/movie/now_playing', { region: 'TH', page });
    all.push(...data.results);
    if (page >= data.total_pages) break;             // มีไม่ถึง 3 หน้าก็หยุด
  }
  const unique = [...new Map(all.map(m => [m.id, m])).values()];  // กันเรื่องซ้ำข้ามหน้า
  return unique.map(m => toMovie(m, genreMap));
}

// หนังยอดนิยมในไทย ไล่ดึงทีละหน้าจนได้ครบ limit เรื่อง โดยข้ามเรื่องที่มี id อยู่ใน excludeIds
export async function getPopular(limit, excludeIds = [], genreMap) {
  genreMap ??= await getGenreMap();
  const seen = new Set(excludeIds);
  const picked = [];
  for (let page = 1; picked.length < limit; page++) {
    const data = await getJSON('/movie/popular', { region: 'TH', page });
    for (const m of data.results) {
      if (seen.has(m.id)) continue;                  // อยู่ใน now playing แล้ว หรือซ้ำข้ามหน้า
      seen.add(m.id);
      picked.push(toMovie(m, genreMap));
      if (picked.length === limit) break;
    }
    if (page >= data.total_pages) break;
  }
  return picked;
}

// กำลังฉายขึ้นก่อน แล้วเติมหนังยอดนิยมที่ไม่ซ้ำจนครบ limit เรื่อง
export async function getNowPlayingAndPopular(limit = MOVIE_LIMIT) {
  const genreMap = await getGenreMap();
  const nowPlaying = (await getNowPlaying(3, genreMap)).slice(0, limit);
  const popular = await getPopular(limit - nowPlaying.length, nowPlaying.map(m => m.id), genreMap);
  return [...nowPlaying, ...popular];
}

// "หนังทั้งหมดที่แอปใช้" โหลดจริงวันละครั้ง ที่เหลืออ่านจาก localStorage
// หน้า Movies และหน้าแรกเรียกตัวนี้ จึงแชร์ข้อมูลชุดเดียวกัน
export function getMovies() {
  return onceADay(CACHE_KEY, () => getNowPlayingAndPopular());
}

// ค้นหาที่ server (ใช้ในหน้า API Lab เพื่อดู JSON ดิบ หน้า Movies กรองในเครื่องแทน)
export async function searchMovies(query) {
  const data = await getJSON('/search/movie', { query });
  return data.results.map(toMovie);
}

// รายละเอียดเรื่องเดียว (ได้ genres เป็นชื่อมาเลย ไม่ต้องใช้ genreMap)
export async function getMovie(id) {
  const data = await getJSON(`/movie/${id}`);
  return toMovie(data);
}
