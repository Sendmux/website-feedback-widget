import { buildFeedbackPayload } from "./payload";
import { normalisePosition } from "./position";
import { styles } from "./styles";
import type { FeedbackType, SendmuxFeedbackConfig } from "./types";

export const tagName = "sendmux-feedback";

const defaultConfig: Required<
  Pick<SendmuxFeedbackConfig, "buttonLabel" | "title" | "brandColor" | "position" | "poweredBy">
> = {
  buttonLabel: "Feedback",
  title: "Send feedback",
  brandColor: "oklch(0.556 0.19 264)",
  position: "bottom-right",
  poweredBy: true
};

const maxMessageLength = 2000;
const boolFalseValues = new Set(["false", "0", "off", "no"]);
let instanceCount = 0;
const BaseHTMLElement: typeof HTMLElement =
  typeof HTMLElement === "undefined" ? (class {} as unknown as typeof HTMLElement) : HTMLElement;

type FormStep = "category" | "message" | "success" | "error";

type AttributeConfig = Omit<SendmuxFeedbackConfig, "position"> & {
  position?: string;
};

interface RenderTemplateParams {
  config: SendmuxFeedbackConfig;
  position: string;
  errorId: string;
  characterCountId: string;
  selectedContent: FeedbackTypeContent;
  dialogLabel: string;
}

interface FeedbackTypeContent {
  label: string;
  helper: string;
  placeholder: string;
  submitLabel: string;
  busyLabel: string;
  successBody: string;
  ariaLabel: string;
  icon: string;
}

const feedbackTypeContent: Record<FeedbackType, FeedbackTypeContent> = {
  issue: {
    label: "Issue",
    helper: "Something broke or behaved unexpectedly.",
    placeholder: "Tell us what broke, what you expected, and where it happened.",
    submitLabel: "Send issue",
    busyLabel: "Sending issue...",
    successBody: "Your issue is on its way to the team. We'll reach out if we need more detail.",
    ariaLabel: "Your issue",
    icon: iconIssue()
  },
  idea: {
    label: "Idea",
    helper: "A feature request or improvement.",
    placeholder: "Share the improvement, workflow, or feature you would like to see.",
    submitLabel: "Send idea",
    busyLabel: "Sending idea...",
    successBody: "Your idea is on its way to the team. We'll reach out if we need more detail.",
    ariaLabel: "Your idea",
    icon: iconIdea()
  },
  praise: {
    label: "Praise",
    helper: "Something that worked well or felt valuable.",
    placeholder: "Tell us what worked well or what made the experience better.",
    submitLabel: "Send praise",
    busyLabel: "Sending praise...",
    successBody: "Your praise is on its way to the team. We'll reach out if we need more detail.",
    ariaLabel: "Your praise",
    icon: iconPraise()
  },
  feedback: {
    label: "Feedback",
    helper: "A general note, question, or product signal.",
    placeholder: "Send a note, question, or any context that helps the team understand your feedback.",
    submitLabel: "Send feedback",
    busyLabel: "Sending feedback...",
    successBody: "Your feedback is on its way to the team. We'll reach out if we need more detail.",
    ariaLabel: "Your feedback",
    icon: iconFeedback()
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
    "heading",
    "min-message-length"
  ];

  private readonly root: ShadowRoot;
  private readonly instanceId: string;
  private config: SendmuxFeedbackConfig = {};
  private dialog?: HTMLDialogElement;
  private form?: HTMLFormElement;
  private launcher?: HTMLButtonElement;
  private messageInput?: HTMLTextAreaElement;
  private errorElement?: HTMLElement;
  private submitButton?: HTMLButtonElement;
  private characterCounter?: HTMLElement;
  private selectedFeedbackType: FeedbackType = "issue";
  private currentStep: FormStep = "category";
  private minMessageLength = 1;

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
    const validationError = this.getMessageValidationError(message);

    if (validationError) {
      this.setInlineError(validationError);
      this.setStep("message", { focus: true });
      return;
    }

    const endpoint = this.resolveEndpoint(config.endpoint);
    if (!endpoint) {
      this.setInlineError("Feedback endpoint is not configured.");
      this.setStep("message", { focus: true });
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

      this.resetStatus();
      this.setStep("success", { focus: true });
      this.dispatchWidgetEvent("success", payload);
    } catch (error) {
      this.resetStatus();
      this.setStep("error", { focus: true });
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
      poweredBy: attrConfig.poweredBy ?? this.config.poweredBy ?? windowConfig.poweredBy ?? defaultConfig.poweredBy,
      minMessageLength: normaliseMinMessageLength(
        attrConfig.minMessageLength ?? this.config.minMessageLength ?? windowConfig.minMessageLength
      )
    };
  }

  private readAttributeConfig(): AttributeConfig {
    const config: AttributeConfig = {};
    const poweredBy = this.getAttribute("powered-by");
    const minMessageLength = this.getAttribute("min-message-length");
    const endpoint = this.getAttribute("endpoint");
    const position = this.getAttribute("position");
    const brandColor = this.getAttribute("brand-color") ?? this.getAttribute("brand-colour");
    const fontFamily = this.getAttribute("font-family");
    const buttonLabel = this.getAttribute("button-label");
    const title = this.getAttribute("heading");

    if (endpoint !== null) config.endpoint = endpoint;
    if (position !== null) config.position = position;
    if (brandColor !== null) config.brandColor = brandColor;
    if (fontFamily !== null) config.fontFamily = fontFamily;
    if (poweredBy !== null) config.poweredBy = !boolFalseValues.has(poweredBy.trim().toLowerCase());
    if (buttonLabel !== null) config.buttonLabel = buttonLabel;
    if (title !== null) config.title = title;
    if (minMessageLength !== null) config.minMessageLength = Number(minMessageLength);

    return config;
  }

  private render() {
    const config = this.readConfig();
    const position = normalisePosition(config.position);
    const errorId = `${this.instanceId}-error`;
    const characterCountId = `${this.instanceId}-character-count`;
    const selectedContent = feedbackTypeContent[this.selectedFeedbackType];
    const dialogLabel = escapeHtml(config.title ?? defaultConfig.title);
    this.minMessageLength = normaliseMinMessageLength(config.minMessageLength);

    this.applyConfigStyles(config);
    this.root.innerHTML = this.renderTemplate({
      config,
      position,
      errorId,
      characterCountId,
      selectedContent,
      dialogLabel
    });
    this.cacheElements(errorId);

    this.dataset.position = position;
    this.applyStepState();
    this.syncFeedbackTypeState();
    this.updateCharacterCount();
    this.bindEvents();
  }

  private applyConfigStyles(config: SendmuxFeedbackConfig) {
    this.style.setProperty("--smx-feedback-brand", config.brandColor ?? defaultConfig.brandColor);
    if (config.fontFamily) this.style.setProperty("--smx-feedback-font", config.fontFamily);
    else this.style.removeProperty("--smx-feedback-font");
  }

  private renderTemplate({ config, position, errorId, characterCountId, selectedContent, dialogLabel }: RenderTemplateParams) {
    return `
      <style>${styles}</style>
      <button class="launcher" part="launcher" type="button" aria-haspopup="dialog">
        ${iconFeedback()}
        <span>${escapeHtml(config.buttonLabel ?? defaultConfig.buttonLabel)}</span>
      </button>

      <dialog
        class="panel"
        part="dialog"
        data-position="${position}"
        aria-label="${dialogLabel}"
      >
        <form class="form" method="dialog" novalidate data-step="${this.currentStep}">
          <input type="hidden" name="feedback_type" value="${this.selectedFeedbackType}">

          <section class="step step-category" aria-hidden="${this.currentStep !== "category"}">
            <header class="widget__head">
              <h2 class="widget__title">What's on your mind?</h2>
              <button class="widget__close" type="button" aria-label="Close">
                ${iconClose()}
              </button>
            </header>

            <div class="options" role="radiogroup" aria-label="Feedback category">
              ${categoryOption("issue", feedbackTypeContent.issue, this.selectedFeedbackType === "issue")}
              ${categoryOption("idea", feedbackTypeContent.idea, this.selectedFeedbackType === "idea")}
              ${categoryOption("praise", feedbackTypeContent.praise, this.selectedFeedbackType === "praise")}
              ${categoryOption("feedback", feedbackTypeContent.feedback, this.selectedFeedbackType === "feedback")}
            </div>
          </section>

          <section class="step step-message" aria-hidden="${this.currentStep !== "message"}">
            <header class="widget__head">
              <button class="widget__back" type="button" aria-label="Back to categories" data-back>
                ${iconBack()}
                <span>Back</span>
              </button>

              <span class="pill pill--${this.selectedFeedbackType}" aria-label="Selected category: ${selectedContent.label}">
                <span class="pill__glyph" aria-hidden="true">${selectedContent.icon}</span>
                <span>${escapeHtml(selectedContent.label)}</span>
              </span>
            </header>

            <div class="compose">
              <div class="compose__field">
                <textarea
                  class="compose__textarea"
                  name="message"
                  minlength="${this.minMessageLength}"
                  maxlength="${maxMessageLength}"
                  required
                  aria-label="${escapeHtml(selectedContent.ariaLabel)}"
                  aria-describedby="${errorId} ${characterCountId}"
                  aria-invalid="false"
                  placeholder="${escapeHtml(selectedContent.placeholder)}"
                ></textarea>
              </div>

              <p id="${errorId}" class="inline-error" role="alert" hidden></p>

              <div class="compose__meta">
                <span>We'll reply at the email on file.</span>
                <span id="${characterCountId}" data-character-count>0 / ${maxMessageLength}</span>
              </div>

              <div class="actions">
                <button class="btn btn--ghost" type="button" data-close>Cancel</button>
                <button class="btn btn--primary" type="submit">${escapeHtml(selectedContent.submitLabel)}</button>
              </div>
            </div>
          </section>

          <section class="step step-success" aria-hidden="${this.currentStep !== "success"}">
            <header class="widget__head">
              <h2 class="widget__title" aria-hidden="true">&nbsp;</h2>
              <button class="widget__close" type="button" aria-label="Close">
                ${iconClose()}
              </button>
            </header>

            <div class="status-screen status-screen--success" role="status" aria-live="polite">
              <div class="status-screen__icon" aria-hidden="true">${iconCheck()}</div>
              <h3 class="status-screen__title">Thanks — we got it</h3>
              <p class="status-screen__body" data-success-copy>${escapeHtml(selectedContent.successBody)}</p>
              <div class="status-screen__actions">
                <button class="btn btn--ghost" type="button" data-send-another>Send another</button>
                <button class="btn btn--primary" type="button" data-close>Done</button>
              </div>
            </div>
          </section>

          <section class="step step-error" aria-hidden="${this.currentStep !== "error"}">
            <header class="widget__head">
              <button class="widget__back" type="button" aria-label="Back to compose" data-back-to-message>
                ${iconBack()}
                <span>Back</span>
              </button>
              <button class="widget__close" type="button" aria-label="Close">
                ${iconClose()}
              </button>
            </header>

            <div class="status-screen status-screen--error" role="alert">
              <div class="status-screen__icon" aria-hidden="true">${iconError()}</div>
              <h3 class="status-screen__title">Couldn't send your feedback</h3>
              <p class="status-screen__body">Something went wrong on our end. Your draft is saved — try again in a moment.</p>
              <div class="status-screen__actions">
                <button class="btn btn--ghost" type="button" data-close>Cancel</button>
                <button class="btn btn--primary" type="button" data-try-again>
                  ${iconRetry()}
                  <span>Try again</span>
                </button>
              </div>
            </div>
          </section>

          ${
            config.poweredBy
              ? `<a class="powered-by" href="https://sendmux.ai" target="_blank" rel="noopener">Powered by Sendmux</a>`
              : ""
          }
        </form>
      </dialog>
    `;
  }

  private cacheElements(errorId: string) {
    this.dialog = this.root.querySelector(".panel") ?? undefined;
    this.form = this.root.querySelector(".form") ?? undefined;
    this.launcher = this.root.querySelector(".launcher") ?? undefined;
    this.messageInput = this.root.querySelector("textarea") ?? undefined;
    this.errorElement = this.root.getElementById(errorId) ?? undefined;
    this.submitButton = this.root.querySelector(".btn--primary[type='submit']") ?? undefined;
    this.characterCounter = this.root.querySelector("[data-character-count]") ?? undefined;
  }

  private bindEvents() {
    this.launcher?.addEventListener("click", () => this.open());
    this.root.querySelectorAll<HTMLButtonElement>(".widget__close, [data-close]").forEach((button) => {
      button.addEventListener("click", () => this.close());
    });
    this.root.querySelector("[data-back]")?.addEventListener("click", () => this.setStep("category", { focus: true }));
    this.root
      .querySelector("[data-back-to-message]")
      ?.addEventListener("click", () => this.setStep("message", { focus: true }));
    this.root.querySelector("[data-send-another]")?.addEventListener("click", () => this.resetForm());
    this.root.querySelector("[data-try-again]")?.addEventListener("click", () => void this.submit());
    this.root.querySelectorAll<HTMLButtonElement>("[data-feedback-type]").forEach((button) => {
      button.addEventListener("click", () => this.selectFeedbackType(button.dataset.feedbackType));
    });
    this.messageInput?.addEventListener("input", () => this.handleMessageInput());
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
    this.messageInput?.setAttribute("aria-invalid", "false");
    this.messageInput?.setCustomValidity("");
  }

  private resetForm() {
    this.form?.reset();
    this.selectedFeedbackType = "issue";
    this.currentStep = "category";
    this.resetStatus();
    this.setBusy(false);
    this.applyStepState();
    this.syncFeedbackTypeState();
    this.updateCharacterCount();
  }

  private setBusy(isBusy: boolean) {
    if (!this.submitButton) return;

    const content = feedbackTypeContent[this.selectedFeedbackType];
    this.submitButton.disabled = isBusy;
    this.submitButton.textContent = isBusy ? content.busyLabel : content.submitLabel;
  }

  private setInlineError(message: string) {
    if (!this.errorElement) return;

    this.errorElement.hidden = false;
    this.errorElement.textContent = message;
    this.messageInput?.setAttribute("aria-invalid", "true");
    this.messageInput?.setCustomValidity(message);
  }

  private selectFeedbackType(value: string | undefined) {
    if (!value || !isFeedbackType(value)) return;

    this.selectedFeedbackType = value;
    this.syncFeedbackTypeState();
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
        (this.currentStep === "message" && stepElement.classList.contains("step-message")) ||
        (this.currentStep === "success" && stepElement.classList.contains("step-success")) ||
        (this.currentStep === "error" && stepElement.classList.contains("step-error"));

      stepElement.setAttribute("aria-hidden", String(!isActive));
      if (isActive) stepElement.removeAttribute("inert");
      else stepElement.setAttribute("inert", "");
    });
  }

  private applyCategoryState() {
    this.root.querySelectorAll<HTMLButtonElement>("[data-feedback-type]").forEach((button) => {
      const isSelected = button.dataset.feedbackType === this.selectedFeedbackType;
      button.setAttribute("aria-checked", String(isSelected));
    });
  }

  private syncFeedbackTypeState() {
    const content = feedbackTypeContent[this.selectedFeedbackType];

    this.syncFeedbackTypeField();
    this.updateMessagePrompt(content);
    this.updateSubmitLabel(content);
    this.updateSuccessCopy(content);
    this.updateSelectedPill(content);
  }

  private syncFeedbackTypeField() {
    const hiddenTypeInput = this.root.querySelector<HTMLInputElement>('input[name="feedback_type"]');
    if (hiddenTypeInput) hiddenTypeInput.value = this.selectedFeedbackType;
  }

  private updateMessagePrompt(content: FeedbackTypeContent) {
    if (this.messageInput) {
      this.messageInput.placeholder = content.placeholder;
      this.messageInput.setAttribute("aria-label", content.ariaLabel);
    }
  }

  private updateSubmitLabel(content: FeedbackTypeContent) {
    if (this.submitButton && !this.submitButton.disabled) this.submitButton.textContent = content.submitLabel;
  }

  private updateSuccessCopy(content: FeedbackTypeContent) {
    const successCopy = this.root.querySelector<HTMLElement>("[data-success-copy]");
    if (successCopy) successCopy.textContent = content.successBody;
  }

  private updateSelectedPill(content: FeedbackTypeContent) {
    const selectedChip = this.root.querySelector(".pill");
    if (selectedChip) {
      selectedChip.className = `pill pill--${this.selectedFeedbackType}`;
      selectedChip.setAttribute("aria-label", `Selected category: ${content.label}`);
      selectedChip.innerHTML = `
        <span class="pill__glyph" aria-hidden="true">${content.icon}</span>
        <span>${escapeHtml(content.label)}</span>
      `;
    }
  }

  private updateCharacterCount() {
    if (!this.messageInput || !this.characterCounter) return;
    this.characterCounter.textContent = `${this.messageInput.value.length} / ${maxMessageLength}`;
  }

  private focusActiveStep() {
    const focus = () => {
      if (this.currentStep === "message") {
        this.messageInput?.focus();
        return;
      }

      if (this.currentStep === "success") {
        this.root.querySelector<HTMLButtonElement>("[data-close]")?.focus();
        return;
      }

      if (this.currentStep === "error") {
        this.root.querySelector<HTMLButtonElement>("[data-try-again]")?.focus();
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

  private getMessageValidationError(message: string) {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) return "Please enter your feedback before sending.";
    if (trimmedMessage.length < this.minMessageLength) {
      return `Add a little more detail (${this.minMessageLength}+ characters).`;
    }

    return null;
  }

  private handleMessageInput() {
    if (!this.messageInput) return;

    this.updateCharacterCount();
    if (!this.errorElement || this.errorElement.hidden) return;
    if (this.getMessageValidationError(this.messageInput.value)) return;

    this.resetStatus();
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
      class="option option--${value}"
      type="button"
      role="radio"
      data-feedback-type="${value}"
      aria-checked="${selected}"
    >
      <span class="option__icon" aria-hidden="true">${content.icon}</span>
      <span class="option__body">
        <span class="option__label">${escapeHtml(content.label)}</span>
        <span class="option__desc">${escapeHtml(content.helper)}</span>
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

function normaliseMinMessageLength(value: number | undefined) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 1;
  return Math.min(Math.max(Math.floor(numericValue), 1), maxMessageLength);
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

function iconClose() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 6 6 18"></path>
      <path d="m6 6 12 12"></path>
    </svg>
  `;
}

function iconBack() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 18-6-6 6-6"></path>
    </svg>
  `;
}

function iconIssue() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
      <path d="M12 9v4"></path>
      <path d="M12 17h.01"></path>
    </svg>
  `;
}

function iconIdea() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
      <path d="M9 18h6"></path>
      <path d="M10 22h4"></path>
    </svg>
  `;
}

function iconPraise() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
      <path d="M20 3v4"></path>
      <path d="M22 5h-4"></path>
      <path d="M4 17v2"></path>
      <path d="M5 18H3"></path>
    </svg>
  `;
}

function iconFeedback() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"></path>
      <path d="M8 12h.01"></path>
      <path d="M12 12h.01"></path>
      <path d="M16 12h.01"></path>
    </svg>
  `;
}

function iconCheck() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 6 9 17l-5-5"></path>
    </svg>
  `;
}

function iconError() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 8v4"></path>
      <path d="M12 16h.01"></path>
    </svg>
  `;
}

function iconRetry() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 3-6.7"></path>
      <path d="M3 4v5h5"></path>
    </svg>
  `;
}
