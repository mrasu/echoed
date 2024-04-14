import type {
  ITestInfo,
  IFetch,
  ITrace,
  ICoverageInfo,
  IPropagationFailedTrace,
} from "@shared/type/echoedParam";

// prettier-ignore
const fetches: IFetch[] = [
  {
    "traceId": "61432d488c5740779ad434e04be1b6ce",
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
    "traceId": "ced1a995ba1f3689af5d18d5e31abef0",
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
    "traceId": "ced1a995ba1f3689af5d18d5e31abef1",
    "request": {
      "url": "http://localhost:8080/api/failed",
      "method": "GET"
    },
    "response": {
      failed: true,
      reason: "Test ended"
    }
  }
]

// prettier-ignore
const testInfos: ITestInfo[] = [
  { testId: "0", file: "api/buyItem.test.ts", name: "buy items / simple1", startTimeMillis: 1701873955941, status: "passed", orderedTraceIds: ["61432d488c5740779ad434e04be1b6ce", "ced1a995ba1f3689af5d18d5e31abef0", "ced1a995ba1f3689af5d18d5e31abeff"], fetches: fetches, duration: 1234, failureDetails: [], failureMessages: [] },
  { testId: "1", file: "api/buyItem.test.ts", name: "failed test2", startTimeMillis: 1701873955942, status: "failed", orderedTraceIds: ["3030303030303030", "ced1a995ba1f3689af5d18d5e31abef1"], fetches: fetches,
    failureDetails: [
        "{\"cause\":{\"errno\":-111,\"code\":\"ECONNREFUSED\",\"syscall\":\"connect\",\"address\":\"127.0.0.1\",\"port\":8080}}"
    ],
        "failureMessages": [
        "TypeError: fetch failed\n    at Object.fetch (node:internal/deps/undici/undici:11730:11)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at callAndExtractFromFetch (/path/to/dist/index.js:40341:22)\n    at /path/to/dist/index.js:40272:37",
        "TypeError: fetch failed\n    at Object.fetch (node:internal/deps/undici/undici:11730:11)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at callAndExtractFromFetch (/path/to/dist/index.js:40341:22)\n    at /path/to/dist/index.js:40272:37",
    ],
  },
  { testId: "2", file: "api/5buyItem.test.ts", name: "skipped test3", startTimeMillis: 1701873955943, status: "skipped", orderedTraceIds: [], fetches: fetches, duration: 1234, failureDetails: [], failureMessages: [] },
  { testId: "4", file: "api/333buyItem.test.ts", name: "todo test5", startTimeMillis: 1701873955945, status: "todo", orderedTraceIds: [], fetches: fetches, duration: 1234, failureDetails: [], failureMessages: [] },
  { testId: "5", file: "api/333buyItem.test.ts", name: "disabled test6", startTimeMillis: 1701873955946, status: "disabled", orderedTraceIds: [], fetches: fetches, duration: 1234, failureDetails: [], failureMessages: [] },
  { testId: "6", file: "api/buyItem.test.ts", name: "focused test7", startTimeMillis: 1701873955947, status: "focused", orderedTraceIds: [], fetches: fetches, duration: 1234, failureDetails: [], failureMessages: [] },
  { testId: "3", file: "api/buyItem.test.ts", name: "failing test4", startTimeMillis: 1701873955944, status: "failed", orderedTraceIds: [], fetches: fetches, duration: 1234,
    failureDetails: [
      "{\"matcherResult\":{\"actual\":10,\"expected\":9,\"message\":\"\\u001b[2mexpect(\\u001b[22m\\u001b[31mreceived\\u001b[39m\\u001b[2m).\\u001b[22mtoBe\\u001b[2m(\\u001b[22m\\u001b[32mexpected\\u001b[39m\\u001b[2m) // Object.is equality\\u001b[22m\\n\\nExpected: \\u001b[32m9\\u001b[39m\\nReceived: \\u001b[31m10\\u001b[39m\",\"name\":\"toBe\",\"pass\":false}}"
    ],
    failureMessages: [
      `Error: \u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoBe\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m) // Object.is equality\u001b[22m\n\nExpected: \u001b[32m9\u001b[39m\nReceived: \u001b[31m10\u001b[39m\n    at /path/to/example/test/products.test.ts:19:29\n    at Generator.next (<anonymous>)\n    at fulfilled (/path/to/example/test/products.test.ts:5:58)`
    ],
  },
];

// prettier-ignore
const propagationFailedTraces: IPropagationFailedTrace[] = [
  {
    "traceId": "8e8cfbe2d78dbe17cce199392b299569",
  },
  {
    "traceId": "e256125a6a35998fc2bd11bcc2218d25",
  }
];

// prettier-ignore
const coverageInfos: ICoverageInfo[] = [
  {
    serviceName: "frontend",
    serviceNamespace: "opentelemetry-demo",
    httpCoverage: {
      operationCoverages: [
        { path: "/cart", method: "delete", passed: true },
        { path: "/cart", method: "put", passed: true },
        { path: "/cart", method: "post", passed: false },
        { path: "/cart", method: "get", passed: false },
        { path: "/products/{productId}", method: "get", passed: false },
        { path: "/products/{productId}", method: "post", passed: true },
        { path: "/products", method: "get", passed: true },
        { path: "/checkout", method: "post", passed: true },
      ],
      undocumentedOperations: [
        {"path": "/cart1", "method": "post", "traceIds": ["61432d488c5740779ad434e04be1b6ce"]},
        {"path": "/cart1", "method": "delete", "traceIds": ["61432d488c5740779ad434e04be1b6ce"]},
        {"path": "/cart1", "method": "get", "traceIds": ["61432d488c5740779ad434e04be1b6ce"].concat(Array(100).fill("ced1a995ba1f3689af5d18d5e31abef0"))},
        {"path": "/cart2", "method": "get", "traceIds": ["61432d488c5740779ad434e04be1b6ce"]},
        {"path": "/cart3", "method": "get", "traceIds": ["61432d488c5740779ad434e04be1b6ce"]},
        {"path": "/cart4", "method": "get", "traceIds": ["61432d488c5740779ad434e04be1b6ce"]},
        {"path": "/cart5", "method": "get", "traceIds": ["61432d488c5740779ad434e04be1b6ce"]},
      ],
    }
  },
  {
    serviceName: "alpha-service",
    serviceNamespace: "opentelemetry-demo",
    httpCoverage: {
      operationCoverages: [
        { path: "/cart", method: "delete", passed: true },
        { path: "/cart", method: "put", passed: true },
      ],
      undocumentedOperations: [],
    }
  },
  {
    serviceName: "foo-bar",
    httpCoverage: {
      operationCoverages: [
        { path: "/cart", method: "delete", passed: false },
        { path: "/cart", method: "put", passed: true },
      ],
      undocumentedOperations: [],
    }
  },
  {
    serviceName: "alpha-z-service",
    serviceNamespace: "opentelemetry-demo",
    httpCoverage: {
      operationCoverages: [
        { path: "/cart", method: "get", passed: true},
        { path: "/cart", method: "delete", passed: false},
        { path: "/cart", method: "put", passed: false},
      ],
      undocumentedOperations: [],
    }
  },
  {
    serviceName: "cartservice",
    serviceNamespace: "opentelemetry-demo",
    rpcCoverage: {
      methodCoverages: [
        { service: "oteldemo.CartService", method: "AddItem", passed: true },
        { service: "oteldemo.CartService", method: "GetCart", passed: true },
        { service: "oteldemo.CartService", method: "EmptyCart", passed: false },
        { service: "oteldemo.RecommendationService", method: "ListRecommendations", passed: false },
        { service: "oteldemo.RecommendationService", method: "AddRecommendations", passed: false }
      ],
      undocumentedMethods: [
        { service: "oteldemo.CartService", method: "GetCart3", traceIds: ["61432d488c5740779ad434e04be1b6ce"]},
        { service: "oteldemo.CartService", method: "GetCart2", traceIds: ["61432d488c5740779ad434e04be1b6ce"]},
        { service: "oteldemo.CartService", method: "GetCart1", traceIds: ["61432d488c5740779ad434e04be1b6ce"].concat(Array(100).fill("ced1a995ba1f3689af5d18d5e31abef0"))},
        { service: "oteldemo.CartService", method: "GetCart4", traceIds: ["61432d488c5740779ad434e04be1b6ce"]},
        { service: "CartService", method: "GetCart5", traceIds: ["61432d488c5740779ad434e04be1b6ce"]},
        { service: "CartService", method: "GetCart6", traceIds: ["61432d488c5740779ad434e04be1b6ce"]},
        { service: "CartService", method: "GetCart7", traceIds: ["61432d488c5740779ad434e04be1b6ce"]},
      ]
    }
  },
  {
    serviceName: "super long service name aaaaa aaaaa aaaaa aaaaa aaaaa aaaaa aaaaa aaaaa aaaaa aaaaa aaaaa aaaaa 1111",
    httpCoverage: {
      operationCoverages: [
        { path: "/cart", method: "delete", passed: false },
        { path: "/cart", method: "put", passed: false },
      ],
      undocumentedOperations: [],
    },
  },
  {
    serviceName: "emailservice",
    serviceNamespace: "opentelemetry-demo",
    unmeasuredTraceIds: ["1256125a6a35998fc2bd11bcc2218d25", "e256125a6a35998fc2bd11bcc2218d25", "e256125a6a35998fc2bd11bcc2218d25", "e256125a6a35998fc2bd11bcc2218d25"],
  },
  {
    serviceName: "foo",
    unmeasuredTraceIds: ["e256125a6a35998fc2bd11bcc2218d25"].concat(Array(100).fill("1256125a6a35998fc2bd11bcc2218d25")),
  },
];

// prettier-ignore
const traces: ITrace[] = [
  {
    traceId: "61432d488c5740779ad434e04be1b6ce",
    spans: [
      {
        "traceId":"61432d488c5740779ad434e04be1b6ce","spanId":"e5c3e8a7486f1d12","parentSpanId":"0f530f5ea321a248","name":"oteldemo.CartService/GetCart","kind":"SPAN_KIND_SERVER","startTimeUnixNano":"1701329056911461100","endTimeUnixNano":"1701329056911919500","attributes":[{"key":"net.host.name","value":{"stringValue":"cartservice"}},{"key":"net.host.port","value":{"intValue":"7070"}},{"key":"http.method","value":{"stringValue":"POST"}},{"key":"http.scheme","value":{"stringValue":"http"}},{"key":"http.target","value":{"stringValue":"/oteldemo.CartService/GetCart"}},{"key":"http.url","value":{"stringValue":"http://cartservice:7070/oteldemo.CartService/GetCart"}},{"key":"http.flavor","value":{"stringValue":"2.0"}},{"key":"http.user_agent","value":{"stringValue":"grpc-node-js/1.9.9"}},{"key":"app.user.id","value":{"stringValue":"1de96255-169b-40e2-b972-4461d30e654c"}},{"key":"app.cart.items.count","value":{"intValue":"0"}},{"key":"http.status_code","value":{"intValue":"200"}},{"key":"rpc.system","value":{"stringValue":"grpc"}},{"key":"net.peer.ip","value":{"stringValue":"::ffff:172.23.0.14"}},{"key":"net.peer.port","value":{"intValue":"38726"}},{"key":"rpc.service","value":{"stringValue":"oteldemo.CartService"}},{"key":"rpc.method","value":{"stringValue":"GetCart"}},{"key":"rpc.grpc.status_code","value":{"intValue":"0"}}],"events":[{"timeUnixNano":"1701329056911581800","name":"Fetch cart"}],"status":{},
        "resource": {"attributes": [{"key": "container.id","value": {"stringValue": "d6474f5d10ad52f2ca27a08b97aa48a8ef5e2438525ea472e3c15b10143cdac5"}},{"key": "service.name","value": {"stringValue": "cartservice"}},{"key": "service.namespace","value": {"stringValue": "opentelemetry-demo"}},{"key": "telemetry.sdk.name","value": {"stringValue": "opentelemetry"}},{"key": "telemetry.sdk.language","value": {"stringValue": "dotnet"}},{"key": "telemetry.sdk.version","value": {"stringValue": "1.6.0"}}]},
        "scope": {"name": "OpenTelemetry.Instrumentation.AspNetCore","version": "1.0.0.0"}
      },
      {
        "traceId":"61432d488c5740779ad434e04be1b6ce","spanId":"0cd95c98ea246c7e","parentSpanId":"58f1a1cd6f8db947","name":"ingress","kind":"SPAN_KIND_SERVER","startTimeUnixNano":"1701329056907724000","endTimeUnixNano":"1701329056912491000","attributes":[{"key":"node_id","value":{"stringValue":""}},{"key":"zone","value":{"stringValue":""}},{"key":"guid:x-request-id","value":{"stringValue":"be4db716-62f4-95a8-a998-a78fc925032f"}},{"key":"http.url","value":{"stringValue":"http://localhost:8080/api/cart?sessionId=1de96255-169b-40e2-b972-4461d30e654c&currencyCode=USD"}},{"key":"http.method","value":{"stringValue":"GET"}},{"key":"downstream_cluster","value":{"stringValue":"-"}},{"key":"user_agent","value":{"stringValue":"node"}},{"key":"http.protocol","value":{"stringValue":"HTTP/1.1"}},{"key":"peer.address","value":{"stringValue":"172.23.0.1"}},{"key":"request_size","value":{"stringValue":"0"}},{"key":"response_size","value":{"stringValue":"24"}},{"key":"component","value":{"stringValue":"proxy"}},{"key":"upstream_cluster","value":{"stringValue":"frontend"}},{"key":"upstream_cluster.name","value":{"stringValue":"frontend"}},{"key":"http.status_code","value":{"stringValue":"200"}},{"key":"response_flags","value":{"stringValue":"-"}}],"status":{},
        "resource": {"attributes": [{"key": "service.name","value": {"stringValue": "frontend-proxy"}}]},
        "scope": {}
      },
      {
        "traceId":"61432d488c5740779ad434e04be1b6ce","spanId":"0f530f5ea321a248","parentSpanId":"282a37e8883e90ca","name":"grpc.oteldemo.CartService/GetCart","kind":"SPAN_KIND_CLIENT","startTimeUnixNano":"1701329056910000000","endTimeUnixNano":"1701329056911955622","attributes":[{"key":"rpc.system","value":{"stringValue":"grpc"}},{"key":"rpc.method","value":{"stringValue":"GetCart"}},{"key":"rpc.service","value":{"stringValue":"oteldemo.CartService"}},{"key":"net.peer.name","value":{"stringValue":"cartservice"}},{"key":"net.peer.port","value":{"intValue":"7070"}},{"key":"rpc.grpc.status_code","value":{"intValue":"0"}}],"status":{},
        "resource": {"attributes": [{"key": "service.name","value": {"stringValue": "frontend"}},{"key": "telemetry.sdk.language","value": {"stringValue": "nodejs"}},{"key": "telemetry.sdk.name","value": {"stringValue": "opentelemetry"}},{"key": "telemetry.sdk.version","value": {"stringValue": "1.18.1"}},{"key": "service.namespace","value": {"stringValue": "opentelemetry-demo"}},{"key": "host.name","value": {"stringValue": "c2ba82b8c871"}},{"key": "host.arch","value": {"stringValue": "amd64"}},{"key": "os.type","value": {"stringValue": "linux"}},{"key": "os.version","value": {"stringValue": "6.2.0-37-generic"}},{"key": "process.pid","value": {"intValue": "17"}},{"key": "process.executable.name","value": {"stringValue": "node"}},{"key": "process.executable.path","value": {"stringValue": "/usr/local/bin/node"}},{"key": "process.command_args","value": {"arrayValue": {"values": [{"stringValue": "/usr/local/bin/node"},{"stringValue": "--require"},{"stringValue": "./Instrumentation.js"},{"stringValue": "/app/server.js"}]}}},{"key": "process.runtime.version","value": {"stringValue": "18.18.2"}},{"key": "process.runtime.name","value": {"stringValue": "nodejs"}},{"key": "process.runtime.description","value": {"stringValue": "Node.js"}},{"key": "process.command","value": {"stringValue": "/app/server.js"}},{"key": "process.owner","value": {"stringValue": "nextjs"}}]},
        "scope": {"name": "@opentelemetry/instrumentation-grpc","version": "0.44.0"}
      },
      {
        "traceId":"61432d488c5740779ad434e04be1b6ce","spanId":"282a37e8883e90ca","parentSpanId":"ea91ebab8b45dd82","name":"GET","kind":"SPAN_KIND_SERVER","startTimeUnixNano":"1701329056908000000","endTimeUnixNano":"1701329056911911104","attributes":[{"key":"http.url","value":{"stringValue":"http://localhost:8080/api/cart?sessionId=1de96255-169b-40e2-b972-4461d30e654c&currencyCode=USD"}},{"key":"http.host","value":{"stringValue":"localhost:8080"}},{"key":"net.host.name","value":{"stringValue":"localhost"}},{"key":"http.method","value":{"stringValue":"GET"}},{"key":"http.scheme","value":{"stringValue":"http"}},{"key":"http.target","value":{"stringValue":"/api/cart?sessionId=1de96255-169b-40e2-b972-4461d30e654c&currencyCode=USD"}},{"key":"http.user_agent","value":{"stringValue":"node"}},{"key":"http.flavor","value":{"stringValue":"1.1"}},{"key":"net.transport","value":{"stringValue":"ip_tcp"}},{"key":"app.session.id","value":{"stringValue":"1de96255-169b-40e2-b972-4461d30e654c"}},{"key":"http.status_code","value":{"intValue":"200"}},{"key":"net.host.ip","value":{"stringValue":"::ffff:172.23.0.14"}},{"key":"net.host.port","value":{"intValue":"8080"}},{"key":"net.peer.ip","value":{"stringValue":"::ffff:172.23.0.15"}},{"key":"net.peer.port","value":{"intValue":"37226"}},{"key":"http.status_text","value":{"stringValue":"OK"}}],"status":{},
        "resource": {"attributes": [{"key": "service.name","value": {"stringValue": "frontend"}},{"key": "telemetry.sdk.language","value": {"stringValue": "nodejs"}},{"key": "telemetry.sdk.name","value": {"stringValue": "opentelemetry"}},{"key": "telemetry.sdk.version","value": {"stringValue": "1.18.1"}},{"key": "service.namespace","value": {"stringValue": "opentelemetry-demo"}},{"key": "host.name","value": {"stringValue": "c2ba82b8c871"}},{"key": "host.arch","value": {"stringValue": "amd64"}},{"key": "os.type","value": {"stringValue": "linux"}},{"key": "os.version","value": {"stringValue": "6.2.0-37-generic"}},{"key": "process.pid","value": {"intValue": "17"}},{"key": "process.executable.name","value": {"stringValue": "node"}},{"key": "process.executable.path","value": {"stringValue": "/usr/local/bin/node"}},{"key": "process.command_args","value": {"arrayValue": {"values": [{"stringValue": "/usr/local/bin/node"},{"stringValue": "--require"},{"stringValue": "./Instrumentation.js"},{"stringValue": "/app/server.js"}]}}},{"key": "process.runtime.version","value": {"stringValue": "18.18.2"}},{"key": "process.runtime.name","value": {"stringValue": "nodejs"}},{"key": "process.runtime.description","value": {"stringValue": "Node.js"}},{"key": "process.command","value": {"stringValue": "/app/server.js"}},{"key": "process.owner","value": {"stringValue": "nextjs"}}]},
        "scope": {"name": "@opentelemetry/instrumentation-http","version": "0.44.0"}
      },
      {
        "traceId":"61432d488c5740779ad434e04be1b6ce","spanId":"9785fe0f7e3fd53b","parentSpanId":"e5c3e8a7486f1d12","name":"HGET","kind":"SPAN_KIND_CLIENT","startTimeUnixNano":"1701329056911646700","endTimeUnixNano":"1701329056911865800","attributes":[{"key":"db.system","value":{"stringValue":"redis"}},{"key":"db.redis.flags","value":{"stringValue":"None"}},{"key":"db.statement","value":{"stringValue":"HGET 1de96255-169b-40e2-b972-4461d30e654c"}},{"key":"net.peer.name","value":{"stringValue":"redis-cart"}},{"key":"net.peer.port","value":{"intValue":"6379"}},{"key":"db.redis.database_index","value":{"intValue":"0"}},{"key":"peer.service","value":{"stringValue":"redis-cart:6379"}}],"events":[{"timeUnixNano":"1701329056911658900","name":"Enqueued"},{"timeUnixNano":"1701329056911667800","name":"Sent"},{"timeUnixNano":"1701329056911864700","name":"ResponseReceived"}],"status":{},
        "resource": {"attributes": [{"key": "container.id","value": {"stringValue": "d6474f5d10ad52f2ca27a08b97aa48a8ef5e2438525ea472e3c15b10143cdac5"}},{"key": "service.name","value": {"stringValue": "cartservice"}},{"key": "service.namespace","value": {"stringValue": "opentelemetry-demo"}},{"key": "telemetry.sdk.name","value": {"stringValue": "opentelemetry"}},{"key": "telemetry.sdk.language","value": {"stringValue": "dotnet"}},{"key": "telemetry.sdk.version","value": {"stringValue": "1.6.0"}}]},
        "scope": {"name": "OpenTelemetry.Instrumentation.StackExchangeRedis","version": "1.0.0.12"}
      },
      {
        "traceId":"61432d488c5740779ad434e04be1b6ce","spanId":"9785fe0f7e3fd53b","parentSpanId":"e5c3e8a7486f1d12","name":"HGET","kind":"SPAN_KIND_CLIENT","startTimeUnixNano":"1701329056911646700","endTimeUnixNano":"1701329056911865800","attributes":[{"key":"db.system","value":{"stringValue":"redis"}},{"key":"db.redis.flags","value":{"stringValue":"None"}},{"key":"db.statement","value":{"stringValue":"HGET 1de96255-169b-40e2-b972-4461d30e654c"}},{"key":"net.peer.name","value":{"stringValue":"redis-cart"}},{"key":"net.peer.port","value":{"intValue":"6379"}},{"key":"db.redis.database_index","value":{"intValue":"0"}},{"key":"peer.service","value":{"stringValue":"redis-cart:6379"}}],"events":[{"timeUnixNano":"1701329056911658900","name":"Enqueued"},{"timeUnixNano":"1701329056911667800","name":"Sent"},{"timeUnixNano":"1701329056911864700","name":"ResponseReceived"}],"status":{},
        "resource": {"attributes": [{"key": "container.id","value": {"stringValue": "d6474f5d10ad52f2ca27a08b97aa48a8ef5e2438525ea472e3c15b10143cdac5"}},{"key": "service.name","value": {"stringValue": "cartservice"}},{"key": "service.namespace","value": {"stringValue": "opentelemetry-demo"}},{"key": "telemetry.sdk.name","value": {"stringValue": "opentelemetry"}},{"key": "telemetry.sdk.language","value": {"stringValue": "dotnet"}},{"key": "telemetry.sdk.version","value": {"stringValue": "1.6.0"}}]},
        "scope": {"name": "OpenTelemetry.Instrumentation.StackExchangeRedis","version": "1.0.0.12"}
      },
      {
        "traceId":"61432d488c5740779ad434e04be1b6ce","spanId":"9785fe0f7e3fd53b","parentSpanId":"e5c3e8a7486f1d12","name":"HGET","kind":"SPAN_KIND_CLIENT","startTimeUnixNano":"1701329056911646700","endTimeUnixNano":"1701329056911865800","attributes":[{"key":"db.system","value":{"stringValue":"redis"}},{"key":"db.redis.flags","value":{"stringValue":"None"}},{"key":"db.statement","value":{"stringValue":"HGET 1de96255-169b-40e2-b972-4461d30e654c"}},{"key":"net.peer.name","value":{"stringValue":"redis-cart"}},{"key":"net.peer.port","value":{"intValue":"6379"}},{"key":"db.redis.database_index","value":{"intValue":"0"}},{"key":"peer.service","value":{"stringValue":"redis-cart:6379"}}],"events":[{"timeUnixNano":"1701329056911658900","name":"Enqueued"},{"timeUnixNano":"1701329056911667800","name":"Sent"},{"timeUnixNano":"1701329056911864700","name":"ResponseReceived"}],"status":{},
        "resource": {"attributes": [{"key": "container.id","value": {"stringValue": "d6474f5d10ad52f2ca27a08b97aa48a8ef5e2438525ea472e3c15b10143cdac5"}},{"key": "service.name","value": {"stringValue": "cartservice"}},{"key": "service.namespace","value": {"stringValue": "opentelemetry-demo"}},{"key": "telemetry.sdk.name","value": {"stringValue": "opentelemetry"}},{"key": "telemetry.sdk.language","value": {"stringValue": "dotnet"}},{"key": "telemetry.sdk.version","value": {"stringValue": "1.6.0"}}]},
        "scope": {"name": "OpenTelemetry.Instrumentation.StackExchangeRedis","version": "1.0.0.12"}
      },
    ],
    logRecords: [
      { "traceId": "61432d488c5740779ad434e04be1b6ce", "spanId": "0b8a1dde4257e2ec", "observedTimeUnixNano": "1701772879395473100", "timeUnixNano": "1701772879395473100", "severityNumber": "SEVERITY_NUMBER_INFO", "severityText": "Information", "body": { "stringValue": "GetCartAsync called with userId={userId}" }, "attributes": [ { "key": "userId", "value": { "stringValue": "aaaaaaaaa" } } ], "flags": 1},
      { "traceId": "61432d488c5740779ad434e04be1b6ce", "spanId": "5069ceee7ca9a631", "observedTimeUnixNano": "1701772879404177300" , "timeUnixNano": "1701772879404177300", "severityNumber": "SEVERITY_NUMBER_INFO", "severityText": "Information", "body": { "stringValue": "GetCartAsync called with userId={userId}" }, "attributes": [ { "key": "userId", "value": { "stringValue": "aaaaaaaaa" } } ], "flags": 1 }
    ]
  },
  {
    traceId: "ced1a995ba1f3689af5d18d5e31abef0",
    spans: [
      {
        "traceId":"ced1a995ba1f3689af5d18d5e31abef0","spanId":"857a13f25f2a7ea2","parentSpanId":"2880b85deb4a18e3","name":"router frontend egress","kind":"SPAN_KIND_CLIENT","startTimeUnixNano":"1701329063983316000","endTimeUnixNano":"1701329063991902000","attributes":[{"key":"http.protocol","value":{"stringValue":"HTTP/1.1"}},{"key":"upstream_address","value":{"stringValue":"172.23.0.14:8080"}},{"key":"peer.address","value":{"stringValue":"172.23.0.14:8080"}},{"key":"component","value":{"stringValue":"proxy"}},{"key":"upstream_cluster","value":{"stringValue":"frontend"}},{"key":"upstream_cluster.name","value":{"stringValue":"frontend"}},{"key":"http.status_code","value":{"stringValue":"200"}},{"key":"response_flags","value":{"stringValue":"-"}}],"status":{},
        "resource": {"attributes": [{"key": "service.name","value": {"stringValue": "frontend-proxy"}}]},
        "scope": {}
      },
      {
        "traceId":"ced1a995ba1f3689af5d18d5e31abef0","spanId":"2880b85deb4a18e3","parentSpanId":"","name":"ingress","kind":"SPAN_KIND_SERVER","startTimeUnixNano":"1701329063983177000","endTimeUnixNano":"1701329063991922000","attributes":[{"key":"node_id","value":{"stringValue":""}},{"key":"zone","value":{"stringValue":""}},{"key":"guid:x-request-id","value":{"stringValue":"2b094ff0-f36f-9b35-bcc2-aae60fe7e5f6"}},{"key":"http.url","value":{"stringValue":"http://frontendproxy:8080/"}},{"key":"http.method","value":{"stringValue":"GET"}},{"key":"downstream_cluster","value":{"stringValue":"-"}},{"key":"user_agent","value":{"stringValue":"Go-http-client/1.1"}},{"key":"http.protocol","value":{"stringValue":"HTTP/1.1"}},{"key":"peer.address","value":{"stringValue":"172.23.0.2"}},{"key":"request_size","value":{"stringValue":"0"}},{"key":"response_size","value":{"stringValue":"4829"}},{"key":"component","value":{"stringValue":"proxy"}},{"key":"upstream_cluster","value":{"stringValue":"frontend"}},{"key":"upstream_cluster.name","value":{"stringValue":"frontend"}},{"key":"http.status_code","value":{"stringValue":"200"}},{"key":"response_flags","value":{"stringValue":"-"}}],"status":{code: "STATUS_CODE_ERROR"},
        "resource": {"attributes": [{"key": "service.name","value": {"stringValue": "frontend-proxy"}}]},
        "scope": {}
      }
    ],
    logRecords: []
  },
  {
    "traceId": "8e8cfbe2d78dbe17cce199392b299569",
    "spans": [
        { "traceId": "8e8cfbe2d78dbe17cce199392b299569", "spanId": "ae9d876958f7176d", "parentSpanId": "714f2d8936746e89", "name": "sinatra.render_template", "kind": "SPAN_KIND_INTERNAL", "startTimeUnixNano": "1702972609914259345", "endTimeUnixNano": "1702972609914336379", "attributes": [ { "key": "sinatra.template_name", "value": { "stringValue": "layout" } } ], "status": {}, "resource": { "attributes": [ { "key": "service.name", "value": { "stringValue": "emailservice" } }, { "key": "process.pid", "value": { "intValue": "1" } }, { "key": "process.command", "value": { "stringValue": "email_server.rb" } }, { "key": "process.runtime.name", "value": { "stringValue": "ruby" } }, { "key": "process.runtime.version", "value": { "stringValue": "3.2.2" } }, { "key": "process.runtime.description", "value": { "stringValue": "ruby 3.2.2 (2023-03-30 revision e51014f9c0) [x86_64-linux]" } }, { "key": "telemetry.sdk.name", "value": { "stringValue": "opentelemetry" } }, { "key": "telemetry.sdk.language", "value": { "stringValue": "ruby" } }, { "key": "telemetry.sdk.version", "value": { "stringValue": "1.3.1" } }, { "key": "service.namespace", "value": { "stringValue": "opentelemetry-demo" } } ] }, "scope": { "name": "OpenTelemetry::Instrumentation::Sinatra", "version": "0.23.2" } },
        { "traceId": "8e8cfbe2d78dbe17cce199392b299569", "spanId": "714f2d8936746e89", "parentSpanId": "1ab2151f776e43e5", "name": "sinatra.render_template", "kind": "SPAN_KIND_INTERNAL", "startTimeUnixNano": "1702972609914175859", "endTimeUnixNano": "1702972609914352238", "attributes": [ { "key": "sinatra.template_name", "value": { "stringValue": "confirmation" } } ], "status": {}, "resource": { "attributes": [ { "key": "service.name", "value": { "stringValue": "emailservice" } }, { "key": "process.pid", "value": { "intValue": "1" } }, { "key": "process.command", "value": { "stringValue": "email_server.rb" } }, { "key": "process.runtime.name", "value": { "stringValue": "ruby" } }, { "key": "process.runtime.version", "value": { "stringValue": "3.2.2" } }, { "key": "process.runtime.description", "value": { "stringValue": "ruby 3.2.2 (2023-03-30 revision e51014f9c0) [x86_64-linux]" } }, { "key": "telemetry.sdk.name", "value": { "stringValue": "opentelemetry" } }, { "key": "telemetry.sdk.language", "value": { "stringValue": "ruby" } }, { "key": "telemetry.sdk.version", "value": { "stringValue": "1.3.1" } }, { "key": "service.namespace", "value": { "stringValue": "opentelemetry-demo" } } ] }, "scope": { "name": "OpenTelemetry::Instrumentation::Sinatra", "version": "0.23.2" } },
        { "traceId": "8e8cfbe2d78dbe17cce199392b299569", "spanId": "1ab2151f776e43e5", "parentSpanId": "d89c1ec53ceef87a", "name": "send_email", "kind": "SPAN_KIND_INTERNAL", "startTimeUnixNano": "1702972609914159108", "endTimeUnixNano": "1702972609915241201", "attributes": [ { "key": "app.email.recipient", "value": { "stringValue": "someone@example.com" } } ], "status": {}, "resource": { "attributes": [ { "key": "service.name", "value": { "stringValue": "emailservice" } }, { "key": "process.pid", "value": { "intValue": "1" } }, { "key": "process.command", "value": { "stringValue": "email_server.rb" } }, { "key": "process.runtime.name", "value": { "stringValue": "ruby" } }, { "key": "process.runtime.version", "value": { "stringValue": "3.2.2" } }, { "key": "process.runtime.description", "value": { "stringValue": "ruby 3.2.2 (2023-03-30 revision e51014f9c0) [x86_64-linux]" } }, { "key": "telemetry.sdk.name", "value": { "stringValue": "opentelemetry" } }, { "key": "telemetry.sdk.language", "value": { "stringValue": "ruby" } }, { "key": "telemetry.sdk.version", "value": { "stringValue": "1.3.1" } }, { "key": "service.namespace", "value": { "stringValue": "opentelemetry-demo" } } ] }, "scope": { "name": "emailservice" } },
        { "traceId": "8e8cfbe2d78dbe17cce199392b299569", "spanId": "d89c1ec53ceef87a", "parentSpanId": "", "name": "POST /send_order_confirmation", "kind": "SPAN_KIND_SERVER", "startTimeUnixNano": "1702972609913830183", "endTimeUnixNano": "1702972609915300271", "attributes": [ { "key": "http.method", "value": { "stringValue": "POST" } }, { "key": "http.host", "value": { "stringValue": "emailservice:6060" } }, { "key": "http.scheme", "value": { "stringValue": "http" } }, { "key": "http.target", "value": { "stringValue": "/send_order_confirmation" } }, { "key": "http.user_agent", "value": { "stringValue": "Go-http-client/1.1" } }, { "key": "app.order.id", "value": { "stringValue": "2a417c52-9e44-11ee-92e1-0242c0a8100e" } }, { "key": "http.route", "value": { "stringValue": "/send_order_confirmation" } }, { "key": "http.status_code", "value": { "intValue": "200" } } ], "status": {}, "resource": { "attributes": [ { "key": "service.name", "value": { "stringValue": "emailservice" } }, { "key": "process.pid", "value": { "intValue": "1" } }, { "key": "process.command", "value": { "stringValue": "email_server.rb" } }, { "key": "process.runtime.name", "value": { "stringValue": "ruby" } }, { "key": "process.runtime.version", "value": { "stringValue": "3.2.2" } }, { "key": "process.runtime.description", "value": { "stringValue": "ruby 3.2.2 (2023-03-30 revision e51014f9c0) [x86_64-linux]" } }, { "key": "telemetry.sdk.name", "value": { "stringValue": "opentelemetry" } }, { "key": "telemetry.sdk.language", "value": { "stringValue": "ruby" } }, { "key": "telemetry.sdk.version", "value": { "stringValue": "1.3.1" } }, { "key": "service.namespace", "value": { "stringValue": "opentelemetry-demo" } } ] }, "scope": { "name": "OpenTelemetry::Instrumentation::Rack", "version": "0.23.4" } }
    ],
    logRecords: [
      { "traceId": "8e8cfbe2d78dbe17cce199392b299569", "spanId": "d89c1ec53ceef87a", "observedTimeUnixNano": "1702972609914159108", "timeUnixNano": "1702972609914159108", "severityNumber": "SEVERITY_NUMBER_INFO", "severityText": "Information", "body": { "stringValue": "GetCartAsync called with userId={userId}" }, "attributes": [ { "key": "userId", "value": { "stringValue": "aaaaaaaaa" } } ], "flags": 1},
      { "traceId": "8e8cfbe2d78dbe17cce199392b299569", "spanId": "1ab2151f776e43e5", "observedTimeUnixNano": "1702972609914159108" , "timeUnixNano": "1702972609914159108", "severityNumber": "SEVERITY_NUMBER_INFO", "severityText": "Information", "body": { "stringValue": "GetCartAsync called with userId={userId}" }, "attributes": [ { "key": "userId", "value": { "stringValue": "aaaaaaaaa" } } ], "flags": 1 }
    ]
  },
  {
    "traceId": "e256125a6a35998fc2bd11bcc2218d25",
    "spans": [
        { "traceId": "e256125a6a35998fc2bd11bcc2218d25", "spanId": "d89c1ec53ceef87a", "parentSpanId": "", "name": "POST /dummy", "kind": "SPAN_KIND_SERVER", "startTimeUnixNano": "1702972609913830183", "endTimeUnixNano": "1702972609915300271", "attributes": [ { "key": "http.method", "value": { "stringValue": "POST" } }, { "key": "http.host", "value": { "stringValue": "emailservice:6060" } }, { "key": "http.scheme", "value": { "stringValue": "http" } }, { "key": "http.target", "value": { "stringValue": "/send_order_confirmation" } }, { "key": "http.user_agent", "value": { "stringValue": "Go-http-client/1.1" } }, { "key": "app.order.id", "value": { "stringValue": "2a417c52-9e44-11ee-92e1-0242c0a8100e" } }, { "key": "http.route", "value": { "stringValue": "/send_order_confirmation" } }, { "key": "http.status_code", "value": { "intValue": "200" } } ], "status": {}, "resource": { "attributes": [ { "key": "service.name", "value": { "stringValue": "emailservice" } }, { "key": "process.pid", "value": { "intValue": "1" } }, { "key": "process.command", "value": { "stringValue": "email_server.rb" } }, { "key": "process.runtime.name", "value": { "stringValue": "ruby" } }, { "key": "process.runtime.version", "value": { "stringValue": "3.2.2" } }, { "key": "process.runtime.description", "value": { "stringValue": "ruby 3.2.2 (2023-03-30 revision e51014f9c0) [x86_64-linux]" } }, { "key": "telemetry.sdk.name", "value": { "stringValue": "opentelemetry" } }, { "key": "telemetry.sdk.language", "value": { "stringValue": "ruby" } }, { "key": "telemetry.sdk.version", "value": { "stringValue": "1.3.1" } }, { "key": "service.namespace", "value": { "stringValue": "opentelemetry-demo" } } ] }, "scope": { "name": "OpenTelemetry::Instrumentation::Rack", "version": "0.23.4" } },
        { "traceId": "e256125a6a35998fc2bd11bcc2218d25", "spanId": "189c1ec53ceef87a", "parentSpanId": "d89c1ec53ceef87a", "name": "POST /dummy", "kind": "SPAN_KIND_SERVER", "startTimeUnixNano": "1702972609913830183", "endTimeUnixNano": "1702972609915300271", "attributes": [ { "key": "http.method", "value": { "stringValue": "POST" } }, { "key": "http.host", "value": { "stringValue": "emailservice:6060" } }, { "key": "http.scheme", "value": { "stringValue": "http" } }, { "key": "http.target", "value": { "stringValue": "/send_order_confirmation" } }, { "key": "http.user_agent", "value": { "stringValue": "Go-http-client/1.1" } }, { "key": "app.order.id", "value": { "stringValue": "2a417c52-9e44-11ee-92e1-0242c0a8100e" } }, { "key": "http.route", "value": { "stringValue": "/send_order_confirmation" } }, { "key": "http.status_code", "value": { "intValue": "200" } } ], "status": {}, "resource": { "attributes": [ { "key": "service.name", "value": { "stringValue": "foo" } }, { "key": "process.pid", "value": { "intValue": "1" } }, { "key": "process.command", "value": { "stringValue": "email_server.rb" } }, { "key": "process.runtime.name", "value": { "stringValue": "ruby" } }, { "key": "process.runtime.version", "value": { "stringValue": "3.2.2" } }, { "key": "process.runtime.description", "value": { "stringValue": "ruby 3.2.2 (2023-03-30 revision e51014f9c0) [x86_64-linux]" } }, { "key": "telemetry.sdk.name", "value": { "stringValue": "opentelemetry" } }, { "key": "telemetry.sdk.language", "value": { "stringValue": "ruby" } }, { "key": "telemetry.sdk.version", "value": { "stringValue": "1.3.1" } }, ] }, "scope": { "name": "OpenTelemetry::Instrumentation::Rack", "version": "0.23.4" } }
    ],
    "logRecords": [],
  },
  {
    "traceId": "8e8cfbe2d78dbe17cce199392b299569",
    "spans": [
        { "traceId": "8e8cfbe2d78dbe17cce199392b299569", "spanId": "ae9d876958f7176d", "parentSpanId": "714f2d8936746e89", "name": "sinatra.render_template", "kind": "SPAN_KIND_INTERNAL", "startTimeUnixNano": "1702972609914259345", "endTimeUnixNano": "1702972609914336379", "attributes": [ { "key": "sinatra.template_name", "value": { "stringValue": "layout" } } ], "status": {}, "resource": { "attributes": [ { "key": "service.name", "value": { "stringValue": "emailservice" } }, { "key": "process.pid", "value": { "intValue": "1" } }, { "key": "process.command", "value": { "stringValue": "email_server.rb" } }, { "key": "process.runtime.name", "value": { "stringValue": "ruby" } }, { "key": "process.runtime.version", "value": { "stringValue": "3.2.2" } }, { "key": "process.runtime.description", "value": { "stringValue": "ruby 3.2.2 (2023-03-30 revision e51014f9c0) [x86_64-linux]" } }, { "key": "telemetry.sdk.name", "value": { "stringValue": "opentelemetry" } }, { "key": "telemetry.sdk.language", "value": { "stringValue": "ruby" } }, { "key": "telemetry.sdk.version", "value": { "stringValue": "1.3.1" } }, { "key": "service.namespace", "value": { "stringValue": "opentelemetry-demo" } } ] }, "scope": { "name": "OpenTelemetry::Instrumentation::Sinatra", "version": "0.23.2" } },
        { "traceId": "8e8cfbe2d78dbe17cce199392b299569", "spanId": "714f2d8936746e89", "parentSpanId": "1ab2151f776e43e5", "name": "sinatra.render_template", "kind": "SPAN_KIND_INTERNAL", "startTimeUnixNano": "1702972609914175859", "endTimeUnixNano": "1702972609914352238", "attributes": [ { "key": "sinatra.template_name", "value": { "stringValue": "confirmation" } } ], "status": {}, "resource": { "attributes": [ { "key": "service.name", "value": { "stringValue": "emailservice" } }, { "key": "process.pid", "value": { "intValue": "1" } }, { "key": "process.command", "value": { "stringValue": "email_server.rb" } }, { "key": "process.runtime.name", "value": { "stringValue": "ruby" } }, { "key": "process.runtime.version", "value": { "stringValue": "3.2.2" } }, { "key": "process.runtime.description", "value": { "stringValue": "ruby 3.2.2 (2023-03-30 revision e51014f9c0) [x86_64-linux]" } }, { "key": "telemetry.sdk.name", "value": { "stringValue": "opentelemetry" } }, { "key": "telemetry.sdk.language", "value": { "stringValue": "ruby" } }, { "key": "telemetry.sdk.version", "value": { "stringValue": "1.3.1" } }, { "key": "service.namespace", "value": { "stringValue": "opentelemetry-demo" } } ] }, "scope": { "name": "OpenTelemetry::Instrumentation::Sinatra", "version": "0.23.2" } },
        { "traceId": "8e8cfbe2d78dbe17cce199392b299569", "spanId": "1ab2151f776e43e5", "parentSpanId": "d89c1ec53ceef87a", "name": "send_email", "kind": "SPAN_KIND_INTERNAL", "startTimeUnixNano": "1702972609914159108", "endTimeUnixNano": "1702972609915241201", "attributes": [ { "key": "app.email.recipient", "value": { "stringValue": "someone@example.com" } } ], "status": {}, "resource": { "attributes": [ { "key": "service.name", "value": { "stringValue": "emailservice" } }, { "key": "process.pid", "value": { "intValue": "1" } }, { "key": "process.command", "value": { "stringValue": "email_server.rb" } }, { "key": "process.runtime.name", "value": { "stringValue": "ruby" } }, { "key": "process.runtime.version", "value": { "stringValue": "3.2.2" } }, { "key": "process.runtime.description", "value": { "stringValue": "ruby 3.2.2 (2023-03-30 revision e51014f9c0) [x86_64-linux]" } }, { "key": "telemetry.sdk.name", "value": { "stringValue": "opentelemetry" } }, { "key": "telemetry.sdk.language", "value": { "stringValue": "ruby" } }, { "key": "telemetry.sdk.version", "value": { "stringValue": "1.3.1" } }, { "key": "service.namespace", "value": { "stringValue": "opentelemetry-demo" } } ] }, "scope": { "name": "emailservice" } },
        { "traceId": "8e8cfbe2d78dbe17cce199392b299569", "spanId": "d89c1ec53ceef87a", "parentSpanId": "", "name": "POST /send_order_confirmation", "kind": "SPAN_KIND_SERVER", "startTimeUnixNano": "1702972609913830183", "endTimeUnixNano": "1702972609915300271", "attributes": [ { "key": "http.method", "value": { "stringValue": "POST" } }, { "key": "http.host", "value": { "stringValue": "emailservice:6060" } }, { "key": "http.scheme", "value": { "stringValue": "http" } }, { "key": "http.target", "value": { "stringValue": "/send_order_confirmation" } }, { "key": "http.user_agent", "value": { "stringValue": "Go-http-client/1.1" } }, { "key": "app.order.id", "value": { "stringValue": "2a417c52-9e44-11ee-92e1-0242c0a8100e" } }, { "key": "http.route", "value": { "stringValue": "/send_order_confirmation" } }, { "key": "http.status_code", "value": { "intValue": "200" } } ], "status": {}, "resource": { "attributes": [ { "key": "service.name", "value": { "stringValue": "emailservice" } }, { "key": "process.pid", "value": { "intValue": "1" } }, { "key": "process.command", "value": { "stringValue": "email_server.rb" } }, { "key": "process.runtime.name", "value": { "stringValue": "ruby" } }, { "key": "process.runtime.version", "value": { "stringValue": "3.2.2" } }, { "key": "process.runtime.description", "value": { "stringValue": "ruby 3.2.2 (2023-03-30 revision e51014f9c0) [x86_64-linux]" } }, { "key": "telemetry.sdk.name", "value": { "stringValue": "opentelemetry" } }, { "key": "telemetry.sdk.language", "value": { "stringValue": "ruby" } }, { "key": "telemetry.sdk.version", "value": { "stringValue": "1.3.1" } }, { "key": "service.namespace", "value": { "stringValue": "opentelemetry-demo" } } ] }, "scope": { "name": "OpenTelemetry::Instrumentation::Rack", "version": "0.23.4" } }
    ],
    logRecords: [
      { "traceId": "8e8cfbe2d78dbe17cce199392b299569", "spanId": "d89c1ec53ceef87a", "observedTimeUnixNano": "1702972609914159108", "timeUnixNano": "1702972609914159108", "severityNumber": "SEVERITY_NUMBER_INFO", "severityText": "Information", "body": { "stringValue": "GetCartAsync called with userId={userId}" }, "attributes": [ { "key": "userId", "value": { "stringValue": "aaaaaaaaa" } } ], "flags": 1},
      { "traceId": "8e8cfbe2d78dbe17cce199392b299569", "spanId": "1ab2151f776e43e5", "observedTimeUnixNano": "1702972609914159108" , "timeUnixNano": "1702972609914159108", "severityNumber": "SEVERITY_NUMBER_INFO", "severityText": "Information", "body": { "stringValue": "GetCartAsync called with userId={userId}" }, "attributes": [ { "key": "userId", "value": { "stringValue": "aaaaaaaaa" } } ], "flags": 1 }
    ]
  },
  {
    "traceId": "1256125a6a35998fc2bd11bcc2218d25",
    "spans": [
        { "traceId": "1256125a6a35998fc2bd11bcc2218d25", "spanId": "a89c1ec53ceef87a", "parentSpanId": "", "name": "POST /dummy_emailservice", "kind": "SPAN_KIND_SERVER", "startTimeUnixNano": "1702972609913830183", "endTimeUnixNano": "1702972609915300271", "attributes": [ { "key": "http.method", "value": { "stringValue": "POST" } }, { "key": "http.host", "value": { "stringValue": "emailservice:6060" } }, { "key": "http.scheme", "value": { "stringValue": "http" } }, { "key": "http.target", "value": { "stringValue": "/send_order_confirmation" } }, { "key": "http.user_agent", "value": { "stringValue": "Go-http-client/1.1" } }, { "key": "app.order.id", "value": { "stringValue": "2a417c52-9e44-11ee-92e1-0242c0a8100e" } }, { "key": "http.route", "value": { "stringValue": "/send_order_confirmation" } }, { "key": "http.status_code", "value": { "intValue": "200" } } ], "status": {}, "resource": { "attributes": [ { "key": "service.name", "value": { "stringValue": "emailservice" } }, { "key": "process.pid", "value": { "intValue": "1" } }, { "key": "process.command", "value": { "stringValue": "email_server.rb" } }, { "key": "process.runtime.name", "value": { "stringValue": "ruby" } }, { "key": "process.runtime.version", "value": { "stringValue": "3.2.2" } }, { "key": "process.runtime.description", "value": { "stringValue": "ruby 3.2.2 (2023-03-30 revision e51014f9c0) [x86_64-linux]" } }, { "key": "telemetry.sdk.name", "value": { "stringValue": "opentelemetry" } }, { "key": "telemetry.sdk.language", "value": { "stringValue": "ruby" } }, { "key": "telemetry.sdk.version", "value": { "stringValue": "1.3.1" } }, { "key": "service.namespace", "value": { "stringValue": "opentelemetry-demo" } } ] }, "scope": { "name": "OpenTelemetry::Instrumentation::Rack", "version": "0.23.4" } },
        { "traceId": "1256125a6a35998fc2bd11bcc2218d25", "spanId": "d89c1ec53ceef87a", "parentSpanId": "a89c1ec53ceef87a", "name": "POST /dummy_foo", "kind": "SPAN_KIND_SERVER", "startTimeUnixNano": "1702972609913830183", "endTimeUnixNano": "1702972609915300271", "attributes": [ { "key": "http.method", "value": { "stringValue": "POST" } }, { "key": "http.host", "value": { "stringValue": "emailservice:6060" } }, { "key": "http.scheme", "value": { "stringValue": "http" } }, { "key": "http.target", "value": { "stringValue": "/send_order_confirmation" } }, { "key": "http.user_agent", "value": { "stringValue": "Go-http-client/1.1" } }, { "key": "app.order.id", "value": { "stringValue": "2a417c52-9e44-11ee-92e1-0242c0a8100e" } }, { "key": "http.route", "value": { "stringValue": "/send_order_confirmation" } }, { "key": "http.status_code", "value": { "intValue": "200" } } ], "status": {}, "resource": { "attributes": [ { "key": "service.name", "value": { "stringValue": "foo" } }, { "key": "process.pid", "value": { "intValue": "1" } }, { "key": "process.command", "value": { "stringValue": "email_server.rb" } }, { "key": "process.runtime.name", "value": { "stringValue": "ruby" } }, { "key": "process.runtime.version", "value": { "stringValue": "3.2.2" } }, { "key": "process.runtime.description", "value": { "stringValue": "ruby 3.2.2 (2023-03-30 revision e51014f9c0) [x86_64-linux]" } }, { "key": "telemetry.sdk.name", "value": { "stringValue": "opentelemetry" } }, { "key": "telemetry.sdk.language", "value": { "stringValue": "ruby" } }, { "key": "telemetry.sdk.version", "value": { "stringValue": "1.3.1" } } ] }, "scope": { "name": "OpenTelemetry::Instrumentation::Rack", "version": "0.23.4" } }
    ],
    logRecords: [
      { "traceId": "1256125a6a35998fc2bd11bcc2218d25", "spanId": "d89c1ec53ceef87a", "observedTimeUnixNano": "1702972609914159108", "timeUnixNano": "1702972609914159108", "severityNumber": "SEVERITY_NUMBER_INFO", "severityText": "Information", "body": { "stringValue": "GetCartAsync called with userId={userId}" }, "attributes": [ { "key": "userId", "value": { "stringValue": "aaaaaaaaa" } } ], "flags": 1},
      { "traceId": "1256125a6a35998fc2bd11bcc2218d25", "spanId": "d89c1ec53ceef87a", "observedTimeUnixNano": "1702972609914159108" , "timeUnixNano": "1702972609914159108", "severityNumber": "SEVERITY_NUMBER_INFO", "severityText": "Information", "body": { "stringValue": "GetCartAsync called with userId={userId}" }, "attributes": [ { "key": "userId", "value": { "stringValue": "aaaaaaaaa" } } ], "flags": 1 }
    ]
  },
  {
    traceId: "ced1a995ba1f3689af5d18d5e31abef1",
    spans: [],
    logRecords: []
  }
]

window.__echoed_param__ = {
  config: {
    propagationTestEnabled: true,
  },
  testInfos: testInfos,
  propagationFailedTraces: propagationFailedTraces,
  coverageInfos: coverageInfos,
  traces: traces,
};
