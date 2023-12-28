import { DataLine } from './datatypes';

export class DataManager {
  private _data: Map<string, Map<number, DataLine[]>> = new Map();

  constructor() { }

  public get latestLines(): DataLine[] {
    const lines = [];
    for (let [_, runs] of this._data) {
      const latestRun = Math.max(...runs.keys());
      lines.push(...runs.get(latestRun) || []);
    }
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