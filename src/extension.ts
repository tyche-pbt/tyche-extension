import { commands, ExtensionContext, languages, workspace, window } from "vscode";
import { TychePanel } from "./panels/TychePanel";
import { HypothesisCodelensProvider } from "./lenses/HypothesisCodelensProvider";
import { WebSocketServer } from "ws";

export function activate(context: ExtensionContext) {
  // Provided to the user.
  context.subscriptions.push(commands.registerCommand("tyche.toggle-coverage", () => {
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
      TychePanel.renderJSONReport(message.toString(), context.extensionUri);
    });
  });
  context.subscriptions.push({ dispose() { server.close(); } });

  // Code Lens for Hypothesis
  languages.registerCodeLensProvider({ language: "python" }, new HypothesisCodelensProvider());
  context.subscriptions.push(commands.registerCommand("tyche.execute-hypothesis-test",
    HypothesisCodelensProvider.executeHypothesisTest
  ));
}
