#!/usr/bin/env -S /path/to/node -experimental-default-type=module
// Node.js Native Messaging host
// guest271314, 10-9-2022
/*
#!/usr/bin/env -S /home/user/bin/deno run -A /home/user/bin/nm_host.js
#!/usr/bin/env -S /home/user/bin/node --experimental-default-type=module /home/user/bin/nm_host.js
#!/usr/bin/env -S /home/user/bin/bun run --smol /home/user/bin/nm_host.js
*/

const runtime = navigator.userAgent;
const buffer = new ArrayBuffer(0, { maxByteLength: 1024 ** 2 });
const view = new DataView(buffer);
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const { dirname, filename, url } = import.meta;
import fs from "fs";
let readable, writable, exit, args;

if (runtime.startsWith("Deno")) {
  ({ readable } = Deno.stdin);
  ({ writable } = Deno.stdout);
  ({ exit } = Deno);
  ({ args } = Deno);
}

if (runtime.startsWith("Node")) {
  const { Duplex } = await import("node:stream");
  ({ readable } = Duplex.toWeb(process.stdin));
  ({ writable } = Duplex.toWeb(process.stdout));
  ({ exit } = process);
  ({ argv: args } = process);
}

if (runtime.startsWith("Bun")) {
  readable = Bun.file("/dev/stdin").stream();
  writable = new WritableStream(
    {
      async write(value) {
        await Bun.write(Bun.stdout, value);
      },
    },
    new CountQueuingStrategy({ highWaterMark: Infinity })
  );
  ({ exit } = process);
  ({ argv: args } = Bun);
}

function encodeMessage(message) {
  return encoder.encode(JSON.stringify(message));
}

async function* getMessage() {
  let messageLength = 0;
  let readOffset = 0;
  for await (let message of readable) {
    if (buffer.byteLength === 0) {
      buffer.resize(4);
      for (let i = 0; i < 4; i++) {
        view.setUint8(i, message[i]);
      }
      messageLength = view.getUint32(0, true);
      message = message.subarray(4);
      buffer.resize(0);
    }
    buffer.resize(buffer.byteLength + message.length);
    for (let i = 0; i < message.length; i++, readOffset++) {
      view.setUint8(readOffset, message[i]);
    }
    if (buffer.byteLength === messageLength) {
      yield new Uint8Array(buffer);
      messageLength = 0;
      readOffset = 0;
      buffer.resize(0);
    }
  }
}

async function sendMessage(message) {
  await new Blob([
    new Uint8Array(new Uint32Array([message.length]).buffer),
    message,
  ])
    .stream()
    .pipeTo(writable, { preventClose: true });
}

try {
  await sendMessage(encodeMessage([{ dirname, filename, url }, ...args]));
  for await (const message of getMessage()) {
    await sendMessage(encodeMessage("node echo " + decoder.decode(message)));
  }
} catch (e) {
  exit();
}

function logToFile(message) {
  fs.appendFile("output.log", message + "\n", (err) => {
    console.log("Message appended to file");
  });
}

// Use the custom logger
/*
export {
  args,
  encodeMessage,
  exit,
  getMessage,
  readable,
  sendMessage,
  writable,
};
*/
