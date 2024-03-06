import { Disclosure } from "@headlessui/react";
import { SampleInfo } from "../report";
import Tooltip from "./Tooltip";

type PrettyExampleProps = {
  example: SampleInfo;
  highlightText?: string;
  duplicateCount?: number;
  noExpand?: boolean;
};

export const PrettyExample = (props: PrettyExampleProps) => {
  if (props.noExpand) {
    return <pre className="w-full text-sm break-words whitespace-pre-wrap">
      <PrettyText text={props.example.item} highlightText={props.highlightText} />
    </pre>;
  }

  return (
    <>
      <div className="w-full">
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button
                as="div"
                className={`flex flex-row ${open ? "cursor-zoom-out" : "cursor-zoom-in"}`}>
                <pre className="w-full text-sm break-words whitespace-pre-wrap">
                  {props.example.item !== "" ? (
                    <PrettyText text={props.example.item} highlightText={props.highlightText} />
                  ) : (
                    <><span className="font-sans italic">Incomplete sample.</span> <Tooltip>
                      <span className="font-sans">
                        Some PBT frameworks may "give up" while generating a value if an internal
                        filter fails too often or if they "run out" of randomness. If there are too
                        many samples like this, you may want to file a bug report with your PBT
                        framework.
                      </span>
                    </Tooltip></>
                  )}
                </pre>
                <div className="flex flex-col justify-center">
                  {props.duplicateCount !== undefined && props.duplicateCount > 1 && (
                    <div className="text-sm text-white rounded-full px-2 bg-accent ml-1">
                      {props.duplicateCount}&times;
                    </div>
                  )}
                </div>
              </Disclosure.Button>
              <Disclosure.Panel
                as="pre"
                className="w-full mt-2 text-sm break-words whitespace-pre-wrap">
                <div className="font-sans">Details:</div>
                {JSON.stringify(props.example.dataLine, null, 2)}
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>
    </>
  );
};

type PrettyTextProps = {
  text: string;
  highlightText?: string;
};

const PrettyText = (props: PrettyTextProps) => {
  const sections =
    props.highlightText !== undefined && props.highlightText.length > 0
      ? props.text.split(
        new RegExp(`(${props.highlightText.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi")
      )
      : [props.text];
  return (
    <>
      {sections.map((section, i) => (
        <span
          key={i}
          className={
            section.toLowerCase() === props.highlightText?.toLowerCase()
              ? "bg-accent bg-opacity-30"
              : ""
          }>
          {section}
        </span>
      ))}
    </>
  );
};
