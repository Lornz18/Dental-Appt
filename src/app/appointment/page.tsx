"use client";

import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Keep this for default styles, but we'll override with Tailwind
import { format, parseISO } from "date-fns";

// Define the Availability type
type Availability = {
  patientName: string;
  appointmentDate: string; // ISO string
  appointmentTime: string;
  reason?: string; // Now this will store the selected service
  status: "pending" | "confirmed" | "completed" | "cancelled";
};

// Define available services
const AVAILABLE_SERVICES = [
  { id: "consultation", name: "Initial Consultation" },
  { id: "checkup", name: "Routine Check-up" },
  { id: "followup", name: "Follow-up Appointment" },
  { id: "procedure", name: "Minor Procedure" },
  { id: "other", name: "Other" },
];

// Helper to generate hourly time slots (9 AM to 4 PM)
const generateHourlySlots = (start: number, end: number): string[] => {
  const slots: string[] = [];
  for (let hour = start; hour < end; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
  }
  return slots;
};

const ALL_HOURLY_SLOTS = generateHourlySlots(9, 17); // 9 AM to 4 PM

export default function Appointment() {
  // State for the form inputs
  const [form, setForm] = useState({
    patientName: "",
    email: "",
    appointmentDate: "",
    appointmentTime: "",
    service: "", // New state for the selected service
  });

  // State for loading status
  const [loading, setLoading] = useState(false);
  // State to store fetched availability data
  const [availability, setAvailability] = useState<Availability[]>([]);
  // State to track the currently selected date on the calendar
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // State to store the available time slots for the selected date
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  // Fetch initial availability data when the component mounts
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await fetch("/api/appointment", { method: "GET" });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setAvailability(data.appointments || []); // Ensure it's an array
      } catch (error) {
        console.error("Error fetching availability:", error);
        setAvailability([]); // Set to empty array on error
      }
    };
    fetchAvailability();
  }, []);

  // Update available time slots when selectedDate or availability changes
  useEffect(() => {
    if (!selectedDate) {
      // Reset form date and time if no date is selected
      setForm((f) => ({ ...f, appointmentDate: "", appointmentTime: "" }));
      setAvailableTimes([]);
      return;
    }

    const selectedStr = format(selectedDate, "yyyy-MM-dd");

    // Find times that are already booked for the selected date
    const bookedTimes = availability
      .filter(
        (a) =>
          a.appointmentDate.startsWith(selectedStr) && a.status !== "cancelled"
      )
      .map((a) => a.appointmentTime);

    // Filter out booked times from all available slots
    const available = ALL_HOURLY_SLOTS.filter((t) => !bookedTimes.includes(t));

    setAvailableTimes(available);
    // Update the form with the selected date and clear the time
    setForm((f) => ({
      ...f,
      appointmentDate: selectedStr,
      appointmentTime: "", // Reset time when date changes
    }));
  }, [selectedDate, availability]);

  // Handle input changes for form fields
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [id]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation: ensure all required fields are filled
    if (
      !form.patientName ||
      !form.email ||
      !form.appointmentDate ||
      !form.appointmentTime ||
      !form.service
    ) {
      alert(
        "Please fill in all required fields and select a date, time, and service."
      );
      return;
    }

    setLoading(true);
    try {
      // Prepare the data to be sent, mapping 'service' to 'reason'
      const appointmentData = {
        patientName: form.patientName,
        email: form.email,
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime,
        reason: form.service, // Use the selected service as the reason
      };

      const response = await fetch("/api/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      alert("Appointment booked successfully!");
      // Reset the form and clear selections
      setForm({
        patientName: "",
        email: "",
        appointmentDate: "",
        appointmentTime: "",
        service: "",
      });
      setSelectedDate(null);
      setAvailableTimes([]);

      // Re-fetch availability to show the newly booked appointment
      const res = await fetch("/api/appointment", { method: "GET" });
      const data = await res.json();
      setAvailability(data.appointments || []);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error submitting appointment:", error);
        alert(`Failed to book appointment: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Determine which dates should be marked on the calendar
  const activeDates = availability
    .filter((a) => a.status !== "cancelled")
    .map((a) => a.appointmentDate.slice(0, 10)); // Get YYYY-MM-DD

  // Custom styling for calendar tiles
  const tileClassName = ({
    date,
    view,
  }: {
    date: Date;
    view: string;
  }): string | null => {
    // The 'format' function expects a Date object
    // The 'view' is checked against a string literal "month"
    if (view === "month") {
      const formattedDate = format(date, "yyyy-MM-dd");
      // Mark dates that have at least one booked appointment
      if (activeDates.includes(formattedDate)) {
        return "react-calendar__tile--hasActive"; // Use the class for days with appointments
      }
    }
    return null;
  };

  // Custom styling for react-calendar to integrate better with Tailwind
  // (This remains the same as the previous version)
  const calendarStyles = `
        .react-calendar {
            border: 1px solid #e5e7eb; /* gray-200 */
            border-radius: 0.375rem; /* rounded-md */
            padding: 1rem; /* p-4 */
            background-color: white;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); /* shadow-md */
        }
        .react-calendar__navigation button {
            color: #1f2937; /* text-gray-800 */
            min-width: 44px;
            height: 44px;
            background: none;
            border: none;
            font-weight: bold;
            font-size: 1.125rem; /* text-xl */
            margin-top: 6px; /* mt-1 */
        }
        .react-calendar__navigation button:hover {
            background-color: #f3f4f6; /* hover:bg-gray-100 */
        }
        .react-calendar__navigation__prev2-button,
        .react-calendar__navigation__next2-button {
            display: none; /* Hide double arrow buttons */
        }
        .react-calendar__month-view__weekdays abbr {
            text-decoration: none;
            font-weight: 600; /* font-semibold */
            color: #4b5563; /* text-gray-600 */
        }
        .react-calendar__tile {
            text-align: center;
            padding: 0.5rem 0; /* py-2 */
            display: flex;
            justify-content: center;
            align-items: center;
            flex-grow: 1;
            min-width: 44px; /* Ensure minimum width */
            min-height: 44px; /* Ensure minimum height */
            border-radius: 0.375rem; /* rounded-md */
            transition: background-color 0.2s ease, color 0.2s ease;
        }
        .react-calendar__tile:not(.react-calendar__tile--active):not(.react-calendar__tile--hasActive):hover {
            background-color: #f3f4f6; /* hover:bg-gray-100 */
            color: #111827; /* hover:text-gray-900 */
        }
        .react-calendar__tile--active {
            background-color: #3b82f6; /* bg-blue-500 */
            color: white;
        }
        .react-calendar__tile--hasActive { /* For days with appointments */
            background-color: #e0f2fe; /* bg-blue-50 */
            border: 1px solid #bfdbfe; /* border-blue-200 */
            font-weight: bold;
            color: #0f4086; /* text-blue-900 */
        }
        .react-calendar__tile--hasActive:not(.react-calendar__tile--active):hover {
             background-color: #bae6fd; /* hover:bg-blue-100 */
             border: 1px solid #93c5fd; /* hover:border-blue-300 */
             color: #0f4086; /* hover:text-blue-900 */
        }
        .react-calendar__year-view__months__month,
        .react-calendar__decade-view__years__year,
        .react-calendar__century-view__centuries__century {
             border-radius: 0.375rem; /* rounded-md */
        }
        .react-calendar__tile--neighboringMonth {
            color: #9ca3af; /* text-gray-400 */
        }
    `;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <style>{calendarStyles}</style> {/* Inject custom styles */}
      <div className="container">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-6 sm:p-8">
          <h2 className="text-3xl font-extrabold text-center mb-8 text-gray-900">
            Book Your Appointment
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Calendar Section */}
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Select a Date
              </h3>
              <Calendar
                value={selectedDate}
                onChange={(value) => setSelectedDate(value as Date)}
                tileClassName={tileClassName}
                className="custom-react-calendar"
              />
              {selectedDate && (
                <p className="mt-4 text-sm text-center text-gray-600">
                  Selected:{" "}
                  <span className="font-medium text-gray-800">
                    {format(selectedDate, "EEEE, MMMM do, yyyy")}
                  </span>
                </p>
              )}
            </div>

            {/* Appointment Form Section */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="patientName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="patientName"
                  value={form.patientName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={form.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {/* Service Selection */}
              <div>
                <label
                  htmlFor="service"
                  className="block text-sm font-medium text-gray-700"
                >
                  Select Service
                </label>
                <select
                  id="service"
                  value={form.service}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                  required
                >
                  <option value="" disabled hidden>
                    -- Please select a service --
                  </option>
                  {AVAILABLE_SERVICES.map((service) => (
                    <option key={service.id} value={service.name}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Choose a Time Slot
                  </label>
                  {availableTimes.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {availableTimes.map((time) => (
                        <button
                          type="button"
                          key={time}
                          onClick={() =>
                            setForm((f) => ({ ...f, appointmentTime: time }))
                          }
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                                                    ${
                                                      form.appointmentTime ===
                                                      time
                                                        ? "bg-blue-600 text-white shadow-md"
                                                        : "bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                                    }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-center text-gray-500 italic p-4 border border-dashed rounded-md">
                      No available time slots for this date. Please select
                      another date.
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                                       bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                                       disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={
                  loading ||
                  !form.appointmentDate ||
                  !form.appointmentTime ||
                  !form.service
                }
              >
                {loading ? "Booking..." : "Confirm Appointment"}
              </button>
            </form>
          </div>

          {/* Scheduled Appointments Section */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <h3 className="text-2xl font-bold text-center mb-6 text-gray-900">
              Upcoming Appointments
            </h3>
            {availability.length === 0 ? (
              <p className="text-center text-gray-500 italic">
                No appointments booked yet.
              </p>
            ) : (
              <ul className="space-y-3 max-w-lg mx-auto">
                {availability
                  .sort(
                    (a, b) =>
                      // Sort by date and time
                      new Date(
                        `${a.appointmentDate}T${a.appointmentTime}`
                      ).getTime() -
                      new Date(
                        `${b.appointmentDate}T${b.appointmentTime}`
                      ).getTime()
                  )
                  .map((a, idx) => (
                    <li
                      key={idx}
                      className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center"
                    >
                      <div>
                        <p className="text-base font-semibold text-gray-800">
                          {format(parseISO(a.appointmentDate), "MMMM d, yyyy")}{" "}
                          at {a.appointmentTime}
                        </p>
                        <p className="text-sm text-gray-600">{a.patientName}</p>
                        {/* Display the reason (service) if it exists */}
                        {a.reason && (
                          <p className="text-xs text-gray-500 mt-1">
                            Service: {a.reason}
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full
                                             ${
                                               a.status === "confirmed"
                                                 ? "bg-green-100 text-green-800"
                                                 : a.status === "pending"
                                                 ? "bg-yellow-100 text-yellow-800"
                                                 : a.status === "completed"
                                                 ? "bg-blue-100 text-blue-800"
                                                 : "bg-red-100 text-red-800" // cancelled
                                             }`}
                      >
                        {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
