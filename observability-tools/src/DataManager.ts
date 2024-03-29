import { DataLine, ErrorLine, schemaProtoLine } from './datatypes';
import json5 from 'json5';

export function parseLatestDataLines(linesString: string): DataLine[] | string {
  const lines = parseDataLines(linesString);
  if (typeof lines === "string") {
    return lines;
  }
  return findLatestLines(lines);
}

function parseDataLines(jsonString: string): DataLine[] | string {
  const dataLines = [];
  for (const line of jsonString.split("\n")) {
    if (line === "") {
      continue;
    }
    try {
      const obj = json5.parse(line);
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

function findLatestLines(lines: DataLine[]): DataLine[] {
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