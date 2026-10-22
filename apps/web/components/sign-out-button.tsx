"use client";

import { Button, type ButtonProps } from "@opsell/ui";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function SignOutButton(props: Pick<ButtonProps, "variant" | "size">) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    await authClient.signOut();
    router.replace("/sign-in");
    router.refresh();
  }

  return (
    <Button onClick={signOut} aria-busy={signingOut || undefined} {...props}>
      <LogOut size={16} aria-hidden />
      Sign out
    </Button>
  );
}
