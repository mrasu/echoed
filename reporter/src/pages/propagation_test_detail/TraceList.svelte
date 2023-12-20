<script lang="ts">
  import { Trace } from "../../lib/TobikuraParam";
  import List, { Separator, Text } from "@smui/list";
  import { push } from "svelte-spa-router";
  import Paper, { Title, Content } from "@smui/paper";
  import FailedIcon from "../../components/status_icons/FailedIcon.svelte";
  import ListItem from "../../components/list/ListItem.svelte";

  export let orphanTraces: Trace[];
  const moveToTrace = (trace: Trace) => {
    push(`/propagation_test/unpropagated/${trace.traceId}`);
  };
</script>

<Paper>
  <Title>Traces</Title>
  <Content>
    <List>
      {#each orphanTraces as trace}
        <ListItem on:click={() => moveToTrace(trace)}>
          <FailedIcon />
          <Text style="margin-left: 10px">
            {trace.rootSpan?.name || "Unknown"}
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
