<script lang="ts">
  import { EchoedParam } from "../../../lib/EchoedParam";
  import CoverageService from "./CoverageService.svelte";

  export let params: { fullServiceName: string };

  const echoedParam = EchoedParam.convert(window.__echoed_param__);
  const coverageInfo = echoedParam.pickCoverageInfoFromEncodedServiceName(
    params.fullServiceName,
  );
</script>

{#if coverageInfo}
  <CoverageService {coverageInfo} />
{:else}
  Invalid service-name
{/if}
