"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Appointment {
  _id: string;
  patientName: string;
  patientEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  durationMinutes: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export default function AppointmentPage() {
  const { id } = useParams();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await fetch(`/api/appointment/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch appointment");
        setAppointment(data.appointment);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  const handleCancel = async () => {
    if (!appointment) return;

    const confirm = window.confirm("Are you sure you want to cancel this appointment?");
    if (!confirm) return;

    setCancelling(true);

    try {
      const res = await fetch(`/api/appointment/${appointment._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Cancellation failed");

      setAppointment(data.appointment);
      alert("Appointment has been cancelled.");
    } catch (err) {
      alert(`Error: ${(err as Error).message}`);
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600";
    }
  };

  const getStatusBannerColor = (status: string) => {
    switch (status) {
      case "pending":
        return "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-600";
      case "confirmed":
        return "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600";
      case "completed":
        return "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-600";
      case "cancelled":
        return "border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-600";
      default:
        return "border-gray-500 bg-gray-50 dark:bg-gray-800 dark:border-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "confirmed":
        return "✅";
      case "completed":
        return "🏁";
      case "cancelled":
        return "❌";
      default:
        return "📋";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg dark:shadow-gray-900/50">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <p className="text-gray-600 dark:text-gray-300 font-medium">Loading appointment details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg dark:shadow-gray-900/50 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 dark:text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Error Loading Appointment</h2>
            <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg dark:shadow-gray-900/50 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Appointment Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">The appointment you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="max-w-2xl mx-auto px-4">

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/50 overflow-hidden transition-colors duration-200">
          {/* Status Banner */}
          <div className={`px-6 py-4 border-l-4 ${getStatusBannerColor(appointment.status)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getStatusIcon(appointment.status)}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Appointment Status</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Patient Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Patient Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="text-blue-500 dark:text-blue-400 mt-1">👤</div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Patient Name</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{appointment.patientName}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-blue-500 dark:text-blue-400 mt-1">📧</div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100 break-all">{appointment.patientEmail}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Appointment Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="text-blue-500 dark:text-blue-400 mt-1">📅</div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-blue-500 dark:text-blue-400 mt-1">🕒</div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{appointment.appointmentTime}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-blue-500 dark:text-blue-400 mt-1">⏱️</div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{appointment.durationMinutes} minutes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reason Section */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Reason for Visit</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-colors duration-200">
                <p className="text-gray-700 dark:text-gray-300">{appointment.reason}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {appointment.status !== "cancelled" && appointment.status !== "completed" && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 transition-colors duration-200">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 dark:bg-red-500 dark:hover:bg-red-600 dark:disabled:bg-red-400 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 disabled:cursor-not-allowed"
                >
                  {cancelling ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <>
                      <span>❌</span>
                      <span>Cancel Appointment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}