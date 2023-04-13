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

export type ExampleFilter = {
  feature: string;
  value: number;
  filter?: string;
};