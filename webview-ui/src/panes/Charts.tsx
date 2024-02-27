import { ExampleFilter, SampleInfo } from "../report";
import { OrdinalChart } from "../visualization/OrdinalChart";
import { NominalChart } from "../visualization/NominalChart";
import Card from "../ui/Card";
import { UniqueTimeChart } from "../visualization/UniqueTimeChart";
import { TimingChart } from "../visualization/TimingChart";

type ChartsProps = {
  dataset: SampleInfo[];
  features: {
    ordinal: string[];
    nominal: string[];
  };
  setFilteredView: (exampleFilter: ExampleFilter) => void;
};

export const Charts = (props: ChartsProps) => {
  const { dataset: rawDataset, features } = props;

  const dataset = rawDataset.filter((x) => x.outcome === "passed" || x.outcome === "failed");

  const coverageChart = null; // CoverageChart({ dataset });

  return (
    <div className="grid w-full grid-cols-1">
      {coverageChart && <Card>{coverageChart}</Card>}
      {[
        ...features.nominal.map((x) => (
          <Card key={`bucket-${x}`}>
            <NominalChart
              feature={x}
              dataset={dataset}
              viewValue={(value) => props.setFilteredView({ nominal: x, value })}
            />
          </Card>
        )),
        ...features.ordinal.flatMap((x) => [
          <Card key={`feature-${x}`}>
            <OrdinalChart
              feature={x}
              dataset={dataset}
              viewValue={(value) => props.setFilteredView({ ordinal: x, value })}
            />
          </Card>,
        ]),
      ]}
      {/* <Card className="text-sm">
      <strong>NOTE:</strong> You can add your own charts by registering "features" for your test
      inputs. Consult your PBT framework's documentation to learn more.
    </Card> */}
      <Card>
        <UniqueTimeChart dataset={dataset} />
      </Card>
      <Card>
        <TimingChart dataset={dataset} />
      </Card>
    </div>
  );
};
