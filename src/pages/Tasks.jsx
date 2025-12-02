import { useState } from 'react';
import { Plus } from 'lucide-react';

function Tasks() {
  const [filter, setFilter] = useState('all');

  const tasks = [
    {
      id: 1,
      title: 'Update Q4 Reports',
      description: 'Complete the quarterly sales reports for review',
      status: 'pending',
      priority: 'high',
      dueDate: 'Nov 15, 2024'
    },
    {
      id: 2,
      title: 'Team Meeting Prep',
      description: 'Prepare agenda and materials for weekly team sync',
      status: 'pending',
      priority: 'medium',
      dueDate: 'Nov 12, 2024'
    },
    {
      id: 3,
      title: 'Review SOPs',
      description: 'Review and update standard operating procedures',
      status: 'completed',
      priority: 'low',
      dueDate: 'Nov 10, 2024'
    },
  ];

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  return (
    <div>
      <div className="tasks-header">
        <div>
          <h1>My Tasks</h1>
          <p>Manage and track your assignments</p>
        </div>
        <button className="btn btn-primary" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={20} />
          New Task
        </button>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Tasks ({tasks.length})
        </button>
        <button
          className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({tasks.filter(t => t.status === 'pending').length})
        </button>
        <button
          className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({tasks.filter(t => t.status === 'completed').length})
        </button>
      </div>

      <div className="tasks-grid">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p>No tasks found</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className="task-card">
              <div className="task-header">
                <div>
                  <h3 className="task-title">{task.title}</h3>
                  <p className="task-description">{task.description}</p>
                </div>
                <span className={`priority-badge ${task.priority}`}>
                  {task.priority}
                </span>
              </div>
              <div className="task-footer">
                <span className="list-subtitle">📅 Due: {task.dueDate}</span>
                <span className={`badge ${task.status === 'completed' ? 'success' : 'warning'}`}>
                  {task.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Tasks;