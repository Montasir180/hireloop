"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";

export default function SignUpPage() {
  const router = useRouter();
  const [role, setRole] = useState("seeker");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);

    if (form.get("password") !== form.get("confirmPassword")) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);

    const { error } = await signUp.email({
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
      role,
      // Validated server-side against ADMIN_SIGNUP_CODE; without it the
      // server refuses to create an admin account.
      ...(role === "admin"
        ? { adminCode: form.get("adminCode") || "" }
        : {}),
    });

    setLoading(false);

    if (error) {
      setError(error.message || "Unable to create account. Please try again.");
      return;
    }

    // Auto sign-in done — go to the app
    router.push("/");
    router.refresh();
  };

  return (
    <main className="min-h-[100dvh] bg-[#08090d] flex items-center justify-center px-4 sm:px-6 py-8 sm:py-10 text-white">

      <div className="w-full max-w-[440px]">

        {/* Logo */}

        <Link href="/" className="block text-center mb-6 sm:mb-8">
          <img
            src="/logo.png"
            alt="HireLoop Logo"
            className="mx-auto h-8 sm:h-10 w-auto"
          />
        </Link>

        {/* Glass Card */}

        <div className="rounded-2xl border border-white/[0.09] bg-[#111218]/80 backdrop-blur-2xl p-5 sm:p-7 md:p-9 shadow-2xl">

          <div className="mb-6 sm:mb-7">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Create account
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              Get started with HireLoop today.
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

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Account Type */}

            <div>
              <label className="text-sm text-gray-300 block mb-2">
                Account Type
              </label>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">

                <button
                  type="button"
                  onClick={() => setRole("seeker")}
                  aria-pressed={role === "seeker"}
                  className={`h-11 rounded-lg border px-1 text-xs font-medium transition sm:text-sm ${
                    role === "seeker"
                      ? "border-[#7565ff] bg-[#7565ff]/10 text-[#a59bff]"
                      : "border-white/10 bg-white/[0.02] text-gray-400"
                  }`}
                >
                  Job Seeker
                </button>

                <button
                  type="button"
                  onClick={() => setRole("recruiter")}
                  aria-pressed={role === "recruiter"}
                  className={`h-11 rounded-lg border px-1 text-xs font-medium transition sm:text-sm ${
                    role === "recruiter"
                      ? "border-[#7565ff] bg-[#7565ff]/10 text-[#a59bff]"
                      : "border-white/10 bg-white/[0.02] text-gray-400"
                  }`}
                >
                  Recruiter
                </button>

                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  aria-pressed={role === "admin"}
                  className={`h-11 rounded-lg border px-1 text-xs font-medium transition sm:text-sm ${
                    role === "admin"
                      ? "border-[#7565ff] bg-[#7565ff]/10 text-[#a59bff]"
                      : "border-white/10 bg-white/[0.02] text-gray-400"
                  }`}
                >
                  Admin
                </button>

              </div>
            </div>

            {/* Admin Code (required for admin registration) */}

            {role === "admin" && (
              <div>
                <label htmlFor="adminCode" className="text-sm text-gray-300 block mb-2">
                  Admin Code
                </label>

                <input
                  id="adminCode"
                  name="adminCode"
                  type="password"
                  placeholder="Enter the admin registration code"
                  required
                  autoComplete="off"
                  className="w-full h-12 px-4 rounded-lg bg-[#090a0e] border border-white/10 outline-none focus:border-[#7565ff] transition text-base sm:text-sm placeholder:text-gray-600"
                />

                <p className="mt-2 text-xs text-gray-600">
                  Admin accounts are only created with a valid admin code.
                </p>
              </div>
            )}

            {/* Name */}

            <div>
              <label htmlFor="name" className="text-sm text-gray-300 block mb-2">
                Full Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                required
                minLength={2}
                autoComplete="name"
                className="w-full h-12 px-4 rounded-lg bg-[#090a0e] border border-white/10 outline-none focus:border-[#7565ff] transition text-base sm:text-sm placeholder:text-gray-600"
              />
            </div>

            {/* Email */}

            <div>
              <label htmlFor="email" className="text-sm text-gray-300 block mb-2">
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full h-12 px-4 rounded-lg bg-[#090a0e] border border-white/10 outline-none focus:border-[#7565ff] transition text-base sm:text-sm placeholder:text-gray-600"
              />
            </div>

            {/* Password */}

            <div>
              <label htmlFor="password" className="text-sm text-gray-300 block mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  required
                  minLength={8}
                  autoComplete="new-password"
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

            {/* Confirm Password */}

            <div>
              <label htmlFor="confirmPassword" className="text-sm text-gray-300 block mb-2">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm your password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full h-12 px-4 pr-16 rounded-lg bg-[#090a0e] border border-white/10 outline-none focus:border-[#7565ff] transition text-base sm:text-sm placeholder:text-gray-600"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-white"
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Terms */}

            <label className="flex items-start gap-2 text-xs text-gray-500 leading-5">
              <input
                type="checkbox"
                required
                className="mt-1 accent-[#7565ff]"
              />

              <span>
                I agree to the{" "}
                <Link href="/terms" className="text-[#9286ff]">
                  Terms & Conditions
                </Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-[#9286ff]">
                  Privacy Policy
                </Link>.
              </span>
            </label>

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-lg bg-[#7565ff] hover:bg-[#6554ed] font-semibold text-sm transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create Account"}
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
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-[#9286ff] hover:text-white font-semibold transition"
            >
              Sign In
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
