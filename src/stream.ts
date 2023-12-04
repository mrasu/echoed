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
    // If it's a ReadableStream, use the previous example to read it fully
    return await readStreamFully(bodyInit);
  } else if (
    bodyInit instanceof FormData ||
    bodyInit instanceof URLSearchParams
  ) {
    // For FormData or URLSearchParams, convert to string
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
