import React, { useState } from 'react';
import { Download, FileText, Table, Code, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ResponseExportLegoBlockProps {
  responseId: string;
  assessmentTitle?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showLabel?: boolean;
}

type ExportFormat = 'pdf' | 'excel' | 'json';

interface ExportOption {
  format: ExportFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
  mimeType: string;
  extension: string;
}

/**
 * LEGO Block: Response Export Component
 * Reusable export functionality for completed assessments
 * Supports PDF, Excel, and JSON formats with dropdown selection
 */
export default function ResponseExportLegoBlock({
  responseId,
  assessmentTitle = "Assessment Results",
  className = "",
  variant = "outline",
  size = "default",
  showLabel = true
}: ResponseExportLegoBlockProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [currentExport, setCurrentExport] = useState<ExportFormat | null>(null);

  const exportOptions: ExportOption[] = [
    {
      format: 'pdf',
      label: 'Executive Report',
      description: 'Professional assessment report with executive summary and insights',
      icon: <FileText className="h-4 w-4" />,
      mimeType: 'application/pdf',
      extension: 'pdf'
    },
    {
      format: 'excel',
      label: 'Excel Analysis',
      description: 'Detailed data export for analysis with scoring breakdown',
      icon: <Table className="h-4 w-4" />,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      extension: 'xlsx'
    },
    {
      format: 'json',
      label: 'Raw Data',
      description: 'Complete data export for integration and custom analysis',
      icon: <Code className="h-4 w-4" />,
      mimeType: 'application/json',
      extension: 'json'
    }
  ];

  const handleExport = async (format: ExportFormat) => {
    if (!responseId) {
      toast({
        title: "Export Error",
        description: "No assessment data available to export.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    setCurrentExport(format);

    try {
      const option = exportOptions.find(opt => opt.format === format);
      if (!option) throw new Error('Invalid export format');

      // Show initial loading toast
      toast({
        title: `Generating ${option.label}...`,
        description: "Please wait while we prepare your export.",
        duration: 3000
      });

      const response = await fetch(`/api/export/assessment/${responseId}?format=${format}`, {
        method: 'GET',
        headers: {
          'Accept': option.mimeType
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Export failed with status ${response.status}`);
      }

      // Get the blob data
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const sanitizedTitle = assessmentTitle.replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `${sanitizedTitle}_${timestamp}.${option.extension}`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Success feedback
      toast({
        title: "Export Complete",
        description: `${option.label} has been downloaded successfully.`,
        duration: 5000
      });

    } catch (error) {
      console.error('Export error:', error);
      
      const option = exportOptions.find(opt => opt.format === format);
      toast({
        title: "Export Failed",
        description: error instanceof Error 
          ? error.message 
          : `Failed to generate ${option?.label}. Please try again.`,
        variant: "destructive",
        duration: 7000
      });
    } finally {
      setIsExporting(false);
      setCurrentExport(null);
    }
  };

  const getCurrentExportLabel = () => {
    if (!currentExport) return '';
    const option = exportOptions.find(opt => opt.format === currentExport);
    return option?.label || '';
  };

  return (
    <div className={cn("inline-flex", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={variant}
            size={size}
            disabled={isExporting || !responseId}
            className={cn(
              "flex items-center space-x-2",
              "hover:bg-[#005DAA] hover:text-white",
              "data-[state=open]:bg-[#005DAA] data-[state=open]:text-white"
            )}
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {showLabel && <span>Exporting...</span>}
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                {showLabel && <span>Export</span>}
                <ChevronDown className="h-3 w-3 opacity-70" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-80">
          {exportOptions.map((option) => (
            <DropdownMenuItem
              key={option.format}
              onClick={() => handleExport(option.format)}
              disabled={isExporting}
              className={cn(
                "flex items-start space-x-3 p-4 cursor-pointer",
                "hover:bg-[#005DAA] hover:text-white",
                "focus:bg-[#005DAA] focus:text-white",
                currentExport === option.format && "opacity-50 cursor-wait"
              )}
            >
              <div className="flex-shrink-0 mt-0.5">
                {option.icon}
              </div>
              <div className="flex-1 space-y-1">
                <div className="font-medium text-sm">
                  {option.label}
                  {currentExport === option.format && (
                    <span className="ml-2 text-xs opacity-70">Generating...</span>
                  )}
                </div>
                <div className="text-xs opacity-70 leading-relaxed">
                  {option.description}
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Export types for use in other components
export type { ResponseExportLegoBlockProps, ExportFormat };