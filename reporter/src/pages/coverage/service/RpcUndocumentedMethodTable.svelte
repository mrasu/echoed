<script lang="ts">
  import { RpcCoverage, RpcMethodTraces, Service } from "@/lib/EchoedParam";
  import { Text } from "@smui/list";
  import DataTable, { Body, Row, Head, Cell } from "@smui/data-table";
  import { push } from "svelte-spa-router";

  export let service: Service;
  export let rpcCoverage: RpcCoverage;

  const orderMethodTraces = (traces: RpcMethodTraces[]): RpcMethodTraces[] => {
    return [...traces].sort((a, b) => {
      if (a.service !== b.service) {
        return a.service ? 1 : -1;
      }
      if (a.method !== b.method) {
        return a.method < b.method ? -1 : 1;
      }

      return 0;
    });
  };

  $: orderedMethodCoverages = orderMethodTraces(
    rpcCoverage.undocumentedMethods,
  );

  const moveToUndocumented = (rpcMethodTraces: RpcMethodTraces) => {
    const rpcService = encodeURIComponent(rpcMethodTraces.service);
    const rpcMethod = encodeURIComponent(rpcMethodTraces.method);
    const pageUrl = `/coverage/${service.urlEncodedFullServiceName}/undocumented/rpc/method/${rpcService}/${rpcMethod}`;

    push(pageUrl);
  };
</script>

{#if orderedMethodCoverages.length > 0}
  <div class="undocumented">
    <div class="title">
      <Text style="font-size: 1.3rem">Undocumented RPC methods</Text>
    </div>
    <DataTable style="width: 100%">
      <Head>
        <Row>
          <Cell>Service</Cell>
          <Cell>Method</Cell>
        </Row>
      </Head>
      <Body>
        {#each orderedMethodCoverages as method}
          <Row
            on:click={() => moveToUndocumented(method)}
            style="cursor: pointer"
          >
            <Cell>
              <Text style="font-size: 1rem">
                {method.service}
              </Text>
            </Cell>
            <Cell style="width: 100%">
              <Text style="font-size: 1rem">
                {method.method}
              </Text>
            </Cell>
          </Row>
        {/each}
      </Body>
    </DataTable>
  </div>
{/if}

<style>
  .undocumented {
    margin-top: 20px;
  }

  .undocumented .title {
    margin-bottom: 10px;
  }
</style>
