import type Anthropic from "@anthropic-ai/sdk";
import type { ClaudeClient } from "@opsell/core";

/**
 * A fake at the Claude Messages API boundary (ADR 0009), so prompt building and response
 * validation still run. Responses are scripted per structured-output schema, keyed by the JSON
 * Schema's `title` (set it with Zod's `.meta({ title })`), and every request is recorded.
 */
export class FakeClaude implements ClaudeClient {
  readonly requests: Anthropic.MessageCreateParamsNonStreaming[] = [];
  readonly #scripted = new Map<string, unknown[]>();

  /** Queues `output` as the next response for requests whose output schema has this title. */
  respond(schemaTitle: string, output: unknown): void {
    const queue = this.#scripted.get(schemaTitle) ?? [];
    queue.push(output);
    this.#scripted.set(schemaTitle, queue);
  }

  readonly messages = {
    create: async (
      params: Anthropic.MessageCreateParamsNonStreaming,
    ): Promise<Anthropic.Message> => {
      this.requests.push(params);
      const title = params.output_config?.format?.schema.title;
      if (typeof title !== "string") {
        throw new Error("FakeClaude only answers requests with a titled structured-output schema");
      }
      const output = this.#scripted.get(title)?.shift();
      if (output === undefined) throw new Error(`No scripted Claude response for "${title}"`);
      return message(params.model, JSON.stringify(output));
    },
  };
}

function message(model: Anthropic.Model, text: string): Anthropic.Message {
  return {
    id: `msg_fake_${crypto.randomUUID()}`,
    type: "message",
    role: "assistant",
    model,
    content: [{ type: "text", text, citations: null }],
    stop_reason: "end_turn",
    stop_sequence: null,
    stop_details: null,
    container: null,
    diagnostics: null,
    usage: {
      input_tokens: 0,
      output_tokens: 0,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
      cache_creation: null,
      server_tool_use: null,
      service_tier: "standard",
      inference_geo: null,
      output_tokens_details: null,
    },
  } satisfies Anthropic.Message;
}
