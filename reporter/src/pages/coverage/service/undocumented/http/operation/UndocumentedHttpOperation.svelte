<script lang="ts">
  import {
    HttpOperationTraces,
    Service,
    Trace,
    Traces,
  } from "@/lib/EchoedParam";
  import { push } from "svelte-spa-router";
  import Paper, { Content, Title } from "@smui/paper";
  import Breadcrumb from "@/components/breadcrumb/Breadcrumb.svelte";
  import TraceTable from "@/components/trace_table/TraceTable.svelte";

  export let service: Service;
  export let httpOperationTraces: HttpOperationTraces;

  export let traces: Traces;

  const moveToTrace = ({
    detail: { trace },
  }: CustomEvent<{ trace: Trace }>) => {
    const method = encodeURIComponent(httpOperationTraces.method);
    const path = encodeURIComponent(httpOperationTraces.path);
    const traceId = trace.traceId;
    const pageUrl = `/coverage/${service.urlEncodedFullServiceName}/undocumented/http/operation/${method}/${path}/trace/${traceId}`;

    push(pageUrl);
  };

  const onPageChanged = () => {
    window.scrollTo(0, 0);
  };
</script>

<Breadcrumb
  crumbs={[
    "Coverage",
    {
      href: `/coverage/${service.urlEncodedFullServiceName}`,
      text: service.fullDisplayServiceName,
    },
    `"${httpOperationTraces.method.toUpperCase()} ${
      httpOperationTraces.path
    } (Undocumented)"`,
  ]}
/>

<Paper>
  <Title>Found Traces</Title>
  <Content>
    <TraceTable
      {service}
      traceIds={httpOperationTraces.traceIds}
      {traces}
      on:pageChanged={onPageChanged}
      on:rowClick={moveToTrace}
    />
  </Content>
</Paper>
