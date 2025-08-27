import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Upload, X, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PresentationUploadBlockProps {
  onUploadComplete: (data: {
    presentationUrl: string;
    presentationPdfUrl: string;
    presentationFileName: string;
  }) => void;
  currentFileName?: string;
  disabled?: boolean;
  className?: string;
}

export default function PresentationUploadBlock({
  onUploadComplete,
  currentFileName,
  disabled = false,
  className = ""
}: PresentationUploadBlockProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'application/vnd.ms-powerpoint', // .ppt
      'application/pdf', // .pdf
      'image/jpeg', // .jpg, .jpeg
      'image/jpg', // .jpg
      'image/png', // .png
      'image/gif', // .gif
      'image/bmp', // .bmp
      'image/webp' // .webp
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PowerPoint file (.pptx, .ppt), PDF, or image file (.jpg, .png, .gif, .bmp, .webp)');
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('presentation', file);

      const response = await fetch('/api/presentations/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      onUploadComplete({
        presentationUrl: result.presentationUrl,
        presentationPdfUrl: result.presentationPdfUrl,
        presentationFileName: file.name,
      });

      toast({
        title: "Upload successful",
        description: "Your presentation has been uploaded and converted to PDF for preview.",
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading your presentation. Please try again.",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [onUploadComplete, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const removePresentation = useCallback(() => {
    onUploadComplete({
      presentationUrl: '',
      presentationPdfUrl: '',
      presentationFileName: '',
    });
    toast({
      title: "Presentation removed",
      description: "The presentation has been removed from this use case.",
    });
  }, [onUploadComplete, toast]);

  return (
    <Card className={`${className} ${dragOver ? 'border-blue-500 bg-blue-50' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Presentation Documents
        </CardTitle>
        <CardDescription>
          Upload PowerPoint presentations (.pptx, .ppt), PDF files, or images (.jpg, .png, .gif, .bmp, .webp) to enhance your use case documentation.
          Files will be automatically converted to PDF for preview.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {currentFileName ? (
          <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">{currentFileName}</p>
                <p className="text-sm text-green-600">Presentation uploaded and ready for preview</p>
              </div>
            </div>
            {!disabled && (
              <Button
                variant="ghost"
                size="sm"
                onClick={removePresentation}
                data-testid="button-remove-presentation"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            data-testid="presentation-upload-area"
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload Presentation
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your PowerPoint file, PDF, or image here, or click to browse
            </p>
            <input
              type="file"
              accept=".pptx,.ppt,.pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp"
              onChange={handleFileSelect}
              disabled={disabled || isUploading}
              className="hidden"
              id="presentation-upload"
              data-testid="input-presentation-file"
            />
            <Button
              variant="outline"
              disabled={disabled || isUploading}
              onClick={() => document.getElementById('presentation-upload')?.click()}
              data-testid="button-browse-presentation"
            >
              {isUploading ? 'Uploading...' : 'Browse Files'}
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              Supports .pptx, .ppt, .pdf, and image files (.jpg, .png, .gif, .bmp, .webp) up to 50MB
            </p>
          </div>
        )}

        {isUploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Uploading and converting...</span>
              <span className="text-sm text-gray-500">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}