import { env, window } from "vscode";

type Message = {
  level: "info" | "warn" | "error" | "survey";
  prompt?: { question: string, answers: string[] };
  message: string;
};

type LogLine = Message & { timestamp: number };

export class TelemetryProvider {
  private _log: LogLine[] = [];
  private _telemetryEnabled: boolean;

  constructor() {
    this._telemetryEnabled = env.isTelemetryEnabled;
    env.onDidChangeTelemetryEnabled((enabled) => {
      this._telemetryEnabled = enabled;
    });
  }

  public log(message: Message) {
    const logLine = { ...message, timestamp: Date.now() };
    this._log.push(logLine);
    if (this._telemetryEnabled) {
      // TODO: Send to server
      console.log(logLine);
    }
  }

  public info(message: string) {
    this.log({ message, level: "info" });
  }

  public warn(message: string) {
    this.log({ message, level: "warn" });
  }

  public error(message: string) {
    this.log({ message, level: "error" });
  }

  public survey(question: string, answers: string[]) {
    window.showInformationMessage(question, ...answers).then((message) => {
      if (message) {
        this.log({ message, level: "survey", prompt: { question, answers } });
      } else {
        this.log({ message: "[DECLINED]", level: "survey", prompt: { question, answers } });
      }
    });
  }
}