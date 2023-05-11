import { SampleInfo } from "../../src/datatypes";
import { PrettyExample } from "./PrettyExample";

type ExtremeExamplesProps = {
  dataset: SampleInfo[];
  feature: string;
  filter?: string;
  end: "max" | "min";
};

export const ExtremeExamples = (props: ExtremeExamplesProps) => {
  const { feature, filter, end } = props;
  const dataset = filter ? props.dataset.filter((x) => x.filters[filter]) : props.dataset;

  if (dataset.length === 0) {
    return <>No examples available.</>;
  }

  const example = dataset.reduce((acc, curr) => {
    const cmp = (x: number, y: number) => end === "max" ? x > y : x < y;
    return cmp(acc.features[feature], curr.features[feature]) ? acc : curr;
  }, dataset[0]);

  return (
    <div className="ExtremeExamples">
      <div className="ee-container">
        <div className="ee-title">
          {end === "max" ? "Maximum" : "Minimum"} by <code>{feature}</code>{filter && <span> (filtered by <code>{filter}</code>)</span>}
        </div>
        <PrettyExample example={example}></PrettyExample>
      </div>
    </div>
  );
}
