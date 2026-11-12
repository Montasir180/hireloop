import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("user_data");

export { client, db };

/**
 * Reads a request header from a better-auth endpoint context.
 * Works whether the context exposes getHeader(), a Request, or a headers map.
 */
function getRequestHeader(context, name) {
    if (!context) return null;

    if (typeof context.getHeader === "function") {
        const value = context.getHeader(name);
        if (value) return value;
    }

    const headers = context.request?.headers ?? context.headers;
    if (!headers) return null;

    if (typeof headers.get === "function") return headers.get(name);

    if (Array.isArray(headers)) {
        const match = headers.find(([key]) => String(key).toLowerCase() === name);
        return match ? match[1] : null;
    }

    if (typeof headers === "object") {
        for (const [key, value] of Object.entries(headers)) {
            if (String(key).toLowerCase() === name) return value;
        }
    }

    return null;
}

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,

    emailAndPassword: {
        enabled: true,
    },

    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "seeker",
                input: true,
            },
            headline: {
                type: "string",
                required: false,
                defaultValue: "",
                input: true,
            },
            bio: {
                type: "string",
                required: false,
                defaultValue: "",
                input: true,
            },
            skills: {
                type: "string[]",
                required: false,
                defaultValue: [],
                input: true,
            },
        },
    },

    databaseHooks: {
        user: {
            create: {
                // Public registration may never create an admin account.
                // An admin can only be created with the secret admin code,
                // which is validated server-side against ADMIN_SIGNUP_CODE.
                before: async (user, context) => {
                    if (user?.role !== "admin") return;

                    const providedCode =
                        (typeof context?.body?.adminCode === "string"
                            ? context.body.adminCode
                            : null) ||
                        getRequestHeader(context, "x-admin-code");

                    const expectedCode = process.env.ADMIN_SIGNUP_CODE;

                    if (
                        !expectedCode ||
                        !providedCode ||
                        String(providedCode) !== expectedCode
                    ) {
                        throw new APIError("FORBIDDEN", {
                            message:
                                "Admin registration requires a valid admin code.",
                        });
                    }
                },
            },
        },
    },

    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
    },

    database: mongodbAdapter(db, {
        client,
    }),
});
