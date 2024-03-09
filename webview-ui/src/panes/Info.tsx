import { Disclosure } from "@headlessui/react";
import Card from "../ui/Card";
import Markdown from "react-markdown";
import Tooltip from "../ui/Tooltip";

type InfoProps = {
  info: {
    title: string;
    content: string;
    type: string;
  }[];
};

// <button
//   className="text-center rounded-md w-full hover:bg-primary hover:bg-opacity-25 py-1"
//   onClick={() => setExampleFilter("all")} >
//   See All Samples <i className="codicon codicon-arrow-right ml-1" />
// </button>

const Info = (props: InfoProps) => {
  return <Card>
    <span className="font-bold">
      Extra Information
    </span> <Tooltip>This information was provided by your PBT framework. It may already be
      reflected elsewhere in this interface, but it is included here for convenience.</Tooltip>
    {props.info.map((x, i) =>
      <div className="my-1" key={`info-${i}`}>
        <Disclosure>
          {({ open }) => (<>
            <Disclosure.Button
              className={"hover:bg-opacity-25 hover:bg-primary w-full flex items-center " + (open ? "rounded-t-md bg-primary bg-opacity-25" : "rounded-md")} >
              <div className="px-2 py-1 bg-flex-none">{x.title}</div>
              <div className="flex-auto text-right pr-2">
                <i className={"codicon codicon-chevron-right " + (open ? "transform rotate-90" : "")} />
              </div>
            </Disclosure.Button>
            <Disclosure.Panel className="p-2 border border-primary border-opacity-25 rounded-b-md">
              <Markdown className="markdown text-sm break-words">{x.content}</Markdown>
            </Disclosure.Panel>
          </>)}
        </Disclosure >
      </div>
    )}
  </Card>
};

export default Info;