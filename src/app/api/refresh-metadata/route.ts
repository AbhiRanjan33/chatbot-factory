import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId }: { userId: string } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Type assertion to bypass auth() type error
    const { userId: authUserId } = auth() as unknown as { userId: string | null };
    if (!authUserId || authUserId !== userId) {
      console.error('Unauthorized access attempt - authUserId:', authUserId, 'requested userId:', userId);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Type assertion to bypass clerkClient.users type error
    const user = await (clerkClient as any).users.getUser(userId);
    const existingPassword = user.privateMetadata?.renderPassword as string | undefined;

    if (!existingPassword) {
      const defaultPassword = `render-user-${Math.random().toString(36).slice(2, 10)}`;
      await (clerkClient as any).users.updateUser(userId, {
        privateMetadata: { renderPassword: defaultPassword },
      });
      console.log(`Set new renderPassword for user ${userId}: ${defaultPassword}`);
      return NextResponse.json({ renderPassword: defaultPassword });
    }

    console.log(`Existing renderPassword for user ${userId}: ${existingPassword}`);
    return NextResponse.json({ renderPassword: existingPassword });
  } catch (error: unknown) {
    console.error('Error refreshing metadata:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}