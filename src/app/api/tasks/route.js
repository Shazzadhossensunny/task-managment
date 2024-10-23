import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const tasks = await db.collection('tasks').find({}).toArray();

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ message: 'Error fetching tasks' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { db } = await connectToDatabase();
    const taskData = await req.json();

    // Ensure 'reminder' field is included (default to false if not provided)
    const taskWithReminder = {
      ...taskData,
      reminder: taskData.reminder ?? false,
      completed: taskData.completed ?? false,
      createdAt: new Date(),
    };

    const result = await db.collection('tasks').insertOne(taskWithReminder);

    // Return the newly created task or at least the inserted ID
    return NextResponse.json({
      message: 'Task created successfully',
      taskId: result.insertedId,
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ message: 'Error creating task' }, { status: 500 });
  }
}
