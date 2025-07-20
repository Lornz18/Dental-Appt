// app/api/services/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Service from '@/app/models/services-model'; // Adjust the import path
import {connectToDB} from '@/app/utils/mongodb'; // Assuming you have a db connection utility

interface Context {
  params: {
    id: string;
  };
}

/**
 * @method GET (Optional, for getting a single service if needed)
 * @description Get a single service by ID
 * @access Public (or protected)
 */
export async function GET(req: NextRequest, context: Context) {
  const { id } = context.params;

  try {
    await connectToDB();

    const service = await Service.findById(id);

    if (!service) {
      return NextResponse.json({
        success: false,
        message: `Service not found with ID: ${id}`,
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: service,
    }, { status: 200 });

  } catch (error) {
    console.error(`Error fetching service ${id}:`, error);
    // Handle Mongoose CastError for invalid IDs
    return NextResponse.json({
      success: false,
      message: `Server error fetching service ${id}`,
      error: (error as Error).message || 'An unknown error occurred',
    }, { status: 500 });
  }
}


/**
 * @method PUT
 * @description Update a service by ID
 * @access Private (Admin only, needs authentication)
 */
export async function PUT(req: NextRequest, context: Context) {
  const { id } = context.params;

  try {
    await connectToDB();

    const body = await req.json();

    // Find the service by ID and update it
    // new: true returns the updated document
    // runValidators: true ensures that the update operation respects the schema validators
    const service = await Service.findByIdAndUpdate(
      id,
      {
        name: body.name,
        description: body.description,
        durationMinutes: Number(body.durationMinutes),
        price: Number(body.price),
        // updatedAt will be handled by { timestamps: true } if the model is configured correctly
      },
      {
        new: true,
        runValidators: true,
        context: 'query', // Important for triggering some validators
      }
    );

    if (!service) {
      return NextResponse.json({
        success: false,
        message: `Service not found with ID: ${id}`,
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Service updated successfully',
      data: service,
    }, { status: 200 });

  } catch (error) {
    console.error(`Error updating service ${id}:`, error);

    return NextResponse.json({
      success: false,
      message: `Server error updating service ${id}`,
      error: (error as Error).message || 'An unknown error occurred',
    }, { status: 500 });
  }
}

/**
 * @method DELETE
 * @description Delete a service by ID
 * @access Private (Admin only, needs authentication)
 */
export async function DELETE(req: NextRequest, context: Context) {
  const { id } = context.params;

  try {
    await connectToDB();

    const service = await Service.findByIdAndDelete(id);

    if (!service) {
      return NextResponse.json({
        success: false,
        message: `Service not found with ID: ${id}`,
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully',
      data: {}, // Often return empty data on successful delete
    }, { status: 200 });

  } catch (error) {
    console.error(`Error deleting service ${id}:`, error);

    return NextResponse.json({
      success: false,
      message: `Server error deleting service ${id}`,
      error: (error as Error).message || 'An unknown error occurred',
    }, { status: 500 });
  }
}