import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import { ObjectId } from 'mongodb';

export async function DELETE(req, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { id } = await params;

    const result = await db.collection('tasks').deleteOne({ _id: new ObjectId(id) });

    if (!result.deletedCount) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting task' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { db } = await connectToDatabase();
    const { id } = await params;
    const updatedData = await req.json();

    const { _id, ...filteredUpdates } = updatedData;

    // Validate the MongoDB ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid task ID' }, { status: 400 });
    }

    const result = await db.collection('tasks').updateOne(
      { _id: new ObjectId(id) },
      { $set: filteredUpdates }
    );

    if (!result.modifiedCount) {
      return NextResponse.json({ message: 'Task not found or no changes made' }, { status: 404 });
    }
     // Fetch the updated task to return it to the client
     const updatedTask = await db.collection('tasks').findOne({ _id: new ObjectId(id) });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error updating task'}, { status: 500 });
  }
}
