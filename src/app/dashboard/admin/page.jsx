"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const cardClass =
  "rounded-2xl border border-white/[0.09] bg-[#111218]/80 p-5 sm:p-6 backdrop-blur-2xl";

const primaryBtnClass =
  "inline-flex h-10 items-center justify-center rounded-lg bg-[#7565ff] px-5 text-sm font-semibold text-white transition hover:bg-[#6554ed]";

const secondaryBtnClass =
  "inline-flex h-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] px-5 text-sm text-gray-300 transition hover:bg-white/[0.07]";

export default function AdminDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/profile", { cache: "no-store" });
        const data = await response.json();

        if (!mounted) return;

        if (response.status === 401) {
          setError("You must be signed in to view your dashboard.");
          setLoading(false);
          return;
        }

        if (!response.ok || !data.user) {
          throw new Error(data.error || "Unable to load your profile.");
        }

        setProfile(data.user);
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || "Unable to load your dashboard.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center pt-20 text-gray-500">
        Loading your dashboard…
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className={cardClass} role="alert">
          <p className="text-sm text-red-300">
            {error || "Not authenticated."}
          </p>
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className={primaryBtnClass}
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = profile.role === "admin";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Welcome back, {profile.name || "there"}.
        </p>
      </div>

      {!isAdmin && (
        <div className={cardClass} role="alert">
          <p className="text-sm text-red-300">
            This admin dashboard is only accessible to administrator accounts.
          </p>
        </div>
      )}

      {isAdmin && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left — profile summary */}
          <div className="lg:col-span-1 space-y-6">
            <section className={cardClass}>
              <h2 className="text-base font-semibold text-white mb-4">
                Profile
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  {profile.image ? (
                    <img
                      src={profile.image}
                      alt={profile.name || "Profile"}
                      className="h-16 w-16 rounded-full object-cover"
                      width={64}
                      height={64}
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#7565ff] text-xl font-bold text-white">
                      {(profile.name || "U")
                        .split(" ")
                        .map((w) => w[0])
                        .filter(Boolean)
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {profile.name || "Unnamed user"}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">
                      {profile.email || "No email"}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-neutral-300">
                  Admin
                </span>
              </div>
            </section>
          </div>

          {/* Right — quick actions */}
          <div className="lg:col-span-2 space-y-6">
            <section className={cardClass}>
              <h2 className="text-base font-semibold text-white mb-4">
                Quick actions
              </h2>
              <div className="grid gap-3 sm:grid-cols-3">
                <Link
                  href="/dashboard/admin/settings"
                  className={primaryBtnClass}
                >
                  Edit profile
                </Link>
                <button
                  type="button"
                  className={secondaryBtnClass}
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </button>
              </div>
            </section>

            <section className={cardClass}>
              <h2 className="text-base font-semibold text-white mb-4">
                Administration
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Manage your administrator account information from the profile
                settings page.
              </p>
              <Link
                href="/dashboard/admin/settings"
                className="text-sm text-[#9286ff] hover:text-white font-medium transition"
              >
                Go to profile settings →
              </Link>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
