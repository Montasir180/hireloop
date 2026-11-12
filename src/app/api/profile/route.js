import { auth, db } from "@/lib/auth";
import {
    escapeRegex,
    getProfileUser,
    json,
    toMongoId,
} from "@/lib/profile";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 80;
const MAX_HEADLINE_LENGTH = 160;
const MAX_BIO_LENGTH = 600;
const MAX_SKILLS = 30;
const MAX_SKILL_LENGTH = 40;

const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

function normalizeSkills(input) {
    if (!Array.isArray(input)) {
        return { error: "Skills must be a list." };
    }

    if (input.length > MAX_SKILLS) {
        return { error: `You can save up to ${MAX_SKILLS} skills.` };
    }

    const skills = [];
    const seen = new Set();

    for (const raw of input) {
        if (typeof raw !== "string") {
            return { error: "Each skill must be text." };
        }

        const skill = raw.trim().replace(/\s+/g, " ");
        if (!skill) continue;

        if (skill.length > MAX_SKILL_LENGTH) {
            return {
                error: `Each skill must be ${MAX_SKILL_LENGTH} characters or fewer.`,
            };
        }

        const key = skill.toLowerCase();
        if (seen.has(key)) continue;

        seen.add(key);
        skills.push(skill);
    }

    return { skills };
}

export async function GET(request) {
    const user = await getProfileUser(request);

    if (!user) {
        return json(401, { error: "You must be signed in." });
    }

    return json(200, { user });
}

export async function PATCH(request) {
    const user = await getProfileUser(request);

    if (!user) {
        return json(401, { error: "You must be signed in." });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return json(400, { error: "Invalid request body." });
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return json(400, { error: "Invalid request body." });
    }

    // Users can never change their own role through the profile API.
    if (has(body, "role")) {
        return json(400, { error: "Your account role cannot be changed." });
    }

    const errors = [];
    const authUpdates = {};
    let emailToUpdate = null;

    if (has(body, "name")) {
        const name =
            typeof body.name === "string" ? body.name.trim() : "";

        if (name.length < 2 || name.length > MAX_NAME_LENGTH) {
            errors.push(
                `Name must be between 2 and ${MAX_NAME_LENGTH} characters.`
            );
        } else {
            authUpdates.name = name;
        }
    }

    if (has(body, "email")) {
        const email =
            typeof body.email === "string"
                ? body.email.trim().toLowerCase()
                : "";

        if (!EMAIL_REGEX.test(email) || email.length > 254) {
            errors.push("Enter a valid email address.");
        } else if (email !== String(user.email || "").toLowerCase()) {
            emailToUpdate = email;
        }
    }

    // Headline, bio and skills are seeker-only profile fields.
    const isSeeker = (user.role || "seeker") === "seeker";

    if (isSeeker) {
        if (has(body, "headline")) {
            const headline =
                typeof body.headline === "string"
                    ? body.headline.trim()
                    : "";

            if (headline.length > MAX_HEADLINE_LENGTH) {
                errors.push(
                    `Headline must be ${MAX_HEADLINE_LENGTH} characters or fewer.`
                );
            } else {
                authUpdates.headline = headline;
            }
        }

        if (has(body, "bio")) {
            const bio = typeof body.bio === "string" ? body.bio.trim() : "";

            if (bio.length > MAX_BIO_LENGTH) {
                errors.push(
                    `Bio must be ${MAX_BIO_LENGTH} characters or fewer.`
                );
            } else {
                authUpdates.bio = bio;
            }
        }

        if (has(body, "skills")) {
            const result = normalizeSkills(body.skills);

            if (result.error) {
                errors.push(result.error);
            } else {
                authUpdates.skills = result.skills;
            }
        }
    }

    if (errors.length) {
        return json(400, { error: errors.join(" ") });
    }

    const hasAuthUpdates = Object.keys(authUpdates).length > 0;

    if (!hasAuthUpdates && !emailToUpdate) {
        return json(400, { error: "No fields to update." });
    }

    if (emailToUpdate) {
        const existing = await db.collection("user").findOne({
            _id: { $ne: toMongoId(user.id) },
            email: {
                $regex: `^${escapeRegex(emailToUpdate)}$`,
                $options: "i",
            },
        });

        if (existing) {
            return json(409, {
                error: "That email address is already in use.",
            });
        }
    }

    if (hasAuthUpdates) {
        try {
            // Reuse better-auth's own update endpoint so the session and
            // stored user record stay consistent.
            await auth.api.updateUser({
                body: authUpdates,
                headers: request.headers,
            });
        } catch (err) {
            return json(
                err?.status && err.status >= 400 && err.status < 500
                    ? err.status
                    : 400,
                { error: err?.body?.message || "Unable to update profile." }
            );
        }
    }

    if (emailToUpdate) {
        // better-auth looks sign-in up by the user record's email, so it is
        // updated directly here (its built-in endpoint refuses email changes).
        await db.collection("user").updateOne(
            { _id: toMongoId(user.id) },
            { $set: { email: emailToUpdate, emailVerified: false } }
        );
    }

    const refreshed = await getProfileUser(request);

    return json(200, { user: refreshed });
}
