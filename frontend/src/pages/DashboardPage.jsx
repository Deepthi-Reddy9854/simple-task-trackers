import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import TaskStats from '../components/TaskStats';
import TaskFilter from '../components/TaskFilter';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { Plus, CheckSquare, Sparkles, RefreshCw, Layers } from 'lucide-react';

const DashboardPage = () => {
  const { user, showToast } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0, highPriority: 0, completionRate: 0 });
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // Fetch task stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await API.get('/tasks/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  // Fetch task list with filter params
  const fetchTasks = useCallback(async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (sortBy) params.sortBy = sortBy;

      const res = await API.get('/tasks', { params });
      if (res.data.success) {
        setTasks(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      showToast('Error loading tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter, categoryFilter, sortBy]);

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [fetchTasks, fetchStats]);

  // Handle Save (Create or Update Task)
  const handleSaveTask = async (taskData, id = null) => {
    try {
      if (id) {
        // Update task
        const res = await API.put(`/tasks/${id}`, taskData);
        if (res.data.success) {
          showToast('Task updated successfully!', 'success');
          fetchTasks();
          fetchStats();
          return true;
        }
      } else {
        // Create task
        const res = await API.post('/tasks', taskData);
        if (res.data.success) {
          showToast('New task added!', 'success');
          fetchTasks();
          fetchStats();
          return true;
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed';
      showToast(msg, 'error');
      return false;
    }
  };

  // Handle Status Toggle (Quick cycle)
  const handleToggleStatus = async (taskId, currentStatus) => {
    try {
      const res = await API.patch(`/tasks/${taskId}/toggle`);
      if (res.data.success) {
        const updatedTask = res.data.data;
        // Optimistic UI update
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? updatedTask : t))
        );
        fetchStats();
        showToast(`Task status updated to ${updatedTask.status}`, 'info');
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  // Handle Task Deletion
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const res = await API.delete(`/tasks/${taskId}`);
      if (res.data.success) {
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
        fetchStats();
        showToast('Task deleted successfully', 'info');
      }
    } catch (err) {
      showToast('Failed to delete task', 'error');
    }
  };

  // Modal Triggers
  const openCreateModal = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  // Populate sample starter tasks for new user
  const handleAddSampleTasks = async () => {
    const samples = [
      {
        title: '🚀 Complete MERN Application Setup',
        description: 'Build Express backend, Mongoose models, and React glassmorphism dashboard.',
        status: 'completed',
        priority: 'high',
        category: 'Coding',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
      },
      {
        title: '🔐 Test User Authentication & Routes',
        description: 'Verify JWT token authorization, protected endpoints, and registration flow.',
        status: 'in-progress',
        priority: 'urgent',
        category: 'Coding',
        dueDate: new Date(Date.now() + 172800000).toISOString(),
      },
      {
        title: '🎨 Review Glassmorphism UI Aesthetics',
        description: 'Ensure color palette, responsive design, and smooth transitions look stunning.',
        status: 'pending',
        priority: 'medium',
        category: 'Personal',
        dueDate: new Date(Date.now() + 259200000).toISOString(),
      }
    ];

    try {
      for (const sample of samples) {
        await API.post('/tasks', sample);
      }
      showToast('Added starter demo tasks!', 'success');
      fetchTasks();
      fetchStats();
    } catch (err) {
      showToast('Could not populate demo tasks', 'error');
    }
  };

  return (
    <div>
      <Navbar />

      <main className="container">
        <div className="dashboard-layout">
          {/* Header Greeting */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                Hello, <span className="gradient-text">{user?.name}</span> 👋
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.15rem' }}>
                Here is a summary of your workspace activities & tasks.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {stats.total === 0 && (
                <button onClick={handleAddSampleTasks} className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
                  <Sparkles size={16} style={{ color: '#fbbf24' }} />
                  <span>Add Sample Tasks</span>
                </button>
              )}
              <button onClick={openCreateModal} className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
                <Plus size={18} />
                <span>Add New Task</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <TaskStats stats={stats} />

          {/* Search and Filters Toolbar */}
          <TaskFilter
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

          {/* Tasks Grid or Empty State */}
          {loading ? (
            <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw className="animate-spin" size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-primary)', marginBottom: '0.5rem' }} />
              <p>Loading your tasks...</p>
            </div>
          ) : tasks.length > 0 ? (
            <div className="task-grid">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onToggleStatus={handleToggleStatus}
                  onEdit={openEditModal}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                <Layers size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No tasks found</h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '420px', fontSize: '0.9rem' }}>
                {search || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all'
                  ? 'No tasks match your current filter criteria. Try clearing filters or search keywords.'
                  : 'Your task list is empty. Get started by creating your very first task or adding sample starter tasks!'}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                {stats.total === 0 ? (
                  <button onClick={handleAddSampleTasks} className="btn btn-secondary">
                    <Sparkles size={16} style={{ color: '#fbbf24' }} />
                    <span>Load Starter Demo Tasks</span>
                  </button>
                ) : null}
                <button onClick={openCreateModal} className="btn btn-primary">
                  <Plus size={18} />
                  <span>Create Task</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Task Modal for Create & Edit */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />
    </div>
  );
};

export default DashboardPage;
