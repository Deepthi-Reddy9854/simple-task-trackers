import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, LogOut } from 'lucide-react';

const Navbar = ({ onOpenNewTask }) => {
  const { user, logout } = useAuth();

  return (
    <header style={{
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <CheckSquare size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', margin: 0 }} className="gradient-text">Simple Task Tracker</h1>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 500, letterSpacing: '0.05em' }}>TASK MANAGEMENT APP</span>
          </div>
        </div>

        {/* User actions */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.35rem 0.85rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-full)'
            }}>
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--accent-primary)',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{user.name}</span>
            </div>

            <button 
              onClick={logout} 
              className="btn-icon" 
              title="Logout"
              style={{ padding: '0.6rem' }}
            >
              <LogOut size={19} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <a href="/login" className="btn btn-secondary btn-sm">Log In</a>
            <a href="/register" className="btn btn-primary btn-sm">Sign Up</a>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
