<script lang="ts">
  import { CoverageInfo } from "@/lib/EchoedParam";
  import Paper, { Content, Title } from "@smui/paper";
  import CoverageTable from "./CoverageTable.svelte";
  import UnmeasuredServiceTable from "./UnmeasuredServiceTable.svelte";

  export let coverageInfos: CoverageInfo[];

  $: measuredCoverageInfos = coverageInfos.filter((coverageInfo) => {
    return coverageInfo.httpCoverage || coverageInfo.rpcCoverage;
  });

  $: unmeasuredServices = coverageInfos.filter((coverageInfo) => {
    return coverageInfo.unmeasuredTraceIds.length > 0;
  });
</script>

<Paper>
  <Title>Coverage Per Service</Title>
  <Content>
    <CoverageTable coverageInfos={measuredCoverageInfos} />
  </Content>
</Paper>

<Paper style="margin-top: 20px">
  <Title>Not Configured Services</Title>
  <Content>
    <UnmeasuredServiceTable coverageInfos={unmeasuredServices} />
  </Content>
</Paper>
