<script lang="ts">
  import { TestInfo, Traces } from "../../lib/EchoedParam";
  import TraceList from "./TraceList.svelte";
  import TestDescription from "./TestDescription.svelte";
  import Breadcrumb from "../../components/breadcrumb/Breadcrumb.svelte";

  export let testInfo: TestInfo;
  export let traces: Traces;
</script>

<Breadcrumb crumbs={["Test", `"${testInfo.name}" as ${testInfo.file}`]} />

<div class="description">
  <TestDescription {testInfo}></TestDescription>
</div>
<TraceList {testInfo} {traces} />

<style>
  .description {
    margin-bottom: 20px;
  }
</style>
