<script lang="ts">
  import { KeyValue } from "../../lib/TobikuraParam";
  import DataTable, { Head, Body, Row, Cell } from "@smui/data-table";

  export let attributes: KeyValue[] | undefined;
</script>

<DataTable style="width: 100%">
  <Head>
    <Row>
      <Cell>key</Cell>
      <Cell>value</Cell>
    </Row>
  </Head>
  <Body>
    {#if attributes}
      {#each attributes as attribute}
        <Row>
          <Cell>{attribute.key}</Cell>
          {#if attribute.value}
            <Cell>{attribute.value.displayText}</Cell>
          {:else}
            <Cell>-</Cell>
          {/if}
        </Row>
      {/each}
    {:else}
      <Row>
        <Cell colspan={2}>No attribute</Cell>
      </Row>
    {/if}
  </Body>
</DataTable>
