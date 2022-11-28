import * as React from "react";
import { SampleInfo } from "./datatypes";

type HighLevelStatsProps = {
  dataset: SampleInfo[];
};

export const HighLevelStats = (props: HighLevelStatsProps) => {
  const unique = new Set(props.dataset.map((x) => x.item.toString())).size;

  return <div className="HighLevelStats">
    <div className="stat">
      <div className="stat-title">Unique</div>
      <div className="stat-number">
        {unique.toLocaleString("en", { useGrouping: true })}
      </div>
    </div>
    <div className="stat">
      <div className="stat-title">Total</div>
      <div className="stat-number">
        {props.dataset.length.toLocaleString("en", { useGrouping: true })}
      </div>
    </div>
  </div>;
}
