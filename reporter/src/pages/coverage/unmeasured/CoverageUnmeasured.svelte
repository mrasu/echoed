<script lang="ts">
  import { CoverageInfo, Trace, Traces } from "@/lib/EchoedParam";
  import { push } from "svelte-spa-router";
  import Paper, { Content, Title } from "@smui/paper";
  import Breadcrumb from "@/components/breadcrumb/Breadcrumb.svelte";
  import TraceTable from "@/components/trace_table/TraceTable.svelte";

  export let coverageInfo: CoverageInfo;
  export let traces: Traces;

  const moveToTrace = ({
    detail: { trace },
  }: CustomEvent<{ trace: Trace }>) => {
    push(
      `/coverage/${coverageInfo.urlEncodedFullServiceName}/unmeasured/trace/${trace.traceId}`,
    );
  };

  const onPageChanged = () => {
    window.scrollTo(0, 0);
  };
</script>

<Breadcrumb crumbs={["Coverage", coverageInfo.fullDisplayServiceName]} />

<Paper>
  <Title>Unknown Service({coverageInfo.fullDisplayServiceName})'s Traces</Title>
  <Content>
    <TraceTable
      service={coverageInfo.service}
      traceIds={coverageInfo.unmeasuredTraceIds}
      {traces}
      on:pageChanged={onPageChanged}
      on:rowClick={moveToTrace}
    />
  </Content>
</Paper>
