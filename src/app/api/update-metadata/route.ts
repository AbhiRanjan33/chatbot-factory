import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, renderPassword }: { userId: string; renderPassword: string } = await request.json();
    if (!userId || !renderPassword) {
      return NextResponse.json({ error: 'userId and renderPassword are required' }, { status: 400 });
    }

    // Type assertion to bypass auth() type error
    const { userId: authUserId } = auth() as unknown as { userId: string | null };
    if (!authUserId || authUserId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Type assertion to bypass clerkClient.users type error
    await (clerkClient as any).users.updateUser(userId, {
      privateMetadata: { renderPassword },
    });
    console.log(`Updated renderPassword for user ${userId}`);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error updating metadata:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}