import React from "react";
import { useState } from "react";
import { isUploadTypeSupported, supportedUploadTypes } from "../services/erpService";

const formatFileSize = (size) => {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))} KB`;
};

export default function FileUpload({ onFilesChange }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const files = Array.from(event.target.files ?? []);
    const invalidFile = files.find((file) => !isUploadTypeSupported(file.name));

    if (invalidFile) {
      setError("Only PDF, JPG, PNG, and DOCX files are supported.");
      return;
    }

    setError("");
    setSelectedFiles(files);
    onFilesChange?.(files);
  };

  return (
    <div className="file-upload">
      <label className="file-upload__dropzone">
        <input
          accept={supportedUploadTypes}
          multiple
          onChange={handleChange}
          type="file"
        />
        <strong>Upload supporting files</strong>
        <span>Accepted formats: PDF, JPG, PNG, DOCX</span>
      </label>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="file-upload__list">
        {selectedFiles.length > 0 ? (
          selectedFiles.map((file) => (
            <div className="file-upload__item" key={`${file.name}-${file.size}`}>
              <strong>{file.name}</strong>
              <span>{formatFileSize(file.size)}</span>
            </div>
          ))
        ) : (
          <p className="empty-state">Uploaded files will appear here.</p>
        )}
      </div>
    </div>
  );
}
