import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: 'volunteer' | 'ngo_admin') => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('careconnect_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data based on email
      const mockUser: User = {
        id: '1',
        name: email === 'volunteer@careconnect.com' ? 'Sarah Johnson' : 
              email === 'admin@careconnect.com' ? 'System Administrator' : 'Green Earth Foundation',
        email,
        role: email === 'volunteer@careconnect.com' ? 'volunteer' : 
              email === 'admin@careconnect.com' ? 'admin' : 'ngo_admin',
        avatar: email === 'volunteer@careconnect.com' ? 
          'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150' :
          email === 'admin@careconnect.com' ?
          'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150' :
          'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=150',
        points: email === 'volunteer@careconnect.com' ? 1250 : undefined,
        achievements: email === 'volunteer@careconnect.com' ? [
          {
            id: '1',
            title: 'First Steps',
            description: 'Completed your first volunteer activity',
            icon: 'award',
            earnedDate: new Date('2024-01-15'),
            points: 100
          },
          {
            id: '2',
            title: 'Community Builder',
            description: 'Made 10 posts in community discussions',
            icon: 'users',
            earnedDate: new Date('2024-02-20'),
            points: 200
          }
        ] : [],
        joinedDate: new Date('2024-01-01')
      };

      setUser(mockUser);
      localStorage.setItem('careconnect_user', JSON.stringify(mockUser));
    } catch (error) {
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: 'volunteer' | 'ngo_admin') => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        role,
        points: role === 'volunteer' ? 0 : undefined,
        achievements: [],
        joinedDate: new Date()
      };

      setUser(newUser);
      localStorage.setItem('careconnect_user', JSON.stringify(newUser));
    } catch (error) {
      throw new Error('Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('careconnect_user');
    // Add a small delay to ensure state update is processed
    await new Promise(resolve => setTimeout(resolve, 50));
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};