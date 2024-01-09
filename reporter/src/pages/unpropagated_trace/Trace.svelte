<script lang="ts">
  import { type Trace } from "../../lib/EchoedParam";
  import Paper, { Content as PaperContent, Title } from "@smui/paper";
  import { Text } from "@smui/list";
  import { TestNameForPropagation } from "../../consts/testNames";
  import Breadcrumb from "../../components/breadcrumb/Breadcrumb.svelte";
  import TraceWithLog from "../../components/trace/TraceWithLog.svelte";

  export let trace: Trace;

  const rootSpan = trace.rootSpan;
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

    <TraceWithLog {trace} />
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
