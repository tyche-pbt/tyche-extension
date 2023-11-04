import * as vscode from "vscode";
import { Disposable, Webview, WebviewPanel, window, Uri, ViewColumn, TextDocument } from "vscode";
import { getUri } from "../utilities/getUri";
import * as path from "path";
import * as child_process from "child_process";
import { Report } from "../datatypes";

const mintDecorationTypes = () => {
  const greenLineDecoration = window.createTextEditorDecorationType({
    isWholeLine: true,
    backgroundColor: "rgba(0, 255, 0, 0.1)",
  });

  const redLineDecoration = window.createTextEditorDecorationType({
    isWholeLine: true,
    backgroundColor: "rgba(255, 0, 0, 0.1)",
  });
  return [greenLineDecoration, redLineDecoration];
};

export class TychePanel {
  public static currentPanel: TychePanel | undefined;
  private readonly _panel: WebviewPanel;
  private _disposables: Disposable[] = [];
  private _lastSource: { document: TextDocument, propertyName: string } | undefined = undefined;
  private _lastReport: Report | undefined = undefined;
  private _decorationTypes: vscode.TextEditorDecorationType[] = [];
  private _shouldShowCoverage: boolean = false;

  private constructor(panel: WebviewPanel, extensionUri: Uri) {
    this._panel = panel;
    this._panel.onDidDispose(this.dispose, null, this._disposables);
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
    this._setWebviewMessageListener(this._panel.webview);
  }

  public static render(extensionUri: Uri) {
    if (TychePanel.currentPanel) {
      TychePanel.currentPanel._panel.reveal(ViewColumn.One);
    } else {
      const panel = window.createWebviewPanel(
        "genVis",
        "Testing Performance Report",
        ViewColumn.Two,
        { enableScripts: true, }
      );

      TychePanel.currentPanel = new TychePanel(panel, extensionUri);
    }
  }

  public dispose() {
    TychePanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  public static lastSourceIs(document: TextDocument): boolean {
    if (!TychePanel.currentPanel) {
      return false;
    }

    const panel = TychePanel.currentPanel;
    return panel._lastSource !== undefined && (panel._lastSource.document === document);
  }

  public static refreshData() {
    if (!TychePanel.currentPanel) {
      vscode.window.showErrorMessage("No active visualization to update.");
      return;
    }

    TychePanel.currentPanel._refreshDataForActiveVisualization();
  }

  public static runProperty(document: TextDocument, propertyName: string, extensionUri: Uri) {
    if (!TychePanel.currentPanel) {
      TychePanel.render(extensionUri);
    }

    TychePanel.currentPanel!._clearData();
    TychePanel.currentPanel!._executeHypothesisTestAndLoad(document, propertyName);
  }

  public static toggleCoverage() {
    if (!TychePanel.currentPanel) {
      return;
    }

    let panel = TychePanel.currentPanel;
    panel._shouldShowCoverage = !panel._shouldShowCoverage;
    panel._decorateCoverage();
  }

  public static decorateCoverage() {
    if (!TychePanel.currentPanel) {
      return;
    }

    const panel = TychePanel.currentPanel;
    panel._decorateCoverage();
  }

  private _refreshDataForActiveVisualization() {
    if (!this._lastSource) {
      vscode.window.showErrorMessage("No data source to refresh.");
      return;
    }

    const { document, propertyName } = this._lastSource;
    this._executeHypothesisTestAndLoad(document, propertyName);
  }

  private _decorateCoverage() {
    this._decorationTypes.forEach((decorationType) => {
      decorationType.dispose();
    });
    this._decorationTypes = [];

    if (!this._lastReport || !this._shouldShowCoverage) {
      return;
    }
    const info = Object.values(this._lastReport)[0]; // TODO: Fix
    if (info.type && info.type !== "success") {
      return;
    }

    const decorate = (editor: vscode.TextEditor, lines: number[], decorationType: vscode.TextEditorDecorationType) => {
      editor.setDecorations(decorationType,
        lines.map((line) => {
          let range = new vscode.Range(new vscode.Position(line - 1, 0), new vscode.Position(line - 1, 0));
          return { range };
        })
      );
    };

    const [greenLineDecoration, redLineDecoration] = mintDecorationTypes();
    this._decorationTypes = [greenLineDecoration, redLineDecoration];

    window.visibleTextEditors.forEach((editor) => {
      const p = editor.document.fileName;
      if (p in info.coverage) {
        decorate(editor, info.coverage[p].hitLines, greenLineDecoration);
        decorate(editor, info.coverage[p].missedLines, redLineDecoration);
      }
    });
  }


  private _clearData() {
    this._panel.webview.postMessage({ command: "clear-data" });
  }

  private _executeHypothesisTestAndLoad(document: TextDocument, propertyName: string) {
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

  public static loadJSONStringFromCommand(extensionUri: Uri, jsonString: string) {
    if (!TychePanel.currentPanel) {
      TychePanel.render(extensionUri);
    }

    TychePanel.currentPanel!._loadJSONString(undefined, "Command", jsonString);
  }

  private _loadJSONString(document: TextDocument | undefined, propertyName: string, jsonString: string) {
    this._panel.webview.postMessage({
      command: "load-data",
      genName: propertyName,
      genSource: document ? `Live: ${document.fileName}:${propertyName}` : "Sent from Command",
      testInfo: jsonString
    });

    const info = JSON.parse(jsonString) as Report;

    this._lastReport = info;
    this._lastSource = document ? { document, propertyName } : undefined;

    this._decorateCoverage();
  }

  private _setWebviewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        const command = message.command;

        switch (command) {
          case "request-refresh-data":
            this._refreshDataForActiveVisualization();
            return;
        }
      },
      undefined,
      this._disposables
    );
  }

  private _getWebviewContent(webview: Webview, extensionUri: Uri) {
    // The CSS file from the React build output
    const stylesUri = getUri(webview, extensionUri, [
      "webview-ui",
      "build",
      "static",
      "css",
      "main.css",
    ]);
    // The JS file from the React build output
    const scriptUri = getUri(webview, extensionUri, [
      "webview-ui",
      "build",
      "static",
      "js",
      "main.js",
    ]);

    // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
          <meta name="theme-color" content="#000000">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>Generator Visualizer</title>
        </head>
        <body>
          <noscript>You need to enable JavaScript to run this app.</noscript>
          <div id="root"></div>
          <script src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }
}
