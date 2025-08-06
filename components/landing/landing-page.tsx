"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Cloud,
  Shield,
  BarChart3,
  Upload,
  Download,
  Folder,
  Search,
  Users,
  Lock,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-mono">
      {/* Navbar */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Image
                src="/logo.svg"
                alt="Limitless"
                width={120}
                height={40}
                className="dark:hidden"
              />
              <Image
                src="/logo-light.svg"
                alt="Limitless"
                width={120}
                height={40}
                className="hidden dark:block"
              />
            </div>

            {/* Auth Button */}
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button
                  variant="outline"
                  className="text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="bg-black text-white hover:bg-gray-800 cursor-pointer">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Limitless AWS S3
            <br />
            <span className="text-blue-600">Management Platform</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mt-2">
            Take complete control of your AWS S3 storage with our platform.
          </p>
          <span className="text-base text-gray-00 max-w-3xl mx-auto leading-relaxed">
            Manage buckets, organize files, track storage analytics, and
            streamline your cloud storage workflow with enterprise-grade
            security and seamless AWS integration.
          </span>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Storage Management
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to efficiently manage your AWS S3 buckets and
              files in one powerful platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: Bucket Management */}
            <Card className="bg-white border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Cloud className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Smart Bucket Management
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Create, configure, and manage S3 buckets with advanced
                  settings including encryption, versioning, and regional
                  deployment.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2: File Operations */}
            <Card className="bg-white border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Seamless File Operations
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Upload, download, preview, and organize files with
                  drag-and-drop functionality, batch operations, and folder
                  management.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3: Storage Analytics */}
            <Card className="bg-white border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Storage Analytics & Insights
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Track storage usage by file type, monitor costs, and get
                  detailed analytics on your S3 storage patterns and activity.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4: Security */}
            <Card className="bg-white border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Enterprise Security
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Secure AWS role-based authentication, encrypted storage, and
                  granular access controls to keep your data protected.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 5: Search & Organization */}
            <Card className="bg-white border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Advanced Search & Filter
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Find files quickly with powerful search, filter by file type,
                  size, and date, and organize content with custom folder
                  structures.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 6: Multi-User Support */}
            <Card className="bg-white border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Multi-User Collaboration
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Share access, manage permissions, and collaborate on storage
                  projects with team members across different AWS accounts.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 mt-4">
            © 2025 Limitless. Streamline your AWS S3 storage management.
          </p>
        </div>
      </footer>
    </div>
  );
}
