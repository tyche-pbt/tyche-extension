import * as vscode from "vscode";
import * as fs from "fs";
import { Disposable, Webview, WebviewPanel, window, Uri, ViewColumn, TextDocument } from "vscode";
import { getUri } from "../utilities/getUri";
import * as path from "path";
import { exec } from "child_process";

const posixPath = path.posix || path;

type SampleInfo = {
  item: string;
  dot?: string;
  json?: object;
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
  private _lastSource: vscode.Uri | { document: TextDocument, range: vscode.Range } | undefined = undefined;
  private _outChannel: vscode.OutputChannel;

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

    this._outChannel = vscode.window.createOutputChannel("Generator Visualizer");
  }

  public showInformation(x: string) {
    this._outChannel.appendLine(x);
  }

  public static render(extensionUri: Uri, loadData: boolean) {
    if (GenVisPanel.currentPanel) {
      GenVisPanel.currentPanel._panel.reveal(ViewColumn.One);
    } else {
      const panel = window.createWebviewPanel(
        "genVis",
        "Generator Visualizer",
        ViewColumn.Two,
        { enableScripts: true, }
      );

      GenVisPanel.currentPanel = new GenVisPanel(panel, extensionUri);

      if (loadData) {
        GenVisPanel.currentPanel.loadDataFromFile();
      }
    }
  }

  public dispose() {
    GenVisPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  static selectGeneratorInline(document: TextDocument, range: vscode.Range, extensionUri: Uri) {
    if (!GenVisPanel.currentPanel) {
      GenVisPanel.render(extensionUri, false);
    }

    GenVisPanel.currentPanel!.loadDataFromGeneratorHaskell(document, range);
  }

  static hypothesisRunProperty(document: TextDocument, propertyName: string, extensionUri: Uri) {
    if (!GenVisPanel.currentPanel) {
      GenVisPanel.render(extensionUri, false);
    }

    GenVisPanel.currentPanel!.loadDataFromGeneratorPython(document, propertyName);
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
    if (!this._lastSource) {
      vscode.window.showErrorMessage("No data source to refresh.");
      return;
    }

    if (this._lastSource instanceof vscode.Uri) {
      const uri = this._lastSource;

      const dataset: SampleInfo[] =
        JSON.parse(fs.readFileSync(uri.fsPath, "utf8"));

      this._panel.webview.postMessage({
        command: "load-data",
        genName: posixPath.basename(uri.path).split(".")[0],
        genSource: `File: ${uri.path}`,
        dataset,
      });
    } else {
      const { document, range } = this._lastSource;
      this.loadDataFromGeneratorHaskell(document, range);
    }

  }

  public loadDataFromFile() {
    this._panel.webview.postMessage({
      command: "clear-data",
    });

    vscode.window.showOpenDialog({
      canSelectMany: false,
      openLabel: "Load New Data",
      canSelectFiles: true,
      canSelectFolders: false
    }).then((fileUri) => {
      if (fileUri) {
        const dataset: SampleInfo[] =
          JSON.parse(fs.readFileSync(fileUri[0].fsPath, "utf8"));

        if (GenVisPanel.currentPanel) {
          GenVisPanel.currentPanel._panel.webview.postMessage({
            command: "load-data",
            genName: posixPath.basename(fileUri[0].path).split(".")[0],
            dataset,
          });
          GenVisPanel.currentPanel._lastSource = fileUri[0];
        }
      }
    });
  }

  public loadDataFromGeneratorHaskell(document: TextDocument, range: vscode.Range, callback?: () => void) {
    const wsFolders = vscode.workspace.workspaceFolders;
    const genName = document.getText(document.getWordRangeAtPosition(range.start));

    if (!wsFolders || wsFolders.length === 0) {
      vscode.window.showErrorMessage("No active workspace. Please open a workspace with a cabal project.");
      return;
    }

    this._panel.webview.postMessage({
      command: "clear-data",
    });

    this.showInformation(`Sampling data from ${genName}...`);
    const runCommand = `cd ${wsFolders[0].uri.path}; cabal v2-run gen-vis-runner -- ${genName}`;
    exec(runCommand, { maxBuffer: 1024 * 10000 }, (err, stdout, stderr) => {
      if (err) {
        vscode.window.showErrorMessage(err.message + stderr);
        return;
      }

      const jsonStr = stdout.split("-----")[1];
      if (!jsonStr) {
        vscode.window.showErrorMessage("Invalid data returned from generator.");
        return;
      }
      const dataset: SampleInfo[] = JSON.parse(jsonStr);

      this.showInformation(`Got ${dataset.length} samples from ${genName}.`);

      this._panel.webview.postMessage({
        command: "load-data",
        genName: genName,
        genSource: `Live: ${document.fileName}:${genName}`,
        dataset,
      });

      callback && callback();
    });

    this._lastSource = { document, range };
  }

  public loadDataFromGeneratorPython(document: TextDocument, propertyName: string, callback?: () => void) {
    const wsFolders = vscode.workspace.workspaceFolders;

    if (!wsFolders || wsFolders.length === 0) {
      vscode.window.showErrorMessage("No active workspace. Please open a workspace with a cabal project.");
      return;
    }

    this._panel.webview.postMessage({
      command: "clear-data",
    });

    let fileName = path.parse(document.fileName).name;
    this.showInformation(`Sampling data from ${propertyName}...`);
    const runCommand = `cd ${wsFolders[0].uri.path}; python -c "import ${fileName}; import tyche; tyche.visualize(${fileName}.${propertyName})"`;
    exec(runCommand, { maxBuffer: 1024 * 10000 }, (err, stdout, stderr) => {
      if (err) {
        vscode.window.showErrorMessage(err.message + stderr);
        return;
      }

      const jsonStr = stdout;
      if (!jsonStr) {
        vscode.window.showErrorMessage("Invalid data returned from generator.");
        return;
      }
      const dataset: SampleInfo[] = JSON.parse(jsonStr);

      this.showInformation(`Got ${dataset.length} samples from ${propertyName}.`);

      this._panel.webview.postMessage({
        command: "load-data",
        genName: propertyName,
        genSource: `Live: ${document.fileName}:${propertyName}`,
        dataset,
      });

      callback && callback();
    });

    this._lastSource = { document, range: propertyName as any }; // TODO fix
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

  private _setWebviewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        const command = message.command;

        switch (command) {
          case "request-refresh-data":
            this.refreshDataInFile();
            return;
        }
      },
      undefined,
      this._disposables
    );
  }
}
