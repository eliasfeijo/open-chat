import { test as base, expect, type Page } from "@playwright/test";

import {
  cleanupE2eTestData,
  cleanupLingeringPhase1ATestData,
  createE2eTestDataTracker,
  type E2eTestDataTracker,
} from "./support/test-data-cleanup";

const test = base.extend<{ testData: E2eTestDataTracker }>({
  testData: async ({}, use) => {
    const tracker = createE2eTestDataTracker();

    await cleanupLingeringPhase1ATestData();

    try {
      await use(tracker);
    } finally {
      await cleanupE2eTestData(tracker);
    }
  },
});

function createUniqueSuffix() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function trackTestTags(testData: E2eTestDataTracker, tags: string) {
  tags
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.startsWith("e2e-"))
    .forEach((tag) => testData.tagSlugs.add(tag));
}

async function signOut(page: Page) {
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(
    page.getByRole("link", { name: "Create account" }),
  ).toBeVisible();
}

async function signUp(
  page: Page,
  testData: E2eTestDataTracker,
  input: {
    displayName: string;
    email: string;
    password: string;
  },
) {
  await page.goto("/sign-up?redirectTo=/profile");

  await page.getByLabel("Display name").fill(input.displayName);
  await page.getByLabel("Email").fill(input.email);
  await page.getByLabel("Password").fill(input.password);
  await page.getByRole("button", { name: "Create account" }).click();

  testData.authUserEmails.add(input.email);

  await expect(
    page.getByRole("heading", { name: "Shape your public identity." }),
  ).toBeVisible();
}

async function updateProfile(
  page: Page,
  input: {
    bio: string;
    username: string;
  },
) {
  await page.getByLabel("Username").fill(input.username);
  await page.getByLabel("Bio").fill(input.bio);
  await page.getByRole("button", { name: "Save profile" }).click();

  await expect(page.getByText("Profile updated.")).toBeVisible();
}

async function createRoom(
  page: Page,
  testData: E2eTestDataTracker,
  input: {
    description: string;
    name: string;
    slug: string;
    tags: string;
    topic: string;
  },
) {
  await page.getByRole("link", { name: "Rooms" }).click();

  await expect(
    page.getByRole("heading", {
      name: "Create public rooms and discover the conversations already taking shape.",
    }),
  ).toBeVisible();

  await page.getByLabel("Room name").fill(input.name);
  await page.getByLabel("Room slug").fill(input.slug);
  await page.getByLabel("Topic").fill(input.topic);
  await page.getByLabel("Tags").first().fill(input.tags);
  await page.getByLabel("Description").fill(input.description);
  await page.getByRole("button", { name: "Create room" }).click();

  testData.roomSlugs.add(input.slug);
  trackTestTags(testData, input.tags);

  await expect(page.getByText("Room created.")).toBeVisible();
  await expect(page.getByRole("heading", { name: input.name })).toBeVisible();
}

async function updateRoomTags(
  page: Page,
  testData: E2eTestDataTracker,
  input: {
    tags: string;
  },
) {
  await page.getByLabel("Tags").fill(input.tags);
  await page.getByRole("button", { name: "Save room details" }).click();

  trackTestTags(testData, input.tags);

  await expect(page.getByText("Room updated.")).toBeVisible();
}

async function goToRooms(page: Page) {
  await page.getByRole("link", { name: "Rooms" }).click();

  await expect(
    page.getByRole("heading", {
      name: "Create public rooms and discover the conversations already taking shape.",
    }),
  ).toBeVisible();
}

test("signed-up users can move through the durable Phase 1A room journey", async ({
  browser,
  testData,
}) => {
  const suffix = createUniqueSuffix();
  const password = "OpenChatPass123!";
  const roomName = `Phase 1A Journey ${suffix}`;
  const roomSlug = `e2e-phase-1a-journey-${suffix}`;
  const roomTag = `e2e-journey-${suffix.slice(-6)}`;
  const secondaryTag = `e2e-discovery-${suffix.slice(-6)}`;

  const ownerPage = await browser.newPage();

  await signUp(ownerPage, testData, {
    displayName: `Owner ${suffix}`,
    email: `e2e-owner-${suffix}@example.com`,
    password,
  });

  await updateProfile(ownerPage, {
    bio: "Building the first durable room journey coverage.",
    username: `owner_${suffix.replace(/-/g, "")}`.slice(0, 24),
  });

  await createRoom(ownerPage, testData, {
    description:
      "A room created by the Playwright journey test for durable discovery and messaging.",
    name: roomName,
    slug: roomSlug,
    tags: `${roomTag}, ${secondaryTag}`,
    topic: "Phase 1A durable room journey",
  });

  await ownerPage.goto(`/rooms/${roomSlug}`);
  await expect(
    ownerPage.getByRole("heading", { name: roomName }),
  ).toBeVisible();
  await expect(ownerPage.getByText(`#${roomTag}`)).toBeVisible();
  await signOut(ownerPage);

  const participantPage = await browser.newPage();

  await signUp(participantPage, testData, {
    displayName: `Participant ${suffix}`,
    email: `e2e-participant-${suffix}@example.com`,
    password,
  });

  await updateProfile(participantPage, {
    bio: "Joining and posting in discovered rooms.",
    username: `guest_${suffix.replace(/-/g, "")}`.slice(0, 24),
  });

  await participantPage.getByRole("link", { name: "Rooms" }).click();
  await participantPage.getByLabel("Search rooms").fill(roomName);
  await participantPage.getByLabel("Filter by tag").fill(roomTag);
  await participantPage.getByRole("button", { name: "Discover rooms" }).click();

  await expect(
    participantPage.getByText(
      "Showing 1 room for the current discovery filters.",
    ),
  ).toBeVisible();
  await expect(
    participantPage.getByRole("heading", { name: roomName }),
  ).toBeVisible();

  await participantPage.getByRole("link", { name: "Open room" }).click();
  await expect(
    participantPage.getByRole("button", { name: "Join live room" }),
  ).toBeVisible();
  await participantPage.getByRole("button", { name: "Join live room" }).click();
  await expect(participantPage.getByText("You joined the room.")).toBeVisible();

  await participantPage.reload();
  await expect(
    participantPage.getByRole("heading", { name: "Compose into the room" }),
  ).toBeVisible();

  const messageBody = `Durable journey message ${suffix}`;

  await participantPage.getByLabel("Message").fill(messageBody);
  await participantPage.getByRole("button", { name: "Send to room" }).click();

  await expect(participantPage.getByText("Message posted.")).toBeVisible();
  await expect(participantPage.getByText(messageBody)).toBeVisible();
});

test("room messages show the sign-up display name when username setup is skipped", async ({
  browser,
  testData,
}) => {
  const suffix = createUniqueSuffix();
  const password = "OpenChatPass123!";
  const participantDisplayName = `Display Fallback ${suffix}`;
  const roomName = `Display Name Room ${suffix}`;
  const roomSlug = `e2e-display-name-room-${suffix}`;

  const ownerPage = await browser.newPage();

  await signUp(ownerPage, testData, {
    displayName: `Owner ${suffix}`,
    email: `e2e-owner-display-name-${suffix}@example.com`,
    password,
  });

  await updateProfile(ownerPage, {
    bio: "Hosting a room to verify transcript identity fallback.",
    username: `host_${suffix.replace(/-/g, "")}`.slice(0, 24),
  });

  await createRoom(ownerPage, testData, {
    description: "A room used to verify transcript author display names.",
    name: roomName,
    slug: roomSlug,
    tags: `e2e-display-${suffix.slice(-6)}`,
    topic: "Display name fallback",
  });

  const participantPage = await browser.newPage();

  await signUp(participantPage, testData, {
    displayName: participantDisplayName,
    email: `e2e-participant-display-name-${suffix}@example.com`,
    password,
  });

  await participantPage.goto(`/rooms/${roomSlug}`);
  await participantPage.getByRole("button", { name: "Join live room" }).click();
  await expect(participantPage.getByText("You joined the room.")).toBeVisible();

  const messageBody = `Display name fallback message ${suffix}`;

  await participantPage.getByLabel("Message").fill(messageBody);
  await participantPage.getByRole("button", { name: "Send to room" }).click();
  await expect(participantPage.getByText("Message posted.")).toBeVisible();

  await ownerPage.goto(`/rooms/${roomSlug}`);
  await expect(ownerPage.getByText(participantDisplayName)).toBeVisible();
  await expect(ownerPage.getByText(messageBody)).toBeVisible();
});

test("room edit highlights invalid tag input", async ({
  browser,
  testData,
}) => {
  const suffix = createUniqueSuffix();
  const page = await browser.newPage();

  await signUp(page, testData, {
    displayName: `Owner ${suffix}`,
    email: `e2e-owner-invalid-tags-${suffix}@example.com`,
    password: "OpenChatPass123!",
  });

  await updateProfile(page, {
    bio: "Editing room tags in the browser.",
    username: `owner_${suffix.replace(/-/g, "")}`.slice(0, 24),
  });

  await createRoom(page, testData, {
    description: "Room used to verify invalid tag field errors in Playwright.",
    name: `Invalid Tag Room ${suffix}`,
    slug: `e2e-invalid-tag-room-${suffix}`,
    tags: `e2e-testing-${suffix.slice(-6)}, e2e-phase-1a-${suffix.slice(-6)}`,
    topic: "Room tag validation",
  });

  await page.goto(`/rooms/e2e-invalid-tag-room-${suffix}`);
  await page.getByLabel("Tags").fill("test, let's chat");
  await page.getByRole("button", { name: "Save room details" }).click();

  await expect(
    page.getByText("Please correct the highlighted fields."),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Tags can only contain lowercase letters, numbers, and single hyphens.",
    ),
  ).toBeVisible();
});

test("owner tag editing flows into discovery and leave behavior stays explicit", async ({
  browser,
  testData,
}) => {
  const suffix = createUniqueSuffix();
  const password = "OpenChatPass123!";
  const roomName = `Lifecycle Room ${suffix}`;
  const roomSlug = `e2e-room-lifecycle-${suffix}`;
  const initialTag = `e2e-before-${suffix.slice(-6)}`;
  const replacementTag = `e2e-after-${suffix.slice(-6)}`;
  const secondaryReplacementTag = `e2e-leave-${suffix.slice(-6)}`;

  const ownerPage = await browser.newPage();

  await signUp(ownerPage, testData, {
    displayName: `Owner ${suffix}`,
    email: `e2e-owner-lifecycle-${suffix}@example.com`,
    password,
  });

  await updateProfile(ownerPage, {
    bio: "Managing room tags before other members arrive.",
    username: `owner_${suffix.replace(/-/g, "")}`.slice(0, 24),
  });

  await createRoom(ownerPage, testData, {
    description: "Room used to validate owner tag editing and leave behavior.",
    name: roomName,
    slug: roomSlug,
    tags: initialTag,
    topic: "Lifecycle coverage",
  });

  await ownerPage.goto(`/rooms/${roomSlug}`);

  await expect(
    ownerPage.getByText(/cannot leave until ownership transfer exists\./i),
  ).toBeVisible();
  await expect(
    ownerPage.getByRole("button", { name: "Owner membership stays active" }),
  ).toBeDisabled();

  await updateRoomTags(ownerPage, testData, {
    tags: `${replacementTag}, ${secondaryReplacementTag}`,
  });

  await expect(ownerPage.getByText(`#${replacementTag}`)).toBeVisible();
  await expect(
    ownerPage.getByText(`#${secondaryReplacementTag}`),
  ).toBeVisible();
  await expect(ownerPage.getByText(`#${initialTag}`)).toHaveCount(0);

  await signOut(ownerPage);

  const participantPage = await browser.newPage();

  await signUp(participantPage, testData, {
    displayName: `Participant ${suffix}`,
    email: `e2e-participant-lifecycle-${suffix}@example.com`,
    password,
  });

  await updateProfile(participantPage, {
    bio: "Joining and leaving rooms as part of the lifecycle checks.",
    username: `guest_${suffix.replace(/-/g, "")}`.slice(0, 24),
  });

  await goToRooms(participantPage);
  await participantPage.getByLabel("Search rooms").fill(roomName);
  await participantPage.getByLabel("Filter by tag").fill(replacementTag);
  await participantPage.getByRole("button", { name: "Discover rooms" }).click();

  await expect(
    participantPage.getByRole("heading", { name: roomName }),
  ).toBeVisible();

  await participantPage.getByRole("link", { name: "Open room" }).click();
  await participantPage.getByRole("button", { name: "Join live room" }).click();
  await expect(participantPage.getByText("You joined the room.")).toBeVisible();

  await participantPage.reload();
  await expect(
    participantPage.getByRole("heading", { name: "Compose into the room" }),
  ).toBeVisible();

  await participantPage
    .getByRole("button", { name: "Step out of room" })
    .click();
  await expect(participantPage.getByText("You left the room.")).toBeVisible();

  await participantPage.reload();
  await expect(
    participantPage.getByRole("heading", {
      name: "Composer locked until you join",
    }),
  ).toBeVisible();
  await expect(
    participantPage.getByRole("button", { name: "Join live room" }),
  ).toBeVisible();
});

test("profile editing rejects duplicate usernames", async ({
  browser,
  testData,
}) => {
  const suffix = createUniqueSuffix();
  const sharedUsername = `duplicate_${suffix.replace(/-/g, "")}`.slice(0, 24);

  const firstPage = await browser.newPage();

  await signUp(firstPage, testData, {
    displayName: `First ${suffix}`,
    email: `e2e-duplicate-first-${suffix}@example.com`,
    password: "OpenChatPass123!",
  });

  await updateProfile(firstPage, {
    bio: "First account claims the shared username.",
    username: sharedUsername,
  });

  await signOut(firstPage);

  const secondPage = await browser.newPage();

  await signUp(secondPage, testData, {
    displayName: `Second ${suffix}`,
    email: `e2e-duplicate-second-${suffix}@example.com`,
    password: "OpenChatPass123!",
  });

  await secondPage.getByLabel("Username").fill(sharedUsername);
  await secondPage
    .getByLabel("Bio")
    .fill("Trying to reuse an existing username.");
  await secondPage.getByRole("button", { name: "Save profile" }).click();

  await expect(secondPage.getByText("Choose another username.")).toBeVisible();
  await expect(
    secondPage.getByText(`Username ${sharedUsername} is already taken.`),
  ).toBeVisible();
});

test("room creation rejects duplicate slugs", async ({ browser, testData }) => {
  const suffix = createUniqueSuffix();
  const roomSlug = `e2e-duplicate-room-${suffix}`;
  const page = await browser.newPage();

  await signUp(page, testData, {
    displayName: `Owner ${suffix}`,
    email: `e2e-duplicate-room-${suffix}@example.com`,
    password: "OpenChatPass123!",
  });

  await updateProfile(page, {
    bio: "Testing duplicate room slug protection.",
    username: `slug_${suffix.replace(/-/g, "")}`.slice(0, 24),
  });

  await createRoom(page, testData, {
    description: "First room that reserves the slug.",
    name: `Primary Room ${suffix}`,
    slug: roomSlug,
    tags: `e2e-slug-test-${suffix.slice(-6)}`,
    topic: "Slug collision test",
  });

  await goToRooms(page);
  await page.getByLabel("Room name").fill(`Second Room ${suffix}`);
  await page.getByLabel("Room slug").fill(roomSlug);
  await page.getByLabel("Topic").fill("Attempting duplicate slug");
  await page
    .getByLabel("Tags")
    .first()
    .fill(`e2e-slug-test-${suffix.slice(-6)}`);
  await page.getByLabel("Description").fill("This second room should fail.");
  await page.getByRole("button", { name: "Create room" }).click();

  await expect(page.getByText("Choose another room slug.")).toBeVisible();
  await expect(
    page.getByText(`Room slug ${roomSlug} is already in use.`),
  ).toBeVisible();
});

test("room detail keeps the composer locked until the viewer joins", async ({
  browser,
  testData,
}) => {
  const suffix = createUniqueSuffix();
  const roomName = `Locked Composer ${suffix}`;
  const roomSlug = `e2e-locked-composer-${suffix}`;

  const ownerPage = await browser.newPage();

  await signUp(ownerPage, testData, {
    displayName: `Owner ${suffix}`,
    email: `e2e-locked-owner-${suffix}@example.com`,
    password: "OpenChatPass123!",
  });

  await updateProfile(ownerPage, {
    bio: "Creating a room for membership-gated posting.",
    username: `lockowner_${suffix.replace(/-/g, "")}`.slice(0, 24),
  });

  await createRoom(ownerPage, testData, {
    description: "A room that should require joining before posting.",
    name: roomName,
    slug: roomSlug,
    tags: `e2e-member-${suffix.slice(-6)}`,
    topic: "Membership-gated posting",
  });

  await signOut(ownerPage);

  const participantPage = await browser.newPage();

  await signUp(participantPage, testData, {
    displayName: `Participant ${suffix}`,
    email: `e2e-locked-participant-${suffix}@example.com`,
    password: "OpenChatPass123!",
  });

  await updateProfile(participantPage, {
    bio: "Browsing before joining.",
    username: `lockguest_${suffix.replace(/-/g, "")}`.slice(0, 24),
  });

  await participantPage.goto(`/rooms/${roomSlug}`);

  await expect(
    participantPage.getByRole("heading", {
      name: "Composer locked until you join",
    }),
  ).toBeVisible();
  await expect(
    participantPage.getByRole("button", { name: "Join live room" }),
  ).toBeVisible();
  await expect(participantPage.getByLabel("Message")).toHaveCount(0);
});
