<script lang="ts">
  import type { ChartConfiguration } from "chart.js";
  import Chart from "chart.js/auto";
  import type { ILabelNode } from "chartjs-plugin-hierarchical";
  import { createEventDispatcher, onMount } from "svelte";
  import type { Span } from "../../lib/EchoedParam";
  import { MemorizedColorSelector } from "../../lib/MemorizedColorSelector";

  const dispatch = createEventDispatcher<{ click: string }>();

  export let spans: Span[];

  type Node = {
    node: Span;
    traceIndex: number;
    children?: Node[];
  };

  // create tree for Node and return roots
  const createTrees = (spans: Span[]): Node[] => {
    const traceNodes: Map<string, Node> = new Map();
    spans.forEach((span, index) => {
      traceNodes.set(span.spanId, {
        node: span,
        traceIndex: index,
        children: undefined,
      });
    });

    const parentSpanIds = new Set(spans.map((trace) => trace.spanId));

    for (let i = 0; i < spans.length; i++) {
      const span = spans[i];
      const parentNode = traceNodes.get(span.parentSpanId);
      if (parentNode) {
        if (!parentNode.children) {
          parentNode.children = [];
        }
        const node = traceNodes.get(span.spanId);
        if (!node) continue;
        parentNode.children.push(node);

        parentSpanIds.delete(span.spanId);
      }
    }

    const roots: Node[] = Array.from(parentSpanIds)
      .map((spanId) => traceNodes.get(spanId))
      .filter((v): v is NonNullable<Node> => !!v);

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
  const traceTrees = createTrees(spans);

  type ILabelNode2 = ILabelNode & {
    traceIndex: number;
    spanId: string;
    backgroundColor: string;
  };

  const colorSelector = new MemorizedColorSelector();
  const createLabel = (node: Node): ILabelNode2 => {
    const backgroundColor = colorSelector.pickFor(node.node.serviceName);

    if (!node.children) {
      return {
        label: node.node.name,
        traceIndex: node.traceIndex,
        spanId: node.node.spanId,
        backgroundColor: backgroundColor,
      };
    }

    return {
      label: node.node.name,
      backgroundColor: backgroundColor,
      traceIndex: node.traceIndex,
      spanId: node.node.spanId,
      expand: true,
      children: [
        {
          label: node.node.name,
          traceIndex: node.traceIndex,
          spanId: node.node.spanId,
          backgroundColor: backgroundColor,
        },
        ...node.children.map(createLabel),
      ],
    };
  };
  const label = traceTrees.map(createLabel);

  const firstUnixNanoMillis =
    traceTrees.length > 0 ? traceTrees[0].node.startTimeMillis : 0;

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
  const dataset = traceTrees.map(createDataset);

  const data: ChartConfiguration<"bar">["data"] = {
    labels: label,
    datasets: [
      {
        tree: dataset,
      },
    ],
  };

  onMount(() => {
    const canvas = <HTMLCanvasElement>document.getElementById("canvas");
    canvas.width = window.innerWidth * 0.8;
    canvas.height = spans.length * 50 + 100;
    const chart = new Chart(canvas, {
      type: "bar",
      data: data,
      options: {
        onClick: (event, elements) => {
          if (elements.length > 0) {
            if (chart.data.labels) {
              const label = chart.data.labels[elements[0].index];
              if (label) {
                dispatch("click", label.spanId);
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
            // TODO: make dynamic according to tree's max depth
            left: 250,
          },
        },
        barThickness: 20,
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
            attributes: {
              backgroundColor: "gray",
            },
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

<div class="canvas-wrapper">
  <canvas id="canvas"></canvas>
</div>
