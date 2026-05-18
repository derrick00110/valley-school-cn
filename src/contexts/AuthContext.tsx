// ===================== 认证上下文（API 版） =====================
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getCollection } from '../api';
import type { Teacher } from '../types';

interface AuthUser {
  uid: string;
  role: 'teacher' | 'manager';
  teacherId?: string;
  teacherName?: string;
  storeId?: string;
  isManager?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  authError: string;
  teachers: Teacher[];
  loginAsTeacher: (teacherId: string) => void;
  loginAsManager: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [authError, setAuthError] = useState('');
  const [sessionUser, setSessionUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('valley_session');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // 加载老师列表
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const list = await getCollection('teachers');
        if (!cancelled) {
          setTeachers(list);
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          setAuthError('无法连接服务器: ' + e.message);
          setLoading(false);
        }
      }
    };
    load();
    // 每 5 秒刷新老师列表
    const timer = setInterval(load, 5000);
    return () => { cancelled = true; clearInterval(timer); };
  }, []);

  const loginAsTeacher = (teacherId: string) => {
    const t = teachers.find(t => t.id === teacherId);
    if (!t) return;
    const u: AuthUser = {
      uid: t.id,
      role: 'teacher',
      teacherId: t.id,
      teacherName: t.name,
      storeId: t.storeId,
      isManager: false,
    };
    setSessionUser(u);
    localStorage.setItem('valley_session', JSON.stringify(u));
  };

  const loginAsManager = (password: string): boolean => {
    if (password !== 'sgyyzhou') return false;
    const u: AuthUser = { uid: 'manager', role: 'manager', isManager: true };
    setSessionUser(u);
    localStorage.setItem('valley_session', JSON.stringify(u));
    return true;
  };

  const logout = () => {
    setSessionUser(null);
    localStorage.removeItem('valley_session');
  };

  return (
    <AuthContext.Provider value={{ user: sessionUser, loading, authError, teachers, loginAsTeacher, loginAsManager, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
