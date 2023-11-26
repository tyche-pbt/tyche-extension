import * as vscode from "vscode";
import { Disposable, Webview, WebviewPanel, window, Uri, ViewColumn } from "vscode";
import { getUri } from "../utilities/getUri";
import { CoverageItem, ErrorLine, Report, SuccessTestInfo, TestCaseLine, buildReport, mergeCoverage, mergeReports, schemaDataLine, schemaDataLines, schemaReport, schemaRequest } from "../datatypes";

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
  public static renderJSONReport(jsonString: string, extensionUri: Uri) {
    const report = TychePanel.parseJSONRequest(jsonString);

    if (!report) {
      return;
    }

    if (!TychePanel.currentPanel) {
      TychePanel.render(extensionUri);
    }

    TychePanel.currentPanel!._loadJSONReport(report);
  }

  /**
   * Decorates the current document with coverage highlighting, based on the stored report.
   */
  private _decorateCoverage() {
    this._decorationTypes.forEach((decorationType) => {
      decorationType.dispose();
    });
    this._decorationTypes = [];

    if (!this._report || !this._shouldShowCoverage) {
      return;
    }

    let infos: SuccessTestInfo[] =
      Object.values(this._report.properties).filter((info) => info.outcome === "propertyPassed") as SuccessTestInfo[];

    if (infos.length === 0) {
      return;
    }

    const hd = infos[0].coverage;
    const tl = infos.slice(1);

    const coverage = tl.reduce((acc, cur) => mergeCoverage(acc, cur.coverage), hd);

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
      if (p in coverage) {
        decorate(editor, coverage[p].hitLines, greenLineDecoration);
        decorate(editor, coverage[p].missedLines, redLineDecoration);
      }
    });
  }

  public static parseJSONRequest(jsonString: string): Report | undefined {
    const dataLines = [];
    for (const line of jsonString.split("\n")) {
      if (line === "") {
        continue;
      }
      try {
        const obj = JSON.parse(line);
        const parsedLine = schemaDataLine.parse(obj);
        dataLines.push(parsedLine);
      } catch (e) {
        window.showErrorMessage("Tyche: Could not parse JSON report.\n" + e + "\nInvalid Object: " + line);
        return undefined;
      }
    }

    const errorLine = dataLines.find((line) => line.type === "error") as ErrorLine | undefined;
    if (errorLine !== undefined) {
      window.showErrorMessage("Tyche: Encountered unknown failure.\n" + errorLine.message);
      return undefined;
    }

    // TODO Handle InfoLines
    return buildReport(dataLines.filter((line) => line.type === "test_case") as TestCaseLine[]);
  }

  /**
   * Loads a JSON-formatted report into the Tyche panel and updates coverage.
   *
   * @param jsonString A string containing the JSON of a `Report`.
   */
  private _loadJSONReport(newReport: Report) {
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
