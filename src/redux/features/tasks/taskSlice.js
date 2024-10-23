import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Fetch all tasks from the backend
export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async () => {
  const response = await fetch('/api/tasks');
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
});

// Add a new task to the backend
export const addTask = createAsyncThunk('tasks/addTask', async (task, { dispatch }) => {
  const newTask = { ...task, completed: false };

  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTask),
    });

    if (!response.ok) {
      throw new Error('Failed to add task');
    }

    const data = await response.json();

    // Optionally refetch tasks after adding one
    dispatch(fetchTasks());

    return data;
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
});


// Update task completion status in the backend
export const toggleTaskComplete = createAsyncThunk(
  'tasks/toggleTaskComplete',
  async (taskId, { getState }) => {
    const task = getState().tasks.items.find((t) => t._id === taskId);
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completed: !task.completed }),
    });
    if (!response.ok) {
      throw new Error('Failed to update task');
    }
    return response.json();
  }
);

// Update a task in the backend
export const updateTask = createAsyncThunk('tasks/updateTask', async ({ id, updates }) => {
  const { _id, ...filteredUpdates } = updates;
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(filteredUpdates),
  });
  if (!response.ok) {
    throw new Error('Failed to update task');
  }
  return response.json();
});

// Delete a task in the backend
export const deleteTask = createAsyncThunk('tasks/deleteTask', async (taskId, { dispatch }) => {
  const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error('Failed to delete task');
  }
  dispatch(fetchTasks());
  return taskId;
});

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    items: [],
    filteredItems: [],
    status: 'idle',
    error: null,
    filters: {
      status: 'all',
      priority: 'all',
      tags: [],
      search: '',
    },
  },
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };

      // Apply filters to tasks
      state.filteredItems = state.items.filter((task) => {
        const matchesStatus = state.filters.status === 'all' || (state.filters.status === 'completed' ? task.completed : !task.completed);
        const matchesPriority = state.filters.priority === 'all' || task.priority === state.filters.priority;
        const matchesTags = state.filters.tags.length === 0 || state.filters.tags.every((tag) => task.tags.includes(tag));
        const taskTitle = task.title.toLowerCase();
        const taskDescription = task.description.toLowerCase();
        const matchesSearch = taskTitle.includes(state.filters.search.toLowerCase()) || taskDescription.includes(state.filters.search.toLowerCase());
        return matchesStatus && matchesPriority && matchesTags && matchesSearch;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.filteredItems = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.filteredItems.push(action.payload);
      })
      .addCase(toggleTaskComplete.fulfilled, (state, action) => {
        const updatedTask = action.payload;
        const taskIndex = state.items.findIndex((task) => task._id === updatedTask._id);
        if (taskIndex !== -1) {
          state.items[taskIndex] = updatedTask;
          state.filteredItems[taskIndex] = updatedTask;
        }
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const updatedTask = action.payload;
        const taskIndex = state.items.findIndex((task) => task._id === updatedTask._id);
        if (taskIndex !== -1) {
          state.items[taskIndex] = updatedTask;
          state.filteredItems[taskIndex] = updatedTask;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        const taskId = action.payload;
        state.items = state.items.filter((task) => task._id !== taskId);
        state.filteredItems = state.filteredItems.filter((task) => task._id !== taskId);
      });
  },
});

// Export actions
export const { setFilter } = taskSlice.actions;
export default taskSlice.reducer;
