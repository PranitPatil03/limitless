import { getUserAwsRoles } from '@/lib/aws/get-user-aws-roles';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const roles = await getUserAwsRoles(userId);
    return NextResponse.json({ roles }, { status: 200 });
  } catch (err) {
    console.error('[GET_USER_ROLES_ERROR]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
