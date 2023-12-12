import { DataManager } from "./DataManager";
import { window, Range, Position, TextEditorDecorationType } from "vscode";

class Tarantula {
  public static suspiciousness(dataManager: DataManager, property: string, file: string, line: number): number {
    const testInfo = dataManager.report.properties[property];

    const totalSucceeding = testInfo.samples.filter((sample) => sample.outcome === "passed").length;
    const totalFailing = testInfo.samples.filter((sample) => sample.outcome === "failed").length;
    const success = testInfo.samples.filter((sample) =>
      sample.coverage[file] !== undefined &&
      sample.outcome === "passed" &&
      sample.coverage[file].includes(line)
    ).length;
    const failure = testInfo.samples.filter((sample) =>
      sample.coverage[file] !== undefined &&
      sample.outcome === "failed" &&
      sample.coverage[file].includes(line)
    ).length;

    if (totalSucceeding === 0 || totalFailing === 0) {
      return 0;
    }
    return 1 - ((success / totalSucceeding) / ((success / totalSucceeding) + (failure / totalFailing)));
  }
}
const redLineDecoration = (opacity: number) => window.createTextEditorDecorationType({
  isWholeLine: true,
  backgroundColor: `rgba(255, 0, 0, ${opacity})`,
});

export class CoverageDecorator {
  private _decorations: TextEditorDecorationType[] = [];

  public decorateCoverage(dataManager: DataManager) {
    // TODO Make local to property
    this._decorations.forEach((decoration) => decoration.dispose());
    this._decorations = [];

    for (const editor of window.visibleTextEditors) {
      for (let line = 0; line < editor.document.lineCount; line++) {
        for (const property in dataManager.report.properties) {
          const sus = Tarantula.suspiciousness(dataManager, property, editor.document.fileName, line);
          if (sus > 0) {
            console.log(line, property, sus);
            const decoration = redLineDecoration(sus);
            editor.setDecorations(decoration, [new Range(new Position(line - 1, 0), new Position(line - 1, 0))]);
            this._decorations.push(decoration);
          }
        }
      }
    }
  }
}
