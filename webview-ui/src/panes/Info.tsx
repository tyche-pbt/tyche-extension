import Markdown from "react-markdown";
import { Drawer } from "../ui/Drawer";

type InfoProps = {
  info:
  {
    title: string;
    content: string;
    type: string;
  }[];
};

const Info = (props: InfoProps) => {
  return <>
    {props.info.map((x, i) =>
      <div key={`info-${i}`}>
        <div className="my-2 mx-0">
          <i className="codicon codicon-info text-primary mr-1"></i>
          {x.title}
          <Drawer>
            <Markdown className="markdown">{x.content}</Markdown>
          </Drawer>
        </div>
      </div>
    )}</>
}

export default Info;