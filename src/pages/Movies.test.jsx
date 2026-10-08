import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Movies from './Movies';
import { getMovies } from '../api/backend';

// แทนทั้งไฟล์ backend.js ด้วยของปลอม: ทุกฟังก์ชันกลายเป็น jest.fn() ที่เรากำหนดคำตอบได้
jest.mock('../api/backend');

const FAKE_MOVIES = [
  { id: 1, title: 'Parasite', titleTh: 'ชนชั้นปรสิต', genre: 'Thriller', year: 2019, rating: 8.5, poster: null },
  { id: 2, title: 'Your Name', titleTh: 'หลับตาฝัน ถึงชื่อเธอ', genre: 'Animation', year: 2016, rating: 8.4, poster: null },
  { id: 3, title: 'Parasite 2', titleTh: null, genre: 'Thriller', year: 2026, rating: null, poster: null },
];

function renderMovies() {
  return render(<MemoryRouter><Movies /></MemoryRouter>);   // มี Link ข้างใน ต้องมี Router ครอบ
}

test('โหลดสำเร็จ ต้องเห็นการ์ดครบและปุ่มแนวหนังที่สร้างจากข้อมูล', async () => {
  getMovies.mockResolvedValue(FAKE_MOVIES);
  renderMovies();

  expect(await screen.findByText('Parasite')).toBeInTheDocument();   // findBy = รอจน useEffect โหลดเสร็จ
  expect(screen.getAllByRole('link')).toHaveLength(3);
  expect(screen.getByRole('button', { name: 'Thriller' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Animation' })).toBeInTheDocument();
});

test('พิมพ์ค้นหา ต้องกรองในเครื่องโดยไม่เรียก backend ซ้ำ', async () => {
  const user = userEvent.setup();
  getMovies.mockResolvedValue(FAKE_MOVIES);
  renderMovies();
  await screen.findByText('Parasite');

  await user.type(screen.getByPlaceholderText(/พิมพ์ชื่อหนัง/), 'your');

  expect(screen.getAllByRole('link')).toHaveLength(1);
  expect(screen.getByText('Your Name')).toBeInTheDocument();
  expect(getMovies).toHaveBeenCalledTimes(1);          // ยังเรียกแค่ตอนโหลดครั้งแรก
});

test('backend ล่ม ต้องเห็นข้อความ error และปุ่มลองใหม่ที่โหลดอีกครั้งได้', async () => {
  const user = userEvent.setup();
  getMovies
    .mockRejectedValueOnce(new Error('server ไม่ได้ตอบเป็น JSON'))   // ครั้งแรกพัง
    .mockResolvedValueOnce(FAKE_MOVIES);                             // ครั้งที่สองสำเร็จ
  renderMovies();

  expect(await screen.findByText('โหลดข้อมูลไม่สำเร็จ')).toBeInTheDocument();
  expect(screen.getByText('server ไม่ได้ตอบเป็น JSON')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'ลองใหม่' }));

  expect(await screen.findByText('Parasite')).toBeInTheDocument();
  expect(getMovies).toHaveBeenCalledTimes(2);
});