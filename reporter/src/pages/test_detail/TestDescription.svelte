<script lang="ts">
  import { TestInfo } from "../../lib/TobikuraParam";
  import Paper, { Title, Content } from "@smui/paper";
  import { Text } from "@smui/list";
  import SucceededIcon from "../../components/status_icons/SucceededIcon.svelte";
  import FailedIcon from "../../components/status_icons/FailedIcon.svelte";
  import BlockedIcon from "../../components/status_icons/BlockedIcon.svelte";

  export let testInfo: TestInfo;

  // https://stackoverflow.com/questions/25245716/remove-all-ansi-colors-styles-from-strings
  const ansiRegex =
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
  const removeANSI = (str: string) => {
    return str.replaceAll(ansiRegex, "");
  };

  const beautifyJSONString = (str: string) => {
    const ret = str
      .replaceAll("\\u001b", "\u001b")
      .replaceAll("\\u009b", "\u009b")
      .replaceAll("\\n", "\n");
    return removeANSI(ret);
  };
</script>

<Paper>
  <Title>
    {testInfo.name}
  </Title>
  <Content>
    <table>
      <tr>
        <td>
          <Text>Status</Text>
        </td>
        <td>
          <div style="display: flex">
            {#if testInfo.status === "passed"}
              <SucceededIcon />
            {:else if testInfo.status === "failed"}
              <FailedIcon />
            {:else}
              <BlockedIcon />
            {/if}
            <Text>({testInfo.status})</Text>
          </div>
        </td>
      </tr>
      <tr>
        <td>
          <Text>File</Text>
        </td>
        <td>
          <Text>{testInfo.file}</Text>
        </td>
      </tr>
      <tr>
        <td>
          <Text>Duration</Text>
        </td>
        <td>
          {#if testInfo.duration}
            <Text>{testInfo.duration}</Text>
            <Text>ms</Text>
          {:else}
            <Text>-</Text>
          {/if}
        </td>
      </tr>
      {#if testInfo.failureMessages && testInfo.failureMessages.length > 0}
        <tr>
          <td>
            <Text>Messages</Text>
          </td>
          <td>
            <div>
              {#each testInfo.failureMessages as message}
                <pre class="failure-message">{removeANSI(message)}</pre>
              {/each}
            </div>
          </td>
        </tr>
      {/if}

      {#if testInfo.failureDetails && testInfo.failureDetails.length > 0}
        <tr>
          <td>Failure Details</td>
          <td>
            {#each testInfo.failureDetails as message}
              <pre class="failure-message">{beautifyJSONString(
                  JSON.stringify(message),
                )}</pre>
            {/each}
          </td>
        </tr>
      {/if}
    </table>
  </Content>
</Paper>

<style>
  table td {
    vertical-align: top;
    margin-top: 10px;
  }
  table td:last-child {
    padding-left: 20px;
  }

  .failure-message {
    margin: 0 0 1rem 0;
  }

  pre {
    white-space: pre-wrap;
  }
</style>
