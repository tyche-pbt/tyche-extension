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
    nominal: ["horizontal feature", "vertical feature"],
  };

  let dataset = rawDataset.filter((x) => x.outcome === "passed" || x.outcome === "failed");

  const hFeatures = ["A", "B", "C", "D"];
  const vFeatures = ["1", "2", "3", "4", "5"];

  dataset = dataset.map((x, i) => {
    return {
      ...x,
      features: {
        ...x.features,
        nominal: {
          // ...x.features.nominal,
          "vertical feature": vFeatures[Math.floor((i / dataset.length) * vFeatures.length)],
          "horizontal feature": hFeatures[i % hFeatures.length],
        },
      },
    };
  });

  const coverageChart = null; // CoverageChart({ dataset });

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
  const buckets1 = Array.from(
    new Set(samples.map((x) => x.features.nominal[feature1]).filter((x) => x !== undefined))
  );
  const buckets2 = Array.from(
    new Set(samples.map((x) => x.features.nominal[feature2]).filter((x) => x !== undefined))
  );

  const [[horizontalFeature, horizontalBuckets], [verticalFeature, verticalBuckets]] =
    buckets1.length < buckets2.length
      ? [
          [feature1, buckets1],
          [feature2, buckets2],
        ]
      : [
          [feature2, buckets2],
          [feature1, buckets1],
        ];

  console.log(horizontalBuckets);
  console.log(verticalBuckets);

  return (
    <Card>
      <span className="font-bold">Breakdown of </span> <span className="font-mono">{feature1}</span>{" "}
      <span className="font-bold">vs.</span> <span className="font-mono">{feature2}</span>
      <MosaicChart
        samples={samples}
        setExampleFilter={setExampleFilter}
        horizontalAxis={horizontalBuckets.map((bucket) => [
          bucket,
          (x) => x.features.nominal[horizontalFeature] === bucket,
        ])}
        verticalAxis={verticalBuckets.map((bucket) => [
          bucket,
          (x) => x.features.nominal[verticalFeature] === bucket,
        ])}
        colors={["accent", "accent2", "accent3", "warning", "primary"]}
      />
    </Card>
  );
};
