"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Jobs", href: "/jobs" },
  { label: "Company", href: "/company" },
  { label: "Pricing", href: "/pricing" },
];

const Navbar = ({ user: userProp = null, onLogout }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);

  // Existing better-auth session — no hardcoded user data.
  const { data: session, isPending } = useSession();
  const user = userProp ?? session?.user ?? null;

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Hide the navbar on dashboard pages (after all hooks)
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((word) => word[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "U"
    );
  };

  const role = user?.role || "seeker";

  const dashboardHref = user ? `/dashboard/${role}` : "/sign-in";

  // Role-aware profile route.
  const profileHref = user ? `/dashboard/${role}/settings` : "/sign-in";

  const handleLogout = async () => {
    setProfileOpen(false);
    setOpen(false);

    if (onLogout) {
      await onLogout();
      return;
    }

    try {
      await signOut();
    } finally {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0b0b0d] px-4 pt-4 pb-4 sm:px-6 lg:px-8">

      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl bg-[#17171a] px-5 py-3 sm:px-6">

        {/* Logo */}

        <Link href="/" className="flex items-center" aria-label="HireLoop home">
          <Image
            src="/logo.png"
            alt="HireLoop"
            width={154}
            height={44}
            priority
            className="h-8 w-auto sm:h-9"
          />
        </Link>

        {/* Desktop Navigation */}

        <div className="hidden items-center gap-7 md:flex">

          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-neutral-300 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}

          <span className="h-5 w-px bg-white/15" />

          {/* Authentication State */}

          {!user && isPending ? (

            /* Session loading placeholder — avoids flashing signed-out state */

            <div className="flex items-center gap-3" aria-hidden="true">
              <div className="h-9 w-9 animate-pulse rounded-full bg-white/10" />
              <div className="h-3.5 w-24 animate-pulse rounded bg-white/10" />
            </div>

          ) : !user ? (

            <>
              <Link
                href="/sign-in"
                className="text-sm text-indigo-400 transition-colors hover:text-indigo-300"
              >
                Sign In
              </Link>

              <Link
                href="/sign-up"
                className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-400"
              >
                Get Started
              </Link>
            </>

          ) : (

            /* Logged In Profile */

            <div className="relative" ref={profileRef}>

              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-white/5"
              >

                {user.image || user.photoURL ? (
                  <Image
                    src={user.image || user.photoURL}
                    alt={user.name || "User"}
                    width={38}
                    height={38}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white">
                    {getInitials(user.name)}
                  </div>
                )}

                <div className="text-left">
                  <p className="text-sm font-medium text-white">
                    {user.name || "User"}
                  </p>

                  <p className="text-xs capitalize text-neutral-500">
                    {user.role || "Seeker"}
                  </p>
                </div>

                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`text-neutral-400 transition-transform ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>

              </button>

              {/* Profile Dropdown */}

              {profileOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 overflow-hidden rounded-xl border border-white/10 bg-[#17171a] shadow-2xl">

                  <div className="border-b border-white/10 p-4">

                    <p className="truncate text-sm font-semibold text-white">
                      {user.name}
                    </p>

                    <p className="mt-1 truncate text-xs text-neutral-500">
                      {user.email}
                    </p>

                  </div>

                  <div className="p-2">

                    <Link
                      href={dashboardHref}
                      onClick={() => setProfileOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm text-neutral-300 transition hover:bg-white/5 hover:text-white"
                    >
                      Dashboard
                    </Link>

                    <Link
                      href={profileHref}
                      onClick={() => setProfileOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm text-neutral-300 transition hover:bg-white/5 hover:text-white"
                    >
                      My Profile
                    </Link>

                  </div>

                  <div className="border-t border-white/10 p-2">

                    <button
                      onClick={handleLogout}
                      className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-red-400 transition hover:bg-red-500/10"
                    >
                      Logout
                    </button>

                  </div>

                </div>
              )}

            </div>

          )}

        </div>

        {/* Mobile Menu Button */}

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-300 transition-colors hover:bg-white/10 md:hidden"
        >

          {open ? (

            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>

          ) : (

            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>

          )}

        </button>

      </nav>

      {/* Mobile Navigation */}

      {open && (

        <div className="mx-auto mt-2 max-w-7xl rounded-2xl border border-white/5 bg-[#17171a] p-4 md:hidden">

          <div className="flex flex-col gap-1">

            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-neutral-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ))}

          </div>

          <div className="mt-3 border-t border-white/10 pt-3">

            {!user && isPending ? (

              <div className="flex items-center gap-3 px-3 py-3" aria-hidden="true">
                <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-28 animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-36 animate-pulse rounded bg-white/10" />
                </div>
              </div>

            ) : !user ? (

              <>
                <Link
                  href="/sign-in"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm text-indigo-400 hover:bg-white/5"
                >
                  Sign In
                </Link>

                <Link
                  href="/sign-up"
                  onClick={() => setOpen(false)}
                  className="mt-1 block rounded-lg bg-indigo-500 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-indigo-400"
                >
                  Get Started
                </Link>
              </>

            ) : (

              <>

                <div className="flex items-center gap-3 px-3 py-3">

                  {user.image || user.photoURL ? (
                    <Image
                      src={user.image || user.photoURL}
                      alt={user.name || "User"}
                      width={42}
                      height={42}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white">
                      {getInitials(user.name)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {user.name}
                    </p>

                    <p className="truncate text-xs text-neutral-500">
                      {user.email}
                    </p>
                  </div>

                </div>

                <Link
                  href={dashboardHref}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm text-neutral-300 hover:bg-white/5"
                >
                  Dashboard
                </Link>

                <Link
                  href={profileHref}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm text-neutral-300 hover:bg-white/5"
                >
                  My Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="mt-1 w-full rounded-lg px-3 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10"
                >
                  Logout
                </button>

              </>

            )}

          </div>

        </div>

      )}

    </header>
  );
};

export default Navbar;