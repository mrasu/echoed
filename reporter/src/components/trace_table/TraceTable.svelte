<script lang="ts">
  import { Service, Trace, Traces } from "../../lib/EchoedParam";
  import { Text } from "@smui/list";
  import { Head, Row, Cell } from "@smui/data-table";
  import PagingDataTable from "../../components/data_table/PagingDataTable.svelte";
  import { createEventDispatcher } from "svelte";

  export let service: Service;
  export let traceIds: string[];

  export let traces: Traces;

  const dispatch = createEventDispatcher<{
    pageChanged: void;
    rowClick: { trace: Trace };
  }>();

  const onRowClicked = (trace: Trace) => () => {
    dispatch("rowClick", {
      trace,
    });
  };

  const onPageChanged = () => {
    dispatch("pageChanged");
  };
</script>

<PagingDataTable
  style="width: 100%"
  items={traceIds}
  on:pageChanged={onPageChanged}
>
  <svelte:fragment slot="head">
    <Head>
      <Row>
        <Cell>Trace</Cell>
      </Row>
    </Head>
  </svelte:fragment>
  <svelte:fragment slot="row" let:prop={traceId}>
    {@const trace = traces.get(traceId)}
    {@const span = trace?.getRootSpanFor(service)}

    {#if trace}
      <Row on:click={onRowClicked(trace)} style="cursor: pointer">
        <Cell>
          <Text>
            {traceId}
          </Text>
          <Text style="margin-left: 10px; font-size: 0.85rem">
            {span?.name || "Unknown"}
          </Text>
        </Cell>
      </Row>
    {/if}
  </svelte:fragment>
</PagingDataTable>
