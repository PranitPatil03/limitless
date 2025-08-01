"use client";

import Image from "next/image";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { OctagonAlertIcon } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { signUpSchema, type SignUpFormData } from "@/lib/validations/auth";
import { toast } from "sonner";

export const SignUpView = () => {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      agreeToTerms: false,
    },
  });

  const onSocial = async (provider: "github" | "google") => {
    setError(null);
    setPending(true);
    authClient.signIn.social(
      {
        provider: provider,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          setPending(false);
          toast.success("Successfully signed in with " + provider);
        },
        onError: ({ error }) => {
          setError(error.message);
          setPending(false);
          toast.error("Failed to sign in with " + provider);
        },
      }
    );
  };

  const onSubmit = async (data: SignUpFormData) => {
    setError(null);
    setPending(true);

    try {
      await authClient.signUp.email({
        name: data.email.split("@")[0],
        email: data.email,
        password: data.password,
        callbackURL: "/",
      });
      toast.success("Account created successfully!");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create account";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white">
      <div className="w-full max-w-lg mx-auto p-6">
        <div className="rounded-xl p-8 shadow-sm border">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/logo.svg" alt="Logo" width={150} height={40} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Create your account
            </h2>
            <p className="text-gray-600 text-sm">
              Welcome! Please sign up to continue
            </p>
          </div>

          {!!error && (
            <Alert className="bg-red-50 border-red-200 mb-6">
              <OctagonAlertIcon className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">{error}</AlertTitle>
            </Alert>
          )}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 mb-6"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold text-gray-900">
                      Email address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-transparent"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold text-gray-900">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-transparent"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agreeToTerms"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center space-x-1 text-xs">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-gray-400"
                        />
                      </FormControl>
                      <FormLabel className="text-xs text-gray-700 cursor-pointer whitespace-nowrap">
                        I agree to the{" "}
                        <Link
                          href="/terms"
                          className="text-xs underline text-gray-900 hover:text-gray-700 underline-offset-4"
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy"
                          className="text-xs underline text-gray-900 hover:text-gray-700 underline-offset-4"
                        >
                          Privacy Policy
                        </Link>
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="cursor-pointer w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-all duration-300 relative overflow-hidden group font-medium"
                disabled={pending}
              >
                <span className="relative z-10">
                  {pending ? "Creating account..." : "Continue"}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              type="button"
              className="cursor-pointer w-full flex items-center justify-center gap-3 py-2 px-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-all duration-300 relative overflow-hidden group"
              disabled={pending}
              onClick={() => onSocial("google")}
            >
              <span className="relative z-10 flex items-center gap-3">
                <Image
                  src="/google.svg"
                  alt="Google"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                <span className="text-gray-700">Google</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
            </Button>
            <Button
              variant="outline"
              type="button"
              className="cursor-pointer w-full flex items-center justify-center gap-3 py-2 px-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-all duration-300 relative overflow-hidden group"
              disabled={pending}
              onClick={() => onSocial("github")}
            >
              <span className="relative z-10 flex items-center gap-3">
                <Image
                  src="/github.svg"
                  alt="GitHub"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                <span className="text-gray-700">GitHub</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
            </Button>
          </div>

          <div className="text-center mt-6 text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-gray-900 underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
