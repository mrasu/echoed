import { opentelemetry } from "@/generated/otelpbj";
import { toBase64String } from "@/util/byte";
import {
  IAnyValue,
  IArrayValue,
  IKeyValue,
  IKeyValueList,
} from "@shared/type/echoedParam";

export function convertAnyValue(
  val: opentelemetry.proto.common.v1.IAnyValue,
): IAnyValue {
  if (!val) return val;

  return {
    stringValue: val.stringValue ?? undefined,
    boolValue: val.boolValue ?? undefined,
    intValue: val.intValue?.toString(),
    doubleValue: val.doubleValue ?? undefined,
    arrayValue: convertArrayValue(val.arrayValue),
    kvlistValue: convertKvlistValue(val.kvlistValue),
    base64BytesValue: toBase64String(val.bytesValue),
  };
}

function convertArrayValue(
  arrayValue: opentelemetry.proto.common.v1.IArrayValue | null | undefined,
): IArrayValue | undefined {
  if (!arrayValue) return undefined;

  const vals = arrayValue.values;
  return {
    values: vals?.map((val) => convertAnyValue(val)),
  };
}

function convertKvlistValue(
  kvValue: opentelemetry.proto.common.v1.IKeyValueList | null | undefined,
): IKeyValueList | undefined {
  if (!kvValue) return undefined;

  const values = kvValue.values;
  return {
    values: values?.map((val) => {
      return convertKeyValue(val);
    }),
  };
}

function convertKeyValue(
  kv: opentelemetry.proto.common.v1.IKeyValue,
): IKeyValue {
  return {
    key: kv.key ?? undefined,
    value: kv.value ? convertAnyValue(kv.value) : undefined,
  };
}
