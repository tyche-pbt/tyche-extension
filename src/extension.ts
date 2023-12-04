import { commands, ExtensionContext, languages, workspace, window, Uri, GlobPattern } from "vscode";
import { TychePanel } from "./panels/TychePanel";
import { HypothesisCodelensProvider } from "./lenses/HypothesisCodelensProvider";
import { WebSocketServer } from "ws";
import { parseDataLines } from "./datatypes";
import { DataManager } from "./DataManager";

const dataManager = new DataManager();

function launchWebsocketServer(context: ExtensionContext) {
  const server = new WebSocketServer({
    port: workspace.getConfiguration("tyche").get("websocketPort")
  });
  server.on("connection", (socket) => {
    socket.on("message", (message) => {
      const lines = parseDataLines(message.toString());

      if (typeof lines === "string") {
        window.showErrorMessage(lines);
        return;
      }

      dataManager.addLines(lines);
      TychePanel.getOrCreate(dataManager, context.extensionUri);
    });
  });
  context.subscriptions.push({ dispose() { server.close(); } });
}

export function visualizeGlob(glob: GlobPattern, context: ExtensionContext) {
  workspace.findFiles(glob).then((uris) => {
    dataManager.clear();
    for (const uri of uris) {
      if (!uri.path.endsWith(".jsonl")) {
        continue;
      }
      workspace.fs.readFile(uri)
        .then((buffer) => {
          const data = parseDataLines(buffer.toString());
          if (typeof data === "string") {
            throw new Error(data);
          }
          dataManager.addLines(data);
          TychePanel.getOrCreate(dataManager, context.extensionUri);
        });
    }
  });
}

export function activate(context: ExtensionContext) {
  context.subscriptions.push(commands.registerCommand("tyche.toggle-coverage", () => {
    TychePanel.toggleCoverage(dataManager);
  }));

  context.subscriptions.push(commands.registerCommand("tyche.load-from-path", () => {
    window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: true,
      canSelectMany: false,
      filters: {
        jsonLines: ["jsonl"],
      },
    }).then((uris: Uri[] | undefined) => {
      if (uris === undefined || uris.length === 0) {
        return;
      }
      if (uris[0].path.endsWith(".jsonl")) {
        visualizeGlob(workspace.asRelativePath(uris[0].path), context);
      } else {
        visualizeGlob(`**/${workspace.asRelativePath(uris[0].path)}/**/*.jsonl`, context);
      }
    }, (e) => window.showErrorMessage(e));
  }));

  (workspace.getConfiguration("tyche").get("observationGlobs") as string[] || []).forEach((glob: string) => {
    workspace.createFileSystemWatcher(glob).onDidChange(() => {
      visualizeGlob(glob, context);
    });
  });

  // Re-renders coverage highlights when the user switches documents.
  window.onDidChangeVisibleTextEditors(() => {
    TychePanel.decorateCoverage(dataManager);
  });

  // Set up the websocket server that listens for reports.
  launchWebsocketServer(context);

  // Code Lens for Hypothesis
  languages.registerCodeLensProvider({ language: "python" }, new HypothesisCodelensProvider());
  context.subscriptions.push(commands.registerCommand("tyche.execute-hypothesis-test",
    HypothesisCodelensProvider.executeHypothesisTest
  ));
}
