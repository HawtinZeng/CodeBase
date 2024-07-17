/**
  For test
  console.log("backgroundjs running");
  chrome.action.onClicked.addListener(() => console.log("clicked..."));
*/

let port = chrome.runtime.connectNative("ping_pong");

port.onMessage.addListener((response) => {
  console.log("Received: " + response);
});

chrome.action.onClicked.addListener(() => {
  console.log("Sending:  ping");
  port.postMessage("ping");
});
