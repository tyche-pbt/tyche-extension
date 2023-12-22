import { Report } from "../../src/datatypes";

type OverviewProps = {
  report: Report;
  selectProperty(property: string): void;
}

const Overview = (props: OverviewProps) => {
  return <div className="Overview w-full">
    <ol>
      {
        Object.keys(props.report.properties).map((property) =>
          <li
            onClick={() => props.selectProperty(property)}
            key={property}>
            {property}
          </li>
        )
      }
    </ol>
  </div>;
};

export default Overview;

