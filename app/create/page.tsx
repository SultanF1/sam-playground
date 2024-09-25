"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface UploadResponse {
  success: boolean;
  message: string;
  fileUrl?: string;
}

export default function PDFUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (
      uploadedFile &&
      (uploadedFile.type === "application/pdf" ||
        uploadedFile.type === "text/plain")
    ) {
      if (uploadedFile.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: "The maximum file size is 5MB.",
          variant: "destructive",
        });
        return;
      }
      setFile(uploadedFile);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "text/plain": [".txt", ".text"] },
    multiple: false,
  });

  const uploadFile = async () => {
    if (!file) return;

    setUploadStatus("uploading");

    try {
      const formdata = new FormData();
      formdata.append("file", file);

      const requestOptions = {
        method: "POST",
        body: formdata,
        redirect: "follow",
      };

      const response = await fetch(
        "http://localhost:8080/upload",
        requestOptions,
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result: UploadResponse = await response.json();

      if (result.success) {
        setUploadStatus("success");
        toast({
          title: "Upload successful",
          description: "Your PDF has been uploaded.",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      setUploadStatus("error");
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadStatus("idle");
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-gray-300 hover:border-primary"
        }`}
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="flex flex-col items-center">
            <File className="w-12 h-12 text-primary mb-2" />
            <p className="text-sm text-gray-600">{file.name}</p>
            <p className="text-xs text-gray-500 mt-1">
              ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-600">
              Drag & drop a PDF or text file here, or click to select
            </p>
            <p className="text-xs text-gray-500 mt-1">Maximum file size: 5MB</p>
          </div>
        )}
      </div>
      <div className="flex justify-center mt-4">
        {uploadStatus === "success" ? (
          <Button onClick={resetUpload} className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Upload Another
          </Button>
        ) : uploadStatus === "error" ? (
          <Button
            onClick={resetUpload}
            variant="destructive"
            className="flex items-center"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        ) : (
          <Button
            onClick={uploadFile}
            disabled={!file || uploadStatus === "uploading"}
            className="flex items-center"
          >
            {uploadStatus === "uploading" ? (
              <>
                <AlertCircle className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
