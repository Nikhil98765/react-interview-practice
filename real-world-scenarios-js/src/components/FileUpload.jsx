import React, { useState } from 'react';

export const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [preview, setPreview] = useState('');

  const handleChange = (e) => {
    setFile(e.target.files[0]);
    setPreview(URL.createObjectURL(e.target.files[0]));
  };

  const handleUpload = async () => {
    if (!file) return setStatusText('Please select a file !');

    const formData = new FormData();
    formData.append('file', file);

    URL.revokeObjectURL(file);
    setUploading(true);

    try {
      const res = await fetch('https://api.escuelajs.co/api/v1/files/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      console.log('🚀 ~ handleUpload ~ data:', data.location);
      setStatusText(`Uploaded: ${data.location}`);
    } catch (e) {
      setStatusText('Failed to upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleChange} />
      {file && (
        <p>
          {file.name} - {(file.size / 1024).toFixed(1)} KB
        </p>
      )}
      {preview && (
        <img
          src={preview}
          alt="image preview"
          width={200}
          style={{ borderRadius: '8px' }}
        />
      )}
      <button onClick={handleUpload} disabled={uploading || !file}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {statusText && <p>{statusText}</p>}
    </div>
  );
};
