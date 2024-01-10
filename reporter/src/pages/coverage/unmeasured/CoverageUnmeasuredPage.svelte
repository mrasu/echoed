<script lang="ts">
  import { EchoedParam } from "../../../lib/EchoedParam";
  import CoverageUnmeasuredService from "./CoverageUnmeasured.svelte";

  export let params: { fullServiceName: string };

  const echoedParam = EchoedParam.convert(window.__echoed_param__);
  const coverageInfo = echoedParam.pickCoverageInfoFromEncodedServiceName(
    params.fullServiceName,
  );
  const traces = echoedParam.traces;
</script>

{#if coverageInfo}
  <CoverageUnmeasuredService {coverageInfo} {traces} />
{:else}
  <p>Not found</p>
{/if}
