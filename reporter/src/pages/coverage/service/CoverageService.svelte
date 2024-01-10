<script lang="ts">
  import { Text } from "@smui/list";
  import { CoverageInfo } from "../../../lib/EchoedParam";
  import Paper, { Content, Title } from "@smui/paper";
  import HttpCoverageTable from "./HttpCoverageTable.svelte";
  import RpcCoverageTable from "./RpcCoverageTable.svelte";
  import Breadcrumb from "../../../components/breadcrumb/Breadcrumb.svelte";
  import HttpUndocumentedOperationTable from "./HttpUndocumentedOperationTable.svelte";
  import RpcUndocumentedMethodTable from "./RpcUndocumentedMethodTable.svelte";

  export let coverageInfo: CoverageInfo;
</script>

<Breadcrumb crumbs={["Coverage", coverageInfo.fullDisplayServiceName]} />

<Paper>
  <Title>
    Coverage at {coverageInfo.fullDisplayServiceName}
    {#if coverageInfo.httpCoverage}
      (HTTP)
    {:else if coverageInfo.rpcCoverage}
      (RPC)
    {/if}
  </Title>
  <Content>
    {#if coverageInfo.httpCoverage}
      <HttpCoverageTable httpCoverage={coverageInfo.httpCoverage} />

      <HttpUndocumentedOperationTable
        service={coverageInfo.service}
        httpCoverage={coverageInfo.httpCoverage}
      />
    {:else if coverageInfo.rpcCoverage}
      <RpcCoverageTable rpcCoverage={coverageInfo.rpcCoverage} />

      <RpcUndocumentedMethodTable
        service={coverageInfo.service}
        rpcCoverage={coverageInfo.rpcCoverage}
      />
    {:else}
      <Text>No coverage found</Text>
    {/if}
  </Content>
</Paper>
