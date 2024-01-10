<script lang="ts">
  import { EchoedParam } from "../../../lib/EchoedParam";
  import TraceView from "./TraceView.svelte";

  export let params: { testId: string; traceId: string };

  const echoedParam = EchoedParam.convert(window.__echoed_param__);
  const testInfo = echoedParam.pickTest(params.testId);
  const traceFetch = testInfo?.fetches.find(
    (fetch) => fetch.traceId === params.traceId,
  );
  const trace = echoedParam.traces.get(params.traceId);
</script>

{#if testInfo}
  <TraceView traceId={params.traceId} {traceFetch} {trace} {testInfo} />
{:else}
  Invalid trace-id
{/if}
