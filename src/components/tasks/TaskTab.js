'use client'

// components/TaskTabs.js
import { useState } from 'react';
import TaskItem from './TaskItem';


const TaskTabs = ({ tasks }) => {
  const [activeTab, setActiveTab] = useState('all');

  // Function to group tasks by category
  const groupTasksByCategory = (tasks) => {
    return tasks.reduce((acc, task) => {
      const category = task.category || 'Uncategorized';  // Handle tasks with no category
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(task);
      return acc;
    }, {});
  };

  // Group tasks by category
  const groupedTasks = groupTasksByCategory(tasks);

  return (
    <div>
      {/* Tab Navigation */}
      <ul className="tabs">
        <li
          className={activeTab === 'all' ? 'active' : ''}
          onClick={() => setActiveTab('all')}
        >
          All Tasks
        </li>
        {Object.keys(groupedTasks).map((category) => (
          <li
            key={category}
            className={activeTab === category ? 'active' : ''}
            onClick={() => setActiveTab(category)}
          >
            {category}
          </li>
        ))}
      </ul>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'all' && (
          <div className="task-grid">
            {tasks.map((task) => (
              <TaskItem key={task._id} task={task} />
            ))}
          </div>
        )}
        {activeTab !== 'all' && (
          <div className="task-grid">
            {groupedTasks[activeTab].map((task) => (
              <TaskItem key={task._id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskTabs;
