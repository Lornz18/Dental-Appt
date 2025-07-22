"use client";

import React, { useState, useEffect, useCallback } from "react";
import "react-calendar/dist/Calendar.css"; // Imported, but not used in AdminDashboardPage
import {
  format,
  parseISO,
  isToday,
  isTomorrow,
  isValid,
  addDays, // Needed for calculating end of week
  startOfWeek, // Needed for calculating start of week
  isWithinInterval, // Useful for checking if a date is within the week
} from "date-fns";
import {
  Trash2,
  RefreshCw,
  Calendar as CalendarIcon, // Renamed to avoid conflict with react-calendar
  User,
  Clock,
  Filter,
  LogOut,
  BarChart3,
  Settings,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

// --- Types ---
type Appointment = {
  _id: string;
  patientName: string;
  email: string;
  appointmentDate: string;
  appointmentTime: string;
  reason?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
};

// --- Helper Functions ---
const formatDateTime = (dateStr: string, timeStr: string): string => {
  try {
    if (!dateStr || !timeStr) return "Invalid Date/Time";
    const date = parseISO(dateStr);
    if (isNaN(date.getTime())) return `${dateStr} ${timeStr}`; // Fallback for invalid ISO
    return `${format(date, "MMM d, yyyy")} at ${timeStr}`;
  } catch {
    return `${dateStr} ${timeStr}`; // Fallback for any parsing errors
  }
};

// --- Component ---
export default function AdminDashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const router = useRouter();

  // --- Authentication Check ---
  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (isAdmin !== "true") {
      router.replace("/admin");
    }
  }, [router]);

  // --- Fetch Appointments ---
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/appointment");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message ||
            `Failed to fetch appointments (Status: ${res.status})`
        );
      }
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while fetching appointments.");
      }
      setAppointments([]); // Clear appointments on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch initial data when the component mounts
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // --- Appointment Handlers ---
  const handleStatusUpdate = async (
    id: string,
    newStatus: Appointment["status"]
  ) => {
    const currentAppointment = appointments.find((a) => a._id === id);
    if (!currentAppointment || currentAppointment.status === newStatus) return;

    const toastId = toast.loading("Updating status...");
    try {
      const res = await fetch(`/api/appointment/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update status");
      }

      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: newStatus } : a))
      );
      toast.success("Status updated successfully!", { id: toastId });
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(`Error: ${err.message}`, { id: toastId });
      } else {
        toast.error(`An unexpected error occurred`, { id: toastId });
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;

    const toastId = toast.loading("Deleting appointment...");
    try {
      const res = await fetch(`/api/appointment/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Delete failed");
      }

      setAppointments((prev) => prev.filter((a) => a._id !== id));
      toast.success("Appointment deleted successfully!", { id: toastId });
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(`Delete error: ${err.message}`, { id: toastId });
      } else {
        toast.error(`An unexpected error occurred during deletion`, {
          id: toastId,
        });
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    toast.success("Logged out successfully");
    router.push("/admin");
  };

  // --- Utility Functions for Styling ---
  const getStatusClasses = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed":
        return "✅";
      case "pending":
        return "🕐";
      case "cancelled":
        return "❌";
      case "completed":
        return "🎉";
      default:
        return "⚪";
    }
  };

  // --- Data Processing for Display ---
  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = parseISO(a.appointmentDate);
    const dateB = parseISO(b.appointmentDate);
    if (!isValid(dateA) && isValid(dateB)) return 1;
    if (isValid(dateA) && !isValid(dateB)) return -1;
    if (!isValid(dateA) && !isValid(dateB)) return 0;

    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;

    // If dates are the same, sort by time
    if (a.appointmentTime < b.appointmentTime) return -1;
    if (a.appointmentTime > b.appointmentTime) return 1;
    return 0;
  });

  const filteredAppointments = sortedAppointments.filter(
    (a) => filterStatus === "all" || a.status === filterStatus
  );

  // --- Calculate Weekly Appointments ---
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 0 }); // Assuming Sunday is the start of the week
  const endOfCurrentWeek = addDays(startOfCurrentWeek, 6); // 6 days after start makes it end of week (Saturday)

  const todayAppointments = sortedAppointments.filter((app) => {
    const appDate = parseISO(app.appointmentDate);
    return isValid(appDate) && isToday(appDate);
  });

  const tomorrowAppointments = sortedAppointments.filter((app) => {
    const appDate = parseISO(app.appointmentDate);
    return isValid(appDate) && isTomorrow(appDate);
  });

  // Filter appointments for the current week (excluding today and tomorrow, which are handled separately)
  const thisWeekAppointments = sortedAppointments.filter((app) => {
    const appDate = parseISO(app.appointmentDate);
    return (
      isValid(appDate) &&
      !isToday(appDate) &&
      !isTomorrow(appDate) &&
      isWithinInterval(appDate, {
        start: addDays(startOfCurrentWeek, 2), // Start after today and tomorrow
        end: endOfCurrentWeek,
      })
    );
  });

  // Group remaining appointments by day of the week
  const groupedThisWeek = thisWeekAppointments.reduce((acc: Record<string, Appointment[]>, app) => {
    const appDate = parseISO(app.appointmentDate);
    if (!isValid(appDate)) return acc;

    const dayOfWeek = format(appDate, 'EEEE'); // e.g., "Wednesday"
    if (!acc[dayOfWeek]) {
      acc[dayOfWeek] = [];
    }
    acc[dayOfWeek].push(app);
    return acc;
  }, {});

  // Function to get the days of the week in order for display
  const orderedDays = ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]; // Assuming Monday-Friday are regular, Saturday/Sunday are special. We've already handled today/tomorrow.

  const getStats = () => {
    const total = appointments.length;
    const pending = appointments.filter((a) => a.status === "pending").length;
    const confirmed = appointments.filter(
      (a) => a.status === "confirmed"
    ).length;
    const completed = appointments.filter(
      (a) => a.status === "completed"
    ).length;
    const cancelled = appointments.filter(
      (a) => a.status === "cancelled"
    ).length;

    return { total, pending, confirmed, completed, cancelled };
  };

  const stats = getStats();

  // --- JSX Rendering ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-600  to-primary text-white">
      <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8 container">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Admin Dashboard
                </h1>
                <p className="text-slate-300">
                  Manage appointments and clinic settings
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLogout}
                className="cursor-pointer flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all duration-200 backdrop-blur-sm"
              >
                <LogOut className="w-4 h-4" />
              </button>
              <Link
                href={"/admin/settings"}
                className="cursor-pointer flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all duration-200 backdrop-blur-sm"
              >
                <Settings className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-sm">Total Appointments</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-amber-400">
                    {stats.pending}
                  </p>
                </div>
                <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-sm">Confirmed</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {stats.confirmed}
                  </p>
                </div>
                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-sm">Completed</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {stats.completed}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">★</span>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-sm">Cancelled</p>
                  <p className="text-2xl font-bold text-red-300">
                    {stats.cancelled}
                  </p>
                </div>
                <div className="w-10 h-10 bg-red-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">×</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display for Appointments */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm">
              <div className="flex items-center">
                <span className="mr-2">⚠️</span> Error: {error}
              </div>
            </div>
          )}

          {/* Upcoming Appointments Section */}
          {(todayAppointments.length > 0 ||
            tomorrowAppointments.length > 0 ||
            thisWeekAppointments.length > 0) && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">
                Upcoming Appointments (This Week)
              </h2>

              {todayAppointments.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold text-slate-300 mb-2">
                    Today
                  </h3>
                  <ul className="space-y-3 mb-4">
                    {todayAppointments.map((app) => (
                      <li
                        key={app._id}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/15 text-slate-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <Clock className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {app.patientName}
                            </p>
                            <p className="text-xs text-slate-300">
                              {app.appointmentTime}
                            </p>
                          </div>
                          <div className="text-xs italic text-slate-300">
                            {app.reason || ""}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${getStatusClasses(
                              app.status
                            )}`}
                          >
                            {getStatusIcon(app.status)} {app.status}
                          </span>
                          <button
                            onClick={() => handleDelete(app._id)}
                            className="p-1 rounded-md transition-all duration-200 text-red-300 cursor-pointer hover:bg-red-500/10 hover:text-red-500"
                            aria-label="Delete appointment"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {tomorrowAppointments.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold text-slate-300 mb-2">
                    Tomorrow
                  </h3>
                  <ul className="space-y-3 mb-4">
                    {tomorrowAppointments.map((app) => (
                      <li
                        key={app._id}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/15 text-slate-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                            <CalendarIcon className="w-4 h-4 text-purple-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {app.patientName}
                            </p>
                            <p className="text-xs text-slate-300">
                              {app.appointmentTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${getStatusClasses(
                              app.status
                            )}`}
                          >
                            {getStatusIcon(app.status)} {app.status}
                          </span>
                          <button
                            onClick={() => handleDelete(app._id)}
                            className="p-1 rounded-md transition-all duration-200 text-red-300 cursor-pointer hover:bg-red-500/10 hover:text-red-500"
                            aria-label="Delete appointment"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Render other days of the week if they have appointments */}
              {orderedDays.map(day => {
                const appointmentsForDay = groupedThisWeek[day];
                if (appointmentsForDay && appointmentsForDay.length > 0) {
                  return (
                    <React.Fragment key={day}>
                      <h3 className="text-lg font-semibold text-slate-300 mb-2">
                        {day}
                      </h3>
                      <ul className="space-y-3 mb-4">
                        {appointmentsForDay.map((app) => (
                          <li
                            key={app._id}
                            className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/15 text-slate-200"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                <CalendarIcon className="w-4 h-4 text-green-400" />
                              </div>
                              <div>
                                <p className="font-medium text-white">
                                  {app.patientName}
                                </p>
                                <p className="text-xs text-slate-300">
                                  {app.appointmentTime}
                                </p>
                              </div>
                              <div className="text-xs italic text-slate-300">
                                {app.reason || ""}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${getStatusClasses(
                                  app.status
                                )}`}
                              >
                                {getStatusIcon(app.status)} {app.status}
                              </span>
                              <button
                                onClick={() => handleDelete(app._id)}
                                className="p-1 rounded-md transition-all duration-200 text-red-300 cursor-pointer hover:bg-red-500/10 hover:text-red-500"
                                aria-label="Delete appointment"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </React.Fragment>
                  );
                }
                return null; // Don't render anything if no appointments for this day
              })}

              {/* Message if no upcoming appointments found */}
              {todayAppointments.length === 0 &&
               tomorrowAppointments.length === 0 &&
               thisWeekAppointments.length === 0 && (
                <p className="text-center text-slate-400 py-4">
                  No upcoming appointments this week.
                </p>
              )}
            </div>
          )}

          {/* Appointment Controls and Table */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
            <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-slate-300" />
                  <label className="text-slate-300 font-medium">Filter:</label>
                </div>
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="appearance-none py-2 pl-4 pr-8 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm bg-white/10 border border-white/20 text-white"
                  >
                    <option value="all" className="bg-gray-800 text-white">
                      All Appointments
                    </option>
                    <option value="pending" className="bg-gray-800 text-white">
                      Pending
                    </option>
                    <option
                      value="confirmed"
                      className="bg-gray-800 text-white"
                    >
                      Confirmed
                    </option>
                    <option
                      value="completed"
                      className="bg-gray-800 text-white"
                    >
                      Completed
                    </option>
                    <option
                      value="cancelled"
                      className="bg-gray-800 text-white"
                    >
                      Cancelled
                    </option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-white/70">
                    <svg
                      className="w-4 h-4 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.646 7.354l-.707-.707L10 11.586 5.354 7.047l-.707.707L9.293 12.95z" />
                    </svg>
                  </div>
                </div>
              </div>
              <button
                onClick={fetchAppointments}
                disabled={loading}
                className={`flex items-center px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                  loading
                    ? "bg-slate-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-white/10 to-primary hover:scale-105 transition-all duration-300"
                } text-white`}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />{" "}
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {/* Appointments Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" /> Patient
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2" /> Date & Time
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {loading && appointments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center px-6 py-12 text-slate-300"
                      >
                        <div className="flex flex-col items-center">
                          <RefreshCw className="w-8 h-8 animate-spin mb-4" />
                          <p>Loading appointments...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAppointments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center px-6 py-12 text-slate-300"
                      >
                        <div className="flex flex-col items-center">
                          <CalendarIcon className="w-8 h-8 mb-4 opacity-50" />
                          <p>No appointments found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((app) => (
                      <tr
                        key={app._id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-white">
                            {app.patientName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-300">
                            {formatDateTime(
                              app.appointmentDate,
                              app.appointmentTime
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-300 italic max-w-xs truncate">
                            {app.reason || "No reason provided"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium border ${getStatusClasses(
                              app.status
                            )}`}
                          >
                            <span className="mr-1">
                              {getStatusIcon(app.status)}
                            </span>{" "}
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <select
                                onChange={(e) =>
                                  handleStatusUpdate(
                                    app._id,
                                    e.target.value as Appointment["status"]
                                  )
                                }
                                value={app.status}
                                className="appearance-none py-1.5 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm bg-white/10 border border-white/20 text-white"
                              >
                                <option
                                  value="pending"
                                  className="bg-gray-800 text-white"
                                >
                                  🕐 Pending
                                </option>
                                <option
                                  value="confirmed"
                                  className="bg-gray-800 text-white"
                                >
                                  ✅ Confirmed
                                </option>
                                <option
                                  value="completed"
                                  className="bg-gray-800 text-white"
                                >
                                  🎉 Completed
                                </option>
                                <option
                                  value="cancelled"
                                  className="bg-gray-800 text-white"
                                >
                                  ❌ Cancelled
                                </option>
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-white/70">
                                <svg
                                  className="w-4 h-4 fill-current"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.293 12.95l.707.707L15.646 7.354l-.707-.707L10 11.586 5.354 7.047l-.707.707L9.293 12.95z" />
                                </svg>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDelete(app._id)}
                              className="p-2 rounded-lg transition-all duration-200 text-red-300 cursor-pointer hover:bg-red-500/10 hover:text-red-500"
                              aria-label="Delete appointment"
                              style={{
                                backgroundColor: "rgba(239, 68, 68, 0.15)",
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-200">
              Admin Dashboard - Manage appointments and clinic operations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}