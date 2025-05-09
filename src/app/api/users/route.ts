import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'users.json');

let users: any[] = [];

async function loadUsers() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    users = JSON.parse(data);
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      await fs.writeFile(DATA_FILE, '[]');
      users = [];
    } else {
      console.error('Error loading users:', error);
    }
  }
}

async function saveUsers() {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2));
  } catch (error: unknown) {
    console.error('Error saving users:', error);
  }
}

loadUsers();

export async function POST(request: Request) {
  try {
    console.log('Received user registration request');
    const data = await request.json();
    console.log('User registration data:', data);

    // Load users fresh from file
    let users: any[] = [];
    try {
      const fileData = await fs.readFile(DATA_FILE, 'utf-8');
      users = JSON.parse(fileData);
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        await fs.writeFile(DATA_FILE, '[]');
        users = [];
      } else {
        console.error('Error loading users:', error);
      }
    }

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

    // Check if user with same email already exists
    const existingUser = users.find(u => u.email === data.email);
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'User with this email already exists',
      }, { status: 409 });
    }

    const newUser = {
      ...data,
      id: 'user-' + Date.now(),
      createdAt: new Date().toISOString(),
      approved: false,
    };

    users.push(newUser);
    await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2));

    return NextResponse.json({
      success: true,
      data: newUser,
    });
  } catch (error: unknown) {
    console.error('Error saving user:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET() {
  if (users.length === 0) {
    return NextResponse.json({ success: true, data: [], message: 'No users found' });
  }
  return NextResponse.json({ success: true, data: users });
}

export async function PATCH(request: Request) {
  try {
    const { id, updates } = await request.json();

    if (!id || !updates) {
      return NextResponse.json({ success: false, error: 'Missing id or updates' }, { status: 400 });
    }

    const index = users.findIndex((u) => u.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    users[index] = { ...users[index], ...updates };
    await saveUsers();

    return NextResponse.json({ success: true, data: users[index] });
  } catch (error: unknown) {
    console.error('Error updating user:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
