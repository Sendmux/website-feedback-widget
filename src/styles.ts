export const styles = `
:host {
  --smx-feedback-brand: #4f46e5;
  --smx-feedback-font: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --smx-feedback-bg: #ffffff;
  --smx-feedback-fg: #101828;
  --smx-feedback-muted: #667085;
  --smx-feedback-border: #e4e7ec;
  --smx-feedback-subtle: #f9fafb;
  --smx-feedback-error-bg: #fff1f2;
  --smx-feedback-error-fg: #be123c;
  --smx-feedback-success-bg: #ecfdf3;
  --smx-feedback-success-fg: #027a48;
  --smx-feedback-radius: 0.625rem;
  --smx-feedback-offset: 1rem;
  --smx-feedback-offset-top: calc(var(--smx-feedback-offset) + env(safe-area-inset-top, 0px));
  --smx-feedback-offset-right: calc(var(--smx-feedback-offset) + env(safe-area-inset-right, 0px));
  --smx-feedback-offset-bottom: calc(var(--smx-feedback-offset) + env(safe-area-inset-bottom, 0px));
  --smx-feedback-offset-left: calc(var(--smx-feedback-offset) + env(safe-area-inset-left, 0px));
  --smx-feedback-z-index: 2147483000;

  position: fixed;
  z-index: var(--smx-feedback-z-index);
  font-family: var(--smx-feedback-font);
  color-scheme: light dark;
  pointer-events: auto;
}

:host([data-position="top-left"]) {
  top: var(--smx-feedback-offset);
  top: var(--smx-feedback-offset-top);
  left: var(--smx-feedback-offset);
  left: var(--smx-feedback-offset-left);
}

:host([data-position="top-center"]) {
  top: var(--smx-feedback-offset);
  top: var(--smx-feedback-offset-top);
  left: 50%;
  transform: translateX(-50%);
}

:host([data-position="top-right"]) {
  top: var(--smx-feedback-offset);
  top: var(--smx-feedback-offset-top);
  right: var(--smx-feedback-offset);
  right: var(--smx-feedback-offset-right);
}

:host([data-position="middle-left"]) {
  top: 50%;
  left: var(--smx-feedback-offset);
  left: var(--smx-feedback-offset-left);
  transform: translateY(-50%);
}

:host([data-position="middle-right"]) {
  top: 50%;
  right: var(--smx-feedback-offset);
  right: var(--smx-feedback-offset-right);
  transform: translateY(-50%);
}

:host([data-position="bottom-left"]) {
  bottom: var(--smx-feedback-offset);
  bottom: var(--smx-feedback-offset-bottom);
  left: var(--smx-feedback-offset);
  left: var(--smx-feedback-offset-left);
}

:host([data-position="bottom-center"]) {
  bottom: var(--smx-feedback-offset);
  bottom: var(--smx-feedback-offset-bottom);
  left: 50%;
  transform: translateX(-50%);
}

:host([data-position="bottom-right"]) {
  right: var(--smx-feedback-offset);
  right: var(--smx-feedback-offset-right);
  bottom: var(--smx-feedback-offset);
  bottom: var(--smx-feedback-offset-bottom);
}

* {
  box-sizing: border-box;
}

svg {
  width: 1.125em;
  height: 1.125em;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.75;
}

button,
textarea,
input {
  font: inherit;
}

button {
  min-height: 2.5rem;
}

button:focus-visible,
textarea:focus-visible,
a:focus-visible,
input:focus-visible + span {
  outline: 2px solid var(--smx-feedback-brand);
  outline-offset: 2px;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.launcher {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: max-content;
  border: 1px solid var(--smx-feedback-brand);
  border-color: color-mix(in srgb, var(--smx-feedback-brand) 36%, transparent);
  border-radius: 999px;
  padding: 0 1rem;
  background: var(--smx-feedback-brand);
  color: #ffffff;
  box-shadow: 0 10px 26px rgb(16 24 40 / 18%);
  font-weight: 700;
  cursor: pointer;
}

.panel {
  width: min(24rem, calc(100vw - 2rem));
  max-height: calc(100vh - 2rem);
  max-height: calc(100dvh - 2rem);
  overflow: auto;
  border: 1px solid var(--smx-feedback-border);
  border-radius: var(--smx-feedback-radius);
  padding: 0;
  background: var(--smx-feedback-bg);
  color: var(--smx-feedback-fg);
  box-shadow: 0 24px 80px rgb(16 24 40 / 24%);
}

.panel::backdrop {
  background: rgb(15 23 42 / 36%);
  -webkit-backdrop-filter: blur(2.5px);
  backdrop-filter: blur(2.5px);
}

.panel[data-position="top-left"] {
  margin: var(--smx-feedback-offset) auto auto var(--smx-feedback-offset);
}

.panel[data-position="top-center"] {
  margin: var(--smx-feedback-offset) auto auto;
}

.panel[data-position="top-right"] {
  margin: var(--smx-feedback-offset) var(--smx-feedback-offset) auto auto;
}

.panel[data-position="middle-left"] {
  margin: auto auto auto var(--smx-feedback-offset);
}

.panel[data-position="middle-right"] {
  margin: auto var(--smx-feedback-offset) auto auto;
}

.panel[data-position="bottom-left"] {
  margin: auto auto var(--smx-feedback-offset) var(--smx-feedback-offset);
}

.panel[data-position="bottom-center"] {
  margin: auto auto var(--smx-feedback-offset);
}

.panel[data-position="bottom-right"] {
  margin: auto var(--smx-feedback-offset) var(--smx-feedback-offset) auto;
}

.form {
  display: grid;
  gap: 1rem;
  padding: 1rem;
}

.header {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 1rem;
  min-height: 2.25rem;
}

h2,
h3,
p {
  margin: 0;
}

h2 {
  font-size: 1rem;
  line-height: 1.3;
  font-weight: 700;
}

.header p {
  margin-top: 0.25rem;
  color: var(--smx-feedback-muted);
  font-size: 0.875rem;
  line-height: 1.45;
}

.icon-button {
  flex: 0 0 auto;
  width: 2.25rem;
  min-height: 2.25rem;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: var(--smx-feedback-muted);
  cursor: pointer;
}

.icon-button:hover {
  background: var(--smx-feedback-subtle);
  color: var(--smx-feedback-fg);
}

.step-shell {
  display: grid;
  overflow: visible;
}

.step {
  display: grid;
  gap: 1rem;
  max-height: 34rem;
  overflow: visible;
  opacity: 1;
  transform: translateX(0);
}

.step[aria-hidden="true"] {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}

.form[data-step="category"] .step-message {
  transform: translateX(0.75rem);
}

.form[data-step="message"] .step-category {
  transform: translateX(-0.75rem);
}

.category-options {
  display: grid;
  gap: 0.5rem;
}

.category-option {
  width: 100%;
  min-height: 4.25rem;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 0.75rem;
  border: 1px solid var(--smx-feedback-border);
  border-radius: 0.5rem;
  padding: 0.75rem;
  background: var(--smx-feedback-bg);
  color: var(--smx-feedback-fg);
  text-align: left;
  cursor: pointer;
}

.category-option:hover,
.category-option[data-selected] {
  border-color: var(--smx-feedback-brand);
  border-color: color-mix(in srgb, var(--smx-feedback-brand) 72%, transparent);
  background: color-mix(in srgb, var(--smx-feedback-brand) 9%, var(--smx-feedback-bg));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--smx-feedback-brand) 72%, transparent);
}

.category-option:focus-visible {
  outline: 0;
  border-color: var(--smx-feedback-brand);
  border-color: color-mix(in srgb, var(--smx-feedback-brand) 72%, transparent);
  box-shadow: inset 0 0 0 1px var(--smx-feedback-brand);
}

.category-emoji {
  display: flex;
  width: 2.25rem;
  height: 2.25rem;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--smx-feedback-subtle);
  font-size: 1.125rem;
  line-height: 1;
}

.category-text {
  display: grid;
  gap: 0.125rem;
  min-width: 0;
}

.category-text strong {
  font-size: 0.9375rem;
  line-height: 1.25;
}

.category-text small {
  color: var(--smx-feedback-muted);
  font-size: 0.8125rem;
  line-height: 1.35;
}

.step-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.back-button,
.selected-chip {
  display: inline-flex;
  min-height: 2rem;
  align-items: center;
  gap: 0.375rem;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 700;
}

.back-button {
  border: 1px solid transparent;
  padding: 0 0.25rem 0 0;
  background: transparent;
  color: var(--smx-feedback-muted);
  cursor: pointer;
}

.back-button:hover {
  color: var(--smx-feedback-brand);
}

.selected-chip {
  min-width: 0;
  border: 1px solid color-mix(in srgb, var(--smx-feedback-brand) 28%, transparent);
  padding: 0 0.625rem;
  background: color-mix(in srgb, var(--smx-feedback-brand) 9%, var(--smx-feedback-bg));
  color: var(--smx-feedback-fg);
}

.field {
  display: grid;
  gap: 0.375rem;
}

.field > span {
  color: var(--smx-feedback-fg);
  font-size: 0.8125rem;
  font-weight: 700;
}

textarea {
  width: 100%;
  min-height: 7rem;
  resize: vertical;
  border: 1px solid var(--smx-feedback-border);
  border-radius: 0.5rem;
  padding: 0.75rem;
  background: var(--smx-feedback-bg);
  color: var(--smx-feedback-fg);
  line-height: 1.5;
}

textarea::placeholder {
  color: var(--smx-feedback-muted);
}

.status {
  border-radius: 0.5rem;
  padding: 0.75rem;
  font-size: 0.875rem;
  line-height: 1.45;
}

.error {
  background: var(--smx-feedback-error-bg);
  color: var(--smx-feedback-error-fg);
}

.success {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  background: var(--smx-feedback-success-bg);
  color: var(--smx-feedback-success-fg);
}

.status-icon {
  display: inline-flex;
  width: 1.25rem;
  height: 1.25rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: currentColor;
  color: var(--smx-feedback-bg);
  font-size: 0.8125rem;
  font-weight: 900;
  line-height: 1;
}

.actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.secondary,
.primary {
  width: 100%;
  border-radius: 0.5rem;
  padding: 0 0.875rem;
  font-weight: 700;
  cursor: pointer;
}

.secondary {
  border: 1px solid var(--smx-feedback-border);
  background: var(--smx-feedback-bg);
  color: var(--smx-feedback-fg);
}

.primary {
  border: 1px solid var(--smx-feedback-brand);
  background: var(--smx-feedback-brand);
  color: #ffffff;
}

.primary:disabled {
  cursor: wait;
  opacity: 0.7;
}

.powered-by {
  justify-self: center;
  color: var(--smx-feedback-muted);
  opacity: 0.58;
  font-size: 0.6875rem;
  font-weight: 400;
  text-decoration: none;
}

.powered-by:hover {
  color: var(--smx-feedback-muted);
  opacity: 0.82;
  text-decoration: none;
}

@media (prefers-color-scheme: dark) {
  :host {
    --smx-feedback-bg: #151927;
    --smx-feedback-fg: #f8fafc;
    --smx-feedback-muted: #b8c0cc;
    --smx-feedback-border: #30384c;
    --smx-feedback-subtle: #202638;
    --smx-feedback-error-bg: #3b111b;
    --smx-feedback-error-fg: #fda4af;
    --smx-feedback-success-bg: #0f2f24;
    --smx-feedback-success-fg: #86efac;
  }

  .panel::backdrop {
    background: rgb(3 7 18 / 56%);
    -webkit-backdrop-filter: blur(2.5px);
    backdrop-filter: blur(2.5px);
  }
}

@media (prefers-reduced-motion: no-preference) {
  .launcher,
  .category-option,
  .step,
  .back-button,
  .icon-button,
  .primary,
  .secondary {
    transition:
      background-color 160ms ease,
      border-color 160ms ease,
      box-shadow 160ms ease,
      color 160ms ease,
      max-height 220ms ease,
      opacity 160ms ease,
      transform 160ms ease;
  }

  .launcher:hover,
  .primary:hover {
    transform: translateY(-1px);
  }
}

@media (max-width: 420px) {
  :host {
    --smx-feedback-offset: 0.75rem;
  }

  .panel {
    width: calc(100vw - 1rem);
  }
}
`;
