import { Report } from "../../src/datatypes";
import Card from "./ui/Card";

type OverviewProps = {
  report: Report;
  selectProperty(property: string): void;
}

const Overview = (props: OverviewProps) => {
  return <Card>
    <table className="w-full">
      <tbody>
        {
          Object.keys(props.report.properties).map((property) =>
            <tr
              className="hover:bg-primary hover:bg-opacity-25 cursor-pointer"
              onClick={() => props.selectProperty(property)}
              key={property}>
              <td className="pl-2 py-1 rounded-s-md">
                {property}
              </td>
              <td className="text-right pr-2 py-1 rounded-e-md">
                {props.report.properties[property].status === "failure" &&
                  <i className="codicon codicon-x text-failure" />}
                {props.report.properties[property].status === "success" &&
                  <i className="codicon codicon-check text-success" />}
                {props.report.properties[property].status === "warning" &&
                  <i className="codicon codicon-warning text-warning" />}
              </td>
            </tr>
          )
        }
      </tbody>
    </table>
  </Card>;
};

export default Overview;

