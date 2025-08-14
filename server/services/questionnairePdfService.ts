import { Response } from 'express';
import PDFDocument from 'pdfkit';
import { format } from 'date-fns';
import { questionnaireServiceInstance } from './questionnaireService';
// Note: QuestionnaireDefinition type is defined in questionnaireService

/**
 * Questionnaire PDF Export Service
 * Server-side PDF generation for questionnaires using PDFKit
 * Compatible with Survey.js format but works in Node.js environment
 */
export class QuestionnairePdfService {

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

      // Generate PDF filename
      const filename = `${questionnaire.title.replace(/[^a-zA-Z0-9]/g, '_')}_Template_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      
      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });
      
      // Pipe directly to response
      doc.pipe(res);
      
      await this.generateBlankContent(doc, questionnaire);
      
      // Finalize PDF
      doc.end();
      
      console.log('Blank questionnaire PDF generated successfully');
      
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

      // Generate PDF filename
      const filename = `${questionnaire.title.replace(/[^a-zA-Z0-9]/g, '_')}_Responses_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      
      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });
      
      // Pipe directly to response
      doc.pipe(res);
      
      await this.generateFilledContent(doc, questionnaire, response.surveyData);
      
      // Finalize PDF
      doc.end();
      
      console.log('Filled questionnaire PDF generated successfully');
      
    } catch (error) {
      console.error('Failed to generate filled questionnaire PDF:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to generate questionnaire responses PDF' });
      }
    }
  }

  /**
   * Generate blank questionnaire content in PDF
   */
  private static async generateBlankContent(doc: PDFKit.PDFDocument, questionnaire: any): Promise<void> {
    let yPosition = 80;
    
    // Title
    doc.fontSize(20)
       .fillColor('#005DAA')
       .text(questionnaire.title, 50, yPosition, { align: 'center' });
    
    yPosition += 40;
    
    // Description
    if (questionnaire.description) {
      doc.fontSize(12)
         .fillColor('#666666')
         .text(questionnaire.description, 50, yPosition, { 
           align: 'center',
           width: 495
         });
      yPosition += 60;
    }
    
    // Generation info
    doc.fontSize(10)
       .fillColor('#999999')
       .text(`Generated on ${format(new Date(), 'PPP')}`, 50, yPosition, { align: 'center' });
    
    yPosition += 60;

    // Process Survey.js format or fallback format
    const surveyConfig = questionnaire.surveyConfig || this.convertToSurveyJs(questionnaire);
    
    if (surveyConfig.pages) {
      for (const page of surveyConfig.pages) {
        yPosition = await this.renderPageBlank(doc, page, yPosition);
      }
    } else if (questionnaire.sections) {
      // Fallback to our custom format
      for (const section of questionnaire.sections) {
        yPosition = await this.renderSectionBlank(doc, section, yPosition);
      }
    }
  }

  /**
   * Generate filled questionnaire content in PDF
   */
  private static async generateFilledContent(doc: PDFKit.PDFDocument, questionnaire: any, surveyData: any): Promise<void> {
    let yPosition = 80;
    
    // Title
    doc.fontSize(20)
       .fillColor('#005DAA')
       .text(questionnaire.title, 50, yPosition, { align: 'center' });
    
    yPosition += 40;
    
    // Description
    if (questionnaire.description) {
      doc.fontSize(12)
         .fillColor('#666666')
         .text(questionnaire.description, 50, yPosition, { 
           align: 'center',
           width: 495
         });
      yPosition += 60;
    }
    
    // Generation info
    doc.fontSize(10)
       .fillColor('#999999')
       .text(`Responses generated on ${format(new Date(), 'PPP')}`, 50, yPosition, { align: 'center' });
    
    yPosition += 60;

    // Process Survey.js format or fallback format
    const surveyConfig = questionnaire.surveyConfig || this.convertToSurveyJs(questionnaire);
    
    if (surveyConfig.pages) {
      for (const page of surveyConfig.pages) {
        yPosition = await this.renderPageFilled(doc, page, yPosition, surveyData || {});
      }
    } else if (questionnaire.sections) {
      // Fallback to our custom format
      for (const section of questionnaire.sections) {
        yPosition = await this.renderSectionFilled(doc, section, yPosition, surveyData || {});
      }
    }
  }

  /**
   * Render a Survey.js page (blank)
   */
  private static async renderPageBlank(doc: PDFKit.PDFDocument, page: any, yPosition: number): Promise<number> {
    // Page title
    if (page.title) {
      if (yPosition > 700) { // New page if needed
        doc.addPage();
        yPosition = 80;
      }
      
      doc.fontSize(16)
         .fillColor('#005DAA')
         .text(page.title, 50, yPosition);
      yPosition += 30;
    }
    
    // Page description
    if (page.description) {
      doc.fontSize(11)
         .fillColor('#666666')
         .text(page.description, 50, yPosition, { width: 495 });
      yPosition += 30;
    }
    
    // Render elements/questions
    if (page.elements) {
      for (const element of page.elements) {
        yPosition = await this.renderElementBlank(doc, element, yPosition);
      }
    }
    
    return yPosition + 20;
  }

  /**
   * Render a Survey.js page (filled)
   */
  private static async renderPageFilled(doc: PDFKit.PDFDocument, page: any, yPosition: number, surveyData: any): Promise<number> {
    // Page title
    if (page.title) {
      if (yPosition > 700) { // New page if needed
        doc.addPage();
        yPosition = 80;
      }
      
      doc.fontSize(16)
         .fillColor('#005DAA')
         .text(page.title, 50, yPosition);
      yPosition += 30;
    }
    
    // Render elements/questions with responses
    if (page.elements) {
      for (const element of page.elements) {
        yPosition = await this.renderElementFilled(doc, element, yPosition, surveyData);
      }
    }
    
    return yPosition + 20;
  }

  /**
   * Render a Survey.js element/question (blank)
   */
  private static async renderElementBlank(doc: PDFKit.PDFDocument, element: any, yPosition: number): Promise<number> {
    // Check if we need a new page
    if (yPosition > 650) {
      doc.addPage();
      yPosition = 80;
    }
    
    // Question title
    doc.fontSize(12)
       .fillColor('#000000')
       .text(element.title || element.name, 50, yPosition, { width: 450 });
    yPosition += 20;
    
    // Question description
    if (element.description) {
      doc.fontSize(10)
         .fillColor('#666666')
         .text(element.description, 50, yPosition, { width: 450 });
      yPosition += 15;
    }
    
    // Render input area based on question type
    yPosition = await this.renderInputAreaBlank(doc, element, yPosition);
    
    return yPosition + 15;
  }

  /**
   * Render a Survey.js element/question (filled)
   */
  private static async renderElementFilled(doc: PDFKit.PDFDocument, element: any, yPosition: number, surveyData: any): Promise<number> {
    // Check if we need a new page
    if (yPosition > 650) {
      doc.addPage();
      yPosition = 80;
    }
    
    // Question title
    doc.fontSize(12)
       .fillColor('#000000')
       .text(element.title || element.name, 50, yPosition, { width: 450 });
    yPosition += 20;
    
    // Get response value
    const responseValue = surveyData[element.name];
    
    // Render response
    yPosition = await this.renderResponseValue(doc, element, responseValue, yPosition);
    
    return yPosition + 15;
  }

  /**
   * Render input area for blank questionnaire
   */
  private static async renderInputAreaBlank(doc: PDFKit.PDFDocument, element: any, yPosition: number): Promise<number> {
    const inputX = 70;
    const inputWidth = 400;
    
    switch (element.type) {
      case 'text':
      case 'comment':
        // Draw input lines
        const lineCount = element.type === 'comment' ? 3 : 1;
        for (let i = 0; i < lineCount; i++) {
          doc.strokeColor('#CCCCCC')
             .lineWidth(1)
             .moveTo(inputX, yPosition + (i * 25))
             .lineTo(inputX + inputWidth, yPosition + (i * 25))
             .stroke();
        }
        return yPosition + (lineCount * 25) + 10;
      
      case 'radiogroup':
      case 'checkbox':
        if (element.choices) {
          for (let i = 0; i < element.choices.length; i++) {
            const choice = element.choices[i];
            const choiceY = yPosition + (i * 20);
            
            // Draw checkbox/radio
            doc.rect(inputX, choiceY - 3, 10, 10)
               .stroke();
            
            // Choice text
            doc.fontSize(10)
               .fillColor('#000000')
               .text(choice.text || choice, inputX + 20, choiceY, { width: 350 });
          }
          return yPosition + (element.choices.length * 20) + 10;
        }
        break;
        
      case 'dropdown':
        // Draw dropdown box
        doc.rect(inputX, yPosition, inputWidth, 20)
           .stroke();
        doc.fontSize(10)
           .fillColor('#CCCCCC')
           .text('Select an option...', inputX + 10, yPosition + 6);
        return yPosition + 35;
      
      case 'rating':
        // Draw rating scale
        const rateMin = element.rateMin || 1;
        const rateMax = element.rateMax || 5;
        const scaleWidth = Math.min(300, (rateMax - rateMin + 1) * 40);
        
        for (let i = rateMin; i <= rateMax; i++) {
          const x = inputX + ((i - rateMin) * 40);
          doc.circle(x + 10, yPosition + 10, 8)
             .stroke();
          doc.fontSize(8)
             .fillColor('#000000')
             .text(i.toString(), x + 7, yPosition + 25);
        }
        return yPosition + 45;
        
      default:
        // Generic input field
        doc.rect(inputX, yPosition, inputWidth, 20)
           .stroke();
        return yPosition + 35;
    }
    
    return yPosition + 30;
  }

  /**
   * Render response value for filled questionnaire
   */
  private static async renderResponseValue(doc: PDFKit.PDFDocument, element: any, value: any, yPosition: number): Promise<number> {
    const responseX = 70;
    const responseWidth = 400;
    
    if (value === undefined || value === null || value === '') {
      doc.fontSize(10)
         .fillColor('#CCCCCC')
         .text('[No response provided]', responseX, yPosition);
      return yPosition + 20;
    }
    
    let displayValue: string;
    
    if (Array.isArray(value)) {
      displayValue = value.join(', ');
    } else if (typeof value === 'object') {
      displayValue = JSON.stringify(value, null, 2);
    } else {
      displayValue = String(value);
    }
    
    // Response box
    doc.rect(responseX, yPosition, responseWidth, Math.max(20, Math.ceil(displayValue.length / 60) * 15))
       .fillAndStroke('#F8F9FA', '#E9ECEF');
    
    // Response text
    doc.fontSize(10)
       .fillColor('#212529')
       .text(displayValue, responseX + 10, yPosition + 5, { 
         width: responseWidth - 20,
         lineGap: 2
       });
    
    const textHeight = Math.max(20, Math.ceil(displayValue.length / 60) * 15);
    return yPosition + textHeight + 10;
  }

  /**
   * Render a section (fallback for custom format)
   */
  private static async renderSectionBlank(doc: PDFKit.PDFDocument, section: any, yPosition: number): Promise<number> {
    // Section title
    doc.fontSize(16)
       .fillColor('#005DAA')
       .text(section.title, 50, yPosition);
    yPosition += 30;
    
    // Section questions
    if (section.questions) {
      for (const question of section.questions as any[]) {
        const element = {
          name: question.id,
          title: question.question,
          type: this.mapQuestionType(question.type),
          description: question.description,
          choices: question.options
        };
        yPosition = await this.renderElementBlank(doc, element, yPosition);
      }
    }
    
    return yPosition + 20;
  }

  /**
   * Render a section (filled, fallback for custom format)
   */
  private static async renderSectionFilled(doc: PDFKit.PDFDocument, section: any, yPosition: number, surveyData: any): Promise<number> {
    // Section title
    doc.fontSize(16)
       .fillColor('#005DAA')
       .text(section.title, 50, yPosition);
    yPosition += 30;
    
    // Section questions
    if (section.questions) {
      for (const question of section.questions as any[]) {
        const element = {
          name: question.id,
          title: question.question,
          type: this.mapQuestionType(question.type),
          description: question.description,
          choices: question.options
        };
        yPosition = await this.renderElementFilled(doc, element, yPosition, surveyData);
      }
    }
    
    return yPosition + 20;
  }

  /**
   * Convert questionnaire to Survey.js format (reused from SurveyJs service)
   */
  private static convertToSurveyJs(questionnaire: any): any {
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
          choices: question.options
        })) || []
      })) || []
    };
  }

  /**
   * Map question types (reused from SurveyJs service)
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
      'number': 'text'
    };
    
    return typeMap[type] || 'text';
  }
}