import React, { useState } from 'react'

export const MultiFileUpload = () => {
  const [files, setFiles] = useState([]);

  const handleChange = (e) => {
    setFiles(Array.from(e.target.files))
  }

  const handleUpload = async () => {
    const formData = new FormData();
    files.forEach(file => formData.append('file', file));
    await fetch('https://api.escuelajs.co/api/v1/files/upload', {
      method: 'POST',
      body: formData
    });
  }

  return (
    <div>
      <input type="file" multiple accept="image/*" onChange={handleChange} />
      <ul>
        {files.map((file) => (
          <li key={file.name}>
            {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </li>
        ))}
      </ul>
      <button onClick={handleUpload} disabled={!files.length}>Upload</button>
    </div>
  );
}
