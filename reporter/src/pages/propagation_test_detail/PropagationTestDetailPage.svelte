<script lang="ts">
  import { TobikuraParam } from "../../lib/TobikuraParam";
  import PropagationTestDetail from "./PropagationTestDetail.svelte";

  const tobikuraParam = TobikuraParam.convert(window.__tobikura_param__);
  const orphanTraces = tobikuraParam.orphanTraces;
</script>

<PropagationTestDetail {orphanTraces} />
