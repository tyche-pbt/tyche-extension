import { DataLine, ErrorLine, schemaProtoLine } from './datatypes';

export function parseDataLines(jsonString: string): DataLine[] | string {
  const dataLines = [];
  for (const line of jsonString.split("\n")) {
    if (line === "") {
      continue;
    }
    try {
      const obj = JSON.parse(line);
      const parsedLine = schemaProtoLine.parse(obj);
      dataLines.push(parsedLine);
    } catch (e) {
      return ("Tyche: Could not parse JSON report.\n" + e + "\nInvalid Object: " + line);
    }
  }

  const errorLine = dataLines.find((line) => line.type === "error") as ErrorLine | undefined;
  if (errorLine !== undefined) {
    return ("Tyche: Encountered unknown failure.\n" + errorLine.message);
  }

  return dataLines as DataLine[];
}

export function findLatestLines(lines: DataLine[]): DataLine[] {
  const manager = new DataManager();
  manager.addLines(lines);
  return manager.latestLines;
}

class DataManager {
  private _data: Map<string, Map<number, DataLine[]>> = new Map();

  public get latestLines(): DataLine[] {
    const lines: DataLine[] = [];
    this._data.forEach((runs) => {
      const latestRun = Math.max(...Array.from(runs.keys()));
      lines.push(...runs.get(latestRun) || []);
    });
    return lines;
  }

  public addLines(lines: DataLine[]) {
    lines.forEach(line => this.addLine(line));
  }

  public addLine(line: DataLine) {
    const propRuns = this._data.get(line.property) || new Map();
    const runData = propRuns.get(line.run_start) || [];
    this._data.set(line.property, propRuns.set(line.run_start, [...runData, line]));
  }

  public clear() {
    this._data = new Map();
  }
}