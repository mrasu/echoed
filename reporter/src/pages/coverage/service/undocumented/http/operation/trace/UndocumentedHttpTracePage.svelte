<script lang="ts">
  import { EchoedParam } from "../../../../../../../lib/EchoedParam";
  import UndocumentedHttpTrace from "./UndocumentedHttpTrace.svelte";
  import { toMethod } from "../../../../../../../lib/util/http";

  export let params: {
    fullServiceName: string;
    method: string;
    path: string;
    traceId: string;
  };

  const echoedParam = EchoedParam.convert(window.__echoed_param__);
  const method = toMethod(decodeURIComponent(params.method));
  const path = decodeURIComponent(params.path);
  const coverageInfo = echoedParam.pickCoverageInfoFromEncodedServiceName(
    params.fullServiceName,
  );
  const httpOperationTraces = method
    ? coverageInfo?.httpCoverage?.pickUndocumentedOperationTracesFor(
        method,
        path,
      )
    : undefined;

  const trace = echoedParam.traces.get(params.traceId);
</script>

{#if trace && coverageInfo && httpOperationTraces}
  <UndocumentedHttpTrace
    {trace}
    service={coverageInfo.service}
    method={httpOperationTraces.method}
    path={httpOperationTraces.path}
  />
{:else}
  Invalid trace-id
{/if}
