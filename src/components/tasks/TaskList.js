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
  const [activeTab, setActiveTab] = useState("all"); // Track active tab
  const [deleteTimeouts, setDeleteTimeouts] = useState({});
  const [isMounted, setIsMounted] = useState(false);

  // States for filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // For Completed/Pending
  const [priorityFilter, setPriorityFilter] = useState("all"); // For Low/Medium/High

  useEffect(() => {
    dispatch(fetchTasks());
    setIsMounted(true);
  }, [dispatch]);

  if (!isMounted) {
    return null;
  }

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
    dispatch(toggleTaskComplete(taskId));
  };

  const handleDeleteTask = (taskId) => {
    const toastId = toast(`Task deleted. Undo?`, {
      autoClose: 5000,
      onClose: () => confirmDeleteTask(taskId),
      closeOnClick: false,
      position: "bottom-right",
      toastId: taskId,
    });

    const timeoutId = setTimeout(() => {
      dispatch(deleteTask(taskId));
    }, 5000);

    setDeleteTimeouts((prev) => ({
      ...prev,
      [taskId]: { timeoutId, toastId },
    }));
  };

  const confirmDeleteTask = (taskId) => {
    dispatch(deleteTask(taskId));
    toast.dismiss(taskId);
  };

  const handleUndoDelete = (taskId) => {
    const timeoutData = deleteTimeouts[taskId];
    if (timeoutData) {
      clearTimeout(timeoutData.timeoutId);
      toast.dismiss(timeoutData.toastId);
      setDeleteTimeouts((prev) => {
        const { [taskId]: _, ...rest } = prev;
        return rest;
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

  // Filter tasks based on status, priority, and search term
  const filteredTasks = filteredItems.filter((task) => {
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "completed" && task.completed) ||
      (statusFilter === "pending" && !task.completed);

    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;

    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });

  const groupedTasks = groupTasksByCategory(filteredTasks);
  const tabs = ["all", ...Object.keys(groupedTasks)];

  const getTasksForActiveTab = () => {
    if (activeTab === "all") {
      return filteredTasks; // Return all tasks
    }
    return groupedTasks[activeTab] || []; // Return tasks for the selected category
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

      {/* Tabs for Categories */}
      <div className="task-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "all" ? "All Tasks" : tab}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="task-categories">
        <ul className="task-list grid">
          {getTasksForActiveTab().map((task) => (
            <li key={task._id} className={`task-item ${
                task.completed ? "completed" : ""
              } ${getPriorityClass(task.priority)} ${
                isTaskDueSoon(task.dueDate, task.reminder) ? "due-soon" : ""
              }`}>
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
                <button onClick={() => handleDeleteTask(task._id)}>Delete</button>
                {deleteTimeouts[task._id] && (
                  <button onClick={() => handleUndoDelete(task._id)}>Undo</button>
                )}
                {/* Reminder Toggle */}
                <button onClick={() => handleToggleReminder(task)}>
                  {task.reminder ? "Turn off Reminder" : "Turn on Reminder"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

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

// Group tasks by category function
const groupTasksByCategory = (tasks) => {
  return tasks.reduce((groups, task) => {
    const category = task.category || "Uncategorized"; // Fallback category
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(task);
    return groups;
  }, {});
};

export default TaskList;
