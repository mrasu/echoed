<script lang="ts">
  import { RpcMethodTraces, Service, Trace, Traces } from "@/lib/EchoedParam";
  import { push } from "svelte-spa-router";
  import Paper, { Content, Title } from "@smui/paper";
  import Breadcrumb from "@/components/breadcrumb/Breadcrumb.svelte";
  import TraceTable from "@/components/trace_table/TraceTable.svelte";

  export let service: Service;
  export let rpcMethodTraces: RpcMethodTraces;

  export let traces: Traces;

  const moveToTrace = ({
    detail: { trace },
  }: CustomEvent<{ trace: Trace }>) => {
    const rpcService = encodeURIComponent(rpcMethodTraces.service);
    const rpcMethod = encodeURIComponent(rpcMethodTraces.method);
    const traceId = trace.traceId;
    const pageUrl = `/coverage/${service.urlEncodedFullServiceName}/undocumented/rpc/method/${rpcService}/${rpcMethod}/trace/${traceId}`;

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
    `"${rpcMethodTraces.service} ${rpcMethodTraces.method} (Undocumented)"`,
  ]}
/>

<Paper>
  <Title>Found Traces</Title>
  <Content>
    <TraceTable
      {service}
      traceIds={rpcMethodTraces.traceIds}
      {traces}
      on:pageChanged={onPageChanged}
      on:rowClick={moveToTrace}
    />
  </Content>
</Paper>
