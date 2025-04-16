import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Verify the request using Clerk's auth middleware
    const { userId: authUserId } = auth();
    if (!authUserId || authUserId !== userId) {
      console.error('Unauthorized access attempt - authUserId:', authUserId, 'requested userId:', userId);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await clerkClient.users.getUser(userId);
    const existingPassword = user.privateMetadata?.renderPassword as string | undefined;

    if (!existingPassword) {
      const defaultPassword = `render-user-${Math.random().toString(36).slice(2, 10)}`;
      await clerkClient.users.updateUser(userId, {
        privateMetadata: { renderPassword: defaultPassword },
      });
      console.log(`Set new renderPassword for user ${userId}: ${defaultPassword}`);
      return NextResponse.json({ renderPassword: defaultPassword });
    }

    console.log(`Existing renderPassword for user ${userId}: ${existingPassword}`);
    return NextResponse.json({ renderPassword: existingPassword });
  } catch (error) {
    console.error('Error refreshing metadata:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}