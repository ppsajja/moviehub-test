import { createContext, useContext, useState } from 'react';
import * as api from '../api/backend';

// Context = "กล่องกลาง" ที่ component ไหนในแอปก็เอื้อมมาหยิบได้ ไม่ต้องส่ง props ต่อกันเป็นทอด ๆ
// เราใส่สถานะ login ไว้ในนี้ เพราะ Navbar, MovieDetail, Wishlist ต้องรู้เหมือนกันหมดว่าใครล็อกอินอยู่
const AuthContext = createContext(null);

const TOKEN_KEY = 'moviehub.token';
const MEMBER_KEY = 'moviehub.member';

export function AuthProvider({ children }) {
  // อ่านค่าเดิมจาก localStorage จะได้ไม่หลุด login ตอน refresh
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [member, setMember] = useState(() => JSON.parse(localStorage.getItem(MEMBER_KEY) || 'null'));

  function remember({ token, member }) {
    setToken(token);
    setMember(member);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(MEMBER_KEY, JSON.stringify(member));
  }

  async function login(email, password) {
    const data = await api.login(email, password);   // ถ้าผิด backend.js จะ throw
    remember(data);
  }

  async function register(email, password, displayName) {
    await api.register(email, password, displayName);
    await login(email, password);                    // สมัครเสร็จล็อกอินให้เลย
  }

  function logout() {
    setToken(null);
    setMember(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(MEMBER_KEY);
  }

  const value = { token, member, isLoggedIn: Boolean(token), login, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// hook สั้น ๆ ให้ทุกหน้าเรียก useAuth() แทนที่จะต้อง import Context เอง
export function useAuth() {
  return useContext(AuthContext);
}
