import { sourceBackfillJob } from "./demo-organizations.ts";
import type { JobDefinition } from "./jobs.ts";

/** The jobs the worker runs. Later tickets register theirs here. */
export const jobDefinitions: JobDefinition[] = [sourceBackfillJob as JobDefinition];
