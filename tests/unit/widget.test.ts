import { openSendmuxFeedback } from "../../src/index";
import { afterEach, vi } from "vitest";

function required<T>(value: T | null | undefined, label: string): T {
  expect(value, `${label} should exist`).toBeTruthy();
  return value as T;
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

test("defines the custom element", () => {
  expect(customElements.get("sendmux-feedback")).toBeDefined();
});

test("renders with configured attributes", async () => {
  document.body.innerHTML = `
    <sendmux-feedback
      endpoint="/api/feedback"
      position="centre"
      brand-colour="#111827"
      min-message-length="100"
      powered-by="false"
    ></sendmux-feedback>
  `;

  const element = document.querySelector("sendmux-feedback")!;
  await customElements.whenDefined("sendmux-feedback");

  expect(element.shadowRoot?.querySelector(".launcher")?.textContent).toContain("Feedback");
  expect(element.getAttribute("data-position")).toBe("center");
  expect(element.shadowRoot?.querySelector("textarea")?.getAttribute("minlength")).toBe("100");
  expect(element.shadowRoot?.querySelector(".powered-by")).toBeNull();
});

test("uses a roomy category layout without truncating helper copy", async () => {
  document.body.innerHTML = `<sendmux-feedback endpoint="/api/feedback"></sendmux-feedback>`;

  const element = document.querySelector("sendmux-feedback")!;
  await customElements.whenDefined("sendmux-feedback");

  const styleText = element.shadowRoot?.querySelector("style")?.textContent ?? "";
  const descriptionRule = styleText.match(/\.option__desc\s*{[^}]+}/)?.[0] ?? "";

  expect(styleText).toContain("--smx-feedback-panel-width: 560px;");
  expect(styleText).toContain("width: min(var(--smx-feedback-panel-width), calc(100vw - 2rem));");
  expect(descriptionRule).toContain("white-space: normal;");
  expect(descriptionRule).not.toContain("text-overflow");
});

test("submits through the endpoint supplied when opened with JavaScript config", async () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true });
  vi.stubGlobal("fetch", fetchMock);

  const element = openSendmuxFeedback({
    endpoint: "/api/feedback",
    fontFamily: '"Lato", "Segoe UI", sans-serif',
    position: "center"
  });

  expect(element).toBeTruthy();
  expect(element?.style.getPropertyValue("--smx-feedback-font")).toBe('"Lato", "Segoe UI", sans-serif');

  element?.shadowRoot?.querySelector<HTMLButtonElement>('[data-feedback-type="issue"]')?.click();
  const textarea = required(element?.shadowRoot?.querySelector<HTMLTextAreaElement>("textarea"), "message textarea");
  const submit = required(
    element?.shadowRoot?.querySelector<HTMLButtonElement>(".btn--primary[type='submit']"),
    "submit button"
  );

  textarea.value = "The endpoint configuration should stay attached when the widget submits from the modal.";
  submit.click();
  await new Promise((resolve) => setTimeout(resolve, 0));

  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/api/feedback");
});

test("moves from category selection to category-specific message copy", async () => {
  document.body.innerHTML = `<sendmux-feedback endpoint="/api/feedback"></sendmux-feedback>`;

  const element = document.querySelector("sendmux-feedback")!;
  await customElements.whenDefined("sendmux-feedback");

  const ideaButton = element.shadowRoot?.querySelector<HTMLButtonElement>('[data-feedback-type="idea"]');
  ideaButton?.click();

  expect(element.shadowRoot?.querySelector<HTMLFormElement>(".form")?.dataset.step).toBe("message");
  expect(element.shadowRoot?.querySelector<HTMLInputElement>('input[name="feedback_type"]')?.value).toBe("idea");
  expect(element.shadowRoot?.querySelector<HTMLTextAreaElement>("textarea")?.placeholder).toContain("feature");
  expect(element.shadowRoot?.querySelector<HTMLButtonElement>(".btn--primary[type='submit']")?.textContent).toBe(
    "Send idea"
  );
});

test("keeps success and error screens hidden until submission", async () => {
  document.body.innerHTML = `<sendmux-feedback endpoint="/api/feedback" min-message-length="100"></sendmux-feedback>`;

  const element = document.querySelector("sendmux-feedback")!;
  await customElements.whenDefined("sendmux-feedback");

  element.shadowRoot?.querySelector<HTMLButtonElement>('[data-feedback-type="issue"]')?.click();

  expect(element.shadowRoot?.querySelector(".step-success")?.getAttribute("aria-hidden")).toBe("true");
  expect(element.shadowRoot?.querySelector(".step-error")?.getAttribute("aria-hidden")).toBe("true");
});

test("shows a concise minimum-length validation message", async () => {
  document.body.innerHTML = `<sendmux-feedback endpoint="/api/feedback" min-message-length="100"></sendmux-feedback>`;

  const element = document.querySelector("sendmux-feedback")!;
  await customElements.whenDefined("sendmux-feedback");

  element.shadowRoot?.querySelector<HTMLButtonElement>('[data-feedback-type="issue"]')?.click();
  const textarea = required(element.shadowRoot?.querySelector<HTMLTextAreaElement>("textarea"), "message textarea");
  const submit = required(
    element.shadowRoot?.querySelector<HTMLButtonElement>(".btn--primary[type='submit']"),
    "submit button"
  );

  textarea.value = "Too short.";
  submit.click();

  expect(element.shadowRoot?.querySelector(".inline-error")?.textContent).toBe(
    "Add a little more detail (100+ characters)."
  );
  expect(textarea?.getAttribute("aria-invalid")).toBe("true");
});

test("shows the dedicated success screen with checkmark after success", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
  document.body.innerHTML = `<sendmux-feedback endpoint="/api/feedback"></sendmux-feedback>`;

  const element = document.querySelector("sendmux-feedback")!;
  await customElements.whenDefined("sendmux-feedback");

  element.shadowRoot?.querySelector<HTMLButtonElement>('[data-feedback-type="idea"]')?.click();
  const textarea = required(element.shadowRoot?.querySelector<HTMLTextAreaElement>("textarea"), "message textarea");
  const submit = required(
    element.shadowRoot?.querySelector<HTMLButtonElement>(".btn--primary[type='submit']"),
    "submit button"
  );

  textarea.value = "A useful improvement with enough detail to send.";
  submit.click();
  await new Promise((resolve) => setTimeout(resolve, 0));

  expect(element.shadowRoot?.querySelector<HTMLFormElement>(".form")?.dataset.step).toBe("success");
  expect(element.shadowRoot?.querySelector(".step-success")?.getAttribute("aria-hidden")).toBe("false");
  expect(element.shadowRoot?.querySelector(".status-screen--success svg")).toBeTruthy();
  expect(element.shadowRoot?.querySelector(".step-message")?.getAttribute("aria-hidden")).toBe("true");
  expect(element.shadowRoot?.querySelector("[data-send-another]")?.textContent).toBe("Send another");
});

test("shows the dedicated error screen and preserves the draft", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 502 }));
  document.body.innerHTML = `<sendmux-feedback endpoint="/api/feedback"></sendmux-feedback>`;

  const element = document.querySelector("sendmux-feedback")!;
  await customElements.whenDefined("sendmux-feedback");

  element.shadowRoot?.querySelector<HTMLButtonElement>('[data-feedback-type="feedback"]')?.click();
  const textarea = required(element.shadowRoot?.querySelector<HTMLTextAreaElement>("textarea"), "message textarea");
  const submit = required(
    element.shadowRoot?.querySelector<HTMLButtonElement>(".btn--primary[type='submit']"),
    "submit button"
  );

  textarea.value = "A general product signal with enough context for the team to understand.";
  submit.click();
  await new Promise((resolve) => setTimeout(resolve, 0));

  expect(element.shadowRoot?.querySelector<HTMLFormElement>(".form")?.dataset.step).toBe("error");
  expect(element.shadowRoot?.querySelector(".status-screen--error")?.textContent).toContain(
    "Couldn't send your feedback"
  );
  expect(element.shadowRoot?.querySelector("[data-try-again]")?.textContent).toContain("Try again");

  element.shadowRoot?.querySelector<HTMLButtonElement>("[data-back-to-message]")?.click();
  expect(element.shadowRoot?.querySelector<HTMLTextAreaElement>("textarea")?.value).toBe(
    "A general product signal with enough context for the team to understand."
  );
});
