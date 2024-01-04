<script lang="ts">
  import Tab, { Label } from "@smui/tab";
  import TabBar from "@smui/tab-bar";
  import { location, push } from "svelte-spa-router";

  const getCurrentTab = (location: string) => {
    const routeParts = location.split("/").filter((a) => a);
    return routeParts[0] === "coverage" ? "Coverage" : "Test";
  };

  $: active = getCurrentTab($location);

  const tabClicked = (tab: string) => {
    if (tab === "Test") {
      push("/");
    } else if (tab === "Coverage") {
      push("/coverage");
    }
  };

  const TABS = ["Test", "Coverage"];
</script>

<div class="header">
  <TabBar tabs={TABS} let:tab bind:active>
    <Tab minWidth {tab} on:click={() => tabClicked(tab)}>
      <Label>{tab}</Label>
    </Tab>
  </TabBar>
</div>

<style>
  .header {
    margin-bottom: 20px;
  }
</style>
