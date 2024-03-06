import { useState, useMemo, ChangeEvent } from "react";
import { ExampleFilter, SampleInfo } from "../report";
import Card from "../ui/Card";
import { MosaicChart } from "./MosaicChart";
import Tooltip from "../ui/Tooltip";

type NominalMosaicChartProps = {
  samples: SampleInfo[];
  setExampleFilter: (filter: ExampleFilter) => void;
  nominalFeatures: string[];
};

export const NominalMosaicChart = (props: NominalMosaicChartProps) => {
  const { samples, setExampleFilter, nominalFeatures } = props;

  const [[defaultHorizontalFeature], [defaultVerticalFeature]] = useMemo(() => {
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
          <span className="font-mono">
            <ShortenedName name={horizontalFeature} />
          </span>{" "}
          <span className="font-bold">vs.</span>{" "}
          <span className="font-mono">
            <ShortenedName name={verticalFeature} />
          </span>
        </>
      ) : (
        <>
          <span className="font-bold">Breakdown of </span>{" "}
          <select
            className="px-2 py-1 font-mono max-w-48 text-ellipsis"
            onChange={handleSetVerticalFeature}
          >
            {nominalFeatures
              .filter((feature) => feature !== horizontalFeature)
              .map((feature) => (
                <option className="max-w-48" key={feature} value={feature}>
                  {feature}
                </option>
              ))}
          </select>
          <span className="font-bold mx-1">vs.</span>{" "}
          <select
            className="px-2 py-1 font-mono max-w-48 text-ellipsis"
            onChange={handleSetHorizontalFeature}
          >
            {nominalFeatures
              .filter((feature) => feature !== verticalFeature)
              .map((feature) => (
                <option className="max-w-48" key={feature} value={feature}>
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

const ShortenedName = ({ name, maxLength }: { name: string; maxLength?: number }) => {
  maxLength = maxLength || 18;

  return name.length > maxLength ? (
    <span>
      {name.slice(0, maxLength)} <Tooltip icon="codicon-ellipsis">{name}</Tooltip>{" "}
    </span>
  ) : (
    <span>{name}</span>
  );
};
