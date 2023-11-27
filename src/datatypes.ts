/* eslint-disable @typescript-eslint/naming-convention */
import * as z from "zod";

export const schemaTestCaseLine = z.object({
  type: z.literal("test_case"),
  run_start: z.number(),
  property: z.string(),
  status: z.union([z.literal("passed"), z.literal("failed"), z.literal("gave_up")]),
  status_reason: z.string(),
  representation: z.union([z.string(), z.record(z.string())]),
  how_generated: z.string().optional(),
  features: z.record(z.any()),
  coverage: z.union([z.record(z.array(z.number())), z.literal("no_coverage_info"), z.null()]),
  metadata: z.record(z.any()).optional(),
});

export const schemaInfoLine = z.object({
  type: z.literal("info"),
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

export function parseDataLines(jsonString: string): DataLine[] | string {
  const dataLines = [];
  for (const line of jsonString.split("\n")) {
    if (line === "") {
      continue;
    }
    try {
      const obj = JSON.parse(line);
      const parsedLine = schemaProtoLine.parse(obj);
      dataLines.push(parsedLine);
    } catch (e) {
      return ("Tyche: Could not parse JSON report.\n" + e + "\nInvalid Object: " + line);
    }
  }

  const errorLine = dataLines.find((line) => line.type === "error") as ErrorLine | undefined;
  if (errorLine !== undefined) {
    return ("Tyche: Encountered unknown failure.\n" + errorLine.message);
  }

  return dataLines as DataLine[];
}

export const schemaSampleInfo = z.object({
  item: z.string(),
  features: z.record(z.number()),
  bucketings: z.record(z.string()),
});

export const schemaCoverageItem = z.object({
  hitLines: z.array(z.number()),
  missedLines: z.array(z.number()),
});

export const schemaSuccessTestInfo = z.object({
  outcome: z.literal("propertyPassed"),
  samples: z.array(schemaSampleInfo),
  coverage: z.record(schemaCoverageItem),
});

export const schemaFailureTestInfo = z.object({
  outcome: z.literal("propertyFailed"),
  counterExample: schemaSampleInfo,
  message: z.string(),
});

export const schemaTestInfo = z.union([schemaSuccessTestInfo, schemaFailureTestInfo]);

export const schemaReport = z.object({
  properties: z.record(schemaTestInfo),
});

export const schemaRequest = z.union([
  z.object({
    type: z.literal("success"),
    report: schemaReport,
  }),
  z.object({
    type: z.literal("failure"),
    message: z.string(),
  })
]);

export type SampleInfo = z.infer<typeof schemaSampleInfo>;

export type CoverageItem = z.infer<typeof schemaCoverageItem>;

export type SuccessTestInfo = z.infer<typeof schemaSuccessTestInfo>;

export type FailureTestInfo = z.infer<typeof schemaFailureTestInfo>;

export type TestInfo = z.infer<typeof schemaTestInfo>;

export type Report = z.infer<typeof schemaReport>;

export type Request = z.infer<typeof schemaRequest>;

export type ExampleFilter = {
  feature: string;
  value: number;
} | {
  bucketing: string,
  value: string
};