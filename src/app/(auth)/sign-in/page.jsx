"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);

    const { error } = await signIn.email({
      email: form.get("email"),
      password: form.get("password"),
      rememberMe: form.get("rememberMe") === "on",
    });

    setLoading(false);

    if (error) {
      setError(error.message || "Unable to sign in. Please try again.");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <main className="min-h-[100dvh] bg-[#08090d] flex items-center justify-center px-4 sm:px-6 py-8 sm:py-10 text-white">

      <div className="w-full max-w-[420px]">

        {/* Logo */}

        <Link href="/" className="block text-center mb-7 sm:mb-9">
          <img
            src="/logo.png"
            alt="HireLoop Logo"
            className="mx-auto h-8 sm:h-10 w-auto"
          />
        </Link>

        {/* Glass Card */}

        <div className="rounded-2xl border border-white/[0.09] bg-[#111218]/80 backdrop-blur-2xl p-5 sm:p-7 md:p-9 shadow-2xl">

          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              Sign in to your HireLoop account.
            </p>
          </div>

          {/* Error */}

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          {/* Form */}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

            <div>
              <label htmlFor="email" className="text-sm text-gray-300 block mb-2">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full h-12 px-4 rounded-lg bg-[#090a0e] border border-white/10 outline-none focus:border-[#7565ff] transition text-base sm:text-sm placeholder:text-gray-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="text-sm text-gray-300">
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-xs text-[#9286ff] hover:text-white transition"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full h-12 px-4 pr-16 rounded-lg bg-[#090a0e] border border-white/10 outline-none focus:border-[#7565ff] transition text-base sm:text-sm placeholder:text-gray-600"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-white"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">

              <label className="flex items-center gap-2 text-xs text-gray-400">
                <input
                  type="checkbox"
                  name="rememberMe"
                  className="accent-[#7565ff]"
                />
                Remember me
              </label>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-lg bg-[#7565ff] hover:bg-[#6554ed] font-semibold text-sm transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

          {/* Divider */}

          <div className="flex items-center gap-3 my-5 sm:my-6">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-xs text-gray-600">OR</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {/* Google (coming later) */}

          <button
            type="button"
            disabled
            title="Google sign-in coming soon"
            className="w-full h-12 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue with Google
          </button>

          <p className="text-center text-sm text-gray-500 mt-6 sm:mt-7">
            Do not have an account?{" "}
            <Link
              href="/sign-up"
              className="text-[#9286ff] hover:text-white font-semibold transition"
            >
              Sign Up
            </Link>
          </p>

        </div>

        <p className="text-center text-xs text-gray-700 mt-6 sm:mt-7">
          © 2026 HireLoop. All rights reserved.
        </p>

      </div>

    </main>
  );
}
