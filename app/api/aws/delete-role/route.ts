import { removeAwsRoleConfig } from '@/lib/aws/remove-aws-role-config';
import { NextResponse } from 'next/server';;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, roleArn } = body;

    if (!userId || !roleArn) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    await removeAwsRoleConfig(userId, roleArn);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('[DELETE_ROLE_ERROR]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
