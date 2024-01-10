<script lang="ts">
  import { TestInfo } from "@/lib/EchoedParam";
  import { Text } from "@smui/list";
  import { push } from "svelte-spa-router";
  import SucceededIcon from "@/components/status_icons/SucceededIcon.svelte";
  import FailedIcon from "@/components/status_icons/FailedIcon.svelte";
  import BlockedIcon from "@/components/status_icons/BlockedIcon.svelte";
  import ListItem from "@/components/list/ListItem.svelte";

  export let testInfos: TestInfo[];

  const moveToTest = (testInfo: TestInfo) => {
    push(`/test/${testInfo.testId}`);
  };
</script>

{#each testInfos as testInfo}
  <ListItem on:click={() => moveToTest(testInfo)}>
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
  </ListItem>
{/each}
