<script lang="ts">
  import { echoedParam } from "../../../consts/echoedParam";
  import CoverageService from "./CoverageService.svelte";

  export let params: { fullServiceName: string };

  const coverageInfo = echoedParam.pickCoverageInfoFromEncodedServiceName(
    params.fullServiceName,
  );
</script>

{#if coverageInfo}
  <CoverageService {coverageInfo} />
{:else}
  Invalid service-name
{/if}
