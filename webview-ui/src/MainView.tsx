import { VSCodeDivider } from "@vscode/webview-ui-toolkit/react";
import { SampleInfo } from "./datatypes";
import { ExtremeExamples } from "./ExtremeExamples";
import { FeatureChart } from "./FeatureChart";
import { FilterChart } from "./FilterChart";
import { HighLevelStats } from "./HighLevelStats";

type MainViewProps = {
  dataset: SampleInfo[];
  activeFilters: string[];
  activeFeatures: string[];
  setFilteredView: (feature: string, value: number) => void;
}

export const MainView = (props: MainViewProps) => {
  const { dataset, activeFilters, activeFeatures } = props;

  const pageElements =
    [...activeFeatures.flatMap((x) =>
      [<FeatureChart
        feature={x}
        dataset={dataset}
        filters={activeFilters}
        viewValue={(value) => props.setFilteredView(x, value)}
      />,
      <ExtremeExamples
        feature={x}
        dataset={dataset}
        filters={activeFilters}
      />]),
    ...activeFilters.map((x) =>
      <FilterChart filter={x} dataset={dataset} />
    )]

  return <div className="MainView">
    <HighLevelStats dataset={dataset} />
    {pageElements.flatMap(x => [<VSCodeDivider />, x])}
  </div>;
}