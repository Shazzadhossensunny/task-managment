'use client'

// components/tasks/TaskItem.js
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteTask, updateTask, toggleTaskComplete } from '../../redux/features/tasks/taskSlice';


const TaskItem = ({ task }) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);

  const handleDelete = () => {
    dispatch(deleteTask(task._id));
    // Show undo notification
    const notification = document.createElement('div');
    notification.className = 'undo-notification';
    notification.innerHTML = `
      Task deleted
      <button onclick="handleUndo('${task._id}')">Undo</button>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 5000);
  };

  const handleUpdate = () => {
    dispatch(updateTask({ id: task._id, updates: editedTask }));
    setIsEditing(false);
  };

  const handleToggleComplete = () => {
    dispatch(toggleTaskComplete(task._id));
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'var(--priority-high)';
      case 'medium':
        return 'var(--priority-medium)';
      case 'low':
        return 'var(--priority-low)';
      default:
        return 'var(--priority-low)';
    }
  };

  return (
    <div
      className={`task-item ${task.completed ? 'completed' : ''}`}
      style={{ borderLeftColor: getPriorityColor(task.priority) }}
    >
      {isEditing ? (
        <div className="task-edit-form">
          <input
            type="text"
            value={editedTask.title}
            onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
            className="edit-input"
          />
          <textarea
            value={editedTask.description}
            onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
            className="edit-textarea"
          />
          <div className="edit-actions">
            <button onClick={handleUpdate} className="save-btn">Save</button>
            <button onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div className="task-header">
            <h3 className="task-title">{task.title}</h3>
            <div className="task-actions">
              <button onClick={() => setIsEditing(true)} className="edit-btn">Edit</button>
              <button onClick={handleDelete} className="delete-btn">Delete</button>
            </div>
          </div>
          <p className="task-description">{task.description}</p>
          <div className="task-meta">
            <span className="task-due-date">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
            <span className={`task-priority priority-${task.priority.toLowerCase()}`}>
              {task.priority}
            </span>
          </div>
          <div className="task-tags">
            {task.tags.map((tag, index) => (
              <span key={index} className="task-tag">{tag}</span>
            ))}
          </div>
          <div className="task-footer">
            <label className="complete-checkbox">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={handleToggleComplete}
              />
              Complete
            </label>
            {task.reminder && (
              <span className="reminder-badge">
                Reminder Set
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TaskItem;