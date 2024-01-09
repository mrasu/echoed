<script lang="ts">
  import { Service, type Trace } from "../../lib/EchoedParam";
  import Paper, { Title, Content as PaperContent } from "@smui/paper";
  import Breadcrumb from "../../components/breadcrumb/Breadcrumb.svelte";
  import TraceWithLog from "../../components/trace/TraceWithLog.svelte";
  import type { HttpMethod } from "../../lib/util/http";

  export let trace: Trace;
  export let service: Service;
  export let path: string;
  export let method: HttpMethod;

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
      }/undocumented/operation/${encodeURIComponent(
        method,
      )}/${encodeURIComponent(path)}`,
      text: `"${method.toUpperCase()} ${path} (Undocumented)"`,
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
