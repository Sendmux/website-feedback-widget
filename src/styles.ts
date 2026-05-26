export const styles = `
:host {
  --smx-feedback-brand: #4f46e5;
  --smx-feedback-font: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --smx-feedback-radius: 0.425rem;
  --smx-feedback-radius-md: calc(var(--smx-feedback-radius) - 2px);
  --smx-feedback-radius-lg: var(--smx-feedback-radius);
  --smx-feedback-radius-xl: calc(var(--smx-feedback-radius) + 4px);
  --smx-feedback-bg: oklch(1 0 0);
  --smx-feedback-fg: oklch(0.345 0.006 264);
  --smx-feedback-card: oklch(1 0 0);
  --smx-feedback-muted: oklch(0.553 0.013 58.071);
  --smx-feedback-subtle: oklch(0.96 0.001 106.424);
  --smx-feedback-border: oklch(0.94 0 0);
  --smx-feedback-primary-softer: color-mix(in srgb, var(--smx-feedback-brand) 5%, transparent);
  --smx-feedback-primary-border: color-mix(in srgb, var(--smx-feedback-brand) 72%, transparent);
  --smx-feedback-success-bg: #f0fdf4;
  --smx-feedback-success-fg: #15803d;
  --smx-feedback-success-border: #bbf7d0;
  --smx-feedback-error-bg: #fef2f2;
  --smx-feedback-error-fg: #b91c1c;
  --smx-feedback-error-border: #fecaca;
  --smx-feedback-warning-bg: #fef3c7;
  --smx-feedback-warning-fg: #b45309;
  --smx-feedback-idea-bg: #fef9c3;
  --smx-feedback-idea-fg: #a16207;
  --smx-feedback-praise-bg: #ede9fe;
  --smx-feedback-praise-fg: #6d28d9;
  --smx-feedback-note-bg: #dbeafe;
  --smx-feedback-note-fg: #1f4ed8;
  --smx-feedback-offset: 1rem;
  --smx-feedback-offset-top: calc(var(--smx-feedback-offset) + env(safe-area-inset-top, 0px));
  --smx-feedback-offset-right: calc(var(--smx-feedback-offset) + env(safe-area-inset-right, 0px));
  --smx-feedback-offset-bottom: calc(var(--smx-feedback-offset) + env(safe-area-inset-bottom, 0px));
  --smx-feedback-offset-left: calc(var(--smx-feedback-offset) + env(safe-area-inset-left, 0px));
  --smx-feedback-z-index: 2147483000;

  position: fixed;
  z-index: var(--smx-feedback-z-index);
  font-family: var(--smx-feedback-font);
  color: var(--smx-feedback-fg);
  color-scheme: light dark;
  pointer-events: auto;
  letter-spacing: -0.01em;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

:host([data-position="top-left"]) {
  top: var(--smx-feedback-offset-top);
  left: var(--smx-feedback-offset-left);
}

:host([data-position="top-center"]) {
  top: var(--smx-feedback-offset-top);
  left: 50%;
  transform: translateX(-50%);
}

:host([data-position="top-right"]) {
  top: var(--smx-feedback-offset-top);
  right: var(--smx-feedback-offset-right);
}

:host([data-position="middle-left"]) {
  top: 50%;
  left: var(--smx-feedback-offset-left);
  transform: translateY(-50%);
}

:host([data-position="middle-right"]) {
  top: 50%;
  right: var(--smx-feedback-offset-right);
  transform: translateY(-50%);
}

:host([data-position="center"]) {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

:host([data-position="bottom-left"]) {
  bottom: var(--smx-feedback-offset-bottom);
  left: var(--smx-feedback-offset-left);
}

:host([data-position="bottom-center"]) {
  bottom: var(--smx-feedback-offset-bottom);
  left: 50%;
  transform: translateX(-50%);
}

:host([data-position="bottom-right"]) {
  right: var(--smx-feedback-offset-right);
  bottom: var(--smx-feedback-offset-bottom);
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

[hidden] {
  display: none !important;
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

button:focus-visible,
textarea:focus-visible,
a:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--smx-feedback-bg), 0 0 0 4px var(--smx-feedback-brand);
}

.launcher {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: max-content;
  min-height: 2.5rem;
  border: 1px solid var(--smx-feedback-primary-border);
  border-radius: 999px;
  padding: 0 1rem;
  background: var(--smx-feedback-brand);
  color: #ffffff;
  box-shadow: 0 10px 26px rgb(16 24 40 / 18%);
  font-weight: 700;
  cursor: pointer;
}

.panel {
  width: min(432px, calc(100vw - 2rem));
  max-height: calc(100vh - 2rem);
  max-height: calc(100dvh - 2rem);
  overflow: auto;
  border: 1px solid var(--smx-feedback-border);
  border-radius: var(--smx-feedback-radius-xl);
  padding: 20px;
  background: var(--smx-feedback-card);
  color: var(--smx-feedback-fg);
  box-shadow:
    0 1px 2px oklch(0.2 0.02 264 / 0.04),
    0 12px 32px -8px oklch(0.2 0.02 264 / 0.10),
    0 32px 64px -24px oklch(0.2 0.02 264 / 0.12);
}

.panel::backdrop {
  background: rgb(15 23 42 / 32%);
  -webkit-backdrop-filter: blur(3px);
  backdrop-filter: blur(3px);
}

.panel[data-position="top-left"] {
  margin: var(--smx-feedback-offset-top) auto auto var(--smx-feedback-offset-left);
}

.panel[data-position="top-center"] {
  margin: var(--smx-feedback-offset-top) auto auto;
}

.panel[data-position="top-right"] {
  margin: var(--smx-feedback-offset-top) var(--smx-feedback-offset-right) auto auto;
}

.panel[data-position="middle-left"] {
  margin: auto auto auto var(--smx-feedback-offset-left);
}

.panel[data-position="middle-right"] {
  margin: auto var(--smx-feedback-offset-right) auto auto;
}

.panel[data-position="center"] {
  margin: auto;
}

.panel[data-position="bottom-left"] {
  margin: auto auto var(--smx-feedback-offset-bottom) var(--smx-feedback-offset-left);
}

.panel[data-position="bottom-center"] {
  margin: auto auto var(--smx-feedback-offset-bottom);
}

.panel[data-position="bottom-right"] {
  margin: auto var(--smx-feedback-offset-right) var(--smx-feedback-offset-bottom) auto;
}

.form,
h2,
h3,
p {
  margin: 0;
}

.form {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.widget__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 4px 14px;
}

.widget__title {
  color: var(--smx-feedback-fg);
  font-size: 0.97475rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.3;
}

.widget__close,
.widget__back {
  appearance: none;
  border: 0;
  border-radius: var(--smx-feedback-radius-md);
  background: transparent;
  color: var(--smx-feedback-muted);
  cursor: pointer;
}

.widget__close {
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.widget__back {
  display: inline-flex;
  height: 28px;
  align-items: center;
  gap: 4px;
  padding: 0 10px 0 6px;
  color: var(--smx-feedback-fg);
  font-size: 0.97475rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.widget__back svg {
  width: 16px;
  height: 16px;
}

.widget__close:hover,
.widget__back:hover {
  background: var(--smx-feedback-subtle);
  color: var(--smx-feedback-fg);
}

.step {
  display: block;
  opacity: 1;
  transform: translateX(0);
}

.step[aria-hidden="true"] {
  display: none;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option {
  position: relative;
  display: grid;
  width: 100%;
  grid-template-columns: 44px minmax(0, 1fr);
  align-items: center;
  gap: 14px;
  min-height: 72px;
  border: 1px solid var(--smx-feedback-border);
  border-radius: var(--smx-feedback-radius-lg);
  padding: 14px 16px;
  background: var(--smx-feedback-card);
  color: var(--smx-feedback-fg);
  cursor: pointer;
  text-align: left;
}

.option:hover {
  border-color: oklch(0.88 0.005 264);
  background: oklch(0.99 0 0);
}

.option[aria-checked="true"] {
  border-color: var(--smx-feedback-brand);
  background: var(--smx-feedback-primary-softer);
  box-shadow: inset 0 0 0 1px var(--smx-feedback-brand);
}

.option__icon {
  display: grid;
  width: 44px;
  height: 44px;
  flex: none;
  place-items: center;
  border-radius: 999px;
}

.option__icon svg {
  width: 22px;
  height: 22px;
}

.option--issue .option__icon,
.pill--issue .pill__glyph {
  background: var(--smx-feedback-warning-bg);
  color: var(--smx-feedback-warning-fg);
}

.option--idea .option__icon,
.pill--idea .pill__glyph {
  background: var(--smx-feedback-idea-bg);
  color: var(--smx-feedback-idea-fg);
}

.option--praise .option__icon,
.pill--praise .pill__glyph {
  background: var(--smx-feedback-praise-bg);
  color: var(--smx-feedback-praise-fg);
}

.option--feedback .option__icon,
.pill--feedback .pill__glyph {
  background: var(--smx-feedback-note-bg);
  color: var(--smx-feedback-note-fg);
}

.option__body {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.option__label {
  font-size: 1.25325rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.option__desc {
  overflow: hidden;
  color: var(--smx-feedback-muted);
  font-size: 0.97475rem;
  font-weight: 400;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pill {
  display: inline-flex;
  height: 28px;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--smx-feedback-brand);
  border-radius: 999px;
  padding: 0 12px 0 8px;
  background: var(--smx-feedback-primary-softer);
  color: var(--smx-feedback-fg);
  font-size: 0.97475rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.pill__glyph {
  display: grid;
  width: 18px;
  height: 18px;
  place-items: center;
  border-radius: 999px;
}

.pill__glyph svg {
  width: 12px;
  height: 12px;
  stroke-width: 2;
}

.compose {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.compose__field {
  overflow: hidden;
  border: 1px solid var(--smx-feedback-brand);
  border-radius: var(--smx-feedback-radius-lg);
  background: var(--smx-feedback-card);
  box-shadow: inset 0 0 0 1px var(--smx-feedback-brand);
}

.compose__textarea {
  display: block;
  width: 100%;
  min-height: 160px;
  border: 0;
  outline: none;
  padding: 16px;
  background: transparent;
  color: var(--smx-feedback-fg);
  font-family: inherit;
  font-size: 1.114rem;
  letter-spacing: -0.01em;
  line-height: 1.45;
  resize: vertical;
}

.compose__textarea::placeholder {
  color: oklch(0.62 0.012 60);
}

.inline-error {
  margin-top: -6px;
  border-radius: var(--smx-feedback-radius-lg);
  background: var(--smx-feedback-error-bg);
  color: var(--smx-feedback-error-fg);
  font-size: 0.8355rem;
  line-height: 1.4;
  padding: 10px 12px;
}

.compose__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: -4px;
  padding: 0 2px;
  color: var(--smx-feedback-muted);
  font-size: 0.8355rem;
}

.actions,
.status-screen__actions {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 10px;
  width: 100%;
}

.btn {
  appearance: none;
  display: inline-flex;
  height: 44px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: var(--smx-feedback-radius-lg);
  padding: 0 16px;
  font-family: inherit;
  font-size: 0.97475rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  cursor: pointer;
}

.btn svg {
  width: 16px;
  height: 16px;
}

.btn--primary {
  border: 1px solid var(--smx-feedback-brand);
  background: var(--smx-feedback-brand);
  color: oklch(1 0 0);
}

.btn--ghost {
  border: 1px solid var(--smx-feedback-border);
  background: var(--smx-feedback-card);
  color: var(--smx-feedback-fg);
}

.btn--primary:hover {
  filter: brightness(0.96);
}

.btn--ghost:hover {
  background: var(--smx-feedback-subtle);
}

.btn--primary:disabled {
  cursor: wait;
  opacity: 0.72;
}

.status-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 16px 8px 8px;
  text-align: center;
}

.status-screen__icon {
  display: grid;
  width: 64px;
  height: 64px;
  place-items: center;
  border-radius: 999px;
}

.status-screen__icon svg {
  width: 30px;
  height: 30px;
  stroke-width: 2;
}

.status-screen--success .status-screen__icon {
  border: 1px solid var(--smx-feedback-success-border);
  background: var(--smx-feedback-success-bg);
  color: var(--smx-feedback-success-fg);
}

.status-screen--error .status-screen__icon {
  border: 1px solid var(--smx-feedback-error-border);
  background: var(--smx-feedback-error-bg);
  color: var(--smx-feedback-error-fg);
}

.status-screen__title {
  margin: 4px 0 0;
  color: var(--smx-feedback-fg);
  font-size: 1.3925rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.status-screen__body {
  max-width: 32ch;
  margin: 1em 0;
  color: var(--smx-feedback-muted);
  font-size: 0.97475rem;
  line-height: 1.45;
}

.status-screen__actions {
  margin-top: 8px;
}

.powered-by {
  align-self: center;
  margin-top: 14px;
  color: oklch(0.75 0.008 264);
  font-size: 0.75rem;
  font-weight: 400;
  letter-spacing: 0.01em;
  line-height: 1.25;
  text-align: center;
  text-decoration: none;
}

.powered-by:hover {
  color: var(--smx-feedback-muted);
  text-decoration: none;
}

@media (prefers-color-scheme: dark) {
  :host {
    --smx-feedback-bg: oklch(0.178 0.023 264);
    --smx-feedback-fg: oklch(0.96 0.004 264);
    --smx-feedback-card: oklch(0.22 0.025 264);
    --smx-feedback-muted: oklch(0.72 0.018 264);
    --smx-feedback-subtle: oklch(0.27 0.027 264);
    --smx-feedback-border: oklch(0.32 0.025 264);
    --smx-feedback-success-bg: rgb(20 83 45 / 34%);
    --smx-feedback-success-fg: #86efac;
    --smx-feedback-success-border: rgb(34 197 94 / 32%);
    --smx-feedback-error-bg: rgb(127 29 29 / 34%);
    --smx-feedback-error-fg: #fca5a5;
    --smx-feedback-error-border: rgb(248 113 113 / 28%);
    --smx-feedback-warning-bg: rgb(120 53 15 / 30%);
    --smx-feedback-warning-fg: #fcd34d;
    --smx-feedback-idea-bg: rgb(113 63 18 / 30%);
    --smx-feedback-idea-fg: #fde68a;
    --smx-feedback-praise-bg: rgb(76 29 149 / 34%);
    --smx-feedback-praise-fg: #c4b5fd;
    --smx-feedback-note-bg: rgb(30 64 175 / 34%);
    --smx-feedback-note-fg: #93c5fd;
  }

  .panel::backdrop {
    background: rgb(3 7 18 / 56%);
    -webkit-backdrop-filter: blur(3px);
    backdrop-filter: blur(3px);
  }

  .option:hover {
    background: var(--smx-feedback-subtle);
    border-color: oklch(0.38 0.026 264);
  }

  .compose__textarea::placeholder {
    color: var(--smx-feedback-muted);
  }

  .powered-by {
    color: oklch(0.62 0.014 264);
  }
}

@media (prefers-reduced-motion: no-preference) {
  .launcher,
  .option,
  .widget__close,
  .widget__back,
  .btn,
  .step {
    transition:
      background-color 260ms ease,
      border-color 260ms ease,
      box-shadow 260ms ease,
      color 260ms ease,
      opacity 260ms ease,
      transform 260ms ease,
      filter 260ms ease;
  }

  .step[aria-hidden="false"] {
    animation: smx-feedback-step-in 260ms ease both;
  }
}

@keyframes smx-feedback-step-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 420px) {
  :host {
    --smx-feedback-offset: 0.75rem;
  }

  .panel {
    width: calc(100vw - 1rem);
    padding: 16px;
  }

  .option {
    grid-template-columns: 40px minmax(0, 1fr);
    gap: 12px;
    padding: 12px;
  }

  .option__icon {
    width: 40px;
    height: 40px;
  }

  .option__label {
    font-size: 1.114rem;
  }

  .option__desc,
  .compose__meta {
    white-space: normal;
  }
}
`;
