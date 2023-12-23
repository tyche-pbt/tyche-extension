import { PropsWithChildren } from "react";

const Card = (props: PropsWithChildren<{}>) => {
  return <div className="bg-white rounded-lg px-3 py-2 mx-2 my-2">
    {props.children}
  </div>;
};

export default Card;