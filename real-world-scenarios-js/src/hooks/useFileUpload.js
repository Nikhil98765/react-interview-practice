import { useState } from "react";

export const useFileUpload = ({ uploadUrl, options = {} }) => {
  const { maxSizeMB = 5, accept = "*" } = options;
  
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);


  const handleChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) {
      return;
    }

    if (selected.size > maxSizeMB * 1024 * 1024) {
      return setError(`File exceeds ${maxSizeMB} limit`);
    }

    setError('');
    setFile(selected);
    if (selected.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(selected));
    }
  }

  const handleUpload = (e) => {
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    setUploading(true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    }

    xhr.onload = () => {
      setResult(JSON.parse(xhr.responseText));
      setUploading(false);
      if (preview) {
        URL.revokeObjectURL(file)
      }
    }

    xhr.onerror = (e) => {
      setError('Upload failed');
      setUploading(false);
    }

    xhr.open("POST", uploadUrl);
    xhr.send(formData);
  }

  const reset = () => {
    setFile(null);
    setError('');
    setResult(null);
    setProgress(0);
    setPreview('');
  }

  return {
    handleChange,
    handleUpload,
    uploading,
    progress,
    error,
    result,
    file,
    preview,
    reset
  }
}