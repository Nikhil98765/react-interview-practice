import React, { useState } from 'react';

export const UploadProgress = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);

  const handleChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!file) {
      setStatus('Please select a file !');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => setStatus('Upload Complete!');
    xhr.onerror = () => setStatus('Failed to upload!');

    xhr.open('POST', 'https://api.escuelajs.co/api/v1/files/upload');
    xhr.send(formData);
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleChange} />
      <button onClick={handleUpload}>Upload</button>
      {progress > 0 && (
        <div style={{ marginTop: '12px' }}>
          <div
            style={{
              width: `${progress}%`,
              height: '8px',
              background: 'teal',
              borderRadius: '4px',
              transition: 'width 0.3s ease',
            }}
          />
          <span>{progress}%</span>
        </div>
      )}
      {status && <p>{status}</p>}
    </div>
  );
};
