const { v4: uuidv4 } = require('uuid');
const { readJson, writeJson } = require('../utils/fileStore');

function normalize(todo) {
  return {
    id: todo.id || uuidv4(),
    title: String(todo.title || '').trim(),
    description: String(todo.description || ''),
    priority: ['low','medium','high'].includes(todo.priority) ? todo.priority : 'medium',
    status: ['pending','in_progress','completed'].includes(todo.status) ? todo.status : 'pending',
    due_date: todo.due_date || null,
    created_at: todo.created_at || new Date().toISOString()
  };
}

async function getAll(req, res) {
  try {
    const list = await readJson('todos', []);
    res.json({ success: true, data: { todos: Array.isArray(list) ? list : [] } });
  } catch (error) {
    console.error('todos.getAll error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch todos' });
  }
}

async function create(req, res) {
  try {
    const list = Array.isArray(await readJson('todos', [])) ? await readJson('todos', []) : [];
    const todo = normalize(req.body || {});
    await writeJson('todos', [todo, ...list]);
    res.status(201).json({ success: true, data: { todo } });
  } catch (error) {
    console.error('todos.create error:', error);
    res.status(500).json({ success: false, error: 'Failed to create todo' });
  }
}

async function update(req, res) {
  try {
    const id = req.params.id;
    const list = Array.isArray(await readJson('todos', [])) ? await readJson('todos', []) : [];
    const idx = list.findIndex(t => t.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Not found' });
    const prev = list[idx];
    const patch = normalize({ ...prev, ...req.body, id: prev.id, created_at: prev.created_at });
    list[idx] = patch;
    await writeJson('todos', list);
    res.json({ success: true, data: { todo: patch } });
  } catch (error) {
    console.error('todos.update error:', error);
    res.status(500).json({ success: false, error: 'Failed to update todo' });
  }
}

async function remove(req, res) {
  try {
    const id = req.params.id;
    const list = Array.isArray(await readJson('todos', [])) ? await readJson('todos', []) : [];
    const idx = list.findIndex(t => t.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Not found' });
    list.splice(idx, 1);
    await writeJson('todos', list);
    res.json({ success: true });
  } catch (error) {
    console.error('todos.remove error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete todo' });
  }
}

async function stats(req, res) {
  try {
    const list = Array.isArray(await readJson('todos', [])) ? await readJson('todos', []) : [];
    const total = list.length;
    const pending = list.filter(t => t.status === 'pending').length;
    const inProgress = list.filter(t => t.status === 'in_progress').length;
    const completed = list.filter(t => t.status === 'completed').length;
    const highPriority = list.filter(t => t.priority === 'high').length;
    res.json({ total, pending, inProgress, completed, highPriority });
  } catch (error) {
    console.error('todos.stats error:', error);
    res.status(500).json({ total: 0, pending: 0, inProgress: 0, completed: 0, highPriority: 0 });
  }
}

module.exports = { getAll, create, update, remove, stats };