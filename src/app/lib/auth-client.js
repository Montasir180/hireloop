import { createAuthClient } from "better-auth/react";

// Same domain as the app, so no baseURL needed —
// it automatically hits /api/auth on the current origin.
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
