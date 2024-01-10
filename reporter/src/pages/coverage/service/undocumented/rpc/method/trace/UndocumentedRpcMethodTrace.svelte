<script lang="ts">
  import { Service, type Trace } from "../../../../../../../lib/EchoedParam";
  import Paper, { Title, Content as PaperContent } from "@smui/paper";
  import Breadcrumb from "../../../../../../../components/breadcrumb/Breadcrumb.svelte";
  import TraceWithLog from "../../../../../../../components/trace/TraceWithLog.svelte";

  export let trace: Trace;
  export let service: Service;
  export let rpcService: string;
  export let rpcMethod: string;

  const firstSpan = trace.getRootSpanFor(service);
</script>

<Breadcrumb
  crumbs={[
    "Coverage",
    {
      href: `/coverage/${service.urlEncodedFullServiceName}`,
      text: service.fullDisplayServiceName,
    },
    {
      href: `/coverage/${
        service.urlEncodedFullServiceName
      }/undocumented/rpc/method/${encodeURIComponent(
        rpcService,
      )}/${encodeURIComponent(rpcMethod)}`,
      text: `"${rpcService} ${rpcMethod} (Undocumented)"`,
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
