import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || '';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function validateToken(token) {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('signal_token');
      }
    } catch (err) {
      console.error('Token validation failed:', err);
      localStorage.removeItem('signal_token');
    } finally {
      setLoading(false);
    }
  }

  async function loginWithX() {
    try {
      const res = await fetch(`${API_URL}/auth/twitter`);
      const data = await res.json();
      
      if (data.demo) {
        // X OAuth not configured, show message
        setError('X OAuth not configured. Use Demo login for testing.');
        return;
      }
      
      // Redirect to X OAuth
      window.location.href = data.authUrl;
    } catch (err) {
      setError('Failed to initiate login');
    }
  }

  async function loginDemo() {
    try {
      setError(null);
      const res = await fetch(`${API_URL}/auth/demo`, { method: 'POST' });
      const data = await res.json();
      
      if (data.token) {
        setToken(data.token);
        setUser(data.user);
        setError(null);
      } else {
        setError('No token received');
      }
    } catch (err) {
      setError('Demo login failed: ' + err.message);
    }
  }

  function handleCallback(token) {
    localStorage.setItem('signal_token', token);
    validateToken(token);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  function getToken() {
    return token;
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      loginWithX,
      loginDemo,
      handleCallback,
      logout,
      getToken,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
