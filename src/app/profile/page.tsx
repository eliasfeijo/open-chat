import { redirect } from "next/navigation";
import type { Metadata } from "next";
import type { ReactElement } from "react";

import { getAuthenticatedUser } from "@/modules/auth";
import { NavigationBar } from "@/modules/auth/presentation/navigation-bar";
import {
  getUserProfileById,
  syncUserProfileFromAuthIdentity,
} from "@/modules/users";
import { ProfileForm } from "@/modules/users/presentation/profile-form";
import { appConfig } from "@/shared/config/app-config";

export const metadata: Metadata = {
  description:
    "Update your RoomSurf profile so other people can recognize you in public rooms and search results.",
  openGraph: {
    description:
      "Update your RoomSurf profile so other people can recognize you in public rooms and search results.",
    siteName: appConfig.name,
    title: "Your RoomSurf profile",
    type: "website",
  },
  robots: {
    follow: true,
    index: false,
  },
  title: "Your RoomSurf profile",
  twitter: {
    card: "summary",
    description:
      "Update your RoomSurf profile so other people can recognize you in public rooms and search results.",
    title: "Your RoomSurf profile",
  },
};

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
                Add a recognizable username and a short bio so other people can
                understand who you are when you join public rooms.
              </p>
            </div>

            {userProfile.username ? null : (
              <div className="rounded-[1.75rem] border border-amber-300/40 bg-amber-100/60 p-5 text-sm leading-7 text-amber-950 dark:border-amber-400/20 dark:bg-amber-950/30 dark:text-amber-100">
                Choose a username to make your identity easier to recognize in
                rooms, search results, and live conversations.
              </div>
            )}
          </div>

          <ProfileForm profile={userProfile} />
        </div>
      </section>
    </main>
  );
}
