import { AnsiGray, AnsiRed, AnsiReset, AnsiYellow } from "@/util/ansi";

const tag = "[Echoed]";
const tagSpace = " ".repeat(tag.length);

export class Logger {
  static enabled = true;
  static showDebug = false;

  static setEnable(enabled: boolean): void {
    Logger.enabled = enabled;
  }

  static setShowDebug(showDebug: boolean): void {
    Logger.showDebug = showDebug;
  }

  static warn(message?: string, ...optionalParams: unknown[]): void {
    if (!this.enabled) return;

    console.warn(
      `${AnsiYellow}${tag} WARN${AnsiReset} ${message}`,
      ...optionalParams,
    );
  }
  static error(message?: string, ...optionalParams: unknown[]): void {
    if (!this.enabled) return;

    console.error(
      `${AnsiRed}${tag} ERROR${AnsiReset} ${message}`,
      ...optionalParams,
    );
  }

  static debug(message?: string, ...optionalParams: unknown[]): void {
    if (!this.enabled) return;

    if (Logger.showDebug) {
      console.log(message, ...optionalParams);
    }
  }

  static log(message?: string, ...optionalParams: unknown[]): void {
    if (!this.enabled) return;

    console.log(`${tag} ${message}`, ...optionalParams);
  }

  static ln(count: number = 1): void {
    if (!this.enabled) return;

    for (let i = 0; i < count; i++) {
      console.log("");
    }
  }

  static logGrayComment(message?: string, ...optionalParams: unknown[]): void {
    if (!this.enabled) return;

    console.log(
      `${tagSpace} ${AnsiGray}${message}${AnsiReset}`,
      ...optionalParams,
    );
  }

  static writeWithTag(message: string): void {
    if (!this.enabled) return;

    process.stdout.write(`${tag} ${message}`);
  }

  static write(message: string): void {
    if (!this.enabled) return;

    process.stdout.write(message);
  }
}
