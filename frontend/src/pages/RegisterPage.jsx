import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, User, Mail, Lock } from 'lucide-react';
import GoogleAuthButton from '../components/GoogleAuthButton';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);
    if (result.success) {
      navigate('/');
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
          Create an account to organize your tasks
        </p>
      </div>

      <div className="auth-card-clean fade-in">
        {/* Google Register */}
        <div style={{ marginBottom: '1.5rem' }}>
          <GoogleAuthButton text="Continue with Google" />
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

        {/* Registration Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Full Name */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#18181b',
              marginBottom: '0.45rem'
            }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#71717a'
              }} />
              <input
                type="text"
                required
                className="clean-input"
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

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
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#18181b',
              marginBottom: '0.45rem'
            }}>
              Password (min 6 chars)
            </label>
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
                minLength={6}
                className="clean-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="clean-btn-primary"
            disabled={loading}
            style={{ marginTop: '0.25rem' }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>

      {/* Footer link outside card */}
      <div style={{
        textAlign: 'center',
        marginTop: '1.5rem',
        fontSize: '0.9rem',
        color: 'var(--text-muted)'
      }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>
          Log in
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
