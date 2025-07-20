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
        console.log('Received appointment data:', body);

        // Explicitly map fields to ensure correct type handling by Mongoose
        const appointmentData = {
            patientName: body.patientName,
            email: body.email, // Assuming email is also sent and needed
            appointmentDate: body.appointmentDate ? new Date(body.appointmentDate) : undefined, // Convert string date to Date object
            appointmentTime: body.appointmentTime,
            reason: body.reason,
            durationMinutes: body.durationMinutes, // This is the field we want to ensure is passed
            status: body.status || 'pending', // Ensure status is handled, default to 'pending'
        };

        console.log('Mapped appointment data:', appointmentData);

        // Check if durationMinutes was actually mapped and is valid
        if (typeof appointmentData.durationMinutes !== 'number' || appointmentData.durationMinutes <= 0) {
            console.error('Error: durationMinutes is missing or invalid after mapping.');
            return NextResponse.json(
                { success: false, error: 'Appointment duration is missing or invalid.' },
                { status: 400 }
            );
        }

        // Now, create the Mongoose document with the explicitly mapped and potentially type-converted data
        const appointment = new Appointment({
            patientName: body.patientName,
            email: body.email, // Assuming email is also sent and needed
            appointmentDate: body.appointmentDate ? new Date(body.appointmentDate) : undefined, // Convert string date to Date object
            appointmentTime: body.appointmentTime,
            reason: body.reason,
            durationMinutes: body.durationMinutes, // This is the field we want to ensure is passed
            status: body.status || 'pending', // Ensure status is handled, default to 'pending'
        });

        console.log('Creating appointment:', appointment); // Check the created instance
        console.log('Appointment instance has durationMinutes:', appointment.durationMinutes); // Explicitly log it again

        const savedAppointment = await appointment.save();
        console.log('Saved Appointment:', savedAppointment);

        return NextResponse.json({ success: true, id: savedAppointment._id });
    } catch (error) {
        console.error("Error creating appointment:", error); // Log the error
        if (error instanceof Error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        } else {
            return NextResponse.json({ success: false, error: 'An unknown error occurred while creating the appointment' }, { status: 500 });
        }
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
