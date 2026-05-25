import "../../src/index";

test("defines the custom element", () => {
  expect(customElements.get("sendmux-feedback")).toBeDefined();
});

test("renders with configured attributes", async () => {
  document.body.innerHTML = `
    <sendmux-feedback
      endpoint="/api/feedback"
      position="right-middle"
      brand-colour="#111827"
      powered-by="false"
    ></sendmux-feedback>
  `;

  const element = document.querySelector("sendmux-feedback")!;
  await customElements.whenDefined("sendmux-feedback");

  expect(element.shadowRoot?.querySelector(".launcher")?.textContent).toContain("Feedback");
  expect(element.getAttribute("data-position")).toBe("middle-right");
  expect(element.shadowRoot?.querySelector(".powered-by")).toBeNull();
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
  expect(element.shadowRoot?.querySelector<HTMLButtonElement>(".primary")?.textContent).toBe("Send Idea");
});
