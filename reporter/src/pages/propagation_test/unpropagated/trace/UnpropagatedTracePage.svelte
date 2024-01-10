<script lang="ts">
  import { EchoedParam } from "../../../../lib/EchoedParam";
  import Trace from "./Trace.svelte";

  export let params: { traceId: string };

  const echoedParam = EchoedParam.convert(window.__echoed_param__);
  const trace = echoedParam.traces.get(params.traceId);
</script>

{#if trace}
  <Trace {trace} />
{:else}
  Invalid trace-id
{/if}
