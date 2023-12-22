#!/usr/bin/env node

import fs from "fs";
import { Creator } from "@/create/create";
import { AnsiGreen, AnsiReset } from "@/ansi";

const cwd = process.cwd();
if (fs.existsSync(cwd)) {
  if (fs.readdirSync(cwd).length > 0) {
    console.error("Current directory is not empty");
    console.error("To initialize Tobikura, please use empty directory");
    process.exit(1);
  }
}

const creator = new Creator(cwd);
creator.run().then(() => {
  console.log(`Finish initializing Tobikura.

The initialization also creates example tests to demonstrate Tobikura's behavior.
Refer ${AnsiGreen}README.md${AnsiReset} to run the tests.
`);
});
