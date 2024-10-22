import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const tasks = await db.collection('tasks').find({}).toArray();
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching tasks' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { db } = await connectToDatabase();
    const taskData = await req.json();
      // Ensure reminder field is included (default to false if not provided)
      const taskWithReminder = {
        ...taskData,
        reminder: taskData.reminder ?? false,  // Set default to false if not provided
      };
    const newTask = await db.collection('tasks').insertOne(taskWithReminder);
    return NextResponse.json(newTask);
  } catch (error) {
    return NextResponse.json({ message: 'Error creating task' }, { status: 500 });
  }
}
