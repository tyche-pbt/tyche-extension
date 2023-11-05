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
  percentage: number,
  hitLines: number[],
  missedLines: number[],
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