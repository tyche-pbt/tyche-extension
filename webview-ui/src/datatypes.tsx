export type SampleInfo = {
  item: string;
  dot?: string;
  json?: string | object;
  features: {
    [key: string]: number;
  };
  filters: {
    [key: string]: boolean;
  };
};

export type TestInfo = {
  samples: SampleInfo[];
  coverage: { [key: string]: { percentage: number } };
}

export type ExampleFilter = {
  feature: string;
  value: number;
  filter?: string;
};