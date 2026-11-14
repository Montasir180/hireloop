"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import { useSession, signOut } from "@/lib/auth-client";

import {
  LayoutDashboard,
  BriefcaseBusiness,
  FileText,
  Settings,
  Users,
  Plus,
  LogOut,
  X,
  Menu,
  RefreshCw,
  CheckCircle2,
  Home,
} from "lucide-react";

// ========================================
// NAVIGATION
// ========================================

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard/recruiter",
    icon: LayoutDashboard,
  },
  {
    name: "Add Job",
    href: "/dashboard/recruiter/jobs/new",
    icon: Plus,
  },
  {
    name: "Manage Jobs",
    href: "/dashboard/recruiter/jobs",
    icon: BriefcaseBusiness,
  },
  {
    name: "Applications",
    href: "/dashboard/recruiter/applications",
    icon: FileText,
  },
  {
    name: "Settings",
    href: "/dashboard/recruiter/settings",
    icon: Settings,
  },
];

// ========================================
// HELPERS
// ========================================

function getInitials(name) {
  if (!name) return "U";

  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ========================================
// USER AVATAR
// ========================================

function UserAvatar({ user }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#CEFB58] text-sm font-bold text-black">
      {user?.image && !imageError ? (
        <img
          src={user.image}
          alt={user.name || "User"}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        getInitials(user?.name)
      )}
    </div>
  );
}

// ========================================
// SIDEBAR
// ========================================

function Sidebar({ user, mobileOpen, setMobileOpen, onLogout }) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[240px] flex-col border-r border-[#222226] bg-[#09090b] px-5 py-7 transition-transform duration-300 sm:w-[260px] sm:px-6 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* LOGO */}

        <div className="mb-9 flex h-10 items-center justify-between px-1">
          <Link href="/dashboard/recruiter">
            <Image
              src="/logo.png"
              alt="HireLoop"
              width={150}
              height={50}
              priority
              className="h-auto w-[125px] object-contain"
            />
          </Link>

          <button
            onClick={() => setMobileOpen(false)}
            className="text-gray-400 transition hover:text-white lg:hidden"
          >
            <X size={21} />
          </button>
        </div>

        {/* USER PROFILE */}

        <div className="mb-6 rounded-xl border border-[#25252a] bg-[#141417] p-3">
          <div className="flex items-center gap-3">
            <UserAvatar user={user} />

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {user?.name || "User"}
              </p>

              <p className="mt-1 truncate text-xs text-gray-500">
                Recruiter
              </p>
            </div>
          </div>

          <div className="mt-3">
            <span className="rounded-full border border-[#4d4d83] bg-[#27274b] px-2 py-1 text-[10px] text-[#b9b9ff]">
              {user?.role || "Recruiter"} account
            </span>
          </div>
        </div>

        {/* NAVIGATION */}

        <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[2px] text-gray-600">
          Workspace
        </p>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;

            const active =
              item.name === "Dashboard"
                ? pathname === item.href
                : item.name === "Manage Jobs"
                  ? pathname === item.href ||
                    (pathname.startsWith(`${item.href}/`) &&
                      pathname !== "/dashboard/recruiter/jobs/new")
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`relative flex min-h-[42px] items-center gap-3 rounded-lg px-3 text-sm transition ${
                  active
                    ? "bg-[#242429] font-semibold text-white"
                    : "text-[#929299] hover:bg-[#1b1b20] hover:text-white"
                }`}
              >
                {active && (
                  <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r bg-[#8d8dff]" />
                )}

                <Icon size={19} strokeWidth={1.8} />

                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* BACK TO HOME */}

        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="mt-3 flex min-h-[42px] items-center gap-3 rounded-lg px-3 text-sm text-[#929299] transition hover:bg-[#1b1b20] hover:text-[#4ea2f6]"
        >
          <Home size={19} strokeWidth={1.8} />
          <span>Back to Home</span>
        </Link>

        {/* LOGOUT */}

        <button
          onClick={onLogout}
          className="mt-auto flex min-h-[42px] w-full items-center gap-3 rounded-lg px-3 text-sm text-gray-500 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={19} />
          Logout
        </button>
      </aside>
    </>
  );
}

// ========================================
// STAT CARD
// ========================================

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="min-w-0 rounded-[8px] border border-[#252529] bg-[#151518] px-4 py-5 transition hover:border-[#3a3a40] sm:px-5">
      <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-lg bg-[#29292e] text-[#e0e0e5]">
        <Icon size={18} strokeWidth={2} />
      </div>

      <p className="text-xs text-[#898991]">{title}</p>

      <h2 className="mt-2 text-2xl font-semibold leading-none tracking-tight text-white">
        {value}
      </h2>
    </div>
  );
}

// ========================================
// APPLICATION STATUS
// ========================================

function StatusBadge({ status }) {
  const statusStyles = {
    Interviewing:
      "border-[#44417b] bg-[#29264d] text-[#aaa4ff]",

    New:
      "border-[#244c72] bg-[#172f47] text-[#79baff]",

    Reviewing:
      "border-[#73501c] bg-[#3b2a10] text-[#ffbd46]",

    Rejected:
      "border-[#702d32] bg-[#3c1c20] text-[#ff777e]",

    Pending:
      "border-[#73501c] bg-[#3b2a10] text-[#ffbd46]",

    Accepted:
      "border-[#275c43] bg-[#163728] text-[#72dca0]",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[9px] ${
        statusStyles[status] ||
        "border-[#39393f] bg-[#222226] text-gray-300"
      }`}
    >
      {status || "Pending"}
    </span>
  );
}

// ========================================
// RECENT APPLICATIONS
// ========================================

function RecentApplications({ applications, loading }) {
  return (
    <section className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#eeeeef]">
          Recent Applications
        </h2>

        <Link
          href="/dashboard/recruiter/applications"
          className="text-xs text-[#c7c7cc] transition hover:text-white"
        >
          View all
        </Link>
      </div>

      <div className="overflow-hidden rounded-[8px] border border-[#252529] bg-[#151518]">
        {/* TABLE HEADER */}

        <div className="hidden grid-cols-[1.3fr_1fr_0.8fr_0.55fr_0.75fr] items-center border-b border-[#27272b] bg-[#1c1c20] px-5 py-3 md:grid">
          <p className="text-[9px] uppercase tracking-wider text-[#777780]">
            Candidate Name
          </p>

          <p className="text-[9px] uppercase tracking-wider text-[#777780]">
            Role
          </p>

          <p className="text-[9px] uppercase tracking-wider text-[#777780]">
            Date Applied
          </p>

          <p className="text-[9px] uppercase tracking-wider text-[#777780]">
            Experience
          </p>

          <p className="text-[9px] uppercase tracking-wider text-[#777780]">
            Status
          </p>
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-xs text-gray-500">
            <RefreshCw size={15} className="animate-spin" />
            Loading applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[#242429] text-gray-400">
              <Users size={21} />
            </div>

            <h3 className="text-sm font-medium text-gray-300">
              No applications yet
            </h3>

            <p className="mt-2 max-w-[260px] text-xs leading-5 text-gray-500">
              When candidates apply to your jobs, their applications will
              appear here.
            </p>
          </div>
        ) : (
          <div>
            {applications.map((application, index) => (
              <div
                key={application._id || application.id || index}
                className="grid grid-cols-1 items-center gap-2 border-b border-[#252529] px-4 py-4 last:border-0 md:grid-cols-[1.3fr_1fr_0.8fr_0.55fr_0.75fr] md:gap-3 md:px-5"
              >
                {/* CANDIDATE */}

                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#34343b] text-[10px] font-semibold text-white">
                    {getInitials(application.applicantName)}
                  </div>

                  <span className="text-xs font-medium text-[#eeeeef]">
                    {application.applicantName || "Applicant"}
                  </span>
                </div>

                {/* ROLE */}

                <p className="text-xs text-[#9999a1]">
                  {application.jobTitle || "—"}
                </p>

                {/* DATE */}

                <p className="text-xs text-[#9999a1]">
                  {application.createdAt
                    ? new Date(application.createdAt).toLocaleDateString()
                    : "—"}
                </p>

                {/* EXPERIENCE */}

                <p className="text-xs text-[#9999a1]">
                  {application.experience || "—"}
                </p>

                {/* STATUS */}

                <div>
                  <StatusBadge status={application.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ========================================
// MAIN DASHBOARD
// ========================================

export default function RecruiterDashboard() {
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  // BETTER AUTH SESSION

  const {
    data: session,
    isPending,
  } = useSession();

  const user = session?.user;

  // ======================================
  // AUTHENTICATION
  // ======================================

  useEffect(() => {
    if (isPending) return;

    if (!user) {
      router.replace("/sign-in");
      return;
    }

    if (user.role !== "recruiter") {
      router.replace(
        user.role === "admin"
          ? "/dashboard/admin"
          : "/dashboard/seeker"
      );
    }
  }, [isPending, user, router]);

  // ======================================
  // FETCH DASHBOARD DATA
  // ======================================

  useEffect(() => {
    if (!user || user.role !== "recruiter") return;

    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoadingData(true);

        const response = await fetch("/api/recruiter/dashboard", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Dashboard API is not available yet.");
        }

        const result = await response.json();

        if (!cancelled) {
          setDashboardData(result.data || result);
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setDashboardData(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingData(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // ======================================
  // LOGOUT
  // ======================================

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);

      await signOut();

      router.replace("/sign-in");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      setLogoutLoading(false);
    }
  };

  // ======================================
  // LOADING SCREEN
  // ======================================

  if (isPending || !user || user.role !== "recruiter") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0d0f]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#4ea2f6]" />
      </div>
    );
  }

  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 17
        ? "Good afternoon"
        : "Good evening";

  // ======================================
  // DASHBOARD
  // ======================================

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* SIDEBAR */}

      <Sidebar
        user={user}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onLogout={handleLogout}
      />

      {/* MAIN AREA */}

      <main className="min-h-screen lg:ml-[240px]">
        <div className="min-h-screen p-[5px] sm:p-[7px]">
          {/* MAIN PANEL */}

          <div className="relative min-h-[calc(100vh-10px)] overflow-hidden rounded-[8px] border border-[#222226] bg-[#0e0e11]">
            {/* TOP BAR */}

            <div className="mx-3 mt-3 flex h-[38px] items-center justify-between rounded-md border border-[#202024] px-3 sm:mx-4">
              <button
                onClick={() => setMobileOpen(true)}
                className="text-gray-400 lg:hidden"
              >
                <Menu size={19} />
              </button>

              <div className="ml-auto flex items-center gap-2">
                <span className="hidden text-[10px] text-gray-500 sm:block">
                  {user.email}
                </span>
              </div>
            </div>

            {/* DASHBOARD CONTENT */}

            <div className="px-3 pb-20 pt-5 sm:px-5 sm:pt-5">
              {/* WELCOME */}

              <section className="mb-5">
                <h1 className="text-base font-semibold text-[#eeeeef] sm:text-lg">
                  {greeting}, {user.name || "Recruiter"}
                </h1>
              </section>

              {/* STATISTICS */}

              <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <StatCard
                  title="Total Job Posts"
                  value={
                    loadingData
                      ? "—"
                      : dashboardData?.stats?.totalJobs ?? 0
                  }
                  icon={FileText}
                />

                <StatCard
                  title="Total Applicants"
                  value={
                    loadingData
                      ? "—"
                      : dashboardData?.stats?.totalApplicants ?? 0
                  }
                  icon={Users}
                />

                <StatCard
                  title="Active Jobs"
                  value={
                    loadingData
                      ? "—"
                      : dashboardData?.stats?.activeJobs ?? 0
                  }
                  icon={BriefcaseBusiness}
                />

                <StatCard
                  title="Jobs Closed"
                  value={
                    loadingData
                      ? "—"
                      : dashboardData?.stats?.closedJobs ?? 0
                  }
                  icon={CheckCircle2}
                />
              </section>

              {/* APPLICATIONS */}

              <RecentApplications
                applications={dashboardData?.applications || []}
                loading={loadingData}
              />
            </div>

            {/* FLOATING ADD BUTTON */}

            <Link
              href="/dashboard/recruiter/jobs/new"
              aria-label="Create new job"
              className="fixed bottom-6 right-6 z-30 flex h-[48px] w-[48px] items-center justify-center rounded-full bg-white text-[#111111] shadow-lg transition hover:scale-105 hover:bg-[#CEFB58]"
            >
              <Plus size={23} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </main>

      {/* LOGOUT LOADING */}

      {logoutLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="rounded-xl border border-white/10 bg-[#151518] px-7 py-5 text-center">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-[#4ea2f6]" />

            <p className="mt-3 text-xs text-gray-300">
              Logging out...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}