<script lang="ts">
  import { EchoedParam } from "../../../../../../../lib/EchoedParam";
  import UndocumentedRpcMethodTrace from "./UndocumentedRpcMethodTrace.svelte";

  export let params: {
    fullServiceName: string;
    service: string;
    method: string;
    traceId: string;
  };

  const echoedParam = EchoedParam.convert(window.__echoed_param__);
  const rpcService = decodeURIComponent(params.service);
  const rpcMethod = decodeURIComponent(params.method);
  const coverageInfo = echoedParam.pickCoverageInfoFromEncodedServiceName(
    params.fullServiceName,
  );
  const rpcMethodTraces =
    coverageInfo?.rpcCoverage?.pickUndocumentedMethodTracesFor(
      rpcService,
      rpcMethod,
    );

  const trace = echoedParam.traces.get(params.traceId);
</script>

{#if trace && coverageInfo && rpcMethodTraces}
  <UndocumentedRpcMethodTrace
    {trace}
    service={coverageInfo.service}
    {rpcService}
    {rpcMethod}
  />
{:else}
  Invalid trace-id
{/if}
