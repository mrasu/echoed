<script lang="ts">
  import type { Trace, Fetch, TestInfo } from "../../../lib/EchoedParam";
  import DataTable, { Body, Row, Cell } from "@smui/data-table";
  import Paper, { Title, Content as PaperContent } from "@smui/paper";
  import Accordion, { Panel, Header, Content } from "@smui-extra/accordion";
  import { Text } from "@smui/list";
  import Breadcrumb from "../../../components/breadcrumb/Breadcrumb.svelte";
  import TraceWithLog from "../../../components/trace/TraceWithLog.svelte";

  export let traceId: string;
  export let testInfo: TestInfo;
  export let traceFetch: Fetch | undefined;
  export let trace: Trace;
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

    <TraceWithLog {trace} />
  </PaperContent>
</Paper>
