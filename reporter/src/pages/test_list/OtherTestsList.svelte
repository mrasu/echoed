<script lang="ts">
  import List, { Text } from "@smui/list";
  import { push } from "svelte-spa-router";
  import FailedIcon from "@/components/status_icons/FailedIcon.svelte";
  import SucceededIcon from "@/components/status_icons/SucceededIcon.svelte";
  import ListItem from "@/components/list/ListItem.svelte";
  import { TestNameForPropagation } from "@/consts/testNames";

  export let propagationTestEnabled: boolean;
  export let propagationTestPassed: boolean;

  const moveToPropagationTest = () => {
    push(`/propagation_test`);
  };
</script>

<List>
  {#if propagationTestEnabled}
    <ListItem on:click={() => moveToPropagationTest()}>
      <div style="margin-right: 10px; display: flex">
        {#if propagationTestPassed}
          <SucceededIcon />
        {:else}
          <FailedIcon />
        {/if}
      </div>
      <Text>{TestNameForPropagation}</Text>
    </ListItem>
  {/if}
</List>
