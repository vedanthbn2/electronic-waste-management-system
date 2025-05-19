import { NextResponse } from 'next/server';
import dbConnect from '../mongodb';
import RecyclingRequest from '../../models/RecyclingRequest';

await dbConnect();

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId || !userRole) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields except userId and assignedReceiver which will be set from headers
    const requiredFields = [
      'userEmail',
      'recycleItem',
      'pickupDate',
      'pickupTime',
      'deviceCondition',
      'status',
      'receiverEmail',
      'receiverPhone',
      'receiverName',
    ];
    for (const field of requiredFields) {
      if (!data[field] || typeof data[field] !== 'string' || data[field].trim() === '') {
        return NextResponse.json(
          {
            success: false,
            error: `Missing or invalid field: ${field}`,
          },
          { status: 400 }
        );
      }
    }

    // Set userId and assignedReceiver based on role
    let assignedReceiver = '';
    if (userRole === 'user') {
      assignedReceiver = data.assignedReceiver || '';
    } else if (userRole === 'receiver') {
      assignedReceiver = userId;
    } else {
      return NextResponse.json({ success: false, error: 'Invalid user role' }, { status: 403 });
    }

    const newRequest = new RecyclingRequest({
      userId: userRole === 'user' ? userId : data.userId,
      userEmail: data.userEmail.toLowerCase(),
      recycleItem: data.recycleItem,
      pickupDate: data.pickupDate,
      pickupTime: data.pickupTime,
      deviceCondition: data.deviceCondition,
      status: data.status,
      assignedReceiver: assignedReceiver,
      receiverEmail: data.receiverEmail.toLowerCase(),
      receiverPhone: data.receiverPhone,
      receiverName: data.receiverName,
    });

    await newRequest.save();

    return NextResponse.json({
      success: true,
      data: newRequest,
    });
  } catch (error: unknown) {
    console.error('Error saving recycling request:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId || !userRole) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let filter = {};
    if (userRole === 'user') {
      filter = { userId: userId };
    } else if (userRole === 'receiver') {
      filter = { assignedReceiver: userId };
    } else {
      return NextResponse.json({ success: false, error: 'Invalid user role' }, { status: 403 });
    }

    const requests = await RecyclingRequest.find(filter).sort({ createdAt: -1 });
    if (requests.length === 0) {
      return NextResponse.json({ success: true, data: [], message: 'No recycling requests found' });
    }
    return NextResponse.json({ success: true, data: requests });
  } catch (error: unknown) {
    console.error('Error fetching recycling requests:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId || !userRole) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id, updates } = await request.json();

    if (!id || !updates) {
      return NextResponse.json({ success: false, error: 'Missing id or updates' }, { status: 400 });
    }

    // Find the request to update
    const existingRequest = await RecyclingRequest.findById(id);
    if (!existingRequest) {
      return NextResponse.json({ success: false, error: 'Recycling request not found' }, { status: 404 });
    }

    // Check if the user is authorized to update this request
    if (
      (userRole === 'user' && existingRequest.userId !== userId) ||
      (userRole === 'receiver' && existingRequest.assignedReceiver !== userId)
    ) {
      return NextResponse.json({ success: false, error: 'Unauthorized to update this request' }, { status: 403 });
    }

    const updatedRequest = await RecyclingRequest.findByIdAndUpdate(id, updates, { new: true });

    return NextResponse.json({ success: true, data: updatedRequest });
  } catch (error: unknown) {
    console.error('Error updating recycling request:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId || !userRole) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow deleting requests owned by the user or assigned to the receiver
    let filter = {};
    if (userRole === 'user') {
      filter = { userId: userId };
    } else if (userRole === 'receiver') {
      filter = { assignedReceiver: userId };
    } else {
      return NextResponse.json({ success: false, error: 'Invalid user role' }, { status: 403 });
    }

    await RecyclingRequest.deleteMany(filter);
    return NextResponse.json({ success: true, message: 'Recycling requests removed' });
  } catch (error: unknown) {
    console.error('Error deleting recycling requests:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
