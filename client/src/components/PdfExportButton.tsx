import React from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PdfExportButtonProps {
  type: 'template' | 'responses';
  id: string; // questionnaireId for template, responseId for responses
  title?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function PdfExportButton({ 
  type, 
  id, 
  title, 
  variant = 'outline', 
  size = 'sm',
  className = ''
}: PdfExportButtonProps) {
  const [isExporting, setIsExporting] = React.useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Determine the correct endpoint based on type
      const endpoint = type === 'template' 
        ? `/api/export/questionnaire/${id}/template`
        : `/api/export/questionnaire/${id}/responses`;
      
      // Make the request
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Export failed');
      }
      
      // Get the PDF blob
      const blob = await response.blob();
      
      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `questionnaire_${type}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "PDF Export Successful",
        description: `${type === 'template' ? 'Blank questionnaire' : 'Completed responses'} exported successfully.`,
        duration: 3000
      });
      
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : 'An error occurred during export.',
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setIsExporting(false);
    }
  };

  const buttonText = title || (type === 'template' ? 'Export Template' : 'Export Responses');
  
  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant={variant}
      size={size}
      className={className}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4 mr-2" />
      )}
      {isExporting ? 'Exporting...' : buttonText}
    </Button>
  );
}