// @vitest-environment node

import { expect, test } from "vitest";

test("can be imported without browser globals", async () => {
  const module = await import("../../src/index");

  expect(module.tagName).toBe("sendmux-feedback");
  expect(module.openSendmuxFeedback()).toBeNull();
});
