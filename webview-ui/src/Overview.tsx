import { Report } from "../../src/datatypes";
import Card from "./ui/Card";

type OverviewProps = {
  report: Report;
  selectProperty(property: string): void;
}

const Overview = (props: OverviewProps) => {
  return <Card className="mt-2">
    <ul className="w-full">
      {Object.keys(props.report.properties).map((property) =>
        <li
          className="hover:bg-primary hover:bg-opacity-25 cursor-pointer flex w-full py-1 px-1 rounded-md"
          onClick={() => props.selectProperty(property)}
          key={property}>
          <div
            className="flex-1 min-w-0 overflow-auto overflow-ellipsis"
            style={{ direction: "rtl" }}
            title={property}>
            {property}
          </div>
          <div className="ml-3">
            {props.report.properties[property].status === "failure" &&
              <i className="codicon codicon-x text-error" />}
            {props.report.properties[property].status === "success" &&
              <i className="codicon codicon-check text-success" />}
            {props.report.properties[property].status === "warning" &&
              <i className="codicon codicon-warning text-warning" />}
          </div>
        </li>)}
    </ul>
  </Card>;
};

export default Overview;

