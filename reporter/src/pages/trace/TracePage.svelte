<script lang="ts">
  import { TobikuraParam } from "../../lib/TobikuraParam";
  import TraceView from "./TraceView.svelte";

  export let params: { testId: string; traceId: string };

  const tobikuraParam = TobikuraParam.convert(window.__tobikura_param__);
  const testInfo = tobikuraParam.pickTest(params.testId);
  const traceFetch = testInfo?.fetches.find(
    (fetch) => fetch.traceId === params.traceId,
  );
  const traceSpans =
    testInfo?.spans.filter((span) => span.traceId === params.traceId) || [];
  const traceLogs =
    testInfo?.logRecords.filter(
      (logRecord) => logRecord.traceId === params.traceId,
    ) || [];
</script>

{#if testInfo}
  <TraceView
    traceId={params.traceId}
    {traceSpans}
    {traceFetch}
    {traceLogs}
    {testInfo}
  />
{:else}
  Invalid trace-id
{/if}
