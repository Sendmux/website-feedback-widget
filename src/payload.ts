import type { FeedbackType, JsonObject, SendmuxFeedbackPayload } from "./types";

export interface BuildPayloadInput {
  feedbackType: FeedbackType;
  message: string;
  user?: JsonObject;
  metadata?: JsonObject;
  location?: Pick<Location, "href">;
  title?: string;
  now?: Date;
}

export function buildFeedbackPayload(input: BuildPayloadInput): SendmuxFeedbackPayload {
  return {
    feedback_type: input.feedbackType,
    message: input.message.trim(),
    url: input.location?.href ?? "",
    title: input.title ?? "",
    timestamp: (input.now ?? new Date()).toISOString(),
    user: input.user ?? {},
    metadata: input.metadata ?? {}
  };
}
