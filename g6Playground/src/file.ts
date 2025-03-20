import { TarWriter } from '@gera2ld/tarjs'
const writer = new TarWriter()
async function putFolder(folder: any, currentLoc: string = '') {
  currentLoc = currentLoc !== '' ? `${currentLoc}/${folder.name}` : `${folder.name}`
  if (currentLoc !== '') {
    writer.addFolder(currentLoc)
  } else {
    writer.addFolder(currentLoc)
  }

  for await (const handle of folder.values()) {
    if (handle.kind === 'file') {
      const content = (await handle.getFile()) as File
      writer.addFile(`${currentLoc}/${handle.name}`, content)
    } else if (handle.kind === 'directory') {
      await putFolder(handle, currentLoc)
    }
  }
}
async function clickUpload() {
  const entryDir = await window.showDirectoryPicker()
  await putFolder(entryDir, 'package')
  const blob = await writer.write()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'archive.tar' // Set the desired file name
  document.body.appendChild(a)
  a.click() // Programmatically click the link to trigger the download
  document.body.removeChild(a) // Clean up the DOM
  URL.revokeObjectURL(url) // Free up memory
}
const cat = (f) =>
  new Promise((resolve) =>
    Object.assign(new FileReader(), {
      onload() {
        resolve(this.result)
      }
    }).readAsText(f)
  )

async function saveUint8ArrayToFile(data: Uint8Array, filename: string) {
  const blob = new Blob([data], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function saveObjectAsJson(object, filename) {
  const jsonString = JSON.stringify(object, null, 2); // Convert object to JSON string
  const blob = new Blob([jsonString], { type: 'application/json' }); // Create a Blob
  const url = URL.createObjectURL(blob); // Create a URL for the Blob
  const a = document.createElement('a'); // Create an anchor element
  a.href = url; // Set the URL as the href
  a.download = filename; // Set the desired file name
  document.body.appendChild(a); // Append the anchor to the body
  a.click(); // Programmatically click the anchor to trigger the download
  document.body.removeChild(a); // Remove the anchor from the document
  URL.revokeObjectURL(url); // Revoke the Blob URL
}