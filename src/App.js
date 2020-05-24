import React, {useState} from 'react';
import './App.css';
import Button from 'react-bootstrap/Button';
import { ArrowUp, ArrowDown}  from 'react-bootstrap-icons';
import { PDFDocument } from "pdf-lib";
const fs = window.require('fs'); // VERY important to use window.require instead of require https://github.com/electron/electron/issues/7300


async function mergePdfs(pdfs) {
  let pages = [];
  const mergedDoc = await PDFDocument.create();
  for (const pdf of pdfs) {
    let uint8Array = fs.readFileSync(pdf)
    let pdfDoc = await PDFDocument.load(uint8Array);
    let docPages = pdfDoc.getPages();
    let pageIndices = [...Array(docPages.length).keys()]
    let copiedPages = await mergedDoc.copyPages(pdfDoc, pageIndices)
    pages.push(...copiedPages);
  }
  console.log(pages);
  
  pages.forEach(page => {
    mergedDoc.addPage(page)
  })
  const pdfBytes = await mergedDoc.save()
  fs.writeFile('output.pdf', pdfBytes, (e) => {console.log(e);})
}

function App() {
  const [files, setFiles] = useState([])

  const ondrop = (e) => {
    e.preventDefault();
    setFiles([...e.dataTransfer.files]);
    Array.from(e.dataTransfer.files).forEach(f => {
      console.log(f);
    });
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
    <div>
      {files.map((file, i) =>
        <p key={i}>{file.name} <Button onClick={ () => (moveup(i)) }><ArrowUp /></Button> <Button onClick={ () => (movedown(i)) }><ArrowDown /></Button> </p>
      )}
    </div>
  )

  return (
    <div className="App">
      <div id="drag-file" onDrop={ondrop} onDragOver={ondragover}>
        Drag your files here
      </div>
      <FileList />
      <Button onClick={() => (mergePdfs(files.map(f => (f.path))))}>Merge PDFs</Button>
    </div>
  );
}

export default App;
