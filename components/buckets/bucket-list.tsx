"use client";

import { useState } from "react";
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import { decryptCredentialsClientSide } from "@/lib/client-encryption";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { SecureAWSCredentialsService } from "@/lib/secure-aws-credentials";

interface Bucket {
  Name?: string;
  CreationDate?: Date;
}

export default function BucketList() {
  const { data: session } = authClient.useSession();
  console.log("session", session);

  const userId = session?.user?.id;

  const fetchEncryptedCredentials = async () => {
    const encryptedCredentials =
      await SecureAWSCredentialsService.getValidEncryptedCredentials(userId!);
    return encryptedCredentials;
  };

  console.log("fetchEncryptedCredentials", fetchEncryptedCredentials);

  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(false);
  const [encryptionPassword, setEncryptionPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(true);

  const fetchBuckets = async () => {
    if (!encryptionPassword) {
      toast.error("Please enter your encryption password");
      return;
    }

    setLoading(true);
    try {
      // 1. Get encrypted credentials from server
      const response = await fetch("/api/get-users-buckets");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch credentials");
      }

      const data = await response.json();

      if (!data.encryptedCredentials) {
        throw new Error("No encrypted credentials found");
      }

      // 2. Decrypt credentials on client side
      const decryptedCredentials = await decryptCredentialsClientSide(
        data.encryptedCredentials,
        encryptionPassword
      );

      // 3. Create S3 client with decrypted credentials
      console.log("decryptedCredentials", decryptedCredentials);
      console.log(
        "decryptedCredentials.accessKeyId",
        decryptedCredentials.accessKeyId
      );
      console.log(
        "decryptedCredentials.secretAccessKey",
        decryptedCredentials.secretAccessKey
      );
      console.log(
        "decryptedCredentials.sessionToken",
        decryptedCredentials.sessionToken
      );

      const s3Client = new S3Client({
        region: "us-east-1",
        credentials: {
          accessKeyId: decryptedCredentials.accessKeyId,
          secretAccessKey: decryptedCredentials.secretAccessKey,
          sessionToken: decryptedCredentials.sessionToken,
        },
      });

      // 4. List buckets
      const command = new ListBucketsCommand({});
      const s3Response = await s3Client.send(command);

      setBuckets(s3Response.Buckets || []);
      setShowPasswordInput(false);
      toast.success(`Found ${s3Response.Buckets?.length || 0} buckets`);
    } catch (error) {
      console.error("Error fetching buckets:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch buckets"
      );
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = () => {
    setEncryptionPassword("");
    setShowPasswordInput(true);
    setBuckets([]);
  };

  if (showPasswordInput) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Enter Encryption Password</CardTitle>
          <CardDescription>
            Enter the password you used to encrypt your AWS credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Encryption Password</Label>
            <Input
              id="password"
              type="password"
              value={encryptionPassword}
              onChange={(e) => setEncryptionPassword(e.target.value)}
              placeholder="Enter your encryption password"
              onKeyPress={(e) => e.key === "Enter" && fetchBuckets()}
            />
          </div>
          <Button
            onClick={fetchBuckets}
            disabled={loading || !encryptionPassword}
            className="w-full"
          >
            {loading ? "Decrypting and Fetching..." : "Fetch Buckets"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold font-mono">
          Your S3 Buckets ({buckets.length})
        </h2>
        <Button onClick={resetPassword} variant="outline">
          Change Password
        </Button>
      </div>

      {buckets.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No buckets found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buckets.map((bucket) => (
            <Card
              key={bucket.Name}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <CardTitle className="text-lg font-mono">
                  {bucket.Name}
                </CardTitle>
                <CardDescription>
                  Created: {bucket.CreationDate?.toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() =>
                    window.open(
                      `https://s3.console.aws.amazon.com/s3/buckets/${bucket.Name}`,
                      "_blank"
                    )
                  }
                  variant="outline"
                  className="w-full"
                >
                  Open in AWS Console
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
