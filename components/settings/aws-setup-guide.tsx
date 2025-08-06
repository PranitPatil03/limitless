"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ChevronRight,
  Copy,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Settings,
  Shield,
  Users,
  FileText,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

interface AWSSetupGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AWSSetupGuide({ isOpen, onClose }: AWSSetupGuideProps) {
  const [currentStep, setCurrentStep] = useState(1);
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

  const steps = [
    {
      id: 1,
      title: "Create IAM Role",
      description: "Set up a new IAM role in your AWS account",
      icon: Users,
    },
    {
      id: 2,
      title: "Configure Trust Policy",
      description: "Add the trust policy to allow Limitless access",
      icon: Shield,
    },
    {
      id: 3,
      title: "Add Role ARN",
      description: "Copy the role ARN and add it to Limitless",
      icon: Settings,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl! max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-mono flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            AWS Role Setup Guide
          </DialogTitle>
          <DialogDescription className="text-base font-mono">
            Follow these steps to securely connect your AWS S3 buckets to Limitless
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  currentStep >= step.id
                    ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <step.icon className="w-5 h-5" />
                <span className="font-mono text-sm">{step.title}</span>
                {currentStep > step.id && (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                )}
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="w-5 h-5 mx-2 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>

        <Tabs value={currentStep.toString()} onValueChange={(value) => setCurrentStep(parseInt(value))}>
          <TabsList className="grid w-full grid-cols-3 font-mono">
            <TabsTrigger value="1">Step 1: Create Role</TabsTrigger>
            <TabsTrigger value="2">Step 2: Trust Policy</TabsTrigger>
            <TabsTrigger value="3">Step 3: Add ARN</TabsTrigger>
          </TabsList>

          {/* Step 1: Create IAM Role */}
          <TabsContent value="1" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold font-mono mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Create a New IAM Role
              </h3>
              
              <div className="space-y-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800 dark:text-yellow-200 font-mono">
                        Important: You need AWS Console access
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 font-mono">
                        Make sure you&apos;re logged into your AWS Management Console with appropriate permissions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    "Navigate to the AWS Management Console",
                    "Search for and open the 'IAM' service",
                    "Click on 'Roles' in the left sidebar",
                    "Click the 'Create role' button",
                    "Select 'AWS service' as the trusted entity type",
                    "Choose 'EC2' as the service (we'll modify this later)",
                    "Click 'Next' to proceed to permissions",
                    "Search for and select 'AmazonS3FullAccess' policy",
                    "Click 'Next' to proceed to naming",
                    "Enter a role name (e.g., 'limitless-s3-access')",
                    "Add a description (optional)",
                    "Click 'Create role' to finish"
                  ].map((step, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <Badge variant="outline" className="font-mono min-w-8 h-6 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <p className="font-mono text-sm">{step}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-mono"
                    onClick={() => window.open('https://console.aws.amazon.com/iam/home#/roles', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open AWS IAM Console
                  </Button>
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep(2)} className="font-mono">
                Next: Configure Trust Policy
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </TabsContent>

          {/* Step 2: Configure Trust Policy */}
          <TabsContent value="2" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold font-mono mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Configure Trust Policy
              </h3>
              
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-200 font-mono">
                        Trust Policy Required
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1 font-mono">
                        This policy allows Limitless to assume your role and access your S3 buckets securely.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    "In your newly created role, click on the 'Trust relationships' tab",
                    "Click the 'Edit trust policy' button",
                    "Replace the existing JSON with the trust policy below",
                    "Click 'Update policy' to save the changes"
                  ].map((step, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <Badge variant="outline" className="font-mono min-w-8 h-6 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <p className="font-mono text-sm">{step}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium font-mono flex items-center gap-2">
                    <FileText className="w-4 h-4" />
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

                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-800 dark:text-green-200 font-mono">
                          Security Note
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1 font-mono">
                          This trust policy only allows the specific Limitless IAM user to assume your role. 
                          No other entities can access your resources through this role.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)} className="font-mono">
                Previous: Create Role
              </Button>
              <Button onClick={() => setCurrentStep(3)} className="font-mono">
                Next: Add Role ARN
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </TabsContent>

          {/* Step 3: Add Role ARN */}
          <TabsContent value="3" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold font-mono mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                Add Role ARN to Limitless
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-medium font-mono">How to find your Role ARN:</h4>
                  {[
                    "In the AWS IAM Console, go to your newly created role",
                    "On the role summary page, locate the 'ARN' field",
                    "Copy the complete ARN (it looks like: arn:aws:iam::123456789012:role/your-role-name)",
                    "Paste it in the 'User Role ARN' field in Limitless settings",
                    "Select your preferred AWS region",
                    "Click 'Save AWS Role ARN' to complete the setup"
                  ].map((step, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <Badge variant="outline" className="font-mono min-w-8 h-6 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <p className="font-mono text-sm">{step}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-200 font-mono">
                        Example ARN Format
                      </p>
                      <code className="text-sm text-blue-700 dark:text-blue-300 mt-1 font-mono block bg-blue-100 dark:bg-blue-800/30 p-2 rounded">
                        arn:aws:iam::123456789012:role/limitless-s3-access
                      </code>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-200 font-mono">
                        Setup Complete!
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1 font-mono">
                        Once you save the Role ARN, Limitless will be able to securely access your S3 buckets 
                        using the permissions you&apos;ve configured.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(2)} className="font-mono">
                Previous: Trust Policy
              </Button>
              <Button onClick={onClose} className="font-mono">
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Setup
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
