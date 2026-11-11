"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const trendingRoles = ["Product Designer", "AI Engineering", "Dev-ops Engineer"];

const stats = [
  {
    value: "50K",
    label: "Active Jobs",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    value: "12K",
    label: "Companies",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M8 12v4M12 12v4M16 12v4" />
      </svg>
    ),
  },
  {
    value: "2M",
    label: "Job Seekers",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    value: "97%",
    label: "Satisfaction Rate",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.4l6.1-.9L12 3Z" />
      </svg>
    ),
  },
];

const starField = {
  backgroundImage:
    "radial-gradient(1.5px 1.5px at 20px 30px, rgba(255,255,255,0.45), transparent), radial-gradient(1.5px 1.5px at 130px 90px, rgba(255,255,255,0.35), transparent), radial-gradient(1px 1px at 220px 50px, rgba(255,255,255,0.4), transparent), radial-gradient(1.5px 1.5px at 310px 120px, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 90px 160px, rgba(255,255,255,0.35), transparent)",
  backgroundSize: "360px 200px",
};

const Hero = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (title.trim()) params.set("q", title.trim());
    if (location.trim()) params.set("location", location.trim());
    const query = params.toString();
    router.push(query ? `/jobs?${query}` : "/jobs");
  };

  return (
    <section className="relative isolate flex min-h-[calc(100vh-92px)] flex-col overflow-hidden bg-[#050506]">
      {/* Globe background — sized to ~72% of the viewport, its top sitting at ~54%
          of the hero height (falls back to bottom-anchored on tall/narrow screens). */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 w-[72%] -translate-x-1/2"
          style={{ top: "max(54% - 42.3vw, 100% - 94.1vw)" }}
        >
          <Image
            src="/globe.png"
            alt=""
            width={1440}
            height={1882}
            priority
            className="h-auto w-full select-none"
          />
        </div>
      </div>

      {/* Background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 420px at 50% -10%, rgba(139,139,160,0.18), transparent 70%), radial-gradient(700px 380px at 85% 40%, rgba(99,102,241,0.10), transparent 70%), radial-gradient(600px 320px at 10% 55%, rgba(255,255,255,0.06), transparent 70%)",
        }}
      />

      {/* Star dots */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-64 opacity-70"
        style={{
          ...starField,
          maskImage: "linear-gradient(to top, black 20%, transparent)",
          WebkitMaskImage: "linear-gradient(to top, black 20%, transparent)",
        }}
      />

      {/* Hero content */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-4 pt-20 pb-8 text-center sm:px-6 sm:pt-28">
        {/* Badge */}
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="hidden h-px w-16 bg-gradient-to-r from-transparent to-white/20 sm:block"
          />
          <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-[#141416] px-4 py-2 shadow-sm">
            <span aria-hidden="true" className="text-base leading-none">
              💼
            </span>
            <p className="font-mono text-xs tracking-widest sm:text-sm">
              <span className="font-bold text-white">50,000+</span>{" "}
              <span className="text-neutral-400">NEW JOBS THIS MONTH</span>
            </p>
          </div>
          <span
            aria-hidden="true"
            className="hidden h-px w-16 bg-gradient-to-l from-transparent to-white/20 sm:block"
          />
        </div>

        {/* Heading */}
        <h1 className="mt-7 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
          Find Your Dream Job Today
        </h1>

        {/* Subheading */}
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-neutral-400 sm:text-base">
          HireLoop connects top talent with world-class companies. Browse
          thousands of curated opportunities and land your next role — faster.
        </p>

        {/* Search bar */}
        <form
          onSubmit={handleSubmit}
          className="mt-10 flex w-full max-w-2xl items-center gap-2 rounded-2xl border border-white/10 bg-[#111113] p-2 pl-4 shadow-[0_8px_30px_rgba(0,0,0,0.45)]"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <svg
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-neutral-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Job title, skill or company"
              aria-label="Job title, skill or company"
              className="w-full min-w-0 bg-transparent py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none"
            />
          </div>

          <span aria-hidden="true" className="h-6 w-px bg-white/10" />

          <div className="hidden min-w-0 flex-1 items-center gap-3 sm:flex">
            <svg
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-neutral-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <input
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Location or Remote"
              aria-label="Location or Remote"
              className="w-full min-w-0 bg-transparent py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            aria-label="Search jobs"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#6d5df6] text-white transition-colors hover:bg-[#5b4be6] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
        </form>

        {/* Trending chips */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          <span className="text-sm text-neutral-500">Trending: Position</span>
          {trendingRoles.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setTitle(role)}
              className="rounded-lg border border-white/10 bg-[#17171a] px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:border-white/20 hover:text-white sm:text-sm"
            >
              {role}
            </button>
          ))}
        </div>

        {/* Overlay headline (sits over the globe) */}
        <p
          className="mt-auto max-w-2xl px-4 pt-16 text-lg font-semibold leading-snug text-white sm:text-2xl md:text-3xl"
          style={{ textShadow: "0 2px 16px rgba(0,0,0,0.65)" }}
        >
          Assisting over 15,000 job seekers
          <br />
          find their dream positions.
        </p>
      </div>

      {/* Stats cards */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex min-h-[150px] flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-[#141416] to-[#0a0a0c] p-4 text-left shadow-[0_10px_30px_rgba(0,0,0,0.45)] sm:min-h-[190px] sm:p-5"
            >
              <span className="inline-flex text-neutral-300">{stat.icon}</span>
              <div className="mt-auto pt-6">
                <p className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-neutral-400 sm:text-sm">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
