"use client";

import { Button, ErrorAlert } from "@opsell/ui";
import { KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

type State =
  | { name: "reading" }
  | { name: "missing" }
  | { name: "ready"; token: string; failure: string | null }
  | { name: "creating"; token: string };

export function EnrollPasskey() {
  const router = useRouter();
  const [state, setState] = useState<State>({ name: "reading" });

  // The token is in the fragment, which only the browser sees. Opening a link from this page
  // changes only the fragment, so follow it as it changes.
  useEffect(() => {
    const read = () => {
      const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
      setState(token ? { name: "ready", token, failure: null } : { name: "missing" });
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  async function create(token: string) {
    setState({ name: "creating", token });
    const { error } = await authClient.passkey.addPasskey({
      context: token,
      createSession: true,
      name: "Opsell console",
    });
    if (error) {
      const cancelled = "code" in error && error.code === "ERROR_CEREMONY_ABORTED";
      setState({
        name: "ready",
        token,
        failure: cancelled
          ? "Creating the passkey was cancelled. Try again when you are ready."
          : "This enrollment link is invalid, used or expired. Ask for a new one.",
      });
      return;
    }
    // Drop the used token from the address bar and history before moving on.
    window.history.replaceState(null, "", "/enroll");
    router.replace("/demo-organizations");
    router.refresh();
  }

  if (state.name === "missing") {
    return (
      <div className="grid gap-4">
        <ErrorAlert title="This enrollment link is incomplete">
          <span>Open the full link you were sent, or ask for a new one.</span>
        </ErrorAlert>
        <Button asChild variant="ghost" size="sm" className="justify-self-start -ml-2.5">
          <Link href="/sign-in">I already have a passkey</Link>
        </Button>
      </div>
    );
  }

  const creating = state.name === "creating";
  return (
    <div className="grid gap-4">
      <p className="m-0 text-[13px] text-text-secondary leading-[18px]">
        Your passkey is how you sign in to the console from now on. Create it on your own device,
        never on a shared computer.
      </p>
      {state.name === "ready" && state.failure ? (
        <ErrorAlert title="No passkey was created">
          <span>{state.failure}</span>
        </ErrorAlert>
      ) : null}
      <Button
        variant="primary"
        size="lg"
        disabled={state.name === "reading"}
        aria-busy={creating || undefined}
        onClick={() => {
          if (state.name === "ready") void create(state.token);
        }}
      >
        <KeyRound size={16} aria-hidden />
        {creating ? "Waiting for your device…" : "Create passkey"}
      </Button>
    </div>
  );
}
