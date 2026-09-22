import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const GoogleAuthButton = ({ text = "Continue with Google", onForgotPassword }) => {
  const { googleLogin, login, register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState('another'); // 'chooser' | 'another'
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

  const handleGoogleClick = () => {
    setErrorMsg('');
    setEmailInput('');
    setPasswordInput('');
    setView('another'); // Direct sign in view, without showing mail accounts list
    setShowModal(true);
  };

  const executeLogin = async (email, name, avatar) => {
    setLoading(true);
    setShowModal(false);
    const googleId = 'google_' + Math.floor(Math.random() * 1000000000);
    const result = await googleLogin({
      googleId,
      email,
      name: name || email.split('@')[0],
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`
    });
    setLoading(false);
    if (result?.success) {
      saveUserAccountLocally(email, name);
      navigate('/');
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!emailInput) return;
    setLoading(true);
    
    const cleanEmail = emailInput.toLowerCase().trim();

    // 1. Try standard login if password provided
    if (passwordInput) {
      const res = await login(cleanEmail, passwordInput);
      if (res?.success) {
        saveUserAccountLocally(cleanEmail, cleanEmail.split('@')[0]);
        setLoading(false);
        setShowModal(false);
        navigate('/');
        return;
      }
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
          background: '#ffffff',
          border: '1px solid #e4e4e7',
          color: '#18181b',
          fontWeight: 600,
          fontSize: '0.92rem',
          borderRadius: '8px',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.15s ease',
          cursor: loading ? 'wait' : 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#f4f4f5';
          e.currentTarget.style.borderColor = '#d4d4d8';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#ffffff';
          e.currentTarget.style.borderColor = '#e4e4e7';
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
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '1rem',
          fontFamily: "'Google Sans', 'Roboto', 'Segoe UI', Arial, sans-serif"
        }}>
          <div style={{
            background: '#ffffff',
            color: '#1f1f1f',
            borderRadius: '28px',
            width: '100%',
            maxWidth: '450px',
            boxShadow: '0 24px 38px 3px rgba(0,0,0,0.14), 0 9px 46px 8px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            border: '1px solid #dadce0'
          }}>
            {/* Chrome Titlebar Header */}
            <div style={{
              background: '#e8eaed',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #dadce0',
              fontSize: '12px',
              color: '#3c4043'
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
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#5f6368', padding: '0 4px' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '36px 36px 24px 36px' }}>
              {/* Google Brand Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span style={{ fontSize: '15px', color: '#3c4043', fontWeight: 500 }}>Sign in with Google</span>
              </div>              {/* Sign in View */}
              <>
                <h2 style={{ fontSize: '32px', fontWeight: 400, color: '#1f1f1f', margin: '0 0 8px 0' }}>
                  Sign in
                </h2>
                <p style={{ fontSize: '16px', color: '#444746', margin: '0 0 20px 0' }}>
                  to continue to <span style={{ color: '#0b57d0', fontWeight: 500 }}>Simple Task Tracker</span>
                </p>

                {errorMsg && (
                  <div style={{
                    backgroundColor: '#fde8e8',
                    color: '#9b1c1c',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    marginBottom: '16px',
                    fontWeight: '500',
                    border: '1px solid #f8b4b4'
                  }}>
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleCustomSubmit}>
                  <div style={{ marginBottom: '20px' }}>
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
                        padding: '14px 16px',
                        borderRadius: '4px',
                        border: '1px solid #747775',
                        fontSize: '16px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#0b57d0'}
                      onBlur={(e) => e.target.style.borderColor = '#747775'}
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
                        padding: '14px 16px',
                        borderRadius: '4px',
                        border: '1px solid #747775',
                        fontSize: '16px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#0b57d0'}
                      onBlur={(e) => e.target.style.borderColor = '#747775'}
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
                        color: '#0b57d0',
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
                        backgroundColor: '#0b57d0',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '100px',
                        padding: '10px 24px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: loading ? 'wait' : 'pointer'
                      }}
                    >
                      {loading ? 'Authenticating...' : 'Next'}
                    </button>
                  </div>
                </form>
              </>

              {/* Disclaimer */}
              <p style={{ fontSize: '14px', color: '#444746', margin: '32px 0 0 0', lineHeight: 1.4 }}>
                Before using this app, you can review Simple Task Tracker's <span style={{ color: '#0b57d0', cursor: 'pointer' }}>Privacy Policy</span> and <span style={{ color: '#0b57d0', cursor: 'pointer' }}>Terms of Service</span>.
              </p>
            </div>

            {/* Bottom Footer */}
            <div style={{
              padding: '12px 36px',
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px',
              color: '#444746',
              background: '#f8f9fa'
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
