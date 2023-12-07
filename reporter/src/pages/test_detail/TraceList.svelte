<script lang="ts">
  import { Span, TestInfo } from "../../lib/TobikuraParam";
  import List, { Item, Separator, Text } from "@smui/list";
  import { push } from "svelte-spa-router";
  import Paper, { Title, Content } from "@smui/paper";
  import { link } from "svelte-spa-router";
  import SucceededIcon from "../../components/status_icons/SucceededIcon.svelte";
  import FailedIcon from "../../components/status_icons/FailedIcon.svelte";

  export let testInfo: TestInfo;

  const spansMap: Map<string, Span[]> = new Map();
  testInfo?.spans.forEach((span) => {
    const traceId = span.traceId;

    const spans = spansMap.get(traceId) || [];
    spans.push(span);
    spansMap.set(traceId, spans);
  });

  const fetchMapByTraceId = testInfo.getFetchMapByTraceId();

  const toTraceName = (traceId: string): string => {
    const traceFetch = fetchMapByTraceId.get(traceId);
    if (traceFetch) {
      const req = traceFetch.request;
      return `${req.method} ${req.url}`;
    }

    const spans = spansMap.get(traceId);
    if (!spans) {
      return "";
    }

    // TODO: Search for the `http.url`-ish key using breadth-first
    return spans[0].name;
  };

  type Trace = { traceId: string; name: string; succeeded: boolean };
  const traces: Trace[] = testInfo.orderedTraceIds.map((traceId) => {
    const spans = spansMap.get(traceId) || [];
    const succeeded =
      spans.filter((span: Span) => !span.succeeded).length === 0;

    return {
      traceId,
      name: toTraceName(traceId),
      succeeded: succeeded,
    };
  });

  const moveToTrace = (trace: Trace) => {
    push(`/test/${testInfo.testId}/trace/${trace.traceId}`);
  };
</script>

<div style="margin-bottom: 20px">
  <Text><a href="/" use:link>Tests</a></Text>
  <Text>/</Text>
  <Text>
    <Text>&quot{testInfo.name}&quot</Text>
    <Text>at {testInfo.file}</Text>
  </Text>
</div>

<Paper>
  <Title>Traces</Title>
  <Content>
    <List class="demo-list">
      {#each traces as trace}
        <Separator />
        <Item on:SMUI:action={() => moveToTrace(trace)}>
          {#if trace.succeeded}
            <SucceededIcon />
          {:else}
            <FailedIcon />
          {/if}
          <Text style="margin-left: 10px">
            {trace.name}
            <Text style="margin-left: 10px; font-size: 0.85rem">
              {trace.traceId}
            </Text>
          </Text>
        </Item>
      {/each}
      <Separator />
    </List>
  </Content>
</Paper>

<style>
</style>
