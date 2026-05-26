import type { SendmuxFeedbackPosition } from "./types";

export const defaultPosition: SendmuxFeedbackPosition = "bottom-right";

const aliases: Record<string, SendmuxFeedbackPosition> = {
  centre: "center",
  middle: "center",
  "middle-center": "center",
  "middle-centre": "center",
  "top-centre": "top-center",
  "top-middle": "top-center",
  "bottom-centre": "bottom-center",
  "bottom-middle": "bottom-center",
  "left-middle": "middle-left",
  "right-middle": "middle-right"
};

const positions = new Set<SendmuxFeedbackPosition>([
  "center",
  "top-left",
  "top-center",
  "top-right",
  "middle-left",
  "middle-right",
  "bottom-left",
  "bottom-center",
  "bottom-right"
]);

export function normalisePosition(value: string | null | undefined): SendmuxFeedbackPosition {
  if (!value) return defaultPosition;

  const normalised = value.trim().toLowerCase();
  const aliased = aliases[normalised] ?? normalised;

  if (positions.has(aliased as SendmuxFeedbackPosition)) {
    return aliased as SendmuxFeedbackPosition;
  }

  return defaultPosition;
}
