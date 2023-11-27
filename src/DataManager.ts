import { DataLine, InfoLine, Report, SuccessTestInfo, TestCaseLine } from './datatypes';

function filterObject<V>(obj: { [key: string]: V }, pred: (v: V) => boolean): { [key: string]: V } {
  return Object.entries(obj)
    .filter(([_, v]) => pred(v))
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
}

export class DataManager {
  private _infoLines: InfoLine[] = [];
  private _testCaseLines: TestCaseLine[] = [];

  constructor() { }

  public get info(): { property: string, title: string, content: string }[] {
    return this._infoLines.map(line => ({
      property: line.property,
      title: line.title,
      content: line.content,
    }));
  }

  public get report(): Report {
    return this._buildReport(this._testCaseLines);
  }

  public addLines(lines: DataLine[]) {
    lines.forEach(line => this.addLine(line));
  }

  public addLine(line: DataLine) {
    switch (line.type) {
      case "test_case":
        this._testCaseLines.push(line);
        break;
      case "info":
        this._infoLines.push(line);
        break;
    }
  }

  private _buildReport(data: TestCaseLine[]): Report {
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