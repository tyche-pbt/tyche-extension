import Graphviz from "graphviz-react";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";

type ExampleDOTProps = {
  dot: string;
};

const useResize = (ref: RefObject<HTMLDivElement>) => {
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  const handleResize = useCallback(() => {
    setWidth(ref.current!.offsetWidth)
    setHeight(ref.current!.offsetHeight)
  }, [ref])

  useEffect(() => {
    window.addEventListener('load', handleResize)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('load', handleResize)
      window.removeEventListener('resize', handleResize)
    }
  }, [ref, handleResize])

  return { width, height }
}

export const ExampleDOT = (props: ExampleDOTProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const { width, height } = useResize(ref);

  return <div className="graphviz" ref={ref}>
    <Graphviz dot={props.dot} options={{ height, width }}></Graphviz>
  </div>;
};
