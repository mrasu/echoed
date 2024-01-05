<script lang="ts">
  import type { Span, Fetch, TestInfo } from "../../lib/EchoedParam";
  import { LogRecord } from "../../lib/EchoedParam";
  import DataTable, { Body, Row, Cell } from "@smui/data-table";
  import Paper, { Title, Content as PaperContent } from "@smui/paper";
  import Accordion, { Panel, Header, Content } from "@smui-extra/accordion";
  import { Text } from "@smui/list";
  import TraceTree from "../../components/trace/TraceTree.svelte";
  import SpanDetail from "../../components/trace/SpanDetail.svelte";
  import LogAccordion from "../../components/trace/LogAccordion.svelte";
  import Breadcrumb from "../../components/breadcrumb/Breadcrumb.svelte";

  export let traceId: string;
  export let testInfo: TestInfo;
  export let traceFetch: Fetch | undefined;
  export let traceSpans: Span[];
  export let traceLogs: LogRecord[];

  let focusingSpan: Span | undefined = undefined;

  const onTreeSpanClicked = (spanId: string) => {
    focusingSpan = traceSpans.find((span) => span.spanId === spanId);
  };
</script>

<Breadcrumb
  crumbs={[
    "Test",
    {
      href: `/test/${testInfo.testId}`,
      text: `"${testInfo.name}" as ${testInfo.file}`,
    },
    traceId,
  ]}
/>

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

    <TraceTree
      spans={traceSpans}
      on:click={(e) => onTreeSpanClicked(e.detail)}
    />

    <Accordion multiple>
      <Panel open={true}>
        <Header style="font-size: 1.3rem">Span</Header>
        <Content>
          {#if focusingSpan}
            <SpanDetail span={focusingSpan} />
          {:else if traceSpans.length > 0}
            <Paper variant="unelevated">
              <Content>Click span to see information</Content>
            </Paper>
          {:else}
            <Paper variant="unelevated">
              <Content>No spans found</Content>
            </Paper>
          {/if}
        </Content>
      </Panel>
      <Panel open={true}>
        <Header style="font-size: 1.3rem">Logs</Header>
        <Content>
          {#if traceLogs.length > 0}
            <LogAccordion logRecords={traceLogs} />
          {:else}
            <Paper variant="unelevated">No logs found</Paper>
          {/if}
        </Content>
      </Panel>
    </Accordion>
  </PaperContent>
</Paper>
