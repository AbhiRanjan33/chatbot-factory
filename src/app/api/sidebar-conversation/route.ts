import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { connectToDatabase } from '../../lib/mongodb';

export async function POST(request) {
  try {
    const authData = auth();
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, response, apiLink, files } = await request.json();
    const { db } = await connectToDatabase();

    const conversation = {
      userId: user.id,
      apiLink,
      prompt,
      response,
      files,
      createdAt: new Date(),
    };

    await db.collection('sidebar_conversations').insertOne(conversation);
    return NextResponse.json({ message: 'Conversation saved', conversation });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const authData = auth();
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const conversations = await db
      .collection('sidebar_conversations')
      .find({ userId: user.id })
      .sort({ createdAt: 1 })
      .toArray();

    // Group by apiLink
    const histories = conversations.reduce((acc, conv) => {
      const existing = acc.find((h) => h.apiLink === conv.apiLink);
      if (existing) {
        existing.conversations.push(conv);
      } else {
        acc.push({ apiLink: conv.apiLink, conversations: [conv] });
      }
      return acc;
    }, [] as { apiLink: string; conversations: any[] }[]);

    return NextResponse.json(histories);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}