<script lang="ts">
  import type { Trace, Span } from "@/lib/EchoedParam";
  import Paper from "@smui/paper";
  import Accordion, { Panel, Header, Content } from "@smui-extra/accordion";
  import TraceTree from "./TraceTree.svelte";
  import SpanDetail from "./SpanDetail.svelte";
  import LogAccordion from "./LogAccordion.svelte";

  export let trace: Trace;
  export let firstSpanId: string | undefined = undefined;

  let focusingSpan: Span | undefined = firstSpanId
    ? trace.findSpan(firstSpanId)
    : undefined;

  const onTreeSpanClicked = (spanId: string) => {
    focusingSpan = trace.findSpan(spanId);
  };
</script>

<TraceTree spans={trace.spans} on:click={(e) => onTreeSpanClicked(e.detail)} />

<Accordion multiple>
  <Panel open={true}>
    <Header style="font-size: 1.3rem">Span</Header>
    <Content>
      {#if focusingSpan}
        <SpanDetail span={focusingSpan} />
      {:else if trace.spans.length > 0}
        <Paper variant="unelevated">
          <Content>Click span to see information</Content>
        </Paper>
      {:else}
        <Paper variant="unelevated">
          <Content>No span exists</Content>
        </Paper>
      {/if}
    </Content>
  </Panel>
  <Panel open={true}>
    <Header style="font-size: 1.3rem">Logs</Header>
    <Content>
      {#if trace.logRecords.length > 0}
        <LogAccordion logRecords={trace.logRecords} />
      {:else}
        <Paper variant="unelevated">No log exists</Paper>
      {/if}
    </Content>
  </Panel>
</Accordion>
