import { commands, ExtensionContext } from "vscode";
import { GenVisPanel } from "./panels/GenVisPanel";

export function activate(context: ExtensionContext) {
  context.subscriptions.push(commands.registerCommand("gen-vis.view-visualization", () => {
    GenVisPanel.render(context.extensionUri);
  }));

  context.subscriptions.push(commands.registerCommand('gen-vis.pick-new-data', () => {
    GenVisPanel.pickNewData();
  }));

  context.subscriptions.push(commands.registerCommand('gen-vis.refresh-data', () => {
    GenVisPanel.refreshData();
  }));
}
