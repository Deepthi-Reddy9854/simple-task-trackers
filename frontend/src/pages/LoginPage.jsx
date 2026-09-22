import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Mail, Lock, X, KeyRound, CheckCircle2 } from 'lucide-react';
import GoogleAuthButton from '../components/GoogleAuthButton';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Forgot Password modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const { login, resetPassword, showToast } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/');
    }
  };

  const handleOpenResetModal = (prefEmail) => {
    setResetEmail(typeof prefEmail === 'string' && prefEmail ? prefEmail : email);
    setNewPassword('');
    setConfirmPassword('');
    setResetError('');
    setResetSuccess('');
    setShowResetModal(true);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!resetEmail) {
      setResetError('Please enter your email address');
      return;
    }
    if (newPassword.length < 6) {
      setResetError('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match. Please verify your passwords.');
      return;
    }

    setResetLoading(true);
    const res = await resetPassword(resetEmail, newPassword);
    setResetLoading(false);

    if (res.success) {
      setResetSuccess(res.message || 'Password reset successful!');
      setEmail(resetEmail);
      setPassword(newPassword);
      setTimeout(() => {
        setShowResetModal(false);
      }, 1800);
    } else {
      setResetError(res.message || 'Could not reset password. Please check your email address.');
    }
  };

  return (
    <div className="auth-wrapper" style={{ flexDirection: 'column' }}>
      {/* Title Name Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'var(--accent-gradient)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)',
          marginBottom: '0.85rem'
        }}>
          <CheckSquare size={30} color="#fff" />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }} className="gradient-text">
          Simple Task Tracker
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Sign in to manage your tasks & real-time goals
        </p>
      </div>

      <div className="auth-card-clean fade-in">
        {/* Google Login */}
        <div style={{ marginBottom: '1.5rem' }}>
          <GoogleAuthButton text="Continue with Google" onForgotPassword={handleOpenResetModal} />
        </div>

        {/* OR Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '1.5rem 0',
          position: 'relative'
        }}>
          <div style={{ flex: 1, height: '1px', background: '#e4e4e7' }}></div>
          <span style={{
            padding: '0 0.8rem',
            fontSize: '0.78rem',
            color: '#71717a',
            fontWeight: 500,
            letterSpacing: '0.05em'
          }}>
            OR
          </span>
          <div style={{ flex: 1, height: '1px', background: '#e4e4e7' }}></div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Email */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#18181b',
              marginBottom: '0.45rem'
            }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#71717a'
              }} />
              <input
                type="email"
                required
                className="clean-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.45rem'
            }}>
              <label style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#18181b',
                margin: 0
              }}>
                Password
              </label>
              <button
                type="button"
                onClick={handleOpenResetModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.82rem',
                  color: '#2563eb',
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Forgot password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#71717a'
              }} />
              <input
                type="password"
                required
                className="clean-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Log in Button */}
          <button
            type="submit"
            className="clean-btn-primary"
            disabled={loading}
            style={{ marginTop: '0.25rem' }}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>

      {/* Footer outside card */}
      <div style={{
        textAlign: 'center',
        marginTop: '1.5rem',
        fontSize: '0.9rem',
        color: 'var(--text-muted)'
      }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>
          Create one
        </Link>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="modal-overlay">
          <div className="modal-content fade-in" style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(37, 99, 235, 0.1)',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <KeyRound size={20} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Reset Password</h3>
              </div>
              <button
                onClick={() => setShowResetModal(false)}
                className="btn-icon"
                style={{ color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Enter your registered email address and choose a new password.
            </p>

            {resetError && (
              <div style={{
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.88rem',
                marginBottom: '1rem',
                border: '1px solid #fecaca',
                fontWeight: 500
              }}>
                {resetError}
              </div>
            )}

            {resetSuccess ? (
              <div style={{
                backgroundColor: '#ecfdf5',
                color: '#047857',
                padding: '1.25rem',
                borderRadius: '8px',
                fontSize: '0.92rem',
                marginBottom: '1rem',
                border: '1px solid #a7f3d0',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircle2 size={32} color="#059669" />
                <span style={{ fontWeight: 600 }}>{resetSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#18181b', marginBottom: '0.4rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    className="clean-input"
                    style={{ paddingLeft: '1rem' }}
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#18181b', marginBottom: '0.4rem' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="clean-input"
                    style={{ paddingLeft: '1rem' }}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#18181b', marginBottom: '0.4rem' }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="clean-input"
                    style={{ paddingLeft: '1rem' }}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '0.75rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="clean-btn-primary"
                    disabled={resetLoading}
                    style={{ flex: 1 }}
                  >
                    {resetLoading ? 'Updating...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
