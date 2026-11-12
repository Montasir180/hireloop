import { db } from "@/lib/auth";
import { getProfileUser, json, toMongoId } from "@/lib/profile";

const MAX_RESUME_BYTES = 4 * 1024 * 1024; // 4 MB
const RESUME_COLLECTION = "resumes";

function safeFileName(name) {
    const cleaned = String(name || "resume.pdf")
        .replace(/[\u0000-\u001f\u007f]/g, "")
        .replace(/[\\/]/g, "_")
        .trim()
        .slice(0, 120);

    return /\.pdf$/i.test(cleaned) ? cleaned : `${cleaned || "resume"}.pdf`;
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

    const file = form.get("resume");

    if (!file || typeof file.arrayBuffer !== "function") {
        return json(400, { error: "Choose a PDF file to upload." });
    }

    if (file.size === 0) {
        return json(400, { error: "The selected file is empty." });
    }

    if (file.size > MAX_RESUME_BYTES) {
        return json(400, { error: "Resume must be 4 MB or smaller." });
    }

    const fileName = safeFileName(file.name);

    if (!/\.pdf$/i.test(fileName)) {
        return json(400, { error: "Resume must be a PDF file." });
    }

    const declaredType = String(file.type || "").toLowerCase();

    if (declaredType && declaredType !== "application/pdf") {
        return json(400, { error: "Resume must be a PDF file." });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (buffer.length > MAX_RESUME_BYTES) {
        return json(400, { error: "Resume must be 4 MB or smaller." });
    }

    // Real PDFs start with the %PDF- header — extension and MIME type
    // are not trusted on their own.
    if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
        return json(400, {
            error: "The selected file is not a valid PDF document.",
        });
    }

    const now = new Date();
    const resume = {
        name: fileName,
        size: buffer.length,
        uploadedAt: now.toISOString(),
    };

    const dataUrl = `data:application/pdf;base64,${buffer.toString("base64")}`;

    await db.collection(RESUME_COLLECTION).updateOne(
        { _id: toMongoId(user.id) },
        {
            $set: {
                name: fileName,
                type: "application/pdf",
                data: dataUrl,
                updatedAt: now,
            },
        },
        { upsert: true }
    );

    await db.collection("user").updateOne(
        { _id: toMongoId(user.id) },
        { $set: { resume } }
    );

    const refreshed = await getProfileUser(request);

    return json(200, { user: refreshed, resume });
}

export async function DELETE(request) {
    const user = await getProfileUser(request);

    if (!user) {
        return json(401, { error: "You must be signed in." });
    }

    await db.collection(RESUME_COLLECTION).deleteOne({
        _id: toMongoId(user.id),
    });

    await db.collection("user").updateOne(
        { _id: toMongoId(user.id) },
        { $unset: { resume: "" } }
    );

    const refreshed = await getProfileUser(request);

    return json(200, { user: refreshed });
}

/**
 * Streams the signed-in user's resume back as a PDF.
 * Only the owner can read it — there is no public resume URL.
 */
export async function GET(request) {
    const user = await getProfileUser(request);

    if (!user) {
        return Response.redirect(new URL("/sign-in", request.url), 302);
    }

    const doc = await db.collection(RESUME_COLLECTION).findOne({
        _id: toMongoId(user.id),
    });

    if (!doc?.data || !doc.data.includes(",")) {
        return new Response("No resume on file.", { status: 404 });
    }

    const base64 = doc.data.slice(doc.data.indexOf(",") + 1);
    const buffer = Buffer.from(base64, "base64");

    if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
        return new Response("Resume is unavailable.", { status: 404 });
    }

    const download =
        new URL(request.url).searchParams.get("download") === "1";
    const fileName = safeFileName(doc.name);

    return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
            "Content-Type": "application/pdf",
            "Content-Length": String(buffer.length),
            "Content-Disposition":
                `${download ? "attachment" : "inline"}; ` +
                `filename="${encodeURIComponent(fileName)}"`,
            "Cache-Control": "private, no-store",
        },
    });
}
