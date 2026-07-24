import { redirect } from "next/navigation";
import type { ReactElement } from "react";

import { getAuthenticatedUser } from "@/modules/auth";
import { NavigationBar } from "@/modules/auth/presentation/navigation-bar";
import { SignUpForm } from "@/modules/auth/presentation/sign-up-form";

type SignUpPageProps = Readonly<{
  searchParams: Promise<{
    redirectTo?: string;
  }>;
}>;

export default async function SignUpPage({
  searchParams,
}: SignUpPageProps): Promise<ReactElement> {
  const authenticatedUser = await getAuthenticatedUser();
  const resolvedSearchParams = await searchParams;
  const redirectTo = resolvedSearchParams.redirectTo ?? "/profile";

  if (authenticatedUser) {
    redirect(redirectTo);
  }

  return (
    <main className="min-h-screen bg-(--color-page)">
      <NavigationBar />
      <section className="mx-auto flex w-full max-w-6xl px-6 py-16 sm:px-10 lg:px-12">
        <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,30rem)] lg:items-start">
          <div className="space-y-6 pt-6">
            <span className="inline-flex rounded-full border border-(--color-border) bg-(--color-surface) px-4 py-1 text-sm font-medium text-(--color-muted)">
              Create your account
            </span>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Join OpenChat and complete your public identity.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-(--color-muted)">
                Start with the minimum onboarding needed for the product: an
                account, then a lightweight profile you can refine before room
                creation arrives.
              </p>
            </div>
          </div>

          <div className="rounded-4xl border border-(--color-border) bg-(--color-surface) p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="mb-6 space-y-2">
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">
                Create your account
              </h2>
              <p className="text-sm leading-6 text-(--color-muted)">
                Your profile can stay minimal for now and be refined after sign
                up.
              </p>
            </div>
            <SignUpForm />
          </div>
        </div>
      </section>
    </main>
  );
}
