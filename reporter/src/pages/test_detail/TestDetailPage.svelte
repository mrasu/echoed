<script lang="ts">
  import TestDetail from "./TestDetail.svelte";
  import { EchoedParam } from "../../lib/EchoedParam";

  export let params: { testId: string };

  const echoedParam = EchoedParam.convert(window.__echoed_param__);
  const testInfo = echoedParam.pickTest(params.testId);
</script>

{#if testInfo}
  <TestDetail {testInfo} />
{:else}
  Invalid test-id
{/if}
