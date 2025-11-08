import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function TodosManager() {
  const { authFetch } = useAuth();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTodo, setEditingTodo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    due_date: ''
  });
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: ''
  });

  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      const matchesStatus = filters.status === 'all' || todo.status === filters.status;
      const matchesPriority = filters.priority === 'all' || todo.priority === filters.priority;
      const matchesSearch = !filters.search ||
        todo.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        todo.description.toLowerCase().includes(filters.search.toLowerCase());
      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [todos, filters]);

  const stats = useMemo(() => {
    const total = todos.length;
    const pending = todos.filter(t => t.status === 'pending').length;
    const inProgress = todos.filter(t => t.status === 'in_progress').length;
    const completed = todos.filter(t => t.status === 'completed').length;
    const highPriority = todos.filter(t => t.priority === 'high').length;
    return { total, pending, inProgress, completed, highPriority };
  }, [todos]);

  async function refresh() {
    setLoading(true);
    try {
      const r = await authFetch('/api/admin/todos');
      if (r.ok) {
        const d = await r.json();
        setTodos(d.data.todos || []);
      }
    } catch (error) {
      setMessage('Failed to load todos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function resetForm() {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      due_date: ''
    });
    setEditingTodo(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');

    const payload = {
      ...formData,
      due_date: formData.due_date || null
    };

    const url = editingTodo ? `/api/admin/todos/${editingTodo.id}` : '/api/admin/todos';
    const method = editingTodo ? 'PUT' : 'POST';

    try {
      const r = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (r.ok) {
        setMessage(editingTodo ? 'Todo updated' : 'Todo created');
        resetForm();
        refresh();
        setTimeout(() => setMessage(''), 2000);
      } else {
        setMessage('Failed to save todo');
      }
    } catch (error) {
      setMessage('Failed to save todo');
    }
  }

  function startEdit(todo) {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority,
      status: todo.status,
      due_date: todo.due_date ? todo.due_date.split('T')[0] : ''
    });
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this todo?')) return;

    try {
      const r = await authFetch(`/api/admin/todos/${id}`, { method: 'DELETE' });
      if (r.ok) {
        setMessage('Todo deleted');
        refresh();
        setTimeout(() => setMessage(''), 2000);
      } else {
        setMessage('Failed to delete todo');
      }
    } catch (error) {
      setMessage('Failed to delete todo');
    }
  }

  function getPriorityColor(priority) {
    switch (priority) {
      case 'high': return 'text-red-300 bg-red-500/20';
      case 'medium': return 'text-yellow-300 bg-yellow-500/20';
      case 'low': return 'text-green-300 bg-green-500/20';
      default: return 'text-white/70 bg-white/10';
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'completed': return 'text-green-300 bg-green-500/20';
      case 'in_progress': return 'text-blue-300 bg-blue-500/20';
      case 'pending': return 'text-yellow-300 bg-yellow-500/20';
      default: return 'text-white/70 bg-white/10';
    }
  }

  return (
    <div className="p-4 space-y-6 text-white">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">Todos Manager</div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilters({ status: 'all', priority: 'all', search: '' })}
            className="text-sm px-3 py-1 rounded bg-white/10 hover:bg-white/15"
          >
            Clear Filters
          </button>
          <button
            onClick={refresh}
            className="text-sm px-3 py-1 rounded bg-white/10 hover:bg-white/15"
          >
            Refresh
          </button>
        </div>
      </div>

      {message && (
        <div className={`text-sm p-3 rounded ${message.includes('Failed') ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
          {message}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
          <div className="text-lg font-bold text-yellow-300">{stats.total}</div>
          <div className="text-xs text-white/70">Total</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
          <div className="text-lg font-bold text-yellow-300">{stats.pending}</div>
          <div className="text-xs text-white/70">Pending</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
          <div className="text-lg font-bold text-blue-300">{stats.inProgress}</div>
          <div className="text-xs text-white/70">In Progress</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
          <div className="text-lg font-bold text-green-300">{stats.completed}</div>
          <div className="text-xs text-white/70">Completed</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
          <div className="text-lg font-bold text-red-300">{stats.highPriority}</div>
          <div className="text-xs text-white/70">High Priority</div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-white/70 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
            className="w-full bg-neutral-800/70 border border-white/10 rounded p-2"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-white/70 mb-1">Priority</label>
          <select
            value={filters.priority}
            onChange={(e) => setFilters(f => ({ ...f, priority: e.target.value }))}
            className="w-full bg-neutral-800/70 border border-white/10 rounded p-2"
          >
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-white/70 mb-1">Search</label>
          <input
            value={filters.search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            placeholder="Search todos..."
            className="w-full bg-neutral-800/70 border border-white/10 rounded p-2"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Add/Edit Form */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-lg font-semibold mb-3">
            {editingTodo ? 'Edit Todo' : 'Add New Todo'}
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm text-white/70 mb-1">Title *</label>
              <input
                required
                value={formData.title}
                onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
                className="w-full bg-neutral-800/70 border border-white/10 rounded p-2"
                placeholder="Todo title"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full bg-neutral-800/70 border border-white/10 rounded p-2"
                placeholder="Todo description"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-white/70 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(f => ({ ...f, priority: e.target.value }))}
                  className="w-full bg-neutral-800/70 border border-white/10 rounded p-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(f => ({ ...f, status: e.target.value }))}
                  className="w-full bg-neutral-800/70 border border-white/10 rounded p-2"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(f => ({ ...f, due_date: e.target.value }))}
                className="w-full bg-neutral-800/70 border border-white/10 rounded p-2"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-yellow-500/90 text-black font-semibold py-2 px-4 rounded hover:bg-yellow-400"
              >
                {editingTodo ? 'Update' : 'Add'} Todo
              </button>
              {editingTodo && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Todos List */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-lg font-semibold mb-3">Todos ({filteredTodos.length})</div>
          <div className="space-y-3 max-h-96 overflow-auto">
            {loading ? (
              <div className="text-white/60">Loading...</div>
            ) : filteredTodos.length === 0 ? (
              <div className="text-white/60">No todos found</div>
            ) : (
              filteredTodos.map(todo => (
                <div key={todo.id} className="rounded-lg border border-white/10 bg-black/30 p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{todo.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(todo.priority)}`}>
                          {todo.priority}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(todo.status)}`}>
                          {todo.status.replace('_', ' ')}
                        </span>
                      </div>
                      {todo.description && (
                        <p className="text-sm text-white/70 mb-2">{todo.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-white/50">
                        {todo.due_date && (
                          <span>Due: {new Date(todo.due_date).toLocaleDateString()}</span>
                        )}
                        <span>Created: {new Date(todo.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-3">
                      <button
                        onClick={() => startEdit(todo)}
                        className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/15"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(todo.id)}
                        className="text-xs px-2 py-1 rounded bg-red-500/80 hover:bg-red-500 text-black font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
