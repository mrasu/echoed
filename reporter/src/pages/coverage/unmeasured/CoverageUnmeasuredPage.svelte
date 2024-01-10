<script lang="ts">
  import { echoedParam } from "../../../consts/echoedParam";
  import CoverageUnmeasuredService from "./CoverageUnmeasured.svelte";

  export let params: { fullServiceName: string };

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
