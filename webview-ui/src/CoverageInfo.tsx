type CoverageInfoProps = { coverage: { [key: string]: number } };

export const CoverageInfo = (props: CoverageInfoProps) => {
  return <div className="CoverageInfo">
    <span style={{
      fontWeight: "bold"
    }}>Coverage</span>
    <table>
      {Object.entries(props.coverage).map(([fname, coverage]) => <tr className="coverage-item">
        <td className="coverage-file"><code>{fname}</code></td>
        <td className="coverage-percent">{Math.round(coverage * 100)}%</td>
      </tr>)}
    </table>
  </div>;
}