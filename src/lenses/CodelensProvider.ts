import * as vscode from 'vscode';

export class CodelensProvider implements vscode.CodeLensProvider {

  private codeLenses: vscode.CodeLens[] = [];
  private regex: RegExp;
  private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
  public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;
  private _extensionUri: vscode.Uri;

  constructor(extensionUri: vscode.Uri) {
    this.regex = /gen(\w|\d)+ :: Gen .+/g; // TODO Fix
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
      const indexOf = line.text.indexOf(matches[0]);
      const position = new vscode.Position(line.lineNumber, indexOf);
      const range = document.getWordRangeAtPosition(position, new RegExp(this.regex));
      if (range) {
        this.codeLenses.push(new vscode.CodeLens(range,
          {
            title: "GenVis: Visualize Generator Distribution",
            tooltip: "Click this to visualize your generator.",
            command: "gen-vis.select-generator-inline",
            arguments: [document, range, this._extensionUri]
          }
        ));
      }
    }
    return this.codeLenses;
  }
}