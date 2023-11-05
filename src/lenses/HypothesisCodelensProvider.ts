import * as vscode from "vscode";
import * as path from "path";
import * as child_process from "child_process";

export class HypothesisCodelensProvider implements vscode.CodeLensProvider {

  private codeLenses: vscode.CodeLens[] = [];
  private regex: RegExp;
  private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
  public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

  constructor() {
    this.regex = /^@given.*?def (.*?)\(/gms; // /@given.*def .*\(/gms; // TODO Fix
  }

  public provideCodeLenses(
    document: vscode.TextDocument,
    _token: vscode.CancellationToken
  ): vscode.CodeLens[] {
    this.codeLenses = [];
    const regex = new RegExp(this.regex);
    const text = document.getText();
    let matches;
    while ((matches = regex.exec(text)) !== null) {
      const line = document.lineAt(document.positionAt(matches.index).line);
      const position = new vscode.Position(line.lineNumber, 0);
      const range = new vscode.Range(position, position);
      const propertyName = matches[1];
      if (range) {
        this.codeLenses.push(new vscode.CodeLens(range,
          {
            title: "Tyche: Execute Hypothesis Test",
            tooltip: "Click this to visualize your generator.",
            command: "tyche.execute-hypothesis-test",
            arguments: [document, propertyName]
          }
        ));
      }
    }
    return this.codeLenses;
  }

  /**
   * Executes a Hypothesis test using `pytest`.
   *
   * @param document The document containing the property.
   * @param propertyName The name of the property.
   */
  public static executeHypothesisTest(document: vscode.TextDocument, propertyName: string) {
    const wsFolders = vscode.workspace.workspaceFolders;

    if (!wsFolders || wsFolders.length === 0) {
      vscode.window.showErrorMessage("No active workspace. Please open a workspace.");
      return;
    }

    const wsPath = wsFolders[0].uri.path;

    const modPath = path.relative(wsPath, document.fileName).replace(".py", "").replace(/\//g, ".");

    const runCommand =
      `cd ${wsPath}; ` +
      `pytest ${modPath}.py -k ${propertyName}`;
    child_process.exec(runCommand, { encoding: "utf8" });
  }
}