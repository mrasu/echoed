<script lang="ts">
  import { TestInfo } from "../../lib/TobikuraParam";
  import { Item, Separator, Text, Group, Subheader } from "@smui/list";
  import { push } from "svelte-spa-router";
  import SucceededIcon from "../../components/status_icons/SucceededIcon.svelte";
  import FailedIcon from "../../components/status_icons/FailedIcon.svelte";
  import BlockedIcon from "../../components/status_icons/BlockedIcon.svelte";

  export let testInfos: TestInfo[];

  $: orderedTestInfos = testInfos.sort((a, b) =>
    a.startDate > b.startDate ? 1 : -1,
  );

  const moveToTest = (testInfo: TestInfo) => {
    push(`/test/${testInfo.testId}`);
  };
</script>

{#each orderedTestInfos as testInfo}
  <Separator />
  <Item on:SMUI:action={() => moveToTest(testInfo)}>
    <div style="margin-right: 10px; display: flex">
      {#if testInfo.status === "passed"}
        <SucceededIcon />
      {:else if testInfo.status === "failed"}
        <FailedIcon />
      {:else}
        <BlockedIcon />
        <Text style="margin-left: 5px">({testInfo.status})</Text>
      {/if}
    </div>
    <Text>{testInfo.name}</Text>
  </Item>
{/each}
