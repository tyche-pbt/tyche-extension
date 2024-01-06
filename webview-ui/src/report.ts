import * as z from "zod";
import { DataLine, schemaDataLine } from "observability-tools";

export const schemaSampleInfo = z.object({
  outcome: z.union([
    z.literal("passed"),
    z.literal("failed"),
    z.literal("gave_up"),
    z.literal("invalid")
  ]),
  item: z.string(),
  duplicate: z.boolean(),
  features: z.object({
    ordinal: z.record(z.number()),
    nominal: z.record(z.string()),
  }),
  coverage: z.record(z.array(z.number())),
  dataLine: schemaDataLine
});

export const schemaTestInfo = z.object({
  status: z.union([z.literal("success"), z.literal("failure"), z.literal("warning")]),
  samples: z.array(schemaSampleInfo),
  info: z.array(z.object({ type: z.string(), title: z.string(), content: z.string() })),
});

export const schemaReport = z.object({
  timestamp: z.number(),
  properties: z.record(schemaTestInfo),
});

export type SampleInfo = z.infer<typeof schemaSampleInfo>;

export type TestInfo = z.infer<typeof schemaTestInfo>;

export type Report = z.infer<typeof schemaReport>;

export type ExampleFilter = {
  ordinal: string;
  value: number;
} | {
  nominal: string;
  value: string | undefined;
} | {
  subset: string;
  examples: SampleInfo[];
};

function filterObject<V>(obj: { [key: string]: V }, pred: (v: V) => boolean): { [key: string]: V } {
  return Object.entries(obj)
    .filter(([_, v]) => pred(v))
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
}

export function buildReport(data: DataLine[]): Report {
  const report: Report = {
    timestamp: 0,
    properties: {},
  };
  let seen: string[] = [];

  for (const line of data) {
    if (report.timestamp === 0) {
      report.timestamp = line.run_start;
    }

    if (!(line.property in report.properties)) {
      report.properties[line.property] = { status: "success", samples: [], info: [] };
    }

    if (line.type === "test_case") {
      const key = JSON.stringify([line.representation, line.arguments]);
      const duplicate = seen.includes(key);
      seen.push(key);

      if (line.status === "failed") {
        report.properties[line.property].status = "failure";
      }

      const outcome = line.status === "gave_up"
        ? (line.representation === "" ? "gave_up" : "invalid")
        : line.status;
      report.properties[line.property].samples.push({
        outcome,
        duplicate,
        item: line.representation.toString(),
        features: {
          ordinal: filterObject(line.features, v => typeof v === "number"),
          nominal: filterObject(line.features, v => typeof v === "string")
        },
        coverage: (line.coverage !== null && line.coverage !== "no_coverage_info") ? line.coverage : {},
        dataLine: line,
      });
    } else {
      report.properties[line.property].info.push({
        type: line.type,
        title: line.title,
        content: line.content,
      });
    }
  }

  for (const property in report.properties) {
    const discards = report.properties[property].samples.filter(sample => sample.outcome === "invalid").length;
    const duplicates = report.properties[property].samples.filter(sample => sample.duplicate).length;
    const samples = report.properties[property].samples.length;
    if (discards / samples > 0.33 || duplicates / samples > 0.33) {
      report.properties[property].status = "warning";
    }
  }

  return report;
}