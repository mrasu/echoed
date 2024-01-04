<script lang="ts">
  import { EchoedParam } from "../../lib/EchoedParam";
  import ServiceCoverage from "./ServiceCoverage.svelte";

  export let params: { serviceName: string };

  const echoedParam = EchoedParam.convert(window.__echoed_param__);
  const coverageInfo = echoedParam.pickCoverageInfo(params.serviceName);
</script>

{#if coverageInfo}
  <ServiceCoverage {coverageInfo} />
{:else}
  Invalid service-name
{/if}
