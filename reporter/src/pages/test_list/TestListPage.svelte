<script lang="ts">
  import { TobikuraParam } from "../../lib/TobikuraParam";
  import List, { Separator, Group, Subheader, Text } from "@smui/list";
  import Paper, { Title, Content } from "@smui/paper";
  import TestListInSameFile from "./TestListInSameFile.svelte";
  import OtherTestsList from "./OtherTestsList.svelte";

  const tobikuraParam = TobikuraParam.convert(window.__tobikura_param__);
  const testInfosByFile = tobikuraParam.testInfosByFile();

  const orderedFileName = [...testInfosByFile.keys()].sort((a, b) =>
    a < b ? -1 : 1,
  );

  const propagationTestEnabled = tobikuraParam.config.propagationTestEnabled;
  const hasOrphanTrace = tobikuraParam.hasOrphanTrace();

  const showOtherTests = propagationTestEnabled;
</script>

<Paper>
  <Title>Tests</Title>
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
          propagationTestPassed={!hasOrphanTrace}
        />
      </Group>
    {/if}
    <Separator />
  </Content>
</Paper>
