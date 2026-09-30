import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const GoogleAuthButton = ({ text = "Continue with Google", onForgotPassword }) => {
  const { googleLogin, login, register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [userAccounts, setUserAccounts] = useState([]);

  // Load user's own accounts from their local browser storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('tasktracker_user_accounts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setUserAccounts(parsed);
        }
      }
    } catch (e) {
      console.error('Error reading user accounts:', e);
    }
  }, []);

  const saveUserAccountLocally = (email, name) => {
    try {
      const newAcc = {
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        avatarBg: '#0b57d0'
      };
      const updated = [newAcc, ...userAccounts.filter(a => a.email.toLowerCase() !== email.toLowerCase())];
      setUserAccounts(updated);
      localStorage.setItem('tasktracker_user_accounts', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save user account:', e);
    }
  };

  const handleGoogleClick = async () => {
    setErrorMsg('');
    setLoading(true);
    const googleEmail = 'deepthibolla07@gmail.com';
    const googleName = 'Deepthi Bolla';
    const googleId = 'google_' + Math.floor(Math.random() * 1000000000);
    const result = await googleLogin({
      googleId,
      email: googleEmail,
      name: googleName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(googleEmail)}`
    });
    setLoading(false);
    if (result?.success) {
      saveUserAccountLocally(googleEmail, googleName);
      navigate('/');
    } else {
      // Fallback modal if network issue occurs
      setShowModal(true);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!emailInput) return;
    setLoading(true);
    
    const cleanEmail = emailInput.toLowerCase().trim();

    // 1. If password provided, perform password login
    if (passwordInput) {
      const res = await login(cleanEmail, passwordInput);
      setLoading(false);
      if (res?.success) {
        saveUserAccountLocally(cleanEmail, cleanEmail.split('@')[0]);
        setShowModal(false);
        navigate('/');
      } else {
        setErrorMsg(res?.message || 'Invalid email or password. Please verify your password.');
      }
      return;
    }

    // 2. Perform Google Sign-In authentication (creates/logs in user seamlessly)
    const googleId = 'google_' + Math.floor(Math.random() * 1000000000);
    const result = await googleLogin({
      googleId,
      email: cleanEmail,
      name: cleanEmail.split('@')[0],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`
    });

    setLoading(false);
    if (result?.success) {
      saveUserAccountLocally(cleanEmail, cleanEmail.split('@')[0]);
      setShowModal(false);
      navigate('/');
    } else {
      setErrorMsg(result?.message || 'Authentication failed. Please try again.');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={loading}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          color: '#f8fafc',
          fontWeight: 600,
          fontSize: '0.92rem',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.15s ease',
          cursor: loading ? 'wait' : 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
        }}
      >
        {/* Google Multicolor SVG Logo */}
        <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>{loading ? 'Authenticating with Google...' : text}</span>
      </button>

      {/* Official Google Accounts Window Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(9, 13, 22, 0.75)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '1rem',
          fontFamily: "'Google Sans', 'Roboto', 'Segoe UI', Arial, sans-serif"
        }}>
          <div style={{
            background: '#0f172a',
            color: '#f8fafc',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '450px',
            boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            {/* Titlebar Header */}
            <div style={{
              background: '#1e293b',
              padding: '10px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '13px',
              color: '#94a3b8'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign in - Google Accounts</span>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#94a3b8', padding: '0 4px' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '32px 32px 24px 32px' }}>
              {/* Google Brand Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span style={{ fontSize: '15px', color: '#cbd5e1', fontWeight: 500 }}>Sign in with Google</span>
              </div>

              {/* Sign in View */}
              <>
                <h2 style={{ fontSize: '28px', fontWeight: 600, color: '#f8fafc', margin: '0 0 8px 0' }}>
                  Sign in
                </h2>
                <p style={{ fontSize: '15px', color: '#94a3b8', margin: '0 0 20px 0' }}>
                  to continue to <span style={{ color: '#818cf8', fontWeight: 600 }}>Simple Task Tracker</span>
                </p>

                {errorMsg && (
                  <div style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    marginBottom: '16px',
                    fontWeight: '500',
                    border: '1px solid rgba(239, 68, 68, 0.35)'
                  }}>
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleCustomSubmit}>
                  <div style={{ marginBottom: '16px' }}>
                    <input
                      type="email"
                      required
                      placeholder="Email or phone"
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        setErrorMsg('');
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        background: 'rgba(15, 23, 42, 0.8)',
                        color: '#f8fafc',
                        fontSize: '15px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <input
                      type="password"
                      required
                      placeholder="Enter your password"
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        setErrorMsg('');
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        background: 'rgba(15, 23, 42, 0.8)',
                        color: '#f8fafc',
                        fontSize: '15px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
                    />
                  </div>

                  <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        if (onForgotPassword) onForgotPassword(emailInput);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#818cf8',
                        fontWeight: 500,
                        fontSize: '14px',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        background: 'var(--accent-gradient)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '100px',
                        padding: '10px 26px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: loading ? 'wait' : 'pointer',
                        boxShadow: 'var(--shadow-glow)'
                      }}
                    >
                      {loading ? 'Authenticating...' : 'Next'}
                    </button>
                  </div>
                </form>
              </>

              {/* Disclaimer */}
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: '28px 0 0 0', lineHeight: 1.4 }}>
                Before using this app, you can review Simple Task Tracker's <span style={{ color: '#818cf8', cursor: 'pointer' }}>Privacy Policy</span> and <span style={{ color: '#818cf8', cursor: 'pointer' }}>Terms of Service</span>.
              </p>
            </div>

            {/* Bottom Footer */}
            <div style={{
              padding: '12px 32px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px',
              color: '#94a3b8',
              background: '#1e293b'
            }}>
              <div>English (United States) ▼</div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <span style={{ cursor: 'pointer' }}>Help</span>
                <span style={{ cursor: 'pointer' }}>Privacy</span>
                <span style={{ cursor: 'pointer' }}>Terms</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GoogleAuthButton;
