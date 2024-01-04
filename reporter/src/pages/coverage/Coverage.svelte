<script lang="ts">
  import { CoverageInfo } from "../../lib/EchoedParam";
  import Paper, { Content, Title } from "@smui/paper";
  import CoverageTable from "./CoverageTable.svelte";

  export let coverageInfos: CoverageInfo[];
</script>

<Paper>
  <Title>Coverage Per Service</Title>
  <Content>
    <CoverageTable {coverageInfos} />
  </Content>
</Paper>
