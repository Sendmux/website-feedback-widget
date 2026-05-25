import { buildFeedbackPayload } from "./payload";
import { normalisePosition } from "./position";
import { styles } from "./styles";
import type { FeedbackType, JsonObject, SendmuxFeedbackConfig, SendmuxFeedbackPayload } from "./types";

export const tagName = "sendmux-feedback";

const defaultConfig: Required<
  Pick<SendmuxFeedbackConfig, "buttonLabel" | "title" | "brandColor" | "position" | "poweredBy">
> = {
  buttonLabel: "Feedback",
  title: "Send feedback",
  brandColor: "#4f46e5",
  position: "bottom-right",
  poweredBy: true
};

const boolFalseValues = new Set(["false", "0", "off", "no"]);
let instanceCount = 0;
const BaseHTMLElement: typeof HTMLElement =
  typeof HTMLElement === "undefined" ? (class {} as unknown as typeof HTMLElement) : HTMLElement;

type FormStep = "category" | "message";

type AttributeConfig = Omit<SendmuxFeedbackConfig, "position"> & {
  position?: string;
};

interface FeedbackTypeContent {
  label: string;
  emoji: string;
  helper: string;
  placeholder: string;
  submitLabel: string;
  busyLabel: string;
  successMessage: string;
}

const feedbackTypeContent: Record<FeedbackType, FeedbackTypeContent> = {
  issue: {
    label: "Issue",
    emoji: "⚠️",
    helper: "Something broke or behaved unexpectedly.",
    placeholder: "Tell us what broke, what you expected, and where it happened.",
    submitLabel: "Send Issue",
    busyLabel: "Sending issue...",
    successMessage: "Thanks. Your issue was sent."
  },
  idea: {
    label: "Idea",
    emoji: "💡",
    helper: "A feature, workflow, or improvement request.",
    placeholder: "Share the improvement, workflow, or feature you would like to see.",
    submitLabel: "Send Idea",
    busyLabel: "Sending idea...",
    successMessage: "Thanks. Your idea was sent."
  },
  praise: {
    label: "Praise",
    emoji: "✨",
    helper: "Something that worked well or felt valuable.",
    placeholder: "Tell us what worked well or what made the experience better.",
    submitLabel: "Send Praise",
    busyLabel: "Sending praise...",
    successMessage: "Thanks. Your praise was sent."
  },
  feedback: {
    label: "Feedback",
    emoji: "💬",
    helper: "A general note, question, or product signal.",
    placeholder: "Send a note, question, or any context that helps the team understand your feedback.",
    submitLabel: "Send Feedback",
    busyLabel: "Sending feedback...",
    successMessage: "Thanks. Your feedback was sent."
  }
};

export class SendmuxFeedbackElement extends BaseHTMLElement {
  static observedAttributes = [
    "endpoint",
    "position",
    "brand-colour",
    "brand-color",
    "font-family",
    "powered-by",
    "button-label",
    "heading"
  ];

  private readonly root: ShadowRoot;
  private readonly instanceId: string;
  private config: SendmuxFeedbackConfig = {};
  private dialog?: HTMLDialogElement;
  private form?: HTMLFormElement;
  private closeButton?: HTMLButtonElement;
  private launcher?: HTMLButtonElement;
  private messageInput?: HTMLTextAreaElement;
  private errorElement?: HTMLElement;
  private successElement?: HTMLElement;
  private submitButton?: HTMLButtonElement;
  private selectedFeedbackType: FeedbackType = "issue";
  private currentStep: FormStep = "category";

  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
    instanceCount += 1;
    this.instanceId = `smx-feedback-${instanceCount}`;
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  configure(config: SendmuxFeedbackConfig) {
    this.config = { ...this.config, ...config };
    if (this.isConnected) this.render();
  }

  open() {
    this.ensureRendered();
    if (!this.dialog) return;

    this.resetStatus();

    if (!this.dialog.open && typeof this.dialog.showModal === "function") {
      this.dialog.showModal();
    } else if (!this.dialog.open) {
      this.dialog.setAttribute("open", "");
    }

    this.applyStepState();
    this.focusActiveStep();
    this.dispatchWidgetEvent("open");
  }

  close() {
    if (!this.dialog || (!this.dialog.open && !this.dialog.hasAttribute("open"))) return;

    if (typeof this.dialog.close === "function") {
      this.dialog.close();
    } else {
      this.dialog.removeAttribute("open");
      this.handleClosed();
    }
  }

  async submit() {
    const config = this.readConfig();
    if (!this.form || !this.submitButton) return;

    const formData = new FormData(this.form);
    const feedbackType = this.getCurrentFeedbackType(formData);
    const message = String(formData.get("message") ?? "");

    if (!message.trim()) {
      this.setError("Please enter your feedback before sending.");
      this.setStep("message", { focus: true });
      return;
    }

    const endpoint = this.resolveEndpoint(config.endpoint);
    if (!endpoint) {
      this.setError("Feedback endpoint is not configured.");
      return;
    }

    const payload = buildFeedbackPayload({
      feedbackType,
      message,
      user: config.user,
      metadata: config.metadata,
      location: window.location,
      title: document.title
    });

    this.setBusy(true);
    this.dispatchWidgetEvent("submit", payload);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "same-origin",
        keepalive: JSON.stringify(payload).length < 60_000
      });

      if (!response.ok) {
        throw new Error(`Feedback endpoint returned ${response.status}`);
      }

      this.setSuccess();
      this.dispatchWidgetEvent("success", payload);
    } catch (error) {
      this.setError("Something went wrong. Please try again.");
      this.dispatchWidgetEvent("error", { error, payload });
    } finally {
      this.setBusy(false);
    }
  }

  private ensureRendered() {
    if (!this.dialog) this.render();
  }

  private readConfig(): SendmuxFeedbackConfig {
    const windowConfig = window.sendmuxFeedback?.config ?? {};
    const { position: attrPosition, ...attrConfig } = this.readAttributeConfig();

    return {
      ...defaultConfig,
      ...windowConfig,
      ...this.config,
      ...attrConfig,
      position: normalisePosition(attrPosition ?? this.config.position ?? windowConfig.position ?? defaultConfig.position),
      brandColor: attrConfig.brandColor ?? getBrandColor(this.config) ?? getBrandColor(windowConfig) ?? defaultConfig.brandColor,
      poweredBy:
        attrConfig.poweredBy ?? this.config.poweredBy ?? windowConfig.poweredBy ?? defaultConfig.poweredBy
    };
  }

  private readAttributeConfig(): AttributeConfig {
    const poweredBy = this.getAttribute("powered-by");

    return {
      endpoint: this.getAttribute("endpoint") ?? undefined,
      position: this.getAttribute("position") ?? undefined,
      brandColor: this.getAttribute("brand-color") ?? this.getAttribute("brand-colour") ?? undefined,
      fontFamily: this.getAttribute("font-family") ?? undefined,
      poweredBy: poweredBy === null ? undefined : !boolFalseValues.has(poweredBy.trim().toLowerCase()),
      buttonLabel: this.getAttribute("button-label") ?? undefined,
      title: this.getAttribute("heading") ?? undefined
    };
  }

  private render() {
    const config = this.readConfig();
    const position = normalisePosition(config.position);
    const errorId = `${this.instanceId}-error`;
    const successId = `${this.instanceId}-success`;
    const selectedContent = feedbackTypeContent[this.selectedFeedbackType];
    const dialogLabel = escapeHtml(config.title ?? defaultConfig.title);

    this.style.setProperty("--smx-feedback-brand", config.brandColor ?? defaultConfig.brandColor);
    if (config.fontFamily) this.style.setProperty("--smx-feedback-font", config.fontFamily);
    else this.style.removeProperty("--smx-feedback-font");

    this.root.innerHTML = `
      <style>${styles}</style>
      <button class="launcher" part="launcher" type="button" aria-haspopup="dialog">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4.75 5.75h14.5v9.5H8.5l-3.75 3.5v-13Z"></path>
          <path d="M8.5 9.25h7"></path>
          <path d="M8.5 12.25h4.5"></path>
        </svg>
        <span>${escapeHtml(config.buttonLabel ?? defaultConfig.buttonLabel)}</span>
      </button>

      <dialog
        class="panel"
        part="dialog"
        data-position="${position}"
        aria-label="${dialogLabel}"
      >
        <form class="form" method="dialog" novalidate data-step="${this.currentStep}">
          <header class="header">
            <button class="icon-button" type="button" aria-label="Close feedback form">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m6.75 6.75 10.5 10.5"></path>
                <path d="m17.25 6.75-10.5 10.5"></path>
              </svg>
            </button>
          </header>

          <input type="hidden" name="feedback_type" value="${this.selectedFeedbackType}">

          <div class="step-shell">
            <section class="step step-category" aria-hidden="${this.currentStep !== "category"}">
              <div class="category-options" role="group" aria-label="Feedback category">
                ${categoryOption("issue", feedbackTypeContent.issue, this.selectedFeedbackType === "issue")}
                ${categoryOption("idea", feedbackTypeContent.idea, this.selectedFeedbackType === "idea")}
                ${categoryOption("praise", feedbackTypeContent.praise, this.selectedFeedbackType === "praise")}
                ${categoryOption("feedback", feedbackTypeContent.feedback, this.selectedFeedbackType === "feedback")}
              </div>
            </section>

            <section class="step step-message" aria-hidden="${this.currentStep !== "message"}">
              <div class="step-topline">
                <button class="back-button" type="button" data-back>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m15.25 6.75-5.5 5.25 5.5 5.25"></path>
                  </svg>
                  <span>Back</span>
                </button>
                <span class="selected-chip">
                  <span aria-hidden="true">${selectedContent.emoji}</span>
                  <span>${escapeHtml(selectedContent.label)}</span>
                </span>
              </div>

              <label class="field">
                <span class="visually-hidden">Message</span>
                <textarea
                  name="message"
                  rows="5"
                  maxlength="4000"
                  required
                  placeholder="${escapeHtml(selectedContent.placeholder)}"
                ></textarea>
              </label>

              <p id="${errorId}" class="status error" role="alert" hidden></p>
              <p id="${successId}" class="status success" role="status" hidden>
                <span class="status-icon" aria-hidden="true">✓</span>
                <span data-success-copy>${escapeHtml(selectedContent.successMessage)}</span>
              </p>

              <div class="actions">
                <button class="secondary" type="button" data-close>Cancel</button>
                <button class="primary" type="submit">${escapeHtml(selectedContent.submitLabel)}</button>
              </div>
            </section>
          </div>

          ${
            config.poweredBy
              ? `<a class="powered-by" href="https://sendmux.ai" target="_blank" rel="noopener">Powered by Sendmux</a>`
              : ""
          }
        </form>
      </dialog>
    `;

    this.dialog = this.root.querySelector(".panel") ?? undefined;
    this.form = this.root.querySelector(".form") ?? undefined;
    this.launcher = this.root.querySelector(".launcher") ?? undefined;
    this.closeButton = this.root.querySelector(".icon-button") ?? undefined;
    this.messageInput = this.root.querySelector("textarea") ?? undefined;
    this.errorElement = this.root.getElementById(errorId) ?? undefined;
    this.successElement = this.root.getElementById(successId) ?? undefined;
    this.submitButton = this.root.querySelector(".primary") ?? undefined;

    this.dataset.position = position;
    this.applyStepState();
    this.updateFeedbackTypeCopy();

    this.launcher?.addEventListener("click", () => this.open());
    this.closeButton?.addEventListener("click", () => this.close());
    this.root.querySelector("[data-close]")?.addEventListener("click", () => this.close());
    this.root.querySelector("[data-back]")?.addEventListener("click", () => this.setStep("category", { focus: true }));
    this.root.querySelectorAll<HTMLButtonElement>("[data-feedback-type]").forEach((button) => {
      button.addEventListener("click", () => this.selectFeedbackType(button.dataset.feedbackType));
    });
    this.form?.addEventListener("submit", (event) => {
      event.preventDefault();
      void this.submit();
    });
    this.dialog?.addEventListener("click", (event) => {
      if (event.target === this.dialog) this.close();
    });
    this.dialog?.addEventListener("close", () => this.handleClosed());
  }

  private resolveEndpoint(endpoint: string | undefined) {
    if (!endpoint) return null;

    try {
      const url = new URL(endpoint, window.location.href);
      if (url.protocol !== "http:" && url.protocol !== "https:") return null;
      return url.href;
    } catch {
      return null;
    }
  }

  private resetStatus() {
    if (this.errorElement) {
      this.errorElement.hidden = true;
      this.errorElement.textContent = "";
    }
    if (this.successElement) {
      this.successElement.hidden = true;
    }
    this.form?.removeAttribute("data-success");
  }

  private resetForm() {
    this.form?.reset();
    this.selectedFeedbackType = "issue";
    this.currentStep = "category";
    this.resetStatus();
    this.setBusy(false);
    this.applyStepState();
    this.updateFeedbackTypeCopy();
  }

  private setBusy(isBusy: boolean) {
    if (!this.submitButton) return;

    const content = feedbackTypeContent[this.selectedFeedbackType];
    this.submitButton.disabled = isBusy;
    this.submitButton.textContent = isBusy ? content.busyLabel : content.submitLabel;
  }

  private setError(message: string) {
    if (!this.errorElement) return;

    this.errorElement.hidden = false;
    this.errorElement.textContent = message;
    this.successElement?.setAttribute("hidden", "");
  }

  private setSuccess() {
    this.form?.setAttribute("data-success", "true");
    if (this.successElement) this.successElement.hidden = false;
    if (this.errorElement) this.errorElement.hidden = true;
  }

  private selectFeedbackType(value: string | undefined) {
    if (!value || !isFeedbackType(value)) return;

    this.selectedFeedbackType = value;
    this.updateFeedbackTypeCopy();
    this.applyCategoryState();
    this.setStep("message", { focus: true });
    this.dispatchWidgetEvent("category", { feedback_type: value });
  }

  private setStep(step: FormStep, options: { focus?: boolean } = {}) {
    this.currentStep = step;
    this.applyStepState();
    if (options.focus) this.focusActiveStep();
  }

  private applyStepState() {
    if (!this.form) return;

    this.form.dataset.step = this.currentStep;
    this.root.querySelectorAll<HTMLElement>(".step").forEach((stepElement) => {
      const isActive =
        (this.currentStep === "category" && stepElement.classList.contains("step-category")) ||
        (this.currentStep === "message" && stepElement.classList.contains("step-message"));

      stepElement.setAttribute("aria-hidden", String(!isActive));
      if (isActive) stepElement.removeAttribute("inert");
      else stepElement.setAttribute("inert", "");
    });
  }

  private applyCategoryState() {
    this.root.querySelectorAll<HTMLButtonElement>("[data-feedback-type]").forEach((button) => {
      const isSelected = button.dataset.feedbackType === this.selectedFeedbackType;
      button.setAttribute("aria-pressed", String(isSelected));
      button.toggleAttribute("data-selected", isSelected);
    });
  }

  private updateFeedbackTypeCopy() {
    const content = feedbackTypeContent[this.selectedFeedbackType];
    const hiddenTypeInput = this.root.querySelector<HTMLInputElement>('input[name="feedback_type"]');

    if (hiddenTypeInput) hiddenTypeInput.value = this.selectedFeedbackType;
    if (this.messageInput) this.messageInput.placeholder = content.placeholder;
    if (this.submitButton && !this.submitButton.disabled) this.submitButton.textContent = content.submitLabel;
    const successCopy = this.root.querySelector<HTMLElement>("[data-success-copy]");
    if (successCopy) successCopy.textContent = content.successMessage;

    const selectedChip = this.root.querySelector(".selected-chip");
    if (selectedChip) {
      selectedChip.innerHTML = `<span aria-hidden="true">${content.emoji}</span><span>${escapeHtml(content.label)}</span>`;
    }
  }

  private focusActiveStep() {
    const focus = () => {
      if (this.currentStep === "message") {
        this.messageInput?.focus();
        return;
      }

      const selectedButton =
        this.root.querySelector<HTMLButtonElement>(`[data-feedback-type="${this.selectedFeedbackType}"]`) ??
        this.root.querySelector<HTMLButtonElement>("[data-feedback-type]");
      selectedButton?.focus();
    };

    if (typeof window.requestAnimationFrame === "function") window.requestAnimationFrame(focus);
    else window.setTimeout(focus, 0);
  }

  private getCurrentFeedbackType(formData: FormData) {
    const value = String(formData.get("feedback_type") ?? this.selectedFeedbackType);
    if (!isFeedbackType(value)) return "feedback";

    this.selectedFeedbackType = value;
    return value;
  }

  private handleClosed() {
    this.resetForm();
    this.dispatchWidgetEvent("close");
  }

  private dispatchWidgetEvent(name: string, detail?: unknown) {
    this.dispatchEvent(
      new CustomEvent(`sendmux-feedback:${name}`, {
        bubbles: true,
        composed: true,
        detail
      })
    );
  }
}

function categoryOption(value: FeedbackType, content: FeedbackTypeContent, selected = false) {
  return `
    <button
      class="category-option"
      type="button"
      data-feedback-type="${value}"
      aria-pressed="${selected}"
      ${selected ? "data-selected" : ""}
    >
      <span class="category-emoji" aria-hidden="true">${content.emoji}</span>
      <span class="category-text">
        <strong>${escapeHtml(content.label)}</strong>
        <small>${escapeHtml(content.helper)}</small>
      </span>
    </button>
  `;
}

function getBrandColor(config: SendmuxFeedbackConfig | undefined) {
  const compatibilityConfig = config as (SendmuxFeedbackConfig & { brandColour?: string }) | undefined;
  return config?.brandColor ?? compatibilityConfig?.brandColour;
}

function isFeedbackType(value: string): value is FeedbackType {
  return Object.prototype.hasOwnProperty.call(feedbackTypeContent, value);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return map[char] ?? char;
  });
}
