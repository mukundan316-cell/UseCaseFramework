import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { FileText, Download, File, CheckSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface QuestionnaireExportLegoBlockProps {
  questionnaireId?: string;
  responseId?: string;
  assessmentTitle?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showLabel?: boolean;
}

type ExportType = 'template' | 'responses';

interface ExportOption {
  type: ExportType;
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

/**
 * LEGO Block: Questionnaire Export Component
 * Professional export functionality for questionnaire templates and completed responses
 * Supports downloading blank templates and populated assessment forms
 */
export default function QuestionnaireExportLegoBlock({
  questionnaireId,
  responseId,
  assessmentTitle = "Assessment Questionnaire",
  className = "",
  variant = "outline",
  size = "default",
  showLabel = true
}: QuestionnaireExportLegoBlockProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [currentExport, setCurrentExport] = useState<ExportType | null>(null);

  const exportOptions: ExportOption[] = [
    {
      type: 'template',
      label: 'Blank Template',
      description: 'Download questionnaire template for manual completion',
      icon: <File className="h-4 w-4" />,
      enabled: !!questionnaireId
    },
    {
      type: 'responses',
      label: 'Completed Assessment',
      description: 'Download questionnaire with all responses populated',
      icon: <CheckSquare className="h-4 w-4" />,
      enabled: !!responseId
    }
  ];

  const handleExport = async (type: ExportType) => {
    const option = exportOptions.find(opt => opt.type === type);
    if (!option || !option.enabled) {
      toast({
        title: "Export Error",
        description: "This export option is not available.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    setCurrentExport(type);

    try {
      // Show initial loading toast
      toast({
        title: `Generating ${option.label}...`,
        description: "Please wait while we prepare your download.",
        duration: 3000
      });

      // Determine endpoint based on export type
      let endpoint = '';
      if (type === 'template' && questionnaireId) {
        endpoint = `/api/export/questionnaire/${questionnaireId}/template`;
      } else if (type === 'responses' && responseId) {
        endpoint = `/api/export/questionnaire/${responseId}/responses`;
      } else {
        throw new Error('Invalid export configuration');
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf'
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
      const typeLabel = type === 'template' ? 'Template' : 'Responses';
      link.download = `RSA_${sanitizedTitle}_${typeLabel}_${timestamp}.pdf`;
      
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
    const option = exportOptions.find(opt => opt.type === currentExport);
    return option?.label || '';
  };

  const hasEnabledOptions = exportOptions.some(opt => opt.enabled);

  if (!hasEnabledOptions) {
    return null; // Don't render if no export options are available
  }

  return (
    <div className={cn("inline-flex", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={variant}
            size={size}
            disabled={isExporting}
            className={cn(
              "flex items-center space-x-2",
              "hover:bg-[#005DAA] hover:text-white",
              "data-[state=open]:bg-[#005DAA] data-[state=open]:text-white"
            )}
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                {showLabel && <span>Generating {getCurrentExportLabel()}...</span>}
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                {showLabel && <span>Download Questionnaire</span>}
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="px-3 py-2 text-sm font-semibold text-gray-900 border-b">
            Questionnaire Export Options
          </div>
          
          {exportOptions.map((option) => (
            <DropdownMenuItem
              key={option.type}
              onClick={() => option.enabled && handleExport(option.type)}
              disabled={!option.enabled || isExporting}
              className={cn(
                "flex items-start space-x-3 p-3",
                "hover:bg-blue-50 hover:text-blue-900",
                "focus:bg-blue-50 focus:text-blue-900",
                !option.enabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex-shrink-0 mt-0.5 text-gray-500">
                {option.icon}
              </div>
              <div className="flex-1 space-y-1">
                <div className="font-medium">{option.label}</div>
                <div className="text-sm text-gray-500 leading-relaxed">
                  {option.description}
                </div>
              </div>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <div className="px-3 py-2 text-xs text-gray-500">
            Professional PDF exports with RSA branding
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}