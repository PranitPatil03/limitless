"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import { Loader2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";

const awsRegions = [
  { value: "us-east-1", label: "US East (N. Virginia)" },
  { value: "us-east-2", label: "US East (Ohio)" },
  { value: "us-west-1", label: "US West (N. California)" },
  { value: "us-west-2", label: "US West (Oregon)" },
  { value: "eu-west-1", label: "EU (Ireland)" },
  { value: "eu-west-2", label: "EU (London)" },
  { value: "eu-west-3", label: "EU (Paris)" },
  { value: "eu-central-1", label: "EU (Frankfurt)" },
  { value: "ap-south-1", label: "Asia Pacific (Mumbai)" },
  { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" },
  { value: "ap-northeast-2", label: "Asia Pacific (Seoul)" },
  { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
  { value: "ap-southeast-2", label: "Asia Pacific (Sydney)" },
  { value: "sa-east-1", label: "South America (São Paulo)" },
];

export default function SettingsPage() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [tab, setTab] = useState("config");
  const [userRoleARN, setUserRoleARN] = useState("");
  const [defaultRegion, setDefaultRegion] = useState("us-east-1");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingRoles, setFetchingRoles] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);

  const [customRegion, setCustomRegion] = useState("");
  const isOtherRegion = defaultRegion === "other";

  const handleSaveCredentials = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/aws/save-aws-role-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          userRoleARN,
          region: isOtherRegion ? customRegion : defaultRegion,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      setMessage("✅ AWS Role ARN saved successfully.");
      setUserRoleARN("");
      fetchUserRoles();
    } catch (err) {
      setMessage("❌ Error: " + err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRoles = async () => {
    if (!user?.id) return;

    setFetchingRoles(true);
    try {
      const res = await fetch(`/api/aws/user-roles?userId=${user.id}`);
      const data = await res.json();
      setUserRoles(data.roles || []);
    } catch (err) {
      setMessage("❌ Error: " + err);
      setUserRoles([]);
    } finally {
      setFetchingRoles(false);
    }
  };

  const handleDeleteRole = (roleArn: string) => {
    setRoleToDelete(roleArn);
    setShowDeleteModal(true);
  };

  const confirmDeleteRole = async () => {
    if (!roleToDelete) return;
    try {
      const res = await fetch("/api/aws/delete-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, roleArn: roleToDelete }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");

      fetchUserRoles();
      setShowDeleteModal(false);
      setRoleToDelete(null);
    } catch (err) {
      setMessage("❌ Error: " + err);
      alert("Failed to delete role.");
      setShowDeleteModal(false);
      setRoleToDelete(null);
    }
  };

  useEffect(() => {
    fetchUserRoles();
  }, [user?.id]);

  return (
    <div className="w-full py-10 font-mono px-6">
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <div className="text-lg font-bold font-mono text-center">
              Confirm Delete
            </div>
          </DialogHeader>
          <div className="text-center font-mono mb-4">
            Are you sure you want to delete this role?
            <div className="mt-2 text-xs break-all text-muted-foreground">
              {roleToDelete}
            </div>
          </div>
          <DialogFooter className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              className="font-mono"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteRole}
              className="font-mono"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                <AvatarFallback>{user?.name?.[0] || ""}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <div className="text-2xl font-bold font-mono">
                  {user?.name || "Unknown"}
                </div>
                <div className="text-muted-foreground font-mono">
                  {user?.email}
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
                  AWS Credentials
                </div>

                <div>
                  <label className="block mb-1 font-mono">User Role ARN</label>
                  <Input
                    className="font-mono"
                    placeholder="arn:aws:iam::*:role/*"
                    value={userRoleARN}
                    onChange={(e) => setUserRoleARN(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between mt-4">
                  <label className="block font-mono">Default Region</label>
                  <Select
                    value={isOtherRegion ? "other" : defaultRegion}
                    onValueChange={(val) => {
                      setDefaultRegion(val);
                      if (val !== "other") setCustomRegion("");
                    }}
                  >
                    <SelectTrigger className="font-mono">
                      <SelectValue placeholder="Select a region" />
                    </SelectTrigger>
                    <SelectContent>
                      {awsRegions.map((region) => (
                        <SelectItem
                          key={region.value}
                          value={region.value}
                          className="font-mono"
                        >
                          {region.label}
                        </SelectItem>
                      ))}
                      <SelectItem value="other" className="font-mono">
                        Other (Custom)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {isOtherRegion && (
                    <Input
                      className="font-mono mt-2"
                      placeholder="Enter custom region (e.g. af-south-1)"
                      value={customRegion}
                      onChange={(e) => setCustomRegion(e.target.value)}
                    />
                  )}
                </div>

                <Button
                  className="w-full font-mono mt-2"
                  onClick={handleSaveCredentials}
                  disabled={loading || !userRoleARN}
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    "Save Credentials"
                  )}
                </Button>

                {message && (
                  <div className="text-sm mt-2 font-mono text-center">
                    {message}
                  </div>
                )}
              </Card>

              <Card className="p-6 space-y-4 flex-1">
                <div className="text-lg font-bold font-mono mb-2">
                  Saved Roles
                </div>

                {fetchingRoles ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="animate-spin h-4 w-4" />
                    Loading roles...
                  </div>
                ) : userRoles.length === 0 ? (
                  <div className="text-sm text-muted-foreground font-mono">
                    No roles saved.
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {userRoles.map((roleArn) => (
                      <li
                        key={roleArn}
                        className="flex items-center justify-between px-3 py-2 border rounded-md text-sm"
                      >
                        <span className="break-all font-mono">{roleArn}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteRole(roleArn)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}