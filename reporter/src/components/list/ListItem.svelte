<script lang="ts">
  import { Item, Separator } from "@smui/list";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
</script>

<Separator />
<Item on:SMUI:action={() => dispatch("click")}>
  <slot />
</Item>
