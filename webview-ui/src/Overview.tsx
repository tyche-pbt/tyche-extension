import { Report } from "../../src/datatypes";
import Card from "./ui/Card";

type OverviewProps = {
  report: Report;
  selectProperty(property: string): void;
}

const Overview = (props: OverviewProps) => {
  return <Card>
    <table className="w-full">
      <tbody className="">
        {
          Object.keys(props.report.properties).map((property) =>
            <tr
              className="hover:bg-primary hover:bg-opacity-25 cursor-pointer"
              onClick={() => props.selectProperty(property)}
              key={property}>
              <td className="pl-2 py-1 rounded-s-lg">
                {property}
              </td>
              <td className="text-right pr-2 py-1 rounded-e-lg">
                {props.report.properties[property].status === "failure"
                  ? <i className="codicon codicon-x" />
                  : <i className="codicon codicon-check" />
                }

              </td>
            </tr>
          )
        }
      </tbody>
    </table>
  </Card>;
};

export default Overview;

