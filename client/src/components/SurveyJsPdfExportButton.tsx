import React from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface SurveyJsPdfExportButtonProps {
  type: 'template' | 'responses';
  questionnaireId: string;
  responseId?: string; // Required for 'responses' type
  title?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function SurveyJsPdfExportButton({ 
  type, 
  questionnaireId,
  responseId,
  title, 
  variant = 'outline', 
  size = 'sm',
  className = ''
}: SurveyJsPdfExportButtonProps) {
  const [isExporting, setIsExporting] = React.useState(false);
  const { toast } = useToast();

  // Load Survey.js dynamically when needed
  const loadSurveyJs = React.useCallback(async () => {
    if (typeof window === 'undefined') return null;
    
    // Dynamically import Survey.js libraries
    const [{ Survey }, { SurveyPDF }] = await Promise.all([
      import('survey-react-ui'),
      import('survey-pdf')
    ]);
    
    return { Survey, SurveyPDF };
  }, []);

  // Fetch questionnaire definition
  const { data: questionnaire } = useQuery({
    queryKey: ['questionnaire', questionnaireId],
    queryFn: () => apiRequest(`/api/questionnaire/${questionnaireId}`),
    enabled: !!questionnaireId
  });

  // Fetch response data (only for filled questionnaire)
  const { data: responseData } = useQuery({
    queryKey: ['response', responseId],
    queryFn: () => apiRequest(`/api/responses/${responseId}`),
    enabled: type === 'responses' && !!responseId
  });

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      if (!questionnaire) {
        throw new Error('Questionnaire not found');
      }

      if (type === 'responses' && !responseData) {
        throw new Error('Response data not found');
      }

      // Load Survey.js libraries
      const surveyLibs = await loadSurveyJs();
      if (!surveyLibs) {
        throw new Error('Failed to load Survey.js libraries');
      }

      const { SurveyPDF } = surveyLibs;

      // Get survey configuration
      const surveyConfig = questionnaire.surveyConfig || questionnaire;
      
      // Create PDF instance with proper options
      const surveyPdf = new SurveyPDF(surveyConfig, {
        fontSize: 12,
        margins: { left: 20, right: 20, top: 30, bot: 30 },
        format: 'A4' as any,
        orientation: 'p' as 'p' | 'l'
      });

      // For filled questionnaire, set the response data
      if (type === 'responses' && responseData?.surveyData) {
        surveyPdf.data = responseData.surveyData;
      }

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const baseTitle = questionnaire.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'Questionnaire';
      const filename = `${baseTitle}_${type === 'template' ? 'Template' : 'Responses'}_${timestamp}.pdf`;

      // Generate and download PDF (client-side)
      surveyPdf.save(filename);
      
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
      disabled={isExporting || !questionnaire || (type === 'responses' && !responseData)}
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