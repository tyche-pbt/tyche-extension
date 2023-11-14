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
  coverage: z.union([z.record(z.array(z.number())), z.literal("no_coverage_info")]),
  metadata: z.record(z.string()).optional(),
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

export const schemaDataLine = z.union([schemaTestCaseLine, schemaInfoLine, schemaErrorLine]);

export const schemaDataLines = z.array(schemaDataLine);

export type TestCaseLine = z.infer<typeof schemaTestCaseLine>;
export type InfoLine = z.infer<typeof schemaInfoLine>;
export type ErrorLine = z.infer<typeof schemaErrorLine>;
export type DataLine = z.infer<typeof schemaDataLine>;
export type DataLines = z.infer<typeof schemaDataLines>;

function filterObject<V>(obj: { [key: string]: V }, pred: (v: V) => boolean): { [key: string]: V } {
  return Object.entries(obj)
    .filter(([_, v]) => pred(v))
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
}

export const buildReport = (data: TestCaseLine[]): Report => {
  const report: Report = {
    clear: false,
    properties: {},
  };
  for (const line of data) {
    if (line.status === "gave_up") {
      continue; // TODO
    }
    const sample = {
      item: line.representation.toString(),
      features: filterObject(line.features, v => typeof v === "number"),
      bucketings: filterObject(line.features, v => typeof v === "string"),
    };
    if (line.status === "failed") {
      report.properties[line.property] = {
        outcome: "propertyFailed",
        counterExample: sample,
        message: line.status_reason,
      };
    } else {
      if (!(line.property in report.properties)) {
        report.properties[line.property] = {
          outcome: "propertyPassed",
          samples: [sample],
          coverage: {}, // TODO
        };
      } else if (report.properties[line.property].outcome === "propertyPassed") {
        (report.properties[line.property] as SuccessTestInfo).samples.push(sample);
      }
    }
  }
  return report;
};

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
  clear: z.boolean().optional(),
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

export const mergeCoverage = (oldCoverage: { [key: string]: CoverageItem }, newCoverage: { [key: string]: CoverageItem }): { [key: string]: CoverageItem } => {
  const result: { [key: string]: CoverageItem } = oldCoverage;
  Object.keys(newCoverage).forEach((key) => {
    if (key in result) {
      result[key].hitLines = Array.from(new Set([...result[key].hitLines, ...newCoverage[key].hitLines]));
      result[key].missedLines = result[key].missedLines.filter((l) => l in newCoverage[key].missedLines);
    } else {
      result[key] = newCoverage[key];
    }
  });
  return result;
};

export const mergeReports = (oldReport: Report | undefined, newReport: Report): Report => {
  if (!oldReport || newReport.clear) {
    return newReport;
  } else {
    return {
      clear: false,
      properties: {
        ...oldReport.properties,
        ...newReport.properties,
      },
    };
  }
};