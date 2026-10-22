// The seams between domain logic and the outside world (ADR 0009). Production wires real
// adapters; contract tests wire the fakes in @opsell/testing.
import type Anthropic from "@anthropic-ai/sdk";
import type { Database, TenantTx } from "@opsell/db";

/** Where every business timestamp comes from; never a database default. */
export interface Clock {
  now(): Date;
}

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

export interface Mailer {
  send(message: EmailMessage): Promise<void>;
}

export interface SmsMessage {
  to: string;
  body: string;
}

export interface Sms {
  send(message: SmsMessage): Promise<void>;
}

/** The subset of the Claude Messages API that Opsell uses. */
export interface ClaudeClient {
  messages: {
    create(params: Anthropic.MessageCreateParamsNonStreaming): Promise<Anthropic.Message>;
  };
}

export interface SendJobOptions {
  /** Earliest time the job may run; defaults to the Clock's now. */
  startAfter?: Date;
}

export interface Jobs {
  /**
   * Enqueues a job on `tx`'s connection, so it commits or rolls back with the record that caused
   * it. The job later runs in the same Organization, as the same User, as `tx`.
   */
  send<T>(tx: TenantTx, queue: string, data: T, options?: SendJobOptions): Promise<string>;
}

/** Everything the API and the worker are built from. */
export interface Deps {
  db: Database;
  clock: Clock;
  mailer: Mailer;
  sms: Sms;
  claude: ClaudeClient;
  jobs: Jobs;
}
