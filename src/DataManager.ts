import { DataLine, Report } from './datatypes';

function filterObject<V>(obj: { [key: string]: V }, pred: (v: V) => boolean): { [key: string]: V } {
  return Object.entries(obj)
    .filter(([_, v]) => pred(v))
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
}

export class DataManager {
  private _dataLines: DataLine[] = [];
  private _latestRuns: { [property: string]: number } = {};

  constructor() { }

  private get _latestLines(): DataLine[] {
    return this._dataLines.filter(line => line.run_start >= this._latestRuns[line.property] - 1);
  }

  public get report(): Report {
    return DataManager._buildReport(this._latestLines);
  }

  public addLines(lines: DataLine[]) {
    lines.forEach(line => this.addLine(line));
  }

  public addLine(line: DataLine) {
    this._latestRuns[line.property] = Math.max(this._latestRuns[line.property] || 0, line.run_start);
    this._dataLines.push(line);
  }

  public clear() {
    this._dataLines = [];
    this._latestRuns = {};
  }

  private static _buildReport(data: DataLine[]): Report {
    const report: Report = {
      timestamp: 0,
      properties: {},
    };
    let seen: string[] = [];

    for (const line of data) {
      if (report.timestamp === 0) {
        report.timestamp = line.run_start;
      }

      if (!(line.property in report.properties)) {
        report.properties[line.property] = { status: "success", samples: [], info: [] };
      }

      if (line.type === "test_case") {
        const duplicate = seen.includes(line.representation.toString());
        seen.push(line.representation.toString());

        if (line.status === "failed") {
          report.properties[line.property].status = "failure";
        }

        report.properties[line.property].samples.push({
          outcome: line.status,
          duplicate,
          item: line.representation.toString(),
          features: {
            numerical: filterObject(line.features, v => typeof v === "number"),
            categorical: {
              ...filterObject(line.features, v => typeof v === "string")
            }
          },
          coverage: (line.coverage !== null && line.coverage !== "no_coverage_info") ? line.coverage : {},
          metadata: { howGenerated: line.how_generated, metadata: line.metadata },
        });
      } else {
        report.properties[line.property].info.push({
          type: line.type,
          title: line.title,
          content: line.content,
        });
      }
    }
    return report;
  }
}