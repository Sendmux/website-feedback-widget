import { expect, test } from "@playwright/test";

test("opens, submits, and shows success", async ({ page }) => {
  await page.route("**/demo-feedback", async (route) => {
    const body = route.request().postDataJSON();
    expect(body.feedback_type).toBe("issue");
    expect(body.message).toBe("The export button failed.");
    await route.fulfill({ json: { ok: true } });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Open feedback" }).click();
  await page.getByRole("button", { name: /Something broke/ }).click();
  await page.getByLabel("Message").fill("The export button failed.");
  await page.getByRole("button", { name: "Send Issue" }).click();

  await expect(page.getByText("Thanks. Your issue was sent.")).toBeVisible();
});

test("updates message copy and supports going back to choose a category", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open feedback" }).click();

  await page.getByRole("button", { name: /feature, workflow/ }).click();
  await expect(page.getByLabel("Message")).toHaveAttribute("placeholder", /feature you would like to see/);
  await expect(page.getByRole("button", { name: "Send Idea" })).toBeVisible();

  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: /general note/ }).click();
  await expect(page.getByLabel("Message")).toHaveAttribute("placeholder", /context that helps the team/);
  await expect(page.getByRole("button", { name: "Send Feedback" })).toBeVisible();
});

test("supports keyboard opening from the launcher", async ({ page }) => {
  await page.goto("/");
  await page.locator("sendmux-feedback").evaluate((element) => {
    const launcher = element.shadowRoot?.querySelector("button");
    (launcher as HTMLButtonElement | null)?.focus();
  });

  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: /Something broke/ })).toBeVisible();
});
