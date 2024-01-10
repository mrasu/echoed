<script lang="ts">
  import { echoedParam } from "@/consts/echoedParam";
  import Coverage from "./Coverage.svelte";

  const coverageInfos = echoedParam.coverageInfos;
</script>

<Coverage {coverageInfos} />
