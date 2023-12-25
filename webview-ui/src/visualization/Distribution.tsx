import { Popover } from "@headlessui/react";
import VegaLite from "../utilities/VegaLite";
import { SignalListeners, VisualizationSpec } from "react-vega";

export const vegaConfig = {
  axis: {
    labelFont: "Tahoma, sans-serif",
    titleFont: "Tahoma, sans-serif",
  },
  legend: {
    labelFont: "Tahoma, sans-serif",
    titleFont: "Tahoma, sans-serif",
  }
};

type DistributionProps = {
  filter: string;
  spec: VisualizationSpec;
  listeners?: SignalListeners;
};

const Distribution = (props: DistributionProps) => {
  const { filter, spec, listeners } = props;

  return <div className="w-full">
    <div className="flex mb-1">
      <div>
        <span className="font-bold">Distribution of</span> <span className="font-mono">{filter}</span>
      </div>
      <div className="flex-auto flex flex-row-reverse">
        <Popover className="relative">
          <Popover.Button className="mr-2">
            <i className="codicon codicon-menu" />
          </Popover.Button>
          <Popover.Panel className="absolute w-44 right-2 top-8 z-10 bg-white border border-black border-opacity-25 rounded-md">
            {({ close }) =>
              <>
                <button className="w-full hover:bg-primary hover:bg-opacity-25 text-left px-2 py-1"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(spec, null, 2));
                    close();
                  }}>
                  Copy Vega-Lite Spec
                </button>
                <a className="inline-block w-full hover:bg-primary hover:bg-opacity-25 text-left px-2 py-1"
                  href="https://vega.github.io/editor">
                  Open Vega Editor
                </a>
              </>
            }
          </Popover.Panel>
        </Popover>
      </div>
    </div>
    <VegaLite
      className="w-full"
      renderer="svg"
      signalListeners={listeners}
      spec={spec}
      actions={false}
    />
  </div>;
};

export default Distribution;