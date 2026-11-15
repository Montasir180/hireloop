"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useSession, signOut } from "@/lib/auth-client";

import {
  LayoutDashboard,
  BriefcaseBusiness,
  FileText,
  Settings,
  Plus,
  LogOut,
  X,
  Menu,
  Home,
  MapPin,
  CalendarDays,
  Building2,
  Globe2,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

// ========================================
// SIDEBAR NAVIGATION
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
// SIDEBAR
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

function Sidebar({ user, mobileOpen, setMobileOpen, onLogout }) {
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
            className="text-gray-400 hover:text-white lg:hidden"
          >
            <X size={21} />
          </button>
        </div>

        {/* USER PROFILE */}

        <div className="mb-6 rounded-xl border border-[#25252a] bg-[#141417] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#CEFB58] text-sm font-bold text-black">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(user?.name)
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {user?.name || "User"}
              </p>

              <p className="mt-1 text-xs text-gray-500">
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
            const active = item.name === "Add Job";

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
                  <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r bg-[#6860ff]" />
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
          className="mt-3 flex min-h-[42px] items-center gap-3 rounded-lg px-3 text-sm text-[#929299] transition hover:bg-[#1b1b20] hover:text-[#CEFB58]"
        >
          <Home size={19} />
          Back to Home
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
// FORM INPUT COMPONENT
// ========================================

function FormInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  icon: Icon,
  type = "text",
  min,
}) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-xs font-medium text-[#d4d4d8]">
        {label}
        {required && <span className="ml-1 text-[#7770ff]">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777780]"
          />
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          className={`h-11 w-full rounded-lg border border-transparent bg-[#202024] text-xs text-white outline-none transition placeholder:text-[#777780] focus:border-[#6860ff] focus:bg-[#242429] ${
            Icon ? "pl-10 pr-3" : "px-3"
          }`}
        />
      </div>
    </div>
  );
}

// ========================================
// FORM SELECT COMPONENT
// ========================================

function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
}) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-xs font-medium text-[#d4d4d8]">
        {label}
        {required && <span className="ml-1 text-[#7770ff]">*</span>}
      </label>

      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="h-11 w-full appearance-none rounded-lg border border-transparent bg-[#202024] px-3 pr-9 text-xs text-white outline-none transition focus:border-[#6860ff]"
        >
          <option value="" disabled>
            Select an option
          </option>

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-[#202024]"
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        />
      </div>
    </div>
  );
}

// ========================================
// SECTION HEADING
// ========================================

function SectionHeading({ number, title }) {
  return (
    <div className="mb-6 flex items-center gap-2">
      <span className="h-2 w-2 rounded-full bg-[#6860ff]" />

      <h2 className="text-sm font-semibold text-white">
        {number}. {title}
      </h2>
    </div>
  );
}

// ========================================
// MAIN ADD JOB PAGE
// ========================================

export default function AddJobPage() {
  const router = useRouter();

  const { data: session, isPending } = useSession();

  const user = session?.user;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ======================================
  // FORM STATE
  // ======================================

  const [formData, setFormData] = useState({
    title: "",
    companyName: "",
    category: "",
    jobType: "full-time",
    isRemote: false,
    location: "",
    deadline: "",
    minSalary: "",
    maxSalary: "",
    salaryFrequency: "per month",
    responsibilities: "",
    qualifications: "",
  });

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
  // HANDLE INPUT CHANGE
  // ======================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ======================================
  // HANDLE REMOTE JOB
  // ======================================

  const handleRemoteChange = () => {
    setFormData((previous) => ({
      ...previous,
      isRemote: !previous.isRemote,
    }));
  };

  // ======================================
  // LOGOUT
  // ======================================

  const handleLogout = async () => {
    await signOut();

    router.replace("/sign-in");
    router.refresh();
  };

  // ======================================
  // PUBLISH JOB
  // ======================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      formData.minSalary &&
      formData.maxSalary &&
      Number(formData.minSalary) > Number(formData.maxSalary)
    ) {
      setError("Minimum salary cannot exceed maximum salary.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/recruiter/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to publish job.");
      }

      setSuccess("Your job has been published successfully!");

      setTimeout(() => {
        router.push("/dashboard/recruiter");
        router.refresh();
      }, 1200);
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Unable to publish job. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ======================================
  // LOADING
  // ======================================

  if (isPending || !user || user.role !== "recruiter") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <Loader2
          size={30}
          className="animate-spin text-[#7770ff]"
        />
      </div>
    );
  }

  // ======================================
  // PAGE
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

      {/* MAIN CONTENT */}

      <main className="min-h-screen lg:ml-[240px]">

        <div className="min-h-screen p-2 sm:p-3">

          <div className="min-h-[calc(100vh-16px)] rounded-xl border border-[#222226] bg-[#0e0e11] p-4 sm:p-6 lg:p-7">

            {/* MOBILE HEADER */}

            <div className="mb-5 flex items-center justify-between lg:hidden">
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-lg border border-[#29292e] p-2 text-gray-400"
              >
                <Menu size={20} />
              </button>

              <span className="text-xs text-gray-500">
                {user.email}
              </span>
            </div>

            {/* PAGE HEADER */}

            <div className="mb-8 flex flex-col justify-between gap-5 border-b border-[#202024] pb-6 sm:flex-row sm:items-center">

              <div>
                <div className="mb-3 flex items-center gap-2 text-[11px] text-gray-500">
                  <Link
                    href="/dashboard/recruiter/add_jobs"
                    className="transition hover:text-white"
                  >
                    Manage Jobs
                  </Link>

                  <span>/</span>

                  <span className="text-[#aaaaff]">
                    Create New Listing
                  </span>
                </div>

                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Post a New Job
                </h1>

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  Fill in the position specifications to attract qualified
                  talent across our network.
                </p>
              </div>

              <button
                type="submit"
                form="add-job-form"
                disabled={submitting}
                className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#6257ff] px-5 text-xs font-semibold text-white shadow-lg shadow-[#6257ff]/20 transition hover:bg-[#766cff] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    Publish Job
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

            </div>

            {/* ALERTS */}

            {error && (
              <div className="mb-5 flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-5 flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-xs text-green-400">
                <CheckCircle2 size={17} />
                {success}
              </div>
            )}

            {/* FORM */}

            <form
              id="add-job-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              {/* ================================== */}
              {/* 1. BASIC INFORMATION */}
              {/* ================================== */}

              <section className="rounded-xl border border-[#202024] bg-[#121215] p-4 sm:p-6">

                <SectionHeading
                  number="1"
                  title="Basic Information"
                />

                <div className="space-y-5">

                  {/* JOB TITLE */}

                  <FormInput
                    label="Job Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Frontend Developer"
                    required
                  />

                  {/* COMPANY AND CATEGORY */}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    <FormInput
                      label="Company Name"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Enter your company name"
                      required
                      icon={Building2}
                    />

                    <FormSelect
                      label="Job Category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      options={[
                        {
                          label: "Engineering & Tech",
                          value: "engineering",
                        },
                        {
                          label: "Design & Creative",
                          value: "design",
                        },
                        {
                          label: "Marketing",
                          value: "marketing",
                        },
                        {
                          label: "Business & Finance",
                          value: "business",
                        },
                        {
                          label: "Sales",
                          value: "sales",
                        },
                        {
                          label: "Human Resources",
                          value: "hr",
                        },
                        {
                          label: "Customer Support",
                          value: "customer-support",
                        },
                        {
                          label: "Education",
                          value: "education",
                        },
                        {
                          label: "Other",
                          value: "other",
                        },
                      ]}
                    />

                  </div>

                  {/* JOB TYPE */}

                  <div>
                    <label className="mb-3 block text-xs font-medium text-[#d4d4d8]">
                      Job Type
                      <span className="ml-1 text-[#7770ff]">*</span>
                    </label>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

                      {[
                        ["full-time", "Full-time"],
                        ["part-time", "Part-time"],
                        ["contract", "Contract"],
                        ["internship", "Internship"],
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setFormData((previous) => ({
                              ...previous,
                              jobType: value,
                            }))
                          }
                          className={`h-11 rounded-lg border text-xs transition ${
                            formData.jobType === value
                              ? "border-[#6257ff] bg-[#252330] text-white"
                              : "border-transparent bg-[#202024] text-gray-400 hover:border-[#393943] hover:text-white"
                          }`}
                        >
                          {label}
                        </button>
                      ))}

                    </div>
                  </div>

                </div>
              </section>

              {/* ================================== */}
              {/* 2. LOCATION, COMPENSATION */}
              {/* ================================== */}

              <section className="rounded-xl border border-[#202024] bg-[#121215] p-4 sm:p-6">

                <SectionHeading
                  number="2"
                  title="Location, Compensation & Timeline"
                />

                <div className="space-y-5">

                  {/* REMOTE TOGGLE */}

                  <button
                    type="button"
                    onClick={handleRemoteChange}
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-[#252529] bg-[#202024] p-4 text-left transition hover:border-[#393943]"
                  >

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#29294a] text-[#aaaaff]">
                        <Globe2 size={17} />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-white">
                          Remote Work Allowed (isRemote)
                        </p>

                        <p className="mt-1 text-[10px] text-gray-500">
                          Enable worldwide or distributed candidate applications.
                        </p>
                      </div>

                    </div>

                    <div
                      className={`relative h-5 w-10 shrink-0 rounded-full transition ${
                        formData.isRemote
                          ? "bg-[#6257ff]"
                          : "bg-[#45454c]"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                          formData.isRemote
                            ? "left-[22px]"
                            : "left-0.5"
                        }`}
                      />
                    </div>

                  </button>

                  {/* LOCATION AND DEADLINE */}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    <FormInput
                      label="Job Location (location)"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Dhaka, Bangladesh"
                      required={!formData.isRemote}
                      icon={MapPin}
                    />

                    <FormInput
                      label="Application Deadline (deadline)"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      type="date"
                      required
                      icon={CalendarDays}
                      min={new Date().toISOString().split("T")[0]}
                    />

                  </div>

                  {/* SALARY */}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                    <FormInput
                      label="Min Salary / Rate"
                      name="minSalary"
                      value={formData.minSalary}
                      onChange={handleChange}
                      placeholder="e.g. 25000"
                      type="number"
                      min="0"
                    />

                    <FormInput
                      label="Max Salary / Rate"
                      name="maxSalary"
                      value={formData.maxSalary}
                      onChange={handleChange}
                      placeholder="e.g. 40000"
                      type="number"
                      min="0"
                    />

                    <FormSelect
                      label="Frequency"
                      name="salaryFrequency"
                      value={formData.salaryFrequency}
                      onChange={handleChange}
                      options={[
                        {
                          label: "Per hour",
                          value: "per hour",
                        },
                        {
                          label: "Per day",
                          value: "per day",
                        },
                        {
                          label: "Per week",
                          value: "per week",
                        },
                        {
                          label: "Per month",
                          value: "per month",
                        },
                        {
                          label: "Per year",
                          value: "per year",
                        },
                        {
                          label: "Negotiable",
                          value: "negotiable",
                        },
                      ]}
                    />

                  </div>

                </div>
              </section>

              {/* ================================== */}
              {/* 3. RESPONSIBILITIES & REQUIREMENTS */}
              {/* ================================== */}

              <section className="rounded-xl border border-[#202024] bg-[#121215] p-4 sm:p-6">

                <SectionHeading
                  number="3"
                  title="Responsibilities & Requirements"
                />

                <div className="space-y-5">

                  {/* RESPONSIBILITIES */}

                  <div>
                    <label className="mb-2 block text-xs font-medium text-[#d4d4d8]">
                      Key Responsibilities
                      <span className="ml-1 text-[#7770ff]">*</span>
                    </label>

                    <textarea
                      name="responsibilities"
                      value={formData.responsibilities}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="Describe the main responsibilities of this position..."
                      className="w-full resize-y rounded-lg border border-transparent bg-[#202024] p-3 text-xs leading-6 text-white outline-none transition placeholder:text-[#777780] focus:border-[#6860ff]"
                    />
                  </div>

                  {/* QUALIFICATIONS */}

                  <div>
                    <label className="mb-2 block text-xs font-medium text-[#d4d4d8]">
                      Qualifications & Requirements
                      <span className="ml-1 text-[#7770ff]">*</span>
                    </label>

                    <textarea
                      name="qualifications"
                      value={formData.qualifications}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="List the required qualifications, skills, and experience..."
                      className="w-full resize-y rounded-lg border border-transparent bg-[#202024] p-3 text-xs leading-6 text-white outline-none transition placeholder:text-[#777780] focus:border-[#6860ff]"
                    />
                  </div>

                </div>
              </section>

              {/* BOTTOM ACTIONS */}

              <div className="flex flex-col-reverse items-center justify-between gap-4 border-t border-[#202024] pt-5 sm:flex-row">

                <Link
                  href="/dashboard/recruiter"
                  className="text-xs text-gray-500 transition hover:text-white"
                >
                  Cancel and return to Dashboard
                </Link>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#6257ff] px-6 text-xs font-semibold text-white transition hover:bg-[#766cff] disabled:opacity-50 sm:w-auto"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      Publish Job
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>
        </div>
      </main>
    </div>
  );
}