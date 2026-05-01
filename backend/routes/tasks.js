const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { createTask, getTasksByUser, updateTask, deleteTask } = require('../models/Task');

// Middleware to verify token
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all tasks
router.get('/', auth, (req, res) => {
  const tasks = getTasksByUser(req.userId);
  res.json(tasks);
});

// Create task
router.post('/', auth, (req, res) => {
  const { title, description, priority } = req.body;
  if (!title) return res.status(400).json({ message: 'Title required' });
  const task = createTask(req.userId, title, description, priority);
  res.status(201).json(task);
});

// Update task
router.put('/:id', auth, (req, res) => {
  const task = updateTask(req.params.id, req.userId, req.body);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
});

// Delete task
router.delete('/:id', auth, (req, res) => {
  const deleted = deleteTask(req.params.id, req.userId);
  if (!deleted) return res.status(404).json({ message: 'Task not found' });
  res.json({ message: 'Task deleted' });
});

module.exports = router;