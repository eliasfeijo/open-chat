"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState, type ReactElement } from "react";

import { authClient } from "@/lib/auth-client";

type SignOutButtonProps = Readonly<{
  className?: string;
}>;

export function SignOutButton({ className }: SignOutButtonProps): ReactElement {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  function signOut() {
    setIsPending(true);

    startTransition(async () => {
      const result = await authClient.signOut();

      setIsPending(false);

      if (result.error) {
        return;
      }

      router.push("/");
      router.refresh();
    });
  }

  return (
    <button
      className={className}
      disabled={isPending}
      onClick={signOut}
      type="button"
    >
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}
