import "./App.css";
import * as React from "react";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import { linkFilter } from "./content";
const parser = new DOMParser();

function App() {
  const [list, slist] = React.useState<Array<string>>([]);

  const [log, slog] = React.useState<string>("");
  const [checkboxStatus, scheckboxStatus] = React.useState<Array<boolean>>([]);
  const host = React.useRef<string>("");
  const downloadTaskInDirectory = React.useRef<Array<string>>([]);

  React.useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      let activeTab = tabs[0];
      if (activeTab) {
        chrome.tabs.sendMessage(
          activeTab.id,
          { action: "loadLinksData" },
          function (response) {
            if (chrome.runtime.lastError) {
              console.error("Error sending message:", chrome.runtime.lastError);
            } else {
              slist(response.links);
              host.current = response.host;
              scheckboxStatus(new Array(response.links.length).fill(false));
            }
          }
        );
      }
    });
  }, []);

  function onChange(idx: number, status: boolean) {
    checkboxStatus[idx] = status;
    scheckboxStatus([...checkboxStatus]);
  }

  const labels = list.map(([name, url], idx) => {
    return (
      <FormControlLabel
        control={
          <Checkbox
            checked={checkboxStatus[idx]}
            onChange={(event) => {
              onChange(idx, event.target.checked);
            }}
          />
        }
        label={name}
      />
    );
  });
  function dealWithUrl(url: string, asyncTasks: any, contexts: any) {
    const isDir = url.endsWith("/");
    if (isDir) {
      contexts.push(url);
      asyncTasks.push(fetch(url).then((resp) => resp.text()));
    } else {
      const firstSlashIndex = url.indexOf("/", "https://".length);
      chrome.downloads.download(
        {
          url: url,
          filename: url.slice(firstSlashIndex + 1),
        },
        () => {}
      );
    }
  }

  const [isAllSelected, sisAllSelected] = React.useState(false);
  function selectAllChange(evt) {
    const checked = evt.target.checked;
    sisAllSelected(checked);
    if (checked) {
      scheckboxStatus(new Array(checkboxStatus.length).fill(true));
    } else {
      scheckboxStatus(new Array(checkboxStatus.length).fill(false));
    }
  }

  function processAsyncTasks(asyncTasks: Promise<any>[], contexts: string[]) {
    if (asyncTasks.length === 0) return;

    Promise.all(asyncTasks).then((htmls) => {
      const list = htmls.flatMap((html, idx) => {
        const dom = parser.parseFromString(html, "text/html");
        const allAs = linkFilter([...dom.getElementsByTagName("a")]);
        return allAs.map((a) => {
          const href = a.getAttribute("href");
          if (href?.startsWith("/")) {
            return host.current + href;
          } else {
            return contexts[idx] + href;
          }
        });
      });

      const asyncTasksNested = [] as Array<Promise<any>>;
      const contextsNested = [] as Array<string>;
      list.forEach((url, idx) => {
        if (!contexts.includes(url)) {
          dealWithUrl(url, asyncTasksNested, contextsNested);
        }
      });
      processAsyncTasks(asyncTasksNested, contextsNested);
    });
  }

  function download() {
    const asyncTasks = [] as Array<Promise<any>>;
    const contexts = [] as Array<string>;
    checkboxStatus.forEach((checked, idx) => {
      const url = list[idx][1];
      if (checked) {
        dealWithUrl(url, asyncTasks, contexts);
      }
    });
    processAsyncTasks(asyncTasks, contexts);
  }

  return (
    <>
      <h2
        style={{
          marginTop: "0px",
          textAlign: "center",
        }}
      >
        <img
          src="/logo.png"
          height="22px"
          style={{
            verticalAlign: "sub",
          }}
        />{" "}
        downloader
      </h2>
      <div style={{ fontSize: "16px" }}>Found links: </div>
      <FormGroup>{labels}</FormGroup>
      <Button onClick={download} variant="contained" size="small">
        Download
      </Button>
      <FormControlLabel
        style={{ marginLeft: "15px" }}
        control={
          <Checkbox checked={isAllSelected} onChange={selectAllChange} />
        }
        label="Select All"
      />
      <div>{log}</div>
    </>
  );
}

export default App;
