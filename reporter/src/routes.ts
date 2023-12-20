import TracePage from "./pages/trace/TracePage.svelte";
import NotFound from "./pages/NotFound.svelte";
import TestDetailPage from "./pages/test_detail/TestDetailPage.svelte";
import TestListPage from "./pages/test_list/TestListPage.svelte";
import PropagationTestDetailPage from "./pages/propagation_test_detail/PropagationTestDetailPage.svelte";
import UnpropagatedTracePage from "./pages/unpropagated_trace/UnpropagatedTracePage.svelte";

export const routes = {
  "/": TestListPage,
  "/test/:testId": TestDetailPage,
  "/test/:testId/trace/:traceId": TracePage,
  "/propagation_test": PropagationTestDetailPage,
  "/propagation_test/unpropagated/:traceId": UnpropagatedTracePage,
  "*": NotFound,
};
