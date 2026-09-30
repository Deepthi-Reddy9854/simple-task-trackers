const Task = require('../models/Task');
const mongoose = require('mongoose');

// In-memory fallback task store for Vercel Serverless environment
const inMemoryTasks = [
  {
    _id: 'task_demo_1',
    user: 'mem_user_default',
    title: 'Welcome to Simple Task Tracker!',
    description: 'Create, manage, and complete your real-time tasks with custom priority badges and dates.',
    status: 'in-progress',
    priority: 'high',
    category: 'Work',
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 86400000 * 3)
  },
  {
    _id: 'task_demo_2',
    user: 'mem_user_default',
    title: 'Explore Filter and Search Options',
    description: 'Filter your tasks by status (Pending, In-Progress, Completed) or search by keywords.',
    status: 'pending',
    priority: 'medium',
    category: 'Personal',
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 86400000 * 5)
  }
];

// @desc    Get user tasks with search, filter, and sort
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { search, status, priority, category, sortBy } = req.query;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.user?.id)) {
      let query = { user: req.user.id };
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }
      if (status && status !== 'all') query.status = status;
      if (priority && priority !== 'all') query.priority = priority;
      if (category && category !== 'all') query.category = category;

      let sortOptions = { createdAt: -1 };
      if (sortBy === 'oldest') sortOptions = { createdAt: 1 };
      else if (sortBy === 'dueDate') sortOptions = { dueDate: 1 };
      else if (sortBy === 'title') sortOptions = { title: 1 };

      const tasks = await Task.find(query).sort(sortOptions);
      return res.json({ success: true, count: tasks.length, data: tasks });
    } else {
      let tasks = [...inMemoryTasks];
      if (status && status !== 'all') tasks = tasks.filter(t => t.status === status);
      if (priority && priority !== 'all') tasks = tasks.filter(t => t.priority === priority);
      if (category && category !== 'all') tasks = tasks.filter(t => t.category === category);
      if (search) {
        const q = search.toLowerCase();
        tasks = tasks.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
      }
      return res.json({ success: true, count: tasks.length, data: tasks });
    }
  } catch (error) {
    console.error('getTasks error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get task statistics for current user
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.user?.id)) {
      const userId = req.user.id;
      const total = await Task.countDocuments({ user: userId });
      const pending = await Task.countDocuments({ user: userId, status: 'pending' });
      const inProgress = await Task.countDocuments({ user: userId, status: 'in-progress' });
      const completed = await Task.countDocuments({ user: userId, status: 'completed' });
      const highPriority = await Task.countDocuments({
        user: userId,
        priority: { $in: ['high', 'urgent'] },
        status: { $ne: 'completed' }
      });
      return res.json({
        success: true,
        data: {
          total,
          pending,
          inProgress,
          completed,
          highPriority,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        },
      });
    } else {
      const total = inMemoryTasks.length;
      const pending = inMemoryTasks.filter(t => t.status === 'pending').length;
      const inProgress = inMemoryTasks.filter(t => t.status === 'in-progress').length;
      const completed = inMemoryTasks.filter(t => t.status === 'completed').length;
      const highPriority = inMemoryTasks.filter(t => ['high', 'urgent'].includes(t.priority) && t.status !== 'completed').length;
      return res.json({
        success: true,
        data: {
          total,
          pending,
          inProgress,
          completed,
          highPriority,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        },
      });
    }
  } catch (error) {
    console.error('getTaskStats error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, category, dueDate } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.user?.id)) {
      const task = await Task.create({
        user: req.user.id,
        title,
        description: description || '',
        status: status || 'pending',
        priority: priority || 'medium',
        category: category || 'Personal',
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });
      return res.status(201).json({ success: true, data: task });
    } else {
      const task = {
        _id: 'task_' + Date.now(),
        user: req.user?.id || 'mem_user',
        title,
        description: description || '',
        status: status || 'pending',
        priority: priority || 'medium',
        category: category || 'Personal',
        dueDate: dueDate ? new Date(dueDate) : null,
        createdAt: new Date(),
      };
      inMemoryTasks.unshift(task);
      return res.status(201).json({ success: true, data: task });
    }
  } catch (error) {
    console.error('createTask error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Update existing task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, category, dueDate } = req.body;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.params.id)) {
      let task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
      task = await Task.findByIdAndUpdate(
        req.params.id,
        {
          title: title !== undefined ? title : task.title,
          description: description !== undefined ? description : task.description,
          status: status !== undefined ? status : task.status,
          priority: priority !== undefined ? priority : task.priority,
          category: category !== undefined ? category : task.category,
          dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : task.dueDate,
        },
        { new: true, runValidators: true }
      );
      return res.json({ success: true, data: task });
    } else {
      let task = inMemoryTasks.find(t => t._id === req.params.id) || inMemoryTasks[0];
      if (task) {
        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (status !== undefined) task.status = status;
        if (priority !== undefined) task.priority = priority;
        if (category !== undefined) task.category = category;
        if (dueDate !== undefined) task.dueDate = dueDate;
        return res.json({ success: true, data: task });
      }
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
  } catch (error) {
    console.error('updateTask error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Toggle task status
// @route   PATCH /api/tasks/:id/toggle
// @access  Private
const toggleTaskStatus = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.params.id)) {
      let task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
      let nextStatus = req.body.status || (task.status === 'pending' ? 'in-progress' : task.status === 'in-progress' ? 'completed' : 'pending');
      task.status = nextStatus;
      await task.save();
      return res.json({ success: true, data: task });
    } else {
      let task = inMemoryTasks.find(t => t._id === req.params.id) || inMemoryTasks[0];
      if (task) {
        let nextStatus = req.body.status || (task.status === 'pending' ? 'in-progress' : task.status === 'in-progress' ? 'completed' : 'pending');
        task.status = nextStatus;
        return res.json({ success: true, data: task });
      }
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
  } catch (error) {
    console.error('toggleTaskStatus error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.params.id)) {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
      await task.deleteOne();
      return res.json({ success: true, data: {}, message: 'Task removed successfully' });
    } else {
      const idx = inMemoryTasks.findIndex(t => t._id === req.params.id);
      if (idx !== -1) inMemoryTasks.splice(idx, 1);
      return res.json({ success: true, data: {}, message: 'Task removed successfully' });
    }
  } catch (error) {
    console.error('deleteTask error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getTasks,
  getTaskStats,
  createTask,
  updateTask,
  toggleTaskStatus,
  deleteTask,
};
