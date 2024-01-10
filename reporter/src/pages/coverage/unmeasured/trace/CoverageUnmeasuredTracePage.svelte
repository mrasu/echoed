<script lang="ts">
  import { echoedParam } from "@/consts/echoedParam";
  import CoverageUnmeasuredTrace from "./CoverageUnmeasuredTrace.svelte";

  export let params: { fullServiceName: string; traceId: string };

  const coverageInfo = echoedParam.pickCoverageInfoFromEncodedServiceName(
    params.fullServiceName,
  );
  const trace = echoedParam.traces.get(params.traceId);
</script>

{#if coverageInfo && trace}
  <CoverageUnmeasuredTrace {coverageInfo} {trace} />
{:else}
  Invalid trace-id
{/if}
