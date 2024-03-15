<script lang="ts">
  import { echoedParam } from "@/consts/echoedParam";
  import TraceView from "./TraceView.svelte";

  export let params: { testId: string; traceId: string };

  const testInfo = echoedParam.pickTest(params.testId);
  const traceFetch = testInfo?.fetches.find(
    (fetch) => fetch.traceId === params.traceId,
  );
  const trace = echoedParam.traces.getOrEmpty(params.traceId);
</script>

{#if testInfo}
  <TraceView traceId={params.traceId} {traceFetch} {trace} {testInfo} />
{:else}
  Invalid trace-id
{/if}
