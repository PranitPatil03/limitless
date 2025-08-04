"use client";

import { useState } from "react";
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
import {
  encryptCredentialsClientSide,
  decryptCredentialsClientSide,
  EncryptedCredentials,
} from "@/lib/client-encryption";
import { toast } from "sonner";

interface StoredCredential {
  id: string;
  encryptedAccessKeyId: string;
  encryptedSecretAccessKey: string;
  encryptedSessionToken?: string;
  salt: string;
  iv: string;
  expiration: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface AWSCredentialsFormProps {
  userId: string;
  onSave?: (credentials: EncryptedCredentials) => void;
}

export function AWSCredentialsForm({
  userId,
  onSave,
}: AWSCredentialsFormProps) {
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretAccessKey, setSecretAccessKey] = useState("");
  const [sessionToken, setSessionToken] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [expiration, setExpiration] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const encryptedCredentials = await encryptCredentialsClientSide(
        accessKeyId,
        secretAccessKey,
        sessionToken || undefined,
        userPassword
      );

      const response = await fetch("/api/aws-credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          encryptedCredentials,
          expiration: new Date(expiration).toISOString(),
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save credentials");
      }

      setMessage("Credentials saved securely!");
      setAccessKeyId("");
      setSecretAccessKey("");
      setSessionToken("");
      setUserPassword("");
      setExpiration("");

      toast.success("AWS credentials saved securely!");
      if (onSave) {
        onSave(encryptedCredentials);
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      setMessage("Error saving credentials: " + errorMessage);
      toast.error("Failed to save credentials: " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Add AWS Credentials</CardTitle>
        <CardDescription>
          Your credentials are encrypted on your device before being sent to our
          servers. We cannot decrypt them - only you can with your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accessKeyId">AWS Access Key ID</Label>
            <Input
              id="accessKeyId"
              type="text"
              value={accessKeyId}
              onChange={(e) => setAccessKeyId(e.target.value)}
              required
              placeholder="AKIA..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secretAccessKey">AWS Secret Access Key</Label>
            <Input
              id="secretAccessKey"
              type="password"
              value={secretAccessKey}
              onChange={(e) => setSecretAccessKey(e.target.value)}
              required
              placeholder="Your secret key"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionToken">Session Token (Optional)</Label>
            <Input
              id="sessionToken"
              type="text"
              value={sessionToken}
              onChange={(e) => setSessionToken(e.target.value)}
              placeholder="For temporary credentials"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userPassword">Encryption Password</Label>
            <Input
              id="userPassword"
              type="password"
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)}
              required
              placeholder="Password to encrypt your credentials"
            />
            <p className="text-sm text-muted-foreground">
              This password is used to encrypt your credentials. You&apos;ll
              need it to decrypt them later.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiration">Expiration Date</Label>
            <Input
              id="expiration"
              type="datetime-local"
              value={expiration}
              onChange={(e) => setExpiration(e.target.value)}
              required
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded ${
                message.includes("Error")
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {message}
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading
              ? "Encrypting and Saving..."
              : "Save Credentials Securely"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Component to display and decrypt stored credentials
export function StoredCredentialsList({ userId }: { userId: string }) {
  const [credentials, setCredentials] = useState<StoredCredential[]>([]);
  const [decryptionPassword, setDecryptionPassword] = useState("");
  const [decryptedCredentials, setDecryptedCredentials] = useState<{
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCredentials = async () => {
    const response = await fetch(`/api/aws-credentials?userId=${userId}`);
    if (response.ok) {
      const data = await response.json();
      setCredentials(data);
    }
  };

  const decryptCredential = async (encryptedCredential: StoredCredential) => {
    if (!decryptionPassword) {
      alert("Please enter your encryption password");
      return;
    }

    setIsLoading(true);
    try {
      const decrypted = await decryptCredentialsClientSide(
        {
          encryptedAccessKeyId: encryptedCredential.encryptedAccessKeyId,
          encryptedSecretAccessKey:
            encryptedCredential.encryptedSecretAccessKey,
          encryptedSessionToken: encryptedCredential.encryptedSessionToken,
          salt: encryptedCredential.salt,
          iv: encryptedCredential.iv,
        },
        decryptionPassword
      );

      setDecryptedCredentials(decrypted);
    } catch (error) {
      console.error("Failed to decrypt credentials:", error);
      toast.error("Failed to decrypt credentials. Please check your password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Your Stored Credentials</CardTitle>
        <CardDescription>
          Click on a credential to decrypt it with your password
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="decryptionPassword">Decryption Password</Label>
          <Input
            id="decryptionPassword"
            type="password"
            value={decryptionPassword}
            onChange={(e) => setDecryptionPassword(e.target.value)}
            placeholder="Enter your encryption password"
          />
        </div>

        <Button onClick={fetchCredentials} className="w-full">
          Load Credentials
        </Button>

        {credentials.map((cred) => (
          <div key={cred.id} className="border p-3 rounded">
            <p className="text-sm text-muted-foreground">
              Expires: {new Date(cred.expiration).toLocaleDateString()}
            </p>
            <Button
              onClick={() => decryptCredential(cred)}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              Decrypt Credentials
            </Button>
          </div>
        ))}

        {decryptedCredentials && (
          <div className="border p-3 rounded bg-green-50">
            <h4 className="font-semibold">Decrypted Credentials:</h4>
            <p className="text-sm">
              Access Key: {decryptedCredentials.accessKeyId}
            </p>
            <p className="text-sm">
              Secret Key:{" "}
              {decryptedCredentials.secretAccessKey.substring(0, 10)}...
            </p>
            {decryptedCredentials.sessionToken && (
              <p className="text-sm">
                Session Token:{" "}
                {decryptedCredentials.sessionToken.substring(0, 10)}...
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}