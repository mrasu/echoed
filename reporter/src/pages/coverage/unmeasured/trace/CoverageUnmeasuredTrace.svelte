<script lang="ts">
  import { CoverageInfo, type Trace } from "@/lib/EchoedParam";
  import Paper, { Title, Content as PaperContent } from "@smui/paper";
  import Breadcrumb from "@/components/breadcrumb/Breadcrumb.svelte";
  import TraceWithLog from "@/components/trace/TraceWithLog.svelte";

  export let trace: Trace;
  export let coverageInfo: CoverageInfo;

  const firstSpan = trace.getRootSpanFor(coverageInfo.service);
</script>

<Breadcrumb
  crumbs={[
    "Coverage",
    {
      text: coverageInfo.fullDisplayServiceName,
      href: `/coverage/${coverageInfo.urlEncodedFullServiceName}/unmeasured`,
    },
    trace.traceId,
  ]}
/>

<Paper>
  <Title>TraceId: {trace.traceId}</Title>
  <PaperContent>
    <TraceWithLog {trace} firstSpanId={firstSpan?.spanId} />
  </PaperContent>
</Paper>
