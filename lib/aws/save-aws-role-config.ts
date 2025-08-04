import { IAM } from "aws-sdk";
import { prisma } from "../prisma";

const iam = new IAM();
const POLICY_NAME = "AllowAssumeRoleWithExternalId";
const POLICY_USER = "s3-bucket-reader";

export async function saveAwsRoleConfig(
  userId: string,
  userRoleARN: string,
  region: string = "us-east-1"
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  await prisma.userRoleAWS.create({
    data: {
      userId,
      awsRoleARN: userRoleARN,
      region,
    },
  });

  await addAssumeRoleToPolicy(userRoleARN);
}

async function addAssumeRoleToPolicy(newArn: string) {
  try {
    const response = await iam
      .getUserPolicy({
        UserName: POLICY_USER,
        PolicyName: POLICY_NAME,
      })
      .promise();

    const decodedDocument = decodeURIComponent(response.PolicyDocument!);
    const policyDoc = JSON.parse(decodedDocument);
    const assumeRoleStatement = policyDoc.Statement.find(
      (stmt: { Effect: string; Action: string | string[] }) => {
        return (
          stmt.Effect === "Allow" &&
          (Array.isArray(stmt.Action)
            ? stmt.Action.includes("sts:AssumeRole")
            : stmt.Action === "sts:AssumeRole")
        );
      }
    );

    if (!assumeRoleStatement) {
      throw new Error("AssumeRole statement not found in policy");
    }

    const currentResources: string[] = Array.isArray(
      assumeRoleStatement.Resource
    )
      ? [...assumeRoleStatement.Resource]
      : [assumeRoleStatement.Resource];

    if (!currentResources.includes(newArn)) {
      currentResources.push(newArn);
      assumeRoleStatement.Resource = currentResources;

      await iam
        .putUserPolicy({
          UserName: POLICY_USER,
          PolicyName: POLICY_NAME,
          PolicyDocument: JSON.stringify(policyDoc),
        })
        .promise();

      console.log(`Added new ARN to policy: ${newArn}`);
    } else {
      console.log(`ARN already exists in policy: ${newArn}`);
    }
  } catch (error) {
    if (error) {
      console.log(`Policy ${POLICY_NAME} doesn't exist, creating it...`);
      await createBasePolicy(newArn);
    } else {
      console.error("Error updating policy:", error);
      throw error;
    }
  }
}

async function createBasePolicy(initialArn: string) {
  const basePolicyDocument = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: "sts:AssumeRole",
        Resource: [initialArn],
      },
    ],
  };

  await iam
    .putUserPolicy({
      UserName: POLICY_USER,
      PolicyName: POLICY_NAME,
      PolicyDocument: JSON.stringify(basePolicyDocument),
    })
    .promise();

  console.log(`Created base policy with ARN: ${initialArn}`);
}

export async function removeAwsRoleFromPolicy(userId: string, roleArn: string) {
  try {
    await prisma.userRoleAWS.deleteMany({
      where: {
        userId,
        awsRoleARN: roleArn,
      },
    });

    const response = await iam
      .getUserPolicy({
        UserName: POLICY_USER,
        PolicyName: POLICY_NAME,
      })
      .promise();

    const decodedDocument = decodeURIComponent(response.PolicyDocument!);
    const policyDoc = JSON.parse(decodedDocument);

    const assumeRoleStatement = policyDoc.Statement.find(
      (stmt: {
        Effect: string;
        Action: string | string[];
        Resource: string | string[];
      }) =>
        stmt.Effect === "Allow" &&
        (Array.isArray(stmt.Action)
          ? stmt.Action.includes("sts:AssumeRole")
          : stmt.Action === "sts:AssumeRole")
    );

    if (assumeRoleStatement) {
      const updatedResources = Array.isArray(assumeRoleStatement.Resource)
        ? assumeRoleStatement.Resource.filter((arn: string) => arn !== roleArn)
        : assumeRoleStatement.Resource === roleArn
        ? []
        : [assumeRoleStatement.Resource];

      assumeRoleStatement.Resource = updatedResources;

      await iam
        .putUserPolicy({
          UserName: POLICY_USER,
          PolicyName: POLICY_NAME,
          PolicyDocument: JSON.stringify(policyDoc),
        })
        .promise();

      console.log(`Removed ARN ${roleArn} from policy`);
    } else {
      console.warn("No AssumeRole statement found to update");
    }
  } catch (error) {
    console.error("Error removing role from policy:", error);
    throw error;
  }
}