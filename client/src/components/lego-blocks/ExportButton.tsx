import React, { useState } from 'react';
import { Download, FileText, Loader2, ChevronDown, Sheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ExportButtonProps {
  exportType: 'assessment' | 'library' | 'portfolio' | 'use-case';
  exportId?: string; // For assessment responseId or use case id
  filters?: {
    category?: string;
    status?: string;
  };
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

/**
 * Reusable LEGO Export Button Component
 * Handles both PDF and Excel export for different content types with RSA branding
 */
export default function ExportButton({
  exportType,
  exportId,
  filters,
  variant = 'outline',
  size = 'default',
  className = '',
  children,
  disabled = false
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const getExportUrl = (format: 'pdf' | 'excel' = 'pdf'): string => {
    const baseUrl = format === 'excel' ? '/api/export/excel' : '/api/export';
    
    switch (exportType) {
      case 'assessment':
        if (!exportId) throw new Error('Assessment export requires responseId');
        return format === 'excel' ? `${baseUrl}/assessment/${exportId}` : `${baseUrl}/assessment/${exportId}`;
      
      case 'library':
        const params = new URLSearchParams();
        if (filters?.category) params.append('category', filters.category);
        if (filters?.status) params.append('status', filters.status);
        return `${baseUrl}/library${params.toString() ? `?${params.toString()}` : ''}`;
      
      case 'portfolio':
        return `${baseUrl}/portfolio`;
      
      case 'use-case':
        if (!exportId) throw new Error('Use case export requires use case id');
        return `${baseUrl}/use-case/${exportId}`;
      
      default:
        throw new Error(`Unsupported export type: ${exportType}`);
    }
  };

  const getButtonText = (): string => {
    switch (exportType) {
      case 'assessment':
        return 'Export Assessment Report';
      case 'library':
        return 'Export Library Catalog';
      case 'portfolio':
        return 'Export Active Portfolio';
      case 'use-case':
        return 'Export Use Case';
      default:
        return 'Export PDF';
    }
  };

  const getTooltipText = (): string => {
    switch (exportType) {
      case 'assessment':
        return 'Download comprehensive AI maturity assessment report';
      case 'library':
        return 'Export filtered use case library as PDF or Excel';
      case 'portfolio':
        return 'Generate executive report of RSA active AI portfolio';
      case 'use-case':
        return 'Download detailed use case analysis and implementation guide';
      default:
        return 'Export content as professional report';
    }
  };

  const handleExport = async (format: 'pdf' | 'excel' = 'pdf') => {
    try {
      setIsExporting(true);
      
      const exportUrl = getExportUrl(format);
      
      // Create download link
      const link = document.createElement('a');
      link.href = exportUrl;
      link.download = ''; // Let server determine filename
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Started",
        description: `Your ${format.toUpperCase()} report is being generated. Download will begin shortly.`,
      });
      
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : `Failed to export ${format.toUpperCase()} report`,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Show dropdown for library, portfolio, and use-case exports (Excel available)
  // Show simple button for assessment exports (PDF only)
  const showDropdown = exportType !== 'assessment';

  if (showDropdown) {
    return (
      <DropdownMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={variant}
                  size={size}
                  disabled={disabled || isExporting}
                  className={cn(
                    "gap-2 text-sm font-medium",
                    "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300",
                    "focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                    className
                  )}
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {children || getButtonText()}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <div className="max-w-xs">
                <p className="font-medium">{getButtonText()}</p>
                <p className="text-xs text-gray-500 mt-1">{getTooltipText()}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem 
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            <div className="flex flex-col">
              <span className="font-medium">Export PDF</span>
              <span className="text-xs text-gray-500">Clean tabular view</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2"
          >
            <Sheet className="h-4 w-4" />
            <div className="flex flex-col">
              <span className="font-medium">Export Excel</span>
              <span className="text-xs text-gray-500">Data manipulation</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Simple button for assessment exports
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={() => handleExport('pdf')}
            disabled={disabled || isExporting}
            className={cn(
              "gap-2 text-sm font-medium",
              "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300",
              "focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
              className
            )}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {children || getButtonText()}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs">
            <p className="font-medium">{getButtonText()}</p>
            <p className="text-xs text-gray-500 mt-1">{getTooltipText()}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}