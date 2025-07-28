import { NextResponse } from 'next/server';
import Alert from '@/app/models/alert-model'; // Your Mongoose model
import mongoose from 'mongoose';

// Assume connectToDB is defined in a helper file or locally
async function connectToDB() {
    if (mongoose.connection.readyState === 0) {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        await mongoose.connect(MONGODB_URI);
    }
}

/**
 * POST: Marks a batch of alerts as read.
 * 
 * Expects a request body of the shape:
 * {
 *   "ids": ["id1", "id2", "id3"]
 * }
 * 
 * @param {Request} request The incoming request object.
 * @returns {NextResponse} A JSON response indicating the result of the operation.
 */
export async function POST(request: Request) {
    try {
        await connectToDB();

        const body = await request.json();
        const { ids } = body;

        // 1. Validate the incoming data
        if (!ids || !Array.isArray(ids)) {
            return NextResponse.json(
                { success: false, error: 'An array of alert IDs is required.' },
                { status: 400 } // Bad Request
            );
        }

        if (ids.length === 0) {
            // Nothing to do, but not an error. Return a successful response.
            return NextResponse.json({
                success: true,
                message: 'No alerts to update.',
                result: { matchedCount: 0, modifiedCount: 0 }
            });
        }
        
        // Ensure all IDs are valid MongoDB ObjectIDs before querying
        const areIdsValid = ids.every(id => mongoose.Types.ObjectId.isValid(id));
        if (!areIdsValid) {
            return NextResponse.json(
                { success: false, error: 'One or more provided IDs are invalid.' },
                { status: 400 }
            );
        }

        // 2. Perform the bulk update operation in the database
        const result = await Alert.updateMany(
            { _id: { $in: ids } },      // Filter: Find all alerts where the _id is in the provided array
            { $set: { read: true } }    // Update: Set the 'read' field to true
        );

        // 3. Return a successful response with details of the operation
        return NextResponse.json({
            success: true,
            message: 'Alerts marked as read successfully.',
            result: {
                matchedCount: result.matchedCount,
                modifiedCount: result.modifiedCount,
            }
        });

    } catch (error) {
        console.error("Error marking alerts as read:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}