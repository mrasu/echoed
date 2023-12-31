<script lang="ts">
  import { TestInfo } from "../../lib/EchoedParam";
  import { link } from "svelte-spa-router";
  import TraceList from "./TraceList.svelte";
  import { Text } from "@smui/list";
  import TestDescription from "./TestDescription.svelte";

  export let testInfo: TestInfo;
</script>

<div style="margin-bottom: 20px">
  <Text><a href="/" use:link>Tests</a></Text>
  <Text>/</Text>
  <Text>
    <Text>&quot{testInfo.name}&quot</Text>
    <Text>at {testInfo.file}</Text>
  </Text>
</div>

<div class="description">
  <TestDescription {testInfo}></TestDescription>
</div>
<TraceList {testInfo} />

<style>
  .description {
    margin-bottom: 20px;
  }
</style>
