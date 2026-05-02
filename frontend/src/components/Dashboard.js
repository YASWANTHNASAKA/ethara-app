import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = 'https://ethara-app-production.up.railway.app';

function Dashboard({ user, token, onLogout }) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('projects');

  const headers = { Authorization: `Bearer ${token}` };

  const fetchProjects = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/projects`, { headers });
      setProjects(res.data);
    } catch (err) { console.log(err); }
  }, [token]);

  const fetchTasks = useCallback(async (projectId) => {
    try {
      const res = await axios.get(`${API}/api/tasks/${projectId}`, { headers });
      setTasks(res.data);
    } catch (err) { console.log(err); }
  }, [token]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/auth/users`, { headers });
      setUsers(res.data);
    } catch (err) { console.log(err); }
  }, [token]);

  useEffect(() => { fetchProjects(); fetchUsers(); }, [fetchProjects, fetchUsers]);
  useEffect(() => { if (selectedProject) fetchTasks(selectedProject._id); }, [selectedProject, fetchTasks]);

  const createProject = async () => {
    if (!projectName) return setError('Project name required');
    setError('');
    try {
      await axios.post(`${API}/api/projects`, { name: projectName, description: projectDesc }, { headers });
      setProjectName(''); setProjectDesc('');
      fetchProjects();
    } catch (err) { setError(err.response?.data?.message || 'Failed to create project'); }
  };

  const addMember = async (projectId) => {
    if (!memberEmail) return setError('Email required');
    setError('');
    try {
      await axios.post(`${API}/api/projects/${projectId}/members`, { email: memberEmail }, { headers });
      setMemberEmail('');
      fetchProjects();
    } catch (err) { setError(err.response?.data?.message || 'Failed to add member'); }
  };

  const createTask = async () => {
    if (!taskTitle) return setError('Task title required');
    setError('');
    try {
      await axios.post(`${API}/api/tasks`, {
        title: taskTitle, description: taskDesc,
        priority: taskPriority, projectId: selectedProject._id,
        assignedTo: taskAssignee || null, dueDate: taskDueDate || null
      }, { headers });
      setTaskTitle(''); setTaskDesc(''); setTaskPriority('medium');
      setTaskAssignee(''); setTaskDueDate('');
      fetchTasks(selectedProject._id);
    } catch (err) { setError(err.response?.data?.message || 'Failed to create task'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API}/api/tasks/${id}`, { status }, { headers });
      fetchTasks(selectedProject._id);
    } catch (err) { console.log(err); }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API}/api/tasks/${id}`, { headers });
      fetchTasks(selectedProject._id);
    } catch (err) { console.log(err); }
  };

  const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date();
  const todo = tasks.filter(t => t.status === 'todo').length;
  const inprogress = tasks.filter(t => t.status === 'inprogress').length;
  const done = tasks.filter(t => t.status === 'done').length;
  const overdue = tasks.filter(t => isOverdue(t.dueDate) && t.status !== 'done').length;

  return (
    <div className="dashboard">
      <div className="navbar">
        <h1> Team Task Manager</h1>
        <div>
          <span className="role-badge">{user.role === 'admin' ? ' Admin' : '👤 Member'}</span>
          <span style={{ marginRight: 16, marginLeft: 10 }}>Hello, {user.name} </span>
          <button className="btn-logout" onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div className="dashboard-body">
        <div className="tabs">
          <button className={activeTab === 'projects' ? 'tab active' : 'tab'} onClick={() => setActiveTab('projects')}>📁 Projects</button>
          <button className={activeTab === 'tasks' ? 'tab active' : 'tab'} onClick={() => setActiveTab('tasks')} disabled={!selectedProject}>📝 Tasks {selectedProject ? `- ${selectedProject.name}` : ''}</button>
        </div>

        {error && <p className="error" style={{ marginBottom: 16 }}>{error}</p>}

        {activeTab === 'projects' && (
          <div>
            {user.role === 'admin' && (
              <div className="task-form">
                <h3>➕ Create New Project</h3>
                <input type="text" placeholder="Project name" value={projectName} onChange={e => setProjectName(e.target.value)} />
                <textarea placeholder="Description (optional)" value={projectDesc} onChange={e => setProjectDesc(e.target.value)} />
                <button className="btn-add" onClick={createProject}>Create Project</button>
              </div>
            )}

            {projects.length === 0 ? (
              <p className="empty">No projects yet. {user.role === 'admin' ? 'Create one above!' : 'Wait for an admin to add you to a project.'}</p>
            ) : (
              <div className="tasks-grid">
                {projects.map(project => (
                  <div key={project._id} className="task-card medium">
                    <h4>📁 {project.name}</h4>
                    {project.description && <p>{project.description}</p>}
                    <p style={{ fontSize: 12, color: '#999' }}>👑 Admin: {project.admin?.name}</p>
                    <p style={{ fontSize: 12, color: '#999' }}>👥 Members: {project.members?.length}</p>

                    {user.role === 'admin' && String(project.admin?._id) === String(user.id) && (
                      <div style={{ marginTop: 10 }}>
                        <input type="email" placeholder="Add member by email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} style={{ marginBottom: 6 }} />
                        <button className="btn-add" style={{ width: '100%' }} onClick={() => addMember(project._id)}>Add Member</button>
                      </div>
                    )}

                    <button className="btn-status" style={{ marginTop: 10, width: '100%' }} onClick={() => { setSelectedProject(project); setActiveTab('tasks'); }}>
                      📝 View Tasks
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && selectedProject && (
          <div>
            <div className="stats">
              <div className="stat-card"><h3>{tasks.length}</h3><p>Total</p></div>
              <div className="stat-card"><h3>{todo}</h3><p>To Do</p></div>
              <div className="stat-card"><h3>{inprogress}</h3><p>In Progress</p></div>
              <div className="stat-card"><h3>{done}</h3><p>Done</p></div>
              <div className="stat-card"><h3 style={{ color: '#e74c3c' }}>{overdue}</h3><p>Overdue</p></div>
            </div>

            {user.role === 'admin' && (
              <div className="task-form">
                <h3>➕ Add New Task</h3>
                <input type="text" placeholder="Task title" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} />
                <textarea placeholder="Description (optional)" value={taskDesc} onChange={e => setTaskDesc(e.target.value)} />
                <select value={taskPriority} onChange={e => setTaskPriority(e.target.value)}>
                  <option value="low">🟢 Low Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="high">🔴 High Priority</option>
                </select>
                <select value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)}>
                  <option value="">👤 Assign to (optional)</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                </select>
                <input type="date" value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} />
                <button className="btn-add" onClick={createTask}>Add Task</button>
              </div>
            )}

            {tasks.length === 0 ? (
              <p className="empty">No tasks yet. {user.role === 'admin' ? 'Add one above!' : 'Wait for admin to assign tasks.'}</p>
            ) : (
              <div className="tasks-grid">
                {tasks.map(task => (
                  <div key={task._id} className={`task-card ${task.priority} ${isOverdue(task.dueDate) && task.status !== 'done' ? 'overdue' : ''}`}>
                    {isOverdue(task.dueDate) && task.status !== 'done' && <span className="overdue-badge">⚠️ Overdue</span>}
                    <h4>{task.title}</h4>
                    {task.description && <p>{task.description}</p>}
                    {task.assignedTo && <p style={{ fontSize: 12, color: '#667eea' }}>👤 {task.assignedTo.name}</p>}
                    {task.dueDate && <p style={{ fontSize: 12, color: '#999' }}>📅 Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
                    <div className="task-meta">
                      <span className={`badge badge-priority-${task.priority}`}>{task.priority}</span>
                      <span className={`badge badge-${task.status}`}>{task.status}</span>
                    </div>
                    <div className="task-actions">
                      {task.status !== 'inprogress' && task.status !== 'done' && (
                        <button className="btn-status" onClick={() => updateStatus(task._id, 'inprogress')}>▶ Start</button>
                      )}
                      {task.status !== 'done' && (
                        <button className="btn-status" onClick={() => updateStatus(task._id, 'done')}>✅ Done</button>
                      )}
                      {user.role === 'admin' && <button className="btn-delete" onClick={() => deleteTask(task._id)}>🗑</button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;