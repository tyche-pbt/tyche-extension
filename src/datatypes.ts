export type SampleInfo = {
  item: string;
  dot?: string;
  json?: string | object;
  features: {
    [key: string]: number;
  };
  bucketings: {
    [key: string]: string;
  };
};

export type CoverageItem = {
  hitLines: number[],
  missedLines: number[],
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

export type TestInfo =
  {
    type?: "success";
    samples: SampleInfo[];
    coverage: { [key: string]: CoverageItem };
  } | {
    type: "failure";
    counterExample: SampleInfo;
    message: string;
  };

export type Report = {
  type?: "success";
  clear?: boolean;
  report: { [key: string]: TestInfo };
} | {
  type: "failure";
  message: string;
};

export const mergeReports = (oldReport: Report | undefined, newReport: Report): Report => {
  if (!oldReport || oldReport.type === "failure" || newReport.type === "failure" || newReport.clear) {
    return newReport;
  } else {
    return {
      clear: false,
      report: {
        ...oldReport.report,
        ...newReport.report,
      },
    };
  }
};

export type ExampleFilter = {
  feature: string;
  value: number;
} | {
  bucketing: string,
  value: string
};