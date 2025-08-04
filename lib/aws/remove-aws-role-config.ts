import { prisma } from "../prisma";

export async function removeAwsRoleConfig(userId: string, roleArn: string) {
  await prisma.userRoleAWS.deleteMany({
    where: {
      userId,
      awsRoleARN: roleArn,
    },
  });
}
