# Scenario(YAML)

You can write tests in YAML, and Echoed will convert them into tests.  

* [Supported frameworks](#supported-frameworks)
* [Variable](#variable)
* [Configuration](#configuration)
* [Plugin](#plugin)
  * [Built-in Plugins](#built-in-plugins)
  * [Custom Plugin](#custom-plugin)

## Supported frameworks
Framework specific features are documented in the following documents:

- [Jest](./yamlJestScenario.md)
- [Playwright](./yamlPlaywrightScenario.md)

## Variable

In YAML, there are several predefined variables that you can use:

* `_`: Represents the result of `act` in the current step. (in `arrange`, `_` is to reference the result of the current `arrange`.)
* `_steps`: Represents the result of `act` in steps.  
  You can access it by index, for example, `_steps[-1]` or `_steps[2]`. A negative index indicates the relative position from the current step, while a positive index signifies the absolute position starting with zero.
* `_env`: Represents the environment variables defined in the configuration.
* `_arranges`: Represents the result of `arrange` in the current step in `arrange` section.  
  You can access it by index as same as `_steps`.

## Configuration

You can configure the behavior of the scenario by adding configuration like below at `.echoed.yml` file:

```yaml
scenario:
  compile:
    env:
      BASE_ENDPOINT: http://localhost:8080 # <- You can enable the lookup of environment variables with/without default values.
    plugin:
      runners:
        - name: fetch
          module: echoed/scenario/gen/jest/runner
          option:
            baseEndpoint: ${_env.BASE_ENDPOINT}/api # <- You can reference environment variables with `_env`.
            headers:
              content-type: application/json
      commons:  # <- You can import any module.
        - names:
            - createSession
          module: "@/example/util/session"
```
This configuration example does following:

* Sets the default value for the environment variable `BASE_ENDPOINT`.
* Sets the default options for the `fetch` runner.
* Imports `createSession` function from `@/example/util/session`.

For more detailed information, refer to [configSchema.ts](../src/schema/configSchema.ts).

## Plugin

To extend scenarios with additional functionalities, you can add functions at `plugin` section in the `.echoed.yml` file.  
There are three types of plugins: `Runner`, `Asserter` and `Common`.

* `Runner`  
    A function that is called inside `act` and `arrange`, typically performing actions like an HTTP request.  
    Its result is stored in the `_` variable. 
* `Asserter`  
  A function that is called inside `assert`, taking two arguments, typically for the expected and actual values. 

* `Common`  
  A function or variable that is usable anywhere except sections for `Runner` and `Asserter`.  
  Typically, it is called inside `${}`.

### Built-in Plugins

Some plugins are available by default.

Refer to documents for corresponding framework for a full list of plugins.
- Jest
  - [jest/runner/index.ts](../src/scenario/gen/jest/runner/index.ts)
  - [jest/asserter/index.ts](../src/scenario/gen/jest/asserter/index.ts)
- Playwright
  - [playwright/runner/index.ts](../src/scenario/gen/playwright/runner/index.ts)

If the name of built-in plugin collides with other plugin, the non-built-in plugin will take precedence.

### Custom Plugin

You can easily create custom plugins by creating function implementing corresponding interface and configure them in the `plugin` section.

* `Runner`  
  To create a custom runner, implement a function following the `Runner` interface in `echoed/scenario/gen/jest/runner`.  
  Here's an example:
  ```ts
  const myRunner = async (
    ctx: EchoedContext,
    argument: Argument,
    option: Option,
  ): Promise<Response> => {
    return await myFunction(argument);
  }
  ```
* `Asserter`  
  To create a custom asserter, implement a function following the `Asserter` interface in `echoed/scenario/gen/jest/asserter`.  
  Here's an example:
  ```ts
  const myAsserter = (
    ctx: unknown,
    expected: number,
    actual: number,
    option: Option,
  ): void => {
    expect(actual).toBe(expected);
  }
  ```

To use custom plugins, add them at the `plugin` section in `.echoed.yml` file.  
For instance, if you've created above plugins in `@/plugin`, configure them as follows:
```yaml
scenario:
  compile:
    plugin:
      runner:
        - name: myRunner
          module: "@/plugin"
      asserter:
        - name: myAsserter
          module: "@/plugin"
```
