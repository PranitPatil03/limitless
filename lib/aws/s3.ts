import * as AWS from 'aws-sdk';
import { prisma } from '../prisma';

export async function getUserS3Client(userId: string, region: string = 'us-east-1') {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { userroleaws: true }, 
  });

  const roleArn = user?.userroleaws?.[0]?.awsRoleARN;

  if (!user || !roleArn) {
    throw new Error('User or awsRoleArn not found');
  }

  const sts = new AWS.STS({
    region,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  });

  const assumedRole = await sts.assumeRole({
    RoleArn: roleArn,
    RoleSessionName: `User-${userId}-Session`,
  }).promise();

  return new AWS.S3({
    accessKeyId: assumedRole.Credentials?.AccessKeyId,
    secretAccessKey: assumedRole.Credentials?.SecretAccessKey,
    sessionToken: assumedRole.Credentials?.SessionToken,
    region,
  });
}
