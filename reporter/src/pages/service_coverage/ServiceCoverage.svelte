<script lang="ts">
  import { link } from "svelte-spa-router";
  import { Text } from "@smui/list";
  import { CoverageInfo, HttpMethods } from "../../lib/EchoedParam";
  import Paper, { Content, Title } from "@smui/paper";
  import FailedIcon from "../../components/status_icons/FailedIcon.svelte";
  import SucceededIcon from "../../components/status_icons/SucceededIcon.svelte";

  export let coverageInfo: CoverageInfo;

  const METHOD_ORDER_MAP = new Map(HttpMethods.map((method, i) => [method, i]));

  $: orderedPathCoverages = [...coverageInfo.http.operationCoverages].sort(
    (a, b) => {
      if (a.passed !== b.passed) {
        return a.passed ? 1 : -1;
      }
      if (a.path !== b.path) {
        return a.path < b.path ? -1 : 1;
      }
      return (
        (METHOD_ORDER_MAP.get(a.method) ?? 100) -
        (METHOD_ORDER_MAP.get(b.method) ?? 100)
      );
    },
  );
</script>

<div style="margin-bottom: 20px">
  <Text><a href="/coverage" use:link>Coverage</a></Text>
  <Text>/</Text>
  <Text>
    {coverageInfo.serviceName}
  </Text>
</div>

<Paper>
  <Title>Coverage at {coverageInfo.serviceName}</Title>
  <Content>
    <table>
      {#each orderedPathCoverages as pathCoverage}
        <tr>
          <td class="passed">
            <div>
              {#if pathCoverage.passed}
                <SucceededIcon />
              {:else}
                <FailedIcon />
              {/if}
            </div>
          </td>
          <td class="method">
            {pathCoverage.method.toUpperCase()}
          </td>
          <td>
            {pathCoverage.path}
          </td>
        </tr>
      {/each}
    </table>
  </Content>
</Paper>

<style>
  td div {
    display: flex;
  }

  td.method {
    padding-right: 10px;
    padding-left: 10px;
  }
</style>
