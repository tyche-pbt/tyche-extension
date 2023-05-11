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

export type TestInfo = {
  samples: SampleInfo[];
  coverage: { [key: string]: { percentage: number, hitLines: number[], missedLines: number[] } };
};

export type ExampleFilter = {
  feature: string;
  value: number;
};