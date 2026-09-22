import React from 'react';
import { ListTodo, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

const TaskStats = ({ stats }) => {
  const { total = 0, pending = 0, inProgress = 0, completed = 0, highPriority = 0, completionRate = 0 } = stats || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="stats-grid">
        {/* Total Tasks Card */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Tasks</p>
              <h3 style={{ fontSize: '1.8rem', marginTop: '0.2rem' }}>{total}</h3>
            </div>
            <div style={{ padding: '0.6rem', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <ListTodo size={22} />
            </div>
          </div>
        </div>

        {/* Pending Card */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>In Progress / Pending</p>
              <h3 style={{ fontSize: '1.8rem', marginTop: '0.2rem' }}>{pending + inProgress}</h3>
            </div>
            <div style={{ padding: '0.6rem', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <Clock size={22} />
            </div>
          </div>
        </div>

        {/* Completed Card */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Completed</p>
              <h3 style={{ fontSize: '1.8rem', marginTop: '0.2rem', color: '#34d399' }}>{completed}</h3>
            </div>
            <div style={{ padding: '0.6rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <CheckCircle size={22} />
            </div>
          </div>
        </div>

        {/* Urgent / High Priority Card */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>High Priority Active</p>
              <h3 style={{ fontSize: '1.8rem', marginTop: '0.2rem', color: highPriority > 0 ? '#f87171' : 'var(--text-main)' }}>{highPriority}</h3>
            </div>
            <div style={{ padding: '0.6rem', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
              <AlertTriangle size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Overall Productivity Progress</span>
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{completionRate}%</span>
        </div>
        <div style={{
          height: '10px',
          width: '100%',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${completionRate}%`,
            background: 'var(--accent-gradient)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: 'var(--shadow-glow)'
          }} />
        </div>
      </div>
    </div>
  );
};

export default TaskStats;
