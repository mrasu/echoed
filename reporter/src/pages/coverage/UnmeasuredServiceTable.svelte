<script lang="ts">
  import { Text } from "@smui/list";
  import { CoverageInfo } from "@/lib/EchoedParam";
  import { push } from "svelte-spa-router";
  import DataTable, {
    Head,
    Body,
    Row,
    Cell,
    SortValue,
  } from "@smui/data-table";
  import IconButton from "@smui/icon-button";

  type SortValues = Lowercase<keyof typeof SortValue>;
  let sortDirection: SortValues = "ascending";

  export let coverageInfos: CoverageInfo[];

  const moveToServiceCoverage = (coverageInfo: CoverageInfo) => {
    push(`/coverage/${coverageInfo.urlEncodedFullServiceName}/unmeasured`);
  };

  const calculateOrder = (
    direction: SortValues,
    cov1: CoverageInfo,
    cov2: CoverageInfo,
  ) => {
    const value = cov1.compareSortByServiceName(cov2);

    if (direction === "ascending") {
      return value;
    } else {
      return value * -1;
    }
  };

  let orderedCoverageInfos = [...coverageInfos].sort((a, b) => {
    return calculateOrder(sortDirection, a, b);
  });

  const handleSort = () => {
    orderedCoverageInfos = [...coverageInfos].sort((a, b) => {
      return calculateOrder(sortDirection, a, b);
    });
  };
</script>

<div class="coverage-table">
  <DataTable
    sortable
    sort="serviceName"
    bind:sortDirection
    on:SMUIDataTable:sorted={handleSort}
  >
    <Head>
      <Row>
        <Cell columnId="serviceName" style="width: 60%">
          Service Name
          <IconButton class="material-icons">arrow_upward</IconButton>
        </Cell>
      </Row>
    </Head>
    <Body>
      {#each orderedCoverageInfos as coverageInfo}
        <Row
          on:click={() => moveToServiceCoverage(coverageInfo)}
          style="cursor: pointer"
        >
          <Cell>
            <div style="display: table; table-layout: fixed; width: 100%">
              <Text style="display: table-cell; font-size: 1rem">
                {coverageInfo.fullDisplayServiceName}
              </Text>
            </div>
          </Cell>
        </Row>
      {/each}
    </Body>
  </DataTable>
</div>

<style>
  .coverage-table :global(table) {
    table-layout: fixed;
    width: 100%;
    height: 100%;
  }
</style>
