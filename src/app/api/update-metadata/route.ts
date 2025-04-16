import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const { userId, renderPassword } = await request.json();
    if (!userId || !renderPassword) {
      return NextResponse.json({ error: 'userId and renderPassword are required' }, { status: 400 });
    }

    const { userId: authUserId } = auth();
    if (!authUserId || authUserId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await clerkClient.users.updateUser(userId, {
      privateMetadata: { renderPassword },
    });
    console.log(`Updated renderPassword for user ${userId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating metadata:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}