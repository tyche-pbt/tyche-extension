import { commands, ExtensionContext, languages } from "vscode";
import { CodelensProvider } from "./lenses/CodelensProvider";
import { GenVisPanel } from "./panels/GenVisPanel";

export function activate(context: ExtensionContext) {
  languages.registerCodeLensProvider({ language: "haskell" }, new CodelensProvider());

  context.subscriptions.push(commands.registerCommand("gen-vis.view-visualization", () => {
    GenVisPanel.render(context.extensionUri);
  }));

  context.subscriptions.push(commands.registerCommand('gen-vis.pick-new-data', () => {
    GenVisPanel.pickNewData();
  }));

  context.subscriptions.push(commands.registerCommand('gen-vis.refresh-data', () => {
    GenVisPanel.refreshData();
  }));

  context.subscriptions.push(commands.registerCommand('gen-vis.select-generator-inline', (document, range) => {
    GenVisPanel.selectGeneratorInline(document, range);
  }));

}
