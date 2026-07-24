import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { ReactElement } from "react";

import { getAuthenticatedUser } from "@/modules/auth";
import { NavigationBar } from "@/modules/auth/presentation/navigation-bar";
import { PostRoomMessageForm } from "@/modules/messages/presentation/post-room-message-form";
import { RoomMessagesList } from "@/modules/messages/presentation/room-messages-list";
import { listRoomMessages } from "@/modules/messages";
import { EditRoomDetailsForm } from "@/modules/rooms/presentation/edit-room-details-form";
import { RoomDetails } from "@/modules/rooms/presentation/room-details";
import { RoomMembershipPanel } from "@/modules/rooms/presentation/room-membership-panel";
import { getRoomBySlug, getRoomMembership } from "@/modules/rooms";
import { getUserProfilesByIds } from "@/modules/users";

type RoomDetailPageProps = Readonly<{
  params: Promise<{
    slug: string;
  }>;
}>;

export default async function RoomDetailPage({
  params,
}: RoomDetailPageProps): Promise<ReactElement> {
  const authenticatedUser = await getAuthenticatedUser();

  if (!authenticatedUser) {
    const { slug } = await params;

    redirect(`/sign-in?redirectTo=/rooms/${slug}`);
  }

  const { slug } = await params;
  const room = await getRoomBySlug(slug);

  if (!room) {
    notFound();
  }

  const [currentMembership, messages] = await Promise.all([
    getRoomMembership({
      roomId: room.id,
      userId: authenticatedUser.id,
    }),
    listRoomMessages({
      roomId: room.id,
    }),
  ]);

  const participantUserIds = Array.from(
    new Set([
      room.ownerUserId,
      ...messages.map((message) => message.authorUserId),
    ]),
  );
  const participantProfiles = await getUserProfilesByIds(participantUserIds);
  const participantProfilesByUserId = Object.fromEntries(
    participantProfiles.map((profile) => [profile.id, profile]),
  );
  const ownerProfile = participantProfilesByUserId[room.ownerUserId] ?? null;
  const latestMessage = messages.at(-1) ?? null;
  const currentRoleLabel = currentMembership
    ? currentMembership.role === "owner"
      ? "Hosting"
      : "Joined"
    : "Browsing";

  return (
    <main className="min-h-screen bg-(--color-page)">
      <NavigationBar />
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-16 sm:px-10 lg:px-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <Link
              className="inline-flex items-center text-sm font-medium text-(--color-accent) transition hover:brightness-110"
              href="/rooms"
            >
              Back to rooms
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-(--color-border) bg-(--color-surface) px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-muted)">
                Live room
              </span>
              <span className="rounded-full border border-(--color-border) bg-(--color-surface) px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-muted)">
                {messages.length} messages
              </span>
              <span className="rounded-full border border-(--color-border) bg-(--color-surface) px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-muted)">
                {currentRoleLabel}
              </span>
            </div>

            <p className="max-w-2xl text-base leading-7 text-(--color-muted)">
              This room now reads like a conversation surface: public identity,
              a continuous transcript, and a composer that sits near the active
              thread.
            </p>
          </div>

          <div className="rounded-4xl border border-(--color-border) bg-(--color-surface) px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-muted)">
              Latest activity
            </p>
            <p className="mt-2 text-sm font-medium text-(--color-foreground)">
              {latestMessage
                ? latestMessage.createdAt.toLocaleString("en-US", {
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    month: "short",
                  })
                : "No messages yet"}
            </p>
            <p className="mt-1 text-sm text-(--color-muted)">
              {latestMessage
                ? "The transcript is ordered chronologically so the room feels like one ongoing exchange."
                : "The transcript is ready for the first live exchange."}
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)] lg:items-start">
          <aside className="space-y-6 lg:sticky lg:top-24">
            <RoomDetails
              currentUserId={authenticatedUser.id}
              ownerProfile={ownerProfile}
              room={room}
            />

            {room.ownerUserId === authenticatedUser.id ? (
              <EditRoomDetailsForm room={room} />
            ) : null}

            <RoomMembershipPanel
              currentMembershipRole={currentMembership?.role ?? null}
              roomId={room.id}
              roomSlug={room.slug}
            />
          </aside>

          <section className="overflow-hidden rounded-4xl border border-(--color-border) bg-linear-to-b from-(--color-surface) to-(--color-surface-strong) shadow-sm">
            <div className="border-b border-(--color-border) px-6 py-5 sm:px-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold tracking-[-0.03em] text-(--color-foreground)">
                    Conversation
                  </h2>
                  <p className="max-w-2xl text-sm leading-7 text-(--color-muted)">
                    Messages stay durable in PostgreSQL, but the layout now
                    centers the chat flow instead of a feed of static cards.
                  </p>
                </div>
                <div className="rounded-full border border-(--color-border) bg-(--color-page) px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-muted)">
                  /{room.slug}
                </div>
              </div>
            </div>

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
              <div className="max-h-168 overflow-y-auto pr-1">
                <RoomMessagesList
                  authorProfilesByUserId={participantProfilesByUserId}
                  currentUserId={authenticatedUser.id}
                  messages={messages}
                  ownerUserId={room.ownerUserId}
                />
              </div>

              <div className="rounded-4xl border border-(--color-border) bg-(--color-surface) p-5 sm:p-6">
                {currentMembership ? (
                  <PostRoomMessageForm
                    roomId={room.id}
                    roomName={room.name}
                    roomSlug={room.slug}
                  />
                ) : (
                  <section className="space-y-3 text-sm leading-7 text-(--color-muted)">
                    <h3 className="text-lg font-semibold tracking-[-0.03em] text-(--color-foreground)">
                      Composer locked until you join
                    </h3>
                    <p>
                      Public browsing stays open so the room feels active from
                      the outside, but posting is held behind an explicit
                      membership step.
                    </p>
                  </section>
                )}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
