<script lang="ts">
  import { Span, type Trace } from "../../lib/EchoedParam";
  import Paper, { Content as PaperContent, Title } from "@smui/paper";
  import Accordion, { Panel, Header, Content } from "@smui-extra/accordion";
  import { Text } from "@smui/list";
  import TraceTree from "../../components/trace/TraceTree.svelte";
  import { TestNameForPropagation } from "../../consts/testNames";
  import SpanDetail from "../../components/trace/SpanDetail.svelte";
  import LogAccordion from "../../components/trace/LogAccordion.svelte";
  import Breadcrumb from "../../components/breadcrumb/Breadcrumb.svelte";

  export let trace: Trace;

  const onTreeSpanClicked = (spanId: string) => {
    focusingSpan = trace.spans.find((span) => span.spanId === spanId);
  };

  const rootSpan = trace.rootSpan;
  let focusingSpan: Span | undefined = rootSpan;
</script>

<Breadcrumb
  crumbs={[
    "Test",
    {
      href: `/propagation_test`,
      text: `"${TestNameForPropagation}"`,
    },
    trace.traceId,
  ]}
/>

<Paper>
  <Title>Trace context propagation lacks</Title>
  <PaperContent>
    <div class="description">
      <div class="trace-id">
        <Text>TraceId: {trace.traceId}</Text><br />
      </div>
      <div>
        <Text>
          The Span(id={rootSpan?.spanId || "unknown"}) serves as the root of the
          trace; however, there is a possibility that this span is continuing
          from another trace.<br />
          If the span is root, configure Echoed's setting to ignore it.
        </Text>
      </div>
    </div>

    <TraceTree
      spans={trace.spans}
      on:click={(e) => onTreeSpanClicked(e.detail)}
    />

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
              <Content>No spans found</Content>
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
            <Paper variant="unelevated">No logs found</Paper>
          {/if}
        </Content>
      </Panel>
    </Accordion>
  </PaperContent>
</Paper>

<style>
  .description {
    margin-bottom: 20px;
  }

  .trace-id {
    margin-bottom: 20px;
  }
</style>
