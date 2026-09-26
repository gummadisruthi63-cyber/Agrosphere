import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';

export const getEmployees = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    const filter = {};

    if (role && role !== 'All') filter.role = role;
    if (status && status !== 'All') filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const employees = await Employee.find(filter).populate('assignedShed', 'name shedNumber').sort({ name: 1 });

    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === 'Active').length;
    const totalPayrollMonthly = employees.filter(e => e.status === 'Active').reduce((s, e) => s + (e.salary || 0), 0);

    res.json({
      success: true,
      count: employees.length,
      employees,
      stats: {
        totalEmployees,
        activeEmployees,
        totalPayrollMonthly
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createEmployee = async (req, res, next) => {
  try {
    const count = await Employee.countDocuments();
    const data = { ...req.body };
    if (!data.employeeId) {
      data.employeeId = `EMP-${String(count + 101).padStart(3, '0')}`;
    }
    const employee = await Employee.create(data);
    res.status(201).json({ success: true, employee });
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, employee });
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, message: 'Employee removed successfully' });
  } catch (error) {
    next(error);
  }
};

// Attendance
export const getAttendance = async (req, res, next) => {
  try {
    const { date, employeeId } = req.query;
    const filter = {};

    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const nd = new Date(d);
      nd.setDate(nd.getDate() + 1);
      filter.date = { $gte: d, $lt: nd };
    }
    if (employeeId && employeeId !== 'All') {
      filter.employee = employeeId;
    }

    const records = await Attendance.find(filter).populate('employee', 'name employeeId role').sort({ date: -1 });
    res.json({ success: true, count: records.length, records });
  } catch (error) {
    next(error);
  }
};

export const markAttendance = async (req, res, next) => {
  try {
    const { employee, date, status, checkInTime, checkOutTime, notes } = req.body;
    const attDate = date ? new Date(date) : new Date();
    attDate.setHours(0, 0, 0, 0);

    const record = await Attendance.findOneAndUpdate(
      { employee, date: attDate },
      {
        status,
        checkInTime: checkInTime || '07:00 AM',
        checkOutTime: checkOutTime || '05:00 PM',
        notes: notes || ''
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('employee', 'name employeeId role');

    res.json({ success: true, record, message: 'Attendance marked successfully' });
  } catch (error) {
    next(error);
  }
};

export const addTaskToEmployee = async (req, res, next) => {
  try {
    const { task, dueDate } = req.body;
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    employee.activeTasks.push({
      task,
      dueDate: dueDate || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      completed: false
    });
    await employee.save();

    res.json({ success: true, employee, message: 'Task assigned successfully' });
  } catch (error) {
    next(error);
  }
};

export const toggleTaskStatus = async (req, res, next) => {
  try {
    const { employeeId, taskId } = req.params;
    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const taskItem = employee.activeTasks.id(taskId);
    if (!taskItem) return res.status(404).json({ success: false, message: 'Task not found' });

    taskItem.completed = !taskItem.completed;
    await employee.save();

    res.json({ success: true, employee, message: 'Task status updated' });
  } catch (error) {
    next(error);
  }
};
