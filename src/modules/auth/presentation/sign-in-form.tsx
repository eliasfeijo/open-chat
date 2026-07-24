"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  startTransition,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from "react";

import { authClient } from "@/lib/auth-client";

type SignInFormValues = {
  email: string;
  password: string;
};

export function SignInForm(): ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/profile";
  const [formValues, setFormValues] = useState<SignInFormValues>({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  function updateField<Key extends keyof SignInFormValues>(
    field: Key,
    value: SignInFormValues[Key],
  ) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsPending(true);

    startTransition(async () => {
      const result = await authClient.signIn.email({
        callbackURL: redirectTo,
        email: formValues.email,
        password: formValues.password,
        rememberMe: true,
      });

      setIsPending(false);

      if (result.error) {
        setErrorMessage(result.error.message ?? "Unable to sign in.");
        return;
      }

      router.push(redirectTo);
      router.refresh();
    });
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="sign-in-email">
          Email
        </label>
        <input
          autoComplete="email"
          className="w-full rounded-2xl border border-(--color-border) bg-(--color-page) px-4 py-3 text-base outline-none transition focus:border-(--color-accent)"
          id="sign-in-email"
          name="email"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            updateField("email", event.target.value)
          }
          required
          type="email"
          value={formValues.email}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="sign-in-password">
          Password
        </label>
        <input
          autoComplete="current-password"
          className="w-full rounded-2xl border border-(--color-border) bg-(--color-page) px-4 py-3 text-base outline-none transition focus:border-(--color-accent)"
          id="sign-in-password"
          name="password"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            updateField("password", event.target.value)
          }
          required
          type="password"
          value={formValues.password}
        />
      </div>

      {errorMessage ? (
        <p className="rounded-2xl border border-red-300/40 bg-red-100/60 px-4 py-3 text-sm text-red-900 dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-100">
          {errorMessage}
        </p>
      ) : null}

      <button
        className="inline-flex w-full items-center justify-center rounded-full bg-(--color-accent) px-6 py-3 text-sm font-semibold text-(--color-accent-foreground) transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-sm text-(--color-muted)">
        Need an account?{" "}
        <Link
          className="font-medium text-(--color-foreground)"
          href={`/sign-up?redirectTo=${encodeURIComponent(redirectTo)}`}
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
