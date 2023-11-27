import { DataLine, InfoLine, Report, SuccessTestInfo, TestCaseLine } from './datatypes';

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

  private get _testCaseLines(): TestCaseLine[] {
    return this._latestLines.filter(line => line.type === "test_case") as TestCaseLine[];
  }

  private get _infoLines(): InfoLine[] {
    return this._latestLines.filter(line => line.type === "info") as InfoLine[];
  }

  public get info(): { property: string, title: string, content: string }[] {
    return this._infoLines.map(line => ({
      property: line.property,
      title: line.title,
      content: line.content,
    }));
  }

  public get report(): Report {
    return DataManager._buildReport(this._testCaseLines);
  }

  public addLines(lines: DataLine[]) {
    lines.forEach(line => this.addLine(line));
  }

  public addLine(line: DataLine) {
    this._latestRuns[line.property] = Math.max(this._latestRuns[line.property] || 0, line.run_start);
    this._dataLines.push(line);
  }

  private static _buildReport(data: TestCaseLine[]): Report {
    const report: Report = {
      properties: {},
    };
    for (const line of data) {
      const sample = {
        item: line.representation.toString(),
        features: filterObject(line.features, v => typeof v === "number"),
        bucketings: filterObject(line.features, v => typeof v === "string"),
      };
      if (line.status === "failed") {
        report.properties[line.property] = {
          outcome: "propertyFailed",
          counterExample: sample,
          message: line.status_reason,
        };
      } else {
        if (!(line.property in report.properties)) {
          report.properties[line.property] = {
            outcome: "propertyPassed",
            samples: [sample],
            coverage: {}, // TODO
          };
        } else if (report.properties[line.property].outcome === "propertyPassed") {
          (report.properties[line.property] as SuccessTestInfo).samples.push(sample);
        }
      }
    }
    return report;
  }
}