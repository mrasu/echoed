<script lang="ts">
  import Paper, { Title, Content } from "@smui/paper";
  import { Text } from "@smui/list";
  import SucceededIcon from "@/components/status_icons/SucceededIcon.svelte";
  import FailedIcon from "@/components/status_icons/FailedIcon.svelte";
  import { TestNameForPropagation } from "@/consts/testNames";

  export let passed: boolean;
</script>

<Paper>
  <Title>{TestNameForPropagation}</Title>
  <Content>
    <table>
      <tr>
        <td>
          <Text>Status</Text>
        </td>
        <td>
          <div style="display: flex">
            {#if passed}
              <SucceededIcon />
              <Text>(passed)</Text>
            {:else}
              <FailedIcon />
              <Text>(failed)</Text>
            {/if}
          </div>
        </td>
      </tr>
      <tr>
        <td>
          <Text>Message</Text>
        </td>
        <td>
          <div>
            {#if passed}
              <Text style="white-space: normal">
                All traces' contexts are propagated.
              </Text>
            {:else}
              <Text style="margin-bottom: 10px; display: block">
                Trace context propagation lacks
              </Text>
              <Text style="white-space: normal">
                Some spans lack a ParentSpanId, yet they do not appear to be
                roots.<br />
                It means OpenTelemetry's trace is broken because of not passing context
                information from parent to child spans.
              </Text>
            {/if}
          </div>
        </td>
      </tr>
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
</style>
