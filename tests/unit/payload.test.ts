import { buildFeedbackPayload } from "../../src/payload";

test("builds a trimmed feedback payload", () => {
  const payload = buildFeedbackPayload({
    feedbackType: "idea",
    message: "  Add saved filters  ",
    location: { href: "https://example.test/dashboard" },
    title: "Dashboard",
    now: new Date("2026-05-25T06:38:00.000Z"),
    user: { email: "user@example.test" },
    metadata: { plan: "pro" }
  });

  expect(payload).toEqual({
    feedback_type: "idea",
    message: "Add saved filters",
    url: "https://example.test/dashboard",
    title: "Dashboard",
    timestamp: "2026-05-25T06:38:00.000Z",
    user: { email: "user@example.test" },
    metadata: { plan: "pro" }
  });
});
