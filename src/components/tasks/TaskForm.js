'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addTask } from '../../redux/features/tasks/taskSlice';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TaskForm = () => {

  const dispatch = useDispatch();



  // State to store form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'low',
    tags: [],
    newTag: '',
    reminder: false,
    category: ''

  });



  // State to handle errors
  const [errors, setErrors] = useState({});

  // Form validation function
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Task name is required.';

    const today = new Date().setHours(0, 0, 0, 0);
    if (!formData.dueDate || new Date(formData.dueDate) < today) {
      newErrors.dueDate = 'Due date must be in the future.';
    }

    return newErrors;
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const task = {
      ...formData,
      tags: formData.tags.filter(tag => tag.trim() !== ''), // Filter out empty tags
    };

    // Dispatch task to backend
    dispatch(addTask(task))
      .then(() => {
        toast.success('Task added successfully!');
        setFormData({
          title: '',
          description: '',
          dueDate: '',
          priority: 'low',
          tags: [],
          newTag: '',
          reminder: false,
          category: ''
        });
        setErrors({});
      })
      .catch(() => {
        toast.error('Failed to add task!');
      });
  };

  // Handle adding a new tag
  const handleTagAdd = () => {
    if (formData.newTag.trim() && !formData.tags.includes(formData.newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.newTag.trim()],
        newTag: '',
      });
    }
  };

  // Handle input change with error clearing
  const handleInputChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));

    // Clear corresponding error if it exists
    if (field === 'title' && errors.title) {
      setErrors((prevErrors) => ({ ...prevErrors, title: undefined }));
    }
    if (field === 'dueDate' && errors.dueDate) {
      setErrors((prevErrors) => ({ ...prevErrors, dueDate: undefined }));
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Task Title"
            className="form-input"
          />
          {errors.title && <p className="error-text">{errors.title}</p>}
        </div>

        <div className="form-group">
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Task Description"
            className="form-textarea"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              className="form-input"
            />
            {errors.dueDate && <p className="error-text">{errors.dueDate}</p>}
          </div>

          <div className="form-group">
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="form-select"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
        </div>

         {/* Category Input */}
         <div className="form-group">
          <input
            type="text"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            placeholder="Task Category (e.g., Work, Personal)"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <div className="tag-input-container">
            <input
              type="text"
              value={formData.newTag}
              onChange={(e) => setFormData({
                ...formData,
                newTag: e.target.value,
              })}
              placeholder="Add Tag"
              className="form-input"
            />
            <button
              type="button"
              onClick={handleTagAdd}
              className="tag-add-btn"
            >
              Add Tag
            </button>
          </div>
          <div className="tags-container">
            {formData.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    tags: formData.tags.filter((_, i) => i !== index),
                  })}
                  className="tag-remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
         {/* Reminder Toggle */}
         <div className="flex-checkbox">

            <input
              type="checkbox"
              id="reminder"
              checked={formData.reminder}
              onChange={(e) => handleInputChange('reminder', e.target.checked)}
            />

            <label htmlFor="reminder">Enable Reminder</label>
        </div>

        <button type="submit" className="submit-btn">
          Add Task
        </button>
      </form>

      <ToastContainer/>
    </>
  );
};

export default TaskForm;
