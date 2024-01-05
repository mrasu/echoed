<script lang="ts">
  import { TestInfo } from "../../lib/EchoedParam";
  import TraceList from "./TraceList.svelte";
  import TestDescription from "./TestDescription.svelte";
  import Breadcrumb from "../../components/breadcrumb/Breadcrumb.svelte";

  export let testInfo: TestInfo;
</script>

<Breadcrumb crumbs={["Test", `"${testInfo.name}" as ${testInfo.file}`]} />

<div class="description">
  <TestDescription {testInfo}></TestDescription>
</div>
<TraceList {testInfo} />

<style>
  .description {
    margin-bottom: 20px;
  }
</style>
