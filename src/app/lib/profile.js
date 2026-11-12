import { ObjectId } from "mongodb";
import { auth, db } from "@/lib/auth";

/**
 * Returns the authenticated user for the incoming request, or null.
 * Reuses the existing better-auth session — never trusts client input.
 */
export async function getSessionUser(request) {
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        return session?.user ?? null;
    } catch {
        return null;
    }
}

/**
 * Strips everything sensitive out of a user record before it leaves the API.
 * Passwords and account/session documents are never part of the user record,
 * but this keeps the response to an explicit, role-safe allow-list.
 */
export function sanitizeUser(user) {
    if (!user) return null;

    return {
        id: user.id,
        name: user.name ?? "",
        email: user.email ?? "",
        emailVerified: Boolean(user.emailVerified),
        image: user.image ?? "",
        role: user.role || "seeker",
        headline: user.headline ?? "",
        bio: user.bio ?? "",
        skills: Array.isArray(user.skills) ? user.skills : [],
        resume: user.resume ?? null,
        company: user.company ?? null,
        createdAt: user.createdAt ?? null,
        updatedAt: user.updatedAt ?? null,
    };
}

export function json(status, data) {
    return Response.json(data, { status });
}

/**
 * Returns the sanitized profile for the request, including fields that live
 * on the user record but are not part of better-auth's session schema
 * (resume metadata, linked company).
 */
export async function getProfileUser(request) {
    const sessionUser = await getSessionUser(request);

    if (!sessionUser) return null;

    const safe = sanitizeUser(sessionUser);

    try {
        const doc = await db
            .collection("user")
            .findOne(
                { _id: toMongoId(sessionUser.id) },
                { projection: { resume: 1, company: 1 } }
            );

        safe.resume = doc?.resume ?? null;
        safe.company = doc?.company ?? null;
    } catch {
        // Keep the session values if the lookup fails.
    }

    return safe;
}

/**
 * Mirrors the MongoDB adapter's id handling: ids are stored as ObjectId
 * when they are valid ObjectId hex, otherwise as plain strings.
 */
export function toMongoId(id) {
    try {
        return new ObjectId(String(id));
    } catch {
        return id;
    }
}

export function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
