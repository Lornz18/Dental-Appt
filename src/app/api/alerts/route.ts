import { NextRequest, NextResponse } from 'next/server';
import Alert from '@/app/models/alert-model'; // Your Mongoose model
import mongoose from 'mongoose';

// Assume connectToDB is defined in a helper file or locally
async function connectToDB() {
    if (mongoose.connection.readyState === 0) {
        // Make sure to replace this with your actual connection string from environment variables
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        await mongoose.connect(MONGODB_URI);
    }
}

/**
 * GET: Fetches alerts with support for filtering, sorting, and pagination.
 * 
 * Query Parameters:
 * - `read` (boolean): Filters alerts by their read status. e.g., `?read=false` to get unread alerts.
 * - `limit` (number): Limits the number of returned alerts. Defaults to 20.
 * 
 * @param {NextRequest} request The incoming Next.js request object.
 * @returns {NextResponse} A JSON response containing the alerts and metadata.
 */

interface IQueryParams {
    read?: boolean; // 'true', 'false', or null
    limit?: string; // e.g., '10'
}
export async function GET(request: NextRequest) {
    try {
        await connectToDB();

        // 1. Get query parameters from the request URL
        const { searchParams } = new URL(request.url);
        const readStatus = searchParams.get('read'); // will be 'true', 'false', or null
        const limitParam = searchParams.get('limit');

        // 2. Build the query object based on parameters
        const query: IQueryParams = {};

        if (readStatus !== null) {
            // Convert the string parameter to a boolean for the database query
            query.read = readStatus === 'true';
        }

        // 3. Set a default limit and parse the parameter
        const limit = limitParam ? parseInt(limitParam, 10) : 20;

        // 4. Fetch the data from the database using the built query
        const alerts = await Alert.find(query)
            .sort({ createdAt: -1 }) // Sort by creation date, newest first
            .limit(limit);           // Apply the limit

        // 5. (Optional but good practice) Get the total count of documents matching the query
        // This is useful for the frontend to know the total number of unread alerts.
        const totalCount = await Alert.countDocuments(query);

        // 6. Return a structured response
        return NextResponse.json({
            success: true,
            count: alerts.length, // The number of documents in this response
            total: totalCount,    // The total matching documents in the database
            alerts: alerts,
        });

    } catch (error) {
        console.error("Error fetching alerts:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}