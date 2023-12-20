<script lang="ts">
  import { TobikuraParam } from "../..//lib/TobikuraParam";
  import Trace from "./Trace.svelte";

  export let params: { traceId: string };

  const tobikuraParam = TobikuraParam.convert(window.__tobikura_param__);
  const trace = tobikuraParam.pickOrphanTrace(params.traceId);
</script>

{#if trace}
  <Trace {trace} />
{:else}
  Invalid trace-id
{/if}
