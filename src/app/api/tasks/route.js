import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const tasks = await db.collection('tasks').find({}).toArray();

    return NextResponse.json(tasks);  // Return all tasks
  } catch (error) {
    console.error('Error fetching tasks:', error);  // Log the error for debugging
    return NextResponse.json({ message: 'Error fetching tasks' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { db } = await connectToDatabase();
    const taskData = await req.json();  // Parse the incoming request body

    // Ensure 'reminder' field is included (default to false if not provided)
    const taskWithReminder = {
      ...taskData,
      reminder: taskData.reminder ?? false,  // Set default value for reminder
      completed: taskData.completed ?? false,  // Set default value for completed status
      createdAt: new Date(),  // Add a timestamp for task creation
    };

    const result = await db.collection('tasks').insertOne(taskWithReminder);

    // Return the newly created task or at least the inserted ID
    return NextResponse.json({
      message: 'Task created successfully',
      taskId: result.insertedId,
    });
  } catch (error) {
    console.error('Error creating task:', error);  // Log the error for debugging
    return NextResponse.json({ message: 'Error creating task' }, { status: 500 });
  }
}
