"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectItem, SelectContent } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";

export default function SettingsPage() {
  const user = {
    name: "Jane Doe",
    email: "jane@example.com",
    image: "/avatar.png",
  };
  const [tab, setTab] = useState("profile");
  const [defaultRegion, setDefaultRegion] = useState("us-east-1");

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
          </TabsList>
        </div>
        <TabsContent value="profile">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Card className="p-8 flex flex-col items-center gap-6 w-full">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user.image} alt={user.name} />
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
            {/* <Card className="p-6 space-y-4">
              <div className="text-lg font-bold font-mono mb-2">Profile</div>
              <div>
                <label className="block mb-1 font-mono">Name</label>
                <Input className="font-mono" value={user.name} />
              </div>
              <div>
                <label className="block mb-1 font-mono">Email</label>
                <Input className="font-mono" value={user.email} />
              </div>
            </Card> */}

            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <Card className="p-6 space-y-4 flex-1">
                <div className="text-lg font-bold font-mono mb-2">
                  AWS Credentials
                </div>
                <div>
                  <label className="block mb-1 font-mono">Access Key ID</label>
                  <Input className="font-mono" placeholder="AKIA..." />
                </div>
                <div>
                  <label className="block mb-1 font-mono">
                    Secret Access Key
                  </label>
                  <Input
                    className="font-mono"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-mono">Default Region</label>
                  <Select
                    value={defaultRegion}
                    onValueChange={setDefaultRegion}
                  >
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
                <Button className="w-full font-mono mt-2">
                  Save Credentials
                </Button>
              </Card>
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
      </Tabs>
    </div>
  );
}
