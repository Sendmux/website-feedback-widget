import { expect, test } from "@playwright/test";

test("opens, submits, and shows success", async ({ page }) => {
  await page.route("**/demo-feedback", async (route) => {
    const body = route.request().postDataJSON();
    expect(body.feedback_type).toBe("issue");
    expect(body.message).toBe(
      "The export button failed after I selected CSV, expected a download, and stayed stuck on the logs page with no error message."
    );
    await route.fulfill({ json: { ok: true } });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Open feedback" }).click();
  await page.getByRole("radio", { name: /Something broke/ }).click();
  await page.getByLabel("Your issue").fill(
    "The export button failed after I selected CSV, expected a download, and stayed stuck on the logs page with no error message."
  );
  await page.getByRole("button", { name: "Send issue" }).click();

  await expect(page.getByText("Thanks — we got it")).toBeVisible();
  await expect(page.getByText("Your issue is on its way to the team.")).toBeVisible();
});

test("requires enough message detail before submitting", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open feedback" }).click();
  await page.getByRole("radio", { name: /Something broke/ }).click();
  await page.getByLabel("Your issue").fill("Too short.");
  await page.getByRole("button", { name: "Send issue" }).click();

  await expect(page.getByText("Add a little more detail (100+ characters).")).toBeVisible();
});

test("updates message copy and supports going back to choose a category", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open feedback" }).click();

  await page.getByRole("radio", { name: /feature request or improvement/ }).click();
  await expect(page.getByLabel("Your idea")).toHaveAttribute("placeholder", /feature you would like to see/);
  await expect(page.getByRole("button", { name: "Send idea" })).toBeVisible();
  await expect(page.getByText("Thanks — we got it")).toBeHidden();

  await page.getByRole("button", { name: "Back to categories" }).click();
  await page.getByRole("radio", { name: /general note/ }).click();
  await expect(page.getByLabel("Your feedback")).toHaveAttribute("placeholder", /context that helps the team/);
  await expect(page.getByRole("button", { name: "Send feedback" })).toBeVisible();
});

test("supports keyboard opening from the launcher", async ({ page }) => {
  await page.goto("/");
  await page.locator("sendmux-feedback").evaluate((element) => {
    const launcher = element.shadowRoot?.querySelector("button");
    (launcher as HTMLButtonElement | null)?.focus();
  });

  await page.keyboard.press("Enter");
  await expect(page.getByRole("radio", { name: /Something broke/ })).toBeVisible();
});
