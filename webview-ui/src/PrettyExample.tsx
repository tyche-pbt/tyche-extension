import { SampleInfo } from "./datatypes";
// import ReactJSON from "react-json-view";

type PrettyExampleProps = {
  example: SampleInfo;
};

export const PrettyExample = (props: PrettyExampleProps) => {
  return <div className="PrettyExample"><pre>{props.example.item}</pre></div>;

  // return <div className="PrettyExample">
  //   <ReactJSON
  //     src={typeof props.example.json === "string" ? JSON.parse(props.example.json) : props.example.json}
  //     collapsed={true}
  //     theme={{
  //       base00: "2E3440",
  //       base01: "3B4252",
  //       base02: "434C5E",
  //       base03: "4C566A",
  //       base04: "D8DEE9",
  //       base05: "E5E9F0",
  //       base06: "ECEFF4",
  //       base07: "8FBCBB",
  //       base08: "88C0D0",
  //       base09: "81A1C1",
  //       base0A: "5E81AC",
  //       base0B: "BF616A",
  //       base0C: "D08770",
  //       base0D: "EBCB8B",
  //       base0E: "A3BE8C",
  //       base0F: "B48EAD"
  //     }}
  //   />
  // </div>;
};
