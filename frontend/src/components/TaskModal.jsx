import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, Tag, AlertCircle } from 'lucide-react';

const TaskModal = ({ isOpen, onClose, onSave, taskToEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('Personal');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status || 'pending');
      setPriority(taskToEdit.priority || 'medium');
      setCategory(taskToEdit.category || 'Personal');
      setDueDate(
        taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : ''
      );
    } else {
      // Reset form for create
      setTitle('');
      setDescription('');
      setStatus('pending');
      setPriority('medium');
      setCategory('Personal');
      setDueDate('');
    }
    setError('');
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setSubmitting(true);
    setError('');

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      category,
      dueDate: dueDate || null,
    };

    const success = await onSave(taskData, taskToEdit ? taskToEdit._id : null);
    setSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {taskToEdit ? 'Edit Task' : 'Create New Task'}
          </h3>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)',
            color: '#f87171',
            fontSize: '0.88rem',
            marginBottom: '1rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              className="glass-input"
              placeholder="e.g. Design landing page wireframe"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Description
            </label>
            <textarea
              className="glass-input"
              rows={3}
              placeholder="Add key details, links, or notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Grid row: Priority & Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Priority
              </label>
              <select
                className="glass-input"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low" style={{ background: '#0f172a' }}>Low</option>
                <option value="medium" style={{ background: '#0f172a' }}>Medium</option>
                <option value="high" style={{ background: '#0f172a' }}>High</option>
                <option value="urgent" style={{ background: '#0f172a' }}>Urgent</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Category
              </label>
              <select
                className="glass-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Work" style={{ background: '#0f172a' }}>Work</option>
                <option value="Personal" style={{ background: '#0f172a' }}>Personal</option>
                <option value="Coding" style={{ background: '#0f172a' }}>Coding</option>
                <option value="Health" style={{ background: '#0f172a' }}>Health</option>
                <option value="Finance" style={{ background: '#0f172a' }}>Finance</option>
                <option value="Other" style={{ background: '#0f172a' }}>Other</option>
              </select>
            </div>
          </div>

          {/* Grid row: Status & Due Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Status
              </label>
              <select
                className="glass-input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="pending" style={{ background: '#0f172a' }}>Pending</option>
                <option value="in-progress" style={{ background: '#0f172a' }}>In Progress</option>
                <option value="completed" style={{ background: '#0f172a' }}>Completed</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Due Date
              </label>
              <input
                type="date"
                className="glass-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Check size={18} />
              <span>{submitting ? 'Saving...' : taskToEdit ? 'Update Task' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
