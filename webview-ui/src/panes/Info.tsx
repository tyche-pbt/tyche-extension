import { Disclosure } from "@headlessui/react";
import Markdown from "react-markdown";
import Card from "../ui/Card";

type InfoProps = {
  status: "success" | "failure";
  info: {
    title: string;
    content: string;
    type: string;
  }[];
};

const Info = (props: InfoProps) => {
  return <div className="flex w-full"><Card className="flex-1">
    <div className="mb-2">
      {props.status === "success"
        ? <>
          <div className="text-success font-bold">
            Test Passed
          </div> But there may still be issues. Make sure to look carefully at the visualizations below.
        </>
        : <>
          <div className="text-error font-bold">
            Test Failed
          </div> See below for a list of counter-examples.
        </>
      }
    </div>
    {props.info.map((x, i) =>
      <div className="my-1" key={`info-${i}`}>
        <Disclosure>
          {({ open }) => (<>
            <Disclosure.Button
              className={"bg-primary bg-opacity-25 w-full flex items-center " + (open ? "rounded-t-lg" : "rounded-lg")} >
              <div className="px-2">
                <i className="codicon codicon-info text-primary" />
              </div>
              <div className="bg-flex-none">{x.title}</div>
              <div className="flex-auto text-right pr-2">
                <i className={"codicon codicon-chevron-right " + (open ? "transform rotate-90" : "")} />
              </div>
            </Disclosure.Button>
            <Disclosure.Panel className="p-2 border border-primary border-opacity-25 rounded-b-lg">
              <Markdown className="markdown text-sm">{x.content}</Markdown>
            </Disclosure.Panel>
          </>)}
        </Disclosure >
      </div>
    )}</Card></div>;
}

export default Info;