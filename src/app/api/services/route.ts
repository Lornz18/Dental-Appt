// app/api/services/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Service, { IService } from '@/app/models/services-model'; // Adjust the import path if your model is elsewhere
import { connectToDB } from '@/app/utils/mongodb'; // Assuming you have a db connection utility

/**
 * @method GET
 * @description Get all services
 * @access Public (or protected if you add auth middleware)
 */
export async function GET() {
  try {
    await connectToDB(); // Ensure database connection

    const services: IService[] = await Service.find({})
      .sort({ createdAt: -1 }); // Sort by creation date, most recent first

    return NextResponse.json({
      success: true,
      count: services.length,
      data: services,
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json({
      success: false,
      message: 'Server error fetching services',
      error: (error as Error).message || 'An unknown error occurred',
    }, { status: 500 });
  }
}

/**
 * @method POST
 * @description Create a new service
 * @access Private (Admin only, needs authentication)
 */
export async function POST(req: NextRequest) {
  try {
    await connectToDB(); // Ensure database connection

    const body = await req.json();

    // Basic validation for required fields from the frontend
    if (!body.name || !body.description || !body.durationMinutes || !body.price) {
      return NextResponse.json({
        success: false,
        message: 'Please provide name, description, durationMinutes, and price',
      }, { status: 400 });
    }

    // Create service using the model
    const service = await Service.create({
      name: body.name,
      description: body.description,
      durationMinutes: Number(body.durationMinutes), // Ensure it's a number
      price: Number(body.price), // Ensure it's a number
    });

    return NextResponse.json({
      success: true,
      message: 'Service created successfully',
      data: service,
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating service:", error);

    return NextResponse.json({
      success: false,
      message: 'Server error creating service',
      error: (error as Error).message || 'An unknown error occurred',
    }, { status: 500 });
  }
}