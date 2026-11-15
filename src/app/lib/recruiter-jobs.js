import { client } from "@/lib/auth";

// ========================================
// RECRUITER JOBS DATABASE
// ========================================

// Job postings live in their own database, separate from better-auth's
// user_data, so recruiter listings can grow and be backed up independently.
const RECRUITER_DB_NAME = "recruiter_data";
const JOBS_COLLECTION = "jobs";

const JOB_TYPES = ["full-time", "part-time", "contract", "internship"];

const CATEGORIES = [
    "engineering",
    "design",
    "marketing",
    "business",
    "sales",
    "hr",
    "customer-support",
    "education",
    "other",
];

const SALARY_FREQUENCIES = [
    "per hour",
    "per day",
    "per week",
    "per month",
    "per year",
    "negotiable",
];

const MAX_TEXT_LENGTH = 5000;

let indexesReady = null;

/**
 * Returns the jobs collection, creating its indexes on first use.
 */
export function getJobsCollection() {
    const collection = client.db(RECRUITER_DB_NAME).collection(JOBS_COLLECTION);

    if (!indexesReady) {
        indexesReady = Promise.all([
            collection.createIndex({ recruiterId: 1, createdAt: -1 }),
            collection.createIndex({ status: 1, deadline: 1 }),
            collection.createIndex({ category: 1, jobType: 1 }),
        ]).catch((error) => {
            // Index creation must never block a job from being saved.
            console.error("Failed to ensure job indexes:", error);
        });
    }

    return collection;
}

function cleanText(value, { max = MAX_TEXT_LENGTH } = {}) {
    if (typeof value !== "string") return "";

    return value.trim().replace(/\s+/g, " ").slice(0, max);
}

function cleanParagraph(value) {
    if (typeof value !== "string") return "";

    // Keep line breaks so lists in the description stay readable.
    return value
        .replace(/\r\n/g, "\n")
        .replace(/[ \t]+\n/g, "\n")
        .trim()
        .slice(0, MAX_TEXT_LENGTH);
}

function parseNumber(value) {
    if (value === "" || value === null || value === undefined) return null;

    const number = Number(value);

    if (!Number.isFinite(number) || number < 0) return null;

    return number;
}

function parseDeadline(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return null;
    }

    const deadline = new Date(`${value}T23:59:59`);

    return Number.isNaN(deadline.getTime()) ? null : deadline;
}

/**
 * Validates the add-job form payload and normalizes it for storage.
 * Returns { job } on success or { error } with a user-facing message.
 */
export function validateJobInput(body, recruiter) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return { error: "Invalid request body." };
    }

    const title = cleanText(body.title, { max: 120 });
    const companyName = cleanText(body.companyName, { max: 120 });
    const category = cleanText(body.category, { max: 40 });
    const jobType = cleanText(body.jobType, { max: 40 });
    const location = cleanText(body.location, { max: 120 });
    const salaryFrequency = cleanText(body.salaryFrequency, { max: 40 });
    const responsibilities = cleanParagraph(body.responsibilities);
    const qualifications = cleanParagraph(body.qualifications);
    const isRemote = Boolean(body.isRemote);

    if (title.length < 3) {
        return { error: "Job title must be at least 3 characters." };
    }

    if (companyName.length < 2) {
        return { error: "Company name is required." };
    }

    if (!CATEGORIES.includes(category)) {
        return { error: "Choose a valid job category." };
    }

    if (!JOB_TYPES.includes(jobType)) {
        return { error: "Choose a valid job type." };
    }

    if (!isRemote && !location) {
        return { error: "Job location is required for on-site jobs." };
    }

    const deadline = parseDeadline(body.deadline);

    if (!deadline) {
        return { error: "Enter a valid application deadline." };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (deadline < today) {
        return { error: "The application deadline cannot be in the past." };
    }

    const minSalary = parseNumber(body.minSalary);
    const maxSalary = parseNumber(body.maxSalary);

    if (body.minSalary !== "" && minSalary === null) {
        return { error: "Minimum salary must be a positive number." };
    }

    if (body.maxSalary !== "" && maxSalary === null) {
        return { error: "Maximum salary must be a positive number." };
    }

    if (
        minSalary !== null &&
        maxSalary !== null &&
        minSalary > maxSalary
    ) {
        return { error: "Minimum salary cannot exceed maximum salary." };
    }

    if (!SALARY_FREQUENCIES.includes(salaryFrequency)) {
        return { error: "Choose a valid salary frequency." };
    }

    if (responsibilities.length < 10) {
        return { error: "Describe the key responsibilities of this job." };
    }

    if (qualifications.length < 10) {
        return { error: "List the qualifications for this job." };
    }

    const now = new Date();

    return {
        job: {
            title,
            companyName,
            category,
            jobType,
            isRemote,
            location: isRemote && !location ? "Remote" : location,
            deadline,
            salary: {
                min: minSalary,
                max: maxSalary,
                frequency: salaryFrequency,
            },
            responsibilities,
            qualifications,
            status: "active",
            recruiterId: String(recruiter.id),
            recruiterName: recruiter.name || "",
            recruiterEmail: recruiter.email || "",
            createdAt: now,
            updatedAt: now,
        },
    };
}
