import * as vscode from "vscode";
import { Disposable, Webview, WebviewPanel, window, Uri, ViewColumn, TextDocument } from "vscode";
import { getUri } from "../utilities/getUri";
import * as path from "path";
import * as child_process from "child_process";
import { Report, mergeReports } from "../datatypes";

/**
 * The main panel of the Tyche extension.
 */
export class TychePanel {
  public static currentPanel: TychePanel | undefined;
  private readonly _panel: WebviewPanel;
  private _disposables: Disposable[] = [];
  private _report: Report | undefined = undefined;
  private _decorationTypes: vscode.TextEditorDecorationType[] = [];
  private _shouldShowCoverage: boolean = false;

  private constructor(panel: WebviewPanel, extensionUri: Uri) {
    this._panel = panel;
    this._panel.onDidDispose(this.dispose, null, this._disposables);
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
  }

  /**
   * Renders the Tyche panel.
   * @param extensionUri The URI of the extension.
   * @returns The Tyche panel.
   */
  public static render(extensionUri: Uri) {
    if (TychePanel.currentPanel) {
      TychePanel.currentPanel._panel.reveal(ViewColumn.One);
    } else {
      const panel = window.createWebviewPanel(
        "tyche",
        "Tyche Report",
        ViewColumn.Two,
        { enableScripts: true, }
      );

      TychePanel.currentPanel = new TychePanel(panel, extensionUri);
    }
  }

  /**
   * Disposes the Tyche panel.
   */
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

  /**
   * Runs a property and loads the report into the Tyche panel.
   *
   * This is used by the `PropertyCodelensProvider`.
   *
   * @param document The document containing the property.
   * @param propertyName The name of the property.
   * @param extensionUri
   */
  public static runProperty(document: TextDocument, propertyName: string, extensionUri: Uri) {
    if (!TychePanel.currentPanel) {
      TychePanel.render(extensionUri);
    }

    TychePanel.currentPanel!._clearData();
    TychePanel.currentPanel!._executeHypothesisTest(document, propertyName);
  }

  /**
   * Toggles coverage highlighting and re-renders coverage highlights.
   */
  public static toggleCoverage() {
    if (!TychePanel.currentPanel) {
      return;
    }

    let panel = TychePanel.currentPanel;
    panel._shouldShowCoverage = !panel._shouldShowCoverage;
    panel._decorateCoverage();
  }

  /**
   * Re-renders coverage highlights.
   *
   * Used when the user switches documents.
   */
  public static decorateCoverage() {
    if (!TychePanel.currentPanel) {
      return;
    }

    const panel = TychePanel.currentPanel;
    panel._decorateCoverage();
  }

  /**
   * Loads a JSON-formatted report into the Tyche panel.
   *
   * @param extensionUri
   * @param jsonString A string containing the JSON of a `Report`.
   */
  public static loadJSONReport(jsonString: string, extensionUri: Uri) {
    if (!TychePanel.currentPanel) {
      TychePanel.render(extensionUri);
    }

    TychePanel.currentPanel!._loadJSONString(jsonString);
  }

  /**
   * Decorates the current document with coverage highlighting, based on the stored report.
   */
  private _decorateCoverage() {
    this._decorationTypes.forEach((decorationType) => {
      decorationType.dispose();
    });
    this._decorationTypes = [];

    if (!this._report || this._report.type === "failure" || !this._shouldShowCoverage) {
      return;
    }
    const info = Object.values(this._report.report)[0]; // TODO: Fix
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

    const greenLineDecoration = window.createTextEditorDecorationType({
      isWholeLine: true,
      backgroundColor: "rgba(0, 255, 0, 0.1)",
    });

    const redLineDecoration = window.createTextEditorDecorationType({
      isWholeLine: true,
      backgroundColor: "rgba(255, 0, 0, 0.1)",
    });

    this._decorationTypes = [greenLineDecoration, redLineDecoration];

    window.visibleTextEditors.forEach((editor) => {
      const p = editor.document.fileName;
      if (p in info.coverage) {
        decorate(editor, info.coverage[p].hitLines, greenLineDecoration);
        decorate(editor, info.coverage[p].missedLines, redLineDecoration);
      }
    });
  }

  /**
   * Clears the data in the Tyche panel.
   */
  private _clearData() {
    this._panel.webview.postMessage({ command: "clear-data" });
    this._report = undefined;
  }

  /**
   * Executes a Hypothesis test using `pytest`.
   *
   * @param document The document containing the property.
   * @param propertyName The name of the property.
   */
  private _executeHypothesisTest(document: TextDocument, propertyName: string) {
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

  /**
   * Loads a JSON-formatted report into the Tyche panel and updates coverage.
   *
   * @param jsonString A string containing the JSON of a `Report`.
   */
  private _loadJSONString(jsonString: string) {
    const newReport = JSON.parse(jsonString) as Report;
    this._report = mergeReports(this._report, newReport);

    this._panel.webview.postMessage({
      command: "load-data",
      report: this._report,
    });

    this._decorateCoverage();
  }

  /**
   * Gets the HTML content of the Tyche panel. (Provided by VSCode example.)
   *
   * @param webview
   * @param extensionUri
   */
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
