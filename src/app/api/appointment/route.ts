import { NextRequest, NextResponse } from 'next/server';
import Appointment from '@/app/models/appointment-model'; // Mongoose model
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'your-mongodb-connection-string';

async function connectToDB() {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(MONGODB_URI);
    }
}

// POST: Create a new appointment
export async function POST(request: Request) {
    try {
        await connectToDB();

        const body = await request.json();
        const appointment = new Appointment(body);
        const savedAppointment = await appointment.save();

        return NextResponse.json({ success: true, id: savedAppointment._id });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

// GET: Get all appointments
export async function GET() {
    try {
        await connectToDB();

        const appointments = await Appointment.find();
        return NextResponse.json({ success: true, appointments });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

// PATCH: Update an appointment by ID
export async function PATCH(request: Request) {
    try {
        await connectToDB();

        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ success: false, error: 'Appointment ID is required' }, { status: 400 });
        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedAppointment) {
            return NextResponse.json({ success: false, error: 'Appointment not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, updatedAppointment });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

// Correctly typed DELETE method for dynamic route [id]
export async function DELETE(
    request: NextRequest,
    context: { params: { id: string } }  // ✅ CORRECT TYPE
) {
    try {
        await connectToDB();

        const { id } = context.params;

        if (!id) {
            return NextResponse.json({ success: false, error: 'Appointment ID is required' }, { status: 400 });
        }

        const deletedAppointment = await Appointment.findByIdAndDelete(id);

        if (!deletedAppointment) {
            return NextResponse.json({ success: false, error: 'Appointment not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, deletedAppointment });
    } catch (error) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
