import { TsString } from "@/scenario/compile/common/tsString";

// TsString for https://playwright.dev/docs/api/class-locatorassertions
export class LocatorAssertionString extends TsString {
  constructor(
    private readonly method: string,
    private readonly selector: string,
    private readonly args: TsString[],
    private readonly usesNot: boolean,
  ) {
    super();
  }

  toTsLine(): string {
    const args = this.args.map((arg) => arg.toTsLine()).join(", ");
    const notText = this.usesNot ? "not." : "";
    return `await expect(page.locator("${this.selector}")).${notText}${this.method}(${args});`;
  }
}
