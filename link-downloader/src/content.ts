const includes: string[] = [".html", "/", ".js", ".css", ".pdf"];
export function linkFilter(
  allLinks: Array<HTMLAnchorElement>,
  includes: string[] = [".html", "/", ".js", ".css", ".pdf"],
  excludes: string[] = ["https://learnwebgl.brown37.net/"]
) {
  return allLinks.filter((a) => {
    return includes.some(
      (inc) => a.href.endsWith(inc) && !excludes.includes(a.href)
    );
  });
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "loadLinksData") {
    const allLinks = document.getElementsByTagName("a");
    const linkCandi = linkFilter([...allLinks]);
    sendResponse({
      links: linkCandi.map((a) => [a.text, a.href]),
      host: window.location.host,
    });
  }
});
