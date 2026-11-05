import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);
const localKey = 'sahayak-session';
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem(localKey))?.user || null; } catch { return null; } });
  const [role, setRole] = useState(() => { try { return JSON.parse(localStorage.getItem(localKey))?.role || 'citizen'; } catch { return 'citizen'; } });
  useEffect(() => {
    if (!supabase) return undefined;
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    return () => listener.subscription.unsubscribe();
  }, []);
  const persist = (nextUser, nextRole) => { setUser(nextUser); setRole(nextRole); localStorage.setItem(localKey, JSON.stringify({ user: nextUser, role: nextRole })); };
  const login = async ({ email, password, selectedRole }) => {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      persist(data.user, selectedRole || 'citizen');
      return data.user;
    }
    const officer = (email === 'officer@gov.in' || email === 'clerk@gov.in') && password === 'gov123';
    if ((selectedRole === 'officer' && !officer) || (selectedRole !== 'officer' && password.length < 1)) throw new Error('Invalid email or password');
    const next = { id: officer ? `officer-${email}` : `citizen-${email}`, email, name: officer ? 'Demo Officer' : email.split('@')[0] };
    persist(next, officer ? 'officer' : 'citizen'); return next;
  };
  const register = async ({ email, password, name, mobile }) => {
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name, mobile, role: 'citizen' } } });
      if (error) throw error;
      persist(data.user, 'citizen'); return data.user;
    }
    if (password.length < 8) throw new Error('Password must be at least 8 characters');
    const next = { id: `citizen-${email}`, email, name, mobile };
    persist(next, 'citizen'); return next;
  };
  const logout = async () => { if (supabase) await supabase.auth.signOut(); localStorage.removeItem(localKey); setUser(null); };
  return <AuthContext.Provider value={{ user, role, login, register, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
