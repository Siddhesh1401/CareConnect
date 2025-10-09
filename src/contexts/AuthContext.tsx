import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<any>;
  signup: (name: string, email: string, password: string, role: 'volunteer' | 'ngo_admin', additionalData?: any) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  isLoading: boolean;
  isAdmin: () => boolean;
  isAPIAdmin: () => boolean;
  sendVerificationCode: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
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
    const savedToken = localStorage.getItem('careconnect_token');
    
    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // Verify token is still valid by fetching profile
        authAPI.getProfile()
          .then((response) => {
            if (response.success) {
              setUser(response.data.user);
              localStorage.setItem('careconnect_user', JSON.stringify(response.data.user));
            }
          })
          .catch((error) => {
            console.error('Token validation failed:', error);
            // Clear invalid data
            localStorage.removeItem('careconnect_user');
            localStorage.removeItem('careconnect_token');
            setUser(null);
          });
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('careconnect_user');
        localStorage.removeItem('careconnect_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('AuthContext: Starting login for:', email);
      const response = await authAPI.login({ email, password });
      console.log('AuthContext: Raw response from API:', response);
      
      if (response.success) {
        const { user: userData, token } = response.data;
        console.log('AuthContext: User data received:', userData);
        console.log('AuthContext: Response code:', response.code);
        
        // Convert backend user data to frontend User type
        const user: User = {
          id: userData._id || userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          profilePicture: userData.profilePicture,
          points: userData.points || 0,
          achievements: userData.achievements || [],
          joinedDate: new Date(userData.joinedDate || userData.createdAt),
          // Additional fields from backend
          phone: userData.phone,
          location: userData.location,
          skills: userData.skills,
          interests: userData.interests,
          organizationName: userData.organizationName,
          isVerified: userData.isVerified,
          isNGOVerified: userData.isNGOVerified
        };

        setUser(user);
        localStorage.setItem('careconnect_user', JSON.stringify(user));
        localStorage.setItem('careconnect_token', token);

        // Check if login was successful but with document rejection warning
        if (response.code === 'DOCUMENTS_REJECTED') {
          console.log('AuthContext: Documents rejected but login allowed, preparing navigation');
          console.log('Rejected docs:', response.data.rejectedDocuments);
          
          // Create a custom success response with rejection details
          const customSuccess = {
            success: true,
            code: 'DOCUMENTS_REJECTED',
            message: response.message,
            rejectedDocuments: response.data.rejectedDocuments
          };
          
          // Return the custom response so the calling component can handle navigation
          return customSuccess;
        }

        return response;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific NGO approval errors
      if (error.response?.data?.code === 'PENDING_APPROVAL') {
        console.log('AuthContext: NGO pending approval, preparing error');
        const customError = new Error('Your NGO registration is pending admin approval. Please wait for verification.');
        (customError as any).code = 'PENDING_APPROVAL';
        (customError as any).data = error.response.data.data; // Pass organization data
        throw customError;
      }
      if (error.response?.data?.code === 'REGISTRATION_REJECTED') {
        throw new Error('Your NGO registration has been rejected. Please contact support.');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    name: string, 
    email: string, 
    password: string, 
    role: 'volunteer' | 'ngo_admin',
    additionalData?: any
  ) => {
    setIsLoading(true);
    try {
      const signupData = {
        name,
        email,
        password,
        role,
        ...additionalData
      };

      const response = await authAPI.signup(signupData);
      
      if (response.success) {
        const { user: userData, token, requiresApproval } = response.data;
        
        // If NGO requires approval, don't log them in
        if (requiresApproval) {
          // Just throw a success message that will be caught and shown
          throw new Error('NGO registration submitted successfully. Please wait for admin approval before logging in.');
        }
        
        // Convert backend user data to frontend User type
        const user: User = {
          id: userData._id || userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          profilePicture: userData.profilePicture,
          points: userData.points || 0,
          achievements: userData.achievements || [],
          joinedDate: new Date(userData.joinedDate || userData.createdAt),
          // Additional fields from backend
          phone: userData.phone,
          location: userData.location,
          skills: userData.skills,
          interests: userData.interests,
          organizationName: userData.organizationName,
          isVerified: userData.isVerified,
          isNGOVerified: userData.isNGOVerified
        };

        setUser(user);
        localStorage.setItem('careconnect_user', JSON.stringify(user));
        localStorage.setItem('careconnect_token', token);
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('careconnect_user');
      localStorage.removeItem('careconnect_token');
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.success) {
        const userData = response.data.user;
        const updatedUser: User = {
          id: userData._id || userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          profilePicture: userData.profilePicture,
          points: userData.points || 0,
          achievements: userData.achievements || [],
          joinedDate: new Date(userData.joinedDate || userData.createdAt),
          phone: userData.phone,
          location: userData.location,
          skills: userData.skills,
          interests: userData.interests,
          organizationName: userData.organizationName,
          isVerified: userData.isVerified,
          isNGOVerified: userData.isNGOVerified
        };
        setUser(updatedUser);
        localStorage.setItem('careconnect_user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isAPIAdmin = () => {
    return user?.role === 'api_admin';
  };

  const sendVerificationCode = async (email: string) => {
    try {
      await authAPI.sendVerificationCode({ email });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to send verification code');
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    try {
      await authAPI.resetPassword({ email, code, newPassword });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to reset password');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout,
      refreshProfile,
      isLoading, 
      isAdmin, 
      isAPIAdmin,
      sendVerificationCode, 
      resetPassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
};