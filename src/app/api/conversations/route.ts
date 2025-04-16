import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { connectToDatabase } from '../../lib/mongodb';

export async function POST(request) {
  try {
    const authData = auth();
    console.log('Auth Data:', authData);
    const user = await currentUser();
    console.log('Current User:', user);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, prompt, apiLink, files, response } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const conversation = {
      userId: user.id,
      sessionId,
      prompt,
      apiLink,
      files: files || [],
      response,
      createdAt: new Date(),
    };

    await db.collection('conversations').insertOne(conversation);
    return NextResponse.json({ message: 'Conversation saved', conversation });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const authData = auth();
    console.log('Auth Data (GET):', authData);
    const user = await currentUser();
    console.log('Current User (GET):', user);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    const { db } = await connectToDatabase();
    const query = { userId: user.id };
    if (sessionId) {
      query.sessionId = sessionId;
    }

    const conversations = await db
      .collection('conversations')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}