import { prisma } from "../prisma";

export async function getUserAwsRoles(userId: string) {
  const roles = await prisma.userRoleAWS.findMany({
    where: { userId },
    select: { awsRoleARN: true },
  });

  return roles.map((r) => r.awsRoleARN);
}
