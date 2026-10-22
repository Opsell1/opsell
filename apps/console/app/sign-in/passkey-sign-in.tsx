"use client";

import { Button, ErrorAlert } from "@opsell/ui";
import { KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function PasskeySignIn() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function signIn() {
    setFailed(false);
    setPending(true);
    const { error } = await authClient.signIn.passkey();
    if (error) {
      setFailed(true);
      setPending(false);
      return;
    }
    router.replace("/demo-organizations");
    router.refresh();
  }

  return (
    <div className="grid gap-4">
      <p className="m-0 text-[13px] text-text-secondary leading-[18px]">
        The console has no passwords or codes. Sign in with the passkey you created from your
        enrollment link.
      </p>
      {failed ? (
        <ErrorAlert title="That did not sign you in">
          <span>
            Try again with the passkey you enrolled. If you lost it, ask for a new enrollment link.
          </span>
        </ErrorAlert>
      ) : null}
      <Button variant="primary" size="lg" onClick={signIn} aria-busy={pending || undefined}>
        <KeyRound size={16} aria-hidden />
        {pending ? "Waiting for your passkey…" : "Sign in with a passkey"}
      </Button>
    </div>
  );
}
