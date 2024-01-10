<script lang="ts">
  import { echoedParam } from "@/consts/echoedParam";
  import Trace from "./Trace.svelte";

  export let params: { traceId: string };

  const trace = echoedParam.traces.get(params.traceId);
</script>

{#if trace}
  <Trace {trace} />
{:else}
  Invalid trace-id
{/if}
