import { commands, ExtensionContext, languages, workspace, window } from "vscode";
import { TychePanel } from "./panels/TychePanel";
import { PropertyCodelensProvider } from "./lenses/PropertyCodelensProvider";
import { WebSocketServer } from "ws";

export function activate(context: ExtensionContext) {
  languages.registerCodeLensProvider({ language: "python" }, new PropertyCodelensProvider(context.extensionUri));

  // Used by the `PropertyCodelensProvider`.
  context.subscriptions.push(commands.registerCommand("gen-vis.hypothesis-run-property", (document, range) => {
    TychePanel.runProperty(document, range, context.extensionUri);
  }));

  // Provided to the user.
  context.subscriptions.push(commands.registerCommand("gen-vis.toggle-coverage", () => {
    TychePanel.toggleCoverage();
  }));

  // Re-renders coverage highlights when the user switches documents.
  window.onDidChangeVisibleTextEditors(() => {
    TychePanel.decorateCoverage();
  });

  // Set up the websocket server that listens for reports.
  const config = workspace.getConfiguration("tyche");
  const server = new WebSocketServer({ port: config.get("websocketPort") });
  server.on("connection", (socket) => {
    socket.on("message", (message) => {
      TychePanel.loadJSONReport(message.toString(), context.extensionUri);
    });
  });
  context.subscriptions.push({ dispose() { server.close(); } });
}
