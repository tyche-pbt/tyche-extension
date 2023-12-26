import { Disclosure } from "@headlessui/react";
import Markdown from "react-markdown";
import Card from "../ui/Card";

type InfoProps = {
  status: "success" | "failure" | "warning";
  info: {
    title: string;
    content: string;
    type: string;
  }[];
};

const Info = (props: InfoProps) => {
  return <div className="w-full mt-2">
    <Card>
      <div className="mb-2">
        {props.status === "success" &&
          <>
            <div className="text-success font-bold">
              Test Passed
            </div> We did not find any issues with your tests, but you may still want to evaluate the
            distributions below.
          </>}
        {props.status === "failure" &&
          <>
            <div className="text-error font-bold">
              Test Failed
            </div> See below for a list of counter-examples.
          </>}
        {props.status === "warning" &&
          <>
            <div className="text-warning font-bold">
              Test Passed with Warnings
            </div> No counter-examples were found, but there is a high proportion of invalid or
            duplicate samples.
          </>}
      </div>
      {props.info.map((x, i) =>
        <div className="my-1" key={`info-${i}`}>
          <Disclosure>
            {({ open }) => (<>
              <Disclosure.Button
                className={"hover:bg-opacity-25 hover:bg-primary w-full flex items-center " + (open ? "rounded-t-md bg-primary bg-opacity-25" : "rounded-md")} >
                <div className="px-2 py-1">
                  <i className="codicon codicon-info " />
                </div>
                <div className="bg-flex-none">{x.title}</div>
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
  </div>;
}

export default Info;