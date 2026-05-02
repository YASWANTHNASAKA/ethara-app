const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Task = require('../models/Task');
const Project = require('../models/Project');

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all tasks for a project
router.get('/:projectId', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create task (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.userRole !== 'admin')
      return res.status(403).json({ message: 'Admin access required' });

    const { title, description, priority, projectId, assignedTo, dueDate } = req.body;
    if (!title || !projectId)
      return res.status(400).json({ message: 'Title and project required' });

    const task = await Task.create({
      title, description, priority,
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.userId,
      dueDate: dueDate || null
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task status
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    Object.assign(task, req.body);
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete task (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.userRole !== 'admin')
      return res.status(403).json({ message: 'Admin access required' });
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;