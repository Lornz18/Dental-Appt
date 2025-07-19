"use client";

import React, { useState, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Keep this for default styles, but we'll override with Tailwind
import { format, parseISO, isToday, isTomorrow, isValid, parse } from "date-fns";
import toast from "react-hot-toast"; // Assuming you're using react-hot-toast for notifications

// --- Types ---
type Appointment = {
  _id: string;
  patientName: string;
  email: string;
  appointmentDate: string; // ISO string
  appointmentTime: string; // Time in HH:MM format (will display as h:mm a)
  reason?: string; // Stores the selected service
  status: "pending" | "confirmed" | "completed" | "cancelled";
};

type TimeSlot = {
  startTime: string; // e.g., "09:00"
  endTime: string; // e.g., "17:00"
};

type CustomHours = {
  date: string; // ISO date string (e.g., "2023-10-27")
  hours: TimeSlot | null; // null means closed on this specific date
};

type RecurringClosure = {
  month: number; // 1-12
  dayOfMonth: number; // 1-31
  description: string; // e.g., "Annual Company Holiday"
};

type ClinicSettings = {
  regularHours: TimeSlot; // Monday - Friday
  saturdayHours: TimeSlot | null;
  sundayHours: TimeSlot | null;
  customHours: CustomHours[];
  recurringClosures: RecurringClosure[];
  isOpen: boolean; // General toggle for clinic being open/closed
};

// --- Helper Functions ---
// Formats date and time to "MMM d, yyyy at h:mm a" format
const formatDateTimeReadable = (dateStr: string, timeStr: string): string => {
  try {
    if (!dateStr || !timeStr) return "Invalid Date/Time";
    const date = parseISO(dateStr);
    if (isNaN(date.getTime())) return `${dateStr} ${timeStr}`; // Fallback for invalid ISO
    // Format time to 12-hour with AM/PM
    const formattedTime = format(new Date(`1970-01-01T${timeStr}:00`), "h:mm a");
    return `${format(date, "MMM d, yyyy")} at ${formattedTime}`;
  } catch {
    return `${dateStr} ${timeStr}`; // Fallback for any parsing errors
  }
};

// Helper to parse time string "HH:MM" into minutes since midnight
const parseTimeStringToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

// Helper to format time "HH:MM" to "h:mm a"
const formatTo12HourTime = (timeStr: string): string => {
    if (!timeStr) return "";
    try {
        const date = new Date(`1970-01-01T${timeStr}:00`);
        return format(date, "h:mm a");
    } catch (error) {
        console.error("Error formatting time:", error);
        return timeStr; // Fallback
    }
}

// Helper to get the clinic's operating hours for a specific date
const getOperatingHoursForDate = (date: Date, settings: ClinicSettings): TimeSlot | null => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = date.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday

    // 1. Check for specific custom closures/hours
    const customSetting = settings.customHours.find(c => c.date === dateStr);
    if (customSetting) {
        return customSetting.hours; // null if closed, TimeSlot if custom hours
    }

    // 2. Check for recurring closures
    const month = date.getMonth() + 1; // getMonth() is 0-indexed
    const dayOfMonth = date.getDate();
    const isRecurringClosed = settings.recurringClosures.some(
        rc => rc.month === month && rc.dayOfMonth === dayOfMonth
    );
    if (isRecurringClosed) {
        return null;
    }

    // 3. Check for specific day hours
    if (dayOfWeek === 6) { // Saturday
        return settings.saturdayHours;
    }
    if (dayOfWeek === 0) { // Sunday
        return settings.sundayHours;
    }

    // 4. Default to regular hours (Monday-Friday)
    return settings.regularHours;
};


// Helper to generate hourly time slots within a given TimeSlot
const generateHourlySlotsInSlot = (slot: TimeSlot | null): string[] => {
  if (!slot) return [];

  const startMinutes = parseTimeStringToMinutes(slot.startTime);
  const endMinutes = parseTimeStringToMinutes(slot.endTime);

  const slots: string[] = [];
  // Iterate by hour. We assume slots are on the hour.
  // If end time is 17:00, we include slots up to 16:00.
  for (let hour = startMinutes / 60; hour < endMinutes / 60; hour++) {
     // Ensure we don't generate slots beyond the end time boundary (e.g., if end is 17:30, don't show 17:00)
     if (hour * 60 < endMinutes) {
        slots.push(`${Math.floor(hour).toString().padStart(2, "0")}:00`);
     }
  }
  return slots;
};


// Define available services
const AVAILABLE_SERVICES = [
  { id: "consultation", name: "Initial Consultation" },
  { id: "checkup", name: "Routine Check-up" },
  { id: "followup", name: "Follow-up Appointment" },
  { id: "procedure", name: "Minor Procedure" },
  { id: "other", name: "Other" },
];

// --- Component ---
export default function Appointment() {
  // State for the form inputs
  const [form, setForm] = useState({
    patientName: "",
    email: "",
    appointmentDate: "",
    appointmentTime: "", // Stores time in HH:MM format
    service: "", // New state for the selected service
  });

  // State for loading status
  const [loading, setLoading] = useState(false);
  // State to store fetched availability data (booked appointments)
  const [bookedAppointments, setBookedAppointments] = useState<Appointment[]>([]);
  // State for clinic settings
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(null); // Initialize as null
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);


  // State to track the currently selected date on the calendar
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // State to store the available time slots for the selected date based on clinic hours and bookings
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  // Fetch initial data when the component mounts
  const fetchInitialData = useCallback(async () => {
    // Fetch Appointments
    try {
      const resApp = await fetch("/api/appointment", { method: "GET" });
      if (!resApp.ok) {
        throw new Error(`HTTP error fetching appointments! status: ${resApp.status}`);
      }
      const dataApp = await resApp.json();
      setBookedAppointments(dataApp.appointments || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setBookedAppointments([]);
    }

    // Fetch Clinic Settings
    setSettingsLoading(true);
    setSettingsError(null);
    try {
      const resSettings = await fetch("/api/clinic-setting");
      if (!resSettings.ok) {
        if (resSettings.status === 404) {
          console.warn("No clinic settings found via API, using defaults.");
          setClinicSettings({
            regularHours: { startTime: "09:00", endTime: "17:00" },
            saturdayHours: { startTime: "09:00", endTime: "13:00" },
            sundayHours: null,
            customHours: [],
            recurringClosures: [],
            isOpen: true,
          });
        } else {
          const errorData = await resSettings.json();
          throw new Error(errorData.message || `Failed to fetch settings (Status: ${resSettings.status})`);
        }
      } else {
        const dataSettings = await resSettings.json();
        if (dataSettings && dataSettings.settings) {
          // Validate essential fields before setting state
          if(dataSettings.settings.regularHours && dataSettings.settings.regularHours.startTime && dataSettings.settings.regularHours.endTime) {
             setClinicSettings(dataSettings.settings);
          } else {
             console.error("Fetched settings are incomplete, reverting to defaults.");
             setClinicSettings({
               regularHours: { startTime: "09:00", endTime: "17:00" },
               saturdayHours: { startTime: "09:00", endTime: "13:00" },
               sundayHours: null,
               customHours: [],
               recurringClosures: [],
               isOpen: true,
             });
             setSettingsError("Incomplete settings received from server.");
          }
        } else {
            throw new Error("Invalid data format received from settings API.");
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSettingsError(err.message);
      } else {
        setSettingsError("An unknown error occurred while fetching clinic settings.");
      }
      // Fallback to defaults on error
      setClinicSettings({
        regularHours: { startTime: "09:00", endTime: "17:00" },
        saturdayHours: { startTime: "09:00", endTime: "13:00" },
        sundayHours: null,
        customHours: [],
        recurringClosures: [],
        isOpen: true,
      });
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Update available time slots when selectedDate or clinicSettings changes
  useEffect(() => {
    if (!selectedDate || !clinicSettings) {
      // Reset form date and time if no date is selected or settings aren't loaded
      setForm((f) => ({ ...f, appointmentDate: "", appointmentTime: "" }));
      setAvailableTimes([]);
      return;
    }

    const selectedStr = format(selectedDate, "yyyy-MM-dd");

    // 1. Get the operating hours for the selected date based on clinic settings
    const operatingHours = getOperatingHoursForDate(selectedDate, clinicSettings!);

    // 2. Generate all possible hourly slots within those operating hours
    const allSlotsForDay = generateHourlySlotsInSlot(operatingHours);

    // 3. Find times that are already booked for the selected date
    const bookedTimes = bookedAppointments
      .filter(
        (a) =>
          a.appointmentDate.startsWith(selectedStr) && a.status !== "cancelled"
      )
      .map((a) => a.appointmentTime);

    // 4. Filter out booked times from all possible slots for the day
    const available = allSlotsForDay.filter((t) => !bookedTimes.includes(t));

    setAvailableTimes(available);
    // Update the form with the selected date and reset the time
    setForm((f) => ({
      ...f,
      appointmentDate: selectedStr,
      appointmentTime: "", // Reset time when date changes
    }));
  }, [selectedDate, clinicSettings, bookedAppointments]);

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
      toast.error("Please fill in all required fields and select a date, time, and service.");
      return;
    }

    setLoading(true);
    try {
      // Prepare the data to be sent, mapping 'service' to 'reason'
      const appointmentData = {
        patientName: form.patientName,
        email: form.email,
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime, // Still stores HH:MM internally for backend
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

      toast.success("Appointment booked successfully!");
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

      // Re-fetch appointments to show the newly booked one
      fetchInitialData(); // Re-use the function to fetch both appointments and settings
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error submitting appointment:", error);
        toast.error(`Failed to book appointment: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Determine which dates should be marked on the calendar
  const tileClassName = ({
    date,
    view,
  }: {
    date: Date;
    view: string;
  }): string | null => {
    if (view === "month" && clinicSettings) {
      const operatingHours = getOperatingHoursForDate(date, clinicSettings);
      const formattedDate = format(date, "yyyy-MM-dd");

      // Check if the date is specifically closed (null hours)
      if (operatingHours === null) {
        return "react-calendar__tile--closed"; // Custom class for closed days
      }

      // Check if the date has any booked appointments
      const hasBookings = bookedAppointments.some(
        (a) => a.appointmentDate.startsWith(formattedDate) && a.status !== "cancelled"
      );
      if (hasBookings) {
        return "react-calendar__tile--hasBookings"; // Custom class for days with bookings
      }
    }
    return null;
  };

  // Custom styling for react-calendar to integrate better with Tailwind
  const calendarStyles = `
        /* Base styles */
        .react-calendar {
            border: 1px solid #e5e7eb; /* gray-200 */
            border-radius: 0.5rem; /* rounded-lg */
            padding: 1rem; /* p-4 */
            background-color: white;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); /* shadow-md */
            max-width: 100%; /* Ensure it fits container */
            font-family: 'Inter', sans-serif; /* Assuming Tailwind default font */
        }
        .react-calendar__navigation {
            display: flex;
            justify-content: space-between; /* Changed for better spacing */
            margin-bottom: 1rem; /* mb-4 */
            padding-bottom: 0.5rem; /* pb-2 */
            border-bottom: 1px solid #f3f4f6; /* border-gray-100 */
        }
        .react-calendar__navigation button {
            color: #1f2937; /* text-gray-800 */
            min-width: 44px;
            height: 44px;
            background: none;
            border: none;
            font-weight: bold; /* font-bold */
            font-size: 1.25rem; /* text-xl */
            border-radius: 0.375rem; /* rounded-md */
            transition: background-color 0.2s ease;
        }
        .react-calendar__navigation button:hover {
            background-color: #f3f4f6; /* hover:bg-gray-100 */
            color: #3b82f6; /* hover:text-blue-500 */
        }
        .react-calendar__navigation__prev2-button,
        .react-calendar__navigation__next2-button {
            display: none; /* Hide double arrow buttons */
        }
        .react-calendar__month-view__weekdays abbr {
            text-decoration: none;
            font-weight: 600; /* font-semibold */
            color: #4b5563; /* text-gray-600 */
            font-size: 0.875rem; /* text-sm */
        }
        .react-calendar__tile {
            text-align: center;
            padding: 0; /* Reset padding, let button handle it */
            display: flex;
            justify-content: center;
            align-items: center;
            flex-grow: 1;
            min-width: 44px;
            min-height: 44px;
            background: none;
            border: none;
            font-size: 0.875rem; /* text-sm */
            border-radius: 0.375rem; /* rounded-md */
            transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
            color: #111827; /* text-gray-900 */
        }
        /* Active date (selected) */
        .react-calendar__tile--active {
            background-color: #3b82f6; /* bg-blue-500 */
            color: white;
            font-weight: 500; /* font-medium */
        }
        /* Hover state for active date */
        .react-calendar__tile--active:hover {
            background-color: #2563eb; /* hover:bg-blue-600 */
        }
        /* General hover state for non-active dates */
        .react-calendar__tile:not(.react-calendar__tile--active):not([disabled]):hover {
            background-color: #f3f4f6; /* hover:bg-gray-100 */
            color: #111827; /* hover:text-gray-900 */
        }
        /* Dates from previous/next month */
        .react-calendar__tile--neighboringMonth {
            color: #9ca3af; /* text-gray-400 */
        }
        /* Days with appointments */
        .react-calendar__tile--hasBookings {
            background-color: #e0f2fe; /* bg-blue-50 */
            border: 1px solid #bfdbfe; /* border-blue-200 */
            font-weight: 500; /* font-medium */
            color: #0f4086; /* text-blue-900 */
        }
        /* Hover for days with bookings (when not selected) */
        .react-calendar__tile--hasBookings:not(.react-calendar__tile--active):not([disabled]):hover {
             background-color: #bae6fd; /* hover:bg-blue-100 */
             border: 1px solid #93c5fd; /* hover:border-blue-300 */
             color: #0f4086; /* hover:text-blue-900 */
        }
        /* Closed days */
        .react-calendar__tile--closed {
            background-color: #fde7e8; /* bg-red-50 */
            border: 1px dashed #fca5a5; /* border-red-300 */
            color: #7f1d1a; /* text-red-800 */
            cursor: not-allowed;
            font-weight: 500; /* font-medium */
        }
        /* Hover for closed days */
        .react-calendar__tile--closed:hover {
            background-color: #fddded; /* hover:bg-red-100 */
            border-color: #f97070; /* hover:border-red-400 */
        }

        /* Styling for disabled dates */
        .react-calendar__tile[disabled] {
            background-color: #f9fafb; /* bg-gray-50 */
            color: #d1d5db; /* text-gray-300 */
            cursor: not-allowed;
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

          {settingsLoading ? (
            <div className="flex justify-center items-center h-64">
                <p className="text-lg text-gray-600">Loading clinic settings...</p>
            </div>
          ) : settingsError ? (
             <div className="flex justify-center items-center h-64 bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
                <p className="text-lg text-center">
                    <span className="font-bold">Error loading clinic settings:</span> {settingsError}
                    <br />
                    Please try again later or contact support.
                </p>
             </div>
          ) : !clinicSettings?.isOpen ? (
             <div className="flex justify-center items-center h-64 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg p-4">
                <p className="text-lg text-center font-semibold">
                    The clinic is currently closed. Please check back later.
                </p>
             </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Calendar Section */}
              <div className="flex flex-col items-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Select a Date
                </h3>
                <Calendar
                  value={selectedDate}
                  onChange={(value) => {
                      // Ensure we are working with a Date object
                      if (value instanceof Date && isValid(value)) {
                          setSelectedDate(value);
                      } else {
                          // Handle cases where value might be null or invalid
                          setSelectedDate(null);
                          setForm((f) => ({ ...f, appointmentDate: "", appointmentTime: "" }));
                          setAvailableTimes([]);
                      }
                  }}
                  tileClassName={tileClassName}
                  locale="en-US" // Specify locale if needed
                  minDate={new Date()} // Disable past dates
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
                            {formatTo12HourTime(time)} {/* Display time in 12-hour format */}
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
          )}


          {/* Removed the "Scheduled Appointments Section" as it was for admin view */}

        </div>
      </div>
    </div>
  );
}