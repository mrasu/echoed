<script lang="ts">
  import {
    HttpCoverage,
    HttpOperationTraces,
    Service,
  } from "@/lib/EchoedParam";
  import { Text } from "@smui/list";
  import DataTable, { Body, Row, Cell } from "@smui/data-table";
  import { push } from "svelte-spa-router";
  import { METHOD_ORDER_MAP } from "@/lib/util/http";

  export let service: Service;
  export let httpCoverage: HttpCoverage;

  $: orderedUndocumentedOperations = [
    ...(httpCoverage.undocumentedOperations || []),
  ].sort((a, b) => {
    if (a.path !== b.path) {
      return a.path < b.path ? -1 : 1;
    }
    return (
      (METHOD_ORDER_MAP.get(a.method) ?? 100) -
      (METHOD_ORDER_MAP.get(b.method) ?? 100)
    );
  });

  const moveToUndocumented = (traces: HttpOperationTraces) => {
    const method = encodeURIComponent(traces.method);
    const path = encodeURIComponent(traces.path);
    const pageUrl = `/coverage/${service.urlEncodedFullServiceName}/undocumented/http/operation/${method}/${path}`;

    push(pageUrl);
  };
</script>

{#if orderedUndocumentedOperations.length > 0}
  <div class="undocumented">
    <div class="title">
      <Text style="font-size: 1.3rem">Undocumented HTTP operations</Text>
    </div>
    <DataTable style="width: 100%">
      <Body>
        {#each orderedUndocumentedOperations as operation}
          <Row
            on:click={() => moveToUndocumented(operation)}
            style="cursor: pointer"
          >
            <Cell>
              <Text style="display: table-cell; font-size: 1rem">
                {operation.method.toUpperCase()}
              </Text>
            </Cell>
            <Cell style="width: 100%">
              <Text style="display: table-cell; font-size: 1rem">
                {operation.path}
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
