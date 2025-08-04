"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectItem, SelectContent } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import {
  AWSCredentialsForm,
  StoredCredentialsList,
} from "@/components/credentials/aws-credentials-form";
import { redirect, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SettingsPage() {
  const { data: session } = authClient.useSession();

  const user = session?.user;

  if (!user) {
    redirect("/");
  }

  const searchParams = useSearchParams();
  const [tab, setTab] = useState("profile");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["profile", "config", "aws"].includes(tabParam)) {
      setTab(tabParam);
    }
  }, [searchParams]);

  return (
    <div className="w-full py-10 font-mono px-6">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold font-mono">Settings</h1>
          <TabsList className="bg-muted rounded-lg p-1 flex gap-2">
            <TabsTrigger
              value="profile"
              className="font-mono px-4 py-2 rounded-md"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="config"
              className="font-mono px-4 py-2 rounded-md"
            >
              Config
            </TabsTrigger>
            <TabsTrigger value="aws" className="font-mono px-4 py-2 rounded-md">
              AWS Credentials
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="profile">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Card className="p-8 flex flex-col items-center gap-6 w-full">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user.image || undefined} alt={user.name} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <div className="text-2xl font-bold font-mono">{user.name}</div>
                <div className="text-muted-foreground font-mono">
                  {user.email}
                </div>
              </div>
              <Button className="font-mono mt-4">Edit Profile</Button>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="config">
          <div className="space-y-8">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <Card className="p-6 space-y-4 flex-1">
                <div className="text-lg font-bold font-mono mb-2">
                  Storage Settings
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono">Object Versioning</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono">Server-Side Encryption</span>
                  <Switch />
                </div>
                <div>
                  <label className="block mb-1 font-mono">
                    Default Upload Region
                  </label>
                  <Select>
                    <SelectContent>
                      <SelectItem value="us-east-1">
                        US East (N. Virginia)
                      </SelectItem>
                      <SelectItem value="us-west-2">
                        US West (Oregon)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full font-mono mt-2">Save Settings</Button>
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="aws">
          <div className="space-y-8">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-1">
                <div className="text-lg font-bold font-mono mb-4">
                  Add New AWS Credentials
                </div>
                <AWSCredentialsForm
                  userId={user.id}
                  onSave={() => {}}
                />
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold font-mono mb-4">
                  Your Stored Credentials
                </div>
                <StoredCredentialsList userId={user.id} />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}