import { AnsiGray, AnsiReset } from "@/ansi";

const tag = "[Tobikura]";
const tagSpace = " ".repeat(tag.length);

export class Logger {
  static showDebug = false;

  static setShowDebug(showDebug: boolean) {
    Logger.showDebug = showDebug;
  }

  static warn(message?: any, ...optionalParams: any[]) {
    console.warn(`${tag} ${message}`, ...optionalParams);
  }
  static error(message?: any, ...optionalParams: any[]) {
    console.error(`${tag} ${message}`, ...optionalParams);
  }

  static debug(message?: any, ...optionalParams: any[]) {
    if (Logger.showDebug) {
      console.log(message, ...optionalParams);
    }
  }

  static log(message?: any, ...optionalParams: any[]) {
    console.log(`${tag} ${message}`, ...optionalParams);
  }

  static logGrayComment(message?: any, ...optionalParams: any[]) {
    console.log(
      `${tagSpace} ${AnsiGray}${message}${AnsiReset}`,
      ...optionalParams,
    );
  }

  static writeWithTag(message: string) {
    process.stdout.write(`${tag} ${message}`);
  }

  static write(message: string) {
    process.stdout.write(message);
  }
}
