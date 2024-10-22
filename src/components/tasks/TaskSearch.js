// components/tasks/TaskSearch.js

'use client'
import { useDispatch } from 'react-redux';
import { setFilter } from '../../redux/features/tasks/taskSlice';

const TaskSearch = () => {
  const dispatch = useDispatch();

  const handleSearch = (e) => {
    dispatch(setFilter({ search: e.target.value }));
  };

  return (
    <div className="task-search">
      <input
        type="text"
        placeholder="Search tasks..."
        onChange={handleSearch}
        className="search-input"
      />
    </div>
  );
};

export default TaskSearch;