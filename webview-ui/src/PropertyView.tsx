import Markdown from "react-markdown";
import { TestInfo } from "../../src/datatypes";
import { Charts } from "./panes/Charts";
import { Drawer } from "./ui/Drawer";
import { HighLevelStats } from "./panes/HighLevelStats";
import { FailureInfo } from "./panes/FailureInfo";

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

    {
      testInfo.info.map((x, i) =>
        <div key={`info-${i}`}>
          <div className="my-2 mx-0">
            <i className="codicon codicon-info text-primary mr-1"></i>
            {x.title}
            <Drawer>
              <Markdown className="markdown">{x.content}</Markdown>
            </Drawer>
          </div>
        </div>
      )
    }
    <HighLevelStats dataset={testInfo.samples} property={property} />
    {testInfo.samples.some(x => x.outcome === "failed") &&
      <FailureInfo dataset={testInfo.samples} />
    }
    <Charts
      setFilteredView={() => { }}
      dataset={testInfo.samples}
      features={{ numerical, categorical }}
    />
  </>;
};

export default PropertyView;