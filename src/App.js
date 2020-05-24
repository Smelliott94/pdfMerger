import React, {useState} from 'react';
import './App.css';
import Button from 'react-bootstrap/Button'
import { ArrowUp, ArrowDown}  from 'react-bootstrap-icons'


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
    </div>
  );
}

export default App;
