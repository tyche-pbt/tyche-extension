import { commands, ExtensionContext, workspace, window, Uri, GlobPattern } from "vscode";
import { TychePanel } from "./panels/TychePanel";

export function visualizeUris(uris: Uri[], context: ExtensionContext, preserveFocus: boolean = false) {
  if (uris.length === 0) {
    return;
  }
  Promise.all(uris.map((uri) => workspace.fs.readFile(uri))).then((buffers) => {
    const linesString = buffers.map((buffer) => buffer.toString()).join("\n");
    TychePanel.getOrCreate(linesString, context.extensionUri, preserveFocus);
  }).catch((e) => {
    window.showErrorMessage(e);
    console.error(e);
  });
}

export function activate(context: ExtensionContext) {
  context.subscriptions.push(commands.registerCommand("tyche.reset", () => {
    TychePanel.reset();
  }));

  context.subscriptions.push(commands.registerCommand("tyche.open", () => {
    TychePanel.getOrCreate(undefined, context.extensionUri, false);
  }));

  context.subscriptions.push(commands.registerCommand("tyche.refresh", () => {
    (workspace.getConfiguration("tyche").get("observationGlobs") as string[] || []).forEach((glob: string) => {
      workspace.findFiles(glob).then((uris) => {
        visualizeUris(uris, context, true);
      });
    });
  }));

  (workspace.getConfiguration("tyche").get("observationGlobs") as string[] || []).forEach((glob: string) => {
    let uris: Uri[] = [];
    let lastChange: number;

    workspace.createFileSystemWatcher(glob).onDidChange((e) => {
      const changeStamp = Date.now();
      lastChange = changeStamp;
      if (!uris.some((uri) => uri.path === e.path)) {
        uris.push(e);
      }
      setTimeout(() => {
        if (lastChange === changeStamp) {
          visualizeUris(uris, context, true);
          uris = [];
        }
      }, 600);
    });
  });
}
