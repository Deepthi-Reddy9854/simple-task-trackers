import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, Edit2, Trash2, Calendar, Tag, AlertTriangle, X } from 'lucide-react';

const TaskCard = ({ task, onToggleStatus, onEdit, onDelete }) => {
  const { _id, title, description, status, priority, category, dueDate } = task;
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isCompleted = status === 'completed';

  // Format Due Date
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Check if task is overdue
  const isOverdue = !dueDate || isCompleted ? false : new Date(dueDate) < new Date().setHours(0, 0, 0, 0);

  const handleDeleteClick = () => setConfirmDelete(true);
  const handleCancelDelete = () => setConfirmDelete(false);
  const handleConfirmDelete = () => {
    setConfirmDelete(false);
    onDelete(_id);
  };

  return (
    <div
      className="glass-card fade-in"
      style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        opacity: isCompleted ? 0.75 : 1,
        borderLeft: `4px solid ${
          priority === 'urgent' ? 'var(--priority-urgent)' :
          priority === 'high' ? 'var(--priority-high)' :
          priority === 'medium' ? 'var(--priority-medium)' : 'var(--priority-low)'
        }`
      }}
    >
      {/* Inline Delete Confirmation Overlay */}
      {confirmDelete && (
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          zIndex: 10,
          padding: '1.25rem',
        }}>
          <AlertTriangle size={28} style={{ color: '#f87171' }} />
          <p style={{ textAlign: 'center', fontSize: '0.92rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
            Delete this task?
          </p>
          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.25rem' }}>
            <button
              onClick={handleCancelDelete}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              style={{
                padding: '0.4rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: 'rgba(239, 68, 68, 0.85)',
                color: '#fff',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}

      <div>
        {/* Header row: Checkbox, Title, Badges */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <button
            onClick={() => onToggleStatus(_id, status)}
            className="btn-icon"
            style={{
              padding: '2px',
              marginTop: '2px',
              color: isCompleted ? '#34d399' : status === 'in-progress' ? '#c084fc' : 'var(--text-subtle)',
              cursor: 'pointer'
            }}
            title={`Status: ${status}. Click to cycle.`}
          >
            {isCompleted ? (
              <CheckCircle2 size={22} style={{ color: '#34d399' }} />
            ) : status === 'in-progress' ? (
              <Clock size={22} style={{ color: '#c084fc' }} />
            ) : (
              <Circle size={22} />
            )}
          </button>

          <div style={{ flex: 1 }}>
            <h4
              style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                textDecoration: isCompleted ? 'line-through' : 'none',
                color: isCompleted ? 'var(--text-muted)' : 'var(--text-main)',
                wordBreak: 'break-word',
                lineHeight: 1.3
              }}
            >
              {title}
            </h4>

            {description && (
              <p
                style={{
                  fontSize: '0.88rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.4rem',
                  lineHeight: 1.45,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Badges section */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem', alignItems: 'center' }}>
          {/* Priority Badge */}
          <span className={`badge badge-${priority}`}>
            {priority}
          </span>

          {/* Status Badge */}
          <span className={`badge badge-status-${status}`}>
            {status.replace('-', ' ')}
          </span>

          {/* Category Tag */}
          <span className="badge badge-category">
            <Tag size={11} />
            {category}
          </span>
        </div>
      </div>

      {/* Footer row: Due date & Action buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '1.25rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: isOverdue ? '#f87171' : 'var(--text-subtle)' }}>
          {dueDate && (
            <>
              <Calendar size={13} />
              <span style={{ fontWeight: isOverdue ? 700 : 500 }}>
                {formatDate(dueDate)} {isOverdue && '(Overdue)'}
              </span>
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button
            onClick={() => onEdit(task)}
            className="btn-icon"
            title="Edit Task"
            style={{ padding: '0.4rem' }}
          >
            <Edit2 size={16} />
          </button>

          <button
            onClick={handleDeleteClick}
            className="btn-icon"
            title="Delete Task"
            style={{ padding: '0.4rem', color: 'rgba(239, 68, 68, 0.7)' }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
