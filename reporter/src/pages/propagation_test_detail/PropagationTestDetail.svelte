<script lang="ts">
  import { link } from "svelte-spa-router";
  import { Text } from "@smui/list";
  import type { Trace } from "../../lib/EchoedParam";
  import { TestNameForPropagation } from "../../consts/testNames";
  import Description from "./Description.svelte";
  import TraceList from "./TraceList.svelte";

  export let propagationFailedTraces: Trace[];
  const passed = propagationFailedTraces.length === 0;
</script>

<div style="margin-bottom: 20px">
  <Text><a href="/" use:link>Tests</a></Text>
  <Text>/</Text>
  <Text>
    <Text>&quot{TestNameForPropagation}&quot</Text>
  </Text>
</div>

<div class="description">
  <Description {passed}></Description>
</div>
{#if !passed}
  <TraceList {propagationFailedTraces} />
{/if}

<style>
  .description {
    margin-bottom: 20px;
  }
</style>
