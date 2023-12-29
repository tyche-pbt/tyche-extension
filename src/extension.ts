import { commands, ExtensionContext, languages, workspace, window, Uri, GlobPattern } from "vscode";
import { TychePanel } from "./panels/TychePanel";
import { findLatestLines, parseDataLines } from "observability-tools";

export function visualizeGlob(glob: GlobPattern, context: ExtensionContext) {
  workspace.findFiles(glob).then((uris) => {
    if (uris.length === 0) {
      return;
    }
    Promise.all(uris.map((uri) => workspace.fs.readFile(uri))).then((buffers) => {
      const lines = buffers.map((buffer) => {
        const data = parseDataLines(buffer.toString());
        if (typeof data === "string") {
          throw new Error(data);
        }
        return data;
      }).reduce((acc, val) => acc.concat(val), []);
      TychePanel.getOrCreate(findLatestLines(lines), context.extensionUri);
      // coverageDecorator.decorateCoverage(dataManager);
    }).catch((e) => {
      window.showErrorMessage(e);
      console.error(e);
    });
  });
}

export function activate(context: ExtensionContext) {
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
    }, (e) => {
      window.showErrorMessage(e);
      console.error(e);
    });
  }));

  context.subscriptions.push(commands.registerCommand("tyche.load-from-observation-directory", () => {
    (workspace.getConfiguration("tyche").get("observationGlobs") as string[] || []).forEach((glob: string) => {
      visualizeGlob(glob, context);
    });
  }));

  context.subscriptions.push(commands.registerCommand("tyche.reset", () => {
    TychePanel.reset();
  }));

  let lastStamp: { [key: string]: number } = {};

  (workspace.getConfiguration("tyche").get("observationGlobs") as string[] || []).forEach((glob: string) => {
    workspace.createFileSystemWatcher(glob).onDidChange(() => {
      const changeStamp = Date.now();
      lastStamp[glob] = changeStamp;
      setTimeout(() => {
        if (lastStamp[glob] === changeStamp) {
          visualizeGlob(glob, context);
        }
      }, 600);
    });
  });
}
