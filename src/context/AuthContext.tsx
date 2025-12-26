import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { post } from '@/lib/api';

type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user';
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkAuth = async () => {
      try {
        // Here you would typically check for an auth token in localStorage or cookies
        // and validate it with your backend
        const token = localStorage.getItem('authToken');
        
        if (token) {
          // Simulate fetching user data
          // In a real app, you would make an API call to get the user's data
          setTimeout(() => {
            const savedUser = localStorage.getItem('authUser');
            if (savedUser) {
              setUser(JSON.parse(savedUser) as User);
            } else {
              setUser({
                id: '1',
                name: 'Demo User',
                email: 'demo@example.com',
                role: 'user',
              });
            }
            setIsLoading(false);
          }, 1000);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await post<{ token: string; user: User }>(`/auth/login`, { email, password });
      localStorage.setItem('authToken', res.token);
      localStorage.setItem('authUser', JSON.stringify(res.user));
      setUser(res.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Login failed. Please check your credentials and try again.');
    }
  };

  const register = async (userData: { name: string; email: string; password: string }) => {
    try {
      // In a real app, you would make an API call to your backend to register the user
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful registration
      const user: User = {
        id: '1',
        name: userData.name,
        email: userData.email,
        role: userData.email.toLowerCase().startsWith('admin') ? 'admin' : 'user',
      };
      
      localStorage.setItem('authToken', 'dummy-token');
      localStorage.setItem('authUser', JSON.stringify(user));
      setUser(user);
    } catch (error) {
      console.error('Registration failed:', error);
      throw new Error('Registration failed. Please try again.');
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setUser(null);
    // In a real app, you might want to redirect to the login page here
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        isAdmin: user?.role === 'admin',
      }}
    >
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
