#!/usr/bin/env node

import { AnsiGreen, AnsiRed, AnsiReset } from "@/ansi";
import { Creator, TEMPLATE, TEMPLATES } from "@/creator";
import { Option, program } from "@commander-js/extra-typings";
import fs from "fs";
import path from "path";

const ECHOED_ROOT_DIR = path.resolve(__dirname);

program.name("echoed");

program
  .addOption(
    new Option("-t, --template <template-name>")
      .choices(TEMPLATES)
      .default<TEMPLATE>("jest"),
  )
  .description("create sample files for Echoed")
  .action(runCreateSample);

program.parse();

async function runCreateSample({
  template,
}: {
  template: TEMPLATE;
}): Promise<void> {
  const cwd = process.cwd();
  if (fs.existsSync(cwd)) {
    if (fs.readdirSync(cwd).length > 0) {
      console.log(
        `${AnsiRed}ERROR${AnsiReset} Current directory is not empty.`,
      );
      console.log(
        `${AnsiRed}ERROR${AnsiReset}   To initialize Echoed, please use empty directory.`,
      );
      process.exit(1);
    }
  }

  const creator = new Creator(ECHOED_ROOT_DIR, cwd);
  await creator.create(template);
  console.log(`Finish initializing Echoed.

The initialization also creates example tests to demonstrate Echoed's behavior.
Refer ${AnsiGreen}README.md${AnsiReset} to run the tests.
`);
}
