// components/tasks/TaskFilter.js
'use client'
import { useDispatch, useSelector } from 'react-redux';
import { setFilter } from '../../redux/features/tasks/taskSlice';

const TaskFilter = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.tasks);

  const handleFilterChange = (type, value) => {
    dispatch(setFilter({ [type]: value }));
  };

  return (
    <div className="task-filters">
      <div className="filter-group">
        <label>Status:</label>
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="filter-select"
        >
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Priority:</label>
        <select
          value={filters.priority}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          className="filter-select"
        >
          <option value="all">All</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Tags:</label>
        <select
          value={filters.tags}
          onChange={(e) => handleFilterChange('tags', e.target.value)}
          className="filter-select"
          multiple
        >
          <option value="work">Work</option>
          <option value="personal">Personal</option>
          <option value="shopping">Shopping</option>
        </select>
      </div>
    </div>
  );
};

export default TaskFilter;