import * as AWS from "aws-sdk";
import { prisma } from "../prisma";

export async function getUserS3Client(
  userId: string,
  region: string = "us-east-1"
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userroleaws: true },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    if (!user.userroleaws || user.userroleaws.length === 0) {
      throw new Error(`User with ID ${userId} has no AWS credentials`);
    }

    const roleArn = user.userroleaws[0].awsRoleARN;

    if (!roleArn) {
      throw new Error(`AWS Role ARN not found for user ${userId}`);
    }

    const sts = new AWS.STS({
      region,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    });

    const assumedRole = await sts
      .assumeRole({
        RoleArn: roleArn,
        RoleSessionName: `User-${userId}-Session`,
      })
      .promise();

    if (!assumedRole.Credentials) {
      throw new Error("Failed to assume AWS role - no credentials returned");
    }

    return new AWS.S3({
      accessKeyId: assumedRole.Credentials.AccessKeyId,
      secretAccessKey: assumedRole.Credentials.SecretAccessKey,
      sessionToken: assumedRole.Credentials.SessionToken,
      region,
    });
  } catch (error) {
    console.error(`Error creating S3 client for user ${userId}:`, error);
    throw error;
  }
}
