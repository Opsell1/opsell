"use client";

import { Button, Field, Input } from "@opsell/ui";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";

type Step = { name: "email" } | { name: "code"; email: string };

export function SignInForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>({ name: "email" });
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [resent, setResent] = useState(false);

  async function sendCode(to: string): Promise<boolean> {
    const { error } = await authClient.emailOtp.sendVerificationOtp({ email: to, type: "sign-in" });
    if (error) {
      setError(
        error.status === 429
          ? "Too many attempts. Wait a minute, then try again."
          : "We could not send a code. Check the address and try again.",
      );
      return false;
    }
    return true;
  }

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const to = email.trim();
    if (await sendCode(to)) {
      setCode("");
      setResent(false);
      setStep({ name: "code", email: to });
    }
    setPending(false);
  }

  async function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step.name !== "code") return;
    setError(null);
    setPending(true);
    const { error } = await authClient.signIn.emailOtp({ email: step.email, otp: code.trim() });
    if (error) {
      setError("That code did not work. Check it, or send a new one.");
      setPending(false);
      return;
    }
    router.replace("/locations");
    router.refresh();
  }

  async function resend() {
    if (step.name !== "code") return;
    setError(null);
    setResent(await sendCode(step.email));
  }

  if (step.name === "email") {
    return (
      <form className="grid gap-4" onSubmit={submitEmail} noValidate={false}>
        <p className="m-0 text-[13px] text-text-secondary leading-[18px]">
          Enter your work email and we will send you a 6-digit sign-in code.
        </p>
        <Field label="Email" htmlFor="email" error={error}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            autoFocus
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "email-error" : undefined}
          />
        </Field>
        <Button type="submit" variant="primary" size="lg" aria-busy={pending || undefined}>
          {pending ? "Sending code…" : "Send code"}
        </Button>
      </form>
    );
  }

  return (
    <form className="grid gap-4" onSubmit={submitCode}>
      <p className="m-0 text-[13px] text-text-secondary leading-[18px]">
        We sent a code to <b className="font-medium text-text-primary">{step.email}</b>. It expires
        in 10 minutes.
      </p>
      <Field
        label="Sign-in code"
        htmlFor="code"
        error={error}
        help={resent ? "We sent a new code." : undefined}
      >
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          autoFocus
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
          className="font-mono tracking-[0.3em]"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "code-error" : resent ? "code-help" : undefined}
        />
      </Field>
      <Button type="submit" variant="primary" size="lg" aria-busy={pending || undefined}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="-ml-2.5"
          onClick={() => {
            setError(null);
            setStep({ name: "email" });
          }}
        >
          Use a different email
        </Button>
        <Button type="button" variant="ghost" size="sm" className="-mr-2.5" onClick={resend}>
          Send a new code
        </Button>
      </div>
    </form>
  );
}
