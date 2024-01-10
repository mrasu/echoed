import TracePage from "./pages/test/trace/TracePage.svelte";
import NotFound from "./pages/NotFound.svelte";
import TestDetailPage from "./pages/test/TestDetailPage.svelte";
import TestListPage from "./pages/test_list/TestListPage.svelte";
import PropagationTestPage from "./pages/propagation_test/PropagationTestPage.svelte";
import UnpropagatedTracePage from "./pages/propagation_test/unpropagated/trace/UnpropagatedTracePage.svelte";
import CoveragePage from "./pages/coverage/CoveragePage.svelte";
import CoverageServicePage from "./pages/coverage/service/CoverageServicePage.svelte";
import CoverageUnmeasuredPage from "./pages/coverage/unmeasured/CoverageUnmeasuredPage.svelte";
import CoverageUnmeasuredTracePage from "./pages/coverage/unmeasured/trace/CoverageUnmeasuredTracePage.svelte";
import UndocumentedHttpOperationPage from "./pages/coverage/service/undocumented/http/operation/UndocumentedHttpOperationPage.svelte";
import UndocumentedHttpTracePage from "./pages/coverage/service/undocumented/http/operation/trace/UndocumentedHttpTracePage.svelte";
import UndocumentedRpcMethodPage from "./pages/coverage/service/undocumented/rpc/method/UndocumentedRpcMethodPage.svelte";
import UndocumentedRpcMethodTracePage from "./pages/coverage/service/undocumented/rpc/method/trace/UndocumentedRpcMethodTracePage.svelte";

export const routes = {
  "/": TestListPage,
  "/test/:testId": TestDetailPage,
  "/test/:testId/trace/:traceId": TracePage,
  "/propagation_test": PropagationTestPage,
  "/propagation_test/unpropagated/:traceId": UnpropagatedTracePage,
  "/coverage": CoveragePage,
  "/coverage/:fullServiceName": CoverageServicePage,
  "/coverage/:fullServiceName/undocumented/http/operation/:method/:path":
    UndocumentedHttpOperationPage,
  "/coverage/:fullServiceName/undocumented/http/operation/:method/:path/trace/:traceId":
    UndocumentedHttpTracePage,
  "/coverage/:fullServiceName/undocumented/rpc/method/:service/:method":
    UndocumentedRpcMethodPage,
  "/coverage/:fullServiceName/undocumented/rpc/method/:service/:method/trace/:traceId":
    UndocumentedRpcMethodTracePage,
  "/coverage/:fullServiceName/unmeasured": CoverageUnmeasuredPage,
  "/coverage/:fullServiceName/unmeasured/trace/:traceId":
    CoverageUnmeasuredTracePage,
  "*": NotFound,
};
