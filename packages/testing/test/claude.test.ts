import { describe, expect, it } from "vitest";
import * as z from "zod";
import { FakeClaude } from "../src/index.ts";

const Extraction = z
  .object({ flags: z.array(z.object({ employee: z.string(), summary: z.string() })) })
  .meta({ title: "HrFlagExtraction" });

function extractionRequest(notes: string) {
  return {
    model: "claude-opus-5-5" as const,
    max_tokens: 16000,
    messages: [{ role: "user" as const, content: notes }],
    output_config: { format: { type: "json_schema" as const, schema: z.toJSONSchema(Extraction) } },
  };
}

describe("FakeClaude", () => {
  it("answers a structured-output request with the response scripted for its schema", async () => {
    const claude = new FakeClaude();
    claude.respond("HrFlagExtraction", { flags: [{ employee: "Sam", summary: "Late twice" }] });

    const message = await claude.messages.create(extractionRequest("Sam was late again."));

    const [block] = message.content;
    expect(block?.type === "text" && Extraction.parse(JSON.parse(block.text))).toEqual({
      flags: [{ employee: "Sam", summary: "Late twice" }],
    });
    expect(claude.requests.map((r) => r.messages[0]?.content)).toEqual(["Sam was late again."]);
  });

  it("fails loudly when nothing is scripted for the schema", async () => {
    const claude = new FakeClaude();

    await expect(claude.messages.create(extractionRequest("Quiet night."))).rejects.toThrow(
      'No scripted Claude response for "HrFlagExtraction"',
    );
  });
});
