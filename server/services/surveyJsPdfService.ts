import { Response } from 'express';
import { SurveyPDF, IDocOptions } from 'survey-pdf';
import { format } from 'date-fns';
import { questionnaireServiceInstance } from './questionnaireService';
import type { QuestionnaireDefinition } from '../types/questionnaire';

/**
 * Survey.js PDF Export Service
 * Handles PDF generation for questionnaires using Survey.js PDF library
 */
export class SurveyJsPdfService {
  /**
   * Basic PDF configuration options
   */
  private static readonly DEFAULT_PDF_OPTIONS: IDocOptions = {
    fontSize: 12,
    margins: { left: 20, right: 20, top: 30, bot: 30 },
    format: 'A4' as any,
    orientation: 'p' as 'p' | 'l'
  };

  /**
   * Generate blank questionnaire PDF template
   */
  static async generateBlankQuestionnaire(questionnaireId: string, res: Response): Promise<void> {
    try {
      console.log('Generating blank questionnaire PDF for:', questionnaireId);
      
      // Load questionnaire definition from blob storage
      const questionnaire = await questionnaireServiceInstance.getQuestionnaireDefinition(questionnaireId);
      
      if (!questionnaire) {
        res.status(404).json({ error: 'Questionnaire not found' });
        return;
      }

      // Convert questionnaire to Survey.js format
      const surveyJson = this.convertToSurveyJs(questionnaire);
      
      // Create PDF instance
      const surveyPdf = new SurveyPDF(surveyJson, this.DEFAULT_PDF_OPTIONS);
      
      // Generate PDF filename
      const filename = `${questionnaire.title.replace(/[^a-zA-Z0-9]/g, '_')}_Template_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      
      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Survey.js PDF library typically works in browser - for server use, try different approaches
      console.log('Attempting PDF generation...');
      
      try {
        // Method 1: Try save with filename - might work in Node.js environment
        const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
          try {
            // Use the Survey.js save method and capture result
            const result = surveyPdf.save(filename);
            
            // If save returns a promise
            if (result instanceof Promise) {
              result.then((data) => {
                if (data instanceof Uint8Array) {
                  resolve(Buffer.from(data));
                } else if (typeof data === 'string') {
                  resolve(Buffer.from(data, 'base64'));
                } else {
                  reject(new Error('Unsupported PDF data format from save()'));
                }
              }).catch(reject);
            } else if (result instanceof Uint8Array) {
              resolve(Buffer.from(result));
            } else {
              // Survey.js might be designed for browser - try alternative approach
              reject(new Error('Survey.js save() method incompatible with server environment'));
            }
          } catch (error) {
            reject(error);
          }
        });
        
        res.send(pdfBuffer);
        console.log('Blank questionnaire PDF generated successfully using save() method');
        
      } catch (saveError) {
        console.log('Save method failed, attempting fallback:', saveError.message);
        
        // Method 2: Fallback - return error suggesting browser-based export
        res.status(501).json({ 
          error: 'Survey.js PDF generation requires browser environment',
          message: 'PDF export using Survey.js is not supported in server environment. Please use the browser-based export feature.',
          fallback: 'Consider implementing server-side PDF generation using libraries like PDFKit'
        });
      }
      
    } catch (error) {
      console.error('Failed to generate blank questionnaire PDF:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to generate questionnaire PDF' });
      }
    }
  }

  /**
   * Generate filled questionnaire PDF with responses
   */
  static async generateFilledQuestionnaire(responseId: string, res: Response): Promise<void> {
    try {
      console.log('Generating filled questionnaire PDF for response:', responseId);
      
      // Load response data and questionnaire
      const [response, session] = await Promise.all([
        questionnaireServiceInstance.getResponse(responseId),
        questionnaireServiceInstance.getSession(responseId)
      ]);
      
      if (!response || !session) {
        res.status(404).json({ error: 'Response or session not found' });
        return;
      }

      // Load questionnaire definition
      const questionnaire = await questionnaireServiceInstance.getQuestionnaireDefinition(response.questionnaireId);
      
      if (!questionnaire) {
        res.status(404).json({ error: 'Questionnaire not found' });
        return;
      }

      // Convert questionnaire to Survey.js format
      const surveyJson = this.convertToSurveyJs(questionnaire);
      
      // Create PDF instance with response data
      const surveyPdf = new SurveyPDF(surveyJson, this.DEFAULT_PDF_OPTIONS);
      
      // Set survey data from responses
      if (response.surveyData) {
        surveyPdf.data = response.surveyData;
      }
      
      // Generate PDF filename
      const filename = `${questionnaire.title.replace(/[^a-zA-Z0-9]/g, '_')}_Responses_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      
      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Similar PDF generation approach as blank questionnaire
      try {
        const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
          try {
            const result = surveyPdf.save(filename);
            
            if (result instanceof Promise) {
              result.then((data) => {
                if (data instanceof Uint8Array) {
                  resolve(Buffer.from(data));
                } else if (typeof data === 'string') {
                  resolve(Buffer.from(data, 'base64'));
                } else {
                  reject(new Error('Unsupported PDF data format from save()'));
                }
              }).catch(reject);
            } else if (result instanceof Uint8Array) {
              resolve(Buffer.from(result));
            } else {
              reject(new Error('Survey.js save() method incompatible with server environment'));
            }
          } catch (error) {
            reject(error);
          }
        });
        
        res.send(pdfBuffer);
        console.log('Filled questionnaire PDF generated successfully');
        
      } catch (saveError) {
        console.log('Save method failed for filled questionnaire:', saveError.message);
        res.status(501).json({ 
          error: 'Survey.js PDF generation requires browser environment',
          message: 'PDF export using Survey.js is not supported in server environment.',
          fallback: 'Consider implementing server-side PDF generation using libraries like PDFKit'
        });
      }
      
    } catch (error) {
      console.error('Failed to generate filled questionnaire PDF:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to generate questionnaire responses PDF' });
      }
    }
  }

  /**
   * Convert questionnaire definition to Survey.js format
   */
  private static convertToSurveyJs(questionnaire: QuestionnaireDefinition): any {
    try {
      // If questionnaire.surveyConfig exists, use it directly
      if (questionnaire.surveyConfig) {
        return questionnaire.surveyConfig;
      }

      // Fallback: Convert from our format to Survey.js format
      return {
        title: questionnaire.title,
        description: questionnaire.description,
        pages: questionnaire.sections?.map(section => ({
          name: section.id,
          title: section.title,
          description: section.description,
          elements: section.questions?.map(question => ({
            type: this.mapQuestionType(question.type),
            name: question.id,
            title: question.question,
            description: question.description,
            isRequired: question.required || false,
            // Add additional properties based on question type
            ...this.getQuestionTypeProperties(question)
          })) || []
        })) || []
      };
    } catch (error) {
      console.error('Error converting questionnaire to Survey.js format:', error);
      // Return minimal valid Survey.js object
      return {
        title: questionnaire.title || 'Untitled Survey',
        pages: [{
          name: 'page1',
          elements: [{
            type: 'text',
            name: 'error',
            title: 'Error loading survey questions'
          }]
        }]
      };
    }
  }

  /**
   * Map our question types to Survey.js question types
   */
  private static mapQuestionType(type: string): string {
    const typeMap: Record<string, string> = {
      'text': 'text',
      'textarea': 'comment',
      'select': 'dropdown',
      'radio': 'radiogroup',
      'checkbox': 'checkbox',
      'rating': 'rating',
      'boolean': 'boolean',
      'number': 'text',
      'email': 'text',
      'url': 'text',
      'date': 'text',
      'matrix': 'matrix',
      'ranking': 'ranking'
    };
    
    return typeMap[type] || 'text';
  }

  /**
   * Get additional properties based on question type
   */
  private static getQuestionTypeProperties(question: any): any {
    const props: any = {};
    
    if (question.options && Array.isArray(question.options)) {
      if (question.type === 'radio' || question.type === 'select') {
        props.choices = question.options.map((opt: any) => 
          typeof opt === 'string' ? opt : (opt.label || opt.value || opt.text)
        );
      }
    }
    
    if (question.type === 'rating') {
      props.rateMin = question.min || 1;
      props.rateMax = question.max || 5;
    }
    
    if (question.type === 'number') {
      props.inputType = 'number';
      if (question.min !== undefined) props.min = question.min;
      if (question.max !== undefined) props.max = question.max;
    }
    
    return props;
  }
}