import { VSCodeDivider } from "@vscode/webview-ui-toolkit/react";
import { ExampleFilter, SampleInfo } from "../../src/datatypes";
import { ExtremeExamples } from "./ExtremeExamples";
import { FeatureChart } from "./FeatureChart";
import { FilterChart } from "./FilterChart";
import { HighLevelStats } from "./HighLevelStats";
import { CoverageInfo } from "./CoverageInfo";

type MainViewProps = {
  dataset: SampleInfo[];
  coverage: { [key: string]: { percentage: number } };
  filters: string[];
  features: string[];
  setFilteredView: (exampleFilter: ExampleFilter) => void;
}


export const MainView = (props: MainViewProps) => {
  const { dataset, filters, features } = props;

  const pageElements =
    [...[undefined, ...filters].flatMap(filter =>
      features.flatMap((x) =>
        [
          <FeatureChart
            feature={x}
            dataset={dataset}
            filter={filter}
            viewValue={(value) => props.setFilteredView({ feature: x, value, filter })}
          />,
          <ExtremeExamples
            feature={x}
            dataset={dataset}
            filter={filter}
            end="min"
          />,
          <ExtremeExamples
            feature={x}
            dataset={dataset}
            filter={filter}
            end="max"
          />])),
    ...filters.map((x) =>
      <FilterChart filter={x} dataset={dataset} />)
    ]

  return <div className="MainView">
    <HighLevelStats dataset={dataset} />
    <VSCodeDivider />
    <CoverageInfo coverage={props.coverage}></CoverageInfo>
    {pageElements.flatMap(x => [<VSCodeDivider />, x])}
  </div>;
}