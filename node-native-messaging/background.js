globalThis.name = chrome.runtime.getManifest().short_name;

globalThis.port = chrome.runtime.connectNative(globalThis.name);
port.onMessage.addListener((message) => console.log(message));
port.onDisconnect.addListener((p) => console.log(chrome.runtime.lastError));
port.postMessage("123456");

chrome.runtime.onInstalled.addListener((reason) => {
  // console.log(reason);
});
