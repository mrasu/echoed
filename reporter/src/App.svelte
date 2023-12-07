<script lang="ts">
  import Chart from "chart.js/auto";
  import { HierarchicalScale } from "chartjs-plugin-hierarchical";
  import { routes } from "./routes";
  import Router from "svelte-spa-router";

  Chart.register(HierarchicalScale);
</script>

<main id="main">
  <Router {routes} />
</main>

<style>
  #main {
    width: 80vw;
  }
</style>
