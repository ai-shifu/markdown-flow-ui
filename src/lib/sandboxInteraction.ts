export const SANDBOX_INTERACTION_MESSAGE_SOURCE = "markdown-flow-ui:sandbox";
export const SANDBOX_INTERACTION_MESSAGE_TYPE = "interaction";

export interface SandboxInteractionMessage {
  source: typeof SANDBOX_INTERACTION_MESSAGE_SOURCE;
  type: typeof SANDBOX_INTERACTION_MESSAGE_TYPE;
  eventType: string;
}

export const isSandboxInteractionMessage = (
  data: unknown
): data is SandboxInteractionMessage => {
  if (!data || typeof data !== "object") {
    return false;
  }

  const message = data as Partial<SandboxInteractionMessage>;

  return (
    message.source === SANDBOX_INTERACTION_MESSAGE_SOURCE &&
    message.type === SANDBOX_INTERACTION_MESSAGE_TYPE &&
    typeof message.eventType === "string"
  );
};
