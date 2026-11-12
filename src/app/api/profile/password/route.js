import { auth } from "@/lib/auth";
import { getSessionUser, json } from "@/lib/profile";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

export async function POST(request) {
    const user = await getSessionUser(request);

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

    const currentPassword =
        typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword =
        typeof body.newPassword === "string" ? body.newPassword : "";

    if (!currentPassword) {
        return json(400, { error: "Enter your current password." });
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
        return json(400, {
            error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
        });
    }

    if (newPassword.length > MAX_PASSWORD_LENGTH) {
        return json(400, {
            error: `New password must be ${MAX_PASSWORD_LENGTH} characters or fewer.`,
        });
    }

    if (newPassword === currentPassword) {
        return json(400, {
            error: "New password must be different from your current password.",
        });
    }

    try {
        // Reuse better-auth's password change endpoint.
        await auth.api.changePassword({
            body: { currentPassword, newPassword },
            headers: request.headers,
        });
    } catch (err) {
        const code = err?.body?.code;
        const message = err?.body?.message || err?.message || "";

        if (code === "INVALID_PASSWORD" || /invalid password/i.test(message)) {
            return json(400, { error: "Current password is incorrect." });
        }

        if (code === "CREDENTIAL_ACCOUNT_NOT_FOUND") {
            return json(400, {
                error: "This account has no password set.",
            });
        }

        const status =
            typeof err?.status === "number" &&
            err.status >= 400 &&
            err.status < 500
                ? err.status
                : 400;

        return json(status, {
            error: message || "Unable to update password.",
        });
    }

    return json(200, { status: "ok" });
}
