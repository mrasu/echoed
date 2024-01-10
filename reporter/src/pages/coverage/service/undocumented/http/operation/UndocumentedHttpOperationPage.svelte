<script lang="ts">
  import { echoedParam } from "@/consts/echoedParam";
  import UndocumentedHttpOperation from "./UndocumentedHttpOperation.svelte";
  import { toMethod } from "@/lib/util/http";

  export let params: { fullServiceName: string; method: string; path: string };

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

  const traces = echoedParam.traces;
</script>

{#if httpOperationTraces && coverageInfo}
  <UndocumentedHttpOperation
    {httpOperationTraces}
    {traces}
    service={coverageInfo.service}
  />
{:else}
  <p>Invalid http operation</p>
{/if}
