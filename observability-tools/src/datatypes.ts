/* eslint-disable @typescript-eslint/naming-convention */
import * as z from "zod";

export const schemaTestCaseLine = z.object({
  type: z.literal("test_case"),
  run_start: z.number(),
  property: z.string(),
  status: z.union([z.literal("passed"), z.literal("failed"), z.literal("gave_up")]),
  status_reason: z.string(),
  representation: z.string(),
  arguments: z.any().optional(),
  how_generated: z.string().optional(),
  features: z.record(z.any()),
  coverage: z.union([z.record(z.array(z.number())), z.literal("no_coverage_info"), z.null()]),
  metadata: z.any()
});

export const schemaInfoLine = z.object({
  type: z.union([z.literal("info"), z.literal("alert")]),
  run_start: z.number(),
  property: z.string(),
  title: z.string(),
  content: z.string(),
});

export const schemaErrorLine = z.object({
  type: z.literal("error"),
  run_start: z.number().optional(),
  property: z.string().optional(),
  message: z.string(),
});

export const schemaDataLine = z.union([schemaTestCaseLine, schemaInfoLine]);

export const schemaProtoLine = z.union([schemaTestCaseLine, schemaInfoLine, schemaErrorLine]);

export type TestCaseLine = z.infer<typeof schemaTestCaseLine>;
export type InfoLine = z.infer<typeof schemaInfoLine>;
export type ErrorLine = z.infer<typeof schemaErrorLine>;
export type DataLine = z.infer<typeof schemaDataLine>;
export type ProtoLine = z.infer<typeof schemaProtoLine>;