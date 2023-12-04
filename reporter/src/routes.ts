import TracePage from "./pages/trace/TracePage.svelte";
import NotFound from "./pages/NotFound.svelte";
import TestDetailPage from "./pages/test_detail/TestDetailPage.svelte";
import TestListPage from "./pages/test_list/TestListPage.svelte";

export const routes = {
  "/": TestListPage,
  "/test/:testId": TestDetailPage,
  "/test/:testId/trace/:traceId": TracePage,
  "*": NotFound,
};
