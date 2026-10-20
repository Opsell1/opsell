import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

/** Better Auth's browser client, calling the API through the web app's /api proxy. */
export const authClient = createAuthClient({
  basePath: "/api/auth",
  plugins: [emailOTPClient()],
});
