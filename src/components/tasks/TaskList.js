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
import Swal from 'sweetalert2'


const TaskList = () => {
    const { filteredItems, filters, status, error } = useSelector(
        (state) => state?.tasks
      );
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [deleteTimeouts, setDeleteTimeouts] = useState({});
  const [isMounted, setIsMounted] = useState(false);

  // States for filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

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
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "custom-confirm-button",
        cancelButton: "custom-cancel-button"
      },
      buttonsStyling: false
    });

    swalWithBootstrapButtons.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Undo",
      reverseButtons: true
    }).then((result) => {
      if (result?.isConfirmed) {
        // If confirmed, delete the task
        dispatch(deleteTask(taskId));

        swalWithBootstrapButtons.fire({
          title: "Deleted!",
          text: "Your task has been deleted.",
          icon: "success"
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithBootstrapButtons.fire({
          title: "Undo",
          text: "Your task is safe :)",
          icon: "error"
        });
      }
    });
  };


   // Handle reminder toggle for each task
   const handleToggleReminder = (task) => {
    const updatedTask = { ...task, reminder: !task.reminder };
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
    due.setHours(23, 59, 59, 999);
    const timeDifference = due - now;
    return (
      reminder && timeDifference > 0 && timeDifference <= 24 * 60 * 60 * 1000
    );
  };

  // Filter tasks based on status, priority, and search term
  const filteredTasks = filteredItems.filter((task) => {
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "completed" && task.completed) ||
      (statusFilter === "pending" && !task.completed);

    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;

    const matchesSearch = task?.title?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm?.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });

  const groupedTasks = groupTasksByCategory(filteredTasks);
  const tabs = ["all", ...Object.keys(groupedTasks)];

  const getTasksForActiveTab = () => {
    if (activeTab === "all") {
      return filteredTasks;
    }
    return groupedTasks[activeTab] || [];
  };


  const getPriorityClass = (priority) => {
    switch (priority) {
      case "low":
        return "task-low";
      case "medium":
        return "task-medium";
      case "high":
        return "task-high";
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
              } ${getPriorityClass(task?.priority)} ${
                isTaskDueSoon(task?.dueDate, task?.reminder) ? "due-soon" : ""
              }`}>
              <div>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <small>Due: {task.dueDate}</small>
                <p>Priority: {task.priority}</p>
                <p>Tags: {(task.tags || []).join(", ")}</p>
              </div>

              <div className="task-actions">
                <button className="edit-btn" onClick={() => handleEditTask(task)}>Edit</button>
                <button className="mark-btn" onClick={() => handleToggleComplete(task._id)}>
                  {task?.completed ? "Mark as Incomplete" : "Mark as Complete"}
                </button>
                <button className="delete-btn" onClick={() => handleDeleteTask(task._id)}>Delete</button>
                {deleteTimeouts[task._id] && (
                  <button className="undo-btn" onClick={() => handleUndoDelete(task._id)}>Undo</button>
                )}
                {/* Reminder Toggle */}
                <button className="reminder-btn" onClick={() => handleToggleReminder(task)}>
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
    const category = task.category || "Uncategorized";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(task);
    return groups;
  }, {});
};

export default TaskList;
