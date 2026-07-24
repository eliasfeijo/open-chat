import { redirect } from "next/navigation";
import type { ReactElement } from "react";

import { getAuthenticatedUser } from "@/modules/auth";
import { NavigationBar } from "@/modules/auth/api/navigation-bar";
import {
  getUserProfileById,
  syncUserProfileFromAuthIdentity,
} from "@/modules/users";
import { ProfileForm } from "@/modules/users/api/profile-form";

export default async function ProfilePage(): Promise<ReactElement> {
  const authenticatedUser = await getAuthenticatedUser();

  if (!authenticatedUser) {
    redirect("/sign-in?redirectTo=/profile");
  }

  const existingProfile = await getUserProfileById(authenticatedUser.id);
  const userProfile =
    existingProfile ??
    (await syncUserProfileFromAuthIdentity({
      authUserId: authenticatedUser.id,
    }));

  return (
    <main className="min-h-screen bg-(--color-page)">
      <NavigationBar />
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-16 sm:px-10 lg:px-12">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(20rem,1.1fr)] lg:items-start">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-(--color-border) bg-(--color-surface) px-4 py-1 text-sm font-medium text-(--color-muted)">
              Profile
            </span>

            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Shape your public identity.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-(--color-muted)">
                This is the minimum onboarding surface for the current slice.
                Your account already exists. Add a public handle and short bio
                so the next room features can attach ownership and discovery to
                a real profile.
              </p>
            </div>

            {userProfile.username ? null : (
              <div className="rounded-[1.75rem] border border-amber-300/40 bg-amber-100/60 p-5 text-sm leading-7 text-amber-950 dark:border-amber-400/20 dark:bg-amber-950/30 dark:text-amber-100">
                Choose a username to finish your initial onboarding. It is not
                required yet, but it will make future room ownership and public
                identity clearer.
              </div>
            )}
          </div>

          <ProfileForm profile={userProfile} />
        </div>
      </section>
    </main>
  );
}
