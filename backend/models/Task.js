const tasks = [];

const createTask = (userId, title, description, priority) => {
  const task = {
    id: Date.now().toString(),
    userId,
    title,
    description: description || '',
    priority: priority || 'medium',
    status: 'todo',
    createdAt: new Date()
  };
  tasks.push(task);
  return task;
};

const getTasksByUser = (userId) => tasks.filter(t => t.userId === userId);

const updateTask = (id, userId, updates) => {
  const task = tasks.find(t => t.id === id && t.userId === userId);
  if (!task) return null;
  Object.assign(task, updates);
  return task;
};

const deleteTask = (id, userId) => {
  const index = tasks.findIndex(t => t.id === id && t.userId === userId);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
};

module.exports = { createTask, getTasksByUser, updateTask, deleteTask };