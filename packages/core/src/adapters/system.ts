import Anthropic from "@anthropic-ai/sdk";
import type { ClaudeClient, Clock, Sms } from "../ports.ts";

export const systemClock: Clock = { now: () => new Date() };

/** The Claude Messages API, or a client that refuses every call when no key is configured. */
export function createClaudeClient(apiKey: string | undefined): ClaudeClient {
  if (!apiKey) {
    return {
      messages: {
        create: () => Promise.reject(new Error("ANTHROPIC_API_KEY is not set")),
      },
    };
  }
  const client = new Anthropic({ apiKey });
  return { messages: { create: (params) => client.messages.create(params) } };
}

/** No SMS provider is wired yet (SMS sign-in arrives with #93); sending fails loudly. */
export const unconfiguredSms: Sms = {
  send: () => Promise.reject(new Error("No SMS provider is configured")),
};
