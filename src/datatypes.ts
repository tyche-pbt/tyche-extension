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

export type SucceedingTestInfo = {
  type?: "success";
  samples: SampleInfo[];
  coverage: { [key: string]: CoverageItem };
};

export type FailingTestInfo = {
  type: "failure";
  counterExample: SampleInfo;
  message: string;
};

export type NoTestInfo = {
  type: "error";
  message: string;
};

export type TestInfo = SucceedingTestInfo | FailingTestInfo | NoTestInfo;

export type ExampleFilter = {
  feature: string;
  value: number;
} | {
  bucketing: string,
  value: string
};