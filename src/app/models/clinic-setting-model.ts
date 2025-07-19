// models/ClinicSettings.js (or .ts if using TypeScript backend)

import mongoose, { Schema, Document, models } from 'mongoose';

// --- Define Sub-Schemas ---
// TimeSlot Schema
const timeSlotSchema = new Schema({
  startTime: {
    type: String,
    required: true,
    trim: true,
    // Basic regex for HH:MM format
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
  endTime: {
    type: String,
    required: true,
    trim: true,
    // Basic regex for HH:MM format
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
}, { _id: false }); // Embed, don't create a separate collection for TimeSlots

// CustomHours Schema
const customHoursSchema = new Schema({
  date: {
    type: String, // Storing as ISO string for simplicity in frontend, can validate format
    required: true,
    trim: true,
  },
  hours: {
    type: timeSlotSchema, // Can be null if the day is closed
    required: false,
  },
}, { _id: false }); // Embed

// RecurringClosure Schema
const recurringClosureSchema = new Schema({
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  dayOfMonth: {
    type: Number,
    required: true,
    min: 1,
    max: 31,
  },
  description: {
    type: String,
    trim: true,
    required: false,
  },
}, { _id: false }); // Embed

// --- Main ClinicSettings Schema ---
// Define an interface for the Document itself
export interface IClinicSettings extends Document {
  regularHours: typeof timeSlotSchema; // Mongoose schema types are used here
  saturdayHours: typeof timeSlotSchema | null;
  sundayHours: typeof timeSlotSchema | null;
  customHours: typeof customHoursSchema[];
  recurringClosures: typeof recurringClosureSchema[];
  isOpen: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

const ClinicSettingsSchema: Schema = new Schema({
  regularHours: {
    type: timeSlotSchema,
    required: true,
  },
  saturdayHours: {
    type: timeSlotSchema,
    required: false, // null means closed
  },
  sundayHours: {
    type: timeSlotSchema,
    required: false, // null means closed
  },
  customHours: {
    type: [customHoursSchema],
    required: false,
    default: [],
  },
  recurringClosures: {
    type: [recurringClosureSchema],
    required: false,
    default: [],
  },
  isOpen: {
    type: Boolean,
    required: true,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
}, {
  // For a single clinic settings document, you might want to enforce that only one exists.
  // You could achieve this by:
  // 1. Having a fixed identifier (e.g., a document with _id: 'clinicConfig') and always fetching/updating that one.
  // 2. Or, if you anticipate multiple settings profiles, then this structure is fine.
  // For typical clinic settings, a single document is common.
});

// --- Model Export ---
// Use the provided User model pattern
export default models.ClinicSetting
  ? mongoose.model<IClinicSettings>('ClinicSetting')
  : mongoose.model<IClinicSettings>('ClinicSetting', ClinicSettingsSchema);