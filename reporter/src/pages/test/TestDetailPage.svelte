<script lang="ts">
  import TestDetail from "./TestDetail.svelte";
  import { echoedParam } from "../../consts/echoedParam";

  export let params: { testId: string };

  const testInfo = echoedParam.pickTest(params.testId);
</script>

{#if testInfo}
  <TestDetail {testInfo} traces={echoedParam.traces} />
{:else}
  Invalid test-id
{/if}
