import { createContext, useContext, useState, useEffect } from 'react';
import { getToken, decodeToken, removeToken, saveToken } from '../utils/token';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const decoded = decodeToken(token);
      setUser({ id: decoded.user_id, username: decoded.username, role: decoded.role });
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    saveToken(token);
    const decoded = decodeToken(token);
    setUser({ id: decoded.user_id, username: decoded.username, role: decoded.role });
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);