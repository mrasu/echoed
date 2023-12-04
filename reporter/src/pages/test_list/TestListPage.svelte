<script lang="ts">
  import { TestInfo, TobikuraParam } from "../../lib/TobikuraParam";
  import List, { Item, Separator, Text } from "@smui/list";
  import { push } from "svelte-spa-router";

  const tobikuraParam = TobikuraParam.convert(window.__tobikura_param__);
  const testInfos = tobikuraParam.testInfos;

  const moveToTest = (testInfo: TestInfo) => {
    push(`/test/${testInfo.testId}`);
  };
</script>

<div>
  Tests
  <List class="demo-list">
    {#each testInfos as testInfo}
      <Separator />
      <Item on:SMUI:action={() => moveToTest(testInfo)}>
        <Text>{testInfo.name} - {testInfo.file} - {testInfo.status}</Text>
      </Item>
    {/each}
    <Separator />
  </List>
</div>
