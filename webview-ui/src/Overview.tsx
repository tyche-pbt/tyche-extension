import { Report } from "./report";
import Card from "./ui/Card";

type OverviewProps = {
  report: Report;
  selectProperty(property: string): void;
  simplifiedMode: boolean;
}

type Status = "success" | "failure" | "warning";

const compareStatus = (status1: Status, status2: Status): number => {
  const toNum = (status: Status) => {
    switch (status) {
      case "success":
        return 2;
      case "warning":
        return 1;
      case "failure":
        return 0;
    }
  };
  return toNum(status1) - toNum(status2);
}


const Overview = (props: OverviewProps) => {
  return <Card className="mt-2">
    <ul className="w-full">
      {Object.entries(props.report.properties).sort(([, info1], [, info2]) => compareStatus(info1.status, info2.status)).map(([property, info]) =>
        <li
          className="hover:bg-primary hover:bg-opacity-25 cursor-pointer flex w-full py-1 px-1 rounded-md"
          onClick={() => props.selectProperty(property)}
          key={property}>
          <div
            className="flex-1 min-w-0 overflow-hidden overflow-ellipsis"
            style={{ direction: "rtl" }}
            title={property}>
            {property}
          </div>
          {!props.simplifiedMode &&
            <div className="ml-3">
              {info.status === "failure" &&
                <i className="codicon codicon-x text-error" />}
              {info.status === "success" &&
                <i className="codicon codicon-check text-success" />}
              {info.status === "warning" &&
                <i className="codicon codicon-warning text-warning" />}
            </div>}
        </li>)}
    </ul>
  </Card>;
};

export default Overview;

