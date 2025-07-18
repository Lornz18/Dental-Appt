import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Appointment from '@/app/models/appointment-model'; // Adjust if your model is in a different location

const MONGODB_URI = process.env.MONGODB_URI || 'your-mongodb-connection-string';

async function connectToDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(MONGODB_URI);
    }
}

// PATCH /api/appointment/:id → update appointment by ID
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        await connectToDB();
        const updates = await request.json();
        const { id } = params;

        const updatedAppointment = await Appointment.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedAppointment) {
            return NextResponse.json({ success: false, error: 'Appointment not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, updatedAppointment });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

// DELETE /api/appointment/:id → delete appointment by ID
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
    try {
        await connectToDB();
        const { id } = params;

        const deletedAppointment = await Appointment.findByIdAndDelete(id);

        if (!deletedAppointment) {
            return NextResponse.json({ success: false, error: 'Appointment not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, deletedAppointment });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
