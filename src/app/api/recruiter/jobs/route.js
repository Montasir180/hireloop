import { getSessionUser, json } from "@/lib/profile";
import { getJobsCollection, validateJobInput } from "@/lib/recruiter-jobs";

/**
 * POST /api/recruiter/jobs
 * Publishes a new job listing for the signed-in recruiter.
 */
export async function POST(request) {
    const user = await getSessionUser(request);

    if (!user) {
        return json(401, { message: "You must be signed in." });
    }

    if ((user.role || "seeker") !== "recruiter") {
        return json(403, {
            message: "Only recruiters can publish jobs.",
        });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return json(400, { message: "Invalid request body." });
    }

    const { job, error } = validateJobInput(body, user);

    if (error) {
        return json(400, { message: error });
    }

    try {
        const result = await getJobsCollection().insertOne(job);

        return json(201, {
            message: "Job published successfully.",
            job: { _id: result.insertedId, ...job },
        });
    } catch (dbError) {
        console.error("Failed to publish job:", dbError);

        return json(500, {
            message: "Unable to publish job right now. Please try again.",
        });
    }
}

/**
 * GET /api/recruiter/jobs
 * Lists the signed-in recruiter's own job postings, newest first.
 */
export async function GET(request) {
    const user = await getSessionUser(request);

    if (!user) {
        return json(401, { message: "You must be signed in." });
    }

    if ((user.role || "seeker") !== "recruiter") {
        return json(403, { message: "Only recruiters can view jobs." });
    }

    try {
        const jobs = await getJobsCollection()
            .find({ recruiterId: String(user.id) })
            .sort({ createdAt: -1 })
            .toArray();

        return json(200, { jobs });
    } catch (dbError) {
        console.error("Failed to load jobs:", dbError);

        return json(500, { message: "Unable to load jobs right now." });
    }
}
