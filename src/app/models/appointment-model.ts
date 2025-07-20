import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
    patientName: string;
    appointmentDate: Date;
    appointmentTime: string; // Time in HH:MM format
    reason?: string; // e.g., The name of the service
    durationMinutes: number; // Duration of the appointment in minutes
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    createdAt: Date;
    updatedAt?: Date;
}

const AppointmentSchema: Schema = new Schema({
    patientName: {
        type: String,
        required: [true, 'Patient name is required'],
        trim: true,
        maxlength: [100, 'Patient name cannot exceed 100 characters']
    },
    appointmentDate: {
        type: Date,
        required: [true, 'Appointment date is required'],
        // You might want to add custom validation here to ensure the date is in the future
    },
    appointmentTime: {
        type: String,
        required: [true, 'Appointment time is required'],
        match: [/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'], // Basic format validation
        trim: true
    },
    reason: {
        type: String,
        trim: true,
        maxlength: [500, 'Reason for appointment cannot exceed 500 characters']
    },
    durationMinutes: {
        type: Number,
        required: [true, 'Appointment duration is required'],
        min: [1, 'Duration must be at least 1 minute'],
        // You might want to add a default value if appropriate, e.g., default: 30
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'confirmed', 'completed', 'cancelled'],
            message: '{VALUE} is not a valid status'
        },
        default: 'pending',
        required: [true, 'Appointment status is required']
    },
    // Mongoose's default behavior for createdAt and updatedAt is handled by timestamps: true
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Export the model
export default mongoose.models.Appointment
    ? mongoose.model<IAppointment>('Appointment')
    : mongoose.model<IAppointment>('Appointment', AppointmentSchema);