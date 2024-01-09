import TracePage from "./pages/trace/TracePage.svelte";
import NotFound from "./pages/NotFound.svelte";
import TestDetailPage from "./pages/test_detail/TestDetailPage.svelte";
import TestListPage from "./pages/test_list/TestListPage.svelte";
import PropagationTestDetailPage from "./pages/propagation_test_detail/PropagationTestDetailPage.svelte";
import UnpropagatedTracePage from "./pages/unpropagated_trace/UnpropagatedTracePage.svelte";
import CoveragePage from "./pages/coverage/CoveragePage.svelte";
import ServiceCoveragePage from "./pages/service_coverage/ServiceCoveragePage.svelte";
import CoverageUnmeasuredServicePage from "./pages/coverage_unmeasured_service/CoverageUnmeasuredServicePage.svelte";
import CoverageUnmeasuredTracePage from "./pages/coverage_unmeasured_trace/CoverageUnmeasuredTracePage.svelte";
import UndocumentedHttpOperationPage from "./pages/undocumented_http_operation/UndocumentedHttpOperationPage.svelte";
import UndocumentedHttpTracePage from "./pages/undocumented_http_trace/UndocumentedHttpTracePage.svelte";
import UndocumentedRpcMethodPage from "./pages/undocumented_rpc_method/UndocumentedRpcMethodPage.svelte";
import UndocumentedRpcMethodTracePage from "./pages/undocumented_rpc_method_trace/UndocumentedRpcMethodTracePage.svelte";

export const routes = {
  "/": TestListPage,
  "/test/:testId": TestDetailPage,
  "/test/:testId/trace/:traceId": TracePage,
  "/propagation_test": PropagationTestDetailPage,
  "/propagation_test/unpropagated/:traceId": UnpropagatedTracePage,
  "/coverage": CoveragePage,
  "/coverage/:fullServiceName": ServiceCoveragePage,
  "/coverage/:fullServiceName/undocumented/http/operation/:method/:path":
    UndocumentedHttpOperationPage,
  "/coverage/:fullServiceName/undocumented/http/operation/:method/:path/trace/:traceId":
    UndocumentedHttpTracePage,
  "/coverage/:fullServiceName/undocumented/rpc/method/:service/:method":
    UndocumentedRpcMethodPage,
  "/coverage/:fullServiceName/undocumented/rpc/method/:service/:method/trace/:traceId":
    UndocumentedRpcMethodTracePage,
  "/coverage/:fullServiceName/unmeasured": CoverageUnmeasuredServicePage,
  "/coverage/:fullServiceName/unmeasured/trace/:traceId":
    CoverageUnmeasuredTracePage,
  "*": NotFound,
};
