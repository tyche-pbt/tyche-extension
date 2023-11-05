import { CoverageItem } from "../../src/datatypes";

type CoverageInfoProps = { coverage: {[key: string]: CoverageItem} };

export const CoverageInfo = (props: CoverageInfoProps) => {
  return <div className="CoverageInfo">
    <span style={{
      fontWeight: "bold"
    }}>Coverage</span>
    <table>
      {Object.entries(props.coverage).map(([fileName, coverage]) => {
        const executed = coverage.hitLines.length + coverage.missedLines.length;
        const percentage = executed === 0 ? 0 : coverage.hitLines.length / executed
        return <tr className="coverage-item">
          <td className="coverage-file"><code>{fileName}</code></td>
          <td className="coverage-percent">
            {Math.round(percentage * 100)}%
          </td>
        </tr>;
      })}
    </table>
  </div>;
}