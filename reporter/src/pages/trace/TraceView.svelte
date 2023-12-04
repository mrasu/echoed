<script lang="ts">
  import type { ChartConfiguration } from "chart.js";
  import Chart from "chart.js/auto";
  import type { ILabelNode, IValueNode } from "chartjs-plugin-hierarchical";
  import { onMount } from "svelte";
  import Long from "long";
  import type { ILongable } from "./../../types/tobikura_param";
  import type { Span, TestInfo } from "../../lib/TobikuraParam";
  import { LogRecord } from "../../lib/TobikuraParam";

  export let traceId: string;
  export let testInfo: TestInfo;
  export let spans: Span[];
  export let traceLogs: LogRecord[];

  const toLong = (val: ILongable) => {
    return Long.fromString(val);
  };

  const nanoToDate = (val: ILongable) => {
    return new Date(toLong(val).toNumber() / (1000 * 1000));
  };

  type Node = {
    node: Span;
    traceIndex: number;
    children?: Node[];
  };

  // create tree for Node and return roots for the specified traceId
  const createTrees = (spans: Span[], traceId: string): Node[] => {
    const traceRecords: Record<string, Node> = {};
    spans.forEach((span, index) => {
      traceRecords[span.spanId] = {
        node: span,
        traceIndex: index,
        children: undefined,
      };
    });

    const parents = new Set(spans.map((trace) => trace.spanId));

    for (let i = 0; i < spans.length; i++) {
      const span = spans[i];
      const parent = traceRecords[span.parentSpanId];
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(traceRecords[span.spanId]);

        parents.delete(span.spanId);
      }
    }

    const roots = Array.from(parents).map((spanId) => traceRecords[spanId]);

    roots.sort((a, b) => {
      if (a.node.startTimeUnixNano && b.node.startTimeUnixNano) {
        return a.node.startTimeUnixNano.compare(b.node.startTimeUnixNano);
      }
      if (a.node.startTimeUnixNano) {
        return 1;
      }
      return -1;
    });
    return roots;
  };
  const trace_trees = createTrees(spans, traceId);

  let focusingSpan: Span | undefined = undefined;

  type ILabelNode2 = ILabelNode & {
    traceIndex: number;
  };

  const createLabel = (node: Node): ILabelNode2 => {
    if (!node.children) {
      return {
        label: node.node.name,
        traceIndex: node.traceIndex,
      };
    }

    return {
      label: node.node.name,
      traceIndex: node.traceIndex,
      expand: true,
      children: [
        { label: node.node.name, traceIndex: node.traceIndex },
        ...node.children.map(createLabel),
      ],
    };
  };
  const label = trace_trees.map(createLabel);

  const firstUnixNanoMillis =
    trace_trees.length > 0 ? trace_trees[0].node.startTimeMillis : 0;

  type IValueNode2 = {
    value: [number, number];
    children: readonly (IValueNode2 | [number, number])[];
  };
  const createDataset = (node: Node): IValueNode2 => {
    const value: [number, number] = [
      node.node.startTimeMillis - firstUnixNanoMillis,
      node.node.endTimeMillis - firstUnixNanoMillis,
    ];

    if (!node.children) {
      return {
        value: value,
        children: [value],
      };
    }

    return {
      value: value,
      children: [value, ...node.children.map(createDataset)],
    };
  };
  const dataset = trace_trees.map(createDataset);

  const data: ChartConfiguration<"bar">["data"] = {
    labels: label,
    datasets: [
      {
        tree: dataset,
      },
    ],
  };

  onMount(() => {
    const ctx = document.getElementById("canvas");
    const chart = new Chart(ctx, {
      type: "bar",
      data: data,
      options: {
        onClick: (event, elements) => {
          if (elements.length > 0) {
            if (chart.data.labels) {
              const label = chart.data.labels[elements[0].index];
              if (label) {
                focusingSpan = spans[label.traceIndex];
              }
            }
          }
        },
        animation: false,
        responsive: true,
        title: {
          display: false,
        },
        indexAxis: "y",
        layout: {
          padding: {
            left: 250,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "time (ms)",
            },
          },
          y: {
            hierarchyGroupLabelPosition: "first",
            ticks: {
              mirror: true,
              beginAtZero: true,
            },
            padding: 0,
            type: "hierarchical",
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  });
</script>

<div>
  <span>{testInfo.name} at {testInfo.file}</span>
</div>
<div>
  <span>TraceId: {traceId}</span>
</div>

<canvas id="canvas"></canvas>

{#if focusingSpan}
  <table>
    <thead>
      <tr>
        <th>name</th>
        <th>traceId</th>
        <th>spanId</th>
        <th>parentSpanId</th>
      </tr>
    </thead>
    <tr>
      <td>{focusingSpan.name}</td>
      <td>{focusingSpan.traceId}</td>
      <td>{focusingSpan.spanId}</td>
      <td>{focusingSpan.parentSpanId}</td>
    </tr>
  </table>
{/if}

<div>Spans</div>
<table>
  <thead>
    <tr>
      <th>name</th>
      <th>traceId</th>
      <th>spanId</th>
      <th>parentSpanId</th>
    </tr>
  </thead>
  {#each spans as span}
    <tr>
      <td>{span.name}</td>
      <td>{span.traceId}</td>
      <td>{span.spanId}</td>
      <td>{span.parentSpanId}</td>
    </tr>
  {/each}
</table>

<div>Logs</div>
<table>
  {#each traceLogs as log}
    <tr>
      <td>{log.body?.stringValue}</td>
      <td>{log.traceId}</td>
    </tr>
    <tr>
      <td colspan="3">{JSON.stringify(log)}</td>
    </tr>
  {/each}
</table>

<style>
</style>
