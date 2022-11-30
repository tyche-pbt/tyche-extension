export type SampleInfo = {
  item: string;
  dot?: string;
  features: {
    [key: string]: number;
  };
  filters: {
    [key: string]: boolean;
  };
};

export type PageState =
  { state: "main" }
  | { state: "examples" }
  | { state: "filtered", feature: string, value: number };