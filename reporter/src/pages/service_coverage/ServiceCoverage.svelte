<script lang="ts">
  import { Text } from "@smui/list";
  import { CoverageInfo } from "../../lib/EchoedParam";
  import Paper, { Content, Title } from "@smui/paper";
  import HttpCoverageTable from "./HttpCoverageTable.svelte";
  import RpcCoverageTable from "./RpcCoverageTable.svelte";
  import Breadcrumb from "../../components/breadcrumb/Breadcrumb.svelte";

  export let coverageInfo: CoverageInfo;
</script>

<Breadcrumb crumbs={["Coverage", coverageInfo.serviceName]} />

<Paper>
  <Title>
    Coverage at {coverageInfo.fullServiceName}
    {#if coverageInfo.httpCoverage}
      (HTTP)
    {:else if coverageInfo.rpcCoverage}
      (RPC)
    {/if}
  </Title>
  <Content>
    {#if coverageInfo.httpCoverage}
      <HttpCoverageTable httpCoverage={coverageInfo.httpCoverage} />
    {:else if coverageInfo.rpcCoverage}
      <RpcCoverageTable rpcCoverage={coverageInfo.rpcCoverage} />
    {:else}
      <Text>No coverage found</Text>
    {/if}
  </Content>
</Paper>
