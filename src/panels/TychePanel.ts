import { Disposable, Webview, WebviewPanel, window, Uri, ViewColumn, workspace } from "vscode";
import { getUri } from "../utilities/getUri";

/**
 * The main panel of the Tyche extension.
 */
export class TychePanel {
  public static currentPanel: TychePanel | undefined;
  private readonly _panel: WebviewPanel;
  private _disposables: Disposable[] = [];

  private constructor(panel: WebviewPanel, extensionUri: Uri) {
    this._panel = panel;
    this._panel.onDidDispose(this.dispose, null, this._disposables);
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
    this._panel.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case "error":
          window.showErrorMessage("An error occurred parsing the given JSON lines file. See the output tab.");

          const outputChannel = window.createOutputChannel("Tyche");
          outputChannel.append(message.message);
          break;
      }
    });
  }

  public static reset() {
    if (TychePanel.currentPanel) {
      TychePanel.currentPanel.dispose();
    }
  }

  /**
   * Renders the Tyche panel.
   * @param extensionUri The URI of the extension.
   * @returns The Tyche panel.
   */
  public static getOrCreate(linesString: string, extensionUri: Uri) {
    if (TychePanel.currentPanel) {
      TychePanel.currentPanel._panel.reveal(ViewColumn.Two);
    } else {
      const panel = window.createWebviewPanel(
        "tyche",
        "Tyche Report",
        ViewColumn.Two,
        { enableScripts: true, }
      );

      TychePanel.currentPanel = new TychePanel(panel, extensionUri);
    }
    TychePanel.currentPanel.render(linesString);
    return TychePanel.currentPanel;
  }

  public render(linesString: string) {
    this._panel.webview.postMessage({
      command: "load-data",
      lines: linesString,
    });
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
   * Gets the HTML content of the Tyche panel. (Provided by VSCode example.)
   *
   * @param webview
   * @param extensionUri
   */
  private _getWebviewContent(webview: Webview, extensionUri: Uri) {
    // The CSS file from the React build output
    const codiconsUri = webview.asWebviewUri(Uri.joinPath(extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'));
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
          <link href="${codiconsUri}" rel="stylesheet" />
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
