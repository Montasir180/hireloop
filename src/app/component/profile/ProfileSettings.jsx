"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileSkeleton from "./ProfileSkeleton";

const inputClass =
  "w-full h-12 px-4 rounded-lg bg-[#090a0e] border border-white/10 outline-none focus:border-[#7565ff] transition text-base sm:text-sm text-white placeholder:text-gray-600";

const textareaClass =
  "w-full px-4 py-3 rounded-lg bg-[#090a0e] border border-white/10 outline-none focus:border-[#7565ff] transition text-base sm:text-sm text-white placeholder:text-gray-600 resize-none";

const labelClass = "text-sm text-gray-300 block mb-2";

const primaryBtnClass =
  "inline-flex h-10 items-center justify-center rounded-lg bg-[#7565ff] px-5 text-sm font-semibold text-white transition hover:bg-[#6554ed] disabled:opacity-60 disabled:cursor-not-allowed";

const secondaryBtnClass =
  "inline-flex h-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] px-5 text-sm text-gray-300 transition hover:bg-white/[0.07] disabled:opacity-60 disabled:cursor-not-allowed";

const ROLE_LABELS = {
  seeker: "Job Seeker",
  recruiter: "Recruiter",
  admin: "Admin",
};

const SETTINGS_ROUTES = {
  seeker: "/dashboard/seeker/settings",
  recruiter: "/dashboard/recruiter/settings",
  admin: "/dashboard/admin/settings",
};

const SUBTITLES = {
  seeker:
    "Manage your personal information, skills, resume and password.",
  recruiter:
    "Manage your personal information, photo and password.",
  admin: "Manage your administrator account information.",
};

const Alert = ({ type, children }) => (
  <div
    role={type === "success" ? "status" : "alert"}
    className={
      type === "success"
        ? "rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
        : "rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
    }
  >
    {children}
  </div>
);

const Card = ({ title, description, children }) => (
  <section className="rounded-2xl border border-white/[0.09] bg-[#111218]/80 p-5 backdrop-blur-2xl sm:p-6">
    <h2 className="text-base font-semibold text-white">{title}</h2>
    {description && (
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    )}
    {children}
  </section>
);

const getInitials = (name) =>
  name
    ?.split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

const formatSize = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const readJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

/** Downscales the chosen photo in the browser so uploads stay small. */
const processImageFile = (file, maxSize = 512) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      try {
        let width = img.naturalWidth;
        let height = img.naturalHeight;

        if (!width || !height) {
          reject(new Error("That image could not be read."));
          return;
        }

        if (width > maxSize || height > maxSize) {
          const scale = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        let dataUrl = canvas.toDataURL("image/jpeg", 0.85);

        // Stay comfortably under the server's 1 MB limit.
        if ((dataUrl.length * 3) / 4 > 900 * 1024) {
          dataUrl = canvas.toDataURL("image/jpeg", 0.6);
        }

        resolve(dataUrl);
      } catch {
        reject(new Error("Unable to process the selected image."));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("That file could not be read as an image."));
    };

    img.src = objectUrl;
  });

const ProfileSettings = ({ role }) => {
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [info, setInfo] = useState({
    name: "",
    email: "",
    headline: "",
    bio: "",
  });
  const [infoState, setInfoState] = useState({
    saving: false,
    error: null,
    success: null,
  });

  const [skills, setSkills] = useState([]);
  const [skillDraft, setSkillDraft] = useState("");
  const [skillsState, setSkillsState] = useState({
    saving: false,
    error: null,
    success: null,
  });

  const [avatarState, setAvatarState] = useState({
    saving: false,
    error: null,
    success: null,
  });

  const [resumeState, setResumeState] = useState({
    saving: false,
    error: null,
    success: null,
  });

  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [passwordState, setPasswordState] = useState({
    saving: false,
    error: null,
    success: null,
  });

  const avatarInputRef = useRef(null);
  const resumeInputRef = useRef(null);
  const skillInputRef = useRef(null);

  const isSeeker = role === "seeker";

  const applyProfile = useCallback((user) => {
    setProfile(user);
    setInfo({
      name: user.name || "",
      email: user.email || "",
      headline: user.headline || "",
      bio: user.bio || "",
    });
    setSkills(Array.isArray(user.skills) ? user.skills : []);
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/profile", { cache: "no-store" });
      const data = await readJson(response);

      if (response.status === 401) {
        router.push("/sign-in");
        return;
      }

      if (!response.ok || !data.user) {
        throw new Error(data.error || "Unable to load your profile.");
      }

      applyProfile(data.user);
      setLoadError(null);
    } catch (err) {
      setLoadError(err?.message || "Unable to load your profile.");
    } finally {
      setLoading(false);
    }
  }, [applyProfile, router]);

  // Initial load — data fetching lives inside the effect body so setState
  // calls are not invoked synchronously from the effect itself.
  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setLoadError(null);

      try {
        const response = await fetch("/api/profile", { cache: "no-store" });
        const data = await readJson(response);

        if (!mounted) return;

        if (response.status === 401) {
          router.push("/sign-in");
          return;
        }

        if (!response.ok || !data.user) {
          throw new Error(data.error || "Unable to load your profile.");
        }

        applyProfile(data.user);
        setLoadError(null);
      } catch (err) {
        if (!mounted) return;
        setLoadError(err?.message || "Unable to load your profile.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [applyProfile, router]);

  // Manual retry (event handler — safe to set state synchronously).
  const loadProfile = () => {
    setLoading(true);
    setLoadError(null);
    fetchProfile();
  };

  // Role-aware guard: never render another role's settings page.
  useEffect(() => {
    if (!profile) return;

    const target = SETTINGS_ROUTES[profile.role] || SETTINGS_ROUTES.seeker;

    if (profile.role !== role) {
      router.replace(target);
    }
  }, [profile, role, router]);

  const resetInfo = () => {
    setInfo({
      name: profile?.name || "",
      email: profile?.email || "",
      headline: profile?.headline || "",
      bio: profile?.bio || "",
    });
    setInfoState({ saving: false, error: null, success: null });
  };

  const saveInfo = async (event) => {
    event.preventDefault();

    const name = info.name.trim();
    const email = info.email.trim();
    const errors = [];

    if (name.length < 2 || name.length > 80) {
      errors.push("Name must be between 2 and 80 characters.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      errors.push("Enter a valid email address.");
    }

    if (isSeeker) {
      if (info.headline.trim().length > 160) {
        errors.push("Headline must be 160 characters or fewer.");
      }
      if (info.bio.trim().length > 600) {
        errors.push("Bio must be 600 characters or fewer.");
      }
    }

    if (errors.length) {
      setInfoState({ saving: false, error: errors.join(" "), success: null });
      return;
    }

    setInfoState({ saving: true, error: null, success: null });

    const payload = isSeeker
      ? {
          name,
          email,
          headline: info.headline.trim(),
          bio: info.bio.trim(),
        }
      : { name, email };

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(data.error || "Unable to save your changes.");
      }

      applyProfile(data.user);
      setInfoState({
        saving: false,
        error: null,
        success: "Profile updated successfully.",
      });
    } catch (err) {
      setInfoState({
        saving: false,
        error: err?.message || "Unable to save your changes.",
        success: null,
      });
    }
  };

  const resetSkills = () => {
    setSkills(Array.isArray(profile?.skills) ? profile.skills : []);
    setSkillDraft("");
    setSkillsState({ saving: false, error: null, success: null });
  };

  const addSkill = () => {
    const skill = skillDraft.trim().replace(/\s+/g, " ");

    if (!skill) return;

    if (skill.length > 40) {
      setSkillsState((prev) => ({
        ...prev,
        error: "Each skill must be 40 characters or fewer.",
        success: null,
      }));
      return;
    }

    if (skills.some((item) => item.toLowerCase() === skill.toLowerCase())) {
      setSkillsState((prev) => ({
        ...prev,
        error: "That skill is already on your list.",
        success: null,
      }));
      return;
    }

    if (skills.length >= 30) {
      setSkillsState((prev) => ({
        ...prev,
        error: "You can save up to 30 skills.",
        success: null,
      }));
      return;
    }

    setSkills((prev) => [...prev, skill]);
    setSkillDraft("");
    setSkillsState((prev) => ({ ...prev, error: null, success: null }));
    skillInputRef.current?.focus();
  };

  const removeSkill = (index) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
    setSkillsState((prev) => ({ ...prev, error: null, success: null }));
  };

  const editSkill = (index) => {
    setSkillDraft(skills[index]);
    setSkills((prev) => prev.filter((_, i) => i !== index));
    setSkillsState((prev) => ({ ...prev, error: null, success: null }));
    skillInputRef.current?.focus();
  };

  const saveSkills = async (event) => {
    event.preventDefault();
    setSkillsState({ saving: true, error: null, success: null });

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills }),
      });

      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(data.error || "Unable to save your skills.");
      }

      applyProfile(data.user);
      setSkillsState({
        saving: false,
        error: null,
        success: "Skills updated successfully.",
      });
    } catch (err) {
      setSkillsState({
        saving: false,
        error: err?.message || "Unable to save your skills.",
        success: null,
      });
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setAvatarState({ saving: true, error: null, success: null });

    try {
      if (!/^image\/(jpeg|png|webp|gif)$/i.test(file.type)) {
        throw new Error("Choose a JPG, PNG, WebP or GIF image.");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image must be 5 MB or smaller.");
      }

      const dataUrl = await processImageFile(file);

      const form = new FormData();
      form.append("image", dataUrl);

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: form,
      });

      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(data.error || "Unable to update your photo.");
      }

      applyProfile(data.user);
      setAvatarState({
        saving: false,
        error: null,
        success: "Profile photo updated.",
      });
    } catch (err) {
      setAvatarState({
        saving: false,
        error: err?.message || "Unable to update your photo.",
        success: null,
      });
    }
  };

  const removeAvatar = async () => {
    setAvatarState({ saving: true, error: null, success: null });

    try {
      const response = await fetch("/api/profile/avatar", {
        method: "DELETE",
      });

      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(data.error || "Unable to remove your photo.");
      }

      applyProfile(data.user);
      setAvatarState({
        saving: false,
        error: null,
        success: "Profile photo removed.",
      });
    } catch (err) {
      setAvatarState({
        saving: false,
        error: err?.message || "Unable to remove your photo.",
        success: null,
      });
    }
  };

  const handleResumeChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!/\.pdf$/i.test(file.name)) {
      setResumeState({
        saving: false,
        error: "Resume must be a PDF file.",
        success: null,
      });
      return;
    }

    if (file.type && file.type !== "application/pdf") {
      setResumeState({
        saving: false,
        error: "Resume must be a PDF file.",
        success: null,
      });
      return;
    }

    if (file.size === 0) {
      setResumeState({
        saving: false,
        error: "The selected file is empty.",
        success: null,
      });
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setResumeState({
        saving: false,
        error: "Resume must be 4 MB or smaller.",
        success: null,
      });
      return;
    }

    setResumeState({ saving: true, error: null, success: null });

    try {
      const form = new FormData();
      form.append("resume", file);

      const response = await fetch("/api/profile/resume", {
        method: "POST",
        body: form,
      });

      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(data.error || "Unable to upload your resume.");
      }

      applyProfile(data.user);
      setResumeState({
        saving: false,
        error: null,
        success: "Resume uploaded successfully.",
      });
    } catch (err) {
      setResumeState({
        saving: false,
        error: err?.message || "Unable to upload your resume.",
        success: null,
      });
    }
  };

  const removeResume = async () => {
    setResumeState({ saving: true, error: null, success: null });

    try {
      const response = await fetch("/api/profile/resume", {
        method: "DELETE",
      });

      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(data.error || "Unable to remove your resume.");
      }

      applyProfile(data.user);
      setResumeState({
        saving: false,
        error: null,
        success: "Resume removed.",
      });
    } catch (err) {
      setResumeState({
        saving: false,
        error: err?.message || "Unable to remove your resume.",
        success: null,
      });
    }
  };

  const resetPasswords = () => {
    setPasswords({ current: "", next: "", confirm: "" });
    setPasswordState({ saving: false, error: null, success: null });
  };

  const savePassword = async (event) => {
    event.preventDefault();

    if (!passwords.current) {
      setPasswordState({
        saving: false,
        error: "Enter your current password.",
        success: null,
      });
      return;
    }

    if (passwords.next.length < 8) {
      setPasswordState({
        saving: false,
        error: "New password must be at least 8 characters.",
        success: null,
      });
      return;
    }

    if (passwords.next !== passwords.confirm) {
      setPasswordState({
        saving: false,
        error: "New passwords do not match.",
        success: null,
      });
      return;
    }

    if (passwords.next === passwords.current) {
      setPasswordState({
        saving: false,
        error: "New password must be different from your current password.",
        success: null,
      });
      return;
    }

    setPasswordState({ saving: true, error: null, success: null });

    try {
      const response = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.next,
        }),
      });

      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(data.error || "Unable to update your password.");
      }

      setPasswords({ current: "", next: "", confirm: "" });
      setPasswordState({
        saving: false,
        error: null,
        success: "Password updated successfully.",
      });
    } catch (err) {
      setPasswordState({
        saving: false,
        error: err?.message || "Unable to update your password.",
        success: null,
      });
    }
  };

  const companyName =
    typeof profile?.company === "string"
      ? profile.company
      : profile?.company?.name || "";

  const page = (content) => (
    <main className="flex-1 bg-[#08090d] text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Profile settings
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {SUBTITLES[role] || SUBTITLES.seeker}
          </p>
        </div>
        {content}
      </div>
    </main>
  );

  if (loading || !profile || profile.role !== role) {
    return page(<ProfileSkeleton />);
  }

  if (loadError) {
    return page(
      <div className="rounded-2xl border border-white/[0.09] bg-[#111218]/80 p-6 backdrop-blur-2xl">
        <Alert type="error">{loadError}</Alert>
        <div className="mt-4 flex justify-center">
          <button type="button" onClick={loadProfile} className={primaryBtnClass}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  return page(
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left column — photo, identity and role */}
      <div className="space-y-6">
        <Card title="Profile photo">
          {avatarState.error && (
            <div className="mt-4">
              <Alert type="error">{avatarState.error}</Alert>
            </div>
          )}
          {avatarState.success && (
            <div className="mt-4">
              <Alert type="success">{avatarState.success}</Alert>
            </div>
          )}

          <div className="mt-5 flex items-center gap-4">
            {profile.image ? (
              <Image
                src={profile.image}
                alt={profile.name || "Profile photo"}
                width={96}
                height={96}
                className="h-24 w-24 rounded-full border border-white/10 object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-indigo-500 text-2xl font-bold text-white">
                {getInitials(profile.name)}
              </div>
            )}

            <div className="flex min-w-0 flex-col gap-2">
              <p className="truncate text-base font-semibold text-white">
                {profile.name}
              </p>
              <p className="truncate text-sm text-gray-500">
                {profile.email}
              </p>
              <span className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-neutral-300">
                {ROLE_LABELS[profile.role] || profile.role}
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarState.saving}
              className={primaryBtnClass}
            >
              {avatarState.saving ? "Uploading..." : "Change photo"}
            </button>

            {profile.image && (
              <button
                type="button"
                onClick={removeAvatar}
                disabled={avatarState.saving}
                className={secondaryBtnClass}
              >
                Remove
              </button>
            )}
          </div>

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </Card>

        {/* Linked company — recruiter only */}
        {role === "recruiter" && (
          <Card
            title="Company"
            description="Your company profile is linked to your recruiter account."
          >
            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Linked company
              </p>
              <p className="mt-1.5 truncate text-sm text-white">
                {companyName || "No company linked yet."}
              </p>
            </div>

            <div className="mt-5 flex justify-end">
              <Link
                href="/dashboard/recruiter"
                className={primaryBtnClass}
              >
                Dashboard
              </Link>
            </div>
          </Card>
        )}
      </div>

      {/* Right column — editable forms */}
      <div className="space-y-6 lg:col-span-2">
        {/* Personal information */}
        <form onSubmit={saveInfo}>
          <Card
            title="Personal information"
            description="Update the name and email shown on your account."
          >
            {infoState.error && (
              <div className="mt-4">
                <Alert type="error">{infoState.error}</Alert>
              </div>
            )}
            {infoState.success && (
              <div className="mt-4">
                <Alert type="success">{infoState.success}</Alert>
              </div>
            )}

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="profile-name" className={labelClass}>
                  Full Name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={info.name}
                  onChange={(e) =>
                    setInfo((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  minLength={2}
                  maxLength={80}
                  autoComplete="name"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="profile-email" className={labelClass}>
                  Email Address
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={info.email}
                  onChange={(e) =>
                    setInfo((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                  maxLength={254}
                  autoComplete="email"
                  className={inputClass}
                />
              </div>

              {isSeeker && (
                <>
                  <div>
                    <label htmlFor="profile-headline" className={labelClass}>
                      Professional Headline
                    </label>
                    <input
                      id="profile-headline"
                      type="text"
                      value={info.headline}
                      onChange={(e) =>
                        setInfo((prev) => ({
                          ...prev,
                          headline: e.target.value,
                        }))
                      }
                      maxLength={160}
                      placeholder="Senior Frontend Developer"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="profile-bio" className={labelClass}>
                      Short Bio
                    </label>
                    <textarea
                      id="profile-bio"
                      rows={4}
                      value={info.bio}
                      onChange={(e) =>
                        setInfo((prev) => ({ ...prev, bio: e.target.value }))
                      }
                      maxLength={600}
                      placeholder="A short summary of your experience and what you are looking for."
                      className={textareaClass}
                    />
                    <p className="mt-1.5 text-right text-xs text-gray-600">
                      {info.bio.length}/600
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={resetInfo}
                disabled={infoState.saving}
                className={secondaryBtnClass}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={infoState.saving}
                className={primaryBtnClass}
              >
                {infoState.saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </Card>
        </form>

        {/* Skills — seeker only */}
        {isSeeker && (
          <form onSubmit={saveSkills}>
            <Card
              title="Skills"
              description="Add, edit or remove the skills shown on your profile."
            >
              {skillsState.error && (
                <div className="mt-4">
                  <Alert type="error">{skillsState.error}</Alert>
                </div>
              )}
              {skillsState.success && (
                <div className="mt-4">
                  <Alert type="success">{skillsState.success}</Alert>
                </div>
              )}

              <div className="mt-5">
                {skills.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <li
                        key={`${skill}-${index}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5"
                      >
                        <button
                          type="button"
                          onClick={() => editSkill(index)}
                          title="Edit this skill"
                          className="text-sm text-neutral-300 transition hover:text-white"
                        >
                          {skill}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          aria-label={`Remove ${skill}`}
                          className="text-base leading-none text-neutral-500 transition hover:text-red-400"
                        >
                          &times;
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600">
                    No skills added yet.
                  </p>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  ref={skillInputRef}
                  type="text"
                  value={skillDraft}
                  onChange={(e) => setSkillDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  maxLength={40}
                  placeholder="e.g. React"
                  aria-label="New skill"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="shrink-0 rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-gray-300 transition hover:bg-white/[0.07]"
                >
                  Add
                </button>
              </div>

              <p className="mt-2 text-xs text-gray-600">
                Click a skill to edit it. {skills.length}/30 skills.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetSkills}
                  disabled={skillsState.saving}
                  className={secondaryBtnClass}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={skillsState.saving}
                  className={primaryBtnClass}
                >
                  {skillsState.saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </Card>
          </form>
        )}

        {/* Resume — seeker only */}
        {isSeeker && (
          <Card
            title="Resume"
            description="Upload a PDF resume employers can download."
          >
            {resumeState.error && (
              <div className="mt-4">
                <Alert type="error">{resumeState.error}</Alert>
              </div>
            )}
            {resumeState.success && (
              <div className="mt-4">
                <Alert type="success">{resumeState.success}</Alert>
              </div>
            )}

            {profile.resume ? (
              <div className="mt-5 flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {profile.resume.name}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatSize(profile.resume.size)}
                    {profile.resume.uploadedAt
                      ? ` · Uploaded ${formatDate(profile.resume.uploadedAt)}`
                      : ""}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <a
                    href="/api/profile/resume"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-gray-300 transition hover:bg-white/[0.07]"
                  >
                    View
                  </a>
                  <a
                    href="/api/profile/resume?download=1"
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] px-4 text-sm text-gray-300 transition hover:bg-white/[0.07]"
                  >
                    Download
                  </a>
                  <button
                    type="button"
                    onClick={removeResume}
                    disabled={resumeState.saving}
                    className="inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-60"
                  >
                    {resumeState.saving ? "Working..." : "Remove"}
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm text-gray-500">
                No resume uploaded yet.
              </p>
            )}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => resumeInputRef.current?.click()}
                disabled={resumeState.saving}
                className={secondaryBtnClass}
              >
                {resumeState.saving
                  ? "Uploading..."
                  : profile.resume
                    ? "Replace PDF"
                    : "Upload PDF"}
              </button>

              <input
                ref={resumeInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={handleResumeChange}
              />
            </div>
          </Card>
        )}

        {/* Password */}
        <form onSubmit={savePassword}>
          <Card
            title="Change password"
            description="Use a password of at least 8 characters."
          >
            {passwordState.error && (
              <div className="mt-4">
                <Alert type="error">{passwordState.error}</Alert>
              </div>
            )}
            {passwordState.success && (
              <div className="mt-4">
                <Alert type="success">{passwordState.success}</Alert>
              </div>
            )}

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="current-password" className={labelClass}>
                  Current Password
                </label>
                <input
                  id="current-password"
                  type="password"
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords((prev) => ({
                      ...prev,
                      current: e.target.value,
                    }))
                  }
                  required
                  autoComplete="current-password"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="new-password" className={labelClass}>
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={passwords.next}
                  onChange={(e) =>
                    setPasswords((prev) => ({ ...prev, next: e.target.value }))
                  }
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className={labelClass}>
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords((prev) => ({
                      ...prev,
                      confirm: e.target.value,
                    }))
                  }
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={resetPasswords}
                disabled={passwordState.saving}
                className={secondaryBtnClass}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={passwordState.saving}
                className={primaryBtnClass}
              >
                {passwordState.saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
