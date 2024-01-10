<script lang="ts">
  import { echoedParam } from "@/consts/echoedParam";
  import UndocumentedRpcMethod from "./UndocumentedRpcMethod.svelte";

  export let params: {
    fullServiceName: string;
    service: string;
    method: string;
  };

  const service = decodeURIComponent(params.service);
  const method = decodeURIComponent(params.method);
  const coverageInfo = echoedParam.pickCoverageInfoFromEncodedServiceName(
    params.fullServiceName,
  );
  const rpcMethodTraces =
    coverageInfo?.rpcCoverage?.pickUndocumentedMethodTracesFor(service, method);

  const traces = echoedParam.traces;
</script>

{#if rpcMethodTraces && coverageInfo}
  <UndocumentedRpcMethod
    {rpcMethodTraces}
    {traces}
    service={coverageInfo.service}
  />
{:else}
  <p>Invalid rpc operation</p>
{/if}
