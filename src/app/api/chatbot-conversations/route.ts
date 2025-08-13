import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { connectToDatabase } from '../../lib/mongodb';

// Define the Conversation interface to type the MongoDB documents
interface Conversation {
  _id?: string;
  userId: string;
  apiEndpoint: string;
  prompt: string;
  response: string;
  createdAt: Date;
}

export async function POST(request: NextRequest) {
  try {
    const authData = auth();
    console.log('Auth Data:', authData);
    const user = await currentUser();
    console.log('Current User:', user);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, response, apiEndpoint } = await request.json();
    const { db } = await connectToDatabase();

    const conversation: Conversation = {
      userId: user.id,
      apiEndpoint,
      prompt,
      response,
      createdAt: new Date(),
    };

    await db.collection('chatbot_conversations').insertOne(conversation);
    return NextResponse.json({ message: 'Conversation saved', conversation });
  } catch (error: unknown) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authData = auth();
    console.log('Auth Data (GET):', authData);
    const user = await currentUser();
    console.log('Current User (GET):', user);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const apiEndpoint = searchParams.get('apiEndpoint');
    if (!apiEndpoint) {
      return NextResponse.json({ error: 'apiEndpoint required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const conversations: Conversation[] = await db
      .collection('chatbot_conversations')
      .find({ userId: user.id, apiEndpoint })
      .sort({ createdAt: 1 }) // Oldest first for chat order
      .toArray();

    return NextResponse.json(
      conversations
        .map((conv: Conversation) => ({
          role: 'user',
          content: conv.prompt,
          createdAt: conv.createdAt,
        }))
        .concat(
          conversations.map((conv: Conversation) => ({
            role: 'bot',
            content: conv.response,
            createdAt: conv.createdAt,
          }))
        )
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    );
  } catch (error: unknown) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}