export type SampleInfo = {
  item: string;
  dot?: string;
  json?: object;
  features: {
    [key: string]: number;
  };
  filters: {
    [key: string]: boolean;
  };
};

export type ExampleFilter = {
  feature: string;
  value: number;
  filter?: string;
};