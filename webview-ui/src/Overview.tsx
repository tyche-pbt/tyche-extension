import { Report } from "../../src/datatypes";

type OverviewProps = {
  report: Report;
  selectProperty(property: string): void;
}

const Overview = (props: OverviewProps) => {
  return <div className="Overview w-full">
    <table className="w-full">
      <tbody>
        {
          Object.keys(props.report.properties).map((property) =>
            <tr
              className="hover:bg-foreground hover:text-background cursor-pointer"
              onClick={() => props.selectProperty(property)}
              key={property}>
              <td className="pl-2">
                {property}
              </td>
              <td className="text-right pr-2">
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
  </div>;
};

export default Overview;

