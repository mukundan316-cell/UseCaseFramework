import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Calendar, ExternalLink, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface PresentationPreviewBlockProps {
  presentationUrl?: string;
  presentationPdfUrl?: string;
  presentationFileName?: string;
  presentationUploadedAt?: string;
  hasPresentation?: 'true' | 'false';
  showTitle?: boolean;
  className?: string;
}

export default function PresentationPreviewBlock({
  presentationUrl,
  presentationPdfUrl,
  presentationFileName,
  presentationUploadedAt,
  hasPresentation,
  showTitle = true,
  className = ""
}: PresentationPreviewBlockProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [proxyUrl, setProxyUrl] = useState<string | null>(null);

  // Don't render if no presentation exists
  if (hasPresentation !== 'true' || !presentationFileName) {
    return null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const handleDownload = () => {
    if (presentationUrl) {
      window.open(presentationUrl, '_blank');
    }
  };

  const getProxyUrl = (url: string): string => {
    const encodedUrl = encodeURIComponent(url);
    return `/api/presentations/proxy/${encodedUrl}`;
  };

  const handlePreview = () => {
    if (!presentationPdfUrl) return;
    
    setIsPreviewOpen(true);
    // Set the proxy URL directly
    const url = getProxyUrl(presentationPdfUrl);
    setProxyUrl(url);
  };

  // Reset proxy URL when dialog closes
  useEffect(() => {
    if (!isPreviewOpen) {
      setProxyUrl(null);
    }
  }, [isPreviewOpen]);

  return (
    <>
      <Card className={className}>
        {showTitle && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Presentation Documents
            </CardTitle>
            <CardDescription>
              Supporting presentation materials for this use case
            </CardDescription>
          </CardHeader>
        )}
        <CardContent className={showTitle ? '' : 'pt-6'}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate" title={presentationFileName}>
                  {presentationFileName}
                </h4>
                {presentationUploadedAt && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>Uploaded {formatDate(presentationUploadedAt)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    Presentation
                  </Badge>
                  {presentationPdfUrl && (
                    <Badge variant="outline" className="text-xs">
                      PDF Preview Available
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              {presentationPdfUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handlePreview();
                  }}
                  data-testid="button-preview-presentation"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              )}
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDownload();
                }}
                data-testid="button-download-presentation"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PDF Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl w-full h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {presentationFileName}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden">
            {proxyUrl ? (
              <iframe
                src={`${proxyUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                className="w-full h-full border-0"
                title="Presentation Preview"
                data-testid="presentation-pdf-viewer"
              />
            ) : presentationPdfUrl ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Click "Preview" to load the PDF</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">PDF preview not available</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={handleDownload}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Original File
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}