<script lang="ts">
  import { EchoedParam } from "../../lib/EchoedParam";
  import Coverage from "./Coverage.svelte";

  const echoedParam = EchoedParam.convert(window.__echoed_param__);
  const coverageInfos = echoedParam.coverageInfos;
</script>

<Coverage {coverageInfos} />
