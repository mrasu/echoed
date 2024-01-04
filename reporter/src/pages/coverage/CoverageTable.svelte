<script lang="ts">
  import { Text } from "@smui/list";
  import { CoverageInfo } from "../../lib/EchoedParam";
  import { push } from "svelte-spa-router";
  import DataTable, {
    Head,
    Body,
    Row,
    Cell,
    SortValue,
  } from "@smui/data-table";
  import IconButton from "@smui/icon-button";

  const SORT_KEYS = ["serviceName", "coverageRatio"] as const;
  type SortKey = (typeof SORT_KEYS)[number];
  let sort: SortKey = "serviceName";
  let sortDirection: Lowercase<keyof typeof SortValue> = "ascending";

  const COVERAGE_WARN_THRESHOLD = 0.6;
  const COVERAGE_SUCCESS_THRESHOLD = 0.8;

  export let coverageInfos: CoverageInfo[];

  const moveToServiceCoverage = (coverageInfo: CoverageInfo) => {
    push(`/coverage/${coverageInfo.serviceName}`);
  };

  let orderedCoverageInfos = [...coverageInfos].sort((a, b) => {
    return a.serviceName.localeCompare(b.serviceName) < 0 ? -1 : 1;
  });

  const getCoverageColor = (coverageInfo: CoverageInfo): string => {
    const coverageRatio = coverageInfo.http.coverageRatio;

    if (COVERAGE_SUCCESS_THRESHOLD < coverageRatio) {
      return "green";
    } else if (COVERAGE_WARN_THRESHOLD < coverageRatio) {
      return "yellow";
    } else {
      return "red";
    }
  };

  const handleSort = () => {
    orderedCoverageInfos = [...coverageInfos].sort((a, b) => {
      const val = calculateCoverageInfoSortLesserValue(sort, a, b);

      if (sortDirection === "ascending") {
        return val;
      } else {
        return val * -1;
      }
    });
  };

  const calculateCoverageInfoSortLesserValue = (
    sortKey: SortKey,
    cov1: CoverageInfo,
    cov2: CoverageInfo,
  ) => {
    if (sortKey === "serviceName") {
      if (cov1.serviceName === cov2.serviceName) {
        return 0;
      }
      return cov1.serviceName < cov2.serviceName ? -1 : 1;
    } else {
      if (cov1[sortKey] === cov2[sortKey]) {
        return 0;
      }
      return cov1[sortKey] < cov2[sortKey] ? -1 : 1;
    }
  };
</script>

<div class="coverage-table">
  <DataTable
    sortable
    bind:sort
    bind:sortDirection
    on:SMUIDataTable:sorted={handleSort}
  >
    <Head>
      <Row>
        <Cell columnId="serviceName" style="width: 60%">
          Service Name
          <IconButton class="material-icons">arrow_upward</IconButton>
        </Cell>
        <Cell sortable={false} style="width: 20%">Coverage</Cell>
        <Cell columnId="coverageRatio" style="width: 20%">
          %
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
                {coverageInfo.serviceName}
              </Text>
            </div>
          </Cell>
          <Cell style="display: flex; height: 100%">
            <div
              class="coverage-ratio-box {getCoverageColor(coverageInfo)}"
              style="margin: auto"
            >
              <div style="width: {coverageInfo.coverageRatio * 100}%"></div>
            </div>
          </Cell>
          <Cell style="">
            <Text>
              {coverageInfo.coveragePercent}
              (
              {coverageInfo.passedCount}/
              {coverageInfo.pathCoverageLength}
              )
            </Text>
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

  .coverage-ratio-box {
    display: flex;
    width: 100%;
    margin-left: 10%;
    margin-right: 10%;
  }
  .coverage-ratio-box div {
    height: 1rem;
  }

  .coverage-ratio-box.red {
    border: 1px solid var(--color-red);
  }
  .coverage-ratio-box.red div {
    background-color: var(--color-red);
  }

  .coverage-ratio-box.yellow {
    border: 1px solid var(--color-yellow);
  }
  .coverage-ratio-box.yellow div {
    background-color: var(--color-yellow);
  }

  .coverage-ratio-box.green {
    border: 1px solid var(--color-green);
  }
  .coverage-ratio-box.green div {
    background-color: var(--color-green);
  }
</style>
