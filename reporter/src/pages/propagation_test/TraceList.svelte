<script lang="ts">
  import { PropagationFailedTrace, Traces } from "@/lib/EchoedParam";
  import List, { Separator, Text } from "@smui/list";
  import { push } from "svelte-spa-router";
  import Paper, { Title, Content } from "@smui/paper";
  import FailedIcon from "@/components/status_icons/FailedIcon.svelte";
  import ListItem from "@/components/list/ListItem.svelte";

  export let traces: Traces;
  export let propagationFailedTraces: PropagationFailedTrace[];

  const moveToTrace = (trace: PropagationFailedTrace) => {
    push(`/propagation_test/unpropagated/${trace.traceId}`);
  };

  const getNameForTrace = (traceId: string): string => {
    return traces.get(traceId)?.rootSpanName ?? "";
  };
</script>

<Paper>
  <Title>Traces</Title>
  <Content>
    <List>
      {#each propagationFailedTraces as trace}
        <ListItem on:click={() => moveToTrace(trace)}>
          <FailedIcon />
          <Text style="margin-left: 10px">
            {getNameForTrace(trace.traceId)}
          </Text>
          <Text style="margin-left: 10px; font-size: 0.85rem">
            {trace.traceId}
          </Text>
        </ListItem>
      {/each}
      <Separator />
    </List>
  </Content>
</Paper>

<style>
</style>
