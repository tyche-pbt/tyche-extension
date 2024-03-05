import { useState, useMemo, ChangeEvent } from "react";
import { ExampleFilter, SampleInfo } from "../report";
import { OrdinalChart } from "../visualization/OrdinalChart";
import { NominalChart } from "../visualization/NominalChart";
import Card from "../ui/Card";
import { UniqueTimeChart } from "../visualization/UniqueTimeChart";
import { MosaicChart } from "../visualization/MosaicChart";
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
      {features.nominal.length >= 2 ? (
        <NominalMosaic
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
      {/* <Card className="text-sm">
      <strong>NOTE:</strong> You can add your own charts by registering "features" for your test
      inputs. Consult your PBT framework's documentation to learn more.
    </Card> */}
      <Card>
        <UniqueTimeChart dataset={dataset} />
      </Card>
      <TimingChart
        dataset={dataset}
        viewValues={(examples) =>
          props.setFilteredView({
            subset: "Selected samples by time taken",
            examples,
          })
        }
      />
    </div>
  );
};

type NominalMosaicProps = {
  samples: SampleInfo[];
  setExampleFilter: (filter: ExampleFilter) => void;
  nominalFeatures: string[];
};

const NominalMosaic = (props: NominalMosaicProps) => {
  const { samples, setExampleFilter, nominalFeatures } = props;

  const [
    [defaultHorizontalFeature, defaultHorizontalBuckets],
    [defaultVerticalFeature, defaultVerticalBuckets],
  ] = useMemo(() => {
    const feature1 = nominalFeatures[0];
    const feature2 = nominalFeatures[1];

    // Collect all unique values for each feature
    const buckets1 = Array.from(
      new Set(samples.map((x) => x.features.nominal[feature1]).filter((x) => x !== undefined))
    );
    const buckets2 = Array.from(
      new Set(samples.map((x) => x.features.nominal[feature2]).filter((x) => x !== undefined))
    );

    // Presentation heuristic: the feature with fewer distinct categories should be the horizontal axis.
    // It's not usually the case that there is more horizontal screen space than vertical.
    return buckets1.length < buckets2.length
      ? [
          [feature1, buckets1],
          [feature2, buckets2],
        ]
      : [
          [feature2, buckets2],
          [feature1, buckets1],
        ];
  }, [samples, nominalFeatures]);

  const [horizontalFeature, setHorizontalFeature] = useState(defaultHorizontalFeature);
  const [verticalFeature, setVerticalFeature] = useState(defaultVerticalFeature);

  const horizontalBuckets = useMemo(
    () =>
      Array.from(
        new Set(
          samples.map((x) => x.features.nominal[horizontalFeature]).filter((x) => x !== undefined)
        )
      ),
    [samples, horizontalFeature]
  );
  const verticalBuckets = useMemo(
    () =>
      Array.from(
        new Set(
          samples.map((x) => x.features.nominal[verticalFeature]).filter((x) => x !== undefined)
        )
      ),
    [samples, verticalFeature]
  );

  const handleSetHorizontalFeature = (event: ChangeEvent<HTMLSelectElement>) => {
    setHorizontalFeature(event.target.value);
  };
  const handleSetVerticalFeature = (event: ChangeEvent<HTMLSelectElement>) => {
    setVerticalFeature(event.target.value);
  };

  return (
    <Card>
      {nominalFeatures.length === 2 ? (
        <>
          <span className="font-bold">Breakdown of </span>{" "}
          <span className="font-mono">{horizontalFeature}</span>{" "}
          <span className="font-bold">vs.</span>{" "}
          <span className="font-mono">{verticalFeature}</span>
        </>
      ) : (
        <>
          <span className="font-bold">Breakdown of </span>{" "}
          <select className="px-2 py-1 font-mono" onChange={handleSetVerticalFeature}>
            {nominalFeatures
              .filter((feature) => feature !== horizontalFeature)
              .map((feature) => (
                <option key={feature} value={feature}>
                  {feature}
                </option>
              ))}
          </select>
          <span className="font-bold">vs.</span>{" "}
          <select className="px-2 py-1 font-mono" onChange={handleSetHorizontalFeature}>
            {nominalFeatures
              .filter((feature) => feature !== verticalFeature)
              .map((feature) => (
                <option key={feature} value={feature}>
                  {feature}
                </option>
              ))}
          </select>
        </>
      )}
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
        colors={[
          "accent2",
          "accent4",
          "accent5",
          "accent",
          "success",
          "accent3",
          "warning",
          "error",
        ]}
      />
    </Card>
  );
};
