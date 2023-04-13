import * as vscode from "vscode";

export class PythonCodelensProvider implements vscode.CodeLensProvider {

  private codeLenses: vscode.CodeLens[] = [];
  private regex: RegExp;
  private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
  public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;
  private _extensionUri: vscode.Uri;

  constructor(extensionUri: vscode.Uri) {
    this.regex = /^@given.*?def (.*?)\(/gms; // /@given.*def .*\(/gms; // TODO Fix

    this._extensionUri = extensionUri;
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
            title: "Tyche: Run Property and Visualize",
            tooltip: "Click this to visualize your generator.",
            command: "gen-vis.hypothesis-run-property",
            arguments: [document, propertyName, this._extensionUri]
          }
        ));
      }
    }
    return this.codeLenses;
  }
}