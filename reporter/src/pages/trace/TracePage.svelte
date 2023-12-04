<script lang="ts">
  import { TobikuraParam } from "../../lib/TobikuraParam";
  import TraceView from "./TraceView.svelte";

  export let params: { testId: string; traceId: string };

  const tobikuraParam = TobikuraParam.convert(window.__tobikura_param__);
  const testInfo = tobikuraParam.pickTest(params.testId);
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
    spans={traceSpans}
    {traceLogs}
    {testInfo}
  />
{:else}
  Invalid trace-id
{/if}
