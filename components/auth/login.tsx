"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Alert, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { OctagonAlertIcon } from "lucide-react";

export const SignInView = () => {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSoical = async (provider: "github" | "google") => {
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
        },
        onError: ({ error }) => {
            console.log(error)
          setError(error.message);
        },
      }
    );
  };

  return (
    <div className="h-screen w-full flex items-center justify-center max-w-5xl">
      <div className="flex-1 flex items-center justify-center p-3">
        <div className="w-full max-w-md rounded-2xl">
          <div className="grid p-0">
            <div className="p-6 flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-3">
                  <h1 className="font-mono text-3xl font-light text-neutral-900 dark:text-white">
                    Welcome to Limitless
                  </h1>
                </div>
                <p className="font-mono text-neutral-500 text-balance dark:text-white/35 text-base">
                  Login to your account
                </p>
              </div>
              {!!error && (
                <Alert className="bg-destructive/10 border-none">
                  <OctagonAlertIcon className="h-4 w-4 !text-destructive" />
                  <AlertTitle>{error}</AlertTitle>
                </Alert>
              )}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  type="button"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/80 border border-neutral-200 shadow hover:bg-neutral-100 transition-all duration-200 cursor-pointer"
                  disabled={pending}
                  onClick={() => onSoical("google")}
                >
                  <Image
                    src="/google.svg"
                    alt="Google"
                    width={20}
                    height={20}
                    className="w-5 h-5 font-mono"
                  />
                  <span className="font-mono">Google</span>
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full flex items-center justify-center gap-2 bg-white/80 border border-neutral-200 shadow hover:bg-neutral-100 transition-all duration-200 cursor-pointer rounded-xl"
                  disabled={pending}
                  onClick={() => onSoical("github")}
                >
                  <Image
                    src="/github.svg"
                    alt="GitHub"
                    width={20}
                    height={20}
                    className="w-5 h-5 font-mono"
                  />
                  <span className="font-mono">Github</span>
                </Button>
              </div>
              <div className="font-mono text-center text-sm">
                Don&apos;t have an account{" "}
                <Link
                  href="/sign-up"
                  className="font-mono underline underline-offset-4"
                >
                  Sign-up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
