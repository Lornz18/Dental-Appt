import mongoose, { Schema, Document, Model } from "mongoose";

// 1. UPDATED INTERFACE: Add the patientEmail property
export interface IAppointment extends Document {
  patientName: string;
  patientEmail: string; // <-- ADDED
  appointmentDate: Date;
  appointmentTime: string; // Time in HH:MM format
  reason: string; // e.g., The name of the service
  durationMinutes: number; // Duration of the appointment in minutes
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date; // Timestamps option adds this automatically
}

const AppointmentSchema: Schema<IAppointment> = new Schema(
  {
    patientName: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
      maxlength: [100, "Patient name cannot exceed 100 characters"],
    },

    // 2. NEW FIELD DEFINITION: The patientEmail field with validation
    patientEmail: {
      type: String,
      required: [true, "Patient email is required for notifications"],
      trim: true,
      lowercase: true, // Best practice to store emails in lowercase for consistency
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },

    appointmentDate: {
      type: Date,
      required: [true, "Appointment date is required"],
    },

    // After: Updated to accept "h:mm a" format
    appointmentTime: {
      type: String,
      required: [true, "Appointment time is required"],
      trim: true,
      validate: {
        validator: function (v) {
          // This regex checks for:
          // ^         - start of the string
          // \d{1,2}   - one or two digits for the hour (for 9:30 or 10:30)
          // :         - a literal colon
          // \d{2}     - two digits for the minute
          // ( )       - a single space
          // (AM|PM)   - the letters "AM" or "PM"
          // $         - end of the string
          // i         - case-insensitive (accepts am, pm, AM, PM)
          return /^\d{1,2}:\d{2} (AM|PM)$/i.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid time format. Please use a format like "9:30 AM".`,
      },
    },

    reason: {
      type: String,
      trim: true,
      maxlength: [500, "Reason for appointment cannot exceed 500 characters"],
    },

    durationMinutes: {
      type: Number,
      required: [true, "Appointment duration is required"],
      min: [1, "Duration must be at least 1 minute"],
    },

    status: {
      type: String,
      enum: {
        values: ["pending", "confirmed", "completed", "cancelled"],
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
      required: [true, "Appointment status is required"],
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// 3. UPDATED EXPORT: Type the model with the interface for better type-safety
const Appointment: Model<IAppointment> =
  mongoose.models.Appointment ||
  mongoose.model<IAppointment>("Appointment", AppointmentSchema);

export default Appointment;
