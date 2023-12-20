<script lang="ts">
  import { link } from "svelte-spa-router";
  import { Text } from "@smui/list";
  import type { Trace } from "../../lib/TobikuraParam";
  import { TestNameForPropagation } from "../../consts/testNames";
  import Description from "./Description.svelte";
  import TraceList from "./TraceList.svelte";

  export let orphanTraces: Trace[];
  const passed = orphanTraces.length === 0;
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
  <TraceList {orphanTraces} />
{/if}

<style>
  .description {
    margin-bottom: 20px;
  }
</style>
