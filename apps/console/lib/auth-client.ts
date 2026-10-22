import { passkeyClient } from "@better-auth/passkey/client";
import { createAuthClient } from "better-auth/react";

/** The console's Better Auth client: passkeys only, through the console's /api proxy. */
export const authClient = createAuthClient({
  basePath: "/api/console/auth",
  plugins: [passkeyClient()],
});
