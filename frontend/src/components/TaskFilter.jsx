import React from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

const TaskFilter = ({ search, setSearch, statusFilter, setStatusFilter, priorityFilter, setPriorityFilter, categoryFilter, setCategoryFilter, sortBy, setSortBy }) => {
  return (
    <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Search input */}
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input
            type="text"
            className="glass-input"
            style={{ paddingLeft: '2.75rem' }}
            placeholder="Search tasks by title or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status Filter Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(15, 23, 42, 0.7)',
          padding: '4px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
          overflowX: 'auto'
        }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'pending', label: 'Pending' },
            { id: 'in-progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              style={{
                padding: '0.45rem 0.9rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === tab.id ? 'var(--accent-primary)' : 'transparent',
                color: statusFilter === tab.id ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary dropdown filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-subtle)', fontWeight: 600 }}>
          <Filter size={14} />
          <span>FILTERS:</span>
        </div>

        {/* Priority Filter */}
        <select
          className="glass-input"
          style={{ width: 'auto', padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="all" style={{ background: '#0f172a' }}>All Priorities</option>
          <option value="low" style={{ background: '#0f172a' }}>Low Priority</option>
          <option value="medium" style={{ background: '#0f172a' }}>Medium Priority</option>
          <option value="high" style={{ background: '#0f172a' }}>High Priority</option>
          <option value="urgent" style={{ background: '#0f172a' }}>Urgent Priority</option>
        </select>

        {/* Category Filter */}
        <select
          className="glass-input"
          style={{ width: 'auto', padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all" style={{ background: '#0f172a' }}>All Categories</option>
          <option value="Work" style={{ background: '#0f172a' }}>Work</option>
          <option value="Personal" style={{ background: '#0f172a' }}>Personal</option>
          <option value="Coding" style={{ background: '#0f172a' }}>Coding</option>
          <option value="Health" style={{ background: '#0f172a' }}>Health</option>
          <option value="Finance" style={{ background: '#0f172a' }}>Finance</option>
          <option value="Other" style={{ background: '#0f172a' }}>Other</option>
        </select>

        {/* Sort selector */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ArrowUpDown size={14} style={{ color: 'var(--text-subtle)' }} />
          <select
            className="glass-input"
            style={{ width: 'auto', padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest" style={{ background: '#0f172a' }}>Sort: Newest First</option>
            <option value="oldest" style={{ background: '#0f172a' }}>Sort: Oldest First</option>
            <option value="dueDate" style={{ background: '#0f172a' }}>Sort: Due Date</option>
            <option value="title" style={{ background: '#0f172a' }}>Sort: Title A-Z</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TaskFilter;
