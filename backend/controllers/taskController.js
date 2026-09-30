const Task = require('../models/Task');

// @desc    Get user tasks with search, filter, and sort
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { search, status, priority, category, sortBy } = req.query;

    let query = { user: req.user.id };

    // Search by keyword in title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by priority
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Sorting setup
    let sortOptions = { createdAt: -1 }; // default newest first
    if (sortBy === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sortBy === 'dueDate') {
      sortOptions = { dueDate: 1 };
    } else if (sortBy === 'title') {
      sortOptions = { title: 1 };
    }

    let tasks;
    if (sortBy === 'priority') {
      // Use aggregation for correct semantic priority order: urgent > high > medium > low
      tasks = await Task.aggregate([
        { $match: query },
        {
          $addFields: {
            priorityWeight: {
              $switch: {
                branches: [
                  { case: { $eq: ['$priority', 'urgent'] }, then: 4 },
                  { case: { $eq: ['$priority', 'high'] }, then: 3 },
                  { case: { $eq: ['$priority', 'medium'] }, then: 2 },
                  { case: { $eq: ['$priority', 'low'] }, then: 1 },
                ],
                default: 0,
              },
            },
          },
        },
        { $sort: { priorityWeight: -1, createdAt: -1 } },
        { $project: { priorityWeight: 0 } },
      ]);
    } else {
      tasks = await Task.find(query).sort(sortOptions);
    }

    res.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
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

    res.json({
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

    const task = await Task.create({
      user: req.user.id,
      title,
      description: description || '',
      status: status || 'pending',
      priority: priority || 'medium',
      category: category || 'Personal',
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    res.status(201).json({
      success: true,
      data: task,
    });
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
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Make sure task belongs to user
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this task' });
    }

    const { title, description, status, priority, category, dueDate } = req.body;

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

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('updateTask error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Toggle or update task status quickly
// @route   PATCH /api/tasks/:id/toggle
// @access  Private
const toggleTaskStatus = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Toggle status logic: pending -> in-progress -> completed -> pending
    let nextStatus = 'completed';
    if (req.body.status) {
      nextStatus = req.body.status;
    } else {
      if (task.status === 'pending') nextStatus = 'in-progress';
      else if (task.status === 'in-progress') nextStatus = 'completed';
      else if (task.status === 'completed') nextStatus = 'pending';
    }

    task.status = nextStatus;
    await task.save();

    res.json({
      success: true,
      data: task,
    });
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
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();

    res.json({
      success: true,
      data: {},
      message: 'Task removed successfully',
    });
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
