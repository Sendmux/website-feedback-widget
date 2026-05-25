import { SendmuxFeedbackElement, tagName } from "./sendmux-feedback";
import type { SendmuxFeedbackConfig, SendmuxFeedbackGlobal } from "./types";

export { SendmuxFeedbackElement, tagName };
export type {
  FeedbackType,
  JsonObject,
  SendmuxFeedbackConfig,
  SendmuxFeedbackGlobal,
  SendmuxFeedbackPayload,
  SendmuxFeedbackPosition
} from "./types";

declare global {
  interface Window {
    sendmuxFeedback?: Partial<SendmuxFeedbackGlobal> & {
      config?: SendmuxFeedbackConfig;
    };
  }

  interface HTMLElementTagNameMap {
    "sendmux-feedback": SendmuxFeedbackElement;
  }
}

const existingGlobal = typeof window !== "undefined" ? window.sendmuxFeedback : undefined;
const globalConfig: SendmuxFeedbackConfig = { ...(existingGlobal?.config ?? {}) };

function getWidgets() {
  if (typeof document === "undefined") return [];
  if (typeof window === "undefined" || !("customElements" in window) || !customElements.get(tagName)) return [];
  return Array.from(document.querySelectorAll<SendmuxFeedbackElement>(tagName));
}

function getDefaultWidget(config?: SendmuxFeedbackConfig) {
  if (typeof document === "undefined") return null;
  if (typeof window === "undefined" || !("customElements" in window)) return null;

  defineSendmuxFeedback();
  if (!customElements.get(tagName)) return null;

  let widget = document.querySelector<SendmuxFeedbackElement>(tagName);

  if (!widget) {
    widget = document.createElement(tagName);
    document.body.appendChild(widget);
  }

  if (config) widget.configure(config);
  return widget;
}

export function defineSendmuxFeedback() {
  if (typeof window === "undefined") return;
  if (!("customElements" in window)) return;
  if (!customElements.get(tagName)) {
    customElements.define(tagName, SendmuxFeedbackElement);
  }
}

export function configureSendmuxFeedback(config: SendmuxFeedbackConfig) {
  Object.assign(globalConfig, config);
  getWidgets().forEach((widget) => widget.configure(config));
}

export function openSendmuxFeedback(config?: SendmuxFeedbackConfig) {
  const widget = getDefaultWidget(config);
  if (!widget) return null;
  widget.open();
  return widget;
}

export function closeSendmuxFeedback() {
  getWidgets().forEach((widget) => widget.close());
}

function installGlobalApi() {
  if (typeof window === "undefined") return;
  if (typeof document === "undefined") return;

  defineSendmuxFeedback();

  const api: SendmuxFeedbackGlobal = {
    config: globalConfig,
    configure: configureSendmuxFeedback,
    open: openSendmuxFeedback,
    close: closeSendmuxFeedback
  };

  window.sendmuxFeedback = { ...(existingGlobal ?? {}), ...api };

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const trigger = target.closest("[data-sendmux-feedback-button]");
    if (!trigger) return;

    event.preventDefault();
    openSendmuxFeedback();
  });
}

installGlobalApi();
