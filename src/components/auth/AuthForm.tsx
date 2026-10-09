"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { AuthResult } from "@/lib/auth-actions";

type AuthFormProps = {
  type: "login" | "signup" | "forgot" | "reset";
  action: (prevState: AuthResult | null, formData: FormData) => Promise<AuthResult>;
  /** Post-login redirect (relative path only) */
  nextPath?: string;
};

const titles = {
  login: "Welcome back",
  signup: "Create an account",
  forgot: "Forgot password?",
  reset: "Reset your password",
};

const subtitles = {
  login: "Sign in to your Nanzy Clothes account",
  signup: "Join Nanzy Clothes and start shopping",
  forgot: "Enter your email and we'll send you a reset link",
  reset: "Enter your new password below",
};

export default function AuthForm({ type, action, nextPath }: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">{titles[type]}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {subtitles[type]}
          </p>
        </div>

        <form action={formAction} className="space-y-5 border rounded-xl p-6 md:p-8 bg-white dark:bg-gray-950 dark:border-gray-800 shadow-sm">
          {nextPath && type === "login" && (
            <input type="hidden" name="next" value={nextPath} />
          )}
          {/* Error / Success messages */}
          {state?.error && (
            <div className="rounded-md bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {state.error}
            </div>
          )}
          {state?.success && (
            <div className="rounded-md bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-900 px-4 py-3 text-sm text-green-700 dark:text-green-300">
              {state.success}
            </div>
          )}

          {/* Name (signup only) */}
          {type === "signup" && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Jane Doe"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:border-gray-700 dark:bg-gray-900 dark:focus:ring-white"
              />
            </div>
          )}

          {/* Email (not on reset) */}
          {type !== "reset" && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:border-gray-700 dark:bg-gray-900 dark:focus:ring-white"
              />
            </div>
          )}

          {/* Password (login, signup, reset) */}
          {(type === "login" || type === "signup" || type === "reset") && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium">
                  {type === "reset" ? "New Password" : "Password"}
                </label>
                {type === "login" && (
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-gray-500 hover:text-black dark:hover:text-white"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                placeholder={type === "signup" || type === "reset" ? "At least 8 characters" : "••••••••"}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:border-gray-700 dark:bg-gray-900 dark:focus:ring-white"
              />
            </div>
          )}

          {/* Confirm password (signup + reset) */}
          {(type === "signup" || type === "reset") && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5">
                {type === "reset" ? "Confirm New Password" : "Confirm Password"}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:border-gray-700 dark:bg-gray-900 dark:focus:ring-white"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-black py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
          >
            {isPending
              ? "Please wait..."
              : type === "login"
                ? "Sign In"
                : type === "signup"
                  ? "Create Account"
                  : type === "forgot"
                    ? "Send Reset Link"
                    : "Reset Password"}
          </button>
        </form>

        {/* Footer links */}
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {type === "login" && (
            <>
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="font-medium text-black hover:underline dark:text-white">
                Sign up
              </Link>
            </>
          )}
          {type === "signup" && (
            <>
              Already have an account?{" "}
              <Link href="/auth/login" className="font-medium text-black hover:underline dark:text-white">
                Sign in
              </Link>
            </>
          )}
          {(type === "forgot" || type === "reset") && (
            <Link href="/auth/login" className="font-medium text-black hover:underline dark:text-white">
              Back to Sign in
            </Link>
          )}
        </p>
      </div>
    </div>
  );
}
