<script lang="ts">
  import Chart from "chart.js/auto";
  import { HierarchicalScale } from "chartjs-plugin-hierarchical";
  import { routes } from "./routes";
  import Router from "svelte-spa-router";
  import Header from "./components/header/Header.svelte";

  Chart.register(HierarchicalScale);
</script>

<Header />
<main id="main">
  <Router {routes} />
</main>

<style>
  #main {
    width: 80vw;
  }
</style>
