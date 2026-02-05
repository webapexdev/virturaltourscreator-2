import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          // Invalid JSON, clear it
          localStorage.removeItem('user');
        }
      }
      
      // Try to verify with server, but don't fail if not authenticated
      try {
        const response = await authApi.me();
        if (response && response.user) {
          // Only set user if they are verified
          if (response.user.isVerified) {
            setUser(response.user);
            localStorage.setItem('user', JSON.stringify(response.user));
          } else {
            // User is not verified, clear stored user and redirect to login
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      } catch (error: any) {
        // Not authenticated or not verified, clear stored user
        if (error.response?.status === 401 || error.response?.status === 403) {
          // Clear invalid stored user
          localStorage.removeItem('user');
          setUser(null);
        } else {
          // Network or other error - keep stored user if exists
          console.warn('Auth check failed:', error.message);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    setUser(response.user);
    localStorage.setItem('user', JSON.stringify(response.user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    navigate('/login', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

