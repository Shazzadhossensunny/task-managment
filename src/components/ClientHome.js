'use client'

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import TaskForm from '../components/tasks/TaskForm';
import TaskList from '../components/tasks/TaskList';
import { fetchTasks } from '../redux/features/tasks/taskSlice';

export default function ClientHome() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  return (
    <div className="app-container">
      <div className="app-content">
        <h1 className="app-title">Task Management</h1>
        <div className="main-content">
          <TaskForm />
          <TaskList />
        </div>
      </div>
    </div>
  );
}