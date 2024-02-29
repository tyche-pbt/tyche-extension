import { ExampleFilter, SampleInfo } from "../report";
import { OrdinalChart } from "../visualization/OrdinalChart";
import { NominalChart } from "../visualization/NominalChart";
import Card from "../ui/Card";
import { UniqueTimeChart } from "../visualization/UniqueTimeChart";
import { MosaicChart } from "../visualization/MosaicChart";

type ChartsProps = {
  dataset: SampleInfo[];
  features: {
    ordinal: string[];
    nominal: string[];
  };
  setFilteredView: (exampleFilter: ExampleFilter) => void;
};

export const Charts = (props: ChartsProps) => {
  let { dataset: rawDataset, features } = props;

  features = {
    ...features,
    nominal: [...features.nominal, "test feature"],
  };

  let dataset = rawDataset.filter((x) => x.outcome === "passed" || x.outcome === "failed");

  dataset = dataset.map((x, i) => {
    return {
      ...x,
      features: {
        ...x.features,
        nominal: {
          ...x.features.nominal,
          "test feature": i < dataset.length * 0.2 ? "A" : i < dataset.length * 0.7 ? "B" : "C",
        },
      },
    };
  });

  const coverageChart = null; // CoverageChart({ dataset });

  console.log(dataset);
  console.log(features);

  return (
    <div className="grid w-full grid-cols-1">
      {coverageChart && <Card>{coverageChart}</Card>}
      {features.nominal.length == 2 ? (
        <NominalMosaic
          samples={dataset}
          setExampleFilter={props.setFilteredView}
          feature1={features.nominal[0]}
          feature2={features.nominal[1]}
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
          ...features.ordinal.flatMap((x) => [
            <Card key={`feature-${x}`}>
              <OrdinalChart
                feature={x}
                dataset={dataset}
                viewValue={(value) => props.setFilteredView({ ordinal: x, value })}
              />
            </Card>,
          ]),
        ]
      )}
      {/* <Card className="text-sm">
      <strong>NOTE:</strong> You can add your own charts by registering "features" for your test
      inputs. Consult your PBT framework's documentation to learn more.
    </Card> */}
      <Card>
        <UniqueTimeChart dataset={dataset} />
      </Card>
    </div>
  );
};

type NominalMosaicProps = {
  samples: SampleInfo[];
  setExampleFilter: (filter: ExampleFilter) => void;
  feature1: string;
  feature2: string;
};

const NominalMosaic = (props: NominalMosaicProps) => {
  const { samples, setExampleFilter, feature1, feature2 } = props;

  // Collect all unique values for each feature
  const buckets1 = Array.from(new Set(samples.map((x) => x.features.nominal[feature1])));
  const buckets2 = Array.from(new Set(samples.map((x) => x.features.nominal[feature2])));

  return (
    <Card>
      <span className="font-bold">Breakdown of </span> <span className="font-mono">{feature1}</span>{" "}
      <span className="font-bold">vs.</span> <span className="font-mono">{feature2}</span>
      <MosaicChart
        samples={samples}
        setExampleFilter={setExampleFilter}
        axis1={buckets1.map((bucket) => [bucket, (x) => x.features.nominal[feature1] === bucket])}
        axis2={buckets2.map((bucket) => [bucket, (x) => x.features.nominal[feature2] === bucket])}
      />
    </Card>
  );
};
