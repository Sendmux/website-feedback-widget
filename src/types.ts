export type FeedbackType = "issue" | "idea" | "praise" | "feedback";

export type SendmuxFeedbackPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface JsonObject {
  [key: string]: unknown;
}

export interface SendmuxFeedbackConfig {
  endpoint?: string;
  position?: SendmuxFeedbackPosition;
  brandColor?: string;
  fontFamily?: string;
  poweredBy?: boolean;
  buttonLabel?: string;
  title?: string;
  user?: JsonObject;
  metadata?: JsonObject;
}

export interface SendmuxFeedbackPayload {
  feedback_type: FeedbackType;
  message: string;
  url: string;
  title: string;
  timestamp: string;
  user: JsonObject;
  metadata: JsonObject;
}

export interface SendmuxFeedbackGlobal {
  config: SendmuxFeedbackConfig;
  configure(config: SendmuxFeedbackConfig): void;
  open(config?: SendmuxFeedbackConfig): HTMLElement | null;
  close(): void;
}
