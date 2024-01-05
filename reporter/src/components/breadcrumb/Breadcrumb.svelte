<script lang="ts">
  import { Text } from "@smui/list";
  import { link } from "svelte-spa-router";

  type HeadCrumb = "Coverage" | "Test";
  type CrumbLink = { href: string; text: string };

  type CrumbArray = [HeadCrumb, ...CrumbLink[], string];

  export let crumbs: CrumbArray;

  const normalizeCrumbs = (targetCrumbs: CrumbArray): CrumbLink[] => {
    return targetCrumbs.map((crumb, index) => {
      if (index === 0) {
        if (crumb === "Coverage") {
          return { href: "/coverage", text: crumb };
        } else if (crumb === "Test") {
          return { href: "/", text: crumb };
        }
      }

      if (typeof crumb === "string") {
        return { href: "", text: crumb };
      }
      return crumb;
    });
  };

  $: normalizedCrumbs = normalizeCrumbs(crumbs);
</script>

<div class="container">
  {#each normalizedCrumbs as crumb, index}
    {#if crumb.href === ""}
      <Text>
        {crumb.text}
      </Text>
    {:else}
      <Text>
        <a href={crumb.href} use:link>{crumb.text}</a>
      </Text>
    {/if}

    {#if index !== crumbs.length - 1}
      <Text>/&nbsp;</Text>
    {/if}
  {/each}
</div>

<style>
  .container {
    margin-bottom: 20px;
  }
</style>
