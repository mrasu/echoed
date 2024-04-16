const fs = require("fs");
const path = require("path");

/**
 * This script compares the differences between the original and override files in opentelemetry-demo
 *
 * As 'opentelemetry-demo' directory is a submodule of the opentelemetry-demo, they will be changed when the repo is updated.
 * Therefore, this script verifies differences between the original and override to ensure that the changes don't break expectation.
 */

const BASE_PATH = "template/base/example/opentelemetry-demo";
const BASE_OVERRIDE_PATH = "template/base/example/opentelemetry-demo-override";
const expectedDiffs = [
  {
    file: "src/checkoutservice/main.go",
    expected: {
      removed: [
        '\t"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"',
        '\tresp, err := otelhttp.Post(ctx, cs.emailSvcAddr+"/send_order_confirmation", "application/json", bytes.NewBuffer(emailServicePayload))',
      ],
      added: [
        "\t// Not using `otelhttp` intentionally to create not propagated spans and demonstrate not instrumented error in test",
        '\t// resp, err := otelhttp.Post(ctx, cs.emailSvcAddr+"/send_order_confirmation", "application/json", bytes.NewBuffer(emailServicePayload))',
        '\tresp, err := http.Post(cs.emailSvcAddr+"/send_order_confirmation", "application/json", bytes.NewBuffer(emailServicePayload))',
      ],
    },
  },
  {
    file: "src/frontend/utils/Cypress.ts",
    expected: {
      removed: [
        "export const getElementByField = (field: CypressFields, context: Cypress.Chainable = cy) =>",
        '  context.get(`[data-cy="${field}"]`);',
      ],
      added: [],
    },
  },
  {
    file: "src/otelcollector/otelcol-config.yml",
    expected: {
      removed: [],
      added: ["        headers:", "          User-Agent: OtelColHttpCheck/0.1"],
    },
  },
  {
    file: "src/otelcollector/otelcol-config-extras.yml",
    expected: {
      removed: [],
      added: `exporters:
  otlphttp/local:
    endpoint: http://host.docker.internal:3000
    retry_on_failure:
      enabled: false
  file/noop:
    path: /dev/null
service:
  pipelines:
    traces:
      exporters: [otlphttp/local, debug, spanmetrics]
    metrics:
      exporters: [file/noop]
    logs:
      exporters: [otlphttp/local, debug]`.split("\n"),
    },
  },
  {
    file: ".env",
    expected: {
      removed: [],
      added: [
        "# temporary environment variable for OTEL_RESOURCE_ATTRIBUTES because docker cli overrides OTEL_RESOURCE_ATTRIBUTES",
        "# c.f. https://github.com/docker/cli/issues/4958",
        'OTEL_RESOURCE_ATTRIBUTES_TMP="service.namespace=opentelemetry-demo"',
      ],
    },
  },
  {
    file: ".gitignore",
    expected: {
      removed: [],
      added: ["!.env"],
    },
  },
];

const noCheckFiles = new Set([
  "docker-compose.yml",
  "src/currencyservice/Dockerfile",
  "src/currencyservice/src/meter_common.h",
  "src/frontend/schema.yaml",
]);

function getDiff(origLines, overrideLines) {
  const origLinesSet = new Set(origLines);
  const overrideLinesSet = new Set(overrideLines);

  const removedDiff = origLines
    .map((line, linenum) => [line, linenum])
    .filter(([line]) => !overrideLinesSet.has(line));
  const addedDiff = overrideLines
    .map((line, linenum) => [line, linenum])
    .filter(([line]) => !origLinesSet.has(line));

  return {
    removed: removedDiff,
    added: addedDiff,
  };
}

function isDiffSameWithExpected(diff, expected) {
  if (diff.added.length !== expected.added.length) {
    return false;
  }
  if (diff.removed.length !== expected.removed.length) {
    return false;
  }

  for (let i = 0; i < diff.added.length; i++) {
    if (diff.added[i][0] !== expected.added[i]) {
      return false;
    }
  }
  for (let i = 0; i < diff.removed.length; i++) {
    if (diff.removed[i][0] !== expected.removed[i]) {
      return false;
    }
  }

  return true;
}

function displayDiff(diff, expected) {
  console.log("Actual:");
  console.log("  Removed:");
  diff.removed.forEach(([line, linenum]) => {
    console.log(`    ${linenum}: ${JSON.stringify(line)}`);
  });
  console.log("");
  console.log("  Added:");
  diff.added.forEach(([line, linenum]) => {
    console.log(`    ${linenum}: ${JSON.stringify(line)}`);
  });
  console.log("Expected:");
  console.log("  Removed:");
  expected.removed.forEach((line) => {
    console.log(`    : ${JSON.stringify(line)}`);
  });
  console.log("");
  console.log("  Added:");
  expected.added.forEach((line) => {
    console.log(`    : ${JSON.stringify(line)}`);
  });
}

function getFilesInDirectory(dirPath) {
  let results = [];
  const list = fs.readdirSync(dirPath);

  list.forEach(function (file) {
    file = path.join(dirPath, file);
    const stat = fs.statSync(file);

    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesInDirectory(file));
    } else {
      results.push(file);
    }
  });

  return results;
}

function check(target) {
  const origPath = BASE_PATH + "/" + target.file;
  const overridePath = BASE_OVERRIDE_PATH + "/" + target.file;
  const orig = fs.readFileSync(origPath, "utf-8");
  const override = fs.readFileSync(overridePath, "utf-8");
  const origLines = orig.split("\n");
  const overrideLines = override.split("\n");

  const diff = getDiff(origLines, overrideLines);

  if (isDiffSameWithExpected(diff, target.expected)) {
    return true;
  }

  console.log(`Diff is not same with expected. ${origPath} vs ${overridePath}`);
  displayDiff(diff, target.expected);
  console.log("");

  return false;
}

function checkAll() {
  let ok = true;
  const overrideFiles = getFilesInDirectory(BASE_OVERRIDE_PATH);
  for (const file of overrideFiles) {
    const relativePath = file.replace(BASE_OVERRIDE_PATH + "/", "");
    if (noCheckFiles.has(relativePath)) continue;

    const target = expectedDiffs.find((target) => target.file === relativePath);
    if (target) {
      ok = ok && check(target);
    } else {
      console.log(`No expected diff for ${relativePath}`);
      ok = false;
    }
  }

  if (!ok) {
    process.exit(1);
  }
}

checkAll();
