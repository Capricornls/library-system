import { createContext, useContext, useState } from 'react';
import { api } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  async function login(membership_id, password) {
    const loggedIn = await api.post('/auth/login', { membership_id, password });
    localStorage.setItem('user', JSON.stringify(loggedIn));
    setUser(loggedIn);
  }

  function logout() {
    localStorage.removeItem('user');
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
