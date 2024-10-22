// components/TaskItem.js
const TaskItem = ({ task }) => {
  return (
    <div className="task-item">
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <p>Category: {task.category || 'Uncategorized'}</p>
    </div>
  );
};

export default TaskItem;
