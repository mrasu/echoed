import type {
  ISpan,
  ITestInfo,
  IFetch,
  ILogRecord,
} from "./types/tobikura_param";

// prettier-ignore
const spans: ISpan[] = [
  {"traceId":"YUMtSIxXQHea1DTgS+G2zg==","spanId":"5cPop0hvHRI=","parentSpanId":"D1MPXqMhokg=","name":"oteldemo.CartService/GetCart","kind":"SPAN_KIND_SERVER","startTimeUnixNano":"1701329056911461100","endTimeUnixNano":"1701329056911919500","attributes":[{"key":"net.host.name","value":{"stringValue":"cartservice"}},{"key":"net.host.port","value":{"intValue":"7070"}},{"key":"http.method","value":{"stringValue":"POST"}},{"key":"http.scheme","value":{"stringValue":"http"}},{"key":"http.target","value":{"stringValue":"/oteldemo.CartService/GetCart"}},{"key":"http.url","value":{"stringValue":"http://cartservice:7070/oteldemo.CartService/GetCart"}},{"key":"http.flavor","value":{"stringValue":"2.0"}},{"key":"http.user_agent","value":{"stringValue":"grpc-node-js/1.9.9"}},{"key":"app.user.id","value":{"stringValue":"1de96255-169b-40e2-b972-4461d30e654c"}},{"key":"app.cart.items.count","value":{"intValue":"0"}},{"key":"http.status_code","value":{"intValue":"200"}},{"key":"rpc.system","value":{"stringValue":"grpc"}},{"key":"net.peer.ip","value":{"stringValue":"::ffff:172.23.0.14"}},{"key":"net.peer.port","value":{"intValue":"38726"}},{"key":"rpc.service","value":{"stringValue":"oteldemo.CartService"}},{"key":"rpc.method","value":{"stringValue":"GetCart"}},{"key":"rpc.grpc.status_code","value":{"intValue":"0"}}],"events":[{"timeUnixNano":"1701329056911581800","name":"Fetch cart"}],"status":{}},
  {"traceId":"YUMtSIxXQHea1DTgS+G2zg==","spanId":"6pHrq4tF3YI=","parentSpanId":"DNlcmOokbH4=","name":"router frontend egress","kind":"SPAN_KIND_CLIENT","startTimeUnixNano":"1701329056908002000","endTimeUnixNano":"1701329056912466000","attributes":[{"key":"http.protocol","value":{"stringValue":"HTTP/1.1"}},{"key":"upstream_address","value":{"stringValue":"172.23.0.14:8080"}},{"key":"peer.address","value":{"stringValue":"172.23.0.14:8080"}},{"key":"component","value":{"stringValue":"proxy"}},{"key":"upstream_cluster","value":{"stringValue":"frontend"}},{"key":"upstream_cluster.name","value":{"stringValue":"frontend"}},{"key":"http.status_code","value":{"stringValue":"200"}},{"key":"response_flags","value":{"stringValue":"-"}}],"status":{}},
  {"traceId":"YUMtSIxXQHea1DTgS+G2zg==","spanId":"DNlcmOokbH4=","parentSpanId":"WPGhzW+NuUc=","name":"ingress","kind":"SPAN_KIND_SERVER","startTimeUnixNano":"1701329056907724000","endTimeUnixNano":"1701329056912491000","attributes":[{"key":"node_id","value":{"stringValue":""}},{"key":"zone","value":{"stringValue":""}},{"key":"guid:x-request-id","value":{"stringValue":"be4db716-62f4-95a8-a998-a78fc925032f"}},{"key":"http.url","value":{"stringValue":"http://localhost:8080/api/cart?sessionId=1de96255-169b-40e2-b972-4461d30e654c&currencyCode=USD"}},{"key":"http.method","value":{"stringValue":"GET"}},{"key":"downstream_cluster","value":{"stringValue":"-"}},{"key":"user_agent","value":{"stringValue":"node"}},{"key":"http.protocol","value":{"stringValue":"HTTP/1.1"}},{"key":"peer.address","value":{"stringValue":"172.23.0.1"}},{"key":"request_size","value":{"stringValue":"0"}},{"key":"response_size","value":{"stringValue":"24"}},{"key":"component","value":{"stringValue":"proxy"}},{"key":"upstream_cluster","value":{"stringValue":"frontend"}},{"key":"upstream_cluster.name","value":{"stringValue":"frontend"}},{"key":"http.status_code","value":{"stringValue":"200"}},{"key":"response_flags","value":{"stringValue":"-"}}],"status":{}},
  {"traceId":"YUMtSIxXQHea1DTgS+G2zg==","spanId":"D1MPXqMhokg=","parentSpanId":"KCo36Ig+kMo=","name":"grpc.oteldemo.CartService/GetCart","kind":"SPAN_KIND_CLIENT","startTimeUnixNano":"1701329056910000000","endTimeUnixNano":"1701329056911955622","attributes":[{"key":"rpc.system","value":{"stringValue":"grpc"}},{"key":"rpc.method","value":{"stringValue":"GetCart"}},{"key":"rpc.service","value":{"stringValue":"oteldemo.CartService"}},{"key":"net.peer.name","value":{"stringValue":"cartservice"}},{"key":"net.peer.port","value":{"intValue":"7070"}},{"key":"rpc.grpc.status_code","value":{"intValue":"0"}}],"status":{}},
  {"traceId":"YUMtSIxXQHea1DTgS+G2zg==","spanId":"KCo36Ig+kMo=","parentSpanId":"6pHrq4tF3YI=","name":"GET","kind":"SPAN_KIND_SERVER","startTimeUnixNano":"1701329056908000000","endTimeUnixNano":"1701329056911911104","attributes":[{"key":"http.url","value":{"stringValue":"http://localhost:8080/api/cart?sessionId=1de96255-169b-40e2-b972-4461d30e654c&currencyCode=USD"}},{"key":"http.host","value":{"stringValue":"localhost:8080"}},{"key":"net.host.name","value":{"stringValue":"localhost"}},{"key":"http.method","value":{"stringValue":"GET"}},{"key":"http.scheme","value":{"stringValue":"http"}},{"key":"http.target","value":{"stringValue":"/api/cart?sessionId=1de96255-169b-40e2-b972-4461d30e654c&currencyCode=USD"}},{"key":"http.user_agent","value":{"stringValue":"node"}},{"key":"http.flavor","value":{"stringValue":"1.1"}},{"key":"net.transport","value":{"stringValue":"ip_tcp"}},{"key":"app.session.id","value":{"stringValue":"1de96255-169b-40e2-b972-4461d30e654c"}},{"key":"http.status_code","value":{"intValue":"200"}},{"key":"net.host.ip","value":{"stringValue":"::ffff:172.23.0.14"}},{"key":"net.host.port","value":{"intValue":"8080"}},{"key":"net.peer.ip","value":{"stringValue":"::ffff:172.23.0.15"}},{"key":"net.peer.port","value":{"intValue":"37226"}},{"key":"http.status_text","value":{"stringValue":"OK"}}],"status":{}},
  {"traceId":"YUMtSIxXQHea1DTgS+G2zg==","spanId":"l4X+D34/1Ts=","parentSpanId":"5cPop0hvHRI=","name":"HGET","kind":"SPAN_KIND_CLIENT","startTimeUnixNano":"1701329056911646700","endTimeUnixNano":"1701329056911865800","attributes":[{"key":"db.system","value":{"stringValue":"redis"}},{"key":"db.redis.flags","value":{"stringValue":"None"}},{"key":"db.statement","value":{"stringValue":"HGET 1de96255-169b-40e2-b972-4461d30e654c"}},{"key":"net.peer.name","value":{"stringValue":"redis-cart"}},{"key":"net.peer.port","value":{"intValue":"6379"}},{"key":"db.redis.database_index","value":{"intValue":"0"}},{"key":"peer.service","value":{"stringValue":"redis-cart:6379"}}],"events":[{"timeUnixNano":"1701329056911658900","name":"Enqueued"},{"timeUnixNano":"1701329056911667800","name":"Sent"},{"timeUnixNano":"1701329056911864700","name":"ResponseReceived"}],"status":{}},
  {"traceId":"ztGplbofNomvXRjV4xq+8A==","spanId":"hXoT8l8qfqI=","parentSpanId":"KIC4XetKGOM=","name":"router frontend egress","kind":"SPAN_KIND_CLIENT","startTimeUnixNano":"1701329063983316000","endTimeUnixNano":"1701329063991902000","attributes":[{"key":"http.protocol","value":{"stringValue":"HTTP/1.1"}},{"key":"upstream_address","value":{"stringValue":"172.23.0.14:8080"}},{"key":"peer.address","value":{"stringValue":"172.23.0.14:8080"}},{"key":"component","value":{"stringValue":"proxy"}},{"key":"upstream_cluster","value":{"stringValue":"frontend"}},{"key":"upstream_cluster.name","value":{"stringValue":"frontend"}},{"key":"http.status_code","value":{"stringValue":"200"}},{"key":"response_flags","value":{"stringValue":"-"}}],"status":{}},
  {"traceId":"ztGplbofNomvXRjV4xq+8A==","spanId":"KIC4XetKGOM=","parentSpanId":"","name":"ingress","kind":"SPAN_KIND_SERVER","startTimeUnixNano":"1701329063983177000","endTimeUnixNano":"1701329063991922000","attributes":[{"key":"node_id","value":{"stringValue":""}},{"key":"zone","value":{"stringValue":""}},{"key":"guid:x-request-id","value":{"stringValue":"2b094ff0-f36f-9b35-bcc2-aae60fe7e5f6"}},{"key":"http.url","value":{"stringValue":"http://frontendproxy:8080/"}},{"key":"http.method","value":{"stringValue":"GET"}},{"key":"downstream_cluster","value":{"stringValue":"-"}},{"key":"user_agent","value":{"stringValue":"Go-http-client/1.1"}},{"key":"http.protocol","value":{"stringValue":"HTTP/1.1"}},{"key":"peer.address","value":{"stringValue":"172.23.0.2"}},{"key":"request_size","value":{"stringValue":"0"}},{"key":"response_size","value":{"stringValue":"4829"}},{"key":"component","value":{"stringValue":"proxy"}},{"key":"upstream_cluster","value":{"stringValue":"frontend"}},{"key":"upstream_cluster.name","value":{"stringValue":"frontend"}},{"key":"http.status_code","value":{"stringValue":"200"}},{"key":"response_flags","value":{"stringValue":"-"}}],"status":{}}
]

// prettier-ignore
const logs: ILogRecord[] = [
  { "traceId": "ztGplbofNomvXRjV4xq+8A==", "spanId": "FvhwYNsB0kg=", "observedTimeUnixNano": "1701772879373960700" , "timeUnixNano": "1701772879373960700", "severityNumber": "SEVERITY_NUMBER_INFO", "severityText": "Information", "body": { "stringValue": "GetCartAsync called with userId={userId}" }, "attributes": [ { "key": "userId", "value": { "stringValue": "aaaaaaaaa" } } ], "flags": 1},
  { "traceId": "YUMtSIxXQHea1DTgS+G2zg==", "spanId": "C4od3kJX4uw=", "observedTimeUnixNano": "1701772879395473100", "timeUnixNano": "1701772879395473100", "severityNumber": "SEVERITY_NUMBER_INFO", "severityText": "Information", "body": { "stringValue": "GetCartAsync called with userId={userId}" }, "attributes": [ { "key": "userId", "value": { "stringValue": "aaaaaaaaa" } } ], "flags": 1},
  { "traceId": "YUMtSIxXQHea1DTgS+G2zg==", "spanId": "UGnO7nyppjE=", "observedTimeUnixNano": "1701772879404177300" , "timeUnixNano": "1701772879404177300", "severityNumber": "SEVERITY_NUMBER_INFO", "severityText": "Information", "body": { "stringValue": "GetCartAsync called with userId={userId}" }, "attributes": [ { "key": "userId", "value": { "stringValue": "aaaaaaaaa" } } ], "flags": 1 }
]

// prettier-ignore
const fetches: IFetch[] = [
  {
    "traceId": "YUMtSIxXQHea1DTgS+G2zg==",
    "request": {
      "url": "http://localhost:8080/api/cart?sessionId=aaaaaaaaa&currencyCode=USD",
      "method": "GET"
    },
    "response": {
      "status": 200,
      "body": "{}"
    }
  },
  {
    "traceId": "ztGplbofNomvXRjV4xq+8A==",
    "request": {
      "url": "http://localhost:8080/api/cart?sessionId=aaaaaaaaa&currencyCode=USD",
      "method": "GET"
    },
    "response": {
      "status": 200,
      "body": "{}"
    }
  }
]

// prettier-ignore
const testInfos: ITestInfo[] = [
  {
    testId: "0",
    file: "api/buyItem.test.ts",
    name: "buy items / simple",
    status: "passed",
    orderedTraceIds: [
      "YUMtSIxXQHea1DTgS+G2zg==",
      "ztGplbofNomvXRjV4xq+8A==",
    ],
    fetches: fetches,
    spans: spans,
    logRecords: logs,
  },
];

window.__tobikura_param__ = {
  testInfos: testInfos,
};
