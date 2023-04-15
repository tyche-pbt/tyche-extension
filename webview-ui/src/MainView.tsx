import { VSCodeDivider } from "@vscode/webview-ui-toolkit/react";
import { ExampleFilter, SampleInfo } from "./datatypes";
import { ExtremeExamples } from "./ExtremeExamples";
import { FeatureChart } from "./FeatureChart";
import { FilterChart } from "./FilterChart";
import { HighLevelStats } from "./HighLevelStats";

type MainViewProps = {
  dataset: SampleInfo[];
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
    {pageElements.flatMap(x => [<VSCodeDivider />, x])}
  </div>;
}