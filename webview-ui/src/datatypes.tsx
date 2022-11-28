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
