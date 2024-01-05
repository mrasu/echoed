<script lang="ts">
  import {
    RpcCoverage,
    RpcMethodCoverage,
  } from "../../lib/EchoedParam";
  import FailedIcon from "../../components/status_icons/FailedIcon.svelte";
  import SucceededIcon from "../../components/status_icons/SucceededIcon.svelte";
  import { Text } from "@smui/list";

  export let rpcCoverage: RpcCoverage;

  const orderMethodCoverages = (
    serviceCoverages: Map<string, RpcMethodCoverage[]>,
  ): [string, RpcMethodCoverage[]][] => {
    const orderedServiceCoverage: [string, RpcMethodCoverage[]][] = [];

    const services = [...serviceCoverages.keys()].sort();
    for (const service of services) {
      const methods = serviceCoverages.get(service)!.sort((a, b) => {
        if (a.passed !== b.passed) {
          return a.passed ? 1 : -1;
        }
        if (a.method !== b.method) {
          return a.method < b.method ? -1 : 1;
        }

        return 0;
      });
      orderedServiceCoverage.push([service, methods]);
    }

    return orderedServiceCoverage;
  };

  $: orderedMethodCoverages = orderMethodCoverages(
    rpcCoverage.methodCoveragesGroupedByService,
  );
</script>

{#each orderedMethodCoverages as [service, methodCoverages]}
  <Text style="font-size: 1.17em;font-weight: bold;">{service}</Text>

  <table>
    {#each methodCoverages as methodCoverage}
      <tr>
        <td class="passed">
          <div>
            {#if methodCoverage.passed}
              <SucceededIcon />
            {:else}
              <FailedIcon />
            {/if}
          </div>
        </td>
        <td class="method">
          {methodCoverage.method}
        </td>
      </tr>
    {/each}
  </table>
{/each}

<style>
  td div {
    display: flex;
  }

  td.method {
    padding-left: 10px;
  }
</style>
