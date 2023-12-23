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
  return <Card>
    <div className="mb-2">
      {props.status === "success"
        ? <>
          <div className="text-success font-bold">Test Passed</div> But there may still be issues. Make sure to look carefully at the visualizations below.
        </>
        : <>
          <div className="text-error font-bold">Test Failed</div> See below for a list of counter-examples.
        </>
      }
    </div>
    {props.info.map((x, i) =>
      <Disclosure key={`info-${i}`}>
        {({ open }) => (<>
          <Disclosure.Button>
            <i className="codicon codicon-info text-primary mr-1" />
            {x.title}
            <i className={`codicon codicon-chevron-right ${open ? "transform rotate-90" : ""}`} />
          </Disclosure.Button>
          <Disclosure.Panel>
            <Markdown className="markdown">{x.content}</Markdown>
          </Disclosure.Panel>
        </>)}
      </Disclosure >
    )}</Card>;
}

export default Info;