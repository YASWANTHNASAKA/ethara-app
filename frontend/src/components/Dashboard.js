import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard({ user, token, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [error, setError] = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tasks', { headers });
      setTasks(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const addTask = async () => {
    if (!title) return setError('Title is required');
    setError('');
    try {
      await axios.post('http://localhost:5000/api/tasks', { title, description, priority }, { headers });
      setTitle('');
      setDescription('');
      setPriority('medium');
      fetchTasks();
    } catch (err) {
      setError('Failed to add task');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/tasks/${id}`, { status }, { headers });
      fetchTasks();
    } catch (err) {
      console.log(err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`, { headers });
      fetchTasks();
    } catch (err) {
      console.log(err);
    }
  };

  const todo = tasks.filter(t => t.status === 'todo').length;
  const inprogress = tasks.filter(t => t.status === 'inprogress').length;
  const done = tasks.filter(t => t.status === 'done').length;

  return (
    <div className="dashboard">
      <div className="navbar">
        <h1>📋 Task Manager</h1>
        <div>
          <span style={{ marginRight: 16 }}>Hello, {user.name} 👋</span>
          <button className="btn-logout" onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div className="dashboard-body">
        <div className="stats">
          <div className="stat-card"><h3>{tasks.length}</h3><p>Total Tasks</p></div>
          <div className="stat-card"><h3>{todo}</h3><p>To Do</p></div>
          <div className="stat-card"><h3>{inprogress}</h3><p>In Progress</p></div>
          <div className="stat-card"><h3>{done}</h3><p>Done</p></div>
        </div>

        <div className="task-form">
          <h3>➕ Add New Task</h3>
          {error && <p className="error">{error}</p>}
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <select value={priority} onChange={e => setPriority(e.target.value)}>
            <option value="low">🟢 Low Priority</option>
            <option value="medium">🟡 Medium Priority</option>
            <option value="high">🔴 High Priority</option>
          </select>
          <button className="btn-add" onClick={addTask}>Add Task</button>
        </div>

        {tasks.length === 0 ? (
          <p className="empty">No tasks yet. Add your first task above! 🎯</p>
        ) : (
          <div className="tasks-grid">
            {tasks.map(task => (
              <div key={task.id} className={`task-card ${task.priority}`}>
                <h4>{task.title}</h4>
                {task.description && <p>{task.description}</p>}
                <div className="task-meta">
                  <span className={`badge badge-priority-${task.priority}`}>{task.priority}</span>
                  <span className={`badge badge-${task.status}`}>{task.status}</span>
                </div>
                <div className="task-actions">
                  {task.status !== 'inprogress' && task.status !== 'done' && (
                    <button className="btn-status" onClick={() => updateStatus(task.id, 'inprogress')}>▶ Start</button>
                  )}
                  {task.status !== 'done' && (
                    <button className="btn-status" onClick={() => updateStatus(task.id, 'done')}>✅ Done</button>
                  )}
                  <button className="btn-delete" onClick={() => deleteTask(task.id)}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;