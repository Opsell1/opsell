"use client";

import { createConsoleClient, MAX_SEED } from "@opsell/contract";
import { Button, ErrorAlert, Field, Input } from "@opsell/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

const api = createConsoleClient({ baseUrl: "/api/console" });

export function NewDemoOrganizationForm({ suggestedSeed }: { suggestedSeed: number }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [seed, setSeed] = useState(String(suggestedSeed));
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFailure(null);
    setPending(true);
    const { data, response } = await api.POST("/demo-organizations", {
      body: { name: name.trim(), seed: Number(seed) },
    });
    if (response.status === 401) {
      router.replace("/sign-in");
      return;
    }
    if (!data) {
      setFailure(
        response.status === 400
          ? "Check the name and the seed, then try again."
          : "Something went wrong on our side. Try again in a moment.",
      );
      setPending(false);
      return;
    }
    router.push(`/demo-organizations/${data.id}`);
  }

  return (
    <form
      onSubmit={submit}
      className="grid max-w-[480px] gap-5 rounded-lg border border-border-default bg-surface-card p-6 shadow-elev-card"
    >
      {failure ? (
        <ErrorAlert title="The Demo Organization was not created">
          <span>{failure}</span>
        </ErrorAlert>
      ) : null}
      <Field label="Name" htmlFor="name" help="Who the demo is for, for example the prospect.">
        <Input
          id="name"
          name="name"
          required
          maxLength={80}
          autoFocus
          autoComplete="off"
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-describedby="name-help"
        />
      </Field>
      <Field
        label="Seed"
        htmlFor="seed"
        help="The same seed always produces the same Locations, people, sales, hours and tips."
      >
        <Input
          id="seed"
          name="seed"
          type="number"
          inputMode="numeric"
          required
          min={0}
          max={MAX_SEED}
          step={1}
          value={seed}
          onChange={(event) => setSeed(event.target.value)}
          className="font-mono"
          aria-describedby="seed-help"
        />
      </Field>
      <p className="m-0 text-[13px] text-text-secondary leading-[18px]">
        A Demo Organization holds only fictional people and operations, and stays one forever.
      </p>
      <div className="flex items-center gap-2">
        <Button type="submit" variant="primary" aria-busy={pending || undefined}>
          {pending ? "Creating…" : "Create Demo Organization"}
        </Button>
        <Button asChild variant="ghost">
          <Link href="/demo-organizations">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
