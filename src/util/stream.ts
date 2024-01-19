export async function readBodyInit(bodyInit: BodyInit): Promise<string> {
  if (typeof bodyInit === "string") {
    // If it's already a string, return it
    return bodyInit;
  } else if (bodyInit instanceof Blob) {
    // If it's a Blob, read it as text
    return await bodyInit.text();
  } else if (bodyInit instanceof ArrayBuffer) {
    // If it's an ArrayBuffer, create a Uint8Array and read it as text
    return new TextDecoder().decode(new Uint8Array(bodyInit));
  } else if (bodyInit instanceof ReadableStream) {
    // If it's a ReadableStream, use readStreamFully to read it fully
    return await readStreamFully(bodyInit as ReadableStream<Uint8Array>);
  } else if (bodyInit instanceof FormData) {
    const entries: Record<string, string> = {};
    for (const [key, value] of bodyInit.entries()) {
      if (typeof value === "string") {
        entries[key] = value;
      } else {
        entries[key] = `File(${value.name})`;
      }
    }
    return JSON.stringify(entries);
  } else if (bodyInit instanceof URLSearchParams) {
    return bodyInit.toString();
  } else {
    return "UNSUPPORTED BODY";
  }
}

export async function readStreamFully(
  stream: ReadableStream<Uint8Array>,
): Promise<string> {
  const reader = stream.getReader();
  let result = "";

  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      if (value) {
        // Assuming the content is UTF-8 encoded, you can convert the Uint8Array to a string
        const chunk = new TextDecoder().decode(value);
        result += chunk;
      }
    }

    return result;
  } finally {
    // Ensure the reader is closed when done
    reader.releaseLock();
  }
}
