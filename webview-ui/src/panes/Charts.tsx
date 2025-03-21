import { ExampleFilter, SampleInfo } from "../report";
import { OrdinalChart } from "../visualization/OrdinalChart";
import { NominalChart } from "../visualization/NominalChart";
import Card from "../ui/Card";
import { UniqueOverTimeChart } from "../visualization/UniqueOverTimeChart";
import { NominalMosaicChart } from "../visualization/NominalMosaicChart";
import { TimingChart } from "../visualization/TimingChart";
import { CoverageChart } from "../visualization/CoverageChart";
import { ContinuousChart } from "../visualization/ContinuousChart";
import { TwoDChart } from "../visualization/TwoDChart";

type ChartsProps = {
  dataset: SampleInfo[];
  features: {
    ordinal: string[];
    nominal: string[];
    continuous: string[];
    twoD: string[];
  };
  setFilteredView: (exampleFilter: ExampleFilter) => void;
};

export const Charts = (props: ChartsProps) => {
  const { dataset: rawDataset, features } = props;

  const dataset = rawDataset.filter((x) => x.outcome === "passed" || x.outcome === "failed");

  const coverageChart = CoverageChart({ dataset });
  const timingChart =
    TimingChart(
      {
        dataset: dataset,
        viewValues: (examples) =>
          props.setFilteredView({
            subset: "Selected samples by time taken",
            examples,
          })
      });

  return (
    <div className="grid w-full grid-cols-1">
      {features.nominal.length >= 2 ? (
        <NominalMosaicChart
          samples={dataset}
          setExampleFilter={props.setFilteredView}
          nominalFeatures={features.nominal}
        />
      ) : (
        [
          ...features.nominal.map((x) => (
            <Card key={`bucket-${x}`}>
              <NominalChart
                feature={x}
                dataset={dataset}
                viewValue={(value) => props.setFilteredView({ nominal: x, value })}
              />
            </Card>
          )),
        ]
      )}
      {[
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
      {[
        ...features.continuous.flatMap((x) => [
          <Card key={`feature-${x}`}>
            <ContinuousChart
              feature={x}
              dataset={dataset}
              viewValue={(value) => props.setFilteredView({ ordinal: x, value })}
            />
          </Card>,
        ]),
      ]}
      {[
        ...features.twoD.flatMap((x) => [
          <Card key={`feature-${x}`}>
            <TwoDChart
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
      {coverageChart && <Card>{coverageChart}</Card>}
      {timingChart && <Card>{timingChart}</Card>}
      <Card>
        <UniqueOverTimeChart dataset={dataset} />
      </Card>
    </div>
  );
};
