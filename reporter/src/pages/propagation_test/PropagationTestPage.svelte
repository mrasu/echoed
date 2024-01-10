<script lang="ts">
  import { EchoedParam } from "../../lib/EchoedParam";
  import PropagationTest from "./PropagationTest.svelte";

  const echoedParam = EchoedParam.convert(window.__echoed_param__);
  const traces = echoedParam.traces;
  const propagationFailedTraces = echoedParam.propagationFailedTraces;
</script>

<PropagationTest {traces} {propagationFailedTraces} />
