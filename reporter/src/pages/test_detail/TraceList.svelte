<script lang="ts">
  import { Span, TestInfo } from "../../lib/TobikuraParam";
  import List, { Item, Separator, Text } from "@smui/list";
  import { push } from "svelte-spa-router";

  export let testInfo: TestInfo;

  const traceRecords: Record<string, Span[]> = {};
  testInfo?.spans.forEach((span) => {
    const traceId = span.traceId;
    if (!traceRecords[traceId]) {
      traceRecords[traceId] = [];
    }
    traceRecords[traceId].push(span);
  });

  const toTraceName = (spans: Span[]): string => {
    // TODO: Search for the `http.url`-ish key using breadth-first
    return spans[0].name;
  };

  type Trace = { traceId: string; name: string; spans: Span[]; status: string };
  const traces: Trace[] = testInfo.orderedTraceIds.map((traceId) => {
    return {
      traceId,
      name: toTraceName(traceRecords[traceId]),
      spans: traceRecords[traceId],
      status: "success",
    };
  });

  const moveToTrace = (trace: Trace) => {
    push(`/test/${testInfo.testId}/trace/${trace.traceId}`);
  };
</script>

<div>
  <span>&quot{testInfo.name}&quot</span>
  <span>at {testInfo.file}</span>
</div>
<div>
  Traces
  <List class="demo-list">
    {#each traces as trace}
      <Separator />
      <Item on:SMUI:action={() => moveToTrace(trace)}>
        <Text>{trace.name} - {trace.traceId} - {trace.status}</Text>
      </Item>
    {/each}
    <Separator />
  </List>
</div>

<style>
</style>
