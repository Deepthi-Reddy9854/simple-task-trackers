import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '', visible: false });

  // Show Toast notification
  const showToast = (message, type = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast({ message: '', type: '', visible: false });
    }, 3500);
  };

  // Load user on startup
  useEffect(() => {
    const checkLoggedIn = async () => {
      const storedToken = localStorage.getItem('tasktracker_token');
      const storedUser = localStorage.getItem('tasktracker_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Verify with backend
          const res = await API.get('/auth/me');
          if (res.data.success) {
            setUser((prev) => ({ ...prev, ...res.data.data }));
          }
        } catch (err) {
          console.error('Session verification failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  // Register user
  const register = async (name, email, password) => {
    try {
      const res = await API.post('/auth/register', { name, email, password });
      if (res.data.success) {
        const userData = res.data.data;
        localStorage.setItem('tasktracker_token', userData.token);
        localStorage.setItem('tasktracker_user', JSON.stringify(userData));
        setUser(userData);
        showToast(`Welcome to Simple Task Tracker, ${userData.name}!`, 'success');
        return { success: true };
      }
      return { success: false, message: 'Registration failed' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data.success) {
        const userData = res.data.data;
        localStorage.setItem('tasktracker_token', userData.token);
        localStorage.setItem('tasktracker_user', JSON.stringify(userData));
        setUser(userData);
        showToast(`Welcome back, ${userData.name}!`, 'success');
        return { success: true };
      }
      return { success: false, message: 'Login failed' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  // Google Login / Register
  const googleLogin = async (googlePayload) => {
    try {
      const res = await API.post('/auth/google', googlePayload);
      if (res.data.success) {
        const userData = res.data.data;
        localStorage.setItem('tasktracker_token', userData.token);
        localStorage.setItem('tasktracker_user', JSON.stringify(userData));
        setUser(userData);
        showToast(`Signed in with Google as ${userData.name}`, 'success');
        return { success: true };
      }
      return { success: false, message: 'Google login failed' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Google login failed';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  // Quick Demo / Guest Login
  const guestLogin = async () => {
    const demoEmail = `guest_${Math.floor(1000 + Math.random() * 9000)}@simpletasktracker.demo`;
    const demoPass = 'demo12345';
    const demoName = 'Demo Explorer';

    try {
      // Try to register demo user
      const res = await API.post('/auth/register', {
        name: demoName,
        email: demoEmail,
        password: demoPass,
      });

      if (res.data.success) {
        const userData = res.data.data;
        localStorage.setItem('tasktracker_token', userData.token);
        localStorage.setItem('tasktracker_user', JSON.stringify(userData));
        setUser(userData);
        showToast('Logged in as Guest Explorer!', 'success');
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      showToast('Could not start guest session', 'error');
      return { success: false };
    }
  };

  // Reset Password
  const resetPassword = async (email, newPassword) => {
    try {
      const res = await API.post('/auth/reset-password', { email, newPassword });
      if (res.data.success) {
        showToast(res.data.message || 'Password reset successfully!', 'success');
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('tasktracker_token');
    localStorage.removeItem('tasktracker_user');
    setUser(null);
    showToast('Logged out successfully', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        googleLogin,
        guestLogin,
        resetPassword,
        logout,
        toast,
        showToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
