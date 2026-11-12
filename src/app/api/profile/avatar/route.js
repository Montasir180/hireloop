import { auth } from "@/lib/auth";
import { getProfileUser, json } from "@/lib/profile";

const MAX_IMAGE_BYTES = 1024 * 1024; // 1 MB

const DATA_URL_REGEX =
    /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=\s]+)$/;

function hasValidSignature(buffer, mime) {
    if (buffer.length < 12) return false;

    switch (mime) {
        case "image/jpeg":
            return (
                buffer[0] === 0xff &&
                buffer[1] === 0xd8 &&
                buffer[2] === 0xff
            );
        case "image/png":
            return (
                buffer[0] === 0x89 &&
                buffer[1] === 0x50 &&
                buffer[2] === 0x4e &&
                buffer[3] === 0x47
            );
        case "image/gif":
            return (
                buffer.subarray(0, 6).toString("latin1") === "GIF87a" ||
                buffer.subarray(0, 6).toString("latin1") === "GIF89a"
            );
        case "image/webp":
            return (
                buffer.subarray(0, 4).toString("latin1") === "RIFF" &&
                buffer.subarray(8, 12).toString("latin1") === "WEBP"
            );
        default:
            return false;
    }
}

export async function POST(request) {
    const user = await getProfileUser(request);

    if (!user) {
        return json(401, { error: "You must be signed in." });
    }

    let form;
    try {
        form = await request.formData();
    } catch {
        return json(400, { error: "Invalid upload." });
    }

    const value = form.get("image");

    if (value === null || value === undefined || value === "") {
        return json(400, { error: "Choose an image to upload." });
    }

    let mime = null;
    let base64 = null;

    if (typeof value === "string") {
        const match = value.match(DATA_URL_REGEX);

        if (!match) {
            return json(400, {
                error: "Image must be a JPG, PNG, WebP or GIF file.",
            });
        }

        [, mime, base64] = match;
    } else if (typeof value.arrayBuffer === "function") {
        const type = String(value.type || "").toLowerCase();

        if (!/^image\/(jpeg|png|webp|gif)$/.test(type)) {
            return json(400, {
                error: "Image must be a JPG, PNG, WebP or GIF file.",
            });
        }

        if (value.size === 0) {
            return json(400, { error: "The selected image is empty." });
        }

        if (value.size > MAX_IMAGE_BYTES) {
            return json(400, {
                error: "Image must be 1 MB or smaller.",
            });
        }

        const buffer = Buffer.from(await value.arrayBuffer());

        mime = type === "image/jpg" ? "image/jpeg" : type;
        base64 = buffer.toString("base64");
    } else {
        return json(400, { error: "Invalid upload." });
    }

    const buffer = Buffer.from(base64, "base64");

    if (buffer.length === 0) {
        return json(400, { error: "The selected image is empty." });
    }

    if (buffer.length > MAX_IMAGE_BYTES) {
        return json(400, { error: "Image must be 1 MB or smaller." });
    }

    // Verify the bytes really are an image of the declared type.
    if (!hasValidSignature(buffer, mime)) {
        return json(400, {
            error: "The selected file is not a valid image.",
        });
    }

    const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;

    try {
        await auth.api.updateUser({
            body: { image: dataUrl },
            headers: request.headers,
        });
    } catch (err) {
        return json(400, {
            error: err?.body?.message || "Unable to update photo.",
        });
    }

    const refreshed = await getProfileUser(request);

    return json(200, { user: refreshed });
}

/** Removes the profile photo so the account falls back to initials. */
export async function DELETE(request) {
    const user = await getProfileUser(request);

    if (!user) {
        return json(401, { error: "You must be signed in." });
    }

    if (!user.image) {
        return json(400, { error: "You have no profile photo to remove." });
    }

    try {
        await auth.api.updateUser({
            body: { image: "" },
            headers: request.headers,
        });
    } catch (err) {
        return json(400, {
            error: err?.body?.message || "Unable to remove photo.",
        });
    }

    const refreshed = await getProfileUser(request);

    return json(200, { user: refreshed });
}
