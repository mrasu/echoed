<script lang="ts">
  import { echoedParam } from "@/consts/echoedParam";
  import List, { Separator, Group, Subheader, Text } from "@smui/list";
  import Paper, { Title, Content } from "@smui/paper";
  import TestListInSameFile from "./TestListInSameFile.svelte";
  import OtherTestsList from "./OtherTestsList.svelte";

  const testInfosByFile = echoedParam.testInfosByFile();

  const orderedFileName = [...testInfosByFile.keys()].sort((a, b) =>
    a < b ? -1 : 1,
  );

  const propagationTestEnabled = echoedParam.config.propagationTestEnabled;
  const hasPropagationFailedTrace = echoedParam.hasPropagationFailedTrace();

  const showOtherTests = propagationTestEnabled;
</script>

<Paper>
  <Title>All Tests</Title>
  <Content>
    {#each orderedFileName as fileName}
      <Group>
        <Subheader>{fileName}</Subheader>
        <List>
          <TestListInSameFile testInfos={testInfosByFile.get(fileName) || []} />
        </List>
      </Group>
      <Separator />
    {/each}

    {#if showOtherTests}
      <Group>
        <Subheader>
          <Text style="font-size: 1.3rem; font-weight: 400">Other tests</Text>
        </Subheader>

        <OtherTestsList
          {propagationTestEnabled}
          propagationTestPassed={!hasPropagationFailedTrace}
        />
      </Group>
    {/if}
    <Separator />
  </Content>
</Paper>
