import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'storage.json');

// Initialize requests from file or empty array
let requests: any[] = [];

async function loadRequests() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    requests = JSON.parse(data);
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      // File doesn't exist yet, initialize with empty array
      await fs.writeFile(DATA_FILE, '[]');
    } else {
      console.error('Error loading requests:', error);
    }
  }
}

async function saveRequests() {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(requests, null, 2));
  } catch (error: unknown) {
    console.error('Error saving requests:', error);
  }
}

// Load existing requests on server start
loadRequests();

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let data: any = {};

    if (contentType.includes('multipart/form-data')) {
      // Parse FormData
      const formData = await request.formData();
      const jsonData = formData.get('data');
      if (typeof jsonData === 'string') {
        data = JSON.parse(jsonData);
      } else {
        return NextResponse.json({ success: false, error: 'Invalid form data' }, { status: 400 });
      }
      // Optionally handle deviceImage file if needed
      // const deviceImage = formData.get('deviceImage');
      // You can save the file or process it here if required
    } else if (contentType.includes('application/json')) {
      data = await request.json();
    } else {
      return NextResponse.json({ success: false, error: 'Unsupported content type' }, { status: 415 });
    }

    const requestData = {
      ...data,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: "pending",
      location: data.location || null
    };

    requests.push(requestData);
    await saveRequests();
    console.log('Request saved to file');

    return NextResponse.json({
      success: true,
      data: requestData
    });

  } catch (error: unknown) {
    console.error('SUBMISSION ERROR:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function GET() {
  console.log('ADMIN FETCHING REQUESTS');
  return NextResponse.json(requests);
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    const { id, updates } = data;

    if (!id || !updates) {
      return NextResponse.json({ success: false, error: "Missing id or updates" }, { status: 400 });
    }

    const index = requests.findIndex((req) => req._id === id || req.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: "Request not found" }, { status: 404 });
    }

    requests[index] = { ...requests[index], ...updates };
    await saveRequests();

    return NextResponse.json({ success: true, data: requests[index] });
  } catch (error: unknown) {
    console.error("UPDATE ERROR:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }, { status: 500 });
  }
}
