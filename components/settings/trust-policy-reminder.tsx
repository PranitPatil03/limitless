"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, CheckCircle, Shield, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface TrustPolicyReminderProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFullGuide: () => void;
}

export function TrustPolicyReminder({ isOpen, onClose, onOpenFullGuide }: TrustPolicyReminderProps) {
  const [copiedTrustPolicy, setCopiedTrustPolicy] = useState(false);

  const trustPolicy = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: {
          AWS: "arn:aws:iam::235689194792:user/limitless"
        },
        Action: "sts:AssumeRole"
      }
    ]
  };

  const copyTrustPolicy = () => {
    navigator.clipboard.writeText(JSON.stringify(trustPolicy, null, 2));
    setCopiedTrustPolicy(true);
    toast.success("Trust policy copied to clipboard!");
    setTimeout(() => setCopiedTrustPolicy(false), 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl!">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-mono flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-600" />
            AWS Role ARN Saved Successfully!
          </DialogTitle>
          <DialogDescription className="text-base font-mono">
            Don&apos;t forget to configure the trust policy to allow Limitless access to your role.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200 font-mono">
                  Important Next Step
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 font-mono">
                  You need to add the trust policy below to your IAM role for Limitless to access your S3 buckets.
                </p>
              </div>
            </div>
          </div>

          <Card className="p-4">
            <h4 className="font-medium font-mono mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              Trust Policy JSON
            </h4>
            
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono border">
{JSON.stringify(trustPolicy, null, 2)}
              </pre>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2 font-mono"
                onClick={copyTrustPolicy}
              >
                {copiedTrustPolicy ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </Card>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200 font-mono">
                  How to Add Trust Policy
                </p>
                <ol className="text-sm text-blue-700 dark:text-blue-300 mt-2 font-mono list-decimal list-inside space-y-1">
                  <li>Go to your IAM role in the AWS Console</li>
                  <li>Click on the &quot;Trust relationships&quot; tab</li>
                  <li>Click &quot;Edit trust policy&quot;</li>
                  <li>Replace the JSON with the policy above</li>
                  <li>Click &quot;Update policy&quot;</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="font-mono">
              I&apos;ll do this later
            </Button>
            <Button onClick={onOpenFullGuide} className="font-mono">
              Open Full Setup Guide
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
