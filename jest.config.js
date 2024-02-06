const { defaults: tsjPreset } = require("ts-jest/presets");

function mergeTransform(original, custom) {
  const ret = JSON.parse(JSON.stringify(original));
  for (const [pattern, transformer] of Object.entries(custom)) {
    if (ret[pattern]) {
      ret[pattern][1] = {
        ...ret[pattern][1],
        ...transformer[1],
      };
    } else {
      ret[pattern] = transformer;
    }
  }

  return ret;
}

const customTsjTransform = {
  "^.+\\.tsx?$": [
    "ts-jest",
    {
      /**
       Skip type-checking to speed up test execution

       c.f.
       https://github.com/kulshekhar/ts-jest/issues/259#issuecomment-486097199
       > It's worth to mention that I managed to fix my issue by adding the isolatedModules: true flag to my ts-jest config. Tests no longer take 10 mins but still there's considerable slowdown compared to 23.1.4 from 56s to 120-200s for suite of > 1800 tests.
       https://github.com/kulshekhar/ts-jest/issues/259#issuecomment-486135585
       > When I've set isolatedModules: true the time has dropped from 99s to 5s (for the object.helper.spec.ts from previous example)

       For detail about isolatedModules: https://kulshekhar.github.io/ts-jest/docs/getting-started/options/isolatedModules
      */
      isolatedModules: true,
    },
  ],
};

module.exports = {
  preset: "ts-jest",
  verbose: true,
  rootDir: "src",
  testPathIgnorePatterns: ["<rootDir>/create/template"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    ...mergeTransform(tsjPreset.transform, customTsjTransform),
  },
};
