<script lang="ts">
  import { TobikuraParam } from "../../lib/TobikuraParam";
  import List, { Separator, Group, Subheader } from "@smui/list";
  import Paper, { Title, Content } from "@smui/paper";
  import TestListInSameFile from "./TestListInSameFile.svelte";

  const tobikuraParam = TobikuraParam.convert(window.__tobikura_param__);
  const testInfosByFile = tobikuraParam.testInfosByFile();

  const orderedFileName = [...testInfosByFile.keys()].sort((a, b) =>
    a < b ? -1 : 1,
  );
</script>

<Paper>
  <Title>Tests</Title>
  <Content>
    {#each orderedFileName as fileName}
      <Group>
        <Subheader>{fileName}</Subheader>
        <List class="demo-list">
          <TestListInSameFile testInfos={testInfosByFile.get(fileName) || []} />
        </List>
      </Group>
      <Separator />
    {/each}
  </Content>
</Paper>
