<script lang="ts">
  import { Span } from "../../lib/EchoedParam";
  import DataTable, { Body, Row, Cell } from "@smui/data-table";
  import Paper, { Title, Content as PaperContent } from "@smui/paper";
  import Accordion, { Panel, Header, Content } from "@smui-extra/accordion";
  import AttributeDataTable from "./AttributeDataTable.svelte";

  export let span: Span;
</script>

<Paper variant="unelevated">
  <PaperContent>
    <DataTable style="width: 100%">
      <Body>
        <Row>
          <Cell style="width: 100px">Name</Cell>
          <Cell>{span.name}</Cell>
        </Row>
        <Row>
          <Cell>Service</Cell>
          <Cell>{span.serviceName}</Cell>
        </Row>
        <Row>
          <Cell>TraceId</Cell>
          <Cell>{span.traceId}</Cell>
        </Row>
        <Row>
          <Cell>SpanId</Cell>
          <Cell>{span.spanId}</Cell>
        </Row>
        <Row>
          <Cell>ParentSpanId</Cell>
          <Cell>{span.parentSpanId}</Cell>
        </Row>
        <Row>
          <Cell>StartTime</Cell>
          <Cell>{span.startTime.toISOString()} ({span.startTimeUnixNano})</Cell>
        </Row>
        <Row>
          <Cell>EndTime</Cell>
          <Cell>{span.endTime.toISOString()} ({span.endTimeUnixNano})</Cell>
        </Row>
        <Row>
          <Cell>Kind</Cell>
          <Cell>{span.kind}</Cell>
        </Row>
        <Row>
          <Cell>Status</Cell>
          {#if span.status}
            <Cell>{JSON.stringify(span.status)}</Cell>
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
    <AttributeDataTable attributes={span.attributes} />
  </PaperContent>
</Paper>
<Accordion multiple>
  <Panel open={true}>
    <Header style="font-size: 1.7rem">Resource</Header>
    <Content>
      {#if span.resource}
        <Paper variant="unelevated">
          <PaperContent>
            <DataTable style="width: 100%">
              <Body>
                <Row>
                  <Cell style="width: 100px">DroppedAttributesCount</Cell>
                  <Cell>{span.resource.droppedAttributesCount}</Cell>
                </Row>
              </Body>
            </DataTable>
          </PaperContent>
        </Paper>
        <Paper variant="unelevated">
          <Title>Attributes</Title>
          <PaperContent>
            <AttributeDataTable attributes={span.resource.attributes} />
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
      {#if span.scope}
        <Paper variant="unelevated">
          <PaperContent>
            <DataTable style="width: 100%">
              <Body>
                <Row>
                  <Cell style="width: 100px">Name</Cell>
                  <Cell>{span.scope.name}</Cell>
                </Row>
                <Row>
                  <Cell>Version</Cell>
                  <Cell>{span.scope.version}</Cell>
                </Row>
                <Row>
                  <Cell>DroppedAttributesCount</Cell>
                  <Cell>{span.scope.droppedAttributesCount}</Cell>
                </Row>
              </Body>
            </DataTable>
          </PaperContent>
        </Paper>
        <Paper variant="unelevated">
          <Title>Attributes</Title>
          <PaperContent>
            <AttributeDataTable attributes={span.scope.attributes} />
          </PaperContent>
        </Paper>
      {:else}
        <Paper variant="unelevated">No resource found</Paper>
      {/if}
    </Content>
  </Panel>
</Accordion>
