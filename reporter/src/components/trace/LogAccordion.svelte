<script lang="ts">
  import { LogRecord } from "../../lib/EchoedParam";
  import DataTable, { Body, Row, Cell } from "@smui/data-table";
  import Paper, { Title, Content as PaperContent } from "@smui/paper";
  import Accordion, { Panel, Header, Content } from "@smui-extra/accordion";
  import AttributeDataTable from "./AttributeDataTable.svelte";

  export let logRecords: LogRecord[];
</script>

<Accordion multiple>
  {#each logRecords as log}
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
                  <Cell>{log.time.toISOString()} ({log.timeUnixNano})</Cell>
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
