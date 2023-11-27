import { commands, ExtensionContext, languages, workspace, window } from "vscode";
import { TychePanel } from "./panels/TychePanel";
import { HypothesisCodelensProvider } from "./lenses/HypothesisCodelensProvider";
import { WebSocketServer } from "ws";
import { parseDataLines } from "./datatypes";

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

      TychePanel.renderNewLines(lines, context.extensionUri);
    });
  });
  context.subscriptions.push({ dispose() { server.close(); } });
}

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
  launchWebsocketServer(context);

  // Code Lens for Hypothesis
  languages.registerCodeLensProvider({ language: "python" }, new HypothesisCodelensProvider());
  context.subscriptions.push(commands.registerCommand("tyche.execute-hypothesis-test",
    HypothesisCodelensProvider.executeHypothesisTest
  ));
}
