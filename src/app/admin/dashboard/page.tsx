"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import "react-calendar/dist/Calendar.css";
import {
  format,
  parseISO,
  isToday,
  isTomorrow,
  isValid,
  addDays,
  startOfWeek,
  isWithinInterval,
  formatDistanceToNow,
} from "date-fns";
import {
  Trash2,
  RefreshCw,
  Calendar as CalendarIcon,
  User,
  Clock,
  Filter,
  LogOut,
  BarChart3,
  Settings,
  Bell,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

// --- Types (Aligning with Backend Models) ---
type Appointment = {
  _id: string;
  patientName: string;
  email: string;
  appointmentDate: string;
  appointmentTime: string;
  reason?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
};

type Alert = {
  _id: string;
  message: string;
  type: string;
  read: boolean;
  link?: string;
  createdAt: string; // Comes as string from JSON
};

// --- WebSocket URL Configuration ---
const WS_URL = process.env.WS_URL;

// --- Helper Functions ---
const formatDateTime = (dateStr: string, timeStr: string): string => {
  try {
    if (!dateStr || !timeStr) return "Invalid Date/Time";
    const date = parseISO(dateStr);
    if (isNaN(date.getTime())) return `${dateStr} ${timeStr}`;
    return `${format(date, "MMM d, yyyy")} at ${timeStr}`;
  } catch {
    return `${dateStr} ${timeStr}`;
  }
};

// --- Component ---
export default function AdminDashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [notifications, setNotifications] = useState<Alert[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const notificationPanelRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  // --- Authentication Check ---
  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (isAdmin !== "true") router.replace("/admin");
  }, [router]);

  // --- Data Fetching Logic ---
  const fetchAppointments = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/appointment");
      if (!res.ok)
        throw new Error(
          (await res.json()).message || "Failed to fetch appointments"
        );
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      setError((err as Error).message);
      toast.error((err as Error).message);
      setAppointments([]);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/alerts?read=false");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setNotifications(data.alerts || []);
    } catch (err) {
      console.error("Error fetching alerts:", err);
    }
  }, []);

  const markAlertsAsRead = useCallback(async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n._id);
    if (unreadIds.length === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch("/api/alerts/mark-as-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: unreadIds }),
      });
    } catch (err) {
      console.error("Failed to mark alerts as read:", err);
    }
  }, [notifications]);

  // Initial Data Load
  useEffect(() => {
    fetchAppointments();
    fetchAlerts();
  }, [fetchAppointments, fetchAlerts]);

  // WebSocket Connection Management
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!WS_URL) {
      setError("WebSocket URL is not configured.");
      return;
    }
    const socket = new WebSocket(WS_URL);
    ws.current = socket;
    socket.onopen = () => {
      console.log("WebSocket connection established.");
      toast.success("Real-time connection active", { icon: "⚡" });
    };
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "new-alert") {
          toast.success(
            message.payload.message || "You have a new notification!",
            { icon: "🔔" }
          );
          fetchAlerts();
          fetchAppointments(true);
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", event.data, err);
      }
    };
    socket.onclose = () => {
      toast.error("Real-time connection lost. Please refresh.", {
        duration: 6000,
      });
    };
    socket.onerror = () => {
      setError("WebSocket connection failed. Real-time updates are disabled.");
    };
    return () => {
      if (ws.current) ws.current.close();
    };
  }, [fetchAppointments, fetchAlerts]);

  // Outside Click for Notification Panel
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationPanelRef.current &&
        !notificationPanelRef.current.contains(event.target as Node)
      ) {
        setIsPanelOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Component Handlers ---
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
  const handleBellClick = () => {
    setIsPanelOpen((prev) => !prev);
    if (!isPanelOpen) markAlertsAsRead();
  };

  // --- Data Processing & Utility ---
  const unreadCount = notifications.filter((n) => !n.read).length;
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
  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = parseISO(a.appointmentDate);
    const dateB = parseISO(b.appointmentDate);
    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;
    return a.appointmentTime.localeCompare(b.appointmentTime);
  });
  const filteredAppointments = sortedAppointments.filter(
    (a) => filterStatus === "all" || a.status === filterStatus
  );
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 0 });
  const endOfCurrentWeek = addDays(startOfCurrentWeek, 6);
  const todayAppointments = sortedAppointments.filter(
    (app) =>
      isValid(parseISO(app.appointmentDate)) &&
      isToday(parseISO(app.appointmentDate))
  );
  const tomorrowAppointments = sortedAppointments.filter(
    (app) =>
      isValid(parseISO(app.appointmentDate)) &&
      isTomorrow(parseISO(app.appointmentDate))
  );
  const thisWeekAppointments = sortedAppointments.filter((app) => {
    const appDate = parseISO(app.appointmentDate);
    return (
      isValid(appDate) &&
      !isToday(appDate) &&
      !isTomorrow(appDate) &&
      isWithinInterval(appDate, {
        start: addDays(today, 1),
        end: endOfCurrentWeek,
      })
    );
  });
  const groupedThisWeek = thisWeekAppointments.reduce(
    (acc: Record<string, Appointment[]>, app) => {
      const dayOfWeek = format(parseISO(app.appointmentDate), "EEEE");
      if (!acc[dayOfWeek]) acc[dayOfWeek] = [];
      acc[dayOfWeek].push(app);
      return acc;
    },
    {}
  );
  const orderedDays = ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const stats = React.useMemo(
    () => ({
      total: appointments.length,
      pending: appointments.filter((a) => a.status === "pending").length,
      confirmed: appointments.filter((a) => a.status === "confirmed").length,
      completed: appointments.filter((a) => a.status === "completed").length,
      cancelled: appointments.filter((a) => a.status === "cancelled").length,
    }),
    [appointments]
  );

  // --- JSX Rendering ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-600 to-primary text-white">
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
              <div className="relative" ref={notificationPanelRef}>
                <button
                  onClick={handleBellClick}
                  className="relative cursor-pointer flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all duration-200 backdrop-blur-sm"
                  aria-label={`Notifications (${unreadCount} unread)`}
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-xs items-center justify-center">
                        {unreadCount}
                      </span>
                    </span>
                  )}
                </button>
                {isPanelOpen && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-slate-700/80 backdrop-blur-md border border-slate-500 rounded-xl shadow-lg z-50 text-white">
                    <div className="p-3 border-b border-slate-600">
                      <h3 className="font-semibold">Notifications</h3>
                    </div>
                    <ul className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <Link key={n._id} href={n.link || "#"}>
                            <li className="p-3 border-b border-slate-600 hover:bg-slate-600/50 cursor-pointer">
                              <p className="text-sm">{n.message}</p>
                              <p className="text-xs text-slate-400 mt-1">
                                {formatDistanceToNow(parseISO(n.createdAt), {
                                  addSuffix: true,
                                })}
                              </p>
                            </li>
                          </Link>
                        ))
                      ) : (
                        <li className="p-4 text-center text-sm text-slate-400">
                          You&apos;re all caught up!
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
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
                  <p className="text-slate-300 text-sm">Total</p>
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

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm">
              <div className="flex items-center">
                <span className="mr-2">⚠️</span> Error: {error}
              </div>
            </div>
          )}

          {/* Upcoming Appointments */}
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
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${getStatusClasses(app.status)}`}
                          >
                            {getStatusIcon(app.status)} {app.status}
                          </span>
                          <button
                            onClick={() => handleDelete(app._id)}
                            className="p-1 rounded-md transition-all duration-200 text-red-300 hover:bg-red-500/10 hover:text-red-500"
                            aria-label="Delete"
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
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${getStatusClasses(app.status)}`}
                          >
                            {getStatusIcon(app.status)} {app.status}
                          </span>
                          <button
                            onClick={() => handleDelete(app._id)}
                            className="p-1 rounded-md transition-all duration-200 text-red-300 hover:bg-red-500/10 hover:text-red-500"
                            aria-label="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {orderedDays.map((day) => {
                const dayApps = groupedThisWeek[day];
                if (dayApps && dayApps.length > 0) {
                  return (
                    <React.Fragment key={day}>
                      <h3 className="text-lg font-semibold text-slate-300 mb-2">
                        {day}
                      </h3>
                      <ul className="space-y-3 mb-4">
                        {dayApps.map((app) => (
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
                            </div>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${getStatusClasses(app.status)}`}
                              >
                                {getStatusIcon(app.status)} {app.status}
                              </span>
                              <button
                                onClick={() => handleDelete(app._id)}
                                className="p-1 rounded-md transition-all duration-200 text-red-300 hover:bg-red-500/10 hover:text-red-500"
                                aria-label="Delete"
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
                return null;
              })}
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
                    className="appearance-none py-2 pl-4 pr-8 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/10 border border-white/20 text-white"
                  >
                    <option value="all" className="bg-gray-800 text-white">
                      All
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
                onClick={() => fetchAppointments()}
                disabled={loading}
                className={`flex items-center px-6 py-2 rounded-xl font-medium transition-all duration-200 ${loading ? "bg-slate-600 cursor-not-allowed" : "bg-gradient-to-r from-white/10 to-primary hover:scale-105"} text-white`}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />{" "}
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Patient
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Date & Time
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
                        colSpan={5}
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
                        colSpan={5}
                        className="text-center px-6 py-12 text-slate-300"
                      >
                        <div className="flex flex-col items-center">
                          <CalendarIcon className="w-8 h-8 mb-4 opacity-50" />
                          <p>No appointments found.</p>
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
                            {app.reason || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium border ${getStatusClasses(app.status)}`}
                          >
                            <span className="mr-1">
                              {getStatusIcon(app.status)}
                            </span>
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
                                className="appearance-none py-1.5 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/10 border border-white/20 text-white"
                              >
                                <option value="pending" className="bg-gray-800">
                                  🕐 Pending
                                </option>
                                <option
                                  value="confirmed"
                                  className="bg-gray-800"
                                >
                                  ✅ Confirmed
                                </option>
                                <option
                                  value="completed"
                                  className="bg-gray-800"
                                >
                                  🎉 Completed
                                </option>
                                <option
                                  value="cancelled"
                                  className="bg-gray-800"
                                >
                                  ❌ Cancelled
                                </option>
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-white/70">
                                <svg
                                  className="w-4 h-4 fill-current"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.293 12.95l.707.707L15.646 7.354l-.707-.707L10 11.586 5.354 7.047l-.707.707L9.293 12.95z" />
                                </svg>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDelete(app._id)}
                              className="p-2 rounded-lg transition-all duration-200 text-red-300 hover:bg-red-500/20 hover:text-red-500"
                              aria-label="Delete"
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
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-200">
              Admin Dashboard - Manage clinic operations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
