import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, CheckCircle, Calendar, Phone, Mail, DollarSign, CheckSquare, Clock, Edit2, Trash2 } from 'lucide-react';
import { employeeService, farmService } from '../../services/api';
import { Employee, AttendanceRecord, Shed } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export const EmployeeManagement: React.FC = () => {
  const { hasRole } = useAuth();
  const canManage = hasRole(['Farm Owner/Admin', 'Farm Manager']);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [sheds, setSheds] = useState<Shed[]>([]);
  const [stats, setStats] = useState<any>({ totalEmployees: 0, activeEmployees: 0, totalPayrollMonthly: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'employees' | 'attendance' | 'tasks'>('employees');

  // Modals
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<{ open: boolean; employeeId: string | null }>({
    open: false,
    employeeId: null
  });

  // Forms
  const [employeeForm, setEmployeeForm] = useState({
    employeeId: '',
    name: '',
    phone: '',
    email: '',
    role: 'Milking Specialist',
    salary: 18000,
    salaryType: 'Monthly',
    assignedShed: '',
    status: 'Active',
    address: ''
  });

  const [attendanceForm, setAttendanceForm] = useState({
    employee: '',
    status: 'Present',
    checkInTime: '07:00 AM',
    checkOutTime: '05:00 PM',
    notes: ''
  });

  const [taskForm, setTaskForm] = useState({
    task: '',
    dueDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0]
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [empRes, attRes, shedRes] = await Promise.all([
        employeeService.getAll(),
        employeeService.getAttendance(),
        farmService.getSheds()
      ]);
      setEmployees(empRes.data.employees || []);
      setStats(empRes.data.stats || {});
      setAttendance(attRes.data.records || []);
      setSheds(shedRes.data.sheds || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddEmployee = () => {
    const nextId = `EMP-${String(employees.length + 101).padStart(3, '0')}`;
    setEmployeeForm({
      employeeId: nextId,
      name: '',
      phone: '',
      email: '',
      role: 'Milking Specialist',
      salary: 18000,
      salaryType: 'Monthly',
      assignedShed: sheds[0]?._id || '',
      status: 'Active',
      address: ''
    });
    setIsEmployeeModalOpen(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await employeeService.create(employeeForm);
      setIsEmployeeModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error adding employee');
    }
  };

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await employeeService.markAttendance(attendanceForm);
      setIsAttendanceModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert('Error recording attendance');
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTaskModalOpen.employeeId) return;

    try {
      await employeeService.addTask(isTaskModalOpen.employeeId, taskForm);
      setIsTaskModalOpen({ open: false, employeeId: null });
      setTaskForm({ task: '', dueDate: '' });
      fetchData();
    } catch (err) {
      alert('Error assigning task');
    }
  };

  const handleToggleTask = async (empId: string, taskId: string) => {
    try {
      await employeeService.toggleTask(empId, taskId);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const employeeColumns: Column<Employee>[] = [
    {
      key: 'name',
      header: 'Staff Member & Role',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-bold text-slate-800">{item.name}</span>
          <span className="block text-xs font-semibold text-emerald-700">{item.role}</span>
        </div>
      )
    },
    {
      key: 'employeeId',
      header: 'Emp ID',
      sortable: true,
      render: (item) => <span className="font-mono text-xs text-slate-500 font-bold">{item.employeeId}</span>
    },
    {
      key: 'phone',
      header: 'Contact Phone',
      render: (item) => <span className="text-xs text-slate-700">{item.phone}</span>
    },
    {
      key: 'salary',
      header: 'Monthly Salary',
      sortable: true,
      render: (item) => <span className="font-bold text-slate-900">{formatCurrency(item.salary)}/mo</span>
    },
    {
      key: 'assignedShed',
      header: 'Assigned Compartment',
      render: (item) => {
        const s = typeof item.assignedShed === 'object' ? item.assignedShed : null;
        return <span className="text-xs text-slate-600">{s?.name || 'General Operations'}</span>;
      }
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => <StatusBadge status={item.status} size="sm" />
    },
    {
      key: 'actions',
      header: 'Tasks',
      render: (item) => (
        <button
          onClick={() => setIsTaskModalOpen({ open: true, employeeId: item._id })}
          className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
        >
          <Plus className="w-3 h-3" />
          <span>Assign Task</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">
            Farm Personnel & Operations Staff
          </h1>
          <p className="text-xs text-slate-500">
            Workforce roster, automated monthly payroll allocation, daily check-in attendance, and task schedules
          </p>
        </div>

        {canManage && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAttendanceModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mark Attendance</span>
            </button>
            <button
              onClick={handleOpenAddEmployee}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Staff Member</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Farm Personnel</p>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{stats.totalEmployees || 0} Employees</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Payroll Obligation</p>
          <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">{formatCurrency(stats.totalPayrollMonthly || 0)}</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active On Duty</p>
          <h3 className="text-2xl font-extrabold text-blue-700 mt-1">{stats.activeEmployees || 0} Staff</h3>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('employees')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center space-x-1.5 ${
            activeTab === 'employees'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Staff Directory ({employees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center space-x-1.5 ${
            activeTab === 'attendance'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Attendance Register ({attendance.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center space-x-1.5 ${
            activeTab === 'tasks'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Farm Task Assignments</span>
        </button>
      </div>

      {/* TAB 1: Staff Directory */}
      {activeTab === 'employees' && (
        <DataTable
          columns={employeeColumns}
          data={employees}
          isLoading={isLoading}
          searchPlaceholder="Search staff by name, role, employee ID..."
        />
      )}

      {/* TAB 2: Attendance Records */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Check In</th>
                <th className="py-3 px-4">Check Out</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Shift Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendance.map((rec) => {
                const emp = typeof rec.employee === 'object' ? rec.employee : null;
                return (
                  <tr key={rec._id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-semibold text-slate-800">{formatDate(rec.date)}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{emp?.name || 'Staff'}</span>
                      <span className="text-[11px] text-slate-500">{emp?.role}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{rec.checkInTime || '07:00 AM'}</td>
                    <td className="py-3 px-4 text-slate-600">{rec.checkOutTime || '05:00 PM'}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={rec.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-slate-500">{rec.notes || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: Tasks Overview */}
      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {employees.map((emp) => (
            <div key={emp._id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{emp.name}</h4>
                  <span className="text-xs text-slate-500 font-medium">{emp.role}</span>
                </div>
                <button
                  onClick={() => setIsTaskModalOpen({ open: true, employeeId: emp._id })}
                  className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Task</span>
                </button>
              </div>

              <div className="space-y-2">
                {emp.activeTasks.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No active tasks assigned</p>
                ) : (
                  emp.activeTasks.map((t) => (
                    <div
                      key={t._id}
                      onClick={() => handleToggleTask(emp._id, t._id!)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start space-x-2.5 ${
                        t.completed
                          ? 'bg-slate-50/80 border-slate-200 opacity-60'
                          : 'bg-emerald-50/40 border-emerald-200 hover:bg-emerald-50/70'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold text-slate-800 ${t.completed ? 'line-through text-slate-400' : ''}`}>
                          {t.task}
                        </p>
                        {t.dueDate && (
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Due: {formatDate(t.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Employee Modal */}
      <Modal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        title="Add Farm Staff Member"
        subtitle="Manage employee profile, role responsibilities, and monthly compensation"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEmployee} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Employee ID *</label>
              <input
                type="text"
                required
                value={employeeForm.employeeId}
                onChange={(e) => setEmployeeForm({ ...employeeForm, employeeId: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kulkarni"
                value={employeeForm.name}
                onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="+91 98XXX XXXXX"
                value={employeeForm.phone}
                onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="staff@agrosphere.com"
                value={employeeForm.email}
                onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Farm Role</label>
              <select
                value={employeeForm.role}
                onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              >
                <option value="Farm Manager">Farm Manager</option>
                <option value="Herdsman / Cattle Handler">Herdsman / Cattle Handler</option>
                <option value="Milking Specialist">Milking Specialist</option>
                <option value="Poultry Flock Supervisor">Poultry Flock Supervisor</option>
                <option value="Veterinary Assistant">Veterinary Assistant</option>
                <option value="Feed & Inventory Keeper">Feed & Inventory Keeper</option>
                <option value="General Farm Worker">General Farm Worker</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Salary (₹) *</label>
              <input
                type="number"
                required
                value={employeeForm.salary}
                onChange={(e) => setEmployeeForm({ ...employeeForm, salary: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Shed / Barn</label>
            <select
              value={employeeForm.assignedShed}
              onChange={(e) => setEmployeeForm({ ...employeeForm, assignedShed: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            >
              <option value="">-- General Farm --</option>
              {sheds.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.shedNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsEmployeeModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              Save Employee
            </button>
          </div>
        </form>
      </Modal>

      {/* Mark Attendance Modal */}
      <Modal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        title="Mark Daily Employee Attendance"
        subtitle="Record shift presence, check-in time, and status"
        maxWidth="sm"
      >
        <form onSubmit={handleMarkAttendance} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Employee *</label>
            <select
              required
              value={attendanceForm.employee}
              onChange={(e) => setAttendanceForm({ ...attendanceForm, employee: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            >
              <option value="">-- Choose Employee --</option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.name} ({e.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
            <select
              value={attendanceForm.status}
              onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            >
              <option value="Present">Present (Full Day)</option>
              <option value="Half Day">Half Day</option>
              <option value="On Leave">On Leave</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Check In Time</label>
              <input
                type="text"
                placeholder="07:00 AM"
                value={attendanceForm.checkInTime}
                onChange={(e) => setAttendanceForm({ ...attendanceForm, checkInTime: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Check Out Time</label>
              <input
                type="text"
                placeholder="05:00 PM"
                value={attendanceForm.checkOutTime}
                onChange={(e) => setAttendanceForm({ ...attendanceForm, checkOutTime: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsAttendanceModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              Save Attendance
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Task Modal */}
      <Modal
        isOpen={isTaskModalOpen.open}
        onClose={() => setIsTaskModalOpen({ open: false, employeeId: null })}
        title="Assign Daily Farm Task"
        subtitle="Set task description and due date for operator"
        maxWidth="sm"
      >
        <form onSubmit={handleAddTask} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Task Description *</label>
            <input
              type="text"
              required
              placeholder="e.g. Sanitize milking claw pieces"
              value={taskForm.task}
              onChange={(e) => setTaskForm({ ...taskForm, task: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
            <input
              type="date"
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsTaskModalOpen({ open: false, employeeId: null })}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              Assign Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
