import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
    patientName: string;
    appointmentDate: Date;
    appointmentTime: string;
    reason: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    createdAt: Date;
    updatedAt?: Date;
}

const AppointmentSchema: Schema = new Schema({
    patientName: { type: String, required: true },
    appointmentDate: { type: Date, required: true },
    appointmentTime: { type: String, required: true },
    reason: { type: String},
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'completed', 'cancelled'], 
        default: 'pending',
        required: true 
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date }
});

export default mongoose.models.Appointment
    ? mongoose.model<IAppointment>('Appointment')
    : mongoose.model<IAppointment>('Appointment', AppointmentSchema);