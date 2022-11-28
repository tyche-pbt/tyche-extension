import * as vscode from "vscode";
import * as fs from "fs";
import { Disposable, Webview, WebviewPanel, window, Uri, ViewColumn } from "vscode";
import { getUri } from "../utilities/getUri";
import * as path from "path";

const posixPath = path.posix || path;

type SampleInfo = {
  item: string;
  dot?: string;
  features: {
    [key: string]: number;
  };
  filters: {
    [key: string]: boolean;
  };
};

/**
 * This class manages the state and behavior of HelloWorld webview panels.
 *
 * It contains all the data and methods for:
 *
 * - Creating and rendering HelloWorld webview panels
 * - Properly cleaning up and disposing of webview resources when the panel is closed
 * - Setting the HTML (and by proxy CSS/JavaScript) content of the webview panel
 * - Setting message listeners so data can be passed between the webview and extension
 */
export class GenVisPanel {
  public static currentPanel: GenVisPanel | undefined;
  private readonly _panel: WebviewPanel;
  private _disposables: Disposable[] = [];
  private _lastUri: vscode.Uri | undefined = undefined;

  /**
   * The HelloWorldPanel class private constructor (called only from the render method).
   *
   * @param panel A reference to the webview panel
   * @param extensionUri The URI of the directory containing the extension
   */
  private constructor(panel: WebviewPanel, extensionUri: Uri) {
    this._panel = panel;

    // Set an event listener to listen for when the panel is disposed (i.e. when the user closes
    // the panel or when the panel is closed programmatically)
    this._panel.onDidDispose(this.dispose, null, this._disposables);

    // Set the HTML content for the webview panel
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);

    // Set an event listener to listen for messages passed from the webview context
    this._setWebviewMessageListener(this._panel.webview);
  }

  /**
   * Renders the current webview panel if it exists otherwise a new webview panel
   * will be created and displayed.
   *
   * @param extensionUri The URI of the directory containing the extension.
   */
  public static render(extensionUri: Uri) {
    if (GenVisPanel.currentPanel) {
      // If the webview panel already exists reveal it
      GenVisPanel.currentPanel._panel.reveal(ViewColumn.One);
    } else {
      // If a webview panel does not already exist create and show a new one
      const panel = window.createWebviewPanel(
        // Panel view type
        "genVis",
        // Panel title
        "Generator Visualizer",
        // The editor column the panel should be displayed in
        ViewColumn.Two,
        // Extra panel configurations
        {
          // Enable JavaScript in the webview
          enableScripts: true,
        }
      );

      GenVisPanel.currentPanel = new GenVisPanel(panel, extensionUri);
      GenVisPanel.currentPanel.loadDataFromFile();
    }
  }

  /**
   * Cleans up and disposes of webview resources when the webview panel is closed.
   */
  public dispose() {
    GenVisPanel.currentPanel = undefined;

    // Dispose of the current webview panel
    this._panel.dispose();

    // Dispose of all disposables (i.e. commands) for the current webview panel
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  public static refreshData() {
    if (!GenVisPanel.currentPanel) {
      vscode.window.showErrorMessage("No active visualization to update.");
      return;
    }

    GenVisPanel.currentPanel.refreshDataInFile();
  }

  public static pickNewData() {
    if (!GenVisPanel.currentPanel) {
      vscode.window.showErrorMessage("No active visualization to update.");
      return;
    }
    GenVisPanel.currentPanel.loadDataFromFile();
  }

  public refreshDataInFile() {
    if (!this._lastUri) {
      vscode.window.showErrorMessage("No data source to refresh.");
      return;
    }
    const uri = this._lastUri;

    const dataset: SampleInfo[] =
      JSON.parse(fs.readFileSync(uri.fsPath, 'utf8'));

    this._panel.webview.postMessage({
      command: 'load-data',
      genName: posixPath.basename(uri.path).split('.')[0],
      dataset,
    });

    vscode.window.showInformationMessage("Data refreshed.");
  }

  public loadDataFromFile() {
    vscode.window.showOpenDialog({
      canSelectMany: false,
      openLabel: 'Load New Data',
      canSelectFiles: true,
      canSelectFolders: false
    }).then((fileUri) => {
      if (fileUri) {
        const dataset: SampleInfo[] =
          JSON.parse(fs.readFileSync(fileUri[0].fsPath, 'utf8'));

        if (GenVisPanel.currentPanel) {
          GenVisPanel.currentPanel._panel.webview.postMessage({
            command: 'load-data',
            genName: posixPath.basename(fileUri[0].path).split('.')[0],
            dataset,
          });
          GenVisPanel.currentPanel._lastUri = fileUri[0];
        }
      }
    });
  }

  /**
   * Defines and returns the HTML that should be rendered within the webview panel.
   *
   * @remarks This is also the place where references to the React webview build files
   * are created and inserted into the webview HTML.
   *
   * @param webview A reference to the extension webview
   * @param extensionUri The URI of the directory containing the extension
   * @returns A template string literal containing the HTML that should be
   * rendered within the webview panel
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

  /**
   * Sets up an event listener to listen for messages passed from the webview context and
   * executes code based on the message that is recieved.
   *
   * @param webview A reference to the extension webview
   * @param context A reference to the extension context
   */
  private _setWebviewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        const command = message.command;
        const text = message.text;

        switch (command) {
          case 'request-refresh-data':
            this.refreshDataInFile();
            return;
        }
      },
      undefined,
      this._disposables
    );
  }
}