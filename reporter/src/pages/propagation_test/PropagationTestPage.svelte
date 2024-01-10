<script lang="ts">
  import { echoedParam } from "../../consts/echoedParam";
  import PropagationTest from "./PropagationTest.svelte";

  const traces = echoedParam.traces;
  const propagationFailedTraces = echoedParam.propagationFailedTraces;
</script>

<PropagationTest {traces} {propagationFailedTraces} />
