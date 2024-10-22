"use client";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchTasks,
  updateTask,
  toggleTaskComplete,
  deleteTask,
  setFilter,
} from "../../redux/features/tasks/taskSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditTaskModal from "../ui/EditTaskModal";

const TaskList = () => {
  const { filteredItems, filters, status, error } = useSelector(
    (state) => state?.tasks
  );
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [deleteTimeouts, setDeleteTimeouts] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleFilterChange = (e) => {
    dispatch(setFilter({ [e.target.name]: e.target.value }));
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setTaskToEdit(null);
  };

  const handleSaveTask = (updatedTask) => {
    dispatch(updateTask({ id: updatedTask._id, updates: updatedTask }))
      .unwrap()
      .then(() => {
        toast.success("Task updated successfully!");
      })
      .catch(() => {
        toast.error("Failed to update task");
      });
    handleModalClose();
  };

  const handleToggleComplete = (taskId) => {
    try {
      dispatch(toggleTaskComplete(taskId));
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDeleteTask = (taskId) => {
    // Display a notification and set a timer to delete the task after 5 seconds
    const toastId = toast(`Task deleted. Undo?`, {
      autoClose: 5000,
      onClose: () => confirmDeleteTask(taskId), // If no undo, permanently delete
      closeOnClick: false,
      position: "bottom-right",
      toastId: taskId,
    });

    // Store the timeout ID in case we need to cancel it
    const timeoutId = setTimeout(() => {
      dispatch(deleteTask(taskId));
    }, 5000);

    // Save timeout info for future cancellation
    setDeleteTimeouts((prev) => ({
      ...prev,
      [taskId]: { timeoutId, toastId },
    }));
  };

  const confirmDeleteTask = (taskId) => {
    dispatch(deleteTask(taskId));
    toast.dismiss(taskId); // Close the toast if user doesn't undo
  };

  const handleUndoDelete = (taskId) => {
    const timeoutData = deleteTimeouts[taskId];
    if (timeoutData) {
      clearTimeout(timeoutData.timeoutId); // Cancel deletion
      toast.dismiss(timeoutData.toastId); // Close the toast
      setDeleteTimeouts((prev) => {
        const { [taskId]: _, ...rest } = prev;
        return rest; // Remove from timeout state
      });
    }
  };
  // Handle reminder toggle for each task
  const handleToggleReminder = (task) => {
    const updatedTask = { ...task, reminder: !task.reminder }; // Toggle reminder
    dispatch(updateTask({ id: task._id, updates: updatedTask }))
      .unwrap()
      .then(() => {
        const message = updatedTask.reminder
          ? "Reminder turned on!"
          : "Reminder turned off!";
        toast.success(message);
      })
      .catch(() => {
        toast.error("Failed to update reminder");
      });
  };
  // due task reminder 24 hour
  const isTaskDueSoon = (dueDate, reminder) => {
    const now = new Date();
    const due = new Date(dueDate);
    const timeDifference = due - now;
    return (
      reminder && timeDifference > 0 && timeDifference <= 24 * 60 * 60 * 1000
    ); // Within 24 hours
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "low":
        return "task-low"; // Green
      case "medium":
        return "task-medium"; // Yellow
      case "high":
        return "task-high"; // Red
      default:
        return "";
    }
  };

  if (status === "loading") {
    return <p>Loading tasks...</p>;
  }

  if (status === "failed") {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="task-list-container">
      {/* Filters */}
      <div className="filters">
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
        >
          <option value="all">All Tasks</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>

        <select
          name="priority"
          value={filters.priority}
          onChange={handleFilterChange}
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Search tasks..."
          className="task-search"
        />
      </div>

      {/* Task List */}
      <ul className="task-list">
        {filteredItems.length > 0 ? (
          filteredItems.map((task) => (
            <li
              key={task._id}
              className={`task-item ${
                task.completed ? "completed" : ""
              } ${getPriorityClass(task.priority)} ${
                isTaskDueSoon(task.dueDate, task.reminder) ? "due-soon" : ""
              }`}
            >
              <div>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <small>Due: {task.dueDate}</small>
                <p>Priority: {task.priority}</p>
                <p>Tags: {(task.tags || []).join(", ")}</p>
              </div>

              <div className="task-actions">
                <button onClick={() => handleEditTask(task)}>Edit</button>
                <button onClick={() => handleToggleComplete(task._id)}>
                  {task?.completed ? "Mark as Incomplete" : "Mark as Complete"}
                </button>
                <button onClick={() => handleDeleteTask(task._id)}>
                  Delete
                </button>
                {/* Undo button */}
                {deleteTimeouts[task._id] && (
                  <button onClick={() => handleUndoDelete(task._id)}>
                    Undo
                  </button>
                )}
                {/* Reminder Toggle */}
                <button onClick={() => handleToggleReminder(task)}>
                  {task.reminder ? "Turn off Reminder" : "Turn on Reminder"}
                </button>
              </div>
            </li>
          ))
        ) : (
          <p>No tasks found.</p>
        )}
      </ul>
      {showModal && (
        <EditTaskModal
          task={taskToEdit}
          onClose={handleModalClose}
          onSave={handleSaveTask}
        />
      )}
      <ToastContainer />
    </div>
  );
};

export default TaskList;
