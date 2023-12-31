import { AnsiGray, AnsiReset } from "@/ansi";

const tag = "[Echoed]";
const tagSpace = " ".repeat(tag.length);

export class Logger {
  static enabled = true;
  static showDebug = false;

  static setEnable(enabled: boolean) {
    Logger.enabled = enabled;
  }

  static setShowDebug(showDebug: boolean) {
    Logger.showDebug = showDebug;
  }

  static warn(message?: any, ...optionalParams: any[]) {
    if (!this.enabled) return;

    console.warn(`${tag} ${message}`, ...optionalParams);
  }
  static error(message?: any, ...optionalParams: any[]) {
    if (!this.enabled) return;

    console.error(`${tag} ${message}`, ...optionalParams);
  }

  static debug(message?: any, ...optionalParams: any[]) {
    if (!this.enabled) return;

    if (Logger.showDebug) {
      console.log(message, ...optionalParams);
    }
  }

  static log(message?: any, ...optionalParams: any[]) {
    if (!this.enabled) return;

    console.log(`${tag} ${message}`, ...optionalParams);
  }

  static logGrayComment(message?: any, ...optionalParams: any[]) {
    if (!this.enabled) return;

    console.log(
      `${tagSpace} ${AnsiGray}${message}${AnsiReset}`,
      ...optionalParams,
    );
  }

  static writeWithTag(message: string) {
    if (!this.enabled) return;

    process.stdout.write(`${tag} ${message}`);
  }

  static write(message: string) {
    if (!this.enabled) return;

    process.stdout.write(message);
  }
}
