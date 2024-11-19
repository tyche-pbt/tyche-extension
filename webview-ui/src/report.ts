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
    continuous: z.record(z.number()),
    twoD: z.record(z.tuple([z.tuple([z.string(), z.number()]), z.tuple([z.string(), z.number()])])),
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

function filterObject<V>(obj: { [key: string]: V }, pred: (key: string, v: V) => boolean): { [key: string]: V } {
  return Object.entries(obj)
    .filter(([k, v]) => pred(k, v))
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
}

export const isPassed = (x: SampleInfo) => x.outcome === "passed";
export const isFailed = (x: SampleInfo) => x.outcome === "failed";
export const isInvalid = (x: SampleInfo) => x.outcome === "invalid" || x.outcome === "gave_up";

export const isUnique = (x: SampleInfo) => !x.duplicate;
export const isDuplicate = (x: SampleInfo) => x.duplicate;


export function buildReport(data: DataLine[]): Report {
  const report: Report = {
    timestamp: 0,
    properties: {},
  };

  if (data.length === 0) {
    return report;
  }

  let seen: string[] = [];

  let featureMap: { [key: string]: { [key: string]: string } } = {};

  for (const line of data) {
    if (line.type === "test_case") {
      if (!(line.property in featureMap)) {
        featureMap[line.property] = {};
      }
      for (const feature in line.features) {
        const v = line.features[feature];
        const alreadySet = feature in featureMap[line.property];
        const numeric = typeof v === "number";
        const tuple = Array.isArray(v);
        const integral = Number.isInteger(v);

        if (tuple) {
          featureMap[line.property][feature] = "twoD";
        } else if (numeric && !integral) {
          featureMap[line.property][feature] = "continuous";
        } else if (numeric && integral && (!alreadySet || featureMap[line.property][feature] === "ordinal")) {
          featureMap[line.property][feature] = "ordinal";
        } else if (!numeric) {
          featureMap[line.property][feature] = "nominal";
        } else {
          console.warn("possibly broken feature");
        }
      }
    }
  }

  for (const line of data) {
    if (report.timestamp === 0) {
      report.timestamp = line.run_start;
    }

    if (!(line.property in report.properties)) {
      report.properties[line.property] = { status: "success", samples: [], info: [] };
    }

    if (line.type === "test_case") {
      const key = JSON.stringify([line.representation]);
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
          ordinal: filterObject(line.features, (k, _) => featureMap[line.property][k] === "ordinal"),
          nominal: filterObject(line.features, (k, _) => featureMap[line.property][k] === "nominal"),
          continuous: filterObject(line.features, (k, _) => featureMap[line.property][k] === "continuous"),
          twoD: filterObject(line.features, (k, _) => featureMap[line.property][k] === "twoD"),
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
    const discards = report.properties[property].samples.filter(isInvalid).length;
    const validDuplicates = report.properties[property].samples.filter(x => isDuplicate(x) && !isInvalid(x)).length;
    const samples = report.properties[property].samples.length;
    if (report.properties[property].status === "success") {
      if (discards / samples > 0.33 || validDuplicates / samples > 0.33) {
        report.properties[property].status = "warning";
      }
    }
  }

  return report;
}