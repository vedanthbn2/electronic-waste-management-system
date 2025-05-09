
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'receivers.json');

let receivers: any[] = [];

async function loadReceivers() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    receivers = JSON.parse(data);
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      await fs.writeFile(DATA_FILE, '[]');
      receivers = [];
    } else {
      console.error('Error loading receivers:', error);
    }
  }
}

async function saveReceivers() {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(receivers, null, 2));
  } catch (error: unknown) {
    console.error('Error saving receivers:', error);
  }
}

async function cleanSampleReceivers() {
  const originalLength = receivers.length;
  receivers = receivers.filter(r => !(r.name === 'Sample Receiver One' || r.name === 'Sample Receiver Two'));
  if (receivers.length !== originalLength) {
    await saveReceivers();
  }
}

loadReceivers();

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'password'];
    for (const field of requiredFields) {
      if (!data[field] || typeof data[field] !== 'string' || data[field].trim() === '') {
        return NextResponse.json({
          success: false,
          error: `Missing or invalid field: ${field}`,
        }, { status: 400 });
      }
    }

    // Check for duplicate email
    const emailExists = receivers.some(r => r.email.toLowerCase() === data.email.toLowerCase());
    if (emailExists) {
      return NextResponse.json({
        success: false,
        error: 'Email already exists',
      }, { status: 400 });
    }

    const newReceiver = {
      ...data,
      id: 'receiver-' + Date.now(),
      createdAt: new Date().toISOString(),
      approved: false,
    };

    receivers.push(newReceiver);
    await saveReceivers();

    return NextResponse.json({
      success: true,
      data: newReceiver,
    });
  } catch (error: unknown) {
    console.error('Error saving receiver:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    receivers = [];
    await saveReceivers();
    return NextResponse.json({ success: true, message: 'All receivers removed' });
  } catch (error: unknown) {
    console.error('Error deleting receivers:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET() {
  await cleanSampleReceivers();
  if (receivers.length === 0) {
    return NextResponse.json({ success: true, data: [], message: 'No receivers found' });
  }
  return NextResponse.json({ success: true, data: receivers });
}

export async function PATCH(request: Request) {
  try {
    const { id, updates } = await request.json();

    if (!id || !updates) {
      return NextResponse.json({ success: false, error: 'Missing id or updates' }, { status: 400 });
    }

    const index = receivers.findIndex((r) => r.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Receiver not found' }, { status: 404 });
    }

    receivers[index] = { ...receivers[index], ...updates };
    await saveReceivers();

    return NextResponse.json({ success: true, data: receivers[index] });
  } catch (error: unknown) {
    console.error('Error updating receiver:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
