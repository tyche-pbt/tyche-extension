import { ReactNode, useState } from "react";

type DrawerState = "open" | "closed";

type DrawerProps = {
  children: ReactNode;
};

export const Drawer = (props: DrawerProps) => {
  const [drawerState, setDrawerState] = useState<DrawerState>("closed");

  if (drawerState === "closed") {
    return <span onClick={() => setDrawerState("open")}>
      &nbsp;<i className="codicon codicon-chevron-right icon-click" />
    </span>;
  } else {
    return <>
      <span onClick={() => setDrawerState("closed")}>
        &nbsp;<i className="codicon codicon-chevron-down icon-click" />
      </span>
      {props.children}
    </>;
  }
};