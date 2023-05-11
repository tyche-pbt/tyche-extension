import { commands, ExtensionContext, languages, workspace, window } from "vscode";
import { GenVisPanel } from "./panels/GenVisPanel";
import { PropertyCodelensProvider } from "./lenses/PropertyCodelensProvider";

export function activate(context: ExtensionContext) {
  languages.registerCodeLensProvider({ language: "python" }, new PropertyCodelensProvider(context.extensionUri));

  context.subscriptions.push(commands.registerCommand("gen-vis.view-visualization", () => {
    GenVisPanel.render(context.extensionUri, true);
  }));

  context.subscriptions.push(commands.registerCommand("gen-vis.refresh-data", () => {
    GenVisPanel.refreshData();
  }));

  context.subscriptions.push(commands.registerCommand("gen-vis.hypothesis-run-property", (document, range) => {
    GenVisPanel.runProperty(document, range, context.extensionUri);
  }));

  context.subscriptions.push(commands.registerCommand("gen-vis.toggle-coverage", () => {
    if (GenVisPanel.currentPanel) {
      GenVisPanel.currentPanel.toggleCoverage();
    }
  }));

  workspace.onDidSaveTextDocument((document) => {
    if (GenVisPanel.currentPanel && GenVisPanel.currentPanel.isViewing(document)) {
      GenVisPanel.currentPanel.refreshDataForActiveVisualization();
    }
  });

  window.onDidChangeVisibleTextEditors(() => {
    if (GenVisPanel.currentPanel) {
      GenVisPanel.currentPanel.decorateCoverage();
    }
  });
}
