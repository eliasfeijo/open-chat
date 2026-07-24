import { expect, test } from "@playwright/test";

test("home page renders the OpenChat scaffold", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Public chat for discoverable conversations.",
    }),
  ).toBeVisible();

  await expect(page.getByText("First commit baseline")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Initial modules",
    }),
  ).toBeVisible();
});
