import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import ProtectedRoute from './ProtectedRoute';

// หน้าปลอม 2 หน้า พอให้รู้ว่าตอนนี้อยู่หน้าไหน
function Secret() { return <h1>หน้าลับ</h1>; }
function LoginPage() { return <h1>หน้า Login</h1>; }

// วาดแอปจิ๋ว: เริ่มที่ /me/wishlist ซึ่งครอบด้วย ProtectedRoute
function renderAt(path) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/me/wishlist" element={<ProtectedRoute><Secret /></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

beforeEach(() => localStorage.clear());   // AuthProvider อ่าน token จาก localStorage ตอนเริ่ม ต้องล้างให้สะอาดทุกเทสต์

test('ยังไม่ login ต้องถูกพาไปหน้า Login', () => {
  renderAt('/me/wishlist');

  expect(screen.getByRole('heading', { name: 'หน้า Login' })).toBeInTheDocument();
  expect(screen.queryByText('หน้าลับ')).not.toBeInTheDocument();
});

test('มี token ใน localStorage แล้ว ต้องเห็นหน้าลับ', () => {
  localStorage.setItem('moviehub.token', 'mock.1.abc');
  localStorage.setItem('moviehub.member', JSON.stringify({ id: 1, displayName: 'Demo' }));

  renderAt('/me/wishlist');

  expect(screen.getByRole('heading', { name: 'หน้าลับ' })).toBeInTheDocument();
});