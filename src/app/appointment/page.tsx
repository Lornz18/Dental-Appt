"use client";

import React, { useState, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Keep this for default styles, but we'll override with Tailwind
import {
  format,
  parseISO,
  isValid,
  addMinutes,
  setMinutes,
  setHours,
  setSeconds,
  isBefore,
  isAfter,
  areIntervalsOverlapping,
} from "date-fns";
import toast from "react-hot-toast"; // Assuming you're using react-hot-toast for notifications

// --- Types ---

// Frontend representation of a Service
type Service = {
  _id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
};

// Updated Appointment type to include durationMinutes
type Appointment = {
  _id: string;
  patientName: string;
  email: string;
  appointmentDate: string; // ISO string format, expected to be 'YYYY-MM-DD' for merging with time
  // This field's format now depends on what is SENT vs. what is RECEIVED.
  // For this implementation, we send "h:mm a" but still expect "HH:MM" when fetching existing appointments.
  // This can be a source of confusion and requires careful backend handling.
  appointmentTime: string;
  reason?: string; // Stores the selected service NAME
  durationMinutes: number; // Duration of the appointment in minutes
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

// Helper to parse time string "HH:MM" into minutes since midnight
const parseTimeStringToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return 0; // Handle invalid time string parts
  return hours * 60 + minutes;
};

// Helper to format time "HH:MM" to "h:mm a"
const formatTo12HourTime = (timeStr: string): string => {
  if (!timeStr) return "";
  try {
    // Create a date object using a fixed date and the time string
    const date = new Date(`1970-01-01T${timeStr}:00`);
    if (isNaN(date.getTime())) {
      console.error(`Invalid time string for 12-hour format: ${timeStr}`);
      return timeStr; // Return original if malformed
    }
    return format(date, "h:mm a");
  } catch (error) {
    console.error("Error formatting time:", error);
    return timeStr; // Fallback
  }
};

// Helper to get the clinic's operating hours for a specific date
const getOperatingHoursForDate = (
  date: Date,
  settings: ClinicSettings
): TimeSlot | null => {
  const dateStr = format(date, "yyyy-MM-dd");
  const dayOfWeek = date.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday

  // 1. Check for specific custom closures/hours
  const customSetting = settings.customHours.find((c) => c.date === dateStr);
  if (customSetting) {
    return customSetting.hours; // null if closed, TimeSlot if custom hours
  }

  // 2. Check for recurring closures
  const month = date.getMonth() + 1; // getMonth() is 0-indexed
  const dayOfMonth = date.getDate();
  const isRecurringClosed = settings.recurringClosures.some(
    (rc) => rc.month === month && rc.dayOfMonth === dayOfMonth
  );
  if (isRecurringClosed) {
    return null;
  }

  // 3. Check for specific day hours
  if (dayOfWeek === 6) {
    // Saturday
    return settings.saturdayHours;
  }
  if (dayOfWeek === 0) {
    // Sunday
    return settings.sundayHours;
  }

  // 4. Default to regular hours (Monday-Friday)
  return settings.regularHours;
};

// Helper to check if a time slot is available for a given duration, considering existing bookings
const isTimeSlotAvailable = (
  requestedStartTime: Date,
  durationMinutes: number,
  clinicOperatingHours: TimeSlot | null,
  allBookedAppointmentsOnDay: Appointment[],
  currentSelectedDate: Date // Explicitly typed as Date
): boolean => {
  if (!currentSelectedDate || !clinicOperatingHours) {
    return false;
  }

  const requestedEndTime = addMinutes(requestedStartTime, durationMinutes);

  const clinicStartMinutes = parseTimeStringToMinutes(
    clinicOperatingHours.startTime
  );
  const clinicEndMinutes = parseTimeStringToMinutes(
    clinicOperatingHours.endTime
  );

  const clinicStartDateTime = setMinutes(
    setSeconds(
      setHours(currentSelectedDate, Math.floor(clinicStartMinutes / 60)),
      0
    ),
    clinicStartMinutes % 60
  );

  const clinicEndDateTime = setMinutes(
    setSeconds(
      setHours(currentSelectedDate, Math.floor(clinicEndMinutes / 60)),
      0
    ),
    clinicEndMinutes % 60
  );

  if (
    isBefore(requestedStartTime, clinicStartDateTime) ||
    isAfter(requestedEndTime, clinicEndDateTime)
  ) {
    return false;
  }

  for (const bookedApp of allBookedAppointmentsOnDay) {
    let bookedStart: Date | null = null;
    try {
      let datePart = bookedApp.appointmentDate;
      const timePart = bookedApp.appointmentTime;

      const parsedDateFromISO = parseISO(datePart);
      if (isValid(parsedDateFromISO)) {
        datePart = format(parsedDateFromISO, "yyyy-MM-dd");
      } else {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
          console.error(`Invalid date format for booking ID ${bookedApp._id}: "${datePart}". Expected YYYY-MM-DD. Skipping.`);
          continue;
        }
      }
      
      // IMPORTANT: This logic assumes the fetched `appointmentTime` is in "HH:MM" format.
      // If your API now returns "h:mm a", this part will FAIL.
      // You would need to parse the AM/PM time back to 24-hour format here.
      if (!timePart || !/^\d{2}:\d{2}$/.test(timePart)) {
        console.error(`Invalid time format for booking ID ${bookedApp._id}: "${timePart}". Expected HH:MM. Skipping.`);
        continue;
      }

      const appointmentDateTimeString = `${datePart}T${timePart}:00`;
      bookedStart = parseISO(appointmentDateTimeString);

      if (!bookedStart || isNaN(bookedStart.getTime())) {
        console.error(`Failed to parse final booked appointment start time: "${appointmentDateTimeString}". Skipping.`);
        continue;
      }
    } catch (error) {
      console.error(`Exception during parsing for booking ID ${bookedApp._id}:`, error);
      continue;
    }

    const bookedDuration = bookedApp.durationMinutes || 30;
    const bookedEnd = addMinutes(bookedStart, bookedDuration);

    if (
      areIntervalsOverlapping(
        { start: requestedStartTime, end: requestedEndTime },
        { start: bookedStart, end: bookedEnd }
      )
    ) {
      return false;
    }
  }

  return true;
};

// --- Component ---
export default function Appointment() {
  const [form, setForm] = useState({
    patientName: "",
    patientEmail: "",
    appointmentDate: "",
    appointmentTime: "",
    service: "",
  });

  const [loading, setLoading] = useState(false);
  const [bookedAppointments, setBookedAppointments] = useState<Appointment[]>(
    []
  );
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(
    null
  );
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  const [selectedServiceDetails, setSelectedServiceDetails] = useState<{
    name: string;
    price: number;
    durationMinutes: number;
  } | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  const fetchInitialData = useCallback(async () => {
    try {
      const resApp = await fetch("/api/appointment", { method: "GET" });
      if (!resApp.ok) {
        throw new Error(`Failed to fetch appointments (Status: ${resApp.status})`);
      }
      const dataApp = await resApp.json();
      setBookedAppointments(Array.isArray(dataApp.appointments) ? dataApp.appointments : []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setBookedAppointments([]);
      toast.error(`Could not load existing appointments: ${(error as Error).message}`);
    }
  }, []);

  const fetchClinicSettings = useCallback(async () => {
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
                setClinicSettings(dataSettings.settings);
            } else {
                throw new Error("Invalid data format received from settings API.");
            }
        }
    } catch (err) {
        console.error("Error fetching clinic settings:", err);
        setSettingsError((err as Error).message || "An unknown error occurred.");
        setClinicSettings({
            regularHours: { startTime: "09:00", endTime: "17:00" },
            saturdayHours: { startTime: "09:00", endTime: "13:00" },
            sundayHours: null,
            customHours: [],
            recurringClosures: [],
            isOpen: true,
        });
        toast.error(`Could not load clinic settings: ${(err as Error).message}`);
    } finally {
        setSettingsLoading(false);
    }
  }, []);

  const fetchServices = useCallback(async () => {
    setServicesLoading(true);
    setServicesError(null);
    try {
      const res = await fetch("/api/services");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to fetch services (Status: ${res.status})`);
      }
      const data = await res.json();
      setAvailableServices(data.data || []);
    } catch (err) {
      console.error("Error fetching services:", err);
      setServicesError((err as Error).message || "An unknown error occurred.");
      setAvailableServices([]);
      toast.error(`Could not load services: ${(err as Error).message}`);
    } finally {
      setServicesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
    fetchClinicSettings();
    fetchServices();
  }, [fetchInitialData, fetchClinicSettings, fetchServices]);

  useEffect(() => {
    if (!selectedDate || !clinicSettings || !selectedServiceDetails) {
      setAvailableTimes([]);
      if (!selectedDate) {
        setForm((f) => ({ ...f, appointmentDate: "", appointmentTime: "" }));
      }
      return;
    }

    const { durationMinutes } = selectedServiceDetails;
    const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
    const operatingHours = getOperatingHoursForDate(selectedDate, clinicSettings);

    if (!operatingHours) {
      setAvailableTimes([]);
      setForm((f) => ({ ...f, appointmentDate: "", appointmentTime: "" }));
      return;
    }

    const possibleStartTimes: Date[] = [];
    const startMinutes = parseTimeStringToMinutes(operatingHours.startTime);
    const endMinutes = parseTimeStringToMinutes(operatingHours.endTime);
    const iterationStepMinutes = 30;

    for (let currentMinutes = startMinutes; currentMinutes < endMinutes; currentMinutes += iterationStepMinutes) {
      const potentialStartTime = setMinutes(setSeconds(setHours(selectedDate, Math.floor(currentMinutes / 60)), 0), currentMinutes % 60);
      const potentialEndTime = addMinutes(potentialStartTime, durationMinutes);
      const actualClinicEndTime = setMinutes(setSeconds(setHours(selectedDate, Math.floor(endMinutes / 60)), 0), endMinutes % 60);
      if (!isAfter(potentialEndTime, actualClinicEndTime)) {
        possibleStartTimes.push(potentialStartTime);
      }
    }

    const availableSlotStrings: string[] = [];
    const bookedAppointmentsOnSelectedDate = bookedAppointments.filter(
      (a) => a.appointmentDate.startsWith(selectedDateStr) && a.status !== "cancelled"
    );

    for (const startTime of possibleStartTimes) {
      if (isTimeSlotAvailable(startTime, durationMinutes, operatingHours, bookedAppointmentsOnSelectedDate, selectedDate)) {
        availableSlotStrings.push(format(startTime, "HH:mm"));
      }
    }

    setAvailableTimes(availableSlotStrings);
    setForm((f) => ({
      ...f,
      appointmentDate: selectedDateStr,
      appointmentTime: "",
    }));
  }, [selectedDate, clinicSettings, bookedAppointments, selectedServiceDetails]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [id]: value }));
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedServiceName = e.target.value;
    setForm((prevForm) => ({
      ...prevForm,
      service: selectedServiceName,
      appointmentDate: "",
      appointmentTime: "",
    }));
    const service = availableServices.find((svc) => svc.name === selectedServiceName);
    if (service) {
      setSelectedServiceDetails({
        name: service.name,
        price: service.price,
        durationMinutes: service.durationMinutes,
      });
    } else {
      setSelectedServiceDetails(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.patientName ||
      !form.patientEmail ||
      !form.appointmentDate ||
      !form.appointmentTime ||
      !form.service ||
      !selectedServiceDetails
    ) {
      toast.error("Please fill in all required fields and select a date, time, and service.");
      return;
    }

    setLoading(true);
    try {
      // --- MODIFICATION START ---
      const fullAppointmentDate = parseISO(`${form.appointmentDate}T${form.appointmentTime}`);
      const timeWithAmPm = format(fullAppointmentDate, "h:mm a");

      const appointmentData = {
        patientName: form.patientName,
        patientEmail: form.patientEmail,
        appointmentDate: form.appointmentDate,
        appointmentTime: timeWithAmPm, // Sending time in "h:mm a" format
        reason: form.service,
        durationMinutes: selectedServiceDetails.durationMinutes,
      };
      // --- MODIFICATION END ---

      const response = await fetch("/api/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      toast.success("Appointment booked successfully!");
      setForm({
        patientName: "",
        patientEmail: "",
        appointmentDate: "",
        appointmentTime: "",
        service: "",
      });
      setSelectedDate(null);
      setAvailableTimes([]);
      setSelectedServiceDetails(null);

      fetchInitialData();
    } catch (error) {
      console.error("Error submitting appointment:", error);
      toast.error(`Failed to book appointment: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }): string | null => {
    if (view === "month" && clinicSettings) {
      const operatingHours = getOperatingHoursForDate(date, clinicSettings);
      const formattedDate = format(date, "yyyy-MM-dd");
      if (operatingHours === null) {
        return "react-calendar__tile--closed";
      }
      const hasBookings = bookedAppointments.some(
        (a) => a.appointmentDate.startsWith(formattedDate) && a.status !== "cancelled"
      );
      if (hasBookings) {
        return "react-calendar__tile--hasBookings";
      }
    }
    return null;
  };
  
  // (The rest of the component, including the JSX and styles, remains exactly the same)
  // ...
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
      <style>{calendarStyles}</style>
      <div className="container">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-6 sm:p-8">
          <h2 className="text-3xl font-extrabold text-center mb-8 text-gray-900">
            Book Your Appointment
          </h2>

          {settingsLoading || servicesLoading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-lg text-gray-600">Loading clinic information...</p>
            </div>
          ) : settingsError || servicesError ? (
            <div className="flex justify-center items-center h-64 bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
              <p className="text-lg text-center">
                <span className="font-bold">Error loading information:</span> {settingsError || servicesError}
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
              <div className="flex flex-col items-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Select a Date</h3>
                <Calendar
                  value={selectedDate}
                  onChange={(value) => {
                    if (value instanceof Date && isValid(value)) {
                      setSelectedDate(value);
                    } else {
                      setSelectedDate(null);
                      setForm((f) => ({ ...f, appointmentDate: "", appointmentTime: "" }));
                      setAvailableTimes([]);
                      setForm((f) => ({ ...f, service: "" }));
                      setSelectedServiceDetails(null);
                    }
                  }}
                  tileClassName={tileClassName}
                  minDate={new Date()}
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

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="patientName" className="block text-sm font-medium text-gray-700">Full Name</label>
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
                  <label htmlFor="patientEmail" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    id="patientEmail"
                    value={form.patientEmail}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-gray-700">Select Service</label>
                  <select
                    id="service"
                    value={form.service}
                    onChange={handleServiceChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                    required
                  >
                    <option value="" disabled hidden>-- Please select a service --</option>
                    {availableServices.map((service) => (
                      <option key={service._id} value={service.name}>{service.name}</option>
                    ))}
                  </select>
                </div>
                {selectedServiceDetails && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-700 p-3 rounded-md shadow-sm">
                    <p className="text-sm font-medium">Selected Service: {selectedServiceDetails.name}</p>
                    <p className="text-sm font-semibold mt-1">Price: ${selectedServiceDetails.price.toFixed(2)}</p>
                    <p className="text-sm font-medium mt-1">Duration: {selectedServiceDetails.durationMinutes} minutes</p>
                  </div>
                )}
                {selectedDate && form.service && selectedServiceDetails && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Choose a Time Slot</label>
                    {availableTimes.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {availableTimes.map((time) => (
                          <button
                            type="button"
                            key={time}
                            onClick={() => setForm((f) => ({ ...f, appointmentTime: time }))}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                              form.appointmentTime === time
                                ? "bg-blue-600 text-white shadow-md"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            }`}
                          >
                            {formatTo12HourTime(time)}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-center text-gray-500 italic p-4 border border-dashed rounded-md">
                        No available time slots for this date and selected service duration. Please select another date or service.
                      </p>
                    )}
                  </div>
                )}
                {form.appointmentDate && form.appointmentTime && (
                  <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 rounded-md shadow-sm transition-all duration-300 ease-in-out">
                    <p className="font-semibold text-sm">Your Selection:</p>
                    <p className="font-bold text-base mt-1">
                      {format(
                        parseISO(`${form.appointmentDate}T${form.appointmentTime}`),
                        "eeee, MMMM do, yyyy 'at' h:mm a"
                      )}
                    </p>
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={loading || !form.patientName || !form.patientEmail || !form.appointmentDate || !form.appointmentTime || !form.service || !selectedServiceDetails}
                >
                  {loading ? "Booking..." : "Confirm Appointment"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}