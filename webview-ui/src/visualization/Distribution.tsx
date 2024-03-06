import { Popover } from "@headlessui/react";
import VegaLite from "../utilities/VegaLite";
import { SignalListeners, VisualizationSpec } from "react-vega";
import Tooltip from "../ui/Tooltip";

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
  title: JSX.Element;
  spec: VisualizationSpec;
  listeners?: SignalListeners;
  tooltip?: string;
};

const Distribution = (props: DistributionProps) => {
  const { title, spec, listeners, tooltip } = props;

  return <div className="w-full">
    <div className="mb-1 flex">
      <div className="flex-1">
        <span className="overflow-ellipsis text-nowrap">
          {title}
        </span> {tooltip && <Tooltip>{tooltip}</Tooltip>}
      </div>
      <div className="flex flex-row-reverse">
        <Popover className="relative">
          <Popover.Button className="mx-2">
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