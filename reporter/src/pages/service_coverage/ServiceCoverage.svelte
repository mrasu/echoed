<script lang="ts">
  import { link } from "svelte-spa-router";
  import { Text } from "@smui/list";
  import { CoverageInfo } from "../../lib/EchoedParam";
  import Paper, { Content, Title } from "@smui/paper";
  import HttpCoverageTable from "./HttpCoverageTable.svelte";
  import RpcCoverageTable from "./RpcCoverageTable.svelte";

  export let coverageInfo: CoverageInfo;
</script>

<div style="margin-bottom: 20px">
  <Text><a href="/coverage" use:link>Coverage</a></Text>
  <Text>/</Text>
  <Text>
    {coverageInfo.serviceName}
  </Text>
</div>

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
