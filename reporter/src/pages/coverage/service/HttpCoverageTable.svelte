<script lang="ts">
  import { HttpCoverage } from "@/lib/EchoedParam";
  import FailedIcon from "@/components/status_icons/FailedIcon.svelte";
  import SucceededIcon from "@/components/status_icons/SucceededIcon.svelte";
  import { METHOD_ORDER_MAP } from "@/lib/util/http";

  export let httpCoverage: HttpCoverage;

  $: orderedPathCoverages = [...(httpCoverage.operationCoverages || [])].sort(
    (a, b) => {
      if (a.passed !== b.passed) {
        return a.passed ? 1 : -1;
      }
      if (a.path !== b.path) {
        return a.path < b.path ? -1 : 1;
      }
      return (
        (METHOD_ORDER_MAP.get(a.method) ?? 100) -
        (METHOD_ORDER_MAP.get(b.method) ?? 100)
      );
    },
  );
</script>

<table>
  {#each orderedPathCoverages as pathCoverage}
    <tr>
      <td class="passed">
        <div>
          {#if pathCoverage.passed}
            <SucceededIcon />
          {:else}
            <FailedIcon />
          {/if}
        </div>
      </td>
      <td class="method">
        {pathCoverage.method.toUpperCase()}
      </td>
      <td>
        {pathCoverage.path}
      </td>
    </tr>
  {/each}
</table>

<style>
  td div {
    display: flex;
  }

  td.method {
    padding-right: 10px;
    padding-left: 10px;
  }
</style>
