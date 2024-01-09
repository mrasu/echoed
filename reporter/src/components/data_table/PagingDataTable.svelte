<script lang="ts" generics="T">
  import DataTable, { Body, Pagination } from "@smui/data-table";
  import IconButton from "@smui/icon-button";
  import { createEventDispatcher } from "svelte";

  export let items: T[];

  const dispatch = createEventDispatcher<{ pageChanged: number }>();

  const rowsPerPage = 50;
  let currentPage = 0;
  $: start = currentPage * rowsPerPage;
  $: end = Math.min(start + rowsPerPage, items.length);
  $: lastPage = Math.max(Math.ceil(items.length / rowsPerPage) - 1, 0);

  const onPageChanged = () => {
    dispatch("pageChanged", currentPage);
  };

  const goNextPage = () => {
    currentPage++;
    onPageChanged();
  };

  const goPreviousPage = () => {
    currentPage--;
    onPageChanged();
  };

  const goFirstPage = () => {
    currentPage = 0;
    onPageChanged();
  };

  const goLastPage = () => {
    currentPage = lastPage;
    onPageChanged();
  };
</script>

<DataTable {...$$restProps}>
  <slot name="head" />

  <Body>
    {#each items.slice(start, end) as item}
      <slot name="row" prop={item} />
    {/each}
  </Body>

  <Pagination slot="paginate">
    <svelte:fragment slot="total">
      {start + 1}-{end} of {items.length}
    </svelte:fragment>

    <IconButton
      class="material-icons"
      action="first-page"
      title="First page"
      on:click={goFirstPage}
      disabled={currentPage === 0}>first_page</IconButton
    >
    <IconButton
      class="material-icons"
      action="prev-page"
      title="Prev page"
      on:click={goPreviousPage}
      disabled={currentPage === 0}>chevron_left</IconButton
    >
    <IconButton
      class="material-icons"
      action="next-page"
      title="Next page"
      on:click={goNextPage}
      disabled={currentPage === lastPage}>chevron_right</IconButton
    >
    <IconButton
      class="material-icons"
      action="last-page"
      title="Last page"
      on:click={goLastPage}
      disabled={currentPage === lastPage}>last_page</IconButton
    >
  </Pagination>
</DataTable>
