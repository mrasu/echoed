<script lang="ts">
  import type { ChartConfiguration } from "chart.js";
  import Chart from "chart.js/auto";
  import type { ILabelNode } from "chartjs-plugin-hierarchical";
  import { onMount } from "svelte";
  import type { Span, Fetch, TestInfo } from "../../lib/TobikuraParam";
  import { LogRecord } from "../../lib/TobikuraParam";
  import DataTable, { Body, Row, Cell } from "@smui/data-table";
  import Paper, { Title, Content as PaperContent } from "@smui/paper";
  import Accordion, { Panel, Header, Content } from "@smui-extra/accordion";
  import { MemorizedColorSelector } from "../../lib/MemorizedColorSelector";
  import AttributeDataTable from "./AttributeDataTable.svelte";
  import { link } from "svelte-spa-router";
  import { Text } from "@smui/list";

  export let traceId: string;
  export let testInfo: TestInfo;
  export let traceFetch: Fetch | undefined;
  export let traceSpans: Span[];
  export let traceLogs: LogRecord[];

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
  const traceTrees = createTrees(traceSpans, traceId);

  let focusingSpan: Span | undefined = undefined;

  type ILabelNode2 = ILabelNode & {
    traceIndex: number;
    backgroundColor: string;
  };

  const colorSelector = new MemorizedColorSelector();
  const createLabel = (node: Node): ILabelNode2 => {
    const backgroundColor = colorSelector.pickFor(node.node.serviceName);

    if (!node.children) {
      return {
        label: node.node.name,
        traceIndex: node.traceIndex,
        backgroundColor: backgroundColor,
      };
    }

    return {
      label: node.node.name,
      backgroundColor: backgroundColor,
      traceIndex: node.traceIndex,
      expand: true,
      children: [
        {
          label: node.node.name,
          traceIndex: node.traceIndex,
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
    canvas.height = traceSpans.length * 50 + 100;
    const chart = new Chart(canvas, {
      type: "bar",
      data: data,
      options: {
        onClick: (event, elements) => {
          if (elements.length > 0) {
            if (chart.data.labels) {
              const label = chart.data.labels[elements[0].index];
              if (label) {
                focusingSpan = traceSpans[label.traceIndex];
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

<div style="margin-bottom: 20px">
  <Text><a href="/" use:link>Tests</a></Text>
  <Text>/</Text>
  <Text>
    <a href={`/test/${testInfo.testId}`} use:link>
      <Text>&quot{testInfo.name}&quot</Text>
      <Text>at {testInfo.file}</Text>
    </a>
  </Text>
  <Text>/</Text>
  <Text>{traceId}</Text>
</div>

<Paper>
  <Title>TraceId: {traceId}</Title>
  <PaperContent>
    {#if traceFetch}
      <Accordion style="margin-bottom: 20px">
        <Content>
          <Panel open={true}>
            <Header style="font-size: 1.3rem">Fetch</Header>
            <Content>
              <Text>Request</Text>
              <DataTable style="width: 100%; margin-bottom: 20px">
                <Body>
                  <Row>
                    <Cell style="width: 100px">URL</Cell>
                    <Cell>{traceFetch.request.url}</Cell>
                  </Row>
                  <Row>
                    <Cell>Method</Cell>
                    <Cell>{traceFetch.request.method}</Cell>
                  </Row>
                  <Row>
                    <Cell>Body</Cell>
                    <Cell>{traceFetch.request.body || "-"}</Cell>
                  </Row>
                </Body>
              </DataTable>

              <Text>Response</Text>
              <DataTable style="width: 100%">
                <Body>
                  <Row>
                    <Cell style="width: 100px">Status</Cell>
                    <Cell>{traceFetch.response.status}</Cell>
                  </Row>
                  <Row>
                    <Cell>Body</Cell>
                    <Cell>{traceFetch.response.body}</Cell>
                  </Row>
                </Body>
              </DataTable>
            </Content>
          </Panel>
        </Content>
      </Accordion>
    {/if}

    <div class="canvas-wrapper">
      <canvas id="canvas"></canvas>
    </div>

    <Accordion multiple>
      <Panel open={true}>
        <Header style="font-size: 1.3rem">Span</Header>
        <Content>
          {#if focusingSpan}
            <Paper variant="unelevated">
              <PaperContent>
                <DataTable style="width: 100%">
                  <Body>
                    <Row>
                      <Cell style="width: 100px">Name</Cell>
                      <Cell>{focusingSpan.name}</Cell>
                    </Row>
                    <Row>
                      <Cell>Service</Cell>
                      <Cell>{focusingSpan.serviceName}</Cell>
                    </Row>
                    <Row>
                      <Cell>TraceId</Cell>
                      <Cell>{focusingSpan.traceId}</Cell>
                    </Row>
                    <Row>
                      <Cell>SpanId</Cell>
                      <Cell>{focusingSpan.spanId}</Cell>
                    </Row>
                    <Row>
                      <Cell>ParentSpanId</Cell>
                      <Cell>{focusingSpan.parentSpanId}</Cell>
                    </Row>
                    <Row>
                      <Cell>StartTime</Cell>
                      <Cell
                        >{focusingSpan.startTime.toISOString()} ({focusingSpan.startTimeUnixNano})</Cell
                      >
                    </Row>
                    <Row>
                      <Cell>EndTime</Cell>
                      <Cell
                        >{focusingSpan.endTime.toISOString()} ({focusingSpan.endTimeUnixNano})</Cell
                      >
                    </Row>
                    <Row>
                      <Cell>Kind</Cell>
                      <Cell>{focusingSpan.kind}</Cell>
                    </Row>
                    <Row>
                      <Cell>Status</Cell>
                      {#if focusingSpan.status}
                        <Cell>{JSON.stringify(focusingSpan.status)}</Cell>
                      {:else}
                        <Cell>-</Cell>
                      {/if}
                    </Row>
                  </Body>
                </DataTable>
              </PaperContent>
            </Paper>
            <Paper variant="unelevated">
              <Title>Attributes</Title>
              <PaperContent>
                <AttributeDataTable attributes={focusingSpan.attributes} />
              </PaperContent>
            </Paper>
            <Accordion multiple>
              <Panel open={true}>
                <Header style="font-size: 1.7rem">Resource</Header>
                <Content>
                  {#if focusingSpan.resource}
                    <Paper variant="unelevated">
                      <PaperContent>
                        <DataTable style="width: 100%">
                          <Body>
                            <Row>
                              <Cell style="width: 100px"
                                >DroppedAttributesCount</Cell
                              >
                              <Cell
                                >{focusingSpan.resource
                                  .droppedAttributesCount}</Cell
                              >
                            </Row>
                          </Body>
                        </DataTable>
                      </PaperContent>
                    </Paper>
                    <Paper variant="unelevated">
                      <Title>Attributes</Title>
                      <PaperContent>
                        <AttributeDataTable
                          attributes={focusingSpan.resource.attributes}
                        />
                      </PaperContent>
                    </Paper>
                  {:else}
                    <Paper variant="unelevated">No resource found</Paper>
                  {/if}
                </Content>
              </Panel>
              <Panel open={true}>
                <Header style="font-size: 1.7rem">InstrumentationScope</Header>
                <Content>
                  {#if focusingSpan.scope}
                    <Paper variant="unelevated">
                      <PaperContent>
                        <DataTable style="width: 100%">
                          <Body>
                            <Row>
                              <Cell style="width: 100px">Name</Cell>
                              <Cell>{focusingSpan.scope.name}</Cell>
                            </Row>
                            <Row>
                              <Cell>Version</Cell>
                              <Cell>{focusingSpan.scope.version}</Cell>
                            </Row>
                            <Row>
                              <Cell>DroppedAttributesCount</Cell>
                              <Cell
                                >{focusingSpan.scope
                                  .droppedAttributesCount}</Cell
                              >
                            </Row>
                          </Body>
                        </DataTable>
                      </PaperContent>
                    </Paper>
                    <Paper variant="unelevated">
                      <Title>Attributes</Title>
                      <PaperContent>
                        <AttributeDataTable
                          attributes={focusingSpan.scope.attributes}
                        />
                      </PaperContent>
                    </Paper>
                  {:else}
                    <Paper variant="unelevated">No resource found</Paper>
                  {/if}
                </Content>
              </Panel>
            </Accordion>
          {:else}
            <Paper variant="unelevated">
              <Content>Click span to see information</Content>
            </Paper>
          {/if}
        </Content>
      </Panel>
      <Panel open={true}>
        <Header style="font-size: 1.3rem">Logs</Header>
        <Content>
          {#if traceLogs.length > 0}
            <Accordion multiple>
              {#each traceLogs as log}
                <Panel>
                  <Header>{log.bodyText} (SpanId={log.spanId})</Header>
                  <Content>
                    <Paper variant="unelevated">
                      <PaperContent>
                        <DataTable style="width: 100%">
                          <Body>
                            <Row>
                              <Cell style="width: 100px">TraceId</Cell>
                              <Cell>{log.traceId}</Cell>
                            </Row>
                            <Row>
                              <Cell>SpanId</Cell>
                              <Cell>{log.spanId}</Cell>
                            </Row>
                            <Row>
                              <Cell>Time</Cell>
                              <Cell
                                >{log.time.toISOString()} ({log.timeUnixNano})</Cell
                              >
                            </Row>
                            <Row>
                              <Cell>ObservedTime</Cell>
                              <Cell
                                >{log.observedTime.toISOString()} ({log.observedTimeUnixNano})</Cell
                              >
                            </Row>
                            <Row>
                              <Cell>SeverityNumber</Cell>
                              <Cell>{log.severityNumber}</Cell>
                            </Row>
                            <Row>
                              <Cell>SeverityText</Cell>
                              <Cell>{log.severityText}</Cell>
                            </Row>
                            <Row>
                              <Cell>SeverityText</Cell>
                              <Cell>{log.severityText}</Cell>
                            </Row>
                            <Row>
                              <Cell>Body</Cell>
                              <Cell>{log.bodyText}</Cell>
                            </Row>
                            <Row>
                              <Cell>DroppedAttributesCount</Cell>
                              <Cell>{log.droppedAttributesCount}</Cell>
                            </Row>
                            <Row>
                              <Cell>Flags</Cell>
                              <Cell>{log.flags}</Cell>
                            </Row>
                          </Body>
                        </DataTable>
                      </PaperContent>
                    </Paper>

                    <Paper variant="unelevated">
                      <Title>Attributes</Title>
                      <PaperContent>
                        <AttributeDataTable attributes={log.attributes} />
                      </PaperContent>
                    </Paper>
                  </Content>
                </Panel>
              {/each}
            </Accordion>
          {:else}
            <Paper variant="unelevated">No logs found</Paper>
          {/if}
        </Content>
      </Panel>
    </Accordion>
  </PaperContent>
</Paper>
