import { PropsWithChildren } from "react";

const Card = (props: PropsWithChildren<{ className?: string }>) => {
  return <div className={`bg-white rounded-lg px-3 py-2 mx-2 my-2 ${props.className}`}>
    {props.children}
  </div>;
};

export default Card;