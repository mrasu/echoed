<script lang="ts">
  import { Span, TestInfo, Traces } from "@/lib/EchoedParam";
  import List, { Item, Separator, Text } from "@smui/list";
  import { push } from "svelte-spa-router";
  import Paper, { Title, Content } from "@smui/paper";
  import SucceededIcon from "@/components/status_icons/SucceededIcon.svelte";
  import FailedIcon from "@/components/status_icons/FailedIcon.svelte";
  import BlockedIcon from "@/components/status_icons/BlockedIcon.svelte";

  export let testInfo: TestInfo;
  export let traces: Traces;

  const fetchMapByTraceId = testInfo.getFetchMapByTraceId();

  const toTraceName = (traceId: string): string => {
    const traceFetch = fetchMapByTraceId.get(traceId);
    if (traceFetch) {
      const req = traceFetch.request;
      return `${req.method} ${req.url}`;
    }

    const spans = traces.get(traceId)?.spans;
    if (!spans) {
      return "";
    }

    // TODO: Search for the `http.url`-ish key using breadth-first
    return spans[0].name;
  };

  const getTraceStatus = (
    traceId: string,
  ): "succeeded" | "failed" | "unknown" => {
    const spans = traces.get(traceId)?.spans || [];
    if (spans.length === 0) {
      return "unknown";
    }

    const succeeded =
      spans.filter((span: Span) => !span.succeeded).length === 0;

    return succeeded ? "succeeded" : "failed";
  };

  type Trace = {
    traceId: string;
    name: string;
    status: "succeeded" | "failed" | "unknown";
  };
  const orderedTraces: Trace[] = testInfo.orderedTraceIds.map((traceId) => {
    const spans = traces.get(traceId)?.spans || [];
    const succeeded =
      spans.filter((span: Span) => !span.succeeded).length === 0;

    return {
      traceId,
      name: toTraceName(traceId),
      status: getTraceStatus(traceId),
    };
  });

  const moveToTrace = (trace: Trace) => {
    push(`/test/${testInfo.testId}/trace/${trace.traceId}`);
  };
</script>

<Paper>
  <Title>Traces</Title>
  <Content>
    <List class="demo-list">
      {#each orderedTraces as trace}
        <Separator />
        <Item on:SMUI:action={() => moveToTrace(trace)}>
          {#if trace.status === "succeeded"}
            <SucceededIcon />
          {:else if trace.status === "failed"}
            <FailedIcon />
          {:else}
            <BlockedIcon />
            <Text style="margin-left: 5px">({trace.status})</Text>
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
