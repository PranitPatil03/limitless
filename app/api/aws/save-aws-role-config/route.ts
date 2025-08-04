import { saveAwsRoleConfig } from "@/lib/aws/save-aws-role-config";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, userRoleARN } = body;

    if (!userId || !userRoleARN) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    await saveAwsRoleConfig(userId, userRoleARN);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[SAVE_AWS_CONFIG_ERROR]", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
