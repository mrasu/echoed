<script lang="ts">
  import { PropagationFailedTrace, Traces } from "@/lib/EchoedParam";
  import { TestNameForPropagation } from "@/consts/testNames";
  import Description from "./Description.svelte";
  import TraceList from "./TraceList.svelte";
  import Breadcrumb from "@/components/breadcrumb/Breadcrumb.svelte";

  export let traces: Traces;
  export let propagationFailedTraces: PropagationFailedTrace[];
  const passed = propagationFailedTraces.length === 0;
</script>

<Breadcrumb crumbs={["Test", `"${TestNameForPropagation}"`]} />

<div class="description">
  <Description {passed}></Description>
</div>
{#if !passed}
  <TraceList {propagationFailedTraces} {traces} />
{/if}

<style>
  .description {
    margin-bottom: 20px;
  }
</style>
