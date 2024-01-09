<script lang="ts">
  import { EchoedParam } from "../../lib/EchoedParam";
  import CoverageUnmeasuredTrace from "./CoverageUnmeasuredTrace.svelte";

  export let params: { fullServiceName: string; traceId: string };

  const echoedParam = EchoedParam.convert(window.__echoed_param__);
  const coverageInfo = echoedParam.pickCoverageInfoFromEncodedServiceName(
    params.fullServiceName,
  );
  const trace = echoedParam.traces.get(params.traceId);
</script>

{#if trace}
  <CoverageUnmeasuredTrace {coverageInfo} {trace} />
{:else}
  Invalid trace-id
{/if}
