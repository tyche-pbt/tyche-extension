import { TestInfo } from "../../src/datatypes";
import { Charts } from "./panes/Charts";
import { HighLevelStats } from "./panes/HighLevelStats";
import { FailingCases } from "./panes/FailingCases";
import Info from "./panes/Info";

type PropertyViewProps = {
  property: string;
  testInfo: TestInfo;
};

const PropertyView = (props: PropertyViewProps) => {
  const { testInfo, property } = props;

  const numerical = testInfo.samples
    .map(sample => Object.keys(sample.features.numerical))
    .reduce((acc, curr) => Array.from(new Set<string>([...acc, ...curr])), []);
  const categorical = testInfo.samples
    .map(sample => Object.keys(sample.features.categorical))
    .reduce((acc, curr) => Array.from(new Set<string>([...acc, ...curr])), []);

  return <>
    <Info info={testInfo.info} />
    {testInfo.status === "failure" &&
      <FailingCases dataset={testInfo.samples} />
    }
    <HighLevelStats dataset={testInfo.samples} property={property} />
    <Charts
      setFilteredView={() => { }}
      dataset={testInfo.samples}
      features={{ numerical, categorical }}
    />
  </>;
};

export default PropertyView;