import React, {useState} from 'react';
import './App.css';
import Button from 'react-bootstrap/Button';
import { ArrowUp, ArrowDown}  from 'react-bootstrap-icons';
import { PDFDocument } from "pdf-lib";

const fs = window.require('fs'); // VERY important to use window.require instead of require https://github.com/electron/electron/issues/7300
const { dialog, BrowserWindow } = window.require('electron').remote;

async function mergePdfs(pdfs) {
  let pages = [];
  let mergedDoc = await PDFDocument.create();
  for (const pdf of pdfs) {
    let uint8Array = fs.readFileSync(pdf)
    let pdfDoc = await PDFDocument.load(uint8Array);
    let docPages = pdfDoc.getPages();
    let pageIndices = [...Array(docPages.length).keys()]
    let copiedPages = await mergedDoc.copyPages(pdfDoc, pageIndices)
    pages.push(...copiedPages);
  };
  
  pages.forEach(page => {
    mergedDoc.addPage(page)
  })
  let pdfBytes = await mergedDoc.save()
  fs.writeFile(`output_${Date.now()}.pdf`, pdfBytes, 'utf8', (e) => {console.log(e)} );
  console.log(`output_${Date.now()}.pdf written`);
}

function App() {
  const [files, setFiles] = useState([])

  const ondrop = (e) => {
    e.preventDefault();
    setFiles([...e.dataTransfer.files].map(f => (f.path)));
  }

  const handleSelector = () => {
    dialog.showOpenDialog({
      filters: [
        {name: 'PDF', extensions: ['pdf']}
      ],
      properties: ['multiSelections']
    }).then((f) => {setFiles(f.filePaths)})
  }
  
  const ondragover = (e) => {
    e.stopPropagation();
    e.preventDefault();
  }
  
  const moveup = (index) => {
    if (index < 1) return;
    var newFiles = [...files];
    var file = files[index];
    newFiles.splice(index, 1);
    newFiles.splice(index-1, 0, file);
    setFiles(newFiles);
  }

  const movedown = (index) => {
    if (files.length === index + 1) return;
    var newFiles = [...files];
    var file = files[index];
    newFiles.splice(index, 1);
    newFiles.splice(index+1, 0, file);
    setFiles(newFiles);
  }

  const FileList = () => (
    <div id="files">
      {files.map((file, i) =>
        <div key={i}>{`${i+1}.) ${file}`} <Button onClick={ () => (moveup(i)) }><ArrowUp /></Button><Button onClick={ () => (movedown(i)) }><ArrowDown /></Button> </div>
      )}
    </div>
  )

  return (
    <div className="App" onDrop={ondrop} onDragOver={ondragover}>
      <div id="drag-file" onDrop={ondrop} onDragOver={ondragover}>
        <Button onClick={handleSelector}>Select</Button> or drag your files here
      </div>
      <FileList />
      <Button onClick={() => {if (files.length > 0) mergePdfs(files).then(BrowserWindow.getFocusedWindow().reload())}}>Merge PDFs</Button>
    </div>
  );
}

export default App;
