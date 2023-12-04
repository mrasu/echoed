<script lang="ts">
  import TraceList from "./TraceList.svelte";
  import { TobikuraParam } from "../..//lib/TobikuraParam";

  export let params: { testId: string };

  const tobikuraParam = TobikuraParam.convert(window.__tobikura_param__);
  const testInfo = tobikuraParam.pickTest(params.testId);
</script>

{#if testInfo}
  <TraceList {testInfo} />
{:else}
  Invalid test-id
{/if}
