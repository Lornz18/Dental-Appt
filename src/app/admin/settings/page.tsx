"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  FormEvent,
  useRef,
} from "react";
import {
  format,
  parseISO,
  isToday,
  isTomorrow,
  isValid,
  parse,
} from "date-fns";
import {
  Trash2,
  RefreshCw,
  Calendar,
  Clock,
  LogOut,
  BarChart3,
  Sun, // For general opening hours
  Moon, // For Saturday hours
  CalendarOff, // For closed days
  Repeat, // For recurring closures
  Settings,
  Home, // For general settings
  Wrench, // For Services icon
  Pencil, // For Edit icon
  Plus, // For Add icon
  X, // For Close icon
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ModalPortal from "@/components/modal/modal-portal"; // Adjust import path as needed

// --- Types (remain the same) ---
type Appointment = {
  _id: string;
  patientName: string;
  email: string;
  appointmentDate: string;
  appointmentTime: string;
  reason?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
};
type TimeSlot = { startTime: string; endTime: string };
type CustomHours = { date: string; hours: TimeSlot | null };
type RecurringClosure = {
  month: number;
  dayOfMonth: number;
  description: string;
};
type ClinicSettings = {
  regularHours: TimeSlot;
  saturdayHours: TimeSlot | null;
  sundayHours: TimeSlot | null;
  customHours: CustomHours[];
  recurringClosures: RecurringClosure[];
  isOpen: boolean;
};
type Service = {
  _id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
};

// --- Component ---
export default function AdminSettingPage() {
  // --- General State ---
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // State for Active Tab
  const [activeTab, setActiveTab] = useState<"settings" | "services">(
    "settings"
  );

  // --- Clinic Settings State ---
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>({
    regularHours: { startTime: "09:00", endTime: "17:00" },
    saturdayHours: { startTime: "09:00", endTime: "13:00" },
    sundayHours: null,
    customHours: [],
    recurringClosures: [],
    isOpen: true,
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // --- Services State ---
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  // State for managing the service form (add/edit)
  // **MODIFICATION:** isServiceFormOpen now directly controls ModalPortal's isOpen
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Partial<Service> | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Ref to manage body overflow
  const bodyRef = useRef<HTMLBodyElement | null>(null);

  // --- Effect to manage body scroll ---
  useEffect(() => {
    bodyRef.current = document.body as HTMLBodyElement | null; // Safely get body element

    if (isServiceFormOpen && bodyRef.current) {
      bodyRef.current.style.overflow = "hidden"; // Hide scrollbars
    } else if (!isServiceFormOpen && bodyRef.current) {
      bodyRef.current.style.overflow = ""; // Restore default overflow
    }

    return () => {
      if (bodyRef.current) {
        bodyRef.current.style.overflow = ""; // Cleanup on unmount or state change
      }
    };
  }, [isServiceFormOpen]);

  // --- Authentication Check ---
  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (isAdmin !== "true") {
      router.replace("/admin");
    }
  }, [router]);

  // --- Fetch Clinic Settings ---
  const fetchClinicSettings = useCallback(async () => {
    setSettingsLoading(true);
    setSettingsError(null);
    try {
      const res = await fetch("/api/clinic-setting");
      if (!res.ok) {
        if (res.status === 404) {
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
          const errorData = await res.json();
          throw new Error(
            errorData.message ||
              `Failed to fetch settings (Status: ${res.status})`
          );
        }
      } else {
        const data = await res.json();
        if (data && data.settings) {
          if (
            data.settings.regularHours &&
            data.settings.regularHours.startTime &&
            data.settings.regularHours.endTime
          ) {
            setClinicSettings(data.settings);
          } else {
            console.error(
              "Fetched settings are incomplete, reverting to defaults."
            );
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
      if (err instanceof Error) setSettingsError(err.message);
      else
        setSettingsError(
          "An unknown error occurred while fetching clinic settings."
        );
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

  // --- Fetch Services ---
  const fetchServices = useCallback(async () => {
    setServicesLoading(true);
    setServicesError(null);
    try {
      const res = await fetch("/api/services"); // GET all services
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message ||
            `Failed to fetch services (Status: ${res.status})`
        );
      }
      const data = await res.json();
      if (data && Array.isArray(data.data)) {
        setServices(data.data);
      } else {
        if (res.ok)
          console.warn("Services fetched, but data format was unexpected.");
        setServices([]);
      }
    } catch (err: unknown) {
      if (err instanceof Error) setServicesError(err.message);
      else
        setServicesError("An unknown error occurred while fetching services.");
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  }, []);

  // Fetch initial data when the component mounts
  useEffect(() => {
    fetchClinicSettings();
    fetchServices();
  }, [fetchClinicSettings, fetchServices]);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    toast.success("Logged out successfully");
    router.push("/admin");
  };

  // --- Clinic Settings Handlers ---
  const handleTimeChange = (
    field: "regularHours" | "saturdayHours" | "sundayHours",
    timeType: "startTime" | "endTime",
    value: string
  ) => {
    setClinicSettings((prev) => {
      const currentField = prev[field];
      const updatedTimeSlot: TimeSlot = {
        startTime:
          typeof currentField === "object" &&
          currentField !== null &&
          currentField.startTime
            ? currentField.startTime
            : "09:00",
        endTime:
          typeof currentField === "object" &&
          currentField !== null &&
          currentField.endTime
            ? currentField.endTime
            : "17:00",
      };
      updatedTimeSlot[timeType] = value;
      return {
        ...prev,
        [field]: updatedTimeSlot,
      };
    });
  };

  const toggleSaturdayHours = () => {
    setClinicSettings((prev) => ({
      ...prev,
      saturdayHours: prev.saturdayHours
        ? null
        : { startTime: "09:00", endTime: "13:00" },
    }));
  };

  const toggleSundayHours = () => {
    setClinicSettings((prev) => ({
      ...prev,
      sundayHours: prev.sundayHours
        ? null
        : { startTime: "10:00", endTime: "16:00" },
    }));
  };

  const addCustomHour = () => {
    const newCustomHour: CustomHours = {
      date: format(new Date(), "yyyy-MM-dd"),
      hours: { startTime: "09:00", endTime: "17:00" },
    };
    setClinicSettings((prev) => ({
      ...prev,
      customHours: [...prev.customHours, newCustomHour],
    }));
  };

  const handleCustomHourChange = (
    index: number,
    field: "date" | "hours",
    value: string | TimeSlot | null
  ) => {
    setClinicSettings((prev) => {
      const newCustomHours = [...prev.customHours];
      const currentCustomHour = newCustomHours[index];
      if (field === "hours") {
        let updatedHours: TimeSlot | null;
        if (value === null) updatedHours = null;
        else if (
          typeof value === "object" &&
          value !== null &&
          "startTime" in value &&
          "endTime" in value
        ) {
          const timeSlotValue = value as TimeSlot;
          updatedHours = {
            startTime: timeSlotValue.startTime || "09:00",
            endTime: timeSlotValue.endTime || "17:00",
          };
        } else {
          updatedHours = currentCustomHour.hours;
          console.error(
            "Invalid value passed to handleCustomHourChange for 'hours'"
          );
        }
        newCustomHours[index] = { ...currentCustomHour, hours: updatedHours };
      } else if (field === "date") {
        const dateString = value as string;
        newCustomHours[index] = { ...currentCustomHour, date: dateString };
      } else console.error(`Unexpected field type: ${field}`);
      return { ...prev, customHours: newCustomHours };
    });
  };

  const removeCustomHour = (index: number) => {
    setClinicSettings((prev) => ({
      ...prev,
      customHours: prev.customHours.filter((_, i) => i !== index),
    }));
  };

  const addRecurringClosure = () => {
    const newRecurringClosure: RecurringClosure = {
      month: 1,
      dayOfMonth: 1,
      description: "",
    };
    setClinicSettings((prev) => ({
      ...prev,
      recurringClosures: [...prev.recurringClosures, newRecurringClosure],
    }));
  };

  const handleRecurringClosureChange = (
    index: number,
    field: "month" | "dayOfMonth" | "description",
    value: string | number
  ) => {
    setClinicSettings((prev) => {
      const newRecurringClosures = [...prev.recurringClosures];
      const numericValue = parseInt(value as string, 10);
      newRecurringClosures[index] = {
        ...newRecurringClosures[index],
        [field]:
          field === "description"
            ? (value as string)
            : isNaN(numericValue)
            ? newRecurringClosures[index][field]
            : numericValue,
      };
      return { ...prev, recurringClosures: newRecurringClosures };
    });
  };

  const removeRecurringClosure = (index: number) => {
    setClinicSettings((prev) => ({
      ...prev,
      recurringClosures: prev.recurringClosures.filter((_, i) => i !== index),
    }));
  };

  const saveClinicSettings = async () => {
    const toastId = toast.loading("Saving settings...");
    try {
      const res = await fetch("/api/clinic-setting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clinicSettings),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save settings");
      }
      toast.success("Clinic settings saved successfully!", { id: toastId });
    } catch (err: unknown) {
      if (err instanceof Error)
        toast.error(`Error saving settings: ${err.message}`, { id: toastId });
      else
        toast.error(`An unexpected error occurred while saving settings`, {
          id: toastId,
        });
    }
  };

  // --- Services Handlers ---
  const handleOpenAddServiceForm = () => {
    setIsEditing(false);
    setCurrentService({
      name: "",
      description: "",
      durationMinutes: 60,
      price: 0.0,
    });
    setFormErrors({});
    setIsServiceFormOpen(true); // Set state to true to show the modal
  };

  const handleOpenEditServiceForm = (service: Service) => {
    setIsEditing(true);
    setCurrentService({ ...service });
    setFormErrors({});
    setIsServiceFormOpen(true); // Set state to true to show the modal
  };

  const handleCloseServiceForm = () => {
    setIsServiceFormOpen(false); // Set state to false to hide the modal
    setCurrentService(null);
    setIsEditing(false);
    setFormErrors({});
  };

  // --- Input Validation Helper ---
  const validateServiceForm = (
    serviceData: Partial<Service>
  ): { [key: string]: string } => {
    const errors: { [key: string]: string } = {};
    if (!serviceData.name?.trim()) errors.name = "Service name is required.";
    if (!serviceData.description?.trim())
      errors.description = "Description is required.";
    if (
      typeof serviceData.durationMinutes !== "number" ||
      serviceData.durationMinutes <= 0
    )
      errors.durationMinutes = "Duration must be a positive number.";
    if (typeof serviceData.price !== "number" || serviceData.price < 0)
      errors.price = "Price cannot be negative.";
    return errors;
  };

  // Handler for submitting the service form (Add or Edit)
  const handleSubmitServiceForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentService) return;

    const serviceData = {
      name: currentService.name!,
      description: currentService.description!,
      durationMinutes: Number(currentService.durationMinutes),
      price: Number(currentService.price),
    };

    const validationErrors = validateServiceForm(serviceData);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      toast.error("Please fix the errors in the form.");
      return;
    }

    const validatedServiceData = {
      name: serviceData.name!,
      description: serviceData.description!,
      durationMinutes: serviceData.durationMinutes!,
      price: serviceData.price!,
    };

    const toastId = toast.loading(
      isEditing ? "Updating service..." : "Adding service..."
    );

    try {
      let res;
      if (isEditing && currentService._id) {
        // --- EDIT SERVICE ---
        res = await fetch(`/api/services/${currentService._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validatedServiceData),
        });
      } else {
        // --- ADD SERVICE ---
        res = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validatedServiceData),
        });
      }

      const result = await res.json();

      if (!res.ok) {
        // Handle API errors (e.g., validation errors from the backend)
        const errorMessage =
          result.message ||
          result.details?.join(", ") ||
          `HTTP error! status: ${res.status}`;
        throw new Error(errorMessage);
      }

      toast.success(
        isEditing
          ? "Service updated successfully!"
          : "Service added successfully!",
        { id: toastId }
      );
      handleCloseServiceForm(); // Close the form on success
      fetchServices(); // Re-fetch the services list to show the changes
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(
          `${isEditing ? "Update" : "Add"} Service Failed: ${err.message}`,
          { id: toastId }
        );
      } else {
        toast.error(`An unknown error occurred during service operation.`, {
          id: toastId,
        });
      }
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this service? This action cannot be undone."
    );
    if (!confirmDelete) return;

    const toastId = toast.loading("Deleting service...");
    try {
      const res = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || `HTTP error! status: ${res.status}`);
      }

      toast.success("Service deleted successfully!", { id: toastId });
      fetchServices();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(`Delete Service Failed: ${err.message}`, { id: toastId });
      } else {
        toast.error(`An unknown error occurred during service deletion.`, {
          id: toastId,
        });
      }
    }
  };

  // Handler for input changes in the service form
  const handleServiceInputChange = (
    field: keyof Service,
    value: string | number
  ) => {
    setCurrentService((prev) => {
      const updatedService = { ...(prev as Service), [field]: value };
      // Clear specific error when user starts typing in that field
      if (formErrors[field as string]) {
        const newErrors = { ...formErrors };
        delete newErrors[field as string];
        setFormErrors(newErrors);
      }
      return updatedService;
    });
  };

  // --- Render Functions for Tab Content ---
  const renderClinicSettings = () => (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Settings className="w-6 h-6 mr-2 text-purple-400" /> Clinic Settings
        </h2>
        <button
          onClick={saveClinicSettings}
          disabled={settingsLoading}
          className={`flex items-center px-5 py-2 rounded-xl font-medium transition-all duration-200 ${
            settingsLoading
              ? "bg-slate-600 cursor-not-allowed"
              : "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          } text-white`}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${settingsLoading ? "animate-spin" : ""}`}
          />{" "}
          {settingsLoading ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {settingsError && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm">
          <div className="flex items-center">
            {" "}
            <span className="mr-2">⚠️</span> Settings Error: {settingsError}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regular Hours (Mon-Fri) */}
        <div className="bg-white/5 p-4 rounded-lg border border-white/15">
          <h3 className="text-lg font-semibold text-slate-300 mb-3 flex items-center">
            <Sun className="w-5 h-5 mr-2 text-yellow-400" /> Regular Weekday
            Hours (Mon-Fri)
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <label className="mr-2 text-slate-300">From:</label>
              <input
                type="time"
                value={clinicSettings.regularHours.startTime}
                onChange={(e) =>
                  handleTimeChange("regularHours", "startTime", e.target.value)
                }
                className="p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/10 border border-white/20 text-white"
              />
            </div>
            <div className="flex items-center">
              <label className="mr-2 text-slate-300">To:</label>
              <input
                type="time"
                value={clinicSettings.regularHours.endTime}
                onChange={(e) =>
                  handleTimeChange("regularHours", "endTime", e.target.value)
                }
                className="p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/10 border border-white/20 text-white"
              />
            </div>
          </div>
        </div>

        {/* Saturday Hours */}
        <div className="bg-white/5 p-4 rounded-lg border border-white/15">
          <h3 className="text-lg font-semibold text-slate-300 mb-3 flex items-center">
            <Moon className="w-5 h-5 mr-2 text-indigo-400" /> Saturday Hours
          </h3>
          <div className="flex items-center justify-between">
            {clinicSettings.saturdayHours ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <label className="mr-2 text-slate-300">From:</label>
                  <input
                    type="time"
                    value={clinicSettings.saturdayHours.startTime}
                    onChange={(e) =>
                      handleTimeChange(
                        "saturdayHours",
                        "startTime",
                        e.target.value
                      )
                    }
                    className="p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/10 border border-white/20 text-white"
                  />
                </div>
                <div className="flex items-center">
                  <label className="mr-2 text-slate-300">To:</label>
                  <input
                    type="time"
                    value={clinicSettings.saturdayHours.endTime}
                    onChange={(e) =>
                      handleTimeChange(
                        "saturdayHours",
                        "endTime",
                        e.target.value
                      )
                    }
                    className="p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/10 border border-white/20 text-white"
                  />
                </div>
              </div>
            ) : (
              <p className="text-slate-300">Clinic is closed on Saturdays.</p>
            )}
            <button
              onClick={toggleSaturdayHours}
              className={`px-3 py-1 rounded-md font-medium text-sm transition-all duration-200 ${
                clinicSettings.saturdayHours
                  ? "bg-red-500/20 hover:bg-red-500/30 text-red-300"
                  : "bg-green-500/20 hover:bg-green-500/30 text-green-300"
              }`}
            >
              {clinicSettings.saturdayHours
                ? "Close Saturday"
                : "Open Saturday"}
            </button>
          </div>
        </div>

        {/* Sunday Hours */}
        <div className="bg-white/5 p-4 rounded-lg border border-white/15">
          <h3 className="text-lg font-semibold text-slate-300 mb-3 flex items-center">
            <Sun className="w-5 h-5 mr-2 text-orange-400" /> Sunday Hours
          </h3>
          <div className="flex items-center justify-between">
            {clinicSettings.sundayHours ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <label className="mr-2 text-slate-300">From:</label>
                  <input
                    type="time"
                    value={clinicSettings.sundayHours.startTime}
                    onChange={(e) =>
                      handleTimeChange(
                        "sundayHours",
                        "startTime",
                        e.target.value
                      )
                    }
                    className="p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/10 border border-white/20 text-white"
                  />
                </div>
                <div className="flex items-center">
                  <label className="mr-2 text-slate-300">To:</label>
                  <input
                    type="time"
                    value={clinicSettings.sundayHours.endTime}
                    onChange={(e) =>
                      handleTimeChange("sundayHours", "endTime", e.target.value)
                    }
                    className="p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/10 border border-white/20 text-white"
                  />
                </div>
              </div>
            ) : (
              <p className="text-slate-300">Clinic is closed on Sundays.</p>
            )}
            <button
              onClick={toggleSundayHours}
              className={`px-3 py-1 rounded-md font-medium text-sm transition-all duration-200 ${
                clinicSettings.sundayHours
                  ? "bg-red-500/20 hover:bg-red-500/30 text-red-300"
                  : "bg-green-500/20 hover:bg-green-500/30 text-green-300"
              }`}
            >
              {clinicSettings.sundayHours ? "Close Sunday" : "Open Sunday"}
            </button>
          </div>
        </div>

        {/* Custom Date Closures/Hours */}
        <div className="bg-white/5 p-4 rounded-lg border border-white/15 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-300 mb-3 flex items-center">
            <CalendarOff className="w-5 h-5 mr-2 text-red-400" /> Specific Date
            Closures / Custom Hours
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-3">
            {clinicSettings.customHours.length === 0 && (
              <p className="text-slate-400">No specific date settings yet.</p>
            )}
            {clinicSettings.customHours.map((custom, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 rounded-lg bg-white/10 border border-white/15"
              >
                <input
                  type="date"
                  value={custom.date}
                  onChange={(e) =>
                    handleCustomHourChange(index, "date", e.target.value)
                  }
                  className="p-1.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-transparent border border-white/20 text-white w-36"
                />
                {custom.hours ? (
                  <div className="flex items-center gap-2">
                    <label className="text-slate-300">From:</label>
                    <input
                      type="time"
                      value={custom.hours.startTime}
                      onChange={(e) =>
                        handleCustomHourChange(index, "hours", {
                          ...(custom.hours as TimeSlot),
                          startTime: e.target.value,
                        })
                      }
                      className="p-1.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-transparent border border-white/20 text-white w-24"
                    />
                    <label className="text-slate-300">To:</label>
                    <input
                      type="time"
                      value={custom.hours.endTime}
                      onChange={(e) =>
                        handleCustomHourChange(index, "hours", {
                          ...(custom.hours as TimeSlot),
                          endTime: e.target.value,
                        })
                      }
                      className="p-1.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-transparent border border-white/20 text-white w-24"
                    />
                  </div>
                ) : (
                  <p className="text-slate-400">Closed</p>
                )}
                <button
                  onClick={() =>
                    handleCustomHourChange(
                      index,
                      "hours",
                      custom.hours
                        ? null
                        : { startTime: "09:00", endTime: "17:00" }
                    )
                  }
                  className={`ml-auto px-2 py-0.5 rounded-md font-medium text-xs transition-all duration-200 ${
                    custom.hours
                      ? "bg-red-500/20 hover:bg-red-500/30 text-red-300"
                      : "bg-green-500/20 hover:bg-green-500/30 text-green-300"
                  }`}
                >
                  {custom.hours ? "Set Closed" : "Set Open"}
                </button>
                <button
                  onClick={() => removeCustomHour(index)}
                  className="text-red-400 hover:text-red-500"
                  aria-label="Remove custom hour setting"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addCustomHour}
            className="mt-3 px-4 py-1.5 rounded-md font-medium bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition-all duration-200"
          >
            Add Custom Date
          </button>
        </div>

        {/* Recurring Monthly Closures */}
        <div className="bg-white/5 p-4 rounded-lg border border-white/15 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-300 mb-3 flex items-center">
            <Repeat className="w-5 h-5 mr-2 text-indigo-400" /> Recurring
            Monthly Closures
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-3">
            {clinicSettings.recurringClosures.length === 0 && (
              <p className="text-slate-400">No recurring closures set.</p>
            )}
            {clinicSettings.recurringClosures.map((closure, index) => (
              <div
                key={index}
                className="flex flex-wrap items-center gap-3 p-2 rounded-lg bg-white/10 border border-white/15"
              >
                <div className="flex items-center">
                  <label className="mr-2 text-slate-300">Month:</label>
                  <select
                    value={closure.month}
                    onChange={(e) =>
                      handleRecurringClosureChange(
                        index,
                        "month",
                        e.target.value
                      )
                    }
                    className="p-1.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/15 border border-white/20 text-white"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(
                      (month) => (
                        <option
                          key={month}
                          value={month}
                          className="bg-gray-800 text-white"
                        >
                          {format(new Date(2000, month - 1, 1), "MMMM")}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="mr-2 text-slate-300">Day:</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={closure.dayOfMonth}
                    onChange={(e) =>
                      handleRecurringClosureChange(
                        index,
                        "dayOfMonth",
                        e.target.value
                      )
                    }
                    className="p-1.5 w-20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/15 border border-white/20 text-white text-center"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Reason for closure (optional)"
                  value={closure.description}
                  onChange={(e) =>
                    handleRecurringClosureChange(
                      index,
                      "description",
                      e.target.value
                    )
                  }
                  className="p-1.5 flex-grow rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/15 border border-white/20 text-white"
                />
                <button
                  onClick={() => removeRecurringClosure(index)}
                  className="text-red-400 hover:text-red-500"
                  aria-label="Remove recurring closure"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addRecurringClosure}
            className="mt-3 px-4 py-1.5 rounded-md font-medium bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition-all duration-200"
          >
            Add Recurring Closure
          </button>
        </div>
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Wrench className="w-6 h-6 mr-2 text-cyan-400" /> Services
        </h2>
        <button
          onClick={handleOpenAddServiceForm}
          className="flex items-center px-5 py-2 rounded-xl font-medium transition-all duration-200 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50"
        >
          <Plus className="w-4 h-4 mr-2" /> Add New Service
        </button>
      </div>

      {servicesError && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm">
          <div className="flex items-center">
            {" "}
            <span className="mr-2">⚠️</span> Services Error: {servicesError}
          </div>
        </div>
      )}

      {servicesLoading ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-slate-300 animate-pulse">Loading services...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-slate-400">No services have been added yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/20 rounded-lg overflow-hidden">
            <thead className="bg-white/10 backdrop-blur-sm">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                >
                  Service Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                >
                  Duration (mins)
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                >
                  Price
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/5 backdrop-blur-sm divide-y divide-white/15">
              {services.map((service) => (
                <tr
                  key={service._id}
                  className="hover:bg-white/10 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {service.name}
                  </td>
                  <td className="px-6 py-4 whitespace-pre-wrap text-sm text-slate-300 max-w-xs">
                    {service.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-center">
                    {service.durationMinutes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-medium">
                    ${service.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenEditServiceForm(service)}
                      className="text-blue-200 hover:text-blue-300 transition-colors p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                      aria-label="Edit Service"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(service._id)}
                      className="text-red-400 hover:text-red-300 transition-colors p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                      aria-label="Delete Service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Service Form/Modal using Portal */}
      {/* **MODIFICATION:** Pass isServiceFormOpen as the isOpen prop */}
      <ModalPortal isOpen={isServiceFormOpen}>
        {/* Modal Content Wrapper - This div is styled and conditionally rendered by ModalPortal */}
        {/* The actual modal content goes inside this */}
        <div className="absolute top-0 w-full h-screen flex items-center justify-center overflow-hidden mx-auto">
          <div
            className="relative z-50 bg-white/10 border border-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-xl max-w-lg w-full transform transition-transform duration-300 ease-in-out
                       flex flex-col justify-between"
            // The transform/opacity styles below are redundant if ModalPortal handles rendering based on isOpen,
            // but can be kept for potential entry/exit animations managed by the parent if needed.
            // However, the ModalPortal itself does the conditional rendering, so these are less critical.
            // style={{
            //   transform: isServiceFormOpen ? "scale(1)" : "scale(0.95)",
            //   opacity: isServiceFormOpen ? 1 : 0,
            // }}
          >
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">
                  {isEditing ? "Edit Service" : "Add New Service"}
                </h3>
                <button
                  onClick={handleCloseServiceForm}
                  className="text-slate-400 hover:text-white transition-colors duration-200 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form
                onSubmit={handleSubmitServiceForm}
                noValidate
                className="space-y-4"
              >
                {/* Service Name Input */}
                <div className="relative">
                  <label
                    htmlFor="serviceName"
                    className="block text-sm font-medium text-slate-300 mb-1"
                  >
                    Service Name
                  </label>
                  <input
                    type="text"
                    id="serviceName"
                    name="name"
                    value={currentService?.name || ""}
                    onChange={(e) =>
                      handleServiceInputChange("name", e.target.value)
                    }
                    required
                    className={`mt-1 block w-full p-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/15 border ${
                      formErrors.name
                        ? "border-red-500 focus:ring-red-500"
                        : "border-white/20"
                    } text-white placeholder-slate-400 transition-colors duration-200`}
                    aria-invalid={!!formErrors.name}
                    aria-describedby={
                      formErrors.name ? "name-error" : undefined
                    }
                  />
                  {formErrors.name && (
                    <p
                      id="name-error"
                      className="absolute -bottom-5 left-0 text-xs text-red-400"
                    >
                      {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Service Description Textarea */}
                <div className="relative">
                  <label
                    htmlFor="serviceDescription"
                    className="block text-sm font-medium text-slate-300 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="serviceDescription"
                    name="description"
                    value={currentService?.description || ""}
                    onChange={(e) =>
                      handleServiceInputChange("description", e.target.value)
                    }
                    required
                    rows={4}
                    className={`mt-1 block w-full p-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/15 border ${
                      formErrors.description
                        ? "border-red-500 focus:ring-red-500"
                        : "border-white/20"
                    } text-white placeholder-slate-400 transition-colors duration-200 resize-none`}
                    aria-invalid={!!formErrors.description}
                    aria-describedby={
                      formErrors.description ? "description-error" : undefined
                    }
                  ></textarea>
                  {formErrors.description && (
                    <p
                      id="description-error"
                      className="absolute -bottom-5 left-0 text-xs text-red-400"
                    >
                      {formErrors.description}
                    </p>
                  )}
                </div>

                {/* Duration and Price Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <label
                      htmlFor="serviceDuration"
                      className="block text-sm font-medium text-slate-300 mb-1"
                    >
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      id="serviceDuration"
                      name="durationMinutes"
                      value={currentService?.durationMinutes || ""}
                      onChange={(e) =>
                        handleServiceInputChange(
                          "durationMinutes",
                          e.target.value
                        )
                      }
                      required
                      min="1"
                      className={`mt-1 block w-full p-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/15 border ${
                        formErrors.durationMinutes
                          ? "border-red-500 focus:ring-red-500"
                          : "border-white/20"
                      } text-white placeholder-slate-400 transition-colors duration-200`}
                      aria-invalid={!!formErrors.durationMinutes}
                      aria-describedby={
                        formErrors.durationMinutes
                          ? "duration-error"
                          : undefined
                      }
                    />
                    {formErrors.durationMinutes && (
                      <p
                        id="duration-error"
                        className="absolute -bottom-5 left-0 text-xs text-red-400"
                      >
                        {formErrors.durationMinutes}
                      </p>
                    )}
                  </div>
                  <div className="relative">
                    <label
                      htmlFor="servicePrice"
                      className="block text-sm font-medium text-slate-300 mb-1"
                    >
                      Price ($)
                    </label>
                    <input
                      type="number"
                      id="servicePrice"
                      name="price"
                      value={currentService?.price || ""}
                      onChange={(e) =>
                        handleServiceInputChange("price", e.target.value)
                      }
                      required
                      min="0"
                      step="0.01"
                      className={`mt-1 block w-full p-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/15 border ${
                        formErrors.price
                          ? "border-red-500 focus:ring-red-500"
                          : "border-white/20"
                      } text-white placeholder-slate-400 transition-colors duration-200`}
                      aria-invalid={!!formErrors.price}
                      aria-describedby={
                        formErrors.price ? "price-error" : undefined
                      }
                    />
                    {formErrors.price && (
                      <p
                        id="price-error"
                        className="absolute -bottom-5 left-0 text-xs text-red-400"
                      >
                        {formErrors.price}
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 text-white shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-50
                             disabled:bg-gray-600 disabled:cursor-not-allowed
                             bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 focus:ring-blue-500"
                  disabled={
                    !currentService?.name?.trim() ||
                    !currentService?.description?.trim() ||
                    (currentService.durationMinutes !== undefined &&
                      currentService.durationMinutes <= 0) ||
                    (currentService.price !== undefined &&
                      currentService.price < 0) ||
                    Object.keys(formErrors).length > 0
                  }
                >
                  {isEditing ? "Update Service" : "Add Service"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </ModalPortal>
    </div>
  );

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-600 via-primary to-slate-400 text-white">
      <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8 container">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <Link
                href={"/admin/dashboard"}
                className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center"
              >
                <BarChart3 className="w-6 h-6 text-white" />
              </Link>
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
                href={"/admin/dashboard"}
                className="cursor-pointer flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all duration-200 backdrop-blur-sm"
              >
                <Home className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Error Display for Appointments */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm">
              <div className="flex items-center">
                {" "}
                <span className="mr-2">⚠️</span> Error: {error}
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="mb-8 flex space-x-4 border-b border-white/20">
            <button
              onClick={() => setActiveTab("settings")}
              className={`py-3 px-6 rounded-t-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                activeTab === "settings"
                  ? "bg-white/15 text-white border-b-2 border-purple-500"
                  : "bg-transparent text-slate-300 hover:text-white"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Clinic Settings</span>
            </button>
            <button
              onClick={() => setActiveTab("services")}
              className={`py-3 px-6 rounded-t-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                activeTab === "services"
                  ? "bg-white/15 text-white border-b-2 border-cyan-500"
                  : "bg-transparent text-slate-300 hover:text-white"
              }`}
            >
              <Wrench className="w-5 h-5" />
              <span>Services</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "settings" && renderClinicSettings()}
          {activeTab === "services" && renderServices()}

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
