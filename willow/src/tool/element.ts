export function createCanvasElement(): HTMLCanvasElement {
  const canvas = createElementNS("canvas");
  canvas.style.display = "block";
  return canvas;
}

function createElementNS(name) {
  return document.createElementNS("http://www.w3.org/1999/xhtml", name);
}
